/**
 * BabylonScene — configures the Babylon world:
 *   scene, lights, cameras, grid, helpers, pointer hooks, entity sync.
 *
 * This is where the Babylon world is configured.
 * It does NOT contain tool logic.
 */

import {
  Scene,
  Engine,
  HemisphericLight,
  Vector3,
  Color4,
  Color3,
  PointerEventTypes,
  MeshBuilder,
  StandardMaterial,
  HighlightLayer,
  ArcRotateCamera,
  TransformNode,
  LinesMesh,
  Mesh,
  VertexData,
  type AbstractMesh,
} from '@babylonjs/core';

import { createEditorCamera, applyMode, updateOrthoFrustum } from './cameras';
import { createSceneHelpers, type SceneHelpers } from './helpers';
import { EditorGizmoManager } from './gizmoManager';
import { ToolManager } from '@/editor/core/ToolManager';
import { SceneRegistry } from '@/editor/core/SceneRegistry';
import { meshPickableForEntity } from '@/editor/geometry/picking/entityPickability';
import { useSceneStore } from '@/editor/store/sceneStore';
import { useSelectionStore } from '@/editor/store/selectionStore';
import { useUIStore, type ViewMode } from '@/editor/store/uiStore';
import type { EditorEntity } from '@/editor/types/entities';

export interface BabylonSceneContext {
  engine: Engine;
  scene: Scene;
  camera: ArcRotateCamera;
  helpers: SceneHelpers;
  highlightLayer: HighlightLayer;
  gizmoManager: EditorGizmoManager;
  dispose: () => void;
}

/**
 * Initialize the complete Babylon scene from a canvas element.
 */
export function initBabylonScene(canvas: HTMLCanvasElement): BabylonSceneContext {
  // ── Engine ──────────────────────────────────────
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    antialias: true,
  });

  // ── Scene ───────────────────────────────────────
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.059, 0.059, 0.075, 1); // matches --color-bg-primary

  // ── Light ───────────────────────────────────────
  const light = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), scene);
  light.intensity = 0.9;
  light.groundColor = new Color3(0.2, 0.2, 0.3);

  // ── Camera ──────────────────────────────────────
  const camera = createEditorCamera(scene);

  // ── Helpers ─────────────────────────────────────
  const helpers = createSceneHelpers(scene);

  // ── Gizmos ──────────────────────────────────────
  const gizmoManager = new EditorGizmoManager(scene);

  // ── Highlight Layer (for selection visualization) ──
  const highlightLayer = new HighlightLayer('selectionHighlight', scene);
  highlightLayer.outerGlow = true;
  highlightLayer.innerGlow = false;

  // ── Pointer Events → ToolManager ────────────────
  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case PointerEventTypes.POINTERDOWN:
        ToolManager.onPointerDown(pointerInfo);
        break;
      case PointerEventTypes.POINTERMOVE:
        ToolManager.onPointerMove(pointerInfo);
        break;
      case PointerEventTypes.POINTERUP:
        ToolManager.onPointerUp(pointerInfo);
        break;
    }
  });

  // ── Entity Sync System ──────────────────────────
  // Watch sceneStore for entity changes and sync Babylon meshes
  let prevEntities: Record<string, EditorEntity> = {};

  const unsubScene = useSceneStore.subscribe((state) => {
    const currentEntities = state.entities;
    syncEntities(scene, prevEntities, currentEntities);
    prevEntities = { ...currentEntities };
    applyEntityMeshPickabilityFromRegistry();
  });

  let prevActiveTool = useUIStore.getState().activeTool;
  const unsubActiveTool = useUIStore.subscribe((state) => {
    if (state.activeTool !== prevActiveTool) {
      prevActiveTool = state.activeTool;
      applyEntityMeshPickabilityFromRegistry();
    }
  });

  // ── Selection Visual Sync ───────────────────────
  const unsubSelection = useSelectionStore.subscribe((state) => {
    syncSelectionVisuals(highlightLayer, state.selectedIds);
  });

  // ── View Mode Sync ──────────────────────────────
  let prevViewMode = useUIStore.getState().viewMode;
  const unsubUI = useUIStore.subscribe((state) => {
    if (state.viewMode !== prevViewMode) {
      applyMode(camera, state.viewMode);
      prevViewMode = state.viewMode;
    }
  });

  // ── Grid Visibility Sync ────────────────────────
  let prevGridVisible = useUIStore.getState().gridVisible;
  const unsubGrid = useUIStore.subscribe((state) => {
    if (state.gridVisible !== prevGridVisible) {
      helpers.setGridVisible(state.gridVisible);
      prevGridVisible = state.gridVisible;
    }
  });

  // ── Resize Handling ─────────────────────────────
  const handleResize = () => {
    engine.resize();
    if (camera.mode === ArcRotateCamera.ORTHOGRAPHIC_CAMERA) {
      updateOrthoFrustum(camera);
    }
  };
  window.addEventListener('resize', handleResize);

  // ── Render Loop ─────────────────────────────────
  engine.runRenderLoop(() => {
    scene.render();
  });

  // ── Dispose ─────────────────────────────────────
  const dispose = () => {
    unsubScene();
    unsubSelection();
    unsubUI();
    unsubGrid();
    unsubActiveTool();
    window.removeEventListener('resize', handleResize);
    engine.stopRenderLoop();
    gizmoManager.dispose();
    scene.dispose();
    engine.dispose();
  };

  return { engine, scene, camera, helpers, highlightLayer, gizmoManager, dispose };
}

/** Re-apply pick flags on all entity meshes (e.g. after tool switch or entity sync). */
function applyEntityMeshPickabilityFromRegistry(): void {
  const entities = useSceneStore.getState().entities;
  for (const id of SceneRegistry.getAllEntityIds()) {
    const node = SceneRegistry.getNode(id);
    const entity = entities[id];
    if (!node || !entity) continue;
    const pick = meshPickableForEntity(entity);
    node.getChildMeshes(false).forEach((m) => {
      m.isPickable = pick;
    });
  }
}

// ── Entity Sync ─────────────────────────────────────
function hasTransformChanged(a: EditorEntity, b: EditorEntity) {
  return (
    a.position !== b.position ||
    a.rotation !== b.rotation ||
    a.scale !== b.scale ||
    a.visible !== b.visible ||
    a.locked !== b.locked
  );
}

function hasGeometryChanged(a: EditorEntity, b: EditorEntity) {
  return (
    a.type !== b.type ||
    a.points !== b.points
  );
}


function syncEntities(
  scene: Scene,
  prev: Record<string, EditorEntity>,
  current: Record<string, EditorEntity>
): void {
  const prevIds = new Set(Object.keys(prev));
  const currentIds = new Set(Object.keys(current));

  // Remove deleted entities
  for (const id of prevIds) {
    if (!currentIds.has(id)) {
      removeMeshForEntity(scene, id);
    }
  }

  for (const id of currentIds) {
  if (!prevIds.has(id)) {
    // 🟢 New entity
    createMeshForEntity(scene, current[id]);
  } else {
    const prevEntity = prev[id];
    const currEntity = current[id];

    // 🔴 Geometry change → RECREATE
    if (hasGeometryChanged(prevEntity, currEntity)) {
      removeMeshForEntity(scene, id);
      createMeshForEntity(scene, currEntity);
    }
    // 🟡 Only transform change → UPDATE
    else if (hasTransformChanged(prevEntity, currEntity)) {
      updateMeshForEntity(currEntity);
    }
  }
}
}

function createMeshForEntity(scene: Scene, entity: EditorEntity): void {
  // 1. Create the Root TransformNode for the Entity
  const rootNode = new TransformNode(`entity_${entity.id}`, scene);

  let mesh: AbstractMesh;

  // 2. Create the Geometry Mesh as a child
  switch (entity.type) {
    case 'wall': {
      mesh = MeshBuilder.CreateBox(
        `geom_${entity.id}`,
        { size: 1 },
        scene
      );
      const mat = new StandardMaterial(`mat_${entity.id}`, scene);
      mat.diffuseColor = new Color3(0.7, 0.7, 0.75);
      mat.specularColor = new Color3(0.1, 0.1, 0.1);
      mesh.material = mat;
      break;
    }

    case 'room': {
      mesh = MeshBuilder.CreateBox(
        `geom_${entity.id}`,
        { size: 1 },
        scene
      );
      const mat = new StandardMaterial(`mat_${entity.id}`, scene);
      mat.diffuseColor = new Color3(0.3, 0.35, 0.45);
      mat.alpha = 0.7;
      mesh.material = mat;
      break;
    }

    case 'line': {
      const p = entity.points || [[0, 0, 0], [1, 0, 0]];
      const start = new Vector3(...p[0]);
      const end = new Vector3(...p[1]);
      
      mesh = MeshBuilder.CreateLines(
        `geom_${entity.id}`,
        { points: [start, end], updatable: true  },
        scene
      );
      (mesh as LinesMesh).color = new Color3(0.1, 0.1, 0.1);
      break;
    }

    case 'rectangle': {
      const p = entity.points || [[0,0,0], [1,0,0], [1,0,1], [0,0,1]];
      const pts = p.map(pt => new Vector3(...pt));
      
      const m = new Mesh(`geom_${entity.id}`, scene);
      const positions: number[] = [];
      pts.forEach(pt => positions.push(pt.x, pt.y, pt.z));
      
      const indices = [0, 1, 2, 0, 2, 3];
      const normals: number[] = [];
      
      const vertexData = new VertexData();
      vertexData.positions = positions;
      vertexData.indices = indices;
      
      VertexData.ComputeNormals(positions, indices, normals);
      vertexData.normals = normals;
      vertexData.applyToMesh(m);

      const mat = createFlatMaterial(`mat_${entity.id}`, scene, new Color3(0.3, 0.35, 0.45));
      m.material = mat;
      
      mesh = m;
      break;
    }

    case 'polyline': {
      const pts = (entity.points || []).map(pt => new Vector3(...pt));
      mesh = MeshBuilder.CreateLines(
        `geom_${entity.id}`,
        { points: pts, updatable: true },
        scene
      );
      (mesh as LinesMesh).color = new Color3(0.1, 0.1, 0.1);
      break;
    }

    case 'polygon': {
      const pts = (entity.points || []).map(pt => new Vector3(...pt));
      mesh = MeshBuilder.CreateLines(
        `geom_${entity.id}`,
        { points: [...pts, pts[0]], updatable: true },
        scene
      );
      (mesh as LinesMesh).color = new Color3(0.1, 0.1, 0.1);
      break;
    }

    case 'ellipse': {
      mesh = MeshBuilder.CreateDisc(
        `geom_${entity.id}`,
        { radius: 1, tessellation: 64, sideOrientation: Mesh.DOUBLESIDE },
        scene
      );
      mesh.rotation.x = Math.PI / 2;
      mesh.rotationQuaternion = null; 
      mesh.material = createFlatMaterial(`mat_${entity.id}`, scene, new Color3(0.3, 0.35, 0.45));
      break;
    }

    case 'arc': {
      const p = entity.points || [[0, 0, 0], [1, 0, 0], [2, 0, 0]];
      const pts = p.map(pt => new Vector3(...pt));
      mesh = MeshBuilder.CreateLines(
        `geom_${entity.id}`,
        { points: pts, updatable: true },
        scene
      );
      (mesh as LinesMesh).color = new Color3(0.1, 0.1, 0.1);
      break;
    }
    default: {
      mesh = MeshBuilder.CreateBox(
        `geom_${entity.id}`,
        { size: 1 },
        scene
      );
      const mat = new StandardMaterial(`mat_${entity.id}`, scene);
      mat.diffuseColor = new Color3(0.42, 0.36, 0.9);
      mat.specularColor = new Color3(0.2, 0.2, 0.3);
      mesh.material = mat;
      break;
    }
  }

  // Bind geometry specifically to the root
  mesh.parent = rootNode;
  mesh.isVisible = entity.visible;
  mesh.isPickable = meshPickableForEntity(entity);

  // 3. Apply orientation STRICTLY to the root node
  rootNode.position.set(...entity.position);
  rootNode.rotationQuaternion = null;
  rootNode.rotation.set(...entity.rotation);
  rootNode.scaling.set(1, 1, 1); // FORCE uniform scale so gizmos do not shear

  // Apply non-uniform scaling directly to the child mesh
  mesh.scaling.set(...entity.scale);

  // 3.5 Depth layering: filled slabs slightly above Y=0; strokes slightly below so new
  //     floor work reads under existing meshes instead of z-fighting on top of them.
  if (['rectangle', 'ellipse', 'room'].includes(entity.type)) {
    mesh.position.y = 0.01;
    mesh.renderOutline = true;
    mesh.outlineWidth = 0.02;
    mesh.outlineColor = new Color3(0.05, 0.05, 0.1);
  } else if (['line', 'polyline', 'polygon', 'arc'].includes(entity.type)) {
    mesh.position.y = -0.004;
    if (entity.type === 'polygon') {
      mesh.renderOutline = true;
      mesh.outlineWidth = 0.02;
      mesh.outlineColor = new Color3(0.05, 0.05, 0.1);
    }
  }

  // 4. Register
  SceneRegistry.register(entity.id, rootNode);
  SceneRegistry.registerMeshPick(mesh, entity.id);
}

function updateMeshForEntity(entity: EditorEntity): void {
  const rootNode = SceneRegistry.getNode(entity.id);
  if (!rootNode) return;

  // ── Update transform (root only) ───────────────────
  rootNode.position.set(...entity.position);
  rootNode.rotationQuaternion = null;
  rootNode.rotation.set(...entity.rotation);
  rootNode.scaling.set(1, 1, 1);

  const meshes = rootNode.getChildMeshes();

  meshes.forEach((m) => {
    // ── Handle dynamic geometry updates (lines etc.) ──
    if (
      (entity.type === 'line' ||
        entity.type === 'polyline' ||
        entity.type === 'polygon' ||
        entity.type === 'arc') &&
      entity.points
    ) {
      const pts = entity.points.map((pt) => new Vector3(...pt));

      MeshBuilder.CreateLines(
        m.name,
        {
          points: entity.type === 'polygon' ? [...pts, pts[0]] : pts,
          instance: m as LinesMesh,
        }
      );
    }

    // ── Apply scaling to mesh only ────────────────────
    m.scaling.set(...entity.scale);

    // ── Visibility & picking ─────────────────────────
    m.isVisible = entity.visible;
    m.isPickable = meshPickableForEntity(entity);

    // Match createMeshForEntity depth + outline on every sync (ellipse/rectangle
    // usually hit this path on scale/transform; strokes hit it on point edits).
    if (['rectangle', 'ellipse', 'room'].includes(entity.type)) {
      m.position.y = 0.01;
      m.renderOutline = true;
      m.outlineWidth = 0.02;
      m.outlineColor = new Color3(0.05, 0.05, 0.1);
    } else if (['line', 'polyline', 'polygon', 'arc'].includes(entity.type)) {
      m.position.y = -0.004;
      if (entity.type === 'polygon') {
        m.renderOutline = true;
        m.outlineWidth = 0.02;
        m.outlineColor = new Color3(0.05, 0.05, 0.1);
      }
    }
  });
}

function removeMeshForEntity(scene: Scene, entityId: string): void {
  const rootNode = SceneRegistry.getNode(entityId);
  if (rootNode) {
    const meshes = rootNode.getChildMeshes();
    meshes.forEach(m => SceneRegistry.unregisterMeshPick(m));
    rootNode.dispose();
    SceneRegistry.unregister(entityId);
  }
}

// ── Selection Visuals ───────────────────────────────

function syncSelectionVisuals(
  highlightLayer: HighlightLayer,
  selectedIds: string[]
): void {
  // Remove all highlights first
  highlightLayer.removeAllMeshes();

  // Add highlights for selected entities
  const accentColor = new Color3(0.42, 0.36, 0.9); // matches --color-accent
  for (const id of selectedIds) {
    const rootNode = SceneRegistry.getNode(id);
    if (rootNode) {
      rootNode.getChildMeshes().forEach(mesh => {
        if ('renderOutline' in mesh) {
          highlightLayer.addMesh(mesh as any, accentColor);
        }
      });
    }
  }
}
/**
 * Creates a material tailored for 2D architectural primitives
 */
function createFlatMaterial(name: string, scene: Scene, color: Color3): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.backFaceCulling = false; // Essential for 3D rotation visibility
  mat.specularColor = Color3.Black(); // Matte finish
  return mat;
}

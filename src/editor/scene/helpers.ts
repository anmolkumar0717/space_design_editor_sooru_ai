/**
 * Scene Helpers — grid, axis helper, and origin marker.
 *
 * The grid is NOT just visual decoration — it will later power:
 *   snapping, measurement, drawing, alignment
 */

import {
  Color3,
  Color4,
  MeshBuilder,
  StandardMaterial,
  Vector3,
  type Scene,
  type Mesh,
  DynamicTexture,
} from '@babylonjs/core';

export interface SceneHelpers {
  gridMesh: Mesh;
  axisLines: Mesh[];
  originMarker: Mesh;
  setGridVisible: (visible: boolean) => void;
}

/**
 * Create all scene helpers (grid, axes, origin).
 */
export function createSceneHelpers(scene: Scene): SceneHelpers {
  // ── Grid ──────────────────────────────────────────
  const gridMesh = MeshBuilder.CreateGround(
    'editorGrid',
    { width: 200, height: 200, subdivisions: 1 },
    scene
  );
  gridMesh.isPickable = false;
  gridMesh.position.y = -0.01; // Slightly below ground to avoid Z-fighting

  const gridMat = createGridMaterial(scene);
  gridMesh.material = gridMat;

  // ── Axis Lines ────────────────────────────────────
  const axisLength = 100;

  const xAxis = createAxisLine(
    scene,
    'xAxis',
    Vector3.Zero(),
    new Vector3(axisLength, 0, 0),
    new Color4(0.9, 0.2, 0.2, 0.8)
  );

  const zAxis = createAxisLine(
    scene,
    'zAxis',
    Vector3.Zero(),
    new Vector3(0, 0, axisLength),
    new Color4(0.2, 0.5, 0.9, 0.8)
  );

  const axisLines = [xAxis, zAxis];

  // ── Origin Marker ─────────────────────────────────
  const originMarker = MeshBuilder.CreateSphere(
    'originMarker',
    { diameter: 0.3, segments: 8 },
    scene
  );
  originMarker.isPickable = false;
  const originMat = new StandardMaterial('originMat', scene);
  originMat.diffuseColor = new Color3(1, 1, 1);
  originMat.emissiveColor = new Color3(0.5, 0.5, 0.5);
  originMarker.material = originMat;

  return {
    gridMesh,
    axisLines,
    originMarker,
    setGridVisible: (visible: boolean) => {
      gridMesh.isVisible = visible;
      axisLines.forEach((l) => (l.isVisible = visible));
      originMarker.isVisible = visible;
    },
  };
}

function createAxisLine(
  scene: Scene,
  name: string,
  from: Vector3,
  to: Vector3,
  color: Color4
): Mesh {
  const line = MeshBuilder.CreateLines(
    name,
    {
      points: [from, to],
      colors: [color, color],
    },
    scene
  );
  line.isPickable = false;
  return line;
}

/**
 * Creates a grid material using a StandardMaterial with a procedural texture.
 * This gives a subtle, professional grid appearance.
 */
function createGridMaterial(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('gridMat', scene);

  // Create a procedural grid texture
  const textureSize = 512;
  const texture = new DynamicTexture('gridTexture', textureSize, scene, true);
  const ctx = texture.getContext();

  // Background (slightly transparent)
  ctx.fillStyle = 'rgba(15, 15, 19, 0.95)';
  ctx.fillRect(0, 0, textureSize, textureSize);

  // Minor grid lines
  const cellCount = 20;
  const cellSize = textureSize / cellCount;

  ctx.strokeStyle = 'rgba(42, 42, 61, 0.5)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= cellCount; i++) {
    const pos = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, textureSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(textureSize, pos);
    ctx.stroke();
  }

  // Major grid lines (every 5 cells)
  ctx.strokeStyle = 'rgba(60, 60, 90, 0.6)';
  ctx.lineWidth = 2;

  for (let i = 0; i <= cellCount; i += 5) {
    const pos = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, textureSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(textureSize, pos);
    ctx.stroke();
  }

  texture.update();

  mat.diffuseTexture = texture;
  mat.specularColor = Color3.Black();
  mat.emissiveColor = new Color3(0.05, 0.05, 0.08);

  // Tile the texture
  texture.uScale = 10;
  texture.vScale = 10;

  return mat;
}

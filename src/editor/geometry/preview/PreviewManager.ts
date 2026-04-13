import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Mesh,
  VertexData,
  LinesMesh,
  VertexBuffer,
  type AbstractMesh,
  type Scene
} from '@babylonjs/core';

/**
 * Handles transient geometric meshes visualized explicitly during dynamic
 * drawing actions, avoiding registration into the global Entity Store.
 */
export class PreviewManager {
  private static scene: Scene;
  private static activePreviewMeshes: Map<string, AbstractMesh> = new Map();

  /** Babylon line instances can only be updated when the point count stays the same. */
  private static linesMeshPointCount(mesh: LinesMesh): number {
    const data = mesh.getVerticesData(VertexBuffer.PositionKind);
    return data ? data.length / 3 : 0;
  }
  // Persistent dot indicating current structural grid snap position
  private static snapHintMesh: AbstractMesh | null = null;
  private static snapHintMaterial: StandardMaterial | null = null;

  public static init(scene: Scene) {
    this.scene = scene;

    // Construct the universal snappable ghost node tracking
    this.snapHintMesh = MeshBuilder.CreateSphere('preview_snap_hint', { diameter: 0.25 }, scene);
    this.snapHintMesh.isPickable = false; // Cannot interact with the hint
    this.snapHintMesh.isVisible = false;

    this.snapHintMaterial = new StandardMaterial('mat_snap_hint', scene);
    this.snapHintMaterial.emissiveColor = new Color3(0.42, 0.36, 0.9); // Accent blue tracker
    this.snapHintMaterial.alpha = 0.8;
    this.snapHintMesh.material = this.snapHintMaterial;
  }

  /**
   * Updates the global cursor intersection UI dot to mathematically snapped coordinates.
   */
  public static updateSnapHint(point: Vector3 | null) {
    if (!this.snapHintMesh) return;

    if (point) {
      this.snapHintMesh.position.copyFrom(point);
      this.snapHintMesh.isVisible = true;
    } else {
      this.snapHintMesh.isVisible = false;
    }
  }

  /**
   * Pushes an arbitrary un-registered mesh into the transient manager stack to track rendering.
   */
  public static registerPreview(id: string, mesh: AbstractMesh) {
    mesh.isPickable = false; // Previews shouldn't intercept interaction pointer casts
    this.activePreviewMeshes.set(id, mesh);
  }

  /**
   * Completely destroys arbitrary preview geometries identified by id keys.
   */
  public static clearPreview(id: string) {
    const mesh = this.activePreviewMeshes.get(id);
    if (mesh) {
      mesh.dispose();
      this.activePreviewMeshes.delete(id);
    }
  }

  /**
   * Helper to quickly draw a preview line.
   * Reuses one LinesMesh per id to avoid flicker on pointer move.
   */
  public static showLine(
    id: string,
    start: Vector3,
    end: Vector3,
    color: Color3 = new Color3(0.1, 0.1, 0.1)
  ) {
    const pts = [start.clone(), end.clone()];
    const existing = this.activePreviewMeshes.get(id);
    if (
      existing instanceof LinesMesh &&
      !existing.isDisposed() &&
      this.linesMeshPointCount(existing) === pts.length
    ) {
      MeshBuilder.CreateLines(id, { points: pts, instance: existing, updatable: true }, this.scene);
      existing.color = color;
      existing.isVisible = true;
      return;
    }
    this.clearPreview(id);
    const line = MeshBuilder.CreateLines(id, { points: pts, updatable: true }, this.scene);
    line.color = color;
    this.registerPreview(id, line);
  }

  /** Open polyline preview (e.g. tessellated arc). Reuses LinesMesh when possible. */
  public static showPolyline(
    id: string,
    points: Vector3[],
    color: Color3 = new Color3(0.1, 0.1, 0.1)
  ) {
    if (points.length < 2) return;
    const pts = points.map((p) => p.clone());
    const existing = this.activePreviewMeshes.get(id);
    if (
      existing instanceof LinesMesh &&
      !existing.isDisposed() &&
      this.linesMeshPointCount(existing) === pts.length
    ) {
      MeshBuilder.CreateLines(id, { points: pts, instance: existing, updatable: true }, this.scene);
      existing.color = color;
      existing.isVisible = true;
      return;
    }
    this.clearPreview(id);
    const line = MeshBuilder.CreateLines(id, { points: pts, updatable: true }, this.scene);
    line.color = color;
    this.registerPreview(id, line);
  }

  /**
   * Helper to quickly draw a preview path (polyline or open polygon).
   * Reuses LinesMesh when possible.
   */
  public static showPath(
    id: string,
    points: Vector3[],
    current: Vector3,
    closed: boolean = false,
    color: Color3 = new Color3(0.1, 0.1, 0.1)
  ) {
    const pts: Vector3[] = [...points.map((p) => p.clone()), current.clone()];
    if (closed && points.length > 0) pts.push(points[0].clone());
    if (pts.length < 2) return;

    const existing = this.activePreviewMeshes.get(id);
    if (
      existing instanceof LinesMesh &&
      !existing.isDisposed() &&
      this.linesMeshPointCount(existing) === pts.length
    ) {
      MeshBuilder.CreateLines(id, { points: pts, instance: existing, updatable: true }, this.scene);
      existing.color = color;
      existing.isVisible = true;
      return;
    }
    this.clearPreview(id);
    const path = MeshBuilder.CreateLines(id, { points: pts, updatable: true }, this.scene);
    path.color = color;
    this.registerPreview(id, path);
  }

  /**
   * Helper to quickly draw a preview rectangle.
   * Reuses one mesh per id and only updates vertices to avoid flicker.
   */
  public static showRectangle(
    id: string,
    points: Vector3[],
    color: Color3 = new Color3(0.3, 0.35, 0.45)
  ) {
    if (points.length < 4) return;

    const positions: number[] = [];
    points.forEach((p) => positions.push(p.x, p.y, p.z));

    const indices = [0, 1, 2, 0, 2, 3];
    const normals: number[] = [];

    const existing = this.activePreviewMeshes.get(id);
    if (existing instanceof Mesh && !(existing instanceof LinesMesh) && !existing.isDisposed()) {
      existing.position.set(0, 0.02, 0);
      const vertexData = new VertexData();
      vertexData.positions = positions;
      vertexData.indices = indices;
      VertexData.ComputeNormals(positions, indices, normals);
      vertexData.normals = normals;
      vertexData.applyToMesh(existing);
      const mat = existing.material as StandardMaterial | null;
      if (mat) {
        mat.diffuseColor = color;
        mat.emissiveColor = Color3.Black();
        mat.alpha = 1;
      }
      existing.isVisible = true;
      return;
    }

    this.clearPreview(id);
    const mesh = new Mesh(id, this.scene);
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    VertexData.ComputeNormals(positions, indices, normals);
    vertexData.normals = normals;
    vertexData.applyToMesh(mesh);

    const mat = new StandardMaterial(id + '_mat', this.scene);
    mat.diffuseColor = color;
    mat.emissiveColor = Color3.Black();
    mat.alpha = 1;
    mat.backFaceCulling = false;
    mesh.material = mat;
    mesh.position.y = 0.02;
    mesh.renderOutline = true;
    mesh.outlineWidth = 0.02;
    mesh.outlineColor = new Color3(0.1, 0.1, 0.2);

    this.registerPreview(id, mesh);
  }

  /**
   * Helper to quickly draw a preview ellipse.
   * Reuses one mesh per id and only updates transform/material so pointer-move does not flicker.
   */
  public static showEllipse(
    id: string,
    center: Vector3,
    radiusX: number,
    radiusZ: number,
    color: Color3 = new Color3(0.3, 0.35, 0.45)
  ) {
    const minR = 0.02;
    const sx = Math.max(Math.abs(radiusX), minR);
    const sz = Math.max(Math.abs(radiusZ), minR);

    const existing = this.activePreviewMeshes.get(id);
    if (existing instanceof Mesh && !existing.isDisposed()) {
      existing.position.set(center.x, center.y + 0.02, center.z);
      existing.scaling.set(sx, sz, 1);
      const mat = existing.material as StandardMaterial | null;
      if (mat) {
        mat.diffuseColor = color;
        mat.emissiveColor = Color3.Black();
        mat.alpha = 1;
        mat.wireframe = false;
        mat.backFaceCulling = false;
      }
      existing.isVisible = true;
      return;
    }

    this.clearPreview(id);
    const ellipse = MeshBuilder.CreateDisc(
      id,
      { radius: 1, tessellation: 64, sideOrientation: Mesh.DOUBLESIDE },
      this.scene
    );
    ellipse.position.set(center.x, center.y + 0.02, center.z);
    ellipse.rotation.x = Math.PI / 2; // Flat on ground
    ellipse.scaling.set(sx, sz, 1);

    const mat = new StandardMaterial(id + '_mat', this.scene);
    mat.diffuseColor = color;
    mat.emissiveColor = Color3.Black();
    mat.alpha = 1;
    mat.wireframe = false;
    mat.backFaceCulling = false;
    ellipse.material = mat;
    ellipse.renderOutline = true;
    ellipse.outlineWidth = 0.02;
    ellipse.outlineColor = new Color3(0.1, 0.1, 0.2);

    this.registerPreview(id, ellipse);
  }
  /**
   * Wipes every tool's localized transient projection geometries.
   */
  public static clearAll() {
    this.activePreviewMeshes.forEach(mesh => mesh.dispose());
    this.activePreviewMeshes.clear();
    if (this.snapHintMesh) {
      this.snapHintMesh.isVisible = false;
    }
  }

  public static dispose() {
    this.clearAll();
    this.snapHintMesh?.dispose();
    this.snapHintMesh = null;
    this.snapHintMaterial?.dispose();
    this.snapHintMaterial = null;
  }
}

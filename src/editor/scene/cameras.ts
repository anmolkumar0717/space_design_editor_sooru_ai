/**
 * Camera System — manages 2D/3D camera switching using a single ArcRotateCamera.
 *
 * Strategy: One camera, two modes.
 *   2D → top-down, orthographic, rotation locked
 *   3D → perspective, orbit enabled
 * This avoids scene recreation and keeps things clean.
 */

import {
  ArcRotateCamera,
  Vector3,
  type Scene,
} from '@babylonjs/core';

export type CameraMode = '2d' | '3d';

const CAMERA_2D = {
  alpha: -Math.PI / 2,    // top-down X alignment
  beta: 0,                // looking straight down
  radius: 40,
  lowerBetaLimit: 0,
  upperBetaLimit: 0,
  lowerAlphaLimit: -Math.PI / 2,
  upperAlphaLimit: -Math.PI / 2,
};

const CAMERA_3D = {
  alpha: -Math.PI / 4,
  beta: Math.PI / 3,
  radius: 30,
  lowerBetaLimit: 0.1,
  upperBetaLimit: Math.PI / 2 - 0.05,
  lowerAlphaLimit: null,
  upperAlphaLimit: null,
};

export function createEditorCamera(scene: Scene): ArcRotateCamera {
  const camera = new ArcRotateCamera(
    'editorCamera',
    CAMERA_3D.alpha,
    CAMERA_3D.beta,
    CAMERA_3D.radius,
    Vector3.Zero(),
    scene
  );

  // General camera settings
  camera.minZ = 0.1;
  camera.maxZ = 1000;
  camera.wheelDeltaPercentage = 0.02;
  camera.panningSensibility = 50;
  camera.panningInertia = 0.7;
  camera.inertia = 0.7;

  // Allow panning with right-click
  camera.panningAxis = new Vector3(1, 0, 1);

  // Enable mouse inputs
  camera.attachControl(scene.getEngine().getRenderingCanvas()!, true);

  // Apply 3D defaults
  applyMode(camera, '3d');

  return camera;
}

export function applyMode(camera: ArcRotateCamera, mode: CameraMode): void {
  const config = mode === '2d' ? CAMERA_2D : CAMERA_3D;

  // Animate transition smoothly
  camera.alpha = config.alpha;
  camera.beta = config.beta;
  camera.radius = config.radius;

  // Lock/unlock rotation
  camera.lowerBetaLimit = config.lowerBetaLimit;
  camera.upperBetaLimit = config.upperBetaLimit;
  camera.lowerAlphaLimit = config.lowerAlphaLimit;
  camera.upperAlphaLimit = config.upperAlphaLimit;

  if (mode === '2d') {
    // Orthographic projection
    camera.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
    updateOrthoFrustum(camera);
  } else {
    // Perspective projection
    camera.mode = ArcRotateCamera.PERSPECTIVE_CAMERA;
  }
}

/** Update orthographic frustum based on current canvas aspect ratio */
export function updateOrthoFrustum(camera: ArcRotateCamera): void {
  if (camera.mode !== ArcRotateCamera.ORTHOGRAPHIC_CAMERA) return;

  const engine = camera.getEngine();
  const aspect = engine.getAspectRatio(camera);
  const halfSize = camera.radius / 2;

  camera.orthoTop = halfSize;
  camera.orthoBottom = -halfSize;
  camera.orthoLeft = -halfSize * aspect;
  camera.orthoRight = halfSize * aspect;
}

/** Set camera to specific preset view */
export function setCameraPreset(
  camera: ArcRotateCamera,
  preset: 'top' | 'front' | 'right' | 'perspective'
): void {
  switch (preset) {
    case 'top':
      camera.alpha = -Math.PI / 2;
      camera.beta = 0;
      break;
    case 'front':
      camera.alpha = -Math.PI / 2;
      camera.beta = Math.PI / 2;
      break;
    case 'right':
      camera.alpha = 0;
      camera.beta = Math.PI / 2;
      break;
    case 'perspective':
      camera.alpha = CAMERA_3D.alpha;
      camera.beta = CAMERA_3D.beta;
      break;
  }
}

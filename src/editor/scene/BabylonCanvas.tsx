/**
 * BabylonCanvas — React component that:
 *   1. Creates the <canvas>
 *   2. Initializes Babylon engine & scene
 *   3. Initializes EditorEngine
 *   4. Handles cleanup on unmount
 *
 * This file should NOT contain tool logic.
 */

import { useEffect, useRef } from 'react';
import { initBabylonScene, type BabylonSceneContext } from './BabylonScene';
import { EditorEngine } from '@/editor/core/EditorEngine';
import { useSceneStore } from '@/editor/store/sceneStore';
import { useUIStore } from '@/editor/store/uiStore';
import { createId } from '@/shared/utils/ids';
import {
  createAddEntityCommand,
  executeCommand,
} from '@/editor/core/CommandManager';
import type { EditorEntity } from '@/editor/types/entities';

export function BabylonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<BabylonSceneContext | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear any leftover state from StrictMode double-mount
    useSceneStore.getState().clearScene();

    // Initialize Babylon
    const ctx = initBabylonScene(canvas);
    ctxRef.current = ctx;

    // Initialize EditorEngine (guards internally against double-init)
    EditorEngine.dispose(); // Reset if previously init'd by StrictMode
    EditorEngine.init(ctx.scene);

    // Initial camera attach if start tool is select
    if (useUIStore.getState().activeTool === 'select') {
      ctx.camera.attachControl(canvas, true);
    } else {
      ctx.camera.detachControl();
    }

    // Subscribe to tool changes to toggle camera rotation logic
    const unsubUI = useUIStore.subscribe((state, prevState) => {
      if (state.activeTool !== prevState.activeTool) {
        if (state.activeTool === 'select') {
          ctx.camera.attachControl(canvas, true);
        } else {
          ctx.camera.detachControl();
        }
      }
    });

    return () => {
      unsubUI();
      EditorEngine.dispose();
      ctx.dispose();
      ctxRef.current = null;
    };
  }, []);

  return (
    <div className="canvas-area">
      <canvas
        ref={canvasRef}
        id="babylon-canvas"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

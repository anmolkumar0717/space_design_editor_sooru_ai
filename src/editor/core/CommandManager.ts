/**
 * Command Manager — convenience wrapper that creates commands
 * and executes them through the history store.
 *
 * This provides pre-built commands for common operations
 * so tools don't need to manually construct Command objects.
 */

import { useHistoryStore, type Command } from '@/editor/store/historyStore';
import { useSceneStore } from '@/editor/store/sceneStore';
import type { EditorEntity, EditorEntityPatch } from '@/editor/types/entities';

/** Execute any command through the history system */
export function executeCommand(command: Command): void {
  useHistoryStore.getState().execute(command);
}

/** Undo the last command */
export function undo(): void {
  useHistoryStore.getState().undo();
}

/** Redo the last undone command */
export function redo(): void {
  useHistoryStore.getState().redo();
}

// ── Pre-built Commands ─────────────────────────────

/** Create a command to add an entity */
export function createAddEntityCommand(entity: EditorEntity): Command {
  return {
    label: `Add ${entity.name}`,
    execute: () => useSceneStore.getState().addEntity(entity),
    undo: () => useSceneStore.getState().removeEntity(entity.id),
  };
}

/** Create a command to remove an entity */
export function createRemoveEntityCommand(entityId: string): Command {
  let snapshot: EditorEntity | undefined;
  return {
    label: `Remove entity`,
    execute: () => {
      snapshot = useSceneStore.getState().getEntity(entityId);
      useSceneStore.getState().removeEntity(entityId);
    },
    undo: () => {
      if (snapshot) {
        useSceneStore.getState().addEntity(snapshot);
      }
    },
  };
}

/** Create a command to update an entity's properties */
export function createUpdateEntityCommand(
  entityId: string,
  patch: EditorEntityPatch
): Command {
  let previousValues: EditorEntityPatch = {};
  return {
    label: `Update entity`,
    execute: () => {
      const current = useSceneStore.getState().getEntity(entityId);
      if (current) {
        // Snapshot the values we're about to change
        previousValues = {};
        for (const key of Object.keys(patch) as (keyof EditorEntityPatch)[]) {
          (previousValues as any)[key] = (current as any)[key];
        }
      }
      useSceneStore.getState().updateEntity(entityId, patch);
    },
    undo: () => {
      useSceneStore.getState().updateEntity(entityId, previousValues);
    },
  };
}

/** Create a command to clear the entire scene */
export function createClearSceneCommand(): Command {
  let snapshot: Record<string, EditorEntity> = {};
  return {
    label: `Clear scene`,
    execute: () => {
      snapshot = { ...useSceneStore.getState().entities };
      useSceneStore.getState().clearScene();
    },
    undo: () => {
      for (const entity of Object.values(snapshot)) {
        useSceneStore.getState().addEntity(entity);
      }
    },
  };
}

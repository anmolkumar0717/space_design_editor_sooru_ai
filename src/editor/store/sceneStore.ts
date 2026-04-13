/**
 * Scene Store — source of truth for all editor entities.
 * Babylon should only render what this store says exists.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { EditorEntity, EditorEntityPatch } from '@/editor/types/entities';

interface SceneState {
  entities: Record<string, EditorEntity>;

  addEntity: (entity: EditorEntity) => void;
  updateEntity: (id: string, patch: EditorEntityPatch) => void;
  removeEntity: (id: string) => void;
  clearScene: () => void;
  getEntity: (id: string) => EditorEntity | undefined;
}

export const useSceneStore = create<SceneState>()(
  immer((set, get) => ({
    entities: {},

    addEntity: (entity) =>
      set((state) => {
        state.entities[entity.id] = entity;
      }),

    updateEntity: (id, patch) =>
      set((state) => {
        const existing = state.entities[id];
        if (existing) {
          Object.assign(existing, patch);
        }
      }),

    removeEntity: (id) =>
      set((state) => {
        delete state.entities[id];
      }),

    clearScene: () =>
      set((state) => {
        state.entities = {};
      }),

    getEntity: (id) => get().entities[id],
  }))
);

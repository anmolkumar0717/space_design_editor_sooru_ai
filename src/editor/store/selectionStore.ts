/**
 * Selection Store — keeps selection state separate from scene data.
 * Selection changes frequently and should not trigger full scene re-renders.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface SelectionState {
  selectedIds: string[];
  hoverId: string | null;

  select: (id: string) => void;
  multiSelect: (ids: string[]) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  setHover: (id: string | null) => void;
}

export const useSelectionStore = create<SelectionState>()(
  immer((set) => ({
    selectedIds: [],
    hoverId: null,

    select: (id) =>
      set((state) => {
        state.selectedIds = [id];
      }),

    multiSelect: (ids) =>
      set((state) => {
        state.selectedIds = ids;
      }),

    toggleSelect: (id) =>
      set((state) => {
        const idx = state.selectedIds.indexOf(id);
        if (idx >= 0) {
          state.selectedIds.splice(idx, 1);
        } else {
          state.selectedIds.push(id);
        }
      }),

    clearSelection: () =>
      set((state) => {
        state.selectedIds = [];
        state.hoverId = null;
      }),

    setHover: (id) =>
      set((state) => {
        state.hoverId = id;
      }),
  }))
);

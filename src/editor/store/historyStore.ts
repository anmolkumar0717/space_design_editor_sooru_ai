/**
 * History Store — undo/redo stack for the command pattern.
 * Stores are never mutated directly for undoable operations;
 * instead, commands are executed through this store.
 */

import { create } from 'zustand';

export interface Command {
  execute(): void;
  undo(): void;
  label?: string;
}

interface HistoryState {
  undoStack: Command[];
  redoStack: Command[];
  canUndo: boolean;
  canRedo: boolean;

  execute: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  execute: (command) => {
    command.execute();
    set((state) => ({
      undoStack: [...state.undoStack, command],
      redoStack: [],
      canUndo: true,
      canRedo: false,
    }));
  },

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;
    const command = undoStack[undoStack.length - 1];
    command.undo();
    set((state) => {
      const newUndo = state.undoStack.slice(0, -1);
      return {
        undoStack: newUndo,
        redoStack: [...state.redoStack, command],
        canUndo: newUndo.length > 0,
        canRedo: true,
      };
    });
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return;
    const command = redoStack[redoStack.length - 1];
    command.execute();
    set((state) => {
      const newRedo = state.redoStack.slice(0, -1);
      return {
        undoStack: [...state.undoStack, command],
        redoStack: newRedo,
        canUndo: true,
        canRedo: newRedo.length > 0,
      };
    });
  },

  clear: () =>
    set({
      undoStack: [],
      redoStack: [],
      canUndo: false,
      canRedo: false,
    }),
}));

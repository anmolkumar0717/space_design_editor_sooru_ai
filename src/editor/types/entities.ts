/**
 * Core entity types for the editor.
 * These represent the source-of-truth data model.
 * Babylon meshes are rendered FROM these — never the reverse.
 */

export type EntityType =
  | 'cube'
  | 'wall'
  | 'room'
  | 'floor'
  | 'line'
  | 'rectangle'
  | 'polyline'
  | 'polygon'
  | 'ellipse'
  | 'arc'
  | 'furniture'
  | 'placeholder';

export interface EditorEntity {
  id: string;
  name: string;
  type: EntityType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
  locked: boolean;
  points?: [number, number, number][]; // For lines, polygons, etc.
  metadata?: Record<string, unknown>;
}

export type EditorEntityPatch = Partial<Omit<EditorEntity, 'id'>>;

import type { EditorEntity } from '../types/entities';

export interface EllipseEntity extends EditorEntity {
  type: 'ellipse';
  center: [number, number, number];
  radiusX: number;
  radiusZ: number;
  rotationOffset?: number;
}

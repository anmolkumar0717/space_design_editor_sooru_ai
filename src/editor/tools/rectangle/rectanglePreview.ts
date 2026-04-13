import { Vector3 } from '@babylonjs/core';
import { PreviewManager } from '../../geometry/preview/PreviewManager';
import { RectangleBuilder } from '../../geometry/builders/rectangleBuilder';

export class RectanglePreview {
  private static PREVIEW_ID = 'rectangle_tool_preview';

  public static update(start: Vector3, current: Vector3): void {
    const corners = RectangleBuilder.getCorners(start, current);
    PreviewManager.showRectangle(this.PREVIEW_ID, corners);
  }

  public static clear(): void {
    PreviewManager.clearPreview(this.PREVIEW_ID);
  }
}

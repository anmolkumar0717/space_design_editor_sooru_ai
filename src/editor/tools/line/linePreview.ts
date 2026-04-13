import { Vector3 } from '@babylonjs/core';
import { PreviewManager } from '../../geometry/preview/PreviewManager';

export class LinePreview {
  private static PREVIEW_ID = 'line_tool_preview';

  public static update(start: Vector3, current: Vector3): void {
    PreviewManager.showLine(this.PREVIEW_ID, start, current);
  }

  public static clear(): void {
    PreviewManager.clearPreview(this.PREVIEW_ID);
  }
}

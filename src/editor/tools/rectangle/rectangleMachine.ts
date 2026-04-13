import { Vector3 } from '@babylonjs/core';

export type RectangleToolStep = 'idle' | 'dragging';

export interface RectangleToolState {
  step: RectangleToolStep;
  start?: Vector3;
  current?: Vector3;
}

export class RectangleMachine {
  private state: RectangleToolState = { step: 'idle' };

  public getState(): RectangleToolState {
    return this.state;
  }

  public reset(): void {
    this.state = { step: 'idle' };
  }

  public setFirstPoint(point: Vector3): void {
    this.state = {
      step: 'dragging',
      start: point.clone(),
      current: point.clone()
    };
  }

  public updateCurrent(point: Vector3): void {
    if (this.state.step === 'dragging') {
      this.state.current = point.clone();
    }
  }

  public isIdle(): boolean {
    return this.state.step === 'idle';
  }

  public isDragging(): boolean {
    return this.state.step === 'dragging';
  }
}

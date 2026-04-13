import { Vector3 } from '@babylonjs/core';

export type LineToolStep = 'idle' | 'first-point' | 'dragging';

export interface LineToolState {
  step: LineToolStep;
  start?: Vector3;
  current?: Vector3;
}

export class LineMachine {
  private state: LineToolState = { step: 'idle' };

  public getState(): LineToolState {
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

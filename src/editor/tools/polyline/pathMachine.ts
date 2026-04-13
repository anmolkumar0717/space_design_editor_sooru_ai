import { Vector3 } from '@babylonjs/core';

export type PathToolStep = 'idle' | 'drawing';

export interface PathToolState {
  step: PathToolStep;
  points: Vector3[];
  current?: Vector3;
}

export class PathMachine {
  private state: PathToolState = { step: 'idle', points: [] };

  public getState(): PathToolState {
    return this.state;
  }

  public reset(): void {
    this.state = { step: 'idle', points: [] };
  }

  public addPoint(point: Vector3): void {
    if (this.state.step === 'idle') {
      this.state = {
        step: 'drawing',
        points: [point.clone()],
        current: point.clone()
      };
    } else {
      this.state.points.push(point.clone());
      this.state.current = point.clone();
    }
  }

  public updateCurrent(point: Vector3): void {
    if (this.state.step === 'drawing') {
      this.state.current = point.clone();
    }
  }

  public isIdle(): boolean {
    return this.state.step === 'idle';
  }

  public isDrawing(): boolean {
    return this.state.step === 'drawing';
  }

  public getPointCount(): number {
    return this.state.points.length;
  }
}

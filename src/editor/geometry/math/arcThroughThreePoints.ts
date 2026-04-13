import { Vector3 } from '@babylonjs/core';

/** CCW positive angular distance from `from` to `to` in [0, 2π). */
export function angleDiffCCW(from: number, to: number): number {
  let d = to - from;
  while (d < 0) d += Math.PI * 2;
  while (d >= Math.PI * 2) d -= Math.PI * 2;
  return d;
}

/** True if going CCW from t0 to t2 passes through t1 (all on same circle). */
function midOnCCWArc(t0: number, t1: number, t2: number, eps: number): boolean {
  const d01 = angleDiffCCW(t0, t1);
  const d12 = angleDiffCCW(t1, t2);
  const d02 = angleDiffCCW(t0, t2);
  return Math.abs(d01 + d12 - d02) < eps;
}

const COL_EPS = 1e-8;

/**
 * Circumcircle of three non-collinear points in the XZ plane (architectural floor).
 * Returns null if points are collinear or coincident.
 */
export function circumcircleXZ(
  a: Vector3,
  b: Vector3,
  c: Vector3
): { center: Vector3; radius: number } | null {
  const x1 = a.x,
    z1 = a.z;
  const x2 = b.x,
    z2 = b.z;
  const x3 = c.x,
    z3 = c.z;

  const d = 2 * (x1 * (z2 - z3) + x2 * (z3 - z1) + x3 * (z1 - z2));
  if (Math.abs(d) < COL_EPS) return null;

  const x1sq = x1 * x1 + z1 * z1;
  const x2sq = x2 * x2 + z2 * z2;
  const x3sq = x3 * x3 + z3 * z3;

  const ux = (x1sq * (z2 - z3) + x2sq * (z3 - z1) + x3sq * (z1 - z2)) / d;
  const uz = (x1sq * (x3 - x2) + x2sq * (x1 - x3) + x3sq * (x2 - x1)) / d;

  const r = Math.hypot(x1 - ux, z1 - uz);
  if (r < COL_EPS) return null;

  return { center: new Vector3(ux, a.y, uz), radius: r };
}

/**
 * Circular arc from `start` to `end` in XZ that passes through `mid` (3-point CAD arc).
 * If the points are collinear, returns a two-point polyline [start, end].
 */
export function tessellateArcThroughThreePointsXZ(
  start: Vector3,
  mid: Vector3,
  end: Vector3,
  segments: number
): Vector3[] {
  const circle = circumcircleXZ(start, mid, end);
  const y = start.y;
  if (!circle) {
    return [new Vector3(start.x, y, start.z), new Vector3(end.x, y, end.z)];
  }

  const { center, radius } = circle;
  const t0 = Math.atan2(start.z - center.z, start.x - center.x);
  const t1 = Math.atan2(mid.z - center.z, mid.x - center.x);
  const t2 = Math.atan2(end.z - center.z, end.x - center.x);

  const eps = 1e-4;
  const useCCW = midOnCCWArc(t0, t1, t2, eps);
  let sweep: number;
  if (useCCW) {
    sweep = angleDiffCCW(t0, t2);
  } else {
    sweep = -angleDiffCCW(t2, t0);
  }

  const n = Math.max(2, segments);
  const pts: Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + sweep * (i / n);
    pts.push(
      new Vector3(center.x + radius * Math.cos(t), y, center.z + radius * Math.sin(t))
    );
  }
  return pts;
}

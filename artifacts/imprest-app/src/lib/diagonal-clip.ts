import { useLayoutEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Why this exists
// ---------------------------------------------------------------------------
// CSS `clip-path: polygon(...)` can't round a corner, and every x-coordinate
// in it resolves as a percentage of the element's own WIDTH — there is no
// way to say "lean this edge by a percentage of height," which is what a
// matching diagonal angle actually requires. A `vh`-based offset sidesteps
// the width problem, but it only produces the same *angle* on two elements
// if they happen to render at the same height — e.g. the full-bleed backdrop
// is always exactly the viewport height, but a centered card is only as
// tall as its own content, so the two diagonals quietly drift apart on
// short or unusually-shaped viewports.
//
// The fix: measure each element's real pixel size and compute its diagonal
// from that. As long as every diagonal panel derives its horizontal run
// from the *same ratio of its own height*, their slopes (run ÷ rise) match
// exactly, regardless of how tall any one of them renders on a given
// device. Rounding the corners needs real pixel geometry too, so this hook
// does both in one pass, and leaves the actual point geometry (which edge
// leans, by how much, which side is kept) up to the caller — the two
// panels on the login page need different shapes, not just different sizes.
// ---------------------------------------------------------------------------

export interface Point {
  x: number;
  y: number;
}

function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(v: Point): Point {
  const len = Math.hypot(v.x, v.y);
  return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
}

function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

function scale(v: Point, s: number): Point {
  return { x: v.x * s, y: v.y * s };
}

// Builds an SVG path `d` string for a closed polygon with every corner
// rounded to `radius` px. Each vertex is replaced with a quadratic curve
// between two points inset along its adjacent edges, using the original
// vertex as the curve's control point — the standard technique for
// rounding an arbitrary (non-rectangular) polygon. `radius: 0` degenerates
// cleanly back to sharp corners, so the same helper covers both cases.
function roundedPolygonPath(points: Point[], radius: number): string {
  const n = points.length;
  if (n < 3) return '';

  const commands: string[] = [];

  for (let i = 0; i < n; i++) {
    const curr = points[i]!;
    const prev = points[(i - 1 + n) % n]!;
    const next = points[(i + 1) % n]!;

    const toPrev = normalize(sub(prev, curr));
    const toNext = normalize(sub(next, curr));
    const r = Math.max(0, Math.min(radius, dist(prev, curr) / 2, dist(next, curr) / 2));

    const inStart = add(curr, scale(toPrev, r));
    const inEnd = add(curr, scale(toNext, r));

    commands.push(i === 0 ? `M ${inStart.x} ${inStart.y}` : `L ${inStart.x} ${inStart.y}`);
    commands.push(`Q ${curr.x} ${curr.y} ${inEnd.x} ${inEnd.y}`);
  }

  commands.push('Z');
  return commands.join(' ');
}

/**
 * Attach `ref` to a block element to clip it to whatever shape `getPoints`
 * returns, with every corner rounded by `radius` px. `getPoints` receives
 * the element's own real, measured pixel size — use it to derive the
 * diagonal's run as a ratio of `height` (not a fixed vh value, and not a
 * ratio of `width`) so the same ratio on two differently-sized elements
 * always produces the same visual angle.
 */
export function useDiagonalClipPath<T extends HTMLElement>({
  radius = 0,
  getPoints,
}: {
  radius?: number;
  getPoints: (size: { width: number; height: number }) => Point[];
}) {
  const ref = useRef<T>(null);
  const [clipPath, setClipPath] = useState<string | undefined>(undefined);
  // getPoints is expected to be a fresh closure each render (it typically
  // captures render-time constants like a lean ratio) — read the latest
  // one via a ref instead of re-running the effect (and re-subscribing the
  // ResizeObserver) on every render.
  const getPointsRef = useRef(getPoints);
  getPointsRef.current = getPoints;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const points = getPointsRef.current({ width, height });
      setClipPath(`path('${roundedPolygonPath(points, radius)}')`);
    };

    update();
    // Covers window resizes, device rotation, and the element's own layout
    // changing (e.g. the card growing/shrinking as content loads).
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [radius]);

  return { ref, clipPath };
}

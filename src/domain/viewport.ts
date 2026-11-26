import { MAP_HEIGHT, MAP_WIDTH } from './projection';
import type { ViewportTransform } from './types';

export const MIN_SCALE = 0.45;
export const MAX_SCALE = 4.5;

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/**
 * Computes an initial centered transform that fits the 1000x1200 face map cleanly
 * inside the viewport container with comfortable breathing room.
 */
export function fitViewport(containerW: number, containerH: number): ViewportTransform {
  if (containerW <= 0 || containerH <= 0) {
    return { x: 0, y: 0, scale: 0.75 };
  }

  const paddingX = containerW < 640 ? 16 : 48;
  const paddingY = containerH < 640 ? 24 : 56;
  const availW = Math.max(120, containerW - paddingX * 2);
  const availH = Math.max(120, containerH - paddingY * 2);

  const scale = clampScale(Math.min(availW / MAP_WIDTH, availH / MAP_HEIGHT));
  const x = (containerW - MAP_WIDTH * scale) / 2;
  const y = (containerH - MAP_HEIGHT * scale) / 2;

  return { x, y, scale };
}

/**
 * Clamps pan offsets so at least ~25% of the map always remains visible inside the viewport.
 */
export function clampTransform(
  transform: ViewportTransform,
  containerW: number,
  containerH: number
): ViewportTransform {
  const scale = clampScale(transform.scale);
  if (containerW <= 0 || containerH <= 0) {
    return { ...transform, scale };
  }

  const mapW = MAP_WIDTH * scale;
  const mapH = MAP_HEIGHT * scale;
  const minVisibleX = Math.min(180, mapW * 0.35);
  const minVisibleY = Math.min(180, mapH * 0.35);

  const minX = minVisibleX - mapW;
  const maxX = containerW - minVisibleX;
  const minY = minVisibleY - mapH;
  const maxY = containerH - minVisibleY;

  return {
    x: Math.min(maxX, Math.max(minX, transform.x)),
    y: Math.min(maxY, Math.max(minY, transform.y)),
    scale,
  };
}

/**
 * Zooms while keeping the exact map coordinate under `(focalScreenX, focalScreenY)` fixed.
 */
export function zoomAtPoint(
  transform: ViewportTransform,
  focalScreenX: number,
  focalScreenY: number,
  nextScale: number,
  containerW?: number,
  containerH?: number
): ViewportTransform {
  const clampedScale = clampScale(nextScale);
  const ratio = clampedScale / transform.scale;

  const next: ViewportTransform = {
    x: focalScreenX - (focalScreenX - transform.x) * ratio,
    y: focalScreenY - (focalScreenY - transform.y) * ratio,
    scale: clampedScale,
  };

  if (containerW !== undefined && containerH !== undefined) {
    return clampTransform(next, containerW, containerH);
  }
  return next;
}

/**
 * Computes the viewport transform that smoothly centers `(targetMapX, targetMapY)`
 * in the middle of the container at `desiredScale`.
 */
export function computeFlyToTransform(
  targetMapX: number,
  targetMapY: number,
  containerW: number,
  containerH: number,
  desiredScale = 1.65,
  verticalFocusRatio = 0.5
): ViewportTransform {
  const fit = fitViewport(containerW, containerH);
  const targetScale = clampScale(Math.max(desiredScale, fit.scale * 1.45));
  const raw: ViewportTransform = {
    x: containerW / 2 - targetMapX * targetScale,
    y: containerH * verticalFocusRatio - targetMapY * targetScale,
    scale: targetScale,
  };
  return clampTransform(raw, containerW, containerH);
}

/**
 * Compensates marker radius & stroke when zooming in so acupoint pins stay crisp
 * and don't grow overly chunky at high zoom levels.
 */
export function getMarkerScaleFactor(currentScale: number): number {
  if (currentScale <= 1) return 0.96;
  return 1 / Math.pow(currentScale, 0.58);
}

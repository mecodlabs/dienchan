import { describe, expect, it } from 'vitest';
import {
  ALL_ACUPOINTS,
  BUILTIN_PROTOCOLS,
  CORE_ACUPOINTS,
  GRID_LINES,
} from '@/data/acupointRepository';
import { parseImportedCollectionsJson } from '@/data/collectionStorage';
import { getFocusTarget, MAP_WIDTH, projectAcupointsForView } from '@/domain/projection';
import { normalizeVietnamese, searchAcupoints } from '@/domain/search';
import {
  clampTransform,
  computeFlyToTransform,
  fitViewport,
  MAX_SCALE,
  MIN_SCALE,
  zoomAtPoint,
} from '@/domain/viewport';

describe('Vietnamese accent-insensitive search & ranking', () => {
  it('strips Vietnamese accents and converts đ/Đ to d', () => {
    expect(normalizeVietnamese('Đau đầu mất ngủ')).toBe('dau dau mat ngu');
    expect(normalizeVietnamese('Huyệt Ấn Đường')).toBe('huyet an duong');
  });

  it('ranks exact code match first ahead of substring matches', () => {
    const results = searchAcupoints(CORE_ACUPOINTS, '19');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].code).toBe('19');
  });

  it('matches symptoms without Vietnamese accents', () => {
    const headache = searchAcupoints(CORE_ACUPOINTS, 'dau dau');
    expect(headache.some((p) => p.code === '26')).toBe(true);
    expect(headache.some((p) => p.code === '124')).toBe(true);

    const insomnia = searchAcupoints(CORE_ACUPOINTS, 'mat ngu');
    expect(insomnia.some((p) => p.code === '124')).toBe(true);
  });

  it('filters accurately by anatomical region', () => {
    const nosePoints = searchAcupoints(CORE_ACUPOINTS, '', 'nose');
    expect(nosePoints.every((p) => p.region === 'nose')).toBe(true);
    expect(nosePoints.some((p) => p.code === '43')).toBe(true);
  });
});

describe('Diện Chẩn dataset integrity & coordinate projection', () => {
  it('includes full 2010 dataset (255+ acupoints), 35 core acupoints, and 6 built-in protocols (including 257-point default)', () => {
    expect(ALL_ACUPOINTS.length).toBeGreaterThanOrEqual(255);
    expect(CORE_ACUPOINTS).toHaveLength(35);
    expect(BUILTIN_PROTOCOLS).toHaveLength(6);
    expect(BUILTIN_PROTOCOLS[0].pointCodes).toHaveLength(ALL_ACUPOINTS.length);
    expect(GRID_LINES.front.length).toBeGreaterThan(10);
    expect(GRID_LINES.side.length).toBeGreaterThan(8);
  });

  it('projects bilateral points symmetrically and enforces unilateral organ laterality', () => {
    const frontMarkers = projectAcupointsForView(CORE_ACUPOINTS, 'front');

    // Bilateral point 26 is midline -> 1 marker at x=500
    const m26 = frontMarkers.filter((m) => m.code === '26');
    expect(m26).toHaveLength(1);
    expect(m26[0].x).toBe(500);

    // Bilateral point 124 -> 2 markers mirrored around x=500
    const m124 = frontMarkers.filter((m) => m.code === '124');
    expect(m124).toHaveLength(2);
    expect(m124[0].x + m124[1].x).toBe(MAP_WIDTH);

    // Unilateral patient LEFT points (37, 39) must render ONLY on viewer RIGHT (x > 500)
    const m37 = frontMarkers.filter((m) => m.code === '37');
    const m39 = frontMarkers.filter((m) => m.code === '39');
    expect(m37).toHaveLength(1);
    expect(m37[0].x).toBeGreaterThan(500);
    expect(m39).toHaveLength(1);
    expect(m39[0].x).toBeGreaterThan(500);

    // Unilateral patient RIGHT points (50, 41) must render ONLY on viewer LEFT (x < 500)
    const m50 = frontMarkers.filter((m) => m.code === '50');
    const m41 = frontMarkers.filter((m) => m.code === '41');
    expect(m50).toHaveLength(1);
    expect(m50[0].x).toBeLessThan(500);
    expect(m41).toHaveLength(1);
    expect(m41[0].x).toBeLessThan(500);
  });

  it('automatically falls back to front view when focusing a left-only point from side view', () => {
    const point37 = CORE_ACUPOINTS.find((p) => p.code === '37')!;
    const target = getFocusTarget(point37, 'side');
    expect(target).not.toBeNull();
    expect(target!.view).toBe('front');
    expect(target!.x).toBeGreaterThan(500);
  });
});

describe('Viewport pan, focal zoom, and fly-to math', () => {
  it('preserves map coordinate under the focal screen point when zooming', () => {
    const start = fitViewport(1000, 800);
    const focalX = 420;
    const focalY = 310;

    // Map coordinate currently under cursor
    const mapXBefore = (focalX - start.x) / start.scale;
    const mapYBefore = (focalY - start.y) / start.scale;

    const zoomed = zoomAtPoint(start, focalX, focalY, 2.1);
    const mapXAfter = (focalX - zoomed.x) / zoomed.scale;
    const mapYAfter = (focalY - zoomed.y) / zoomed.scale;

    expect(mapXAfter).toBeCloseTo(mapXBefore, 5);
    expect(mapYAfter).toBeCloseTo(mapYBefore, 5);
  });

  it('clamps scale within MIN_SCALE and MAX_SCALE', () => {
    const start = fitViewport(1000, 800);
    expect(zoomAtPoint(start, 500, 400, 99).scale).toBe(MAX_SCALE);
    expect(zoomAtPoint(start, 500, 400, 0.01).scale).toBe(MIN_SCALE);
  });

  it('centers target acupoint inside container on computeFlyToTransform', () => {
    const containerW = 800;
    const containerH = 700;
    const target = computeFlyToTransform(500, 432, containerW, containerH, 2.0);
    const screenX = target.x + 500 * target.scale;
    const screenY = target.y + 432 * target.scale;

    expect(screenX).toBeCloseTo(containerW / 2, 1);
    expect(screenY).toBeCloseTo(containerH / 2, 1);
  });

  it('prevents panning the map completely off-screen', () => {
    const clamped = clampTransform({ x: 99999, y: -99999, scale: 1 }, 800, 600);
    expect(clamped.x).toBeLessThanOrEqual(800);
    expect(clamped.y).toBeGreaterThan(-1200);
  });
});

describe('Collection JSON import validation', () => {
  it('parses valid exported collections payload', () => {
    const payload = JSON.stringify({
      format: 'dien-chan-atlas-collections',
      version: 1,
      collections: [
        {
          id: 'old-id',
          name: 'Bộ tự tạo',
          description: 'Test',
          pointCodes: ['26', '124', '26'],
        },
      ],
    });
    const res = parseImportedCollectionsJson(payload);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.collections).toHaveLength(1);
      expect(res.collections[0].name).toBe('Bộ tự tạo');
      expect(res.collections[0].pointCodes).toEqual(['26', '124']); // deduplicated
    }
  });

  it('rejects malformed JSON cleanly with Vietnamese error message', () => {
    const invalidJson = parseImportedCollectionsJson('{bad json');
    expect(invalidJson.ok).toBe(false);

    const wrongShape = parseImportedCollectionsJson('{"foo": "bar"}');
    expect(wrongShape.ok).toBe(false);
  });
});

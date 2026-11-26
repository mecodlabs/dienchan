import type { Acupoint, FaceView, RenderedMarker } from './types';

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 1200;
export const MAP_MIDLINE_X = 500;

/**
 * Projects acupoint definitions into concrete 2D markers for a given anatomical view.
 * - On `front` view: `bilateral` points store the patient's Right side (x < 500)
 *   and are automatically mirrored across x = 500 to project the patient's Left side.
 * - On `side` view: emits a single marker if `views.side` is defined.
 */
export function projectAcupointsForView(
  points: Acupoint[],
  view: FaceView
): RenderedMarker[] {
  const markers: RenderedMarker[] = [];

  for (const point of points) {
    if (view === 'front') {
      const coord = point.views.front;
      if (!coord) continue;

      if (point.laterality === 'bilateral') {
        markers.push({
          id: `${point.code}-right`,
          code: point.code,
          x: coord.x,
          y: coord.y,
          side: 'right',
          acupoint: point,
        });
        const mirroredX = MAP_WIDTH - coord.x;
        if (Math.abs(mirroredX - coord.x) > 1) {
          markers.push({
            id: `${point.code}-left`,
            code: point.code,
            x: mirroredX,
            y: coord.y,
            side: 'left',
            acupoint: point,
          });
        }
      } else {
        markers.push({
          id: `${point.code}-${point.laterality}`,
          code: point.code,
          x: coord.x,
          y: coord.y,
          side: point.laterality,
          acupoint: point,
        });
      }
    } else {
      const coord = point.views.side;
      if (!coord) continue;

      markers.push({
        id: `${point.code}-side`,
        code: point.code,
        x: coord.x,
        y: coord.y,
        side: point.laterality === 'midline' ? 'midline' : 'right',
        acupoint: point,
      });
    }
  }

  return markers;
}

/**
 * Resolves the target view and map coordinates to focus on a selected acupoint.
 * Keeps `currentView` if the point exists on that view; otherwise switches views.
 */
export function getFocusTarget(
  point: Acupoint,
  currentView: FaceView
): { view: FaceView; x: number; y: number } | null {
  const currentCoord = point.views[currentView];
  if (currentCoord) {
    return { view: currentView, x: currentCoord.x, y: currentCoord.y };
  }

  const fallbackView: FaceView = currentView === 'front' ? 'side' : 'front';
  const fallbackCoord = point.views[fallbackView];
  if (fallbackCoord) {
    return { view: fallbackView, x: fallbackCoord.x, y: fallbackCoord.y };
  }

  return null;
}

export function formatLateralityLabel(laterality: Acupoint['laterality']): string {
  switch (laterality) {
    case 'midline':
      return 'Trục giữa';
    case 'bilateral':
      return 'Đối xứng 2 bên';
    case 'left':
      return 'Chỉ bên Trái (người bệnh)';
    case 'right':
      return 'Chỉ bên Phải (người bệnh)';
  }
}

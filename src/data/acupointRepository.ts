import acupoints2010Json from '@data/acupoints.2010.json';
import gridLinesJson from '@data/grid-lines.json';
import protocolsJson from '@data/protocols.core.json';
import type { Acupoint, GridLinesDataset, PointCollection } from '@/domain/types';

export const DEFAULT_ALL_COLLECTION_ID = 'builtin-all-257';

export const ALL_ACUPOINTS: Acupoint[] = acupoints2010Json as Acupoint[];
export const CORE_ACUPOINTS: Acupoint[] = ALL_ACUPOINTS.filter(
  (point) => point.tier === 'core'
);
export const GRID_LINES: GridLinesDataset = gridLinesJson as GridLinesDataset;

export const ALL_257_COLLECTION: PointCollection = {
  id: DEFAULT_ALL_COLLECTION_ID,
  name: `Bộ ${ALL_ACUPOINTS.length} huyệt (2010)`,
  description:
    'Toàn bộ hệ thống huyệt theo Đồ hình Huyệt Thường Dùng 2010 (GS.TSKH Bùi Quốc Châu).',
  pointCodes: ALL_ACUPOINTS.map((point) => point.code),
  isBuiltin: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const BUILTIN_PROTOCOLS: PointCollection[] = [
  ALL_257_COLLECTION,
  ...(protocolsJson as PointCollection[]),
];

const acupointByCodeMap = new Map<string, Acupoint>(
  ALL_ACUPOINTS.map((point) => [point.code, point])
);

export function getAcupointByCode(code: string): Acupoint | undefined {
  return acupointByCodeMap.get(code);
}

export function resolveCollectionAcupoints(pointCodes: string[]): Acupoint[] {
  const resolved: Acupoint[] = [];
  for (const code of pointCodes) {
    const found = acupointByCodeMap.get(code);
    if (found) resolved.push(found);
  }
  return resolved;
}

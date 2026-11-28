import type { Acupoint, FaceRegion } from './types';

export const REGION_FILTERS: Array<{ id: FaceRegion | 'all'; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'forehead', label: 'Trán' },
  { id: 'eyes', label: 'Mắt & Mày' },
  { id: 'nose', label: 'Mũi' },
  { id: 'cheeks', label: 'Má' },
  { id: 'mouth-chin', label: 'Miệng & Cằm' },
  { id: 'ears-jaw', label: 'Tai & Hàm' },
];

export const QUICK_SYMPTOM_CHIPS = [
  'Đau đầu',
  'Mất ngủ',
  'Nghẹt mũi',
  'Cổ vai gáy',
  'Tiêu hóa',
  'Tăng đề kháng',
];

/**
 * Strips Vietnamese diacritics and normalizes `đ/Đ` -> `d` for accent-insensitive search.
 */
export function normalizeVietnamese(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Compares acupoint codes naturally by numeric prefix first (e.g., 22 < 22B < 23).
 */
export function compareAcupointCode(a: string, b: string): number {
  const na = parseInt(a, 10);
  const nb = parseInt(b, 10);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) {
    return na - nb;
  }
  return a.localeCompare(b);
}

interface IndexedAcupoint {
  codeNorm: string;
  nameNorm: string;
  regionNorm: string;
  organNorm: string;
  combined: string;
}

const searchIndexCache = new WeakMap<Acupoint, IndexedAcupoint>();

function getIndexedAcupoint(point: Acupoint): IndexedAcupoint {
  const cached = searchIndexCache.get(point);
  if (cached) return cached;

  const codeNorm = normalizeVietnamese(point.code);
  const nameNorm = normalizeVietnamese(point.name);
  const regionNorm = normalizeVietnamese(point.regionLabel);
  const organNorm = normalizeVietnamese(point.organReflection ?? '');
  const indicationsNorm = normalizeVietnamese(point.indications.join(' '));
  const locateNorm = normalizeVietnamese(point.howToLocate);
  const gridNorm = normalizeVietnamese(`${point.gridRef.vertical} ${point.gridRef.horizontal}`);

  const indexed: IndexedAcupoint = {
    codeNorm,
    nameNorm,
    regionNorm,
    organNorm,
    combined: `${codeNorm} ${nameNorm} ${regionNorm} ${organNorm} ${indicationsNorm} ${locateNorm} ${gridNorm}`,
  };
  searchIndexCache.set(point, indexed);
  return indexed;
}

function getSearchRank(point: Acupoint, rawQuery: string, tokens: string[]): number {
  const { codeNorm, nameNorm, regionNorm, organNorm, combined } = getIndexedAcupoint(point);

  // Every query token must match somewhere
  for (const token of tokens) {
    if (!combined.includes(token)) {
      return -1;
    }
  }

  // Exact acupoint code match ranks highest
  if (codeNorm === rawQuery) return 0;
  // Prefix code match (e.g., query "1" -> "103", "106" above "61")
  if (codeNorm.startsWith(rawQuery)) return 1;
  // Substring inside code (e.g., query "9" -> "19", "290")
  if (codeNorm.includes(rawQuery)) return 2;
  // Match in name, organ reflection, or region label
  if (
    nameNorm.includes(rawQuery) ||
    organNorm.includes(rawQuery) ||
    regionNorm.includes(rawQuery)
  ) {
    return 3;
  }
  // Match in indications, grid reference, or palpation guide
  return 4;
}

export function searchAcupoints(
  points: Acupoint[],
  query: string,
  region: FaceRegion | 'all' = 'all'
): Acupoint[] {
  const regionFiltered =
    region === 'all' ? points : points.filter((p) => p.region === region);

  const normalizedQuery = normalizeVietnamese(query);
  if (!normalizedQuery) {
    return [...regionFiltered].sort((a, b) => compareAcupointCode(a.code, b.code));
  }

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const scored: Array<{ point: Acupoint; rank: number }> = [];

  for (const point of regionFiltered) {
    const rank = getSearchRank(point, normalizedQuery, tokens);
    if (rank >= 0) {
      scored.push({ point, rank });
    }
  }

  scored.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return compareAcupointCode(a.point.code, b.point.code);
  });

  return scored.map((entry) => entry.point);
}

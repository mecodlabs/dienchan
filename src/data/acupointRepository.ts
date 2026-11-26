import acupointsJson from '@data/acupoints.core.json';
import gridLinesJson from '@data/grid-lines.json';
import protocolsJson from '@data/protocols.core.json';
import type { Acupoint, GridLinesDataset, PointCollection } from '@/domain/types';

export const CORE_ACUPOINTS: Acupoint[] = acupointsJson as Acupoint[];
export const GRID_LINES: GridLinesDataset = gridLinesJson as GridLinesDataset;
export const BUILTIN_PROTOCOLS: PointCollection[] = protocolsJson as PointCollection[];

const acupointByCodeMap = new Map<string, Acupoint>(
  CORE_ACUPOINTS.map((point) => [point.code, point])
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

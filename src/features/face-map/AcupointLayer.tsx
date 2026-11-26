import React from 'react';
import type { FaceView, PointCollection, RenderedMarker } from '@/domain/types';
import { getMarkerScaleFactor } from '@/domain/viewport';

interface AcupointLayerProps {
  view: FaceView;
  markers: RenderedMarker[];
  selectedCode: string | null;
  hoveredCode: string | null;
  activeCollection: PointCollection | null;
  showAllLabels: boolean;
  scale: number;
  onSelect: (code: string, x: number, y: number) => void;
  onHover: (code: string | null) => void;
}

/** Key master points highlighted in crimson on official Bùi Quốc Châu charts */
const RED_MASTER_POINTS = new Set([
  '0',
  '14',
  '19',
  '26',
  '61',
  '63',
  '103',
  '126',
  '127',
  '130',
  '143',
]);

function getLabelOffset(
  code: string,
  baseRadius: number,
  side: 'midline' | 'left' | 'right',
  isSideView: boolean
): { dx: number; dy: number } {
  if (isSideView) {
    // Left-facing Trắc diện label offsets matching official BQC chart
    switch (code) {
      case '126':
        return { dx: -8, dy: -12 };
      case '103':
        return { dx: -18, dy: 0 };
      case '106':
        return { dx: -18, dy: 0 };
      case '65':
        return { dx: -16, dy: 0 };
      case '130':
        return { dx: 14, dy: 10 };
      case '16':
        return { dx: -14, dy: -6 };
      case '189':
        return { dx: -18, dy: 0 };
      case '60':
        return { dx: 12, dy: -10 };
      case '1':
        return { dx: -14, dy: 6 };
      case '290':
        return { dx: 16, dy: 8 };
      case '61':
        return { dx: -15, dy: 6 };
      case '0':
        return { dx: 12, dy: 12 };
      case '173':
        return { dx: 18, dy: 2 };
      case '143':
        return { dx: -18, dy: 8 };
      case '19':
        return { dx: -14, dy: 8 };
      case '39':
        return { dx: 14, dy: 4 };
      case '275':
        return { dx: 0, dy: -12 };
      case '14':
        return { dx: 14, dy: -4 };
      case '63':
        return { dx: -16, dy: 0 };
      case '38':
        return { dx: 0, dy: 14 };
      case '222':
        return { dx: 0, dy: 14 };
      case '127':
        return { dx: -18, dy: 0 };
      case '87':
        return { dx: -16, dy: 4 };
      default:
        return { dx: 0, dy: baseRadius + 10 };
    }
  }

  // Front view textbook label offsets matching official BQC chart
  switch (code) {
    case '34':
      return { dx: side === 'right' ? -15 : 15, dy: -2 };
    case '65':
      return { dx: side === 'right' ? -14 : 14, dy: 8 };
    case '26':
      return { dx: 0, dy: -(baseRadius + 9) };
    case '1':
      return { dx: 0, dy: -(baseRadius + 9) };
    case '290':
      return { dx: side === 'right' ? -16 : 16, dy: -8 };
    case '61':
      return { dx: side === 'right' ? -14 : 14, dy: -6 };
    case '43':
      return { dx: 0, dy: -(baseRadius + 8) };
    case '45':
      return { dx: side === 'right' ? -15 : 15, dy: 2 };
    case '173':
      return { dx: 0, dy: -(baseRadius + 9) };
    case '143':
      return { dx: -18, dy: -2 };
    case '19':
      return { dx: 16, dy: 4 };
    case '7':
      return { dx: side === 'right' ? -12 : 12, dy: 6 };
    case '50':
      return { dx: 0, dy: baseRadius + 11 };
    default:
      return { dx: 0, dy: baseRadius + 10 };
  }
}

export const AcupointLayer: React.FC<AcupointLayerProps> = ({
  view,
  markers,
  selectedCode,
  hoveredCode,
  activeCollection,
  showAllLabels,
  scale,
  onSelect,
  onHover,
}) => {
  const compensation = getMarkerScaleFactor(scale);
  const collectionOrderMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (activeCollection) {
      activeCollection.pointCodes.forEach((code, idx) => {
        if (!map.has(code)) {
          map.set(code, idx + 1);
        }
      });
    }
    return map;
  }, [activeCollection]);

  const sequenceSegments = React.useMemo(() => {
    if (!activeCollection || activeCollection.pointCodes.length < 2) return [];
    const byCode = new Map<string, RenderedMarker[]>();
    for (const m of markers) {
      const arr = byCode.get(m.code) ?? [];
      arr.push(m);
      byCode.set(m.code, arr);
    }

    const segments: Array<{ x1: number; y1: number; x2: number; y2: number; key: string }> = [];
    for (let i = 0; i < activeCollection.pointCodes.length - 1; i++) {
      const fromMarkers = byCode.get(activeCollection.pointCodes[i]);
      const toMarkers = byCode.get(activeCollection.pointCodes[i + 1]);
      if (!fromMarkers || !toMarkers) continue;

      const from = fromMarkers[0];
      let bestTo = toMarkers[0];
      let bestDist = Infinity;
      for (const candidate of toMarkers) {
        const d = Math.hypot(candidate.x - from.x, candidate.y - from.y);
        if (d < bestDist) {
          bestDist = d;
          bestTo = candidate;
        }
      }
      segments.push({
        x1: from.x,
        y1: from.y,
        x2: bestTo.x,
        y2: bestTo.y,
        key: `${from.id}->${bestTo.id}-${i}`,
      });
    }
    return segments;
  }, [activeCollection, markers]);

  const sortedMarkers = React.useMemo(() => {
    return [...markers].sort((a, b) => {
      const score = (m: RenderedMarker) => {
        if (m.code === selectedCode) return 4;
        if (m.code === hoveredCode) return 3;
        if (collectionOrderMap.has(m.code)) return 2;
        return 1;
      };
      return score(a) - score(b);
    });
  }, [markers, selectedCode, hoveredCode, collectionOrderMap]);

  return (
    <g aria-label="Lớp các huyệt Diện Chẩn">
      {sequenceSegments.length > 0 && (
        <g className="pointer-events-none">
          {sequenceSegments.map((seg) => (
            <line
              key={seg.key}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke="#1E6F64"
              strokeWidth={2 * compensation}
              strokeOpacity={0.38}
              strokeDasharray={`${6 * compensation} ${5 * compensation}`}
            />
          ))}
        </g>
      )}

      {sortedMarkers.map((marker) => {
        const isSelected = marker.code === selectedCode;
        const isHovered = marker.code === hoveredCode;
        const stepOrder = collectionOrderMap.get(marker.code);
        const inCollection = stepOrder !== undefined;
        const isDimmed = Boolean(activeCollection && !inCollection && !isSelected && !isHovered);
        const isRedMaster = RED_MASTER_POINTS.has(marker.code);

        const isUnilateral =
          marker.acupoint.laterality === 'left' || marker.acupoint.laterality === 'right';

        const baseRadius = isSelected ? 8.5 : inCollection ? 7.2 : isHovered ? 6.8 : 4.2;
        const showLabel =
          showAllLabels || isSelected || isHovered || inCollection || scale >= 1.65;

        const labelText = marker.code;
        const labelOffset = getLabelOffset(
          marker.code,
          baseRadius,
          marker.side,
          view === 'side'
        );

        const dotFill = isSelected
          ? '#C63131'
          : inCollection
            ? '#1E6F64'
            : isRedMaster
              ? '#C63131'
              : '#1B6B46';

        return (
          <g
            key={marker.id}
            transform={`translate(${marker.x}, ${marker.y}) scale(${compensation})`}
            opacity={isDimmed ? 0.22 : 1}
            className="cursor-pointer transition-opacity duration-150"
            onPointerEnter={() => onHover(marker.code)}
            onPointerLeave={() => onHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(marker.code, marker.x, marker.y);
            }}
            role="button"
            tabIndex={0}
            aria-label={`${marker.acupoint.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(marker.code, marker.x, marker.y);
              }
            }}
          >
            {/* Generous invisible hit area */}
            <circle r="20" fill="transparent" />

            {/* Selected pulse ring */}
            {isSelected && (
              <>
                <circle
                  r="18"
                  fill="#C63131"
                  fillOpacity="0.2"
                  className="acupoint-pulse-ring"
                />
                <circle r="12.5" fill="none" stroke="#C63131" strokeWidth="2" />
              </>
            )}

            {/* Active collection ring */}
            {inCollection && !isSelected && (
              <circle
                r="11.5"
                fill="#1E6F64"
                fillOpacity="0.14"
                stroke="#1E6F64"
                strokeWidth="1.5"
              />
            )}

            {/* Subtle unilateral dashed ring (37, 39, 50, 41) */}
            {isUnilateral && !isSelected && (
              <circle
                r={baseRadius + 3.2}
                fill="none"
                stroke="#D97706"
                strokeWidth="1.4"
                strokeDasharray="2.5 2"
              />
            )}

            {/* Official BQC crimson/forest-green acupoint dot */}
            <circle
              r={baseRadius}
              fill={dotFill}
              stroke="#FFFFFF"
              strokeWidth={isSelected || inCollection ? 1.8 : 1.1}
            />

            {/* Step sequence badge */}
            {inCollection && stepOrder !== undefined && (
              <g transform={`translate(${baseRadius + 4}, ${-(baseRadius + 4)})`}>
                <circle
                  r="7"
                  fill={isSelected ? '#C63131' : '#1E6F64'}
                  stroke="#FFFFFF"
                  strokeWidth="1.3"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {stepOrder}
                </text>
              </g>
            )}

            {/* Clean BQC textbook number */}
            {showLabel && (
              <g transform={`translate(${labelOffset.dx}, ${labelOffset.dy})`}>
                {isSelected ? (
                  <>
                    <rect
                      x={-(labelText.length * 4 + 7)}
                      y="-8"
                      width={labelText.length * 8 + 14}
                      height="16"
                      rx="5"
                      fill="#1A2229"
                      stroke="#C63131"
                      strokeWidth="1.3"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#FFFFFF"
                      fontSize="10.5"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      {labelText}
                    </text>
                  </>
                ) : (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={
                      inCollection
                        ? '#0F5249'
                        : isRedMaster
                          ? '#B91C1C'
                          : '#1E293B'
                    }
                    fontSize="11.5"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    style={{
                      paintOrder: 'stroke',
                      stroke: '#FFFFFF',
                      strokeWidth: 3.6,
                      strokeLinejoin: 'round',
                    }}
                  >
                    {labelText}
                  </text>
                )}
              </g>
            )}

            {/* Hover tooltip */}
            {isHovered && !isSelected && (
              <g transform="translate(0, -26)" className="pointer-events-none">
                <rect
                  x="-92"
                  y="-24"
                  width="184"
                  height="24"
                  rx="7"
                  fill="#1A2229"
                  fillOpacity="0.94"
                />
                <text
                  y="-12"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FFFFFF"
                  fontSize="10.5"
                  fontWeight="600"
                >
                  {marker.acupoint.name.length > 27
                    ? `${marker.acupoint.name.slice(0, 26)}…`
                    : marker.acupoint.name}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

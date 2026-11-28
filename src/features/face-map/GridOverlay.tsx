import React from 'react';
import type { FaceView, GridLine } from '@/domain/types';

interface GridOverlayProps {
  lines: GridLine[];
  view: FaceView;
  visible: boolean;
}

/**
 * Official Bùi Quốc Châu 1983/2010 reference grid:
 * - Crimson circular numbered horizontal badges (0..12):
 *   RIGHT margin on Front view, LEFT margin on Side view (Trắc diện)
 * - Deep indigo vertical letter labels along the BOTTOM margin:
 *   L K H G E D C B A · O · A B C D E G H K L (O & G crimson) on Front view
 *   L M N P Q (M & Q crimson) on Side view
 */
export const GridOverlay: React.FC<GridOverlayProps> = React.memo(({ lines, view, visible }) => {
  if (!visible) return null;

  const verticalTop = 160;
  const verticalBottom = 972;
  const horizontalLeft = view === 'front' ? 124 : 114;
  const horizontalRight = view === 'front' ? 884 : 760;

  const indigo = '#2E2B7A';
  const crimson = '#C63131';

  return (
    <g aria-label="Lưới tuyến chuẩn Diện Chẩn Bùi Quốc Châu" className="pointer-events-none select-none">
      {lines.map((line) => {
        const isFrontHighlight =
          view === 'front' && (line.label === 'O' || line.label === 'G');
        const isSideHighlight =
          view === 'side' && (line.label === 'M' || line.label === 'Q');
        const isRedVertical = isFrontHighlight || isSideHighlight;

        const strokeColor = line.id === 'v-O' ? '#64748B' : '#94A3B8';
        const strokeOpacity = line.id === 'v-O' ? 0.56 : 0.42;
        const strokeWidth = line.id === 'v-O' ? 1.1 : 0.85;

        if (line.axis === 'vertical') {
          const x = line.position;
          const isMidline = line.id === 'v-O';
          const labelY = isMidline ? verticalBottom + 14 : verticalBottom + 28;

          return (
            <g key={line.id}>
              <line
                x1={x}
                y1={verticalTop}
                x2={x}
                y2={verticalBottom}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
              />
              <text
                x={x}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isRedVertical ? crimson : indigo}
                fontSize={isRedVertical ? '16' : '15'}
                fontWeight="700"
                fontFamily="Georgia, 'Times New Roman', serif"
              >
                {line.label}
              </text>
            </g>
          );
        }

        const y = line.position;
        const badgeX = view === 'front' ? horizontalRight + 22 : horizontalLeft - 24;

        return (
          <g key={line.id}>
            <line
              x1={horizontalLeft}
              y1={y}
              x2={horizontalRight}
              y2={y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
            />
            {/* Signature BQC crimson circular numbered badge (0..12) */}
            <g transform={`translate(${badgeX}, ${y})`}>
              <circle r="11.5" fill={crimson} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill="#FFFFFF"
                fontSize={line.label.length > 1 ? '11' : '12'}
                fontWeight="700"
                fontFamily="var(--font-sans)"
              >
                {line.label}
              </text>
            </g>
          </g>
        );
      })}

      {/* Subtle Anatomical Orientation Badges below the bottom letter axis */}
      {view === 'front' && (
        <g>
          <g transform="translate(340, 1044)">
            <rect
              x="-74"
              y="-12"
              width="148"
              height="24"
              rx="12"
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth="1"
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="#475569"
              fontSize="10.5"
              fontWeight="600"
            >
              ← PHẢI (người bệnh)
            </text>
          </g>
          <g transform="translate(660, 1044)">
            <rect
              x="-74"
              y="-12"
              width="148"
              height="24"
              rx="12"
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth="1"
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="#475569"
              fontSize="10.5"
              fontWeight="600"
            >
              TRÁI (người bệnh) →
            </text>
          </g>
        </g>
      )}
    </g>
  );
});

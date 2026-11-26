import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Grid3X3,
  Layers,
  Minus,
  Plus,
  RotateCcw,
  Tag,
  X,
} from 'lucide-react';
import type { Acupoint, FaceView, PointCollection } from '@/domain/types';

interface MapToolbarProps {
  view: FaceView;
  showGrid: boolean;
  showLabels: boolean;
  scale: number;
  activeCollection: PointCollection | null;
  collectionPoints: Acupoint[];
  selectedCode: string | null;
  onChangeView: (view: FaceView) => void;
  onToggleGrid: () => void;
  onToggleLabels: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onSelectCollectionPoint: (code: string) => void;
  onClearCollection: () => void;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  view,
  showGrid,
  showLabels,
  scale,
  activeCollection,
  collectionPoints,
  selectedCode,
  onChangeView,
  onToggleGrid,
  onToggleLabels,
  onZoomIn,
  onZoomOut,
  onResetView,
  onSelectCollectionPoint,
  onClearCollection,
}) => {
  const activeStepIndex = React.useMemo(() => {
    if (!activeCollection || !selectedCode) return -1;
    return activeCollection.pointCodes.indexOf(selectedCode);
  }, [activeCollection, selectedCode]);

  const handleStep = (delta: -1 | 1) => {
    if (!activeCollection || activeCollection.pointCodes.length === 0) return;
    const codes = activeCollection.pointCodes;
    if (activeStepIndex === -1) {
      onSelectCollectionPoint(codes[0]);
      return;
    }
    const nextIdx = (activeStepIndex + delta + codes.length) % codes.length;
    onSelectCollectionPoint(codes[nextIdx]);
  };

  return (
    <>
      {/* Top-left: Anatomical view switcher */}
      <div className="pointer-events-auto absolute top-3 left-3 z-20 flex items-center gap-1 rounded-xl border border-[#DED8CC] bg-white/90 p-1 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={() => onChangeView('front')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            view === 'front'
              ? 'bg-[#1A2229] text-white shadow-xs'
              : 'text-[#5B6770] hover:bg-[#F5F3EE] hover:text-[#1A2229]'
          }`}
        >
          Chính diện
        </button>
        <button
          type="button"
          onClick={() => onChangeView('side')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            view === 'side'
              ? 'bg-[#1A2229] text-white shadow-xs'
              : 'text-[#5B6770] hover:bg-[#F5F3EE] hover:text-[#1A2229]'
          }`}
        >
          Mặt nghiêng
        </button>
      </div>

      {/* Top-right: Overlay toggles */}
      <div className="pointer-events-auto absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleGrid}
          aria-pressed={showGrid}
          title="Bật/tắt lưới tuyến dọc & ngang Diện Chẩn"
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md transition-all ${
            showGrid
              ? 'border-[#1E6F64] bg-[#1E6F64] text-white'
              : 'border-[#DED8CC] bg-white/90 text-[#1A2229] hover:bg-white'
          }`}
        >
          <Grid3X3 className="h-3.5 w-3.5" />
          <span>Lưới tuyến</span>
        </button>

        <button
          type="button"
          onClick={onToggleLabels}
          aria-pressed={showLabels}
          title="Luôn hiện mã số tất cả huyệt"
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md transition-all ${
            showLabels
              ? 'border-[#1A2229] bg-[#1A2229] text-white'
              : 'border-[#DED8CC] bg-white/90 text-[#1A2229] hover:bg-white'
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Nhãn số</span>
        </button>
      </div>

      {/* Bottom-right: Zoom & Reset HUD */}
      <div className="pointer-events-auto absolute right-3 bottom-3 z-20 flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-1 rounded-xl border border-[#DED8CC] bg-white/92 p-1 shadow-sm backdrop-blur-md">
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Thu nhỏ"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#1A2229] transition hover:bg-[#F5F3EE]"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[44px] text-center font-mono text-[11px] font-semibold text-[#5B6770]">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Phóng to"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#1A2229] transition hover:bg-[#F5F3EE]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <div className="mx-0.5 h-4 w-px bg-[#E2DDD3]" />
          <button
            type="button"
            onClick={onResetView}
            title="Đặt lại góc nhìn ban đầu"
            className="flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#5B6770] transition hover:bg-[#F5F3EE] hover:text-[#1A2229]"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Bottom-left / Bottom-above-dock: Active Protocol / Saved List Step-Through Bar */}
      {activeCollection && (
        <div className="pointer-events-auto absolute right-3 bottom-16 left-3 z-20 flex items-center justify-between gap-2 rounded-2xl border border-[#1E6F64]/30 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md sm:right-auto sm:bottom-3 sm:left-3 sm:w-auto sm:max-w-[calc(100%-230px)]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1E6F64]/12 text-[#1E6F64]">
              <Layers className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-[#1A2229]">
                {activeCollection.name}
              </div>
              <div className="font-mono text-[11px] text-[#5B6770]">
                {activeStepIndex >= 0
                  ? `Bước ${activeStepIndex + 1}/${collectionPoints.length} · Huyệt ${selectedCode}`
                  : `${collectionPoints.length} huyệt trong bộ`}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => handleStep(-1)}
              title="Huyệt trước"
              disabled={collectionPoints.length === 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2DDD3] text-[#1A2229] transition hover:bg-[#F5F3EE] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleStep(1)}
              title="Huyệt tiếp theo"
              disabled={collectionPoints.length === 0}
              className="flex h-7 items-center gap-1 rounded-lg bg-[#1E6F64] px-2.5 text-xs font-semibold text-white transition hover:bg-[#17584F] disabled:opacity-40"
            >
              <Crosshair className="h-3 w-3" />
              <span>Tiếp</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onClearCollection}
              title="Tắt chế độ xem bộ huyệt"
              aria-label="Tắt chế độ xem bộ huyệt"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5B6770] transition hover:bg-[#F5F3EE] hover:text-[#C84B31]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

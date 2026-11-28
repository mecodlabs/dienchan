import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Grid3X3,
  Layers,
  Minus,
  PanelLeftOpen,
  Plus,
  RotateCcw,
  Tag,
  X,
} from 'lucide-react';
import { DEFAULT_ALL_COLLECTION_ID } from '@/data/acupointRepository';
import type { Acupoint, FaceView, PointCollection } from '@/domain/types';

interface MapToolbarProps {
  view: FaceView;
  showGrid: boolean;
  showLabels: boolean;
  scale: number;
  activeCollection: PointCollection | null;
  collectionPoints: Acupoint[];
  selectedCode: string | null;
  isDesktopSidebarOpen?: boolean;
  onOpenDesktopSidebar?: () => void;
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
  isDesktopSidebarOpen = true,
  onOpenDesktopSidebar,
  onChangeView,
  onToggleGrid,
  onToggleLabels,
  onZoomIn,
  onZoomOut,
  onResetView,
  onSelectCollectionPoint,
  onClearCollection,
}) => {
  const showStepBar = Boolean(
    activeCollection && activeCollection.id !== DEFAULT_ALL_COLLECTION_ID
  );
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
      {/* Top-left: Desktop sidebar expand button (when collapsed) + Anatomical view switcher */}
      <div className="pointer-events-auto absolute top-3 left-3 z-20 flex items-center gap-2">
        {!isDesktopSidebarOpen && onOpenDesktopSidebar && (
          <button
            type="button"
            onClick={onOpenDesktopSidebar}
            title="Mở thanh Bộ huyệt & Tra cứu"
            aria-label="Mở thanh Bộ huyệt và Tra cứu"
            className="hidden items-center gap-1.5 rounded-xl border border-[#1B6B46]/40 bg-white/95 px-3 py-2 text-xs font-bold text-[#1B6B46] shadow-sm backdrop-blur-md transition hover:bg-[#1B6B46] hover:text-white lg:inline-flex"
          >
            <PanelLeftOpen className="h-4 w-4" />
            <span>Mở menu</span>
          </button>
        )}

        <div className="flex items-center gap-1 rounded-xl border border-[#E2DDD5] bg-white/90 p-1 shadow-sm backdrop-blur-md">
          <button
            type="button"
            onClick={() => onChangeView('front')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              view === 'front'
                ? 'bg-[#1A2229] text-white shadow-xs'
                : 'text-[#5B6770] hover:bg-[#F9F8F6] hover:text-[#1A2229]'
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
                : 'text-[#5B6770] hover:bg-[#F9F8F6] hover:text-[#1A2229]'
            }`}
          >
            Mặt nghiêng
          </button>
        </div>
      </div>

      {/* Top-right: Overlay toggles (lightweight tinted active pills so the diagram stays focal) */}
      <div className="pointer-events-auto absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleGrid}
          aria-pressed={showGrid}
          title="Bật/tắt lưới tuyến dọc & ngang Diện Chẩn"
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs backdrop-blur-md transition-all ${
            showGrid
              ? 'border-[#1B6B46]/45 bg-[#1B6B46]/12 text-[#145235]'
              : 'border-[#E6E2DA] bg-white/92 text-[#5B656E] hover:bg-white hover:text-[#1A2229]'
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
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs backdrop-blur-md transition-all ${
            showLabels
              ? 'border-[#1A2229]/35 bg-[#1A2229]/8 text-[#1A2229]'
              : 'border-[#E6E2DA] bg-white/92 text-[#5B656E] hover:bg-white hover:text-[#1A2229]'
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Nhãn số</span>
        </button>
      </div>

      {/* Mobile Right-Rail Zoom & Reset Controls (large 44x44px touch targets, never overlaps bottom dock) */}
      <div className="pointer-events-auto absolute top-16 right-3 z-20 flex flex-col items-center gap-2 lg:hidden">
        <div className="flex flex-col items-center overflow-hidden rounded-2xl border border-[#DAD5CB] bg-white/96 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Phóng to"
            title="Phóng to"
            className="flex h-11 w-11 items-center justify-center text-[#1A2229] transition active:bg-[#1A2229] active:text-white"
          >
            <Plus className="h-5 w-5 stroke-[2.4]" />
          </button>
          <div className="w-8 border-t border-[#E6E2DA]" />
          <div className="flex h-7 w-11 items-center justify-center bg-[#F9F8F6] font-mono text-[10px] font-bold text-[#1B6B46]">
            {Math.round(scale * 100)}%
          </div>
          <div className="w-8 border-t border-[#E6E2DA]" />
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Thu nhỏ"
            title="Thu nhỏ"
            className="flex h-11 w-11 items-center justify-center text-[#1A2229] transition active:bg-[#1A2229] active:text-white"
          >
            <Minus className="h-5 w-5 stroke-[2.4]" />
          </button>
        </div>

        <button
          type="button"
          onClick={onResetView}
          aria-label="Đặt lại góc nhìn"
          title="Đặt lại góc nhìn ban đầu"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DAD5CB] bg-white/96 text-[#1A2229] shadow-lg backdrop-blur-md transition active:bg-[#1A2229] active:text-white"
        >
          <RotateCcw className="h-4.5 w-4.5 stroke-[2.2]" />
        </button>
      </div>

      {/* Desktop Bottom-Right: Horizontal Zoom & Reset HUD */}
      <div className="pointer-events-auto absolute right-3 bottom-3 z-20 hidden flex-col items-end gap-1.5 lg:flex">
        <div className="flex items-center gap-1 rounded-xl border border-[#E2DDD5] bg-white/94 p-1 shadow-sm backdrop-blur-md">
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Thu nhỏ"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1A2229] transition hover:bg-[#F9F8F6]"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[46px] text-center font-mono text-xs font-semibold text-[#5B6770]">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Phóng to"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1A2229] transition hover:bg-[#F9F8F6]"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="mx-0.5 h-4 w-px bg-[#E6E2DA]" />
          <button
            type="button"
            onClick={onResetView}
            title="Đặt lại góc nhìn ban đầu"
            className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-[#5B6770] transition hover:bg-[#F9F8F6] hover:text-[#1A2229]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Active Protocol / Saved List Step-Through Bar (only for focused protocols/custom lists) */}
      {showStepBar && activeCollection && (
        <div className="pointer-events-auto absolute right-3 bottom-[68px] left-3 z-20 flex items-center justify-between gap-2 rounded-2xl border border-[#1B6B46]/30 bg-white/96 px-3 py-2 shadow-lg backdrop-blur-md lg:right-auto lg:bottom-3 lg:left-3 lg:w-auto lg:max-w-[calc(100%-240px)]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1B6B46]/12 text-[#1B6B46]">
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
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E6E2DA] text-[#1A2229] transition hover:bg-[#F9F8F6] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleStep(1)}
              title="Huyệt tiếp theo"
              disabled={collectionPoints.length === 0}
              className="flex h-7 items-center gap-1 rounded-lg bg-[#1B6B46] px-2.5 text-xs font-semibold text-white transition hover:bg-[#155739] disabled:opacity-40"
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
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5B6770] transition hover:bg-[#F9F8F6] hover:text-[#C63131]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

import React from 'react';
import {
  AlertTriangle,
  BookmarkCheck,
  BookmarkPlus,
  Check,
  Compass,
  Crosshair,
  Hand,
  HeartPulse,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';
import { formatLateralityLabel } from '@/domain/projection';
import type { Acupoint, FaceView, PointCollection } from '@/domain/types';

interface AcupointDetailSheetProps {
  point: Acupoint;
  currentView: FaceView;
  userCollections: PointCollection[];
  onClose: () => void;
  onFocusOnMap: (point: Acupoint) => void;
  onTogglePointInCollection: (collectionId: string, pointCode: string) => void;
  onCreateCollectionWithPoint: (name: string, pointCode: string) => void;
}

export const AcupointDetailSheet: React.FC<AcupointDetailSheetProps> = ({
  point,
  currentView,
  userCollections,
  onClose,
  onFocusOnMap,
  onTogglePointInCollection,
  onCreateCollectionWithPoint,
}) => {
  const [showSaveMenu, setShowSaveMenu] = React.useState(false);
  const [quickListName, setQuickListName] = React.useState('');

  React.useEffect(() => {
    setShowSaveMenu(false);
    setQuickListName('');
  }, [point.code]);

  const savedInCount = userCollections.filter((c) => c.pointCodes.includes(point.code)).length;
  const isUnilateral = point.laterality === 'left' || point.laterality === 'right';
  const missingOnSideView = currentView === 'side' && !point.views.side;
  const missingOnFrontView = currentView === 'front' && !point.views.front;
  const focusButtonLabel = missingOnSideView
    ? 'Chuyển Chính diện & Phóng to'
    : missingOnFrontView
      ? 'Chuyển Mặt nghiêng & Phóng to'
      : 'Phóng to vào huyệt';

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickListName.trim()) return;
    onCreateCollectionWithPoint(quickListName.trim(), point.code);
    setQuickListName('');
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Header */}
      <div className="shrink-0 border-b border-[#E6E2DA] bg-[#F9F8F6] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 min-w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[#C63131] px-2 font-mono text-lg font-bold text-white shadow-sm">
              {point.code}
            </div>
            <div className="min-w-0">
              <h2 className="text-base leading-snug font-bold text-[#1A2229]">{point.name}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-[#EFECE7] px-2 py-0.5 text-[11px] font-semibold text-[#4E5961]">
                  {point.regionLabel}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    isUnilateral
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#1B6B46]/12 text-[#1B6B46]'
                  }`}
                >
                  {formatLateralityLabel(point.laterality)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết huyệt"
            className="rounded-lg p-1.5 text-[#5B6770] transition hover:bg-[#EBE8E1] hover:text-[#1A2229]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onFocusOnMap(point)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1A2229] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#2C3742]"
          >
            <Crosshair className="h-3.5 w-3.5" />
            <span>{focusButtonLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSaveMenu((v) => !v)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              savedInCount > 0
                ? 'border-[#1B6B46] bg-[#1B6B46]/10 text-[#1B6B46]'
                : 'border-[#DDD8CE] bg-white text-[#1A2229] hover:border-[#1B6B46]'
            }`}
          >
            {savedInCount > 0 ? (
              <BookmarkCheck className="h-3.5 w-3.5" />
            ) : (
              <BookmarkPlus className="h-3.5 w-3.5" />
            )}
            <span>{savedInCount > 0 ? `Đã lưu (${savedInCount})` : 'Lưu vào danh sách'}</span>
          </button>
        </div>

        {/* Save-to-collection inline popover */}
        {showSaveMenu && (
          <div className="mt-2.5 rounded-xl border border-[#1B6B46]/30 bg-white p-3 shadow-sm">
            <div className="mb-2 text-[11px] font-bold tracking-wide text-[#5B6770] uppercase">
              Chọn danh sách để lưu Huyệt {point.code}
            </div>
            <div className="max-h-36 space-y-1 overflow-y-auto">
              {userCollections.map((col) => {
                const checked = col.pointCodes.includes(point.code);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => onTogglePointInCollection(col.id, point.code)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                      checked
                        ? 'bg-[#1B6B46]/10 font-semibold text-[#1B6B46]'
                        : 'text-[#1A2229] hover:bg-[#F9F8F6]'
                    }`}
                  >
                    <span className="truncate">{col.name}</span>
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        checked
                          ? 'border-[#1B6B46] bg-[#1B6B46] text-white'
                          : 'border-[#CFC7B8]'
                      }`}
                    >
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <form onSubmit={handleQuickCreate} className="mt-2 flex gap-1.5 border-t border-[#EEECF0] pt-2">
              <input
                type="text"
                value={quickListName}
                onChange={(e) => setQuickListName(e.target.value)}
                placeholder="Tạo danh sách mới..."
                className="min-w-0 flex-1 rounded-lg border border-[#E2DDD5] px-2 py-1 text-xs focus:border-[#1B6B46] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!quickListName.trim()}
                className="inline-flex items-center gap-1 rounded-lg bg-[#1B6B46] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40"
              >
                <Plus className="h-3 w-3" />
                Tạo
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4"
      >
        {missingOnSideView && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            {isUnilateral ? (
              <>
                Huyệt <strong>{point.code}</strong> nằm đơn bên ở nửa mặt{' '}
                <strong>{point.laterality === 'left' ? 'Trái' : 'Phải'} người bệnh</strong>, nên chỉ hiển thị trên đồ hình Chính diện. Nhấn nút phía trên để chuyển sang Chính diện & phóng to.
              </>
            ) : (
              <>
                Huyệt <strong>{point.code}</strong> thuộc đồ hình <strong>Chính diện</strong> (không nằm trên góc Mặt nghiêng). Nhấn nút phía trên để chuyển sang Chính diện & phóng to.
              </>
            )}
          </div>
        )}

        {missingOnFrontView && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            Huyệt <strong>{point.code}</strong> thuộc đồ hình <strong>Mặt nghiêng / Sau tai</strong> (không nằm trên góc Chính diện). Nhấn nút phía trên để chuyển sang Mặt nghiêng & phóng to.
          </div>
        )}

        {/* Organ Reflection */}
        {point.organReflection && (
          <div className="flex items-center gap-2 rounded-xl border border-[#1B6B46]/20 bg-[#1B6B46]/6 px-3 py-2.5">
            <HeartPulse className="h-4 w-4 shrink-0 text-[#1B6B46]" />
            <div className="text-xs">
              <span className="font-semibold text-[#1B6B46]">Phản chiếu tạng phủ / vùng: </span>
              <span className="font-medium text-[#1A2229]">{point.organReflection}</span>
            </div>
          </div>
        )}

        {/* Grid Coordinates */}
        <section className="rounded-xl border border-[#E6E2DA] bg-[#F9F8F6] p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#1A2229]">
            <Compass className="h-4 w-4 text-[#1B6B46]" />
            <span>Tọa độ tuyến Diện Chẩn</span>
          </div>
          <dl className="space-y-1.5 text-xs">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="w-24 shrink-0 font-semibold text-[#5B6770]">Tuyến dọc:</dt>
              <dd className="text-[#1A2229]">{point.gridRef.vertical}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="w-24 shrink-0 font-semibold text-[#5B6770]">Tuyến ngang:</dt>
              <dd className="text-[#1A2229]">{point.gridRef.horizontal}</dd>
            </div>
          </dl>
        </section>

        {/* How to Locate */}
        <section>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#1A2229]">
            <Hand className="h-4 w-4 text-[#C63131]" />
            <span>Cách xác định bằng tay / que dò</span>
          </div>
          <p className="text-sm leading-relaxed text-[#2F3A42]">{point.howToLocate}</p>
        </section>

        {/* Indications */}
        <section>
          <h3 className="mb-2 text-xs font-bold tracking-wide text-[#5B6770] uppercase">
            Công dụng & Triệu chứng hỗ trợ
          </h3>
          <ul className="space-y-1.5">
            {point.indications.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 rounded-lg bg-[#F9F8F6] px-3 py-2 text-xs leading-relaxed text-[#1A2229]"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B6B46]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Cautions */}
        {point.cautions && point.cautions.length > 0 && (
          <section className="rounded-xl border border-amber-300 bg-amber-50/90 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#B45309]">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Lưu ý quan trọng khi tác động</span>
            </div>
            <ul className="space-y-1 text-xs leading-relaxed text-amber-950">
              {point.cautions.map((caution, idx) => (
                <li key={idx}>{caution}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Academic Reference Verification Badge */}
        <div className="flex items-start gap-2 rounded-xl border border-[#EFECE7] bg-[#F9F8F6]/70 p-2.5 text-[11px] leading-relaxed text-[#5B6770]">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1B6B46]" />
          <span>
            Tọa độ tham khảo cốt lõi Diện Chẩn Bùi Quốc Châu. Khi thực hành luôn dò điểm báo đau nhất (sinh huyệt) trong vùng tọa độ trên da mặt.
          </span>
        </div>
      </div>
    </div>
  );
};

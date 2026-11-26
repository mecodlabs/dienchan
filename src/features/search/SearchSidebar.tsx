import React from 'react';
import { AlertTriangle, Search, Sparkles, X } from 'lucide-react';
import { formatLateralityLabel } from '@/domain/projection';
import { QUICK_SYMPTOM_CHIPS, REGION_FILTERS } from '@/domain/search';
import type { Acupoint, FaceRegion } from '@/domain/types';

interface SearchSidebarProps {
  query: string;
  region: FaceRegion | 'all';
  results: Acupoint[];
  selectedCode: string | null;
  onQueryChange: (query: string) => void;
  onRegionChange: (region: FaceRegion | 'all') => void;
  onSelectPoint: (point: Acupoint) => void;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  query,
  region,
  results,
  selectedCode,
  onQueryChange,
  onRegionChange,
  onSelectPoint,
}) => {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Search Input & Quick Filters */}
      <div className="shrink-0 space-y-3 border-b border-[#E2DDD3] bg-[#FAF8F4] p-3.5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#5B6770]" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Tìm số huyệt (19, 26), triệu chứng, tạng phủ..."
            aria-label="Tìm kiếm huyệt Diện Chẩn"
            className="w-full rounded-xl border border-[#D9D2C5] bg-white py-2 pr-8 pl-9 text-sm text-[#1A2229] placeholder-[#8A949C] shadow-2xs transition focus:border-[#1E6F64] focus:ring-2 focus:ring-[#1E6F64]/15 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Xóa từ khóa"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-0.5 text-[#5B6770] hover:bg-[#F0ECE3] hover:text-[#1A2229]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick Symptom Chips */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SYMPTOM_CHIPS.map((chip) => {
            const isActive = query.trim().toLowerCase() === chip.toLowerCase();
            return (
              <button
                key={chip}
                type="button"
                onClick={() => onQueryChange(isActive ? '' : chip)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition ${
                  isActive
                    ? 'border-[#1E6F64] bg-[#1E6F64] text-white'
                    : 'border-[#E2DDD3] bg-white text-[#4E5961] hover:border-[#1E6F64]/50 hover:text-[#1E6F64]'
                }`}
              >
                <Sparkles className="h-2.5 w-2.5 opacity-75" />
                {chip}
              </button>
            );
          })}
        </div>

        {/* Region Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {REGION_FILTERS.map((item) => {
            const isActive = region === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onRegionChange(item.id)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#1A2229] text-white'
                    : 'bg-[#ECE7DD] text-[#5B6770] hover:bg-[#E2DDD3] hover:text-[#1A2229]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Count Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#EFECE4] bg-white px-3.5 py-2 text-xs text-[#5B6770]">
        <span>
          Hiển thị <strong className="font-semibold text-[#1A2229]">{results.length}</strong> huyệt
        </span>
        {(query || region !== 'all') && (
          <button
            type="button"
            onClick={() => {
              onQueryChange('');
              onRegionChange('all');
            }}
            className="font-medium text-[#C84B31] hover:underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Results List */}
      <div
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white p-2"
      >
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-2 rounded-full bg-[#F5F3EE] p-3 text-[#8A949C]">
              <Search className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-[#1A2229]">Không tìm thấy huyệt phù hợp</p>
            <p className="mt-1 text-xs text-[#5B6770]">
              Thử tìm theo số huyệt (vd: 26, 124, 19) hoặc triệu chứng ngắn như “đau đầu”, “ngủ”.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {results.map((point) => {
              const isSelected = point.code === selectedCode;
              const isUnilateral =
                point.laterality === 'left' || point.laterality === 'right';
              const hasCaution = Boolean(point.cautions && point.cautions.length > 0);

              return (
                <li key={point.code}>
                  <button
                    type="button"
                    onClick={() => onSelectPoint(point)}
                    className={`group w-full rounded-xl border p-2.5 text-left transition ${
                      isSelected
                        ? 'border-[#C84B31] bg-[#C84B31]/6 shadow-2xs'
                        : 'border-transparent bg-[#FAF8F4]/75 hover:border-[#DED8CC] hover:bg-[#FAF8F4]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`flex h-9 min-w-[40px] shrink-0 items-center justify-center rounded-lg px-1.5 font-mono text-sm font-bold transition ${
                          isSelected
                            ? 'bg-[#C84B31] text-white'
                            : 'border border-[#DED8CC] bg-white text-[#1A2229] group-hover:border-[#1E6F64] group-hover:text-[#1E6F64]'
                        }`}
                      >
                        {point.code}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="truncate text-sm font-semibold text-[#1A2229]">
                            {point.name}
                          </span>
                          {hasCaution && (
                            <AlertTriangle
                              className="h-3.5 w-3.5 shrink-0 text-[#B45309]"
                              aria-label="Có lưu ý đặc biệt"
                            />
                          )}
                        </div>

                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="rounded bg-[#ECE7DD] px-1.5 py-0.5 font-medium text-[#4E5961]">
                            {point.regionLabel}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 font-medium ${
                              isUnilateral
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-[#1E6F64]/10 text-[#1E6F64]'
                            }`}
                          >
                            {formatLateralityLabel(point.laterality)}
                          </span>
                        </div>

                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#5B6770]">
                          {point.indications.slice(0, 2).join(' · ')}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

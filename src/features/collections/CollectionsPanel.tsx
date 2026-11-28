import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  FolderPlus,
  Layers,
  Pencil,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { DEFAULT_ALL_COLLECTION_ID } from '@/data/acupointRepository';
import type { PointCollection } from '@/domain/types';

interface CollectionsPanelProps {
  userCollections: PointCollection[];
  builtinProtocols: PointCollection[];
  activeCollectionId: string | null;
  selectedCode: string | null;
  onActivateCollection: (collection: PointCollection | null) => void;
  onSelectPointCode: (code: string) => void;
  onCreateCollection: (name: string, description: string, pointCodes?: string[]) => void;
  onRenameCollection: (id: string, name: string) => void;
  onDeleteCollection: (id: string) => void;
  onRemovePointFromCollection: (collectionId: string, code: string) => void;
  onReorderPointInCollection: (
    collectionId: string,
    code: string,
    direction: 'up' | 'down'
  ) => void;
  onDuplicateProtocol: (protocol: PointCollection) => void;
  onExportJson: () => void;
  onImportJson: (jsonText: string) => { ok: boolean; message: string };
}

const PREVIEW_CHIP_LIMIT = 12;

function getCardClassName(isActive: boolean, inactiveBg: 'white' | 'warm' = 'white'): string {
  if (isActive) {
    return 'cursor-pointer rounded-xl border-2 border-[#145235] bg-[#1B6B46]/15 p-3 shadow-sm ring-1 ring-[#1B6B46]/20 transition-all';
  }
  return inactiveBg === 'warm'
    ? 'cursor-pointer rounded-xl border border-[#E6E2DA] bg-[#F9F8F6]/70 p-3 transition-all hover:border-[#BEB5A4] hover:bg-[#F9F8F6]'
    : 'cursor-pointer rounded-xl border border-[#E6E2DA] bg-white p-3 transition-all hover:border-[#BEB5A4] hover:bg-[#F9F8F6]/70';
}

const ActiveBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-[#145235] px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
    <Check className="h-3 w-3 stroke-[3]" />
    <span>Đang chọn</span>
  </span>
);

export const CollectionsPanel: React.FC<CollectionsPanelProps> = ({
  userCollections,
  builtinProtocols,
  activeCollectionId,
  selectedCode,
  onActivateCollection,
  onSelectPointCode,
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
  onRemovePointFromCollection,
  onReorderPointInCollection,
  onDuplicateProtocol,
  onExportJson,
  onImportJson,
}) => {
  const [isCreating, setIsCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');
  const [managingId, setManagingId] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [statusNotice, setStatusNotice] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const fullAtlasCollection = React.useMemo(
    () => builtinProtocols.find((p) => p.id === DEFAULT_ALL_COLLECTION_ID) ?? null,
    [builtinProtocols]
  );

  const coreProtocols = React.useMemo(
    () => builtinProtocols.filter((p) => p.id !== DEFAULT_ALL_COLLECTION_ID),
    [builtinProtocols]
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateCollection(newName, newDesc, selectedCode ? [selectedCode] : []);
    setNewName('');
    setNewDesc('');
    setIsCreating(false);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = onImportJson(text);
      setStatusNotice({ type: res.ok ? 'success' : 'error', text: res.message });
    } catch {
      setStatusNotice({ type: 'error', text: 'Không thể đọc tệp vừa chọn.' });
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      className="custom-scrollbar flex h-full min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-white"
    >
      {/* Top Action Strip: Create / Export / Import */}
      <div className="shrink-0 space-y-2.5 border-b border-[#E6E2DA] bg-[#F9F8F6] p-3.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsCreating((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B6B46] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#155739]"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>Tạo danh sách mới</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onExportJson}
              title="Xuất danh sách cá nhân ra tệp JSON"
              className="inline-flex items-center gap-1 rounded-lg border border-[#DDD8CE] bg-white px-2 py-1.5 text-[11px] font-semibold text-[#1A2229] transition hover:bg-[#F9F8F6]"
            >
              <Download className="h-3.5 w-3.5 text-[#5B6770]" />
              <span>Xuất</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Nhập danh sách từ tệp JSON"
              className="inline-flex items-center gap-1 rounded-lg border border-[#DDD8CE] bg-white px-2 py-1.5 text-[11px] font-semibold text-[#1A2229] transition hover:bg-[#F9F8F6]"
            >
              <Upload className="h-3.5 w-3.5 text-[#5B6770]" />
              <span>Nhập</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileImport}
            />
          </div>
        </div>

        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="space-y-2 rounded-xl border border-[#1B6B46]/30 bg-white p-2.5 shadow-2xs"
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tên danh sách (vd: Huyệt mất ngủ của tôi)"
              autoFocus
              className="w-full rounded-lg border border-[#E2DDD5] px-2.5 py-1.5 text-xs text-[#1A2229] focus:border-[#1B6B46] focus:outline-none"
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Ghi chú ngắn (tùy chọn)"
              className="w-full rounded-lg border border-[#E2DDD5] px-2.5 py-1.5 text-xs text-[#1A2229] focus:border-[#1B6B46] focus:outline-none"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#5B6770] hover:bg-[#F9F8F6]"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="rounded-lg bg-[#1B6B46] px-3 py-1 text-xs font-semibold text-white hover:bg-[#155739] disabled:opacity-40"
              >
                Lưu danh sách
              </button>
            </div>
          </form>
        )}

        {statusNotice && (
          <div
            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
              statusNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <span>{statusNotice.text}</span>
            <button
              type="button"
              onClick={() => setStatusNotice(null)}
              className="ml-2 opacity-70 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Section 1: Default Full 257-Point Atlas */}
      {fullAtlasCollection && (() => {
        const isActive = activeCollectionId === fullAtlasCollection.id;
        return (
          <div className="p-3.5 pb-0">
            <div
              onClick={() => onActivateCollection(fullAtlasCollection)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onActivateCollection(fullAtlasCollection);
                }
              }}
              aria-pressed={isActive}
              className={getCardClassName(isActive, 'white')}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <Layers
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isActive ? 'text-[#145235]' : 'text-[#5B6770]'
                  }`}
                />
                <span
                  className={`text-sm font-bold ${
                    isActive ? 'text-[#0F3D27]' : 'text-[#1A2229]'
                  }`}
                >
                  {fullAtlasCollection.name}
                </span>
                {isActive && <ActiveBadge />}
              </div>
              <p
                className={`mt-1 text-xs leading-relaxed ${
                  isActive ? 'text-[#1B4332]' : 'text-[#5B6770]'
                }`}
              >
                {fullAtlasCollection.description}
              </p>
              <div
                className={`mt-2.5 flex items-center justify-between border-t pt-2 ${
                  isActive ? 'border-[#145235]/20' : 'border-[#EEECF0]'
                }`}
              >
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    isActive ? 'text-[#145235]' : 'text-[#5B6770]'
                  }`}
                >
                  {fullAtlasCollection.pointCodes.length} huyệt
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    isActive ? 'text-[#145235]' : 'text-[#7A858E]'
                  }`}
                >
                  Mặc định
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Section 2: User Saved Collections (right below Bộ 257 huyệt) */}
      <div className="space-y-2.5 p-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold tracking-wider text-[#5B6770] uppercase">
            Danh sách đã lưu của bạn ({userCollections.length})
          </h3>
        </div>

        {userCollections.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#E2DDD5] p-3 text-center text-xs text-[#5B6770]">
            Chưa có danh sách riêng. Nhấn “Tạo danh sách mới” hoặc nhân bản từ phác đồ bên dưới.
          </p>
        ) : (
          <div className="space-y-2.5">
            {userCollections.map((col) => {
              const isActive = activeCollectionId === col.id;
              const isManaging = managingId === col.id;
              const isEditingName = editingId === col.id;
              const isConfirmingDelete = confirmDeleteId === col.id;

              return (
                <div
                  key={col.id}
                  onClick={() => {
                    if (!isEditingName && !isConfirmingDelete) {
                      onActivateCollection(col);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (!isEditingName && !isConfirmingDelete && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onActivateCollection(col);
                    }
                  }}
                  aria-pressed={isActive}
                  className={getCardClassName(isActive, 'warm')}
                >
                  <div className="flex items-start justify-between gap-2">
                    {isEditingName ? (
                      <form
                        className="flex flex-1 items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (editName.trim()) {
                            onRenameCollection(col.id, editName.trim());
                          }
                          setEditingId(null);
                        }}
                      >
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          className="w-full rounded-md border border-[#1B6B46] bg-white px-2 py-1 text-xs font-semibold focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="rounded-md bg-[#1B6B46] px-2 py-1 text-[11px] font-semibold text-white"
                        >
                          Lưu
                        </button>
                      </form>
                    ) : (
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Layers
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isActive ? 'text-[#145235]' : 'text-[#5B6770]'
                            }`}
                          />
                          <span
                            className={`truncate text-sm font-bold ${
                              isActive ? 'text-[#0F3D27]' : 'text-[#1A2229]'
                            }`}
                          >
                            {col.name}
                          </span>
                          {isActive && <ActiveBadge />}
                        </div>
                        {col.description && (
                          <p
                            className={`mt-1 line-clamp-2 text-xs ${
                              isActive ? 'text-[#1B4332]' : 'text-[#5B6770]'
                            }`}
                          >
                            {col.description}
                          </p>
                        )}
                      </div>
                    )}

                    <div
                      className="flex shrink-0 items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-1.5 py-0.5">
                          <span className="text-[11px] font-semibold text-red-700">Xóa?</span>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteId(null);
                              onDeleteCollection(col.id);
                            }}
                            className="rounded bg-[#C63131] px-1.5 py-0.5 text-[11px] font-semibold text-white hover:bg-[#A62424]"
                          >
                            Xóa
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded px-1.5 py-0.5 text-[11px] font-medium text-[#5B6770] hover:bg-white"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            title="Đổi tên"
                            aria-label={`Đổi tên ${col.name}`}
                            onClick={() => {
                              setEditingId(col.id);
                              setEditName(col.name);
                              setConfirmDeleteId(null);
                            }}
                            className="rounded-md p-1 text-[#5B6770] hover:bg-white hover:text-[#1A2229]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Sắp xếp / Xóa bớt huyệt"
                            onClick={() => {
                              setManagingId(isManaging ? null : col.id);
                              setConfirmDeleteId(null);
                            }}
                            className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold transition ${
                              isManaging
                                ? 'bg-[#1A2229] text-white'
                                : 'text-[#5B6770] hover:bg-white hover:text-[#1A2229]'
                            }`}
                          >
                            {isManaging ? 'Xong' : 'Sửa'}
                          </button>
                          <button
                            type="button"
                            title="Xóa danh sách"
                            aria-label={`Xóa ${col.name}`}
                            onClick={() => setConfirmDeleteId(col.id)}
                            className="rounded-md p-1 text-[#5B6770] hover:bg-red-50 hover:text-[#C63131]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Acupoint Sequence Chips */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {col.pointCodes.length === 0 ? (
                      <span className="text-[11px] italic text-[#8A949C]">
                        Chưa có huyệt — chọn 1 huyệt rồi bấm “Lưu vào danh sách”.
                      </span>
                    ) : (
                      col.pointCodes.map((code, idx) => {
                        const isPointSelected = selectedCode === code;
                        return (
                          <div
                            key={`${col.id}-${code}-${idx}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`inline-flex items-center rounded-lg border text-xs font-semibold transition ${
                              isPointSelected
                                ? 'border-[#C63131] bg-[#C63131] text-white'
                                : isActive
                                  ? 'border-[#145235]/35 bg-white text-[#0F3D27]'
                                  : 'border-[#DDD8CE] bg-white text-[#1A2229]'
                            }`}
                          >
                            {isManaging && idx > 0 && (
                              <button
                                type="button"
                                onClick={() => onReorderPointInCollection(col.id, code, 'up')}
                                title="Đẩy lên trước"
                                className="px-1 py-1 opacity-70 hover:opacity-100"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (!isActive) onActivateCollection(col);
                                onSelectPointCode(code);
                              }}
                              className="px-2 py-0.5 font-mono"
                            >
                              {code}
                            </button>
                            {isManaging && idx < col.pointCodes.length - 1 && (
                              <button
                                type="button"
                                onClick={() => onReorderPointInCollection(col.id, code, 'down')}
                                title="Đẩy ra sau"
                                className="px-1 py-1 opacity-70 hover:opacity-100"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                            {isManaging && (
                              <button
                                type="button"
                                onClick={() => onRemovePointFromCollection(col.id, code)}
                                title={`Bỏ huyệt ${code}`}
                                className="border-l border-current/15 px-1.5 py-0.5 hover:text-[#C63131]"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div
                    className={`mt-2.5 flex items-center justify-between border-t pt-2 ${
                      isActive ? 'border-[#145235]/20' : 'border-[#E6E2DA]/70'
                    }`}
                  >
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        isActive ? 'text-[#145235]' : 'text-[#5B6770]'
                      }`}
                    >
                      {col.pointCodes.length} huyệt
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Built-in Core Protocols */}
      <div className="space-y-2.5 border-t border-[#E6E2DA] p-3.5">
        <h3 className="text-[11px] font-bold tracking-wider text-[#5B6770] uppercase">
          Phác đồ cơ bản tích hợp ({coreProtocols.length})
        </h3>

        <div className="space-y-2.5">
          {coreProtocols.map((proto) => {
            const isActive = activeCollectionId === proto.id;
            const visibleCodes =
              proto.pointCodes.length > PREVIEW_CHIP_LIMIT
                ? proto.pointCodes.slice(0, PREVIEW_CHIP_LIMIT)
                : proto.pointCodes;
            const hiddenCount = proto.pointCodes.length - visibleCodes.length;

            return (
              <div
                key={proto.id}
                onClick={() => onActivateCollection(proto)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onActivateCollection(proto);
                  }
                }}
                aria-pressed={isActive}
                className={getCardClassName(isActive, 'white')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Layers
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? 'text-[#145235]' : 'text-[#5B6770]'
                        }`}
                      />
                      <span
                        className={`text-sm font-bold ${
                          isActive ? 'text-[#0F3D27]' : 'text-[#1A2229]'
                        }`}
                      >
                        {proto.name}
                      </span>
                      {isActive && <ActiveBadge />}
                    </div>
                    <p
                      className={`mt-1 text-xs leading-relaxed ${
                        isActive ? 'text-[#1B4332]' : 'text-[#5B6770]'
                      }`}
                    >
                      {proto.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateProtocol(proto);
                    }}
                    title="Lưu thành danh sách riêng để tùy chỉnh"
                    className={`shrink-0 rounded-lg border p-1.5 transition ${
                      isActive
                        ? 'border-[#145235]/35 bg-white/80 text-[#145235] hover:bg-white'
                        : 'border-[#E6E2DA] bg-white text-[#5B6770] hover:border-[#1B6B46] hover:text-[#1B6B46]'
                    }`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {visibleCodes.map((code, idx) => {
                    const isPointSelected = selectedCode === code;
                    return (
                      <button
                        key={`${proto.id}-${code}-${idx}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isActive) onActivateCollection(proto);
                          onSelectPointCode(code);
                        }}
                        className={`rounded-lg border px-2 py-0.5 font-mono text-xs font-semibold transition ${
                          isPointSelected
                            ? 'border-[#C63131] bg-[#C63131] text-white'
                            : isActive
                              ? 'border-[#145235]/35 bg-white text-[#0F3D27] hover:border-[#145235]'
                              : 'border-[#E6E2DA] bg-[#F9F8F6] text-[#1A2229] hover:border-[#1B6B46]'
                        }`}
                      >
                        {code}
                      </button>
                    );
                  })}
                  {hiddenCount > 0 && (
                    <span
                      className={`inline-flex items-center rounded-lg px-2 py-0.5 font-mono text-[11px] font-semibold ${
                        isActive
                          ? 'bg-[#145235]/15 text-[#0F3D27]'
                          : 'bg-[#F1EFEA] text-[#5B6770]'
                      }`}
                    >
                      +{hiddenCount} huyệt
                    </span>
                  )}
                </div>

                <div
                  className={`mt-2.5 flex items-center justify-between border-t pt-2 ${
                    isActive ? 'border-[#145235]/20' : 'border-[#EEECF0]'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      isActive ? 'text-[#145235]' : 'text-[#5B6770]'
                    }`}
                  >
                    {proto.pointCodes.length} huyệt
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

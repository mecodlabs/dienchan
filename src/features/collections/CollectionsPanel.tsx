import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Download,
  FolderPlus,
  Layers,
  Pencil,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
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
  const [statusNotice, setStatusNotice] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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
    <div className="custom-scrollbar flex h-full min-h-0 flex-col overflow-y-auto bg-white">
      {/* Top Action Strip: Create / Export / Import */}
      <div className="shrink-0 space-y-2.5 border-b border-[#E2DDD3] bg-[#FAF8F4] p-3.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsCreating((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E6F64] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#17584F]"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>Tạo danh sách mới</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onExportJson}
              title="Xuất danh sách cá nhân ra tệp JSON"
              className="inline-flex items-center gap-1 rounded-lg border border-[#D9D2C5] bg-white px-2 py-1.5 text-[11px] font-semibold text-[#1A2229] transition hover:bg-[#F5F3EE]"
            >
              <Download className="h-3.5 w-3.5 text-[#5B6770]" />
              <span>Xuất</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Nhập danh sách từ tệp JSON"
              className="inline-flex items-center gap-1 rounded-lg border border-[#D9D2C5] bg-white px-2 py-1.5 text-[11px] font-semibold text-[#1A2229] transition hover:bg-[#F5F3EE]"
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
            className="space-y-2 rounded-xl border border-[#1E6F64]/30 bg-white p-2.5 shadow-2xs"
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tên danh sách (vd: Huyệt mất ngủ của tôi)"
              autoFocus
              className="w-full rounded-lg border border-[#DED8CC] px-2.5 py-1.5 text-xs text-[#1A2229] focus:border-[#1E6F64] focus:outline-none"
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Ghi chú ngắn (tùy chọn)"
              className="w-full rounded-lg border border-[#DED8CC] px-2.5 py-1.5 text-xs text-[#1A2229] focus:border-[#1E6F64] focus:outline-none"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#5B6770] hover:bg-[#F5F3EE]"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="rounded-lg bg-[#1E6F64] px-3 py-1 text-xs font-semibold text-white hover:bg-[#17584F] disabled:opacity-40"
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

      {/* Section 1: User Saved Collections */}
      <div className="space-y-2.5 p-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold tracking-wider text-[#5B6770] uppercase">
            Danh sách đã lưu của bạn ({userCollections.length})
          </h3>
        </div>

        {userCollections.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#DED8CC] p-3 text-center text-xs text-[#5B6770]">
            Chưa có danh sách riêng. Nhấn “Tạo danh sách mới” hoặc nhân bản từ phác đồ bên dưới.
          </p>
        ) : (
          <div className="space-y-2">
            {userCollections.map((col) => {
              const isActive = activeCollectionId === col.id;
              const isManaging = managingId === col.id;
              const isEditingName = editingId === col.id;

              return (
                <div
                  key={col.id}
                  className={`rounded-xl border p-3 transition ${
                    isActive
                      ? 'border-[#1E6F64] bg-[#1E6F64]/6 shadow-2xs'
                      : 'border-[#E2DDD3] bg-[#FAF8F4]/70 hover:border-[#CFC7B8]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {isEditingName ? (
                      <form
                        className="flex flex-1 items-center gap-1"
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
                          className="w-full rounded-md border border-[#1E6F64] bg-white px-2 py-1 text-xs font-semibold focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="rounded-md bg-[#1E6F64] px-2 py-1 text-[11px] font-semibold text-white"
                        >
                          Lưu
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onActivateCollection(isActive ? null : col)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center gap-1.5">
                          <Layers
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isActive ? 'text-[#1E6F64]' : 'text-[#5B6770]'
                            }`}
                          />
                          <span className="truncate text-sm font-semibold text-[#1A2229]">
                            {col.name}
                          </span>
                        </div>
                        {col.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-[#5B6770]">
                            {col.description}
                          </p>
                        )}
                      </button>
                    )}

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        title="Đổi tên"
                        onClick={() => {
                          setEditingId(col.id);
                          setEditName(col.name);
                        }}
                        className="rounded-md p-1 text-[#5B6770] hover:bg-white hover:text-[#1A2229]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Sắp xếp / Xóa bớt huyệt"
                        onClick={() => setManagingId(isManaging ? null : col.id)}
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
                        onClick={() => onDeleteCollection(col.id)}
                        className="rounded-md p-1 text-[#5B6770] hover:bg-red-50 hover:text-[#C84B31]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
                            className={`inline-flex items-center rounded-lg border text-xs font-semibold transition ${
                              isPointSelected
                                ? 'border-[#C84B31] bg-[#C84B31] text-white'
                                : 'border-[#D9D2C5] bg-white text-[#1A2229]'
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
                              className="px-2 py-1 font-mono"
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
                                className="border-l border-current/15 px-1.5 py-1 hover:text-[#C84B31]"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-[#E2DDD3]/70 pt-2">
                    <span className="font-mono text-[11px] text-[#5B6770]">
                      {col.pointCodes.length} huyệt
                    </span>
                    <button
                      type="button"
                      onClick={() => onActivateCollection(isActive ? null : col)}
                      className={`text-xs font-semibold transition ${
                        isActive ? 'text-[#C84B31]' : 'text-[#1E6F64] hover:underline'
                      }`}
                    >
                      {isActive ? 'Đang chiếu trên mặt · Tắt' : 'Chiếu bộ huyệt trên mặt →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Built-in Core Protocols */}
      <div className="space-y-2.5 border-t border-[#E2DDD3] p-3.5">
        <h3 className="text-[11px] font-bold tracking-wider text-[#5B6770] uppercase">
          Phác đồ cơ bản tích hợp ({builtinProtocols.length})
        </h3>

        <div className="space-y-2">
          {builtinProtocols.map((proto) => {
            const isActive = activeCollectionId === proto.id;
            return (
              <div
                key={proto.id}
                className={`rounded-xl border p-3 transition ${
                  isActive
                    ? 'border-[#1E6F64] bg-[#1E6F64]/6 shadow-2xs'
                    : 'border-[#E2DDD3] bg-white hover:border-[#CFC7B8]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onActivateCollection(isActive ? null : proto)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="text-sm font-semibold text-[#1A2229]">{proto.name}</div>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#5B6770]">
                      {proto.description}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateProtocol(proto)}
                    title="Lưu thành danh sách riêng để tùy chỉnh"
                    className="shrink-0 rounded-lg border border-[#E2DDD3] p-1.5 text-[#5B6770] transition hover:border-[#1E6F64] hover:text-[#1E6F64]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {proto.pointCodes.map((code, idx) => {
                    const isPointSelected = selectedCode === code;
                    return (
                      <button
                        key={`${proto.id}-${code}-${idx}`}
                        type="button"
                        onClick={() => {
                          if (!isActive) onActivateCollection(proto);
                          onSelectPointCode(code);
                        }}
                        className={`rounded-lg border px-2 py-1 font-mono text-xs font-semibold transition ${
                          isPointSelected
                            ? 'border-[#C84B31] bg-[#C84B31] text-white'
                            : 'border-[#E2DDD3] bg-[#FAF8F4] text-[#1A2229] hover:border-[#1E6F64]'
                        }`}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-[#EFECE4] pt-2">
                  <span className="font-mono text-[11px] text-[#5B6770]">
                    {proto.pointCodes.length} huyệt
                  </span>
                  <button
                    type="button"
                    onClick={() => onActivateCollection(isActive ? null : proto)}
                    className={`text-xs font-semibold transition ${
                      isActive ? 'text-[#C84B31]' : 'text-[#1E6F64] hover:underline'
                    }`}
                  >
                    {isActive ? 'Đang chiếu trên mặt · Tắt' : 'Chiếu bộ huyệt trên mặt →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

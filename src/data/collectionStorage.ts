import type { PointCollection } from '@/domain/types';

export const COLLECTIONS_STORAGE_KEY = 'dienchan.collections.v1';

const STARTER_COLLECTION: PointCollection = {
  id: 'user-starter-favorites',
  name: 'Huyệt hay dùng của tôi',
  description: 'Danh sách huyệt cá nhân để lưu nhanh và tra cứu lại các huyệt bạn thường sử dụng.',
  pointCodes: ['26', '124', '127', '0'],
  isBuiltin: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `col-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `col-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function getSafeStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function loadUserCollections(): PointCollection[] {
  const storage = getSafeStorage();
  if (!storage) return [STARTER_COLLECTION];

  const raw = storage.getItem(COLLECTIONS_STORAGE_KEY);
  if (!raw) {
    saveUserCollections([STARTER_COLLECTION]);
    return [STARTER_COLLECTION];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [STARTER_COLLECTION];
    return parsed.filter(isValidCollectionShape).map((c) => ({ ...c, isBuiltin: false }));
  } catch {
    return [STARTER_COLLECTION];
  }
}

export function saveUserCollections(collections: PointCollection[]): void {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    storage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function createCollection(
  collections: PointCollection[],
  name: string,
  description = '',
  pointCodes: string[] = []
): { next: PointCollection[]; created: PointCollection } {
  const now = new Date().toISOString();
  const created: PointCollection = {
    id: generateId(),
    name: name.trim() || 'Danh sách huyệt mới',
    description: description.trim(),
    pointCodes: Array.from(new Set(pointCodes)),
    isBuiltin: false,
    createdAt: now,
    updatedAt: now,
  };
  const next = [created, ...collections];
  saveUserCollections(next);
  return { next, created };
}

export function updateCollection(
  collections: PointCollection[],
  id: string,
  patch: Partial<Pick<PointCollection, 'name' | 'description' | 'pointCodes'>>
): PointCollection[] {
  const now = new Date().toISOString();
  const next = collections.map((col) =>
    col.id === id
      ? {
          ...col,
          ...patch,
          updatedAt: now,
        }
      : col
  );
  saveUserCollections(next);
  return next;
}

export function deleteCollection(
  collections: PointCollection[],
  id: string
): PointCollection[] {
  const next = collections.filter((col) => col.id !== id);
  saveUserCollections(next);
  return next;
}

export function togglePointInCollection(
  collections: PointCollection[],
  collectionId: string,
  pointCode: string
): PointCollection[] {
  const target = collections.find((c) => c.id === collectionId);
  if (!target) return collections;

  const exists = target.pointCodes.includes(pointCode);
  const nextCodes = exists
    ? target.pointCodes.filter((c) => c !== pointCode)
    : [...target.pointCodes, pointCode];

  return updateCollection(collections, collectionId, { pointCodes: nextCodes });
}

export function reorderPointInCollection(
  collections: PointCollection[],
  collectionId: string,
  pointCode: string,
  direction: 'up' | 'down'
): PointCollection[] {
  const target = collections.find((c) => c.id === collectionId);
  if (!target) return collections;

  const idx = target.pointCodes.indexOf(pointCode);
  if (idx === -1) return collections;

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= target.pointCodes.length) return collections;

  const nextCodes = [...target.pointCodes];
  [nextCodes[idx], nextCodes[swapIdx]] = [nextCodes[swapIdx], nextCodes[idx]];
  return updateCollection(collections, collectionId, { pointCodes: nextCodes });
}

export function exportCollectionsJson(collections: PointCollection[]): string {
  return JSON.stringify(
    {
      format: 'dien-chan-atlas-collections',
      version: 1,
      exportedAt: new Date().toISOString(),
      collections,
    },
    null,
    2
  );
}

function isValidCollectionShape(item: unknown): item is PointCollection {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.pointCodes) &&
    obj.pointCodes.every((c) => typeof c === 'string')
  );
}

export function parseImportedCollectionsJson(
  jsonText: string
): { ok: true; collections: PointCollection[] } | { ok: false; error: string } {
  try {
    const parsed: unknown = JSON.parse(jsonText);
    const rawList = Array.isArray(parsed)
      ? parsed
      : parsed &&
          typeof parsed === 'object' &&
          Array.isArray((parsed as { collections?: unknown }).collections)
        ? (parsed as { collections: unknown[] }).collections
        : null;

    if (!rawList) {
      return {
        ok: false,
        error: 'Tệp JSON không đúng định dạng danh sách bộ huyệt (thiếu mảng collections).',
      };
    }

    const valid = rawList.filter(isValidCollectionShape).map((c) => ({
      ...c,
      id: generateId(),
      description: typeof c.description === 'string' ? c.description : '',
      pointCodes: Array.from(new Set(c.pointCodes)),
      isBuiltin: false,
      createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    if (valid.length === 0) {
      return {
        ok: false,
        error: 'Không tìm thấy bộ huyệt hợp lệ nào trong tệp JSON.',
      };
    }

    return { ok: true, collections: valid };
  } catch {
    return {
      ok: false,
      error: 'Không thể đọc tệp JSON — vui lòng kiểm tra cú pháp tệp.',
    };
  }
}

import React from 'react';
import {
  BookOpen,
  ChevronDown,
  Info,
  Layers,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import {
  BUILTIN_PROTOCOLS,
  CORE_ACUPOINTS,
  GRID_LINES,
  getAcupointByCode,
  resolveCollectionAcupoints,
} from '@/data/acupointRepository';
import {
  createCollection,
  deleteCollection,
  exportCollectionsJson,
  loadUserCollections,
  parseImportedCollectionsJson,
  reorderPointInCollection,
  saveUserCollections,
  togglePointInCollection,
  updateCollection,
} from '@/data/collectionStorage';
import { getFocusTarget, projectAcupointsForView } from '@/domain/projection';
import { searchAcupoints } from '@/domain/search';
import type { Acupoint, FaceRegion, FaceView, PointCollection } from '@/domain/types';
import { CollectionsPanel } from '@/features/collections/CollectionsPanel';
import {
  FaceMapViewport,
  type FaceMapViewportHandle,
} from '@/features/face-map/FaceMapViewport';
import { MapToolbar } from '@/features/face-map/MapToolbar';
import { AcupointDetailSheet } from '@/features/inspector/AcupointDetailSheet';
import { SearchSidebar } from '@/features/search/SearchSidebar';

type SidebarTab = 'search' | 'collections';
type MobileSheetMode = 'closed' | 'search' | 'collections' | 'detail';

export function App() {
  const viewportRef = React.useRef<FaceMapViewportHandle | null>(null);

  // Map view & overlay states
  const [view, setView] = React.useState<FaceView>('front');
  const [showGrid, setShowGrid] = React.useState(true);
  const [showLabels, setShowLabels] = React.useState(true);
  const [mapScale, setMapScale] = React.useState(0.75);

  // Selection & hover states
  const [selectedCode, setSelectedCode] = React.useState<string | null>(null);
  const [hoveredCode, setHoveredCode] = React.useState<string | null>(null);

  // Search & sidebar states
  const [sidebarTab, setSidebarTab] = React.useState<SidebarTab>('search');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [regionFilter, setRegionFilter] = React.useState<FaceRegion | 'all'>('all');

  // Collections & active protocol mode
  const [userCollections, setUserCollections] = React.useState<PointCollection[]>(() =>
    loadUserCollections()
  );
  const [activeCollectionId, setActiveCollectionId] = React.useState<string | null>(null);

  // Mobile sheet & Info popover states
  const [mobileSheet, setMobileSheet] = React.useState<MobileSheetMode>('closed');
  const [showInfoPopover, setShowInfoPopover] = React.useState(false);

  // Derived data
  const markers = React.useMemo(
    () => projectAcupointsForView(CORE_ACUPOINTS, view),
    [view]
  );

  const gridLines = React.useMemo(() => GRID_LINES[view], [view]);

  const filteredAcupoints = React.useMemo(
    () => searchAcupoints(CORE_ACUPOINTS, searchQuery, regionFilter),
    [searchQuery, regionFilter]
  );

  const selectedPoint = React.useMemo(
    () => (selectedCode ? getAcupointByCode(selectedCode) ?? null : null),
    [selectedCode]
  );

  const activeCollection = React.useMemo(() => {
    if (!activeCollectionId) return null;
    return (
      userCollections.find((c) => c.id === activeCollectionId) ??
      BUILTIN_PROTOCOLS.find((p) => p.id === activeCollectionId) ??
      null
    );
  }, [activeCollectionId, userCollections]);

  const activeCollectionPoints = React.useMemo(
    () => (activeCollection ? resolveCollectionAcupoints(activeCollection.pointCodes) : []),
    [activeCollection]
  );

  // Focus & fly-to helper
  const focusPoint = React.useCallback(
    (point: Acupoint, desiredScale = 1.75) => {
      setSelectedCode(point.code);
      const target = getFocusTarget(point, view);
      if (!target) return;

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
      const focusYRatio = isMobile ? 0.25 : 0.5;
      const scaleToUse = isMobile ? Math.min(desiredScale, 1.45) : desiredScale;

      if (target.view !== view) {
        setView(target.view);
        requestAnimationFrame(() => {
          viewportRef.current?.flyTo(target.x, target.y, scaleToUse, focusYRatio);
        });
      } else {
        viewportRef.current?.flyTo(target.x, target.y, scaleToUse, focusYRatio);
      }
    },
    [view]
  );

  const handleSelectMarker = React.useCallback((code: string, x: number, y: number) => {
    setSelectedCode(code);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    viewportRef.current?.flyTo(
      x,
      y,
      isMobile ? 1.45 : 1.75,
      isMobile ? 0.25 : 0.5
    );
    if (isMobile) {
      setMobileSheet('detail');
    }
  }, []);

  const handleSelectPointFromList = React.useCallback(
    (point: Acupoint) => {
      focusPoint(point);
      if (window.innerWidth < 1024) {
        setMobileSheet('detail');
      }
    },
    [focusPoint]
  );

  const handleSelectPointCode = React.useCallback(
    (code: string) => {
      const point = getAcupointByCode(code);
      if (point) {
        focusPoint(point);
        if (window.innerWidth < 1024) {
          setMobileSheet('detail');
        }
      }
    },
    [focusPoint]
  );

  const handleActivateCollection = React.useCallback(
    (collection: PointCollection | null) => {
      if (!collection) {
        setActiveCollectionId(null);
        return;
      }
      setActiveCollectionId(collection.id);
      if (collection.pointCodes.length > 0) {
        const firstPoint = getAcupointByCode(collection.pointCodes[0]);
        if (firstPoint) {
          setSelectedCode(firstPoint.code);
        }
      }
      viewportRef.current?.resetView();
      if (window.innerWidth < 1024) {
        setMobileSheet('closed');
      }
    },
    []
  );

  // User Collection CRUD handlers
  const handleCreateCollection = React.useCallback(
    (name: string, description: string, pointCodes: string[] = []) => {
      const { next, created } = createCollection(userCollections, name, description, pointCodes);
      setUserCollections(next);
      setActiveCollectionId(created.id);
    },
    [userCollections]
  );

  const handleCreateCollectionWithPoint = React.useCallback(
    (name: string, pointCode: string) => {
      const { next } = createCollection(userCollections, name, '', [pointCode]);
      setUserCollections(next);
    },
    [userCollections]
  );

  const handleRenameCollection = React.useCallback(
    (id: string, name: string) => {
      setUserCollections((prev) => updateCollection(prev, id, { name }));
    },
    []
  );

  const handleDeleteCollection = React.useCallback(
    (id: string) => {
      setUserCollections((prev) => deleteCollection(prev, id));
      if (activeCollectionId === id) {
        setActiveCollectionId(null);
      }
    },
    [activeCollectionId]
  );

  const handleTogglePointInCollection = React.useCallback(
    (collectionId: string, pointCode: string) => {
      setUserCollections((prev) => togglePointInCollection(prev, collectionId, pointCode));
    },
    []
  );

  const handleReorderPoint = React.useCallback(
    (collectionId: string, pointCode: string, direction: 'up' | 'down') => {
      setUserCollections((prev) =>
        reorderPointInCollection(prev, collectionId, pointCode, direction)
      );
    },
    []
  );

  const handleDuplicateProtocol = React.useCallback(
    (protocol: PointCollection) => {
      const { next, created } = createCollection(
        userCollections,
        `${protocol.name} (Bản riêng)`,
        protocol.description,
        protocol.pointCodes
      );
      setUserCollections(next);
      setActiveCollectionId(created.id);
    },
    [userCollections]
  );

  const handleExportJson = React.useCallback(() => {
    const json = exportCollectionsJson(userCollections);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dien-chan-bo-huyet-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [userCollections]);

  const handleImportJson = React.useCallback(
    (jsonText: string) => {
      const parsed = parseImportedCollectionsJson(jsonText);
      if (!parsed.ok) {
        return { ok: false, message: parsed.error };
      }
      const merged = [...parsed.collections, ...userCollections];
      saveUserCollections(merged);
      setUserCollections(merged);
      return {
        ok: true,
        message: `Đã nhập thành công ${parsed.collections.length} danh sách huyệt.`,
      };
    },
    [userCollections]
  );

  const handleChangeView = React.useCallback((nextView: FaceView) => {
    setView(nextView);
    requestAnimationFrame(() => {
      viewportRef.current?.resetView();
    });
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#F5F3EE] text-[#1A2229]">
      {/* Compact Top Bar */}
      <header className="relative z-30 flex h-13 shrink-0 items-center justify-between border-b border-[#E2DDD3] bg-white/95 px-3.5 backdrop-blur-md sm:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#C84B31] to-[#9E2D17] text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-[#1A2229] sm:text-base">
                Diện Chẩn Atlas
              </h1>
              <span className="hidden rounded-md bg-[#1E6F64]/12 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#1E6F64] sm:inline-block">
                {CORE_ACUPOINTS.length} huyệt cốt lõi
              </span>
            </div>
            <p className="hidden text-[11px] text-[#5B6770] sm:block">
              Tra cứu đồ hình & bộ huyệt Bùi Quốc Châu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 rounded-xl border border-[#EFECE4] bg-[#FAF8F4] px-3 py-1 text-[11px] text-[#5B6770] md:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1E6F64]" />
              Đối xứng / Trục giữa
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-[#D97706] bg-white" />
              Đơn bên (37, 39, 50, 41)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowInfoPopover((v) => !v)}
            aria-label="Hướng dẫn định hướng trái phải và lưu ý sử dụng"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
              showInfoPopover
                ? 'border-[#1A2229] bg-[#1A2229] text-white'
                : 'border-[#DED8CC] bg-white text-[#5B6770] hover:text-[#1A2229]'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quy ước & Lưu ý</span>
          </button>
        </div>

        {/* Reference & Laterality Info Popover */}
        {showInfoPopover && (
          <div className="absolute top-14 right-3 z-50 w-[min(92vw,380px)] rounded-2xl border border-[#DED8CC] bg-white p-4 shadow-xl sm:right-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1A2229]">
                <BookOpen className="h-4 w-4 text-[#1E6F64]" />
                <span>Quy ước đồ hình Diện Chẩn</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoPopover(false)}
                className="rounded-md p-1 text-[#5B6770] hover:bg-[#F5F3EE]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-[#4E5961]">
              <li>
                <strong>1. Trái / Phải theo người bệnh:</strong> Trên đồ hình Chính diện, nửa bên{' '}
                <em>trái màn hình</em> là bên <strong>Phải của người bệnh</strong> (chứa Gan{' '}
                <code className="font-mono font-semibold">50</code>, Mật{' '}
                <code className="font-mono font-semibold">41</code>); nửa bên{' '}
                <em>phải màn hình</em> là bên <strong>Trái của người bệnh</strong> (chứa Tỳ{' '}
                <code className="font-mono font-semibold">37</code>, Bao tử{' '}
                <code className="font-mono font-semibold">39</code>).
              </li>
              <li>
                <strong>2. Thao tác trên đồ hình:</strong> Kéo để di chuyển, cuộn chuột hoặc chụm 2 ngón tay để phóng to/thu nhỏ, nhấp đúp để phóng nhanh.
              </li>
              <li>
                <strong>3. Tính chất tham khảo:</strong> Bản MVP nạp trước {CORE_ACUPOINTS.length} huyệt thông dụng nhất. Khi thực hành luôn kết hợp dò sinh huyệt thực tế và lưu ý các huyệt ảnh hưởng huyết áp (<code className="font-mono font-semibold">19</code>, <code className="font-mono font-semibold">26</code>).
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Main 3-Pane Workspace */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop Left Sidebar (Search + Saved Collections) */}
        <aside className="hidden w-[348px] shrink-0 flex-col border-r border-[#E2DDD3] bg-white lg:flex">
          <div className="grid shrink-0 grid-cols-2 gap-1 border-b border-[#E2DDD3] bg-[#FAF8F4] p-2">
            <button
              type="button"
              onClick={() => setSidebarTab('search')}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
                sidebarTab === 'search'
                  ? 'bg-white text-[#1A2229] shadow-xs'
                  : 'text-[#5B6770] hover:text-[#1A2229]'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Tra cứu huyệt</span>
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('collections')}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
                sidebarTab === 'collections'
                  ? 'bg-white text-[#1A2229] shadow-xs'
                  : 'text-[#5B6770] hover:text-[#1A2229]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>
                Bộ huyệt ({userCollections.length + BUILTIN_PROTOCOLS.length})
              </span>
            </button>
          </div>

          <div className="min-h-0 flex-1">
            {sidebarTab === 'search' ? (
              <SearchSidebar
                query={searchQuery}
                region={regionFilter}
                results={filteredAcupoints}
                selectedCode={selectedCode}
                onQueryChange={setSearchQuery}
                onRegionChange={setRegionFilter}
                onSelectPoint={handleSelectPointFromList}
              />
            ) : (
              <CollectionsPanel
                userCollections={userCollections}
                builtinProtocols={BUILTIN_PROTOCOLS}
                activeCollectionId={activeCollectionId}
                selectedCode={selectedCode}
                onActivateCollection={handleActivateCollection}
                onSelectPointCode={handleSelectPointCode}
                onCreateCollection={handleCreateCollection}
                onRenameCollection={handleRenameCollection}
                onDeleteCollection={handleDeleteCollection}
                onRemovePointFromCollection={handleTogglePointInCollection}
                onReorderPointInCollection={handleReorderPoint}
                onDuplicateProtocol={handleDuplicateProtocol}
                onExportJson={handleExportJson}
                onImportJson={handleImportJson}
              />
            )}
          </div>
        </aside>

        {/* Center Interactive 2D Pseudo-3D Face Map */}
        <main className="relative min-w-0 flex-1">
          <FaceMapViewport
            ref={viewportRef}
            view={view}
            markers={markers}
            gridLines={gridLines}
            showGrid={showGrid}
            showLabels={showLabels}
            selectedCode={selectedCode}
            hoveredCode={hoveredCode}
            activeCollection={activeCollection}
            onSelectMarker={handleSelectMarker}
            onHoverMarker={setHoveredCode}
            onClearSelection={() => {
              setSelectedCode(null);
              if (mobileSheet === 'detail') setMobileSheet('closed');
            }}
            onScaleChange={setMapScale}
          />

          <MapToolbar
            view={view}
            showGrid={showGrid}
            showLabels={showLabels}
            scale={mapScale}
            activeCollection={activeCollection}
            collectionPoints={activeCollectionPoints}
            selectedCode={selectedCode}
            onChangeView={handleChangeView}
            onToggleGrid={() => setShowGrid((v) => !v)}
            onToggleLabels={() => setShowLabels((v) => !v)}
            onZoomIn={() => viewportRef.current?.zoomIn()}
            onZoomOut={() => viewportRef.current?.zoomOut()}
            onResetView={() => viewportRef.current?.resetView()}
            onSelectCollectionPoint={handleSelectPointCode}
            onClearCollection={() => setActiveCollectionId(null)}
          />

          {/* Mobile Quick Dock Buttons (Bottom Left, only when no protocol bar & sheet closed) */}
          {mobileSheet === 'closed' && (
            <div
              className={`pointer-events-auto absolute left-3 z-20 flex items-center gap-2 lg:hidden ${
                activeCollection ? 'bottom-16' : 'bottom-3'
              }`}
            >
              <button
                type="button"
                onClick={() => setMobileSheet('search')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DED8CC] bg-white/95 px-3 py-2 text-xs font-semibold text-[#1A2229] shadow-md backdrop-blur-md"
              >
                <Search className="h-3.5 w-3.5 text-[#C84B31]" />
                <span>Tra cứu</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileSheet('collections')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DED8CC] bg-white/95 px-3 py-2 text-xs font-semibold text-[#1A2229] shadow-md backdrop-blur-md"
              >
                <Layers className="h-3.5 w-3.5 text-[#1E6F64]" />
                <span>Bộ huyệt</span>
              </button>
              {selectedPoint && (
                <button
                  type="button"
                  onClick={() => setMobileSheet('detail')}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#C84B31] px-3 py-2 font-mono text-xs font-bold text-white shadow-md"
                >
                  <span>Huyệt {selectedPoint.code}</span>
                </button>
              )}
            </div>
          )}
        </main>

        {/* Desktop Right Inspector Pane (opens cleanly when an acupoint is selected) */}
        {selectedPoint && (
          <aside className="hidden w-[360px] shrink-0 flex-col border-l border-[#E2DDD3] bg-white lg:flex">
            <AcupointDetailSheet
              point={selectedPoint}
              currentView={view}
              userCollections={userCollections}
              onClose={() => setSelectedCode(null)}
              onFocusOnMap={(pt) => focusPoint(pt, 2.0)}
              onTogglePointInCollection={handleTogglePointInCollection}
              onCreateCollectionWithPoint={handleCreateCollectionWithPoint}
            />
          </aside>
        )}

        {/* Mobile Bottom Drawer */}
        {mobileSheet !== 'closed' && (
          <div className="fixed inset-x-0 bottom-0 z-40 flex max-h-[54dvh] flex-col rounded-t-3xl border-t border-[#DED8CC] bg-white shadow-2xl lg:hidden">
            {/* Drawer Handle + Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#EFECE4] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileSheet('search')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    mobileSheet === 'search'
                      ? 'bg-[#1A2229] text-white'
                      : 'text-[#5B6770]'
                  }`}
                >
                  Tra cứu
                </button>
                <button
                  type="button"
                  onClick={() => setMobileSheet('collections')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    mobileSheet === 'collections'
                      ? 'bg-[#1A2229] text-white'
                      : 'text-[#5B6770]'
                  }`}
                >
                  Bộ huyệt
                </button>
                {selectedPoint && (
                  <button
                    type="button"
                    onClick={() => setMobileSheet('detail')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      mobileSheet === 'detail'
                        ? 'bg-[#C84B31] text-white'
                        : 'text-[#C84B31]'
                    }`}
                  >
                    Huyệt {selectedPoint.code}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileSheet('closed')}
                aria-label="Thu gọn bảng dưới"
                className="rounded-lg p-1.5 text-[#5B6770] hover:bg-[#F5F3EE]"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              {mobileSheet === 'search' && (
                <SearchSidebar
                  query={searchQuery}
                  region={regionFilter}
                  results={filteredAcupoints}
                  selectedCode={selectedCode}
                  onQueryChange={setSearchQuery}
                  onRegionChange={setRegionFilter}
                  onSelectPoint={handleSelectPointFromList}
                />
              )}
              {mobileSheet === 'collections' && (
                <CollectionsPanel
                  userCollections={userCollections}
                  builtinProtocols={BUILTIN_PROTOCOLS}
                  activeCollectionId={activeCollectionId}
                  selectedCode={selectedCode}
                  onActivateCollection={handleActivateCollection}
                  onSelectPointCode={handleSelectPointCode}
                  onCreateCollection={handleCreateCollection}
                  onRenameCollection={handleRenameCollection}
                  onDeleteCollection={handleDeleteCollection}
                  onRemovePointFromCollection={handleTogglePointInCollection}
                  onReorderPointInCollection={handleReorderPoint}
                  onDuplicateProtocol={handleDuplicateProtocol}
                  onExportJson={handleExportJson}
                  onImportJson={handleImportJson}
                />
              )}
              {mobileSheet === 'detail' && selectedPoint && (
                <AcupointDetailSheet
                  point={selectedPoint}
                  currentView={view}
                  userCollections={userCollections}
                  onClose={() => setMobileSheet('closed')}
                  onFocusOnMap={(pt) => focusPoint(pt, 1.9)}
                  onTogglePointInCollection={handleTogglePointInCollection}
                  onCreateCollectionWithPoint={handleCreateCollectionWithPoint}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

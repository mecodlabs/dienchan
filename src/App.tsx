import React from 'react';
import {
  BookOpen,
  Download,
  Info,
  Layers,
  PanelLeftClose,
  Search,
  X,
} from 'lucide-react';
import {
  ALL_ACUPOINTS,
  BUILTIN_PROTOCOLS,
  CORE_ACUPOINTS,
  DEFAULT_ALL_COLLECTION_ID,
  GRID_LINES,
  getAcupointByCode,
  resolveCollectionAcupoints,
} from '@/data/acupointRepository';
import {
  createCollection,
  deleteCollection,
  exportCollectionsJson,
  loadActiveCollectionId,
  loadUserCollections,
  parseImportedCollectionsJson,
  reorderPointInCollection,
  saveActiveCollectionId,
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
import { PwaInstallPrompt } from '@/features/pwa/PwaInstallPrompt';
import { usePwaInstall } from '@/features/pwa/usePwaInstall';
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

  // Search & sidebar states (default to Bộ huyệt tab, collapsible on desktop)
  const [sidebarTab, setSidebarTab] = React.useState<SidebarTab>('collections');
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true);
  const [datasetScope, setDatasetScope] = React.useState<'all' | 'core'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [regionFilter, setRegionFilter] = React.useState<FaceRegion | 'all'>('all');

  // Collections & active protocol mode (defaults to "Bộ 257 huyệt (2010)" if user hasn't picked another)
  const [userCollections, setUserCollections] = React.useState<PointCollection[]>(() =>
    loadUserCollections()
  );
  const [activeCollectionId, setActiveCollectionIdState] = React.useState<string>(() => {
    const initialUserCols = loadUserCollections();
    const saved = loadActiveCollectionId(DEFAULT_ALL_COLLECTION_ID);
    const exists =
      initialUserCols.some((c) => c.id === saved) ||
      BUILTIN_PROTOCOLS.some((p) => p.id === saved);
    return exists ? saved : DEFAULT_ALL_COLLECTION_ID;
  });

  const setActiveCollectionId = React.useCallback((nextId: string | null) => {
    const resolved = nextId ?? DEFAULT_ALL_COLLECTION_ID;
    setActiveCollectionIdState(resolved);
    saveActiveCollectionId(resolved);
  }, []);

  // Mobile sheet & Info popover states
  const [mobileSheet, setMobileSheet] = React.useState<MobileSheetMode>('closed');
  const [mobileSheetExpanded, setMobileSheetExpanded] = React.useState(false);
  const [sheetDragY, setSheetDragY] = React.useState(0);
  const sheetDragStartYRef = React.useRef<number | null>(null);
  const [showInfoPopover, setShowInfoPopover] = React.useState(false);
  const infoPopoverRef = React.useRef<HTMLDivElement | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const pwa = usePwaInstall();

  const closeMobileSheet = React.useCallback(() => {
    setMobileSheet('closed');
    setMobileSheetExpanded(false);
    setSheetDragY(0);
  }, []);

  const handleSheetTouchStart = React.useCallback((e: React.TouchEvent) => {
    sheetDragStartYRef.current = e.touches[0].clientY;
    setSheetDragY(0);
  }, []);

  const handleSheetTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (sheetDragStartYRef.current === null) return;
    const dy = e.touches[0].clientY - sheetDragStartYRef.current;
    // Allow smooth downward visual drag feedback
    setSheetDragY(Math.max(-40, dy));
  }, []);

  const handleSheetTouchEnd = React.useCallback(() => {
    if (sheetDragStartYRef.current === null) return;
    const dy = sheetDragY;
    sheetDragStartYRef.current = null;
    setSheetDragY(0);

    if (dy > 55) {
      if (mobileSheetExpanded && dy < 140) {
        setMobileSheetExpanded(false);
      } else {
        closeMobileSheet();
      }
    } else if (dy < -45) {
      setMobileSheetExpanded(true);
    }
  }, [sheetDragY, mobileSheetExpanded, closeMobileSheet]);

  // Derived data
  const activeDataset = React.useMemo(
    () => (datasetScope === 'all' ? ALL_ACUPOINTS : CORE_ACUPOINTS),
    [datasetScope]
  );

  const mapDataset = React.useMemo(
    () =>
      activeCollectionId !== DEFAULT_ALL_COLLECTION_ID
        ? ALL_ACUPOINTS
        : activeDataset,
    [activeCollectionId, activeDataset]
  );

  const markers = React.useMemo(
    () => projectAcupointsForView(mapDataset, view),
    [mapDataset, view]
  );

  const gridLines = React.useMemo(() => GRID_LINES[view], [view]);

  const filteredAcupoints = React.useMemo(
    () => searchAcupoints(activeDataset, searchQuery, regionFilter),
    [activeDataset, searchQuery, regionFilter]
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
      if (
        activeCollectionId !== DEFAULT_ALL_COLLECTION_ID &&
        activeCollection &&
        !activeCollection.pointCodes.includes(point.code)
      ) {
        setActiveCollectionId(DEFAULT_ALL_COLLECTION_ID);
      }
      focusPoint(point);
      if (window.innerWidth < 1024) {
        setMobileSheet('detail');
      }
    },
    [activeCollectionId, activeCollection, setActiveCollectionId, focusPoint]
  );

  const handleClearSelection = React.useCallback(() => {
    setSelectedCode(null);
    setMobileSheet((prev) => {
      if (prev !== 'closed') {
        setMobileSheetExpanded(false);
        setSheetDragY(0);
        return 'closed';
      }
      return prev;
    });
  }, []);

  // Close Info popover on outside pointerdown
  React.useEffect(() => {
    if (!showInfoPopover) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (infoPopoverRef.current && !infoPopoverRef.current.contains(e.target as Node)) {
        setShowInfoPopover(false);
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [showInfoPopover]);

  // Global keyboard shortcuts (Escape, /, +, -, 0)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pwa.showGuideModal) {
          pwa.closeGuideModal();
          return;
        }
        if (showInfoPopover) {
          setShowInfoPopover(false);
          return;
        }
        if (mobileSheet !== 'closed') {
          closeMobileSheet();
          return;
        }
        if (selectedCode) {
          setSelectedCode(null);
        }
        return;
      }

      const target = e.target as HTMLElement | null;
      const isEditable =
        target !== null &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isEditable || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '/') {
        e.preventDefault();
        setIsDesktopSidebarOpen(true);
        setSidebarTab('search');
        requestAnimationFrame(() => searchInputRef.current?.focus());
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        viewportRef.current?.zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        viewportRef.current?.zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        viewportRef.current?.resetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pwa.showGuideModal, pwa.closeGuideModal, showInfoPopover, mobileSheet, selectedCode, closeMobileSheet]);

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
      if (!collection || collection.id === DEFAULT_ALL_COLLECTION_ID) {
        setActiveCollectionId(DEFAULT_ALL_COLLECTION_ID);
        setDatasetScope('all');
        viewportRef.current?.resetView();
        if (window.innerWidth < 1024) {
          setMobileSheet('closed');
        }
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
    [setActiveCollectionId]
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
    <div className="flex h-dvh flex-col overflow-hidden bg-[#F9F8F6] text-[#1A2229]">
      {/* Compact Top Bar */}
      <header className="relative z-30 flex h-13 shrink-0 items-center justify-between border-b border-[#E6E2DA] bg-white/95 px-3.5 backdrop-blur-md sm:px-5">
        <div className="flex items-center gap-2.5">
          <img
            src="/icons/icon-192.png"
            alt="Diện Chẩn Atlas"
            className="h-8 w-8 shrink-0 rounded-xl shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-[#1A2229] sm:text-base">
                Diện Chẩn Atlas
              </h1>
              <span className="hidden max-w-[240px] truncate rounded-md bg-[#1B6B46]/12 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#1B6B46] sm:inline-block">
                {activeCollectionId !== DEFAULT_ALL_COLLECTION_ID && activeCollection
                  ? `${activeCollection.name} · ${activeCollection.pointCodes.length} huyệt`
                  : datasetScope === 'all'
                    ? `${ALL_ACUPOINTS.length} huyệt (2010)`
                    : `${CORE_ACUPOINTS.length} huyệt cốt lõi`}
              </span>
            </div>
            <p className="hidden text-[11px] text-[#5B6770] sm:block">
              Tra cứu đồ hình & bộ huyệt Bùi Quốc Châu
            </p>
          </div>
        </div>

        <div ref={infoPopoverRef} className="flex items-center gap-2">
          {!pwa.isStandalone && (
            <button
              type="button"
              onClick={() => void pwa.triggerInstall()}
              aria-label="Thêm ứng dụng vào màn hình chính"
              title="Thêm ứng dụng vào màn hình chính điện thoại"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#1B6B46]/35 bg-[#1B6B46]/8 px-2.5 py-1.5 text-xs font-semibold text-[#145235] transition hover:bg-[#1B6B46] hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cài app</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowInfoPopover((v) => !v)}
            aria-label="Hướng dẫn định hướng trái phải và lưu ý sử dụng"
            aria-expanded={showInfoPopover}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
              showInfoPopover
                ? 'border-[#1A2229] bg-[#1A2229] text-white'
                : 'border-[#E2DDD5] bg-white text-[#5B6770] hover:text-[#1A2229]'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quy ước & Lưu ý</span>
          </button>

          {/* Reference & Laterality Info Popover */}
          {showInfoPopover && (
            <div className="absolute top-14 right-3 z-50 w-[min(92vw,380px)] rounded-2xl border border-[#E2DDD5] bg-white p-4 shadow-xl sm:right-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1A2229]">
                  <BookOpen className="h-4 w-4 text-[#1B6B46]" />
                  <span>Quy ước đồ hình Diện Chẩn</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInfoPopover(false)}
                  aria-label="Đóng hộp thoại quy ước"
                  className="rounded-md p-1 text-[#5B6770] hover:bg-[#F9F8F6]"
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
                  <strong>2. Thao tác trên đồ hình:</strong> Kéo để di chuyển, cuộn chuột hoặc chụm 2 ngón tay để phóng to/thu nhỏ, nhấp đúp để phóng nhanh. Phím tắt: <code className="font-mono font-semibold">/</code> tìm huyệt, <code className="font-mono font-semibold">+</code>/<code className="font-mono font-semibold">-</code>/<code className="font-mono font-semibold">0</code> thu phóng, <code className="font-mono font-semibold">Esc</code> đóng.
                </li>
                <li>
                  <strong>3. Tính chất tham khảo:</strong> Khi thực hành luôn kết hợp dò sinh huyệt thực tế và lưu ý các huyệt ảnh hưởng huyết áp (<code className="font-mono font-semibold">19</code>, <code className="font-mono font-semibold">26</code>).
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Smart PWA Install Banner (mobile) & Step-by-Step Guide Modal */}
      <PwaInstallPrompt pwa={pwa} />

      {/* Main 3-Pane Workspace */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop Left Sidebar (Collapsible: Bộ huyệt first, Tra cứu second) */}
        {isDesktopSidebarOpen && (
          <aside className="hidden w-[348px] shrink-0 flex-col border-r border-[#E6E2DA] bg-white lg:flex">
            <div className="flex shrink-0 items-center gap-1.5 border-b border-[#E6E2DA] bg-[#F9F8F6] p-2">
              <div className="grid flex-1 grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setSidebarTab('collections')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
                    sidebarTab === 'collections'
                      ? 'bg-[#1B6B46] text-white shadow-xs'
                      : 'text-[#5B6770] hover:bg-white/70 hover:text-[#1A2229]'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>
                    Bộ huyệt ({userCollections.length + BUILTIN_PROTOCOLS.length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab('search')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
                    sidebarTab === 'search'
                      ? 'bg-[#1A2229] text-white shadow-xs'
                      : 'text-[#5B6770] hover:bg-white/70 hover:text-[#1A2229]'
                  }`}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Tra cứu huyệt</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsDesktopSidebarOpen(false)}
                title="Thu gọn thanh bên để mở rộng đồ hình"
                aria-label="Thu gọn thanh bên"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E2DDD5] bg-white text-[#5B6770] transition hover:border-[#1A2229] hover:text-[#1A2229]"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1">
              {sidebarTab === 'collections' ? (
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
              ) : (
                <SearchSidebar
                  query={searchQuery}
                  region={regionFilter}
                  datasetScope={datasetScope}
                  totalAllCount={ALL_ACUPOINTS.length}
                  totalCoreCount={CORE_ACUPOINTS.length}
                  results={filteredAcupoints}
                  selectedCode={selectedCode}
                  inputRef={searchInputRef}
                  onQueryChange={setSearchQuery}
                  onRegionChange={setRegionFilter}
                  onDatasetScopeChange={setDatasetScope}
                  onSelectPoint={handleSelectPointFromList}
                />
              )}
            </div>
          </aside>
        )}

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
            onClearSelection={handleClearSelection}
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
            isDesktopSidebarOpen={isDesktopSidebarOpen}
            onOpenDesktopSidebar={() => setIsDesktopSidebarOpen(true)}
            onChangeView={handleChangeView}
            onToggleGrid={() => setShowGrid((v) => !v)}
            onToggleLabels={() => setShowLabels((v) => !v)}
            onZoomIn={() => viewportRef.current?.zoomIn()}
            onZoomOut={() => viewportRef.current?.zoomOut()}
            onResetView={() => viewportRef.current?.resetView()}
            onSelectCollectionPoint={handleSelectPointCode}
            onClearCollection={() => setActiveCollectionId(DEFAULT_ALL_COLLECTION_ID)}
          />

          {/* Mobile Quick Dock Buttons (Bộ huyệt first, Tra cứu second) */}
          {mobileSheet === 'closed' && (
            <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-20 flex items-center gap-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
              <button
                type="button"
                onClick={() => setMobileSheet('collections')}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-[#DAD5CB] bg-white/96 px-3 py-2.5 text-xs font-semibold text-[#1A2229] shadow-md backdrop-blur-md active:bg-[#F9F8F6]"
              >
                <Layers className="h-4 w-4 shrink-0 text-[#1B6B46]" />
                <span>Bộ huyệt</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileSheet('search')}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-[#DAD5CB] bg-white/96 px-3 py-2.5 text-xs font-semibold text-[#1A2229] shadow-md backdrop-blur-md active:bg-[#F9F8F6]"
              >
                <Search className="h-4 w-4 shrink-0 text-[#C63131]" />
                <span>Tra cứu</span>
              </button>
              {selectedPoint && (
                <button
                  type="button"
                  onClick={() => setMobileSheet('detail')}
                  className="inline-flex shrink-0 items-center justify-center gap-1 rounded-2xl bg-[#C63131] px-3.5 py-2.5 font-mono text-xs font-bold text-white shadow-md active:bg-[#A62424]"
                >
                  <span>Huyệt {selectedPoint.code}</span>
                </button>
              )}
            </div>
          )}
        </main>

        {/* Desktop Right Inspector Pane (opens cleanly when an acupoint is selected) */}
        {selectedPoint && (
          <aside className="hidden w-[360px] shrink-0 flex-col border-l border-[#E6E2DA] bg-white lg:flex">
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

        {/* Mobile Tap-Outside Scrim for Search & Collections Sheets */}
        {(mobileSheet === 'search' || mobileSheet === 'collections') && (
          <div
            onClick={closeMobileSheet}
            aria-hidden="true"
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] lg:hidden"
          />
        )}

        {/* Mobile Bottom Drawer (swipe-down to close + tap-outside scrim + clear X button) */}
        {mobileSheet !== 'closed' && (
          <div
            style={{
              touchAction: 'pan-y',
              transform: sheetDragY > 0 ? `translateY(${sheetDragY}px)` : undefined,
            }}
            className={`fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-3xl border-t border-[#E2DDD5] bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl lg:hidden ${
              sheetDragY === 0 ? 'transition-[height,transform] duration-200' : ''
            } ${mobileSheetExpanded ? 'h-[82dvh]' : 'h-[58dvh]'}`}
          >
            {/* Swipeable Handle + Header Area */}
            <div
              onTouchStart={handleSheetTouchStart}
              onTouchMove={handleSheetTouchMove}
              onTouchEnd={handleSheetTouchEnd}
              className="shrink-0 select-none"
              style={{ touchAction: 'none' }}
            >
              {/* Drawer Drag Handle */}
              <button
                type="button"
                onClick={() => setMobileSheetExpanded((v) => !v)}
                aria-label={mobileSheetExpanded ? 'Thu gọn chiều cao bảng' : 'Mở rộng chiều cao bảng'}
                className="flex w-full items-center justify-center pt-2.5 pb-1.5"
              >
                <span className="h-1.5 w-11 rounded-full bg-[#CFC8BA]" />
              </button>

              {/* Drawer Header (Bộ huyệt first, Tra cứu second) */}
              <div className="flex items-center justify-between border-b border-[#EEECF0] px-3.5 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMobileSheet('collections')}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                      mobileSheet === 'collections'
                        ? 'bg-[#1B6B46] text-white'
                        : 'text-[#5B6770]'
                    }`}
                  >
                    Bộ huyệt
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileSheet('search')}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                      mobileSheet === 'search'
                        ? 'bg-[#1A2229] text-white'
                        : 'text-[#5B6770]'
                    }`}
                  >
                    Tra cứu
                  </button>
                  {selectedPoint && (
                    <button
                      type="button"
                      onClick={() => setMobileSheet('detail')}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                        mobileSheet === 'detail'
                          ? 'bg-[#C63131] text-white'
                          : 'text-[#C63131]'
                      }`}
                    >
                      Huyệt {selectedPoint.code}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMobileSheetExpanded((v) => !v)}
                    className="rounded-lg border border-[#E6E2DA] px-2.5 py-1.5 text-[11px] font-semibold text-[#5B6770] active:bg-[#F9F8F6]"
                  >
                    {mobileSheetExpanded ? 'Thu nhỏ' : 'Mở rộng'}
                  </button>
                  <button
                    type="button"
                    onClick={closeMobileSheet}
                    aria-label="Đóng bảng dưới"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1EFEA] text-[#1A2229] transition active:bg-[#1A2229] active:text-white"
                  >
                    <X className="h-4.5 w-4.5 stroke-[2.4]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {mobileSheet === 'search' && (
                <SearchSidebar
                  query={searchQuery}
                  region={regionFilter}
                  datasetScope={datasetScope}
                  totalAllCount={ALL_ACUPOINTS.length}
                  totalCoreCount={CORE_ACUPOINTS.length}
                  results={filteredAcupoints}
                  selectedCode={selectedCode}
                  inputRef={searchInputRef}
                  onQueryChange={setSearchQuery}
                  onRegionChange={setRegionFilter}
                  onDatasetScopeChange={setDatasetScope}
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

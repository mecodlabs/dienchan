import React from 'react';
import { MAP_HEIGHT, MAP_WIDTH } from '@/domain/projection';
import type {
  FaceView,
  GridLine,
  PointCollection,
  RenderedMarker,
  ViewportTransform,
} from '@/domain/types';
import {
  clampTransform,
  computeFlyToTransform,
  fitViewport,
  zoomAtPoint,
} from '@/domain/viewport';
import { AcupointLayer } from './AcupointLayer';
import { FaceIllustrationFront } from './FaceIllustrationFront';
import { FaceIllustrationSide } from './FaceIllustrationSide';
import { GridOverlay } from './GridOverlay';

export interface FaceMapViewportHandle {
  flyTo: (
    mapX: number,
    mapY: number,
    desiredScale?: number,
    verticalFocusRatio?: number
  ) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

interface FaceMapViewportProps {
  view: FaceView;
  markers: RenderedMarker[];
  gridLines: GridLine[];
  showGrid: boolean;
  showLabels: boolean;
  selectedCode: string | null;
  hoveredCode: string | null;
  activeCollection: PointCollection | null;
  onSelectMarker: (code: string, x: number, y: number) => void;
  onHoverMarker: (code: string | null) => void;
  onClearSelection: () => void;
  onScaleChange: (scale: number) => void;
}

export const FaceMapViewport = React.forwardRef<FaceMapViewportHandle, FaceMapViewportProps>(
  function FaceMapViewport(
    {
      view,
      markers,
      gridLines,
      showGrid,
      showLabels,
      selectedCode,
      hoveredCode,
      activeCollection,
      onSelectMarker,
      onHoverMarker,
      onClearSelection,
      onScaleChange,
    },
    ref
  ) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [transform, setTransform] = React.useState<ViewportTransform>({
      x: 0,
      y: 0,
      scale: 0.75,
    });

    const transformRef = React.useRef(transform);
    transformRef.current = transform;

    const animFrameRef = React.useRef<number | null>(null);
    const hasInteractedRef = React.useRef(false);
    const [isDragging, setIsDragging] = React.useState(false);

    // Track active pointers for smooth mouse drag & two-finger pinch/pan
    const activePointersRef = React.useRef<
      Map<number, { x: number; y: number }>
    >(new Map());
    const dragOriginRef = React.useRef<{
      pointerX: number;
      pointerY: number;
      startX: number;
      startY: number;
      moved: boolean;
    } | null>(null);
    const pinchOriginRef = React.useRef<{
      dist: number;
      midX: number;
      midY: number;
      startTransform: ViewportTransform;
    } | null>(null);

    const cancelAnimation = React.useCallback(() => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    }, []);

    const applyTransform = React.useCallback(
      (next: ViewportTransform) => {
        transformRef.current = next;
        setTransform(next);
        onScaleChange(next.scale);
      },
      [onScaleChange]
    );

    const animateTo = React.useCallback(
      (target: ViewportTransform, durationMs = 420) => {
        cancelAnimation();
        const start = transformRef.current;
        const startTime = performance.now();

        const tick = (now: number) => {
          const elapsed = now - startTime;
          const t = Math.min(1, elapsed / durationMs);
          // Cubic ease-out
          const eased = 1 - Math.pow(1 - t, 3);
          const next: ViewportTransform = {
            x: start.x + (target.x - start.x) * eased,
            y: start.y + (target.y - start.y) * eased,
            scale: start.scale + (target.scale - start.scale) * eased,
          };
          applyTransform(next);
          if (t < 1) {
            animFrameRef.current = requestAnimationFrame(tick);
          } else {
            animFrameRef.current = null;
          }
        };

        animFrameRef.current = requestAnimationFrame(tick);
      },
      [applyTransform, cancelAnimation]
    );

    // Fit map inside container on mount & resize
    React.useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const updateFit = () => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        if (!hasInteractedRef.current) {
          applyTransform(fitViewport(rect.width, rect.height));
        } else {
          applyTransform(clampTransform(transformRef.current, rect.width, rect.height));
        }
      };

      updateFit();
      const observer = new ResizeObserver(updateFit);
      observer.observe(el);
      return () => {
        observer.disconnect();
        cancelAnimation();
      };
    }, [applyTransform, cancelAnimation]);

    // Imperative API for parent components
    React.useImperativeHandle(
      ref,
      () => ({
        flyTo: (
          mapX: number,
          mapY: number,
          desiredScale = 1.75,
          verticalFocusRatio = 0.5
        ) => {
          const el = containerRef.current;
          if (!el) return;
          hasInteractedRef.current = true;
          const rect = el.getBoundingClientRect();
          const target = computeFlyToTransform(
            mapX,
            mapY,
            rect.width,
            rect.height,
            desiredScale,
            verticalFocusRatio
          );
          animateTo(target, 450);
        },
        zoomIn: () => {
          const el = containerRef.current;
          if (!el) return;
          hasInteractedRef.current = true;
          const rect = el.getBoundingClientRect();
          const next = zoomAtPoint(
            transformRef.current,
            rect.width / 2,
            rect.height / 2,
            transformRef.current.scale * 1.32,
            rect.width,
            rect.height
          );
          animateTo(next, 220);
        },
        zoomOut: () => {
          const el = containerRef.current;
          if (!el) return;
          hasInteractedRef.current = true;
          const rect = el.getBoundingClientRect();
          const next = zoomAtPoint(
            transformRef.current,
            rect.width / 2,
            rect.height / 2,
            transformRef.current.scale / 1.32,
            rect.width,
            rect.height
          );
          animateTo(next, 220);
        },
        resetView: () => {
          const el = containerRef.current;
          if (!el) return;
          hasInteractedRef.current = false;
          const rect = el.getBoundingClientRect();
          animateTo(fitViewport(rect.width, rect.height), 360);
        },
      }),
      [animateTo]
    );

    // Non-passive wheel listener so browser page doesn't scroll/pinch-zoom
    React.useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        cancelAnimation();
        hasInteractedRef.current = true;

        const rect = el.getBoundingClientRect();
        const focalX = e.clientX - rect.left;
        const focalY = e.clientY - rect.top;

        // Trackpad pinch gestures send ctrlKey=true with smaller deltaY
        const zoomIntensity = e.ctrlKey ? 0.012 : 0.0022;
        const factor = Math.exp(-e.deltaY * zoomIntensity);
        const nextScale = transformRef.current.scale * factor;

        const next = zoomAtPoint(
          transformRef.current,
          focalX,
          focalY,
          nextScale,
          rect.width,
          rect.height
        );
        applyTransform(next);
      };

      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }, [applyTransform, cancelAnimation]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      cancelAnimation();

      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      activePointersRef.current.set(e.pointerId, { x: px, y: py });

      if (activePointersRef.current.size === 1) {
        dragOriginRef.current = {
          pointerX: px,
          pointerY: py,
          startX: transformRef.current.x,
          startY: transformRef.current.y,
          moved: false,
        };
        pinchOriginRef.current = null;
      } else if (activePointersRef.current.size === 2) {
        const pts = Array.from(activePointersRef.current.values());
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;
        dragOriginRef.current = null;
        pinchOriginRef.current = {
          dist: Math.max(10, dist),
          midX,
          midY,
          startTransform: transformRef.current,
        };
      }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activePointersRef.current.has(e.pointerId)) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      activePointersRef.current.set(e.pointerId, { x: px, y: py });

      if (activePointersRef.current.size === 2 && pinchOriginRef.current) {
        hasInteractedRef.current = true;
        const pts = Array.from(activePointersRef.current.values());
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;

        const { dist: startDist, midX: startMidX, midY: startMidY, startTransform } =
          pinchOriginRef.current;

        const nextScale = startTransform.scale * (dist / startDist);
        const zoomed = zoomAtPoint(startTransform, startMidX, startMidY, nextScale);
        const panned = clampTransform(
          {
            x: zoomed.x + (midX - startMidX),
            y: zoomed.y + (midY - startMidY),
            scale: zoomed.scale,
          },
          rect.width,
          rect.height
        );
        applyTransform(panned);
        return;
      }

      if (activePointersRef.current.size === 1 && dragOriginRef.current) {
        const dx = px - dragOriginRef.current.pointerX;
        const dy = py - dragOriginRef.current.pointerY;

        if (!dragOriginRef.current.moved && Math.hypot(dx, dy) > 5) {
          dragOriginRef.current.moved = true;
          setIsDragging(true);
          hasInteractedRef.current = true;
          try {
            el.setPointerCapture(e.pointerId);
          } catch {
            // Ignore capture errors on synthetic events
          }
        }

        if (dragOriginRef.current.moved) {
          const next = clampTransform(
            {
              x: dragOriginRef.current.startX + dx,
              y: dragOriginRef.current.startY + dy,
              scale: transformRef.current.scale,
            },
            rect.width,
            rect.height
          );
          applyTransform(next);
        }
      }
    };

    const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
      const wasMoved = dragOriginRef.current?.moved ?? false;
      activePointersRef.current.delete(e.pointerId);

      if (activePointersRef.current.size === 0) {
        dragOriginRef.current = null;
        pinchOriginRef.current = null;
        setIsDragging(false);
        try {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Ignore
        }

        // Clicking empty canvas background clears selection
        if (!wasMoved && e.target === e.currentTarget) {
          onClearSelection();
        }
      } else if (activePointersRef.current.size === 1) {
        const remaining = Array.from(activePointersRef.current.values())[0];
        pinchOriginRef.current = null;
        dragOriginRef.current = {
          pointerX: remaining.x,
          pointerY: remaining.y,
          startX: transformRef.current.x,
          startY: transformRef.current.y,
          moved: true,
        };
      }
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      hasInteractedRef.current = true;
      const rect = el.getBoundingClientRect();
      const focalX = e.clientX - rect.left;
      const focalY = e.clientY - rect.top;
      const targetScale =
        transformRef.current.scale >= 2.2
          ? fitViewport(rect.width, rect.height).scale
          : transformRef.current.scale * 1.65;
      const next = zoomAtPoint(
        transformRef.current,
        focalX,
        focalY,
        targetScale,
        rect.width,
        rect.height
      );
      animateTo(next, 300);
    };

    return (
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        onDoubleClick={handleDoubleClick}
        style={{ touchAction: 'none' }}
        className={`map-studio-canvas relative h-full w-full overflow-hidden select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Transformed SVG Surface */}
        <div
          style={{
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            transformOrigin: '0 0',
          }}
          className="will-change-transform"
        >
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            className="block overflow-visible"
            onClick={(e) => {
              // Clicking bare face background outside any marker deselects
              if ((e.target as Element).closest('[role="button"]') === null) {
                onClearSelection();
              }
            }}
          >
            {view === 'front' ? <FaceIllustrationFront /> : <FaceIllustrationSide />}
            <GridOverlay lines={gridLines} view={view} visible={showGrid} />
            <AcupointLayer
              view={view}
              markers={markers}
              selectedCode={selectedCode}
              hoveredCode={hoveredCode}
              activeCollection={activeCollection}
              showAllLabels={showLabels}
              scale={transform.scale}
              onSelect={onSelectMarker}
              onHover={onHoverMarker}
            />
          </svg>
        </div>
      </div>
    );
  }
);

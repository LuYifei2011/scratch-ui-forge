import { Box, Text, Flex, IconButton, HStack } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { FiSun, FiMoon, FiZoomIn, FiZoomOut, FiLayout } from 'react-icons/fi';
import { renderComponent, renderSvgToCanvas } from '@/core/SvgRenderer';
import { ComponentRegistry } from '@/core/ComponentRegistry';
import { useProjectStore } from '@/store/projectStore';
import { useEditorStore } from '@/store/editorStore';
import FrameStrip from './FrameStrip';
import stageUrl from '@/assets/stage.svg?url';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;
const clampZoom = (v: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v));
// stage.svg natural size in px
const STAGE_W = 479.43;
const STAGE_H = 398.43;

export default function PreviewCanvas() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const refreshCounter = useEditorStore((s) => s.refreshCounter);
  const activeVariant = useEditorStore((s) => s.activeVariant);
  const activePart = useEditorStore((s) => s.activePart);
  const node = useProjectStore((s) => s.nodes.find((n) => n.id === selectedNodeId));
  const globalThemeId = useProjectStore((s) => s.globalThemeId);

  const outerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewLight = useEditorStore((s) => s.previewLight);
  const setPreviewLight = useEditorStore((s) => s.setPreviewLight);
  const [zoom, setZoom] = useState(1);
  const [showStage, setShowStage] = useState(false);
  // offset is bound to a nodeId — when the node changes the canvas auto-centers
  const [pan, setPan] = useState<{ nodeId: string | undefined; x: number; y: number }>({
    nodeId: selectedNodeId ?? undefined,
    x: 0,
    y: 0,
  });
  const offset = useMemo(
    () => (pan.nodeId === (selectedNodeId ?? undefined) ? { x: pan.x, y: pan.y } : { x: 0, y: 0 }),
    [pan, selectedNodeId]
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const checkerBg = previewLight
    ? 'repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%) 50% / 20px 20px'
    : 'repeating-conic-gradient(#2D3748 0% 25%, #1A202C 0% 50%) 50% / 20px 20px';

  // Scroll-wheel zoom.
  // Deps include selectedNodeId so the effect re-runs when the outer div first
  // mounts (the initial render may show the "no selection" branch where
  // outerRef.current is null, so [] would miss the mount of the real div).
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      setZoom((z) => clampZoom(z * factor));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [selectedNodeId]);

  // Drag-to-pan
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y };
    setIsDragging(true);
  }, [offset]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPan({ nodeId: selectedNodeId ?? undefined, x: dragRef.current.ox + dx, y: dragRef.current.oy + dy });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, selectedNodeId]);

  // Render SVG to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !node || node.type !== 'component' || !node.componentType) {
      if (canvas) { canvas.width = 0; canvas.height = 0; }
      return;
    }

    const def = ComponentRegistry.get(node.componentType);
    if (!def) return;

    const variants = node.selectedVariants ?? def.variants.map((v) => v.name);
    const variant = activeVariant && variants.includes(activeVariant)
      ? activeVariant
      : variants[0] ?? def.variants[0]?.name;

    const partId = def.parts && activePart ? activePart : undefined;

    try {
      const svgString = renderComponent(
        node.componentType,
        node.paramValues ?? {},
        globalThemeId,
        variant,
        partId
      );
      renderSvgToCanvas(svgString, canvas, 0, 0, zoom).catch((err) => {
        console.error('Canvas render error:', err);
      });
    } catch (err) {
      console.error('Render error:', err);
    }
  }, [node, refreshCounter, activeVariant, activePart, globalThemeId, zoom]);

  if (!node || node.type !== 'component') {
    return (
      <Flex h="100%" align="center" justify="center" bg="bg.subtle">
        <Text fontSize="sm" color="gray.500">
          选择组件查看预览
        </Text>
      </Flex>
    );
  }

  return (
    <Box h="100%" display="flex" flexDirection="column" bg="bg.subtle">
      <Text fontSize="xs" fontWeight="bold" color="gray.500" px={3} py={2}>
        预览
      </Text>
      {/* Main preview area */}
      <Flex
        ref={outerRef}
        flex={1}
        align="center"
        justify="center"
        mx={3}
        mb={2}
        borderRadius="md"
        background={checkerBg}
        overflow="hidden"
        position="relative"
        cursor={isDragging ? 'grabbing' : 'grab'}
        onMouseDown={onMouseDown}
        userSelect="none"
      >
        {/* Toolbar */}
        <HStack gap={1} position="absolute" top={1} right={1} zIndex={1}>
          <Tooltip content={previewLight ? '切换深色背景' : '切换浅色背景'}>
            <IconButton
              aria-label="Toggle preview bg"
              size="xs"
              bg={previewLight ? 'blackAlpha.800' : 'whiteAlpha.800'}
              color={previewLight ? 'white' : 'black'}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setPreviewLight(!previewLight)}>
              {previewLight ? <FiMoon /> : <FiSun />}
            </IconButton>
          </Tooltip>
          <Tooltip content={showStage ? '隐藏舞台背景' : '叠加舞台背景'}>
            <IconButton
              aria-label="Toggle stage overlay"
              size="xs"
              bg={showStage ? 'brand.500' : 'blackAlpha.600'}
              color="white"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setShowStage((v) => !v)}>
              <FiLayout />
            </IconButton>
          </Tooltip>
          <Tooltip content="缩小 (滚轮)">
            <IconButton
              aria-label="Zoom out"
              size="xs"
              bg="blackAlpha.600"
              color="white"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setZoom((z) => clampZoom(z / 1.1))}>
              <FiZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip content="重置视图">
            <Box
              as="button"
              px="6px"
              h="24px"
              lineHeight="24px"
              fontSize="10px"
              bg="blackAlpha.600"
              color="white"
              borderRadius="sm"
              cursor="pointer"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => { setZoom(1); setPan({ nodeId: selectedNodeId ?? undefined, x: 0, y: 0 }); }}
            >
              {Math.round(zoom * 100)}%
            </Box>
          </Tooltip>
          <Tooltip content="放大 (滚轮)">
            <IconButton
              aria-label="Zoom in"
              size="xs"
              bg="blackAlpha.600"
              color="white"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setZoom((z) => clampZoom(z * 1.1))}>
              <FiZoomIn />
            </IconButton>
          </Tooltip>
        </HStack>
        {/* Stage overlay — behind the component canvas, shares the same pan/zoom.
            Use CSS scale() instead of width/height to avoid browser rasterization
            size limits at large zoom levels (GPU compositing has no pixel cap). */}
        {showStage && (
          <img
            src={stageUrl}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: `${STAGE_W}px`,
              height: `${STAGE_H}px`,
              maxWidth: 'none',
              transformOrigin: 'center center',
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) translate(0, -22px) scale(${zoom})`,
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 0,
            }}
            alt="stage"
          />
        )}
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            position: 'relative',
            zIndex: 1,
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            willChange: 'transform',
          }}
        />
      </Flex>
      {/* Frame strip */}
      <FrameStrip />
    </Box>
  );
}

import { Box, HStack, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { useColorModeValue } from '../ui/color-mode';
import { useEffect, useRef, useMemo } from 'react';
import { renderAllFrames, renderComponent, renderSvgToCanvas } from '@/core/SvgRenderer';
import { ComponentRegistry } from '@/core/ComponentRegistry';
import { useProjectStore } from '@/store/projectStore';
import { useEditorStore } from '@/store/editorStore';

interface FrameItem {
  key: string;
  svg: string;
  label: string;
  variantName: string;
  partId: string | null;
}

export default function FrameStrip() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const refreshCounter = useEditorStore((s) => s.refreshCounter);
  const activeVariant = useEditorStore((s) => s.activeVariant);
  const activePart = useEditorStore((s) => s.activePart);
  const setActiveFrame = useEditorStore((s) => s.setActiveFrame);
  const node = useProjectStore((s) => s.nodes.find((n) => n.id === selectedNodeId));
  const globalThemeId = useProjectStore((s) => s.globalThemeId);

  const frames = useMemo<FrameItem[]>(() => {
    if (!node || node.type !== 'component' || !node.componentType) return [];
    const def = ComponentRegistry.get(node.componentType);
    if (!def) return [];

    try {
      const allFrames = renderAllFrames(
        node.componentType,
        node.paramValues ?? {},
        globalThemeId,
        node.selectedVariants
      );

      const hasParts = def.parts && def.parts.length > 0;
      const result: FrameItem[] = [];

      if (hasParts) {
        // Group by variant — each variant gets a "combined" thumb first
        const variants = node.selectedVariants
          ? def.variants.filter((v) => node.selectedVariants!.includes(v.name))
          : def.variants;

        for (const v of variants) {
          // Combined view for this variant
          const combinedSvg = renderComponent(
            node.componentType,
            node.paramValues ?? {},
            globalThemeId,
            v.name
          );
          result.push({
            key: `${v.name}-combined`,
            svg: combinedSvg,
            label: `${v.label} — 组合`,
            variantName: v.name,
            partId: null,
          });
          // Part frames for this variant
          for (const frame of allFrames) {
            if (frame.variantName === v.name) {
              result.push({
                key: `${frame.variantName}-${frame.partId}`,
                svg: frame.svg,
                label: `${frame.variantLabel} — ${frame.partName}`,
                variantName: frame.variantName,
                partId: frame.partId ?? null,
              });
            }
          }
        }
      } else {
        for (const frame of allFrames) {
          result.push({
            key: frame.variantName,
            svg: frame.svg,
            label: frame.variantLabel,
            variantName: frame.variantName,
            partId: null,
          });
        }
      }

      return result;
    } catch {
      return [];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, refreshCounter, globalThemeId]);

  if (frames.length === 0) return null;

  return (
    <Box
      borderTop="1px solid"
      borderColor="border.emphasized"
      px={3}
      py={2}
      overflowX="auto"
    >
      <Text fontSize="2xs" color="gray.500" mb={1}>
        帧 ({frames.length})
      </Text>
      <HStack gap={2}>
        {frames.map((frame) => {
          const isActive =
            activeVariant === frame.variantName && activePart === frame.partId;
          // First frame is active when nothing is selected
          const isDefault = !activeVariant && !activePart && frame === frames[0];
          return (
            <FrameThumb
              key={frame.key}
              svg={frame.svg}
              label={frame.label}
              isActive={isActive || isDefault}
              onClick={() => setActiveFrame(frame.variantName, frame.partId)}
            />
          );
        })}
      </HStack>
    </Box>
  );
}

function FrameThumb({ svg, label, isActive, onClick }: { svg: string; label: string; isActive: boolean; onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeBorderColor = useColorModeValue('brand.500', 'brand.300');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      renderSvgToCanvas(svg, canvas, 56, 40).catch(console.error);
    }
  }, [svg]);

  return (
    <Tooltip content={label}>
      <Box
        as="button"
        w="64px"
        h="48px"
        bg="bg"
        borderRadius="md"
        border="2px solid"
        borderColor={isActive ? activeBorderColor : 'border.emphasized'}
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        flexShrink={0}
        p={1}
        cursor="pointer"
        _hover={{ borderColor: activeBorderColor }}
        onClick={onClick}
      >
        <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }} />
      </Box>
    </Tooltip>
  );
}

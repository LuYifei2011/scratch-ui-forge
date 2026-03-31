import { Box, HStack, Text } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { useColorModeValue } from "../ui/color-mode";
import { useEffect, useRef, useMemo } from "react";
import { renderSvgToCanvas } from "@/core/SvgRenderer";
import { ThemeRegistry } from "@/core/ThemeRegistry";
import { useProjectStore } from "@/store/projectStore";
import { useEditorStore } from "@/store/editorStore";
import type { CostumeOutput } from "@/core/types";

export default function FrameStrip() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const refreshCounter = useEditorStore((s) => s.refreshCounter);
  const activeCostumeIndex = useEditorStore((s) => s.activeCostumeIndex);
  const setActiveCostumeIndex = useEditorStore((s) => s.setActiveCostumeIndex);
  const node = useProjectStore((s) => s.nodes.find((n) => n.id === selectedNodeId));
  const globalThemeId = useProjectStore((s) => s.globalThemeId);
  const themeColors = useProjectStore((s) => s.themeColors);

  const costumes = useMemo<CostumeOutput[]>(() => {
    if (!node || node.type !== "component" || !node.componentType) return [];
    try {
      return ThemeRegistry.generateCostumes(
        globalThemeId,
        node.componentType,
        node.paramValues ?? {},
        themeColors
      );
    } catch {
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, refreshCounter, globalThemeId, themeColors]);

  if (costumes.length === 0) return null;

  return (
    <Box borderTop="1px solid" borderColor="border.emphasized" px={3} py={2} overflowX="auto">
      <Text fontSize="2xs" color="gray.500" mb={1}>
        造型 ({costumes.length})
      </Text>
      <HStack gap={2}>
        {costumes.map((costume, index) => (
          <CostumeThumb
            key={`${costume.name}-${index}`}
            svg={costume.svg}
            label={costume.name}
            isActive={activeCostumeIndex === index}
            onClick={() => setActiveCostumeIndex(index)}
          />
        ))}
      </HStack>
    </Box>
  );
}

function CostumeThumb({
  svg,
  label,
  isActive,
  onClick,
}: {
  svg: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeBorderColor = useColorModeValue("brand.500", "brand.300");

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
        borderColor={isActive ? activeBorderColor : "border.emphasized"}
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
        <canvas ref={canvasRef} style={{ display: "block", maxWidth: "100%", maxHeight: "100%" }} />
      </Box>
    </Tooltip>
  );
}

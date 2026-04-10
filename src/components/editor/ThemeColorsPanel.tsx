import { Box, HStack, VStack, Text, Input, Button, Accordion } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { ThemeRegistry } from "@/core/ThemeRegistry";
import { useProjectStore } from "@/store/projectStore";
import { useEditorStore } from "@/store/editorStore";
import type { ThemeColorDef } from "@/core/types";

interface ColorRowProps {
  def: ThemeColorDef;
  value: string;
  onChange: (value: string) => void;
}

function ColorRow({ def, value, onChange }: ColorRowProps) {
  return (
    <HStack justify="space-between" gap={2}>
      <Tooltip content={def.label} disabled={def.label.length <= 6}>
        <Text fontSize="xs" color="fg.subtle" flex={1} minW={0} truncate>
          {def.label}
        </Text>
      </Tooltip>
      <HStack gap={1} flexShrink={0}>
        <Input
          type="color"
          w="24px"
          h="24px"
          p={0}
          border="none"
          borderRadius="sm"
          cursor="pointer"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          size="xs"
          w="80px"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          fontFamily="mono"
          fontSize="xs"
        />
      </HStack>
    </HStack>
  );
}

export default function ThemeColorsPanel() {
  const globalThemeId = useProjectStore((s) => s.globalThemeId);
  const themeColors = useProjectStore((s) => s.themeColors);
  const setThemeColors = useProjectStore((s) => s.setThemeColors);
  const triggerRefresh = useEditorStore((s) => s.triggerRefresh);

  const theme = ThemeRegistry.get(globalThemeId);
  if (!theme) return null;

  const resolvedColors = ThemeRegistry.resolveColors(globalThemeId, themeColors);

  const applyPreset = (presetId: string) => {
    const preset = theme.colorPresets?.find((p) => p.id === presetId);
    if (!preset) return;
    setThemeColors({ ...preset.colors });
    triggerRefresh();
  };

  const setColor = (key: string, value: string) => {
    setThemeColors({ ...themeColors, [key]: value });
    triggerRefresh();
  };

  const resetColors = () => {
    setThemeColors({});
    triggerRefresh();
  };

  const brandDef = theme.brandColorKey
    ? theme.colorDefs.find((d) => d.key === theme.brandColorKey)
    : null;

  const otherDefs = theme.colorDefs.filter((d) => d.key !== theme.brandColorKey);

  return (
    <Box borderBottom="1px solid" borderColor="border.emphasized">
      <HStack
        px={3}
        py={2}
        justify="space-between"
        borderBottom="1px solid"
        borderColor="border.emphasized"
      >
        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
          主题颜色
        </Text>
        <Button size="xs" variant="ghost" colorPalette="gray" onClick={resetColors}>
          重置
        </Button>
      </HStack>

      <Box px={3} py={2}>
        {/* Presets */}
        {theme.colorPresets && theme.colorPresets.length > 0 && (
          <HStack gap={2} mb={3} flexWrap="wrap">
            {theme.colorPresets.map((preset) => (
              <Button
                key={preset.id}
                size="xs"
                variant="outline"
                colorPalette="gray"
                onClick={() => applyPreset(preset.id)}
              >
                {preset.label}
              </Button>
            ))}
          </HStack>
        )}

        {/* Brand color — always visible */}
        {brandDef && (
          <VStack align="stretch" gap={2} mb={otherDefs.length > 0 ? 2 : 0}>
            <HStack justify="space-between" gap={2}>
              <Tooltip content={brandDef.label} disabled={brandDef.label.length <= 6}>
                <Text fontSize="xs" fontWeight="medium" flex={1} minW={0} truncate>
                  {brandDef.label}
                </Text>
              </Tooltip>
              <HStack gap={1} flexShrink={0}>
                <Input
                  type="color"
                  w="28px"
                  h="28px"
                  p={0}
                  border="none"
                  borderRadius="sm"
                  cursor="pointer"
                  value={resolvedColors[brandDef.key] ?? brandDef.defaultValue}
                  onChange={(e) => setColor(brandDef.key, e.target.value)}
                />
                <Input
                  size="xs"
                  w="80px"
                  value={resolvedColors[brandDef.key] ?? brandDef.defaultValue}
                  onChange={(e) => setColor(brandDef.key, e.target.value)}
                  placeholder="#000000"
                  fontFamily="mono"
                  fontSize="xs"
                />
              </HStack>
            </HStack>
          </VStack>
        )}

        {/* Other colors — collapsible */}
        {otherDefs.length > 0 && (
          <Accordion.Root multiple defaultValue={[]}>
            <Accordion.Item border="none" value="colors">
              <Accordion.ItemTrigger py={1} px={0}>
                <Text flex={1} fontSize="xs" fontWeight="bold" color="gray.500" textAlign="left">
                  全部颜色
                </Text>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent px={0} pb={1}>
                <Accordion.ItemBody>
                  <VStack gap={2} align="stretch">
                    {otherDefs.map((def) => (
                      <ColorRow
                        key={def.key}
                        def={def}
                        value={resolvedColors[def.key] ?? def.defaultValue}
                        onChange={(v) => setColor(def.key, v)}
                      />
                    ))}
                  </VStack>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>
        )}
      </Box>
    </Box>
  );
}

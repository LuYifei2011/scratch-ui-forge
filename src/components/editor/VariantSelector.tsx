import { Box, Text, Flex, Checkbox } from "@chakra-ui/react";
import { ComponentRegistry } from "@/core/ComponentRegistry";
import { useProjectStore } from "@/store/projectStore";
import { useEditorStore } from "@/store/editorStore";

export default function VariantSelector() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const node = useProjectStore((s) => s.nodes.find((n) => n.id === selectedNodeId));
  const updateSelectedVariants = useProjectStore((s) => s.updateSelectedVariants);
  const triggerRefresh = useEditorStore((s) => s.triggerRefresh);

  if (!node || node.type !== "component" || !node.componentType) return null;

  const def = ComponentRegistry.get(node.componentType);
  if (!def) return null;

  // If no selection, all variants are active
  const selected = node.selectedVariants ?? def.variants.map((v) => v.name);

  const toggleVariant = (name: string) => {
    const isActive = selected.includes(name);
    let next: string[];
    if (isActive) {
      next = selected.filter((v) => v !== name);
      if (next.length === 0) next = [name]; // Must have at least 1
    } else {
      next = [...selected, name];
    }
    updateSelectedVariants(node.id, next);
    triggerRefresh();
  };

  return (
    <Box px={3} py={2} borderBottom="1px solid" borderColor="border.emphasized">
      <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
        变体（帧）
      </Text>
      <Flex wrap="wrap" gap={2}>
        {def.variants.map((v) => (
          <Box key={v.name}>
            <Checkbox.Root
              size="sm"
              checked={selected.includes(v.name)}
              onCheckedChange={() => toggleVariant(v.name)}
              colorPalette="brand"
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label>
                <Text fontSize="xs">{v.label}</Text>
              </Checkbox.Label>
            </Checkbox.Root>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

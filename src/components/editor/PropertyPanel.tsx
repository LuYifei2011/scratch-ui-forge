import { Box, VStack, HStack, Text, Input, NumberInput, Slider, Switch, Accordion } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import SimpleSelect from "@/components/ui/simple-select";
import { ThemeRegistry } from "@/core/ThemeRegistry";
import { useProjectStore } from "@/store/projectStore";
import { useEditorStore } from "@/store/editorStore";
import type { ThemeParam } from "@/core/types";
import IconPicker from "./IconPicker";

export default function PropertyPanel() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const node = useProjectStore((s) => s.nodes.find((n) => n.id === selectedNodeId));
  const globalThemeId = useProjectStore((s) => s.globalThemeId);
  const updateParamValues = useProjectStore((s) => s.updateParamValues);
  const triggerRefresh = useEditorStore((s) => s.triggerRefresh);
  const compactMode = useEditorStore((s) => s.compactMode);

  if (!node || node.type !== "component" || !node.componentType) {
    return (
      <Box p={6} textAlign="center">
        <Text fontSize="sm" color="gray.500">
          选择一个组件以编辑参数
        </Text>
      </Box>
    );
  }

  const compDef = ThemeRegistry.getComponent(globalThemeId, node.componentType);
  if (!compDef) return null;

  const paramValues = node.paramValues ?? {};

  // Split into common and advanced
  const commonParams = compDef.params.filter((p) => p.common);
  const advancedParams = compDef.params.filter((p) => !p.common);

  // Group advanced params
  const groups = new Map<string, ThemeParam[]>();
  for (const p of advancedParams) {
    const group = p.group ?? "其他";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(p);
  }

  const getValue = (key: string, defaultValue: unknown) =>
    paramValues[key] !== undefined ? paramValues[key] : defaultValue;

  const setValue = (key: string, value: unknown) => {
    updateParamValues(node.id, { [key]: value });
    triggerRefresh();
  };

  return (
    <Box>
      <Text fontSize="sm" fontWeight="bold" px={3} py={2} borderBottom="1px solid" borderColor="border.emphasized">
        {node.name} — 参数
      </Text>
      {/* Common params — always visible at top */}
      {commonParams.length > 0 && (
        <VStack gap={3} align="stretch" px={3} py={2}>
          {commonParams.map((param) => (
            <ParamControl
              key={param.key}
              param={param}
              value={getValue(param.key, param.defaultValue)}
              onChange={(v) => setValue(param.key, v)}
              size={compactMode ? "xs" : "sm"}
            />
          ))}
        </VStack>
      )}
      {/* Advanced params — collapsed accordion */}
      {advancedParams.length > 0 && (
        <Accordion.Root multiple defaultValue={[]}>
          {Array.from(groups.entries()).map(([groupName, params]) => (
            <Accordion.Item key={groupName} border="none" value={groupName}>
              <Accordion.ItemTrigger py={1.5} px={3}>
                <Text flex={1} fontSize="xs" fontWeight="bold" color="gray.500" textAlign="left">
                  {groupName}
                </Text>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent px={3} pb={2}>
                <Accordion.ItemBody>
                  <VStack gap={3} align="stretch">
                    {params.map((param) => (
                      <ParamControl
                        key={param.key}
                        param={param}
                        value={getValue(param.key, param.defaultValue)}
                        onChange={(v) => setValue(param.key, v)}
                        size={compactMode ? "xs" : "sm"}
                      />
                    ))}
                  </VStack>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      )}
    </Box>
  );
}

interface ParamControlProps {
  param: ThemeParam;
  value: unknown;
  onChange: (value: unknown) => void;
  size?: "xs" | "sm";
}

function ParamControl({ param, value, onChange, size = "sm" }: ParamControlProps) {
  return (
    <Box>
      <HStack justify="space-between" mb={1}>
        <Tooltip content={param.description} disabled={!param.description}>
          <Text fontSize="xs" color="fg.subtle">
            {param.label}
          </Text>
        </Tooltip>
      </HStack>
      {param.type === "string" && (
        <Input
          size={size}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.description}
        />
      )}
      {param.type === "number" && (
        <NumberInput.Root
          size={size}
          value={String((value as number) ?? 0)}
          min={param.constraints?.min}
          max={param.constraints?.max}
          step={param.constraints?.step}
          onValueChange={(details) => onChange(isNaN(details.valueAsNumber) ? 0 : details.valueAsNumber)}
        >
          <NumberInput.Input />
          <NumberInput.Control>
            <NumberInput.IncrementTrigger />
            <NumberInput.DecrementTrigger />
          </NumberInput.Control>
        </NumberInput.Root>
      )}
      {param.type === "slider" && (
        <HStack>
          <Slider.Root
            value={[(value as number) ?? 0]}
            min={param.constraints?.min ?? 0}
            max={param.constraints?.max ?? 100}
            step={param.constraints?.step ?? 1}
            onValueChange={(details) => onChange(details.value[0])}
            flex={1}
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0} />
            </Slider.Control>
          </Slider.Root>
          <Text fontSize="xs" w="40px" textAlign="right">
            {typeof value === "number" ? (value % 1 === 0 ? value : value.toFixed(2)) : (value as string)}
          </Text>
        </HStack>
      )}
      {param.type === "color" && (
        <HStack>
          <Input
            type="color"
            size={size}
            w={size === "xs" ? "24px" : "40px"}
            h={size === "xs" ? "24px" : "32px"}
            p={0}
            border="none"
            value={(value as string) || "#000000"}
            onChange={(e) => onChange(e.target.value)}
          />
          <Input
            size={size}
            flex={1}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="颜色值"
          />
        </HStack>
      )}
      {param.type === "boolean" && (
        <Switch.Root checked={!!value} onCheckedChange={(details) => onChange(details.checked)} colorPalette="brand">
          <Switch.HiddenInput />
          <Switch.Control />
        </Switch.Root>
      )}
      {param.type === "select" && (
        <SimpleSelect
          size={size}
          value={(value as string) ?? ""}
          onValueChange={(nextValue) => onChange(nextValue)}
          options={(param.constraints?.options ?? []).map((opt) => ({
            label: opt.label,
            value: opt.value,
          }))}
        />
      )}
      {param.type === "icon" && <IconPicker value={(value as string) ?? ""} onChange={onChange} size={size} />}
    </Box>
  );
}

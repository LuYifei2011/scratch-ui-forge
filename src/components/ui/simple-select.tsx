import { Select, createListCollection } from "@chakra-ui/react";
import type { ComponentProps } from "react";
import { useMemo } from "react";

export interface SimpleSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

type RootProps = Omit<ComponentProps<typeof Select.Root>, "collection" | "value" | "onValueChange" | "multiple">;

interface SimpleSelectProps extends RootProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SimpleSelectOption[];
  placeholder?: string;
}

export default function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder,
  positioning,
  ...rootProps
}: SimpleSelectProps) {
  const collection = useMemo(() => createListCollection({ items: options }), [options]);

  return (
    <Select.Root
      collection={collection}
      value={value ? [value] : []}
      onValueChange={(details) => onValueChange(details.value[0] ?? "")}
      positioning={{ sameWidth: true, ...positioning }}
      {...rootProps}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Select.Positioner>
        <Select.Content>
          {collection.items.map((item) => (
            <Select.Item item={item} key={item.value}>
              {item.label}
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
}

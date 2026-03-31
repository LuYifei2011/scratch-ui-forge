import { Popover, Button, SimpleGrid, Box, Text } from "@chakra-ui/react";
import { getIconNames, getIconPath } from "@/core/utils/icons";

interface IconPickerProps {
  value: string;
  onChange: (value: unknown) => void;
  size?: "xs" | "sm";
}

function IconSvg({ name, size = 20, color = "currentColor" }: { name: string; size?: number; color?: string }) {
  const pathD = getIconPath(name);
  if (!pathD) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      style={{ display: "block", margin: "0 auto" }}
    >
      <path d={pathD} />
    </svg>
  );
}

export default function IconPicker({ value, onChange, size = "sm" }: IconPickerProps) {
  const iconNames = getIconNames();

  return (
    <Popover.Root
      positioning={{
        placement: "bottom-start",
      }}
    >
      <Popover.Trigger asChild>
        <Button size={size} variant="outline" w="100%">
          {value ? (
            <Box display="flex" alignItems="center" gap={1}>
              <IconSvg name={value} size={16} />
              <Text fontSize="xs" lineClamp={1}>{value}</Text>
            </Box>
          ) : (
            "选择图标..."
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content w="280px">
          <Popover.Body>
            <SimpleGrid columns={5} gap={1}>
              <Box
                p={2}
                borderRadius="md"
                cursor="pointer"
                bg={!value ? "brand.500" : "transparent"}
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => onChange("")}
                textAlign="center"
                title="无"
              >
                <Text fontSize="xs">无</Text>
              </Box>
              {iconNames.map((name) => (
                <Box
                  key={name}
                  p={2}
                  borderRadius="md"
                  cursor="pointer"
                  bg={value === name ? "brand.500" : "transparent"}
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={() => onChange(name)}
                  textAlign="center"
                  title={name}
                >
                  <IconSvg name={name} size={20} />
                </Box>
              ))}
            </SimpleGrid>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}

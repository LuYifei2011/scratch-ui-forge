import { Popover, Button, SimpleGrid, Box, Text } from '@chakra-ui/react';
import { getIconNames } from '@/core/utils/icons';

interface IconPickerProps {
  value: string;
  onChange: (value: unknown) => void;
  size?: 'xs' | 'sm';
}

export default function IconPicker({ value, onChange, size = 'sm' }: IconPickerProps) {
  const iconNames = getIconNames();

  return (
    <Popover.Root positioning={{
      placement: 'bottom-start'
    }}>
      <Popover.Trigger asChild>
        <Button size={size} variant="outline" w="100%">
          {value || '选择图标...'}
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content w="280px">
          <Popover.Body>
            <SimpleGrid columns={4} gap={1}>
              <Box
                p={2}
                borderRadius="md"
                cursor="pointer"
                bg={!value ? 'brand.500' : 'transparent'}
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => onChange('')}
                textAlign="center"
              >
                <Text fontSize="xs">无</Text>
              </Box>
              {iconNames.map((name) => (
                <Box
                  key={name}
                  p={2}
                  borderRadius="md"
                  cursor="pointer"
                  bg={value === name ? 'brand.500' : 'transparent'}
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={() => onChange(name)}
                  textAlign="center"
                >
                  <Text fontSize="2xs" lineClamp={1}>
                    {name}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}

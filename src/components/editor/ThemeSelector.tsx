import { Box, HStack, Text } from '@chakra-ui/react';
import { ThemeEngine } from '@/core/ThemeEngine';
import { useProjectStore } from '@/store/projectStore';
import { useEditorStore } from '@/store/editorStore';
import SimpleSelect from '@/components/ui/simple-select';

/**
 * @deprecated Theme is now a global project setting (in AppBar).
 * This component is kept for backward compatibility but no longer used.
 */
export default function ThemeSelector() {
  const globalThemeId = useProjectStore((s) => s.globalThemeId);
  const setGlobalThemeId = useProjectStore((s) => s.setGlobalThemeId);
  const triggerRefresh = useEditorStore((s) => s.triggerRefresh);
  const themes = ThemeEngine.list();

  return (
    <Box px={3} py={2} borderBottom="1px solid" borderColor="border.emphasized">
      <HStack>
        <Text fontSize="xs" fontWeight="bold" color="gray.500" whiteSpace="nowrap">
          主题
        </Text>
        <SimpleSelect
          size="sm"
          value={globalThemeId}
          onValueChange={(nextThemeId) => {
            setGlobalThemeId(nextThemeId);
            triggerRefresh();
          }}
          options={themes.map((t) => ({ label: t.name, value: t.id }))}
        />
      </HStack>
    </Box>
  );
}

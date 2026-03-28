import { Box, VStack } from '@chakra-ui/react';
import VariantSelector from './VariantSelector';
import PropertyPanel from './PropertyPanel';
import ExportPanel from './ExportPanel';

export default function EditorPanel() {
  return (
    <Box h="100%" display="flex" flexDirection="column">
      <VStack gap={0} align="stretch" flex={1} overflow="auto">
        <VariantSelector />
        <PropertyPanel />
      </VStack>
      <ExportPanel />
    </Box>
  );
}

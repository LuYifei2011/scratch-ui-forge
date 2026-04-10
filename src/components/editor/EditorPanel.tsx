import { Box, VStack } from "@chakra-ui/react";
import PropertyPanel from "./PropertyPanel";
import ThemeColorsPanel from "./ThemeColorsPanel";

export default function EditorPanel() {
  return (
    <Box h="100%" display="flex" flexDirection="column">
      <VStack gap={0} align="stretch" flex={1} overflow="auto">
        <ThemeColorsPanel />
        <PropertyPanel />
      </VStack>
    </Box>
  );
}

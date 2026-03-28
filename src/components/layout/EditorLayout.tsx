import { Flex, Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface EditorLayoutProps {
  sidebar: ReactNode;
  editor: ReactNode;
  preview: ReactNode;
}

export default function EditorLayout({ sidebar, editor, preview }: EditorLayoutProps) {
  return (
    <Flex flex={1} overflow="hidden">
      {/* Sidebar */}
      <Box
        w="260px"
        minW="200px"
        borderRight="1px solid"
        borderColor="border.emphasized"
        overflow="auto"
        flexShrink={0}
      >
        {sidebar}
      </Box>

      {/* Editor panel */}
      <Box
        flex={1}
        minW="300px"
        borderRight="1px solid"
        borderColor="border.emphasized"
        overflow="auto"
      >
        {editor}
      </Box>

      {/* Preview panel */}
      <Box flex={1} minW="300px" overflow="auto">
        {preview}
      </Box>
    </Flex>
  );
}

import { Flex, VStack, HStack, Heading, Text, Button } from "@chakra-ui/react";
import { FiPlus, FiUpload } from "react-icons/fi";
import { useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import ProjectSettingsDialog from "@/components/editor/ProjectSettingsDialog";

export default function WelcomePage() {
  const openProject = useProjectStore((s) => s.openProject);
  const importProjectFromFile = useProjectStore((s) => s.importProjectFromFile);
  const [showCreate, setShowCreate] = useState(false);

  const handleImport = async () => {
    const id = await importProjectFromFile();
    if (id) {
      await openProject(id);
    }
  };

  return (
    <Flex direction="column" h="100%" bg="bg.subtle">
      <Flex
        as="header"
        align="center"
        px={6}
        h="56px"
        bg="bg.muted"
        borderBottom="1px solid"
        borderColor="border.emphasized"
        flexShrink={0}
      >
        <Heading size="md" fontWeight="bold" color="brand.500">
          ⚡ Scratch UI Forge
        </Heading>
      </Flex>

      <Flex flex={1} align="center" justify="center" overflow="auto" py={12}>
        <VStack gap={8} maxW="600px" w="100%" px={6}>
          <VStack gap={3} textAlign="center">
            <Heading size="2xl" fontWeight="bold">
              欢迎使用 Scratch UI Forge
            </Heading>
            <Text color="fg.muted" fontSize="md">
              可视化 Scratch UI 组件编辑器。创建你的第一个项目开始吧！
            </Text>
          </VStack>
          <HStack gap={4}>
            <Button size="lg" colorPalette="brand" onClick={() => setShowCreate(true)}>
              <FiPlus /> 创建新项目
            </Button>
            <Button size="lg" variant="outline" onClick={handleImport}>
              <FiUpload /> 导入项目
            </Button>
          </HStack>
        </VStack>
      </Flex>

      <ProjectSettingsDialog open={showCreate} onClose={() => setShowCreate(false)} mode="create" />
    </Flex>
  );
}

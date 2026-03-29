import { Flex, Text, Icon, VStack } from "@chakra-ui/react";
import { MdConstruction } from "react-icons/md";
import AppBar from "@/components/layout/AppBar";

export default function SceneEditorPage() {
  return (
    <Flex direction="column" h="100%">
      <AppBar />
      <Flex flex={1} align="center" justify="center" bg="bg.subtle">
        <VStack gap={4}>
          <Icon as={MdConstruction} boxSize={16} color="gray.500" />
          <Text fontSize="xl" fontWeight="bold" color="gray.500">
            场景编辑器
          </Text>
          <Text fontSize="sm" color="gray.500">
            即将推出 — 敬请期待
          </Text>
        </VStack>
      </Flex>
    </Flex>
  );
}

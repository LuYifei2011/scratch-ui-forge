import { Box, VStack, HStack, Text, Separator, Popover, Portal } from "@chakra-ui/react";
import { FiPlus, FiUpload } from "react-icons/fi";
import { useProjectStore } from "@/store/projectStore";
import { useEditorStore } from "@/store/editorStore";

interface ProjectSwitcherProps {
  open: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  children: React.ReactNode;
}

export default function ProjectSwitcher({ open, onClose, onCreateNew, children }: ProjectSwitcherProps) {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const openProject = useProjectStore((s) => s.openProject);
  const importProjectFromFile = useProjectStore((s) => s.importProjectFromFile);
  const selectNode = useEditorStore((s) => s.selectNode);

  const handleSwitch = async (id: string) => {
    if (id === activeProjectId) {
      onClose();
      return;
    }
    selectNode(null);
    await openProject(id);
    onClose();
  };

  const handleImport = async () => {
    const id = await importProjectFromFile();
    if (id) {
      selectNode(null);
      await openProject(id);
    }
    onClose();
  };

  const handleCreate = () => {
    onClose();
    onCreateNew();
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      positioning={{ placement: "bottom-start" }}
    >
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="300px" maxH="400px">
            <Popover.Body p={0}>
              <Box px={3} py={2}>
                <Text fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase">
                  切换项目
                </Text>
              </Box>
              <Box maxH="240px" overflow="auto">
                {projects.map((p) => (
                  <Box
                    key={p.id}
                    px={3}
                    py={2}
                    cursor="pointer"
                    bg={p.id === activeProjectId ? "bg.emphasized" : undefined}
                    _hover={{ bg: "bg.emphasized" }}
                    onClick={() => handleSwitch(p.id)}
                  >
                    <Text fontSize="sm" fontWeight={p.id === activeProjectId ? "bold" : "normal"}>
                      {p.name}
                    </Text>
                    {p.description && (
                      <Text fontSize="xs" color="fg.muted" truncate>
                        {p.description}
                      </Text>
                    )}
                    <Text fontSize="xs" color="fg.subtle">
                      {formatDate(p.updatedAt)}
                    </Text>
                  </Box>
                ))}
              </Box>
              <Separator />
              <VStack gap={0} align="stretch" p={1}>
                <HStack
                  as="button"
                  px={3}
                  py={2}
                  gap={2}
                  cursor="pointer"
                  borderRadius="md"
                  _hover={{ bg: "bg.emphasized" }}
                  onClick={handleCreate}
                >
                  <FiPlus />
                  <Text fontSize="sm">新建项目</Text>
                </HStack>
                <HStack
                  as="button"
                  px={3}
                  py={2}
                  gap={2}
                  cursor="pointer"
                  borderRadius="md"
                  _hover={{ bg: "bg.emphasized" }}
                  onClick={handleImport}
                >
                  <FiUpload />
                  <Text fontSize="sm">导入项目</Text>
                </HStack>
              </VStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

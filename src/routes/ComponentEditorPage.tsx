import { Flex } from "@chakra-ui/react";
import AppBar from "@/components/layout/AppBar";
import EditorLayout from "@/components/layout/EditorLayout";
import Sidebar from "@/components/sidebar/Sidebar";
import EditorPanel from "@/components/editor/EditorPanel";
import PreviewCanvas from "@/components/preview/PreviewCanvas";
import { useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";

export default function ComponentEditorPage() {
  const nodes = useProjectStore((s) => s.nodes);
  const globalThemeId = useProjectStore((s) => s.globalThemeId);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const activeProjectName = useProjectStore((s) => s.activeProjectName);
  const activeProjectDescription = useProjectStore((s) => s.activeProjectDescription);
  const persistCurrentProject = useProjectStore((s) => s.persistCurrentProject);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!activeProjectId) return;
    const timer = setTimeout(() => {
      persistCurrentProject();
    }, 1000);
    return () => clearTimeout(timer);
  }, [nodes, globalThemeId, activeProjectId, activeProjectName, activeProjectDescription, persistCurrentProject]);

  return (
    <Flex direction="column" h="100%">
      <AppBar />
      <EditorLayout sidebar={<Sidebar />} editor={<EditorPanel />} preview={<PreviewCanvas />} />
    </Flex>
  );
}

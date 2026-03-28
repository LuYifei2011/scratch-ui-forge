import { Box, Flex, Heading, Text, Button, HStack, IconButton } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { useColorMode } from '../ui/color-mode';
import { FiSave, FiSun, FiMoon, FiSettings, FiChevronDown, FiMinimize2, FiMaximize2 } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { useEditorStore } from '@/store/editorStore';
import ProjectSwitcher from '@/components/editor/ProjectSwitcher';
import ProjectSettingsDialog from '@/components/editor/ProjectSettingsDialog';
import ExportMenu from './ExportMenu';
import { useState } from 'react';

export default function AppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const activeProjectName = useProjectStore((s) => s.activeProjectName);
  const persistCurrentProject = useProjectStore((s) => s.persistCurrentProject);
  const compactMode = useEditorStore((s) => s.compactMode);
  const setCompactMode = useEditorStore((s) => s.setCompactMode);

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMode, setSettingsMode] = useState<'create' | 'edit'>('edit');

  const isComponent = location.pathname === '/';
  const isScene = location.pathname === '/scene';

  const handleSave = async () => {
    await persistCurrentProject();
  };

  const handleOpenSettings = () => {
    setSettingsMode('edit');
    setSettingsOpen(true);
  };

  const handleCreateNew = () => {
    setSettingsMode('create');
    setSettingsOpen(true);
  };

  return (
    <>
      <Flex
        as="header"
        align="center"
        px={4}
        h="48px"
        bg="bg.muted"
        borderBottom="1px solid"
        borderColor="border.emphasized"
        flexShrink={0}
        gap={3}
      >
        <Heading size="sm" fontWeight="bold" color="brand.500" whiteSpace="nowrap">
          ⚡ Scratch UI Forge
        </Heading>

        {/* Project name + switcher */}
        <HStack gap={0} ml={1}>
          <ProjectSwitcher
            open={switcherOpen}
            onClose={() => setSwitcherOpen(false)}
            onCreateNew={handleCreateNew}
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSwitcherOpen(!switcherOpen)}
              px={2}
            >
              <Text fontSize="sm" fontWeight="medium" truncate maxW="180px">
                {activeProjectName || '选择项目'}
              </Text>
              <FiChevronDown />
            </Button>
          </ProjectSwitcher>
          <Tooltip content="项目设置">
            <IconButton
              aria-label="Project settings"
              size="xs"
              variant="ghost"
              onClick={handleOpenSettings}
            >
              <FiSettings />
            </IconButton>
          </Tooltip>
        </HStack>

        <HStack gap={1} ml={2}>
          <Button
            size="sm"
            variant={isComponent ? 'solid' : 'ghost'}
            colorPalette={isComponent ? 'brand' : 'gray'}
            onClick={() => navigate('/')}
          >
            组件编辑
          </Button>
          <Button
            size="sm"
            variant={isScene ? 'solid' : 'ghost'}
            colorPalette={isScene ? 'brand' : 'gray'}
            onClick={() => navigate('/scene')}
          >
            场景编辑
          </Button>
        </HStack>
        <Box flex={1} />
        <HStack gap={1}>
          <Tooltip content={compactMode ? '退出紧凑模式' : '开启紧凑模式'}>
            <IconButton
              aria-label="Toggle compact mode"
              size="sm"
              variant="ghost"
              onClick={() => setCompactMode(!compactMode)}
            >
              {compactMode ? <FiMaximize2 /> : <FiMinimize2 />}
            </IconButton>
          </Tooltip>
          <Tooltip content={colorMode === 'dark' ? '切换浅色模式' : '切换深色模式'}>
            <IconButton
              aria-label="Toggle color mode"
              size="sm"
              variant="ghost"
              onClick={toggleColorMode}>{colorMode === 'dark' ? <FiSun /> : <FiMoon />}</IconButton>
          </Tooltip>
          <ExportMenu />
          <Tooltip content="保存">
            <IconButton aria-label="Save" size="sm" variant="ghost" onClick={handleSave}><FiSave /></IconButton>
          </Tooltip>
        </HStack>
      </Flex>

      <ProjectSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        mode={settingsMode}
      />
    </>
  );
}

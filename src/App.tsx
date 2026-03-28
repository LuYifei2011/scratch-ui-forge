import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from '@/components/ui/provider';
import ComponentEditorPage from '@/routes/ComponentEditorPage';
import SceneEditorPage from '@/routes/SceneEditorPage';
import WelcomePage from '@/routes/WelcomePage';
import { useProjectStore } from '@/store/projectStore';
import { getActiveProjectId } from '@/services/persistence';
import { initializeApp } from '@/init';
import { useEffect, useState } from 'react';
import '@/styles/scratchFonts';

initializeApp();

function AppRoutes() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const projects = useProjectStore((s) => s.projects);
  const openProject = useProjectStore((s) => s.openProject);
  const loadProjectList = useProjectStore((s) => s.loadProjectList);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await loadProjectList();
      const savedId = getActiveProjectId();
      if (savedId) {
        await openProject(savedId);
      }
      setReady(true);
    })();
  }, [loadProjectList, openProject]);

  if (!ready) return null;

  // Show welcome page only when there are zero projects
  if (!activeProjectId && projects.length === 0) {
    return <WelcomePage />;
  }

  // If there are projects but none is active, open the most recent one
  if (!activeProjectId && projects.length > 0) {
    openProject(projects[0].id);
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={<ComponentEditorPage />} />
      <Route path="/scene" element={<SceneEditorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
    </Provider>
  );
}

export default App;

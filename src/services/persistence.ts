import { openDB, type IDBPDatabase } from 'idb';
import type { ProjectNode } from '@/core/types';

const DB_NAME = 'scratch-ui-forge';
const DB_VERSION = 2;
const STORE_NAME = 'projects';

const ACTIVE_PROJECT_KEY = 'scratch-ui-forge:activeProject';

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  nodes: ProjectNode[];
  globalThemeId: string;
  createdAt: number;
  updatedAt: number;
}

export type ProjectMeta = Pick<ProjectData, 'id' | 'name' | 'description' | 'createdAt' | 'updatedAt'>;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, tx) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        // Migrate v1 → v2: add name/createdAt to existing 'default' record
        if (oldVersion < 2) {
          const store = tx.objectStore(STORE_NAME);
          store.getAll().then((records) => {
            for (const data of records) {
              if (!data.name) {
                data.name = '默认项目';
                data.createdAt = data.updatedAt ?? Date.now();
                data.globalThemeId = data.globalThemeId ?? 'scratch-classic';
                store.put(data);
              }
            }
          });
        }
      },
    });
  }
  return dbPromise;
}

// ─── Active project ID (persisted in localStorage) ───────────────────

export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_PROJECT_KEY);
}

export function setActiveProjectId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
  }
}

// ─── Project CRUD ─────────────────────────────────────────────────────

export async function listProjects(): Promise<ProjectMeta[]> {
  const db = await getDB();
  const all = (await db.getAll(STORE_NAME)) as ProjectData[];
  return all
    .map(({ id, name, description, createdAt, updatedAt }) => ({
      id,
      name: name || '未命名项目',
      description: description || '',
      createdAt: createdAt ?? updatedAt ?? Date.now(),
      updatedAt: updatedAt ?? Date.now(),
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(id: string): Promise<ProjectData | null> {
  const db = await getDB();
  const data = (await db.get(STORE_NAME, id)) as ProjectData | undefined;
  return data ?? null;
}

export async function saveProject(project: ProjectData): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, { ...project, updatedAt: Date.now() });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

// ─── Import / Export ──────────────────────────────────────────────────

export function exportProjectJSON(nodes: ProjectNode[], globalThemeId?: string, name?: string, description?: string): string {
  return JSON.stringify({ version: 2, name, description, nodes, globalThemeId }, null, 2);
}

export function importProjectJSON(json: string): { nodes: ProjectNode[]; globalThemeId?: string; name?: string; description?: string } {
  const data = JSON.parse(json);
  if (!data?.nodes || !Array.isArray(data.nodes)) {
    throw new Error('Invalid project file');
  }
  return { nodes: data.nodes as ProjectNode[], globalThemeId: data.globalThemeId, name: data.name, description: data.description };
}

export async function saveProjectToFile(nodes: ProjectNode[], globalThemeId?: string, name?: string, description?: string): Promise<void> {
  const fileName = `${name || 'scratch-ui-forge-project'}.json`;
  const jsonStr = exportProjectJSON(nodes, globalThemeId, name, description);
  if (!('showSaveFilePicker' in window)) {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const handle = await (window as unknown as { showSaveFilePicker: (opts: object) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
    suggestedName: fileName,
    types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
  });
  const writable = await handle.createWritable();
  await writable.write(jsonStr);
  await writable.close();
}

export async function loadProjectFromFile(): Promise<{ nodes: ProjectNode[]; globalThemeId?: string; name?: string; description?: string }> {
  if (!('showOpenFilePicker' in window)) {
    throw new Error('File System Access API not supported');
  }

  const [handle] = await (window as unknown as { showOpenFilePicker: (opts: object) => Promise<FileSystemFileHandle[]> }).showOpenFilePicker({
    types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
  });
  const file = await handle.getFile();
  const text = await file.text();
  return importProjectJSON(text);
}

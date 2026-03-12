import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AmbientBackground from './components/common/AmbientBackground';
import DashboardView from './views/DashboardView/DashboardView';
import EditorView from './views/EditorView/EditorView';
import ModuleEditorView from './views/EditorView/ModuleEditorView';
import GlobalConfigEditorView from './views/EditorView/GlobalConfigEditorView';
import PreviewView from './views/PreviewView/PreviewView';
import { initialMaterials, initialPages, initialGlobalConfigs } from './config/mockData';

const STORAGE_KEYS = {
  materials: 'forma-live/materials',
  pages: 'forma-live/pages',
  globalConfigs: 'forma-live/globalConfigs',
};

const readPersistedState = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Failed to read persisted state for ${key}`, error);
    return fallback;
  }
};

const writePersistedState = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to persist state for ${key}`, error);
  }
};

export default function App() {
  const [materials, setMaterials] = useState(() => readPersistedState(STORAGE_KEYS.materials, initialMaterials));
  const [pages, setPages] = useState(() => readPersistedState(STORAGE_KEYS.pages, initialPages));
  const [globalConfigs, setGlobalConfigs] = useState(() => {
    // Always use initialGlobalConfigs as the structural source (sections, name, type, id).
    // Only restore saved `values` per config id from localStorage to avoid stale structure.
    const persisted = readPersistedState(STORAGE_KEYS.globalConfigs, []);
    const persistedMap = Object.fromEntries((persisted || []).map(c => [c.id, c]));
    return initialGlobalConfigs.map(cfg => ({
      ...cfg,
      values: persistedMap[cfg.id]?.values ?? cfg.values,
    }));
  });

  const [activeDoc, setActiveDoc] = useState(() => {
    const persistedPages = readPersistedState(STORAGE_KEYS.pages, initialPages);
    return persistedPages[0] ?? initialPages[0];
  });
  const [previewMaterial, setPreviewMaterial] = useState(null);

  useEffect(() => {
    writePersistedState(STORAGE_KEYS.materials, materials);
  }, [materials]);

  useEffect(() => {
    writePersistedState(STORAGE_KEYS.pages, pages);
  }, [pages]);

  useEffect(() => {
    writePersistedState(STORAGE_KEYS.globalConfigs, globalConfigs);
  }, [globalConfigs]);

  useEffect(() => {
    if (!activeDoc && pages.length > 0) {
      setActiveDoc(pages[0]);
    }
  }, [activeDoc, pages]);

  return (
    <>
      <AmbientBackground />
      <div className="relative z-10 font-sans selection:bg-black selection:text-white">
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/editor" element={
            <EditorView
              materials={materials}
              setMaterials={setMaterials}
              pages={pages}
              setPages={setPages}
              globalConfigs={globalConfigs}
              previewMaterial={previewMaterial}
              setPreviewMaterial={setPreviewMaterial}
              setActiveDoc={setActiveDoc}
            />
          } />
          <Route path="/editor/:id" element={
            <ModuleEditorView
              materials={materials}
              pages={pages}
              setPages={setPages}
            />
          } />
          <Route path="/editor/config/:id" element={
            <GlobalConfigEditorView
              globalConfigs={globalConfigs}
              setGlobalConfigs={setGlobalConfigs}
              pages={pages}
              materials={materials}
            />
          } />
          <Route path="/site/:id" element={
            <PreviewView
              materials={materials}
              pages={pages}
              globalConfigs={globalConfigs}
              activeDoc={activeDoc}
              setActiveDoc={setActiveDoc}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

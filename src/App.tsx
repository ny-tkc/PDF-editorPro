import { useEffect } from 'react';
import { DocumentProvider } from './state/DocumentContext';
import { EditorProvider } from './state/EditorContext';
import { UndoProvider } from './state/UndoContext';
import { useEditor } from './hooks/useEditor';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { AppLayout } from './components/layout/AppLayout';

function DarkModeManager() {
  const { state } = useEditor();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  return null;
}

function KeyboardShortcutsManager() {
  useKeyboardShortcuts();
  return null;
}

export default function App() {
  return (
    <EditorProvider>
      <DocumentProvider>
        <UndoProvider>
          <DarkModeManager />
          <KeyboardShortcutsManager />
          <AppLayout />
        </UndoProvider>
      </DocumentProvider>
    </EditorProvider>
  );
}

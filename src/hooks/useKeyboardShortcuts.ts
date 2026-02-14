import { useEffect } from 'react';
import { useDocument } from './useDocument';
import { useEditor } from './useEditor';

export function useKeyboardShortcuts() {
  const { state: docState, dispatch: docDispatch } = useDocument();
  const { state: editorState, dispatch: editorDispatch } = useEditor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // Don't intercept when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+A: Select all pages (when not in edit mode)
      if (isCtrl && e.key === 'a' && !editorState.isEditMode) {
        e.preventDefault();
        docDispatch({
          type: 'SET_SELECTION',
          pageIds: docState.pages.map((p) => p.id),
        });
      }

      // Delete/Backspace: Delete selected pages (when not in edit mode)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !editorState.isEditMode) {
        e.preventDefault();
        const targets =
          docState.selectedPageIds.length > 0
            ? docState.selectedPageIds
            : docState.activePageId
              ? [docState.activePageId]
              : [];
        if (targets.length > 0) {
          docDispatch({ type: 'DELETE_PAGES', pageIds: targets });
        }
      }

      // Escape: exit edit mode
      if (e.key === 'Escape' && editorState.isEditMode) {
        editorDispatch({ type: 'EXIT_EDIT_MODE' });
      }

      // Ctrl+= / Ctrl+-: Zoom
      if (isCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        editorDispatch({ type: 'SET_ZOOM', zoom: editorState.zoom + 0.1 });
      }
      if (isCtrl && e.key === '-') {
        e.preventDefault();
        editorDispatch({ type: 'SET_ZOOM', zoom: editorState.zoom - 0.1 });
      }
      if (isCtrl && e.key === '0') {
        e.preventDefault();
        editorDispatch({ type: 'SET_ZOOM', zoom: 1.0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [docState, editorState, docDispatch, editorDispatch]);
}

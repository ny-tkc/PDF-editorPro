import { createContext, useCallback, useRef, type ReactNode } from 'react';
import { useDocument } from '../hooks/useDocument';
import { UNDO_MAX_HISTORY } from '../utils/constants';
import type { DocumentState, DocumentAction } from '../types';

interface UndoEntry {
  prevState: DocumentState;
  nextState: DocumentState;
}

interface UndoContextValue {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  dispatchWithUndo: (action: DocumentAction) => void;
}

export const UndoContext = createContext<UndoContextValue>({
  canUndo: false,
  canRedo: false,
  undo: () => {},
  redo: () => {},
  dispatchWithUndo: () => {},
});

const UNDOABLE_ACTIONS = new Set([
  'DELETE_PAGES',
  'REORDER_PAGES',
  'ROTATE_PAGE',
  'DUPLICATE_PAGES',
  'ADD_PAGES',
  'UPDATE_PAGE_FABRIC',
]);

export function UndoProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useDocument();
  const pastRef = useRef<UndoEntry[]>([]);
  const futureRef = useRef<UndoEntry[]>([]);
  // We need to force re-render when undo/redo state changes
  const forceUpdate = useCallback(() => {
    // This is a trick to force re-render
    dispatch({ type: 'REPLACE_STATE', state: { ...state } });
  }, [dispatch, state]);

  const dispatchWithUndo = useCallback(
    (action: DocumentAction) => {
      if (UNDOABLE_ACTIONS.has(action.type)) {
        const prevState = { ...state, pages: [...state.pages] };
        dispatch(action);
        // We'll capture the next state in a microtask
        queueMicrotask(() => {
          pastRef.current.push({ prevState, nextState: { ...state } });
          if (pastRef.current.length > UNDO_MAX_HISTORY) {
            pastRef.current.shift();
          }
          futureRef.current = [];
        });
      } else {
        dispatch(action);
      }
    },
    [state, dispatch]
  );

  const undo = useCallback(() => {
    const entry = pastRef.current.pop();
    if (!entry) return;
    futureRef.current.push({ prevState: entry.prevState, nextState: { ...state } });
    dispatch({ type: 'REPLACE_STATE', state: entry.prevState });
  }, [state, dispatch]);

  const redo = useCallback(() => {
    const entry = futureRef.current.pop();
    if (!entry) return;
    pastRef.current.push({ prevState: { ...state }, nextState: entry.nextState });
    dispatch({ type: 'REPLACE_STATE', state: entry.nextState });
  }, [state, dispatch]);

  return (
    <UndoContext.Provider
      value={{
        canUndo: pastRef.current.length > 0,
        canRedo: futureRef.current.length > 0,
        undo,
        redo,
        dispatchWithUndo,
      }}
    >
      {children}
    </UndoContext.Provider>
  );
}

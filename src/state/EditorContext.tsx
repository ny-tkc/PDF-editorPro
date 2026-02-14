import { createContext, useReducer, type ReactNode } from 'react';
import { EditorState, EditorAction } from '../types';
import { editorReducer, initialEditorState } from './editorReducer';

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}

export const EditorContext = createContext<EditorContextValue>({
  state: initialEditorState,
  dispatch: () => {},
});

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

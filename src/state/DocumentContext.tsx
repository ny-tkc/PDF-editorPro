import { createContext, useReducer, type ReactNode } from 'react';
import { DocumentState, DocumentAction } from '../types';
import { documentReducer, initialDocumentState } from './documentReducer';

interface DocumentContextValue {
  state: DocumentState;
  dispatch: React.Dispatch<DocumentAction>;
}

export const DocumentContext = createContext<DocumentContextValue>({
  state: initialDocumentState,
  dispatch: () => {},
});

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(documentReducer, initialDocumentState);
  return (
    <DocumentContext.Provider value={{ state, dispatch }}>
      {children}
    </DocumentContext.Provider>
  );
}

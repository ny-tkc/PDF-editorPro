import { useContext } from 'react';
import { EditorContext } from '../state/EditorContext';

export function useEditor() {
  return useContext(EditorContext);
}

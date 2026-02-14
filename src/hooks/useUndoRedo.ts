import { useContext } from 'react';
import { UndoContext } from '../state/UndoContext';

export function useUndoRedo() {
  return useContext(UndoContext);
}

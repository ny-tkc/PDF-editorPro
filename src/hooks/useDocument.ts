import { useContext } from 'react';
import { DocumentContext } from '../state/DocumentContext';

export function useDocument() {
  return useContext(DocumentContext);
}

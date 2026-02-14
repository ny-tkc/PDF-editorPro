import { EditorState, EditorAction } from '../types';
import { DEFAULT_ZOOM, DEFAULT_GRID_SIZE, MIN_ZOOM, MAX_ZOOM } from '../utils/constants';

export const initialEditorState: EditorState = {
  isEditMode: false,
  editingPageId: null,
  activeTool: 'select',
  zoom: DEFAULT_ZOOM,
  gridSnap: false,
  gridSize: DEFAULT_GRID_SIZE,
  darkMode: localStorage.getItem('darkMode') === 'true',
};

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'ENTER_EDIT_MODE':
      return { ...state, isEditMode: true, editingPageId: action.pageId, activeTool: 'select' };

    case 'EXIT_EDIT_MODE':
      return { ...state, isEditMode: false, editingPageId: null, activeTool: 'select' };

    case 'SET_TOOL':
      return { ...state, activeTool: action.tool };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, action.zoom)) };

    case 'TOGGLE_GRID_SNAP':
      return { ...state, gridSnap: !state.gridSnap };

    case 'SET_GRID_SIZE':
      return { ...state, gridSize: action.size };

    case 'TOGGLE_DARK_MODE': {
      const next = !state.darkMode;
      localStorage.setItem('darkMode', String(next));
      return { ...state, darkMode: next };
    }

    default:
      return state;
  }
}

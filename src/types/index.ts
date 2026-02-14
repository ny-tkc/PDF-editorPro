// === Document Types ===

export interface PageData {
  id: string;
  sourceType: 'pdf' | 'image';
  sourceFileName: string;
  sourceGroupId: string;
  pdfBytes: Uint8Array | null;
  imageDataUrl: string | null;
  fabricJSON: string | null;
  rotation: 0 | 90 | 180 | 270;
  width: number;
  height: number;
  thumbnailDataUrl: string | null;
}

export type ViewMode = 'desk' | 'group' | 'book';

export interface DocumentState {
  pages: PageData[];
  fileName: string;
  selectedPageIds: string[];
  activePageId: string | null;
  viewMode: ViewMode;
  bookCurrentIndex: number;
}

// === Editor Types ===

export type EditTool = 'select' | 'text' | 'arrow' | 'rectangle' | 'circle' | 'line';

export interface EditorState {
  isEditMode: boolean;
  editingPageId: string | null;
  activeTool: EditTool;
  zoom: number;
  gridSnap: boolean;
  gridSize: number;
  darkMode: boolean;
}

// === Action Types ===

export type DocumentAction =
  | { type: 'LOAD_PAGES'; pages: PageData[] }
  | { type: 'ADD_PAGES'; pages: PageData[]; insertIndex?: number }
  | { type: 'DELETE_PAGES'; pageIds: string[] }
  | { type: 'REORDER_PAGES'; fromIndex: number; toIndex: number }
  | { type: 'ROTATE_PAGE'; pageId: string; angle: 90 | -90 }
  | { type: 'DUPLICATE_PAGES'; pageIds: string[] }
  | { type: 'UPDATE_PAGE_FABRIC'; pageId: string; fabricJSON: string }
  | { type: 'UPDATE_PAGE_IMAGE'; pageId: string; imageDataUrl: string }
  | { type: 'UPDATE_THUMBNAIL'; pageId: string; thumbnailDataUrl: string }
  | { type: 'SET_ACTIVE_PAGE'; pageId: string | null }
  | { type: 'SET_SELECTION'; pageIds: string[] }
  | { type: 'TOGGLE_SELECTION'; pageId: string }
  | { type: 'SET_FILE_NAME'; name: string }
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'SET_BOOK_INDEX'; index: number }
  | { type: 'REPLACE_STATE'; state: DocumentState };

export type EditorAction =
  | { type: 'ENTER_EDIT_MODE'; pageId: string }
  | { type: 'EXIT_EDIT_MODE' }
  | { type: 'SET_TOOL'; tool: EditTool }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'TOGGLE_GRID_SNAP' }
  | { type: 'SET_GRID_SIZE'; size: number }
  | { type: 'TOGGLE_DARK_MODE' };

import { DocumentState, DocumentAction, PageData } from '../types';
import { generateId } from '../utils/idGenerator';

export const initialDocumentState: DocumentState = {
  pages: [],
  fileName: 'Untitled',
  selectedPageIds: [],
  activePageId: null,
  viewMode: 'desk',
  bookCurrentIndex: 0,
};

function normalizeRotation(current: number, delta: number): 0 | 90 | 180 | 270 {
  const r = ((current + delta) % 360 + 360) % 360;
  return r as 0 | 90 | 180 | 270;
}

export function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'LOAD_PAGES':
      return {
        ...state,
        pages: action.pages,
        selectedPageIds: [],
        activePageId: action.pages.length > 0 ? action.pages[0].id : null,
        bookCurrentIndex: 0,
      };

    case 'ADD_PAGES': {
      const newPages = [...state.pages];
      const insertAt = action.insertIndex ?? newPages.length;
      newPages.splice(insertAt, 0, ...action.pages);
      return {
        ...state,
        pages: newPages,
        activePageId: state.activePageId ?? action.pages[0]?.id ?? null,
      };
    }

    case 'DELETE_PAGES': {
      const deleteSet = new Set(action.pageIds);
      const remaining = state.pages.filter((p) => !deleteSet.has(p.id));
      let newActive = state.activePageId;
      if (newActive && deleteSet.has(newActive)) {
        const oldIndex = state.pages.findIndex((p) => p.id === newActive);
        newActive = remaining[Math.min(oldIndex, remaining.length - 1)]?.id ?? null;
      }
      return {
        ...state,
        pages: remaining,
        selectedPageIds: state.selectedPageIds.filter((id) => !deleteSet.has(id)),
        activePageId: newActive,
        bookCurrentIndex: Math.min(state.bookCurrentIndex, Math.max(0, remaining.length - 1)),
      };
    }

    case 'REORDER_PAGES': {
      const pages = [...state.pages];
      const [moved] = pages.splice(action.fromIndex, 1);
      pages.splice(action.toIndex, 0, moved);
      return { ...state, pages };
    }

    case 'ROTATE_PAGE':
      // Keep imageDataUrl and thumbnailDataUrl - we'll use CSS rotation for display
      return {
        ...state,
        pages: state.pages.map((p) =>
          p.id === action.pageId
            ? { ...p, rotation: normalizeRotation(p.rotation, action.angle) }
            : p
        ),
      };

    case 'DUPLICATE_PAGES': {
      const newPages: PageData[] = [];
      const result = [...state.pages];
      for (const page of state.pages) {
        if (action.pageIds.includes(page.id)) {
          const dup: PageData = { ...page, id: generateId(), fabricJSON: null, thumbnailDataUrl: page.thumbnailDataUrl };
          const idx = result.indexOf(page);
          result.splice(idx + 1 + newPages.length, 0, dup);
          newPages.push(dup);
        }
      }
      return { ...state, pages: result };
    }

    case 'UPDATE_PAGE_FABRIC':
      return { ...state, pages: state.pages.map((p) => p.id === action.pageId ? { ...p, fabricJSON: action.fabricJSON } : p) };

    case 'UPDATE_PAGE_IMAGE':
      return { ...state, pages: state.pages.map((p) => p.id === action.pageId ? { ...p, imageDataUrl: action.imageDataUrl } : p) };

    case 'UPDATE_THUMBNAIL':
      return { ...state, pages: state.pages.map((p) => p.id === action.pageId ? { ...p, thumbnailDataUrl: action.thumbnailDataUrl } : p) };

    case 'SET_ACTIVE_PAGE':
      return { ...state, activePageId: action.pageId };

    case 'SET_SELECTION':
      return { ...state, selectedPageIds: action.pageIds };

    case 'TOGGLE_SELECTION': {
      const exists = state.selectedPageIds.includes(action.pageId);
      return {
        ...state,
        selectedPageIds: exists
          ? state.selectedPageIds.filter((id) => id !== action.pageId)
          : [...state.selectedPageIds, action.pageId],
      };
    }

    case 'SET_FILE_NAME':
      return { ...state, fileName: action.name };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode, bookCurrentIndex: 0 };

    case 'SET_BOOK_INDEX':
      return { ...state, bookCurrentIndex: Math.max(0, Math.min(action.index, state.pages.length - 1)) };

    case 'REPLACE_STATE':
      return action.state;

    default:
      return state;
  }
}

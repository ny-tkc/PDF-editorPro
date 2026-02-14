import { useEditor } from '../../hooks/useEditor';
import { IconButton } from '../ui/IconButton';
import type { EditTool } from '../../types';

interface CanvasToolbarProps {
  onDeleteSelected: () => void;
}

export function CanvasToolbar({ onDeleteSelected }: CanvasToolbarProps) {
  const { state, dispatch } = useEditor();

  const tools: { id: EditTool; label: string; icon: string }[] = [
    { id: 'select', label: '選択', icon: 'cursor' },
    { id: 'text', label: 'テキスト', icon: 'text' },
    { id: 'arrow', label: '矢印', icon: 'arrow' },
    { id: 'rectangle', label: '四角形', icon: 'rect' },
    { id: 'circle', label: '円', icon: 'circle' },
    { id: 'line', label: '線', icon: 'line' },
  ];

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'cursor':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2z" />
          </svg>
        );
      case 'text':
        return <span className="text-sm font-bold">T</span>;
      case 'arrow':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        );
      case 'rect':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
          </svg>
        );
      case 'circle':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="9" strokeWidth={2} />
          </svg>
        );
      case 'line':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <line x1="5" y1="19" x2="19" y2="5" strokeWidth={2} strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      {tools.map((tool) => (
        <IconButton
          key={tool.id}
          active={state.activeTool === tool.id}
          onClick={() => dispatch({ type: 'SET_TOOL', tool: tool.id })}
          tooltip={tool.label}
        >
          {renderIcon(tool.icon)}
        </IconButton>
      ))}
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-2" />
      <IconButton onClick={onDeleteSelected} tooltip="選択を削除">
        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </IconButton>
    </div>
  );
}

import { useEditor } from '../../hooks/useEditor';
import { IconButton } from '../ui/IconButton';
import type { EditTool } from '../../types';
import type { SelectedObjectProps } from '../../hooks/useFabricCanvas';

interface CanvasToolbarProps {
  onDeleteSelected: () => void;
  selectedProps: SelectedObjectProps | null;
  onUpdateSelectedObject: (props: Partial<SelectedObjectProps>) => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#000000', '#6b7280', '#ffffff',
];

export function CanvasToolbar({ onDeleteSelected, selectedProps, onUpdateSelectedObject }: CanvasToolbarProps) {
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
    <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      {/* Drawing tools */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <IconButton
            key={tool.id}
            active={state.activeTool === tool.id}
            onClick={() => dispatch({ type: 'SET_TOOL', tool: tool.id })}
            tooltip={tool.label + (tool.id !== 'select' ? ' (ドラッグで描画)' : '')}
          >
            {renderIcon(tool.icon)}
          </IconButton>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-2" />

      {/* Delete button */}
      <IconButton onClick={onDeleteSelected} tooltip="選択を削除 (Delete)">
        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </IconButton>

      {/* Property panel - shown when an object is selected */}
      {selectedProps && (
        <>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-2" />

          {/* Stroke width */}
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">太さ</label>
            <input
              type="range"
              min={1}
              max={30}
              step={2}
              value={selectedProps.strokeWidth}
              onChange={(e) => onUpdateSelectedObject({ strokeWidth: Number(e.target.value) })}
              className="w-20 h-1 accent-blue-500"
            />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 w-5 text-right tabular-nums">
              {selectedProps.strokeWidth}
            </span>
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

          {/* Stroke color */}
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">線色</label>
            <div className="flex items-center gap-0.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={`stroke-${color}`}
                  onClick={() => onUpdateSelectedObject({ stroke: color })}
                  className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 ${
                    selectedProps.stroke === color
                      ? 'border-blue-500 ring-1 ring-blue-500 scale-110'
                      : 'border-gray-300 dark:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

          {/* Fill color */}
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">塗り</label>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onUpdateSelectedObject({ fill: 'transparent' })}
                className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 ${
                  selectedProps.fill === 'transparent'
                    ? 'border-blue-500 ring-1 ring-blue-500 scale-110'
                    : 'border-gray-300 dark:border-gray-500'
                }`}
                title="透明"
              >
                <svg viewBox="0 0 16 16" className="w-full h-full">
                  <line x1="2" y1="14" x2="14" y2="2" stroke="#ef4444" strokeWidth="1.5" />
                </svg>
              </button>
              {PRESET_COLORS.map((color) => (
                <button
                  key={`fill-${color}`}
                  onClick={() => onUpdateSelectedObject({ fill: color })}
                  className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 ${
                    selectedProps.fill === color
                      ? 'border-blue-500 ring-1 ring-blue-500 scale-110'
                      : 'border-gray-300 dark:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Font size - only for text objects */}
          {selectedProps.fontSize !== undefined && (
            <>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">文字</label>
                <input
                  type="number"
                  min={8}
                  max={120}
                  step={1}
                  value={selectedProps.fontSize}
                  onChange={(e) => onUpdateSelectedObject({ fontSize: Number(e.target.value) })}
                  className="w-12 h-5 text-[10px] text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
                <span className="text-[10px] text-gray-400">px</span>
              </div>
            </>
          )}

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

          {/* Opacity */}
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">透過</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={selectedProps.opacity}
              onChange={(e) => onUpdateSelectedObject({ opacity: Number(e.target.value) })}
              className="w-14 h-1 accent-blue-500"
            />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 w-6 text-right tabular-nums">
              {Math.round(selectedProps.opacity * 100)}%
            </span>
          </div>
        </>
      )}
    </div>
  );
}

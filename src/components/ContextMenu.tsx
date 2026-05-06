import React, { useEffect, useRef } from 'react';
import { 
  Scissors, 
  Copy, 
  Clipboard, 
  Undo, 
  Redo, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Maximize2,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignStartVertical as AlignTop,
  AlignEndVertical as AlignBottom
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ContextMenuProps {
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;
  onClose: () => void;
  onAction: (action: string, meta?: { x: number, y: number }) => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  hasClipboard: boolean;
  selectedCount: number;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  canvasX,
  canvasY,
  onClose,
  onAction,
  canUndo,
  canRedo,
  hasSelection,
  hasClipboard,
  selectedCount
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleActionClick = (action: string, usePos: boolean = false) => {
    onAction(action, usePos ? { x: canvasX, y: canvasY } : undefined);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-dk-darker-bg border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl min-w-[200px]"
      style={{ top: y, left: x }}
    >
      <div className="py-1">
        <ContextMenuItem 
          icon={<Undo className="w-3.5 h-3.5" />} 
          label="Undo" 
          shortcut="Ctrl+Z"
          disabled={!canUndo}
          onClick={() => handleActionClick('undo')}
        />
        <ContextMenuItem 
          icon={<Redo className="w-3.5 h-3.5" />} 
          label="Redo" 
          shortcut="Ctrl+Y"
          disabled={!canRedo}
          onClick={() => handleActionClick('redo')}
        />
      </div>

      <div className="h-px bg-white/5 mx-1" />

      <div className="py-1">
        <ContextMenuItem 
          icon={<Scissors className="w-3.5 h-3.5" />} 
          label="Cut" 
          shortcut="Ctrl+X"
          disabled={!hasSelection}
          onClick={() => handleActionClick('cut')}
        />
        <ContextMenuItem 
          icon={<Copy className="w-3.5 h-3.5" />} 
          label="Copy" 
          shortcut="Ctrl+C"
          disabled={!hasSelection}
          onClick={() => handleActionClick('copy')}
        />
        <ContextMenuItem 
          icon={<Clipboard className="w-3.5 h-3.5" />} 
          label="Paste Here" 
          shortcut="Ctrl+V"
          disabled={!hasClipboard}
          onClick={() => handleActionClick('paste', true)}
        />
        <ContextMenuItem 
          icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />} 
          label="Delete" 
          shortcut="Del"
          disabled={!hasSelection}
          onClick={() => handleActionClick('delete')}
        />
      </div>

      <div className="h-px bg-white/5 mx-1" />

      <div className="py-1">
        <label className="px-3 py-1.5 text-[9px] text-gray-500 uppercase font-black tracking-widest block">Align</label>
        <div className="grid grid-cols-2 gap-1 px-1">
          <ContextMenuItem 
            icon={<AlignLeft className="w-3.5 h-3.5" />} 
            label="Align Left" 
            disabled={selectedCount < 2}
            onClick={() => handleActionClick('align-left')}
          />
          <ContextMenuItem 
            icon={<AlignRight className="w-3.5 h-3.5" />} 
            label="Align Right" 
            disabled={selectedCount < 2}
            onClick={() => handleActionClick('align-right')}
          />
          <ContextMenuItem 
            icon={<AlignTop className="w-3.5 h-3.5" />} 
            label="Align Top" 
            disabled={selectedCount < 2}
            onClick={() => handleActionClick('align-top')}
          />
          <ContextMenuItem 
            icon={<AlignBottom className="w-3.5 h-3.5" />} 
            label="Align Bottom" 
            disabled={selectedCount < 2}
            onClick={() => handleActionClick('align-bottom')}
          />
        </div>
      </div>

      <div className="h-px bg-white/5 mx-1 mt-1" />

      <div className="py-1">
        <label className="px-3 py-1.5 text-[9px] text-gray-500 uppercase font-black tracking-widest block">Move</label>
        <div className="grid grid-cols-2 gap-1 px-1 mt-1">
          <ContextMenuItem 
            icon={<ArrowUp className="w-3.5 h-3.5" />} 
            label="Up" 
            disabled={!hasSelection}
            onClick={() => handleActionClick('move-up')}
          />
          <ContextMenuItem 
            icon={<ArrowDown className="w-3.5 h-3.5" />} 
            label="Down" 
            disabled={!hasSelection}
            onClick={() => handleActionClick('move-down')}
          />
          <ContextMenuItem 
            icon={<ArrowLeft className="w-3.5 h-3.5" />} 
            label="Left" 
            disabled={!hasSelection}
            onClick={() => handleActionClick('move-left')}
          />
          <ContextMenuItem 
            icon={<ArrowRight className="w-3.5 h-3.5" />} 
            label="Right" 
            disabled={!hasSelection}
            onClick={() => handleActionClick('move-right')}
          />
        </div>
      </div>

      <div className="h-px bg-white/5 mx-1 mt-1" />

      <div className="py-1">
        <ContextMenuItem 
          icon={<AlignCenter className="w-3.5 h-3.5" />} 
          label="Clear Connections" 
          disabled={!hasSelection}
          onClick={() => handleActionClick('clear-connections')}
        />
      </div>
    </div>
  );
};

const ContextMenuItem = ({ 
  icon, 
  label, 
  shortcut, 
  disabled, 
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  shortcut?: string, 
  disabled?: boolean, 
  onClick: () => void 
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-3 py-2 text-xs transition-colors",
      disabled ? "text-white/20 cursor-not-allowed" : "text-white/70 hover:bg-white/5 hover:text-white"
    )}
  >
    <div className="flex items-center gap-2.5">
      <span className={cn(disabled ? "opacity-20" : "opacity-80")}>{icon}</span>
      <span>{label}</span>
    </div>
    {shortcut && <span className="text-[10px] text-gray-500 font-mono">{shortcut}</span>}
  </button>
);

export default ContextMenu;

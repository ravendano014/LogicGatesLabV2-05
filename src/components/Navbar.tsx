import React from 'react';
import { 
  PlusSquare, 
  FileUp, 
  FileDown,
  Scissors, 
  Copy, 
  Clipboard, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Play,
  Table,
  Sparkles,
  Loader2,
  Magnet,
  CopyPlus,
  Eraser,
  Activity,
  Hand,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  fileName: string;
  onFileNameChange: (name: string) => void;
  onAction: (action: string, meta?: { x?: number, y?: number }) => void;
  isGeneratingAI: boolean;
  magneticWiresEnabled: boolean;
  onToggleMagneticWires: () => void;
  connectionCloningEnabled: boolean;
  onToggleConnectionCloning: () => void;
  onClearConnections: () => void;
  statusVisible: boolean;
  onToggleStatus: () => void;
  panModeEnabled: boolean;
  onTogglePanMode: () => void;
  fuserEnabled: boolean;
  onToggleFuser: () => void;
  isWiresHidden: boolean;
  onToggleWires: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  fileName, 
  onFileNameChange, 
  onAction, 
  isGeneratingAI,
  magneticWiresEnabled,
  onToggleMagneticWires,
  connectionCloningEnabled,
  onToggleConnectionCloning,
  onClearConnections,
  statusVisible,
  onToggleStatus,
  panModeEnabled,
  onTogglePanMode,
  fuserEnabled,
  onToggleFuser,
  isWiresHidden,
  onToggleWires,
}) => {
  return (
    <nav className="h-14 bg-navbar-bg border-b border-dk-darker-bg flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-lg">
      <div className="flex items-center gap-2 md:gap-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest hidden sm:block">Project</span>
          <input
            type="text"
            value={fileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            placeholder="Untitled Circuit"
            className="bg-black/20 border border-white/10 rounded px-2 md:px-3 py-1 text-xs md:text-sm text-white focus:outline-none focus:border-white/30 w-32 md:w-48 transition-all"
          />
        </div>

        <div className="h-6 w-px bg-white/10 shrink-0" />

        <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
          <NavButton onClick={() => onAction('new')} icon={<PlusSquare className="w-4 h-4" />} tooltip="New Circuit" />
          <NavButton onClick={() => onAction('load')} icon={<FileUp className="w-4 h-4" />} tooltip="Load JSON" />
          <NavButton onClick={() => onAction('import-logisim')} icon={<FileUp className="w-4 h-4 text-blue-400" />} tooltip="Import Logisim (.circ)" />
          <NavButton onClick={() => onAction('save')} icon={<FileDown className="w-4 h-4" />} tooltip="Save JSON" />
        </div>

        <div className="h-6 w-px bg-white/10 shrink-0 hidden sm:block" />

        <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
          <NavButton onClick={() => onAction('cut')} icon={<Scissors className="w-4 h-4" />} tooltip="Cut" />
          <NavButton onClick={() => onAction('copy')} icon={<Copy className="w-4 h-4" />} tooltip="Copy" />
          <NavButton onClick={() => onAction('paste')} icon={<Clipboard className="w-4 h-4" />} tooltip="Paste" />
        </div>

        <div className="h-6 w-px bg-white/10 shrink-0 hidden sm:block" />

        <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
          <NavButton onClick={() => onAction('move-up')} icon={<ArrowUp className="w-4 h-4" />} tooltip="Move Up" />
          <NavButton onClick={() => onAction('move-down')} icon={<ArrowDown className="w-4 h-4" />} tooltip="Move Down" />
          <NavButton onClick={() => onAction('move-left')} icon={<ArrowLeft className="w-4 h-4" />} tooltip="Move Left" />
          <NavButton onClick={() => onAction('move-right')} icon={<ArrowRight className="w-4 h-4" />} tooltip="Move Right" />
        </div>

        <div className="h-6 w-px bg-white/10 shrink-0" />
        
        <NavButton 
          onClick={onToggleMagneticWires} 
          icon={<Magnet className={cn("w-4 h-4", magneticWiresEnabled ? "text-yellow-500" : "text-white/70")} />} 
          tooltip={magneticWiresEnabled ? "Magnetic Wires Enabled" : "Enable Magnetic Wires"}
          active={magneticWiresEnabled}
        />

        <NavButton 
          onClick={onTogglePanMode} 
          icon={<Hand className={cn("w-4 h-4", panModeEnabled ? "text-yellow-500" : "text-white/70")} />} 
          tooltip={panModeEnabled ? "Pan Mode Enabled" : "Enable Pan Mode"}
          active={panModeEnabled}
        />

        <NavButton 
          onClick={onToggleFuser} 
          icon={<Zap className={cn("w-4 h-4", fuserEnabled ? "text-orange-400" : "text-white/70")} />} 
          tooltip={fuserEnabled ? "Fuser Mode Enabled" : "Enable Fuser Mode"}
          active={fuserEnabled}
        />

        <NavButton 
          onClick={onToggleConnectionCloning} 
          icon={<CopyPlus className={cn("w-4 h-4", connectionCloningEnabled ? "text-purple-400" : "text-white/70")} />} 
          tooltip={connectionCloningEnabled ? "Clone Connections Enabled" : "Enable Connection Cloning"}
          active={connectionCloningEnabled}
        />

        <div className="h-6 w-px bg-white/10 shrink-0" />

        <NavButton 
          onClick={onClearConnections} 
          icon={<Eraser className="w-4 h-4 text-white/70" />} 
          tooltip="Clear Connections of Selected Components"
        />

        <NavButton 
          onClick={onToggleStatus} 
          icon={<Activity className={cn("w-4 h-4", statusVisible ? "text-green-400" : "text-white/70")} />} 
          tooltip={statusVisible ? "Status Indicators: ON" : "Status Indicators: OFF"}
          active={statusVisible}
        />

        <NavButton 
          onClick={onToggleWires} 
          icon={isWiresHidden ? <EyeOff className="w-4 h-4 text-orange-400" /> : <Eye className="w-4 h-4 text-blue-400" />} 
          tooltip={isWiresHidden ? "Wires Hidden" : "Hide Wires"}
          active={isWiresHidden}
        />
      </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-2">
          <button 
            onClick={() => onAction('ai-generate')}
            disabled={isGeneratingAI}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white rounded-full text-[10px] md:text-xs font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            {isGeneratingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span className="hidden xs:block">{isGeneratingAI ? 'Generating...' : 'AI Generate'}</span>
          </button>
          <button 
            onClick={() => onAction('truth-table')}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-dk-darker-bg rounded-full text-[10px] md:text-xs font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
          <Table className="w-3.5 h-3.5" />
          <span className="hidden xs:block">Truth Table</span>
        </button>
      </div>
    </nav>
  );
};

const NavButton = ({ icon, onClick, tooltip, active, disabled }: { icon: React.ReactNode, onClick: () => void, tooltip: string, active?: boolean, disabled?: boolean }) => (
  <button
    onClick={onClick}
    title={tooltip}
    disabled={disabled}
    className={cn(
      "p-2 text-white/70 hover:text-white rounded transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed",
      active ? "bg-yellow-500/20 text-yellow-500 ring-1 ring-yellow-500/30" : "hover:bg-white/10"
    )}
  >
    {icon}
  </button>
);

export default Navbar;

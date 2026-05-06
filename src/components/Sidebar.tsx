import React from 'react';
import { ShapeType, Shape, Connector } from '../types';
import { EXAMPLES, CIRCUIT_CODES, CIRCUIT_EXAMPLES } from '../examples';
import { 
  Cpu, 
  Type, 
  Zap, 
  Lightbulb, 
  Clock, 
  Activity, 
  Grid3X3, 
  Layers,
  ChevronRight, 
  ChevronDown,
  Plus,
  PlusSquare,
  Circle,
  FileUp,
  FileDown,
  Scissors,
  RotateCcw,
  Copy,
  Clipboard,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Undo,
  Redo,
  RotateCw,
  Volume2,
  Monitor,
  Link2Off,
  ToggleLeft,
  Search,
  GitBranch,
  Play,
  StopCircle,
  Square,
  ArrowLeftRight,
  Maximize,
  Minimize
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  onDragStart: (e: React.DragEvent, type: ShapeType) => void;
  selectedShape: Shape | null;
  selectedShapes: Shape[];
  selectedConnector: Connector | null;
  onUpdateShape: (updates: Partial<Shape>) => void;
  onUpdateShapes: (updates: { id: string; label: string }[]) => void;
  onUpdateCommonShapes: (updates: Partial<Shape>) => void;
  onDeleteConnector: (id: string) => void;
  onDisconnectWire: (shapeId: string, type: 'input' | 'output', index: number) => void;
  onLoadExample: (exampleName: string) => void;
  onAddItem: (type: ShapeType, blockId?: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  wireStyle: 'curved' | 'orthogonal' | 'schematic';
  onWireStyleChange: (style: 'curved' | 'orthogonal' | 'schematic') => void;
  gridStyle: 'dots' | 'lines' | 'none';
  onGridStyleChange: (style: 'dots' | 'lines' | 'none') => void;
  gridColor: string;
  onGridColorChange: (color: string) => void;
  shapes: Shape[];
  connectors: Connector[];
  onHighlightPin: (pin: { shapeId: string, type: 'input' | 'output', index: number } | null) => void;
  onHighlightConnector: (id: string | null) => void;
  onConnectShapes: (startShapeId: string, startOutputIndex: number, endShapeId: string, endInputIndex: number) => void;
  onAction: (action: string, meta?: { x?: number, y?: number }) => void;
  customBlocks: Shape[];
  onDeleteCustomBlock: (id: string) => void;
  onSaveCustomBlock: (block: Shape) => void;
  onBurnShape: (id: string) => void;
  onRecoverBurn: (id: string) => void;
  libraryBlocks: Shape[];
  canUndo: boolean;
  canRedo: boolean;
  canvasScale?: 'half' | 'normal' | 'double';
  onCanvasScaleChange?: (scale: 'half' | 'normal' | 'double') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onDragStart, 
  selectedShape, 
  selectedShapes,
  selectedConnector,
  onUpdateShape, 
  onUpdateShapes,
  onUpdateCommonShapes,
  onDeleteConnector,
  onDisconnectWire,
  onLoadExample,
  onAddItem,
  isOpen,
  onToggle,
  wireStyle,
  onWireStyleChange,
  gridStyle,
  onGridStyleChange,
  gridColor,
  onGridColorChange,
  shapes,
  connectors,
  onHighlightPin,
  onHighlightConnector,
  onConnectShapes,
  onAction,
  customBlocks,
  onDeleteCustomBlock,
  onSaveCustomBlock,
  onBurnShape,
  onRecoverBurn,
  libraryBlocks,
  canUndo,
  canRedo,
  canvasScale = 'normal',
  onCanvasScaleChange
}) => {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    settings: true,
    examples: false,
    codes: false,
    pcb: false,
    pcb_components: false,
    input: true,
    output: true,
    gates: true,
    flipflops: true,
    ic74: false,
    ic40: false,
    mcu: false,
    arduino: false,
    analog: false,
    memory: false,
    plexers: true,
    electronics: false,
    architecture: true,
    control: true,
    flowchart: false,
    library: true,
    custom: true
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [codesSearchQuery, setCodesSearchQuery] = React.useState('');
  const [componentSearchQuery, setComponentSearchQuery] = React.useState('');
  const [connectWithTarget, setConnectWithTarget] = React.useState<string | null>(null);
  const [connectWithSourcePin, setConnectWithSourcePin] = React.useState<{type: 'input' | 'output', index: number} | null>(null);
  const [renamePattern, setRenamePattern] = React.useState('Item');
  const [startCorrelative, setStartCorrelative] = React.useState(0);
  const [isDescending, setIsDescending] = React.useState(false);

  const handleBulkRename = () => {
    if (selectedShapes.length === 0) return;
    
    // Sort selected shapes to have a logical order for renaming (top-down, then left-right)
    const sorted = [...selectedShapes].sort((a, b) => {
      if (Math.abs(a.y - b.y) > 10) return a.y - b.y;
      return a.x - b.x;
    });

    const updates = sorted.map((shape, index) => {
      const correlative = isDescending ? startCorrelative - index : startCorrelative + index;
      return {
        id: shape.id,
        label: `${renamePattern}${correlative}`
      };
    });

    onUpdateShapes(updates);
  };

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const filteredExamples = Object.keys(EXAMPLES).filter(name => 
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const architectureComponents = React.useMemo(() => {
    const components: { type: ShapeType; label: string; data: Shape }[] = [];
    const seenTypes = new Set<string>();

    const excludedTypes = new Set([
      // Input Controls
      'InputL', 'PushButton', 'ToggleSwitch', 'HighConstant', 'LowConstant', 
      'PassSwitch', 'Clock', 'Clock_ms', 'Clock_Hz_Adj', 'Clock_ms_Adj', 'GatedClock',
      // Output Controls
      'OutPutL', 'LED_SMD', 'Oscilloscope', 'Display7Segment', 'Display8Segment', 
      'Display9Segment', 'Display14Segment', 'Display16Segment', 'DotMatrixDisplay', 
      'DisplayBCD', 'Display7SegmentSigned', 'Display2Digit', 'Display4Digit', 
      'Buzzer', 'Motor', 'RGB_LED', 'OLED_Display', 'Screen', 'XYScreen', 'Bus', 'Bus8', 'Bus16'
    ]);

    CIRCUIT_EXAMPLES.forEach(name => {
      if (name.toLowerCase().includes('synthbite-16')) {
        const example = EXAMPLES[name];
        if (example) {
          example.shapes.forEach(shape => {
            const label = shape.label || '';
            const type = shape.type || '';
            const isOutput = label.toLowerCase().includes('output') || label.toLowerCase().includes('ouput') || 
                             type.toLowerCase().includes('output') || type.toLowerCase().includes('ouput');
            const isGate = label.toUpperCase() === 'GATE' || type.toUpperCase() === 'GATE';

            if (!seenTypes.has(shape.type) && !excludedTypes.has(shape.type) && !isOutput && !isGate) {
              seenTypes.add(shape.type);
              components.push({
                type: shape.type,
                label: shape.label,
                data: JSON.parse(JSON.stringify(shape))
              });
            }
          });
        }
      }
    });

    const sorted = components.sort((a, b) => (a.label || a.type).localeCompare(b.label || b.type));
    if (sorted.length > 0) {
      sorted.pop();
    }
    return sorted;
  }, []);

  const filteredArchitectureComponents = architectureComponents.filter(comp =>
    (comp.label || comp.type).toLowerCase().includes(componentSearchQuery.toLowerCase())
  );

  const isDisplay = (type: string) => {
    return [
      'Display7Segment', 'Display8Segment', 'Display9Segment', 
      'Display14Segment', 'Display16Segment', 'DotMatrixDisplay', 
      'DisplayBCD', 'Display4Digit'
    ].includes(type);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      <aside className={cn(
        "h-full bg-dk-dark-bg border-r border-dk-darker-bg overflow-y-auto flex flex-col select-none transition-all duration-300 z-50",
        "fixed md:relative",
        isOpen ? "w-[var(--sidebar-width)] translate-x-0" : "w-0 md:w-16 -translate-x-full md:translate-x-0"
      )}>
        <div className={cn(
          "flex items-center justify-between p-4 border-b border-dk-darker-bg min-w-[var(--sidebar-width)] md:min-w-0",
          !isOpen && "md:justify-center md:px-0"
        )}>
          {isOpen ? (
            <>
              <div className="flex items-center gap-2">
                <Cpu className="text-yellow-500 w-6 h-6" />
                <h1 className="font-orbitron font-bold text-lg tracking-tight">
                  Logic<span className="text-yellow-500">Lab</span>
                </h1>
              </div>
              <button 
                onClick={onToggle}
                className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button 
              onClick={onToggle}
              className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors hidden md:block"
            >
              <PanelLeftOpen className="w-6 h-6" />
            </button>
          )}
          
          {/* Mobile Close Button */}
          <button 
            onClick={onToggle}
            className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className={cn(
          "flex-1 p-4 flex flex-col gap-6",
          !isOpen && "md:hidden"
        )}>
          {/* Component Search */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search components..."
                className="w-full bg-dk-dark-bg border border-dk-darker-bg rounded-lg p-2.5 text-xs focus:outline-none focus:border-yellow-500/50 pl-10 transition-all shadow-inner"
                value={componentSearchQuery}
                onChange={(e) => setComponentSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              {componentSearchQuery && (
                <button 
                  onClick={() => setComponentSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {componentSearchQuery && (
              <div className="bg-dk-darker-bg/50 rounded-xl border border-white/5 p-2 max-h-[400px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2 px-2">Search Results</div>
                <div className="grid gap-1">
                  {[
                    ...ALL_COMPONENTS.map(c => ({ ...c, isLibrary: false, isArchitecture: false, id: undefined, data: undefined as any })),
                    ...libraryBlocks.map(b => ({ type: 'CustomBlock' as ShapeType, label: b.label, icon: <BookOpen className="w-4 h-4 text-blue-400" />, isLibrary: true, isArchitecture: false, id: b.id, data: undefined as any })),
                    ...architectureComponents.map(a => ({ type: a.type, label: a.label, icon: <Cpu className="w-4 h-4 text-purple-400" />, isLibrary: false, isArchitecture: true, id: undefined, data: a.data }))
                  ].filter(c => 
                    (c.label || '').toLowerCase().includes(componentSearchQuery.toLowerCase()) ||
                    (c.type || '').toLowerCase().includes(componentSearchQuery.toLowerCase())
                  ).map((comp, idx) => (
                    comp.isLibrary ? (
                      <div key={`lib-${comp.id}-${idx}`} className="group relative">
                        <div 
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('shapeType', 'CustomBlock');
                            e.dataTransfer.setData('customBlockId', comp.id!);
                            e.dataTransfer.setData('isLibraryBlock', 'true');
                          }}
                          onClick={() => onAddItem('CustomBlock', comp.id)}
                          className="flex items-center gap-3 p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg cursor-grab active:cursor-grabbing transition-all"
                        >
                          <div className="p-1.5 bg-blue-500/20 rounded-md">
                            <BookOpen className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-blue-100 truncate">{comp.label}</div>
                            <div className="text-[9px] text-blue-400/60 font-mono">Library Block</div>
                          </div>
                        </div>
                      </div>
                    ) : comp.isArchitecture ? (
                      <div 
                        key={`arch-${comp.type}-${comp.label}-${idx}`}
                        draggable
                        onDragStart={(e) => {
                          onDragStart(e, comp.type);
                          if (comp.data) {
                            e.dataTransfer.setData('architectureShapeData', JSON.stringify(comp.data));
                          }
                        }}
                        onClick={() => onAddItem(comp.type)}
                        className="flex items-center gap-3 p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg cursor-grab active:cursor-grabbing transition-all group"
                      >
                        <div className="p-1.5 bg-purple-500/20 rounded-md group-hover:bg-purple-500/30 transition-colors">
                          <Cpu className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-purple-100 truncate uppercase tracking-tighter">
                            {comp.label || comp.type}
                          </div>
                          <div className="text-[8px] text-purple-500/60 font-mono italic">
                            Architecture
                          </div>
                        </div>
                        <Plus className="w-3 h-3 text-purple-500/30 group-hover:text-purple-400 transition-colors" />
                      </div>
                    ) : (
                      <DraggableItem 
                        key={`${comp.type}-${idx}`}
                        type={comp.type}
                        label={comp.label}
                        icon={comp.icon}
                        onDragStart={onDragStart}
                        onAddItem={onAddItem}
                      />
                    )
                  ))}
                  {([...ALL_COMPONENTS, ...libraryBlocks, ...architectureComponents]).filter(c => 
                    (c.label || '').toLowerCase().includes(componentSearchQuery.toLowerCase()) ||
                    (c.type || '').toLowerCase().includes(componentSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="text-[10px] text-gray-500 text-center py-4 italic">No components found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Properties Panel */}
      {selectedShapes.length > 1 && (
        <div className="bg-dk-darker-bg p-4 rounded-xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-4 flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Propiedades Comunes ({selectedShapes.length})
            </div>
          </div>
          
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Color</label>
                <input
                  type="color"
                  className="w-full h-8 bg-black/40 border border-white/5 rounded-lg focus:outline-none cursor-pointer"
                  onChange={(e) => onUpdateCommonShapes({ color: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Rotación</label>
                <div className="flex items-center gap-1">
                  {[0, 90, 180, 270].map(deg => (
                    <button
                      key={deg}
                      onClick={() => onUpdateCommonShapes({ rotation: deg })}
                      className="flex-1 bg-dk-dark-bg border border-white/5 rounded py-1 text-[8px] text-white hover:bg-white/10 transition-all font-bold"
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Escala</label>
                <div className="flex items-center gap-1">
                  {[0.5, 1, 1.5, 2].map(s => (
                    <button
                      key={s}
                      onClick={() => onUpdateCommonShapes({ scale: s })}
                      className="flex-1 bg-dk-dark-bg border border-white/5 rounded py-1 text-[8px] text-white hover:bg-white/10 transition-all font-bold"
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Etiqueta Común</label>
                <input
                  type="text"
                  className="w-full bg-dk-dark-bg border border-white/5 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
                  placeholder="Definir etiqueta..."
                  onBlur={(e) => e.target.value && onUpdateCommonShapes({ label: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).value && onUpdateCommonShapes({ label: (e.currentTarget as HTMLInputElement).value })}
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2 block">Renombrado por Lote</label>
              <div className="space-y-2 bg-black/20 p-2 rounded-lg border border-white/5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-500 uppercase font-bold px-1">Patrón</label>
                    <input
                      type="text"
                      className="w-full bg-dk-dark-bg border border-white/5 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-yellow-500/50"
                      value={renamePattern}
                      onChange={(e) => setRenamePattern(e.target.value)}
                      placeholder="Ej: D"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-500 uppercase font-bold px-1">Inicio</label>
                    <input
                      type="number"
                      className="w-full bg-dk-dark-bg border border-white/5 rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                      value={startCorrelative}
                      onChange={(e) => setStartCorrelative(parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between px-1">
                  <label className="text-[8px] text-gray-500 uppercase font-bold">Orden</label>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setIsDescending(false)}
                      className={cn(
                        "p-1 rounded text-[8px] font-bold transition-all",
                        !isDescending ? "bg-yellow-500 text-black" : "bg-white/5 text-gray-500 hover:text-white"
                      )}
                    >
                      ASC
                    </button>
                    <button 
                      onClick={() => setIsDescending(true)}
                      className={cn(
                        "p-1 rounded text-[8px] font-bold transition-all",
                        isDescending ? "bg-yellow-500 text-black" : "bg-white/5 text-gray-500 hover:text-white"
                      )}
                    >
                      DESC
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleBulkRename}
                  className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all mt-1"
                >
                  Renombrar Seleccionados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedShape && selectedShapes.length <= 1 && (
        <div className="bg-dk-darker-bg p-4 rounded-xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-4 flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Component Properties
            </div>
            <span className="opacity-40 font-mono bg-white/5 px-1.5 py-0.5 rounded">ID: {selectedShape.id.substring(0, 6)}</span>
          </div>
          
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Type</label>
                <div className="text-[11px] font-mono text-white/90 bg-black/40 px-2 py-1.5 rounded-lg border border-white/5">
                  {selectedShape.type}
                </div>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Label</label>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50 transition-all"
                  value={selectedShape.label}
                  onChange={(e) => onUpdateShape({ label: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Rotation</label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onUpdateShape({ rotation: ((selectedShape.rotation || 0) + 90) % 360 })}
                  className="flex-1 bg-dk-dark-bg border border-white/5 rounded-lg px-3 py-2 text-xs text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                </button>
                <div className="text-[11px] font-mono text-yellow-500 bg-black/40 px-2 py-2 rounded-lg border border-white/5 w-12 text-center">
                  {selectedShape.rotation || 0}°
                </div>
              </div>
            </div>

            {/* Connect With Feature */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest block">Connect With</label>
              <div className="space-y-2">
                <select 
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                  value={connectWithTarget || ''}
                  onChange={(e) => setConnectWithTarget(e.target.value || null)}
                >
                  <option value="">Select target component...</option>
                  {shapes.filter(s => s.id !== selectedShape.id).map(s => (
                    <option key={s.id} value={s.id}>{s.label} ({s.type})</option>
                  ))}
                </select>

                {connectWithTarget && (
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">From Pin</label>
                      <select 
                        className="w-full bg-black/40 border border-white/5 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none"
                        onChange={(e) => {
                          const [type, index] = e.target.value.split('-');
                          setConnectWithSourcePin({ type: type as any, index: parseInt(index) });
                        }}
                      >
                        <option value="">Select pin...</option>
                        {selectedShape.outputs.map((o, i) => (
                          <option key={`out-${i}`} value={`output-${i}`}>Out: {o.label || i}</option>
                        ))}
                        {selectedShape.inputs.map((in_p, i) => (
                          <option key={`in-${i}`} value={`input-${i}`}>In: {in_p.label || i}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">To Pin</label>
                      <select 
                        className="w-full bg-black/40 border border-white/5 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none"
                        onChange={(e) => {
                          if (!connectWithSourcePin) return;
                          const targetShape = shapes.find(s => s.id === connectWithTarget);
                          if (!targetShape) return;
                          
                          const [targetType, targetIndex] = e.target.value.split('-');
                          const idx = parseInt(targetIndex);

                          // Logic: Connect output to input
                          if (connectWithSourcePin.type === 'output' && targetType === 'input') {
                            onConnectShapes(selectedShape.id, connectWithSourcePin.index, targetShape.id, idx);
                          } else if (connectWithSourcePin.type === 'input' && targetType === 'output') {
                            onConnectShapes(targetShape.id, idx, selectedShape.id, connectWithSourcePin.index);
                          }
                          
                          setConnectWithTarget(null);
                          setConnectWithSourcePin(null);
                        }}
                      >
                        <option value="">Select pin...</option>
                        {shapes.find(s => s.id === connectWithTarget)?.inputs.map((in_p, i) => (
                          <option key={`in-${i}`} value={`input-${i}`}>In: {in_p.label || i}</option>
                        ))}
                        {shapes.find(s => s.id === connectWithTarget)?.outputs.map((o, i) => (
                          <option key={`out-${i}`} value={`output-${i}`}>Out: {o.label || i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pins Section - Scrollable if too many */}
            {(selectedShape.inputs.length > 0 || selectedShape.outputs.length > 0) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest block">Pin Configuration</label>
                  <span className="text-[9px] text-gray-600 font-mono">{selectedShape.inputs.length} IN / {selectedShape.outputs.length} OUT</span>
                </div>
                
                <div className="max-h-[240px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {selectedShape.inputs.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[8px] text-blue-400/50 uppercase font-bold tracking-tighter ml-1">Inputs</div>
                      <div className="grid gap-1">
                        {selectedShape.inputs.map((input, idx) => (
                          <div 
                            key={`in-${idx}`} 
                            className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5 group hover:border-blue-500/30 transition-all"
                            onMouseEnter={() => onHighlightPin({ shapeId: selectedShape.id, type: 'input', index: idx })}
                            onMouseLeave={() => onHighlightPin(null)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[8px] font-mono text-blue-400">
                                {idx}
                              </div>
                              <span className="text-[11px] text-gray-300 font-medium">{input.label || `Input ${idx}`}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {connectors.find(c => c.endShapeId === selectedShape.id && c.endInputIndex === idx) && (
                                <div className="text-[9px] text-blue-400/60 font-mono bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10">
                                  ← {shapes.find(s => s.id === connectors.find(c => c.endShapeId === selectedShape.id && c.endInputIndex === idx)?.startShapeId)?.label || 'Unknown'}
                                </div>
                              )}
                              <button 
                                onClick={() => onDisconnectWire(selectedShape.id, 'input', idx)}
                                className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                title="Disconnect Wire"
                              >
                                <Link2Off className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedShape.outputs.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[8px] text-green-400/50 uppercase font-bold tracking-tighter ml-1">Outputs</div>
                      <div className="grid gap-1">
                        {selectedShape.outputs.map((output, idx) => (
                          <div 
                            key={`out-${idx}`} 
                            className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5 group hover:border-green-500/30 transition-all"
                            onMouseEnter={() => onHighlightPin({ shapeId: selectedShape.id, type: 'output', index: idx })}
                            onMouseLeave={() => onHighlightPin(null)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-[8px] font-mono text-green-400">
                                {idx}
                              </div>
                              <span className="text-[11px] text-gray-300 font-medium">{output.label || `Output ${idx}`}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {connectors.filter(c => c.startShapeId === selectedShape.id && c.startOutputIndex === idx).length > 0 && (
                                <div className="text-[9px] text-green-400/60 font-mono bg-green-500/5 px-1.5 py-0.5 rounded border border-green-500/10">
                                  → {connectors.filter(c => c.startShapeId === selectedShape.id && c.startOutputIndex === idx).length} connections
                                </div>
                              )}
                              <button 
                                onClick={() => onDisconnectWire(selectedShape.id, 'output', idx)}
                                className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                title="Disconnect Wire"
                              >
                                <Link2Off className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Active Connections Section */}
            {(connectors.some(c => c.startShapeId === selectedShape.id || c.endShapeId === selectedShape.id)) && (
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest block">Active Connections</label>
                  <Activity className="w-3.5 h-3.5 text-yellow-500/50" />
                </div>
                <div className="space-y-1 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                  {connectors.filter(c => c.startShapeId === selectedShape.id).map(conn => {
                    const target = shapes.find(s => s.id === conn.endShapeId);
                    return (
                      <div 
                        key={conn.id} 
                        className="flex items-center justify-between bg-black/30 px-2 py-1.5 rounded-lg border border-white/5 group hover:border-green-500/50 cursor-pointer transition-all"
                        onClick={() => onHighlightConnector(conn.id)}
                        onMouseEnter={() => onHighlightConnector(conn.id)}
                        onMouseLeave={() => onHighlightConnector(null)}
                      >
                        <div className="flex flex-col truncate">
                          <div className="text-[9px] text-green-400 font-bold uppercase tracking-tighter">Output {conn.startOutputIndex}</div>
                          <div className="text-[10px] text-gray-300 truncate">→ {target?.label || target?.type || 'Unknown'} (In {conn.endInputIndex})</div>
                        </div>
                        <button 
                          onClick={() => onDeleteConnector(conn.id)}
                          className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                          title="Disconnect"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  {connectors.filter(c => c.endShapeId === selectedShape.id).map(conn => {
                    const source = shapes.find(s => s.id === conn.startShapeId);
                    return (
                      <div 
                        key={conn.id} 
                        className="flex items-center justify-between bg-black/30 px-2 py-1.5 rounded-lg border border-white/5 group hover:border-blue-500/50 cursor-pointer transition-all"
                        onClick={() => onHighlightConnector(conn.id)}
                        onMouseEnter={() => onHighlightConnector(conn.id)}
                        onMouseLeave={() => onHighlightConnector(null)}
                      >
                        <div className="flex flex-col truncate">
                          <div className="text-[9px] text-blue-400 font-bold uppercase tracking-tighter">Input {conn.endInputIndex}</div>
                          <div className="text-[10px] text-gray-300 truncate">← {source?.label || source?.type || 'Unknown'} (Out {conn.startOutputIndex})</div>
                        </div>
                        <button 
                          onClick={() => onDeleteConnector(conn.id)}
                          className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                          title="Disconnect"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="pt-2 space-y-4 border-t border-white/5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest block">Size / Scale</label>
                  <button 
                    onClick={() => onUpdateShape({ scale: 1 })}
                    className="text-[9px] text-yellow-500 hover:text-yellow-400 font-bold transition-colors flex items-center gap-1"
                    title="Reset to original size"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Reset
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="0.5"
                    max="3"
                    step="0.1"
                    className="flex-1 accent-yellow-500"
                    value={selectedShape.scale || 1}
                    onChange={(e) => onUpdateShape({ scale: parseFloat(e.target.value) })}
                  />
                  <span className="text-xs font-mono text-yellow-500 w-10 text-right">{selectedShape.scale || 1}x</span>
                </div>
              </div>

              {selectedShape.type === 'CustomBlock' && (
                <div className="pt-2 border-t border-white/5 space-y-2">
                  {!selectedShape.isBurned && (
                    <button 
                      onClick={() => onBurnShape(selectedShape.id)}
                      className="w-full bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 border border-orange-500/30 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      title="Compilar y quemar lógica para optimización extrema"
                    >
                      <Activity className="w-4 h-4" /> Compilar / Quemar IC
                    </button>
                  )}
                  {selectedShape.isBurned && (
                    <button 
                      onClick={() => onRecoverBurn(selectedShape.id)}
                      className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      title="Restaurar simulación dinámica de puertas"
                    >
                      <RotateCcw className="w-4 h-4" /> Restaurar Lógica
                    </button>
                  )}
                  {selectedShape.isBurned && (
                    <div className="w-full bg-orange-600/10 text-orange-400 border border-orange-500/20 py-2 px-3 rounded-xl text-[10px] font-bold text-center flex items-center justify-center gap-2">
                      <Zap className="w-3.5 h-3.5" /> IC Consolidado (Optimizado)
                    </div>
                  )}
                  
                  {!customBlocks.some(cb => cb.label === selectedShape.label) && (
                  <button 
                    onClick={() => onSaveCustomBlock(selectedShape)}
                    className="w-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <PlusSquare className="w-4 h-4" /> Registrar en Biblioteca
                  </button>
                )}
                {customBlocks.some(cb => cb.label === selectedShape.label) && (
                  <div className="w-full bg-green-600/10 text-green-400 border border-green-500/20 py-2 px-3 rounded-xl text-[10px] font-bold text-center">
                    Registrado en Biblioteca
                  </div>
                )}
              </div>
            )}

            {isDisplay(selectedShape.type) && (
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Display Color</label>
                <div className="flex gap-2">
                    {[
                      { name: 'Red', color: '#ef4444' },
                      { name: 'Green', color: '#22c55e' },
                      { name: 'Blue', color: '#3b82f6' },
                      { name: 'White', color: '#ffffff' }
                    ].map((c) => (
                      <button
                        key={c.name}
                        onClick={() => onUpdateShape({ color: c.color })}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          selectedShape.color === c.color ? "border-yellow-500 scale-110 shadow-lg" : "border-white/10 hover:border-white/30"
                        )}
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {(selectedShape.frequency !== undefined || selectedShape.type === 'Clock' || selectedShape.type === 'Clock_ms' || selectedShape.type === 'Clock_Hz_Adj' || selectedShape.type === 'Clock_ms_Adj' || selectedShape.type === 'Screen') && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">
                    { (selectedShape.type === 'Clock_ms' || selectedShape.type === 'Clock_ms_Adj') ? 'Period (ms)' : 'Frequency (Hz)' }
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      step={ (selectedShape.type === 'Clock_ms' || selectedShape.type === 'Clock_ms_Adj') ? "1" : "0.1" }
                      min="0.001"
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                      value={ (selectedShape.type === 'Clock_ms' || selectedShape.type === 'Clock_ms_Adj') ? (1000 / (selectedShape.frequency || 1)).toFixed(0) : (selectedShape.frequency || 1) }
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          if (selectedShape.type === 'Clock_ms' || selectedShape.type === 'Clock_ms_Adj') {
                            onUpdateShape({ frequency: 1000 / val });
                          } else {
                            onUpdateShape({ frequency: val });
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedShape.phase !== undefined && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Phase (°)</label>
                  <input
                    type="number"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={selectedShape.phase}
                    onChange={(e) => onUpdateShape({ phase: parseFloat(e.target.value) })}
                  />
                </div>
              )}

              {selectedShape.offset !== undefined && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Offset (V/A)</label>
                  <input
                    type="number"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={selectedShape.offset}
                    onChange={(e) => onUpdateShape({ offset: parseFloat(e.target.value) })}
                  />
                </div>
              )}

              {selectedShape.dutyCycle !== undefined && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Duty Cycle (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={selectedShape.dutyCycle}
                    onChange={(e) => onUpdateShape({ dutyCycle: parseFloat(e.target.value) })}
                  />
                </div>
              )}

              {selectedShape.resistance !== undefined && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Resistance (Ω)</label>
                  <input
                    type="number"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={selectedShape.resistance}
                    onChange={(e) => onUpdateShape({ resistance: parseFloat(e.target.value) })}
                  />
                </div>
              )}

              {selectedShape.capacitance !== undefined && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Capacitance (F)</label>
                  <input
                    type="number"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={selectedShape.capacitance}
                    onChange={(e) => onUpdateShape({ capacitance: parseFloat(e.target.value) })}
                  />
                </div>
              )}

              {selectedShape.inductance !== undefined && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Inductance (H)</label>
                  <input
                    type="number"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={selectedShape.inductance}
                    onChange={(e) => onUpdateShape({ inductance: parseFloat(e.target.value) })}
                  />
                </div>
              )}

              {selectedShape.voltage !== undefined && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Voltage (V)</label>
                  <input
                    type="number"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={selectedShape.voltage}
                    onChange={(e) => onUpdateShape({ voltage: parseFloat(e.target.value) })}
                  />
                </div>
              )}

              {selectedShape.current !== undefined && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Current (A)</label>
                  <input
                    type="number"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={selectedShape.current}
                    onChange={(e) => onUpdateShape({ current: parseFloat(e.target.value) })}
                  />
                </div>
              )}

              {selectedShape.gain !== undefined && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">
                    {selectedShape.type === 'VCCS' ? 'Transconductance (G)' : 
                     selectedShape.type === 'VCVS' ? 'Voltage Gain (A)' :
                     selectedShape.type === 'CCCS' ? 'Current Gain (B)' :
                     selectedShape.type === 'CCVS' ? 'Transresistance (R)' : 'Gain'}
                  </label>
                  <input
                    type="number"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={selectedShape.gain}
                    onChange={(e) => onUpdateShape({ gain: parseFloat(e.target.value) })}
                  />
                </div>
              )}

              {selectedShape.model !== undefined && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Model / Part Number</label>
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={selectedShape.model}
                    onChange={(e) => onUpdateShape({ model: e.target.value })}
                  />
                </div>
              )}

              {(selectedShape.type === 'IC555' || selectedShape.type === 'IC555_Simple') && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Mode</label>
                  <select 
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={selectedShape.mode || 'astable'}
                    onChange={(e) => onUpdateShape({ mode: e.target.value as any })}
                  >
                    <option value="astable">Astable (Oscillator)</option>
                    <option value="monostable">Monostable (One-Shot)</option>
                    <option value="bistable">Bistable (Flip-Flop)</option>
                  </select>
                </div>
              )}

              {(selectedShape.type === 'OutPutL' || selectedShape.type === 'LED_SMD' || selectedShape.type === 'Text') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">
                      {selectedShape.type === 'Text' ? 'Text Color' : 'Active Color'}
                    </label>
                    <div className="relative group">
                      <input 
                        type="color" 
                        className="w-full h-9 bg-black/40 border border-white/5 rounded-lg cursor-pointer p-1"
                        value={selectedShape.type === 'Text' ? (selectedShape.color || '#e5e7eb') : (selectedShape.onColor || (selectedShape.type === 'OutPutL' ? '#22c55e' : '#eab308'))}
                        onChange={(e) => onUpdateShape({ color: e.target.value, onColor: e.target.value })}
                      />
                    </div>
                  </div>
                  {selectedShape.type !== 'Text' && (
                    <div>
                      <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Idle Color</label>
                      <input 
                        type="color" 
                        className="w-full h-9 bg-black/40 border border-white/5 rounded-lg cursor-pointer p-1"
                        value={selectedShape.offColor || (selectedShape.type === 'OutPutL' ? '#3b82f6' : '#374151')}
                        onChange={(e) => onUpdateShape({ offColor: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}

              {selectedShape.type === 'Text' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Font Size</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="8"
                        max="72"
                        step="1"
                        className="flex-1 accent-yellow-500"
                        value={selectedShape.fontSize || 16}
                        onChange={(e) => {
                          const newSize = parseInt(e.target.value);
                          const family = selectedShape.font?.split(' ')?.[1] || 'Orbitron';
                          onUpdateShape({ 
                            fontSize: newSize,
                            font: `${newSize}px ${family}`
                          });
                        }}
                      />
                      <span className="text-xs font-mono text-yellow-500 w-10 text-right">{selectedShape.fontSize || 16}px</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Font Family</label>
                    <select 
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                      value={selectedShape.font?.split(' ')?.[1] || 'Orbitron'}
                      onChange={(e) => {
                        const size = selectedShape.fontSize || 16;
                        onUpdateShape({ font: `${size}px ${e.target.value}` });
                      }}
                    >
                      <option value="Orbitron">Orbitron</option>
                      <option value="Inter">Inter</option>
                      <option value="monospace">Monospace</option>
                      <option value="serif">Serif</option>
                      <option value="sans-serif">Sans-Serif</option>
                    </select>
                  </div>
                </div>
              )}

              {(['InputL', 'InputControl', 'InputControl_4', 'InputControl_7', 'InputControl_8', 'ToggleSwitch', 'PassSwitch', 'PushButton'] as ShapeType[]).includes(selectedShape.type) && (
                <div className="pt-4 border-t border-white/5">
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-3 block">Output States</label>
                  <div className="space-y-2">
                    {selectedShape.outputs.map((out, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] font-mono text-gray-400 capitalize">
                          {out.label || `Output ${idx + 1}`}
                        </span>
                        <button
                          onClick={() => {
                            const newOutputs = [...selectedShape.outputs];
                            const newValue = out.value === 1 ? 0 : 1;
                            newOutputs[idx] = { ...out, value: newValue };
                            
                            const updates: Partial<Shape> = { outputs: newOutputs };
                            
                            if (selectedShape.type === 'PassSwitch') {
                              updates.state = newValue; // PassSwitch uses state to determine if it passes signal
                            } else if (selectedShape.type === 'PushButton') {
                              updates.isPressed = newValue === 1; // PushButton uses isPressed
                            }
                            
                            // For some components, we also update the main color to reflect the first output
                            if (idx === 0 && (selectedShape.type === 'InputL' || selectedShape.type === 'ToggleSwitch' || selectedShape.type === 'PassSwitch' || selectedShape.type === 'PushButton')) {
                              updates.color = newValue === 1 ? 'green' : (selectedShape.type === 'InputL' ? 'red' : 'gray');
                            }
                            
                            onUpdateShape(updates);
                          }}
                          className={cn(
                            "px-3 py-1 rounded text-[10px] font-bold transition-all active:scale-95",
                            out.value === 1 
                              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          )}
                        >
                          {out.value === 1 ? 'HIGH (1)' : 'LOW (0)'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Position X</label>
                  <input
                    type="number"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={Math.round(selectedShape.x)}
                    onChange={(e) => onUpdateShape({ x: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Position Y</label>
                  <input
                    type="number"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                    value={Math.round(selectedShape.y)}
                    onChange={(e) => onUpdateShape({ y: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedConnector && (
        <div className="bg-dk-darker-bg/50 p-3 rounded-lg border border-dk-darker-bg animate-in fade-in slide-in-from-top-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-3 h-3" /> Wire Properties
          </div>
          <div className="space-y-3">
            <div className="text-[10px] text-gray-500 uppercase font-bold">Connector ID</div>
            <div className="text-xs font-mono text-yellow-500/80 bg-dk-dark-bg p-1 rounded border border-dk-darker-bg truncate">
              {selectedConnector.id}
            </div>
            <button
              onClick={() => onDeleteConnector(selectedConnector.id)}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition-all active:scale-95"
            >
              Delete Wire
            </button>
          </div>
        </div>
      )}

      {/* Component Groups */}
      <div className="space-y-2">
        <Group title="Settings" isOpen={openGroups.settings} onToggle={() => toggleGroup('settings')}>
          <div className="space-y-4 p-2">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block">Wire Style</label>
              <div className="flex flex-wrap bg-dk-dark-bg rounded-lg p-1 border border-white/5 gap-1">
                <button
                  onClick={() => onWireStyleChange('curved')}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold rounded transition-all min-w-[60px]",
                    wireStyle === 'curved' ? "bg-yellow-500 text-dk-darker-bg shadow-lg" : "text-gray-500 hover:text-white"
                  )}
                >
                  Curved
                </button>
                <button
                  onClick={() => onWireStyleChange('orthogonal')}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold rounded transition-all min-w-[60px]",
                    wireStyle === 'orthogonal' ? "bg-yellow-500 text-dk-darker-bg shadow-lg" : "text-gray-500 hover:text-white"
                  )}
                >
                  Orthogonal
                </button>
                <button
                  onClick={() => onWireStyleChange('schematic')}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold rounded transition-all min-w-[60px]",
                    wireStyle === 'schematic' ? "bg-yellow-500 text-dk-darker-bg shadow-lg" : "text-gray-500 hover:text-white"
                  )}
                >
                  Schematic
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block">Grid Style</label>
              <div className="flex flex-wrap bg-dk-dark-bg rounded-lg p-1 border border-white/5 gap-1">
                {(['dots', 'lines', 'none'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => onGridStyleChange(style)}
                    className={cn(
                      "flex-1 py-1.5 text-[10px] font-bold rounded transition-all min-w-[60px] capitalize",
                      gridStyle === style ? "bg-yellow-500 text-dk-darker-bg shadow-lg" : "text-gray-500 hover:text-white"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block">Canvas Size</label>
              <div className="flex flex-wrap bg-dk-dark-bg rounded-lg p-1 border border-white/5 gap-1">
                {(['half', 'normal', 'double'] as const).map((scale) => (
                  <button
                    key={scale}
                    onClick={() => onCanvasScaleChange?.(scale)}
                    className={cn(
                      "flex-1 py-1.5 text-[10px] font-bold rounded transition-all min-w-[60px] capitalize",
                      canvasScale === scale ? "bg-yellow-500 text-dk-darker-bg shadow-lg" : "text-gray-500 hover:text-white"
                    )}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block">Alignment</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAction('align-left')}
                  className="flex items-center justify-center gap-2 py-2 bg-dk-dark-bg border border-white/5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  title="Align Left"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Left
                </button>
                <button
                  onClick={() => onAction('align-right')}
                  className="flex items-center justify-center gap-2 py-2 bg-dk-dark-bg border border-white/5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  title="Align Right"
                >
                  <ArrowRight className="w-3.5 h-3.5" /> Right
                </button>
                <button
                  onClick={() => onAction('align-top')}
                  className="flex items-center justify-center gap-2 py-2 bg-dk-dark-bg border border-white/5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  title="Align Top"
                >
                  <ArrowUp className="w-3.5 h-3.5" /> Top
                </button>
                <button
                  onClick={() => onAction('align-bottom')}
                  className="flex items-center justify-center gap-2 py-2 bg-dk-dark-bg border border-white/5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  title="Align Bottom"
                >
                  <ArrowDown className="w-3.5 h-3.5" /> Bottom
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block">Background Color</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Black', color: '#000000' },
                  { name: 'Celeste', color: '#e0f2fe' },
                  { name: 'White', color: '#ffffff' },
                  { name: 'Sidebar', color: '#313348' }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => onGridColorChange(item.color)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded border transition-all text-[10px] font-bold",
                      gridColor === item.color 
                        ? "bg-yellow-500/10 border-yellow-500 text-yellow-500" 
                        : "bg-dk-dark-bg border-white/5 text-gray-500 hover:text-white hover:border-white/20"
                    )}
                  >
                    <div 
                      className="w-3 h-3 rounded-full border border-white/10" 
                      style={{ backgroundColor: item.color }} 
                    />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block font-orbitron">Diagram Optimization</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAction('optimize-diagram')}
                  className="flex items-center justify-center gap-2 py-2.5 bg-purple-600/20 border border-purple-500/30 rounded-xl text-[10px] font-bold text-purple-400 hover:bg-purple-600/30 transition-all active:scale-95"
                >
                  <Maximize className="w-4 h-4" /> Optimize
                </button>
                <button
                  onClick={() => onAction('reset-scale')}
                  className="flex items-center justify-center gap-2 py-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-[10px] font-bold text-blue-400 hover:bg-blue-600/30 transition-all active:scale-95"
                >
                  <Minimize className="w-4 h-4" /> Reset 1x
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block font-orbitron">History Actions</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAction('undo')}
                  disabled={!canUndo}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 bg-dk-darker-bg border border-white/5 rounded-xl text-[10px] font-bold transition-all active:scale-95",
                    canUndo ? "text-white hover:bg-white/10 hover:border-yellow-500/30" : "text-gray-600 cursor-not-allowed opacity-50"
                  )}
                >
                  <Undo className="w-4 h-4" /> Undo
                </button>
                <button
                  onClick={() => onAction('redo')}
                  disabled={!canRedo}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 bg-dk-darker-bg border border-white/5 rounded-xl text-[10px] font-bold transition-all active:scale-95",
                    canRedo ? "text-white hover:bg-white/10 hover:border-yellow-500/30" : "text-gray-600 cursor-not-allowed opacity-50"
                  )}
                >
                  <Redo className="w-4 h-4" /> Redo
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block">Label / Text</label>
              <DraggableItem 
                type="Text" 
                label="Label / Text" 
                icon={<Type className="w-5 h-5" />} 
                onDragStart={onDragStart} 
                onAddItem={onAddItem} 
              />
            </div>
          </div>
        </Group>

        <Group title="Circuit Examples" isOpen={openGroups.examples} onToggle={() => toggleGroup('examples')}>
          <div className="space-y-2">
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search examples..."
                className="w-full bg-dk-dark-bg border border-dk-darker-bg rounded p-2 text-xs focus:outline-none focus:border-yellow-500/50 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <BookOpen className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {CIRCUIT_EXAMPLES.filter(name => 
                name.toLowerCase().includes(searchQuery.toLowerCase())
              ).length > 0 ? (
                CIRCUIT_EXAMPLES.filter(name => 
                  name.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(name => (
                  <button
                    key={name}
                    onClick={() => onLoadExample(name)}
                    className="w-full flex items-center gap-3 p-2 bg-dk-darker-bg hover:bg-dk-darker-bg/80 border border-dk-darker-bg rounded transition-all hover:border-blue-500/30 group text-left"
                  >
                    <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white truncate">{name}</span>
                  </button>
                ))
              ) : (
                <div className="text-[10px] text-gray-500 text-center py-4 italic">No examples found</div>
              )}
            </div>
          </div>
        </Group>

        <Group title="Circuit Codes" isOpen={openGroups.codes} onToggle={() => toggleGroup('codes')}>
          <div className="space-y-2">
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search codes..."
                className="w-full bg-dk-dark-bg border border-dk-darker-bg rounded p-2 text-xs focus:outline-none focus:border-yellow-500/50 pl-8"
                value={codesSearchQuery}
                onChange={(e) => setCodesSearchQuery(e.target.value)}
              />
              <Zap className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {CIRCUIT_CODES.filter(name => 
                name.toLowerCase().includes(codesSearchQuery.toLowerCase())
              ).length > 0 ? (
                CIRCUIT_CODES.filter(name => 
                  name.toLowerCase().includes(codesSearchQuery.toLowerCase())
                ).map(name => (
                  <button
                    key={name}
                    onClick={() => onLoadExample(name)}
                    className="w-full flex items-center gap-3 p-2 bg-dk-darker-bg hover:bg-dk-darker-bg/80 border border-dk-darker-bg rounded transition-all hover:border-yellow-500/30 group text-left"
                  >
                    <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white truncate">{name}</span>
                  </button>
                ))
              ) : (
                <div className="text-[10px] text-gray-500 text-center py-4 italic">No codes found</div>
              )}
            </div>
          </div>
        </Group>

        <Group title="Input Controls" isOpen={openGroups.input} onToggle={() => toggleGroup('input')}>
          <DraggableItem type="InputL" label="Logic Input" icon={<Zap className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="PushButton" label="Push Button" icon={<PlusSquare className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="ToggleSwitch" label="Toggle Switch" icon={<Zap className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="HighConstant" label="High (1)" icon={<ArrowUp className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="LowConstant" label="Low (0)" icon={<ArrowDown className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="PassSwitch" label="Pass Switch" icon={<Zap className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="InputControl_4" label="Input Control 4" icon={<Zap className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="InputControl_7" label="Input Control 7" icon={<Zap className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Clock" label="Clock" icon={<Clock className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="GatedClock" label="Gated Clock" icon={<Clock className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
        </Group>

        <Group title="Output Controls" isOpen={openGroups.output} onToggle={() => toggleGroup('output')}>
          <DraggableItem type="OutPutL" label="Logic LED" icon={<Lightbulb className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="LED_SMD" label="SMD LED" icon={<Circle className="w-5 h-5 fill-current" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Oscilloscope" label="Oscilloscope" icon={<Activity className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Display7Segment" label="7-Seg Display" icon={<Grid3X3 className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Display16Segment" label="16-Seg Display" icon={<Grid3X3 className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="DotMatrixDisplay" label="Dot-Matrix" icon={<Grid3X3 className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="DisplayBCD" label="4-Bit 7-Seg" icon={<Grid3X3 className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Display7SegmentSigned" label="Signed 7-Seg" icon={<Grid3X3 className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Display2Digit" label="2-Digit 7-Seg" icon={<Grid3X3 className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Display4Digit" label="4-Digit 7-Seg" icon={<Grid3X3 className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Buzzer" label="Buzzer" icon={<Volume2 className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Motor" label="DC Motor" icon={<RotateCw className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="RGB_LED" label="RGB LED" icon={<Circle className="w-5 h-5 fill-current" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="OLED_Display" label="OLED Display" icon={<Monitor className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Screen" label="RGB Screen" icon={<Monitor className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="XYScreen" label="XY RGB Screen" icon={<Monitor className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Bus" label="Bus-7 Wires" icon={<Layers className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Bus8" label="Bus-8 Wires" icon={<Layers className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Bus16" label="Bus-16 Wires" icon={<Layers className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          <DraggableItem type="Splitter" label="8-Bit Splitter" icon={<GitBranch className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
        </Group>

        <Group title="Logic Gates" isOpen={openGroups.gates} onToggle={() => toggleGroup('gates')}>
          <div className="grid grid-cols-2 gap-2">
            <DraggableItem type="AND" label="AND" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="AND3" label="AND 3-In" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="AND4" label="AND 4-In" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="AND5" label="AND 5-In" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="OR" label="OR" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="OR3" label="OR 3-In" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="OR4" label="OR 4-In" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="OR5" label="OR 5-In" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="NOT" label="NOT" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="NAND" label="NAND" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="NAND3" label="NAND 3-In" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="NAND4" label="NAND 4-In" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="NOR" label="NOR" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="NOR3" label="NOR 3-In" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="NOR4" label="NOR 4-In" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="XOR" label="XOR" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="XOR3" label="XOR 3-In" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="XOR4" label="XOR 4-In" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="XNOR" label="XNOR" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Buffer" label="Buffer" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="ThreeState" label="Three State" onDragStart={onDragStart} onAddItem={onAddItem} />
          </div>
        </Group>

        <Group title="Flip Flops & Latches" isOpen={openGroups.flipflops} onToggle={() => toggleGroup('flipflops')}>
          <div className="grid grid-cols-2 gap-2">
            <DraggableItem type="SR_Flip_Flop" label="SR FF" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="D_Flip_Flop" label="D FF" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="T_Flip_Flop" label="T FF" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="JK_Flip_Flop" label="JK FF" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="D_Latch" label="D Latch" onDragStart={onDragStart} onAddItem={onAddItem} />
          </div>
        </Group>

        <Group title="7400 Series ICs" isOpen={openGroups.ic74} onToggle={() => toggleGroup('ic74')}>
          <div className="grid grid-cols-2 gap-2">
            <DraggableItem type="IC7408" label="7408 (AND)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7400" label="7400 (NAND)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7432" label="7432 (OR)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7402" label="7402 (NOR)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7486" label="7486 (XOR)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7404" label="7404 (NOT)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7410" label="7410 (3-NAND)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7420" label="7420 (4-NAND)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7430" label="7430 (8-NAND)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7445" label="7445 (BCD)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7447" label="7447 (BCD-7S)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7490" label="7490 (Decade)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7493" label="7493 (4-Bit)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC74160" label="74160 (Decade)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC74161" label="74161 (Counter)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC74138" label="74138 (Decoder)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC74151" label="74151 (Mux 8:1)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC74153" label="74153 (Mux 4:1)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC74HC595" label="74HC595 (SR)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC74173" label="74173 (Register)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC74175" label="74175 (Quad D-FF)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC74139" label="74139 (Dual Decoder)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7485" label="7485 (Comp)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC7448" label="7448 (BCD-7S)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC74181" label="74181 (ALU)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC74245" label="74245 (XCVR)" onDragStart={onDragStart} onAddItem={onAddItem} />
          </div>
        </Group>

        <Group title="4000 Series CMOS" isOpen={openGroups.ic40} onToggle={() => toggleGroup('ic40')}>
          <div className="grid grid-cols-2 gap-2">
            <DraggableItem type="IC4001" label="4001 (NOR)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC4011" label="4011 (NAND)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC4071" label="4071 (OR)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC4081" label="4081 (AND)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC4069" label="4069 (NOT)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC4013" label="4013 (D-FF)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC4017" label="4017 (Decade)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC4049" label="4049 (Buffer)" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC4066" label="4066 (Switch)" onDragStart={onDragStart} onAddItem={onAddItem} />
          </div>
        </Group>

        <Group title="Microcontrollers" isOpen={openGroups.mcu} onToggle={() => toggleGroup('mcu')}>
          <div className="grid grid-cols-2 gap-2">
            <DraggableItem type="LGT8F328P" label="LGT8F328P" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="ATmega328P" label="ATmega328P" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="ATmega16U2" label="ATmega16U2" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="ATmega16" label="ATmega16" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="ATtiny85" label="ATtiny85" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PIC18F2520" label="PIC18F2520" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="ESP32" label="ESP32" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="RP2040" label="RP2040" onDragStart={onDragStart} onAddItem={onAddItem} />
          </div>
        </Group>

        <Group title="Memory & Registers" isOpen={openGroups.memory} onToggle={() => toggleGroup('memory')}>
          <div className="grid grid-cols-2 gap-2">
            <DraggableItem type="SRAM" label="SRAM 2KB" icon={<Cpu className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="EEPROM" label="EEPROM" icon={<Cpu className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="MAR_8Bit" label="MAR (Address Reg)" icon={<Cpu className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          </div>
        </Group>

        <Group title="PLEXERS" isOpen={openGroups.plexers} onToggle={() => toggleGroup('plexers')}>
          <div className="grid grid-cols-2 gap-2">
            <DraggableItem type="Multiplexer_Gen" label="Multiplexer" icon={<Layers className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Demultiplexer_Gen" label="Demultiplexer" icon={<Layers className="w-5 h-5 rotate-180" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Decoder_Gen" label="Decoder" icon={<Grid3X3 className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PriorityEncoder_Gen" label="Priority Encoder" icon={<Activity className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="BitSelector_Gen" label="Bit Selector" icon={<Scissors className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          </div>
        </Group>

        <Group title="Analog & Power" isOpen={openGroups.analog} onToggle={() => toggleGroup('analog')}>
          <div className="grid grid-cols-2 gap-2">
            <DraggableItem type="IC555_Simple" label="555 Timer" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="LM741" label="LM741 Op-Amp" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="LM358" label="LM358 Dual" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="LM324" label="LM324 Quad" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="LM311" label="LM311 Comp" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="LM386" label="LM386 Audio" onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="ICMAX7219" label="MAX7219 Driver" onDragStart={onDragStart} onAddItem={onAddItem} />
          </div>
        </Group>

        <Group title="Electronics" isOpen={openGroups.electronics} onToggle={() => toggleGroup('electronics')}>
          <div className="grid grid-cols-2 gap-2">
            <DraggableItem type="Resistor" label="Resistor" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Preset_Resistor" label="Preset Resistor" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Attenuator" label="Attenuator" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Capacitor" label="Capacitor" icon={<Grid3X3 className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Trimmer_Capacitor" label="Trimmer Cap" icon={<Grid3X3 className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Inductor" label="Inductor" icon={<RotateCw className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Heater" label="Heater" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Diode" label="Diode" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Zener_Diode" label="Zener Diode" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Schottky_Diode" label="Schottky Diode" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Photodiode" label="Photodiode" icon={<Lightbulb className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="LED" label="LED" icon={<Lightbulb className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Neon_Lamp" label="Neon Lamp" icon={<Lightbulb className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Fluorescent_Lamp" label="Fluor. Lamp" icon={<Lightbulb className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Transistor_NPN" label="NPN Transistor" icon={<Cpu className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Transistor_PNP" label="PNP Transistor" icon={<Cpu className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Potentiometer" label="Potentiometer" icon={<RotateCw className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Cell" label="Cell" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Battery" label="Battery" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="DC_Voltage_Source" label="DC Voltage" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="AC_Voltage_Source" label="AC Voltage" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Voltage_Source_Ideal" label="Ideal Voltage" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Current_Source_Ideal" label="Ideal Current" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="DC_Current_Source" label="DC Current" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="AC_Current_Source" label="AC Current" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Step_Voltage_Source" label="Step Voltage" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Step_Current_Source" label="Step Current" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PWL_Voltage_Source" label="PWL Voltage" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PWL_Current_Source" label="PWL Current" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Pulse_Generator" label="Pulse Gen" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Sawtooth_Generator" label="Sawtooth Gen" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Step_Generator" label="Step Gen" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="OpAmp" label="Op-Amp" icon={<Cpu className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Node_Label" label="Node Label" icon={<Type className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Coil" label="Coil" icon={<RotateCw className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Fuse" label="Fuse" icon={<Scissors className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Fuse_IEC" label="Fuse (IEC)" icon={<Scissors className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Regulator" label="Regulator" icon={<Cpu className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="VCC" label="VCC (+V)" icon={<ArrowUp className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="GND" label="GND (0V)" icon={<ArrowDown className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="GND_Earth" label="GND Earth" icon={<ArrowDown className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="GND_Protective" label="GND Prot." icon={<ArrowDown className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="GND_Signal" label="GND Signal" icon={<ArrowDown className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Relay" label="Relay" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Transformer" label="Transformer" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Bridge_Rectifier" label="Bridge Rectifier" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Darlington_NPN" label="Darlington NPN" icon={<Cpu className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Darlington_PNP" label="Darlington PNP" icon={<Cpu className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Variable_Capacitor" label="Var. Capacitor" icon={<Grid3X3 className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Polarized_Capacitor" label="Pol. Capacitor" icon={<Grid3X3 className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Crystal" label="Crystal" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Speaker" label="Speaker" icon={<Volume2 className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Antenna" label="Antenna" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Lamp" label="Lamp" icon={<Lightbulb className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Microphone" label="Microphone" icon={<Volume2 className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="LDR" label="LDR" icon={<Lightbulb className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="SCR" label="SCR" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="DIAC" label="DIAC" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="TRIAC" label="TRIAC" icon={<Zap className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="IC555" label="555 Timer" icon={<Cpu className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Wattmeter" label="Wattmeter" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Varmeter" label="Varmeter" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Hz_Meter" label="Hz Meter" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Hour_Meter" label="Hour Meter" icon={<Clock className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="Thermometer_Symbol" label="Thermometer" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          </div>
        </Group>

        <Group title="Control Blocks" isOpen={openGroups.control} onToggle={() => toggleGroup('control')}>
          <div className="grid grid-cols-2 gap-2">
            <DraggableItem type="LB1" label="LB1 Block" icon={<Cpu className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="SUM1" label="SUM (+/-)" icon={<PlusSquare className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="SUM2" label="SUM (+/+)" icon={<PlusSquare className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="MUL1" label="MUL (×)" icon={<X className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PWM_Block" label="PWM Block" icon={<Activity className="w-4 h-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          </div>
        </Group>

        <Group title="Flowchart" isOpen={openGroups.flowchart} onToggle={() => toggleGroup('flowchart')}>
          <div className="grid grid-cols-2 gap-2 p-1">
            <DraggableItem type="FlowStart" label="Start" icon={<Play className="w-5 h-5 text-green-500" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="FlowProcess" label="Process" icon={<Square className="w-5 h-5 text-blue-500" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="FlowDecision" label="Decision" icon={<GitBranch className="w-5 h-5 text-yellow-500" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="FlowInputOutput" label="Data (I/O)" icon={<ArrowLeftRight className="w-5 h-5 text-purple-500" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="FlowEnd" label="End" icon={<StopCircle className="w-5 h-5 text-red-500" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          </div>
        </Group>

        <Group title="PCB Components" isOpen={openGroups.pcb_components} onToggle={() => toggleGroup('pcb_components')}>
          <div className="grid grid-cols-2 gap-2">
            <DraggableItem type="PCB_Board" label="PCB Board" icon={<Grid3X3 className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Resistor" label="Resistor" icon={<Activity className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Capacitor" label="Capacitor" icon={<Circle className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Capacitor_Polar" label="Capacitor Pol" icon={<Circle className="w-5 h-5 border-double border-4" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_LED" label="LED" icon={<Lightbulb className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Switch_Tactile" label="Tactile Sw" icon={<ToggleLeft className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Potentiometer" label="Potentiometer" icon={<RotateCw className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_LCD16x2" label="LCD 16x2" icon={<Monitor className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Header_2" label="Header 2" icon={<Menu className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Header_4" label="Header 4" icon={<Menu className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Header_8" label="Header 8" icon={<Menu className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_DIP8" label="DIP-8" icon={<Cpu className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_DIP14" label="DIP-14" icon={<Cpu className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_DIP16" label="DIP-16" icon={<Cpu className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_DIP28" label="DIP-28" icon={<Cpu className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_DIP40" label="DIP-40" icon={<Cpu className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Pad_Circular" label="Circular Pad" icon={<Circle className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Pad_Square" label="Square Pad" icon={<Square className="w-5 h-5" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Via" label="Via" icon={<Circle className="w-5 h-5 fill-current" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Mounting_Hole" label="Mnt Hole" icon={<Circle className="w-5 h-5 border-2" />} onDragStart={onDragStart} onAddItem={onAddItem} />
            <DraggableItem type="PCB_Crystal" label="Crystal" icon={<Zap className="w-5 h-5 text-blue-300" />} onDragStart={onDragStart} onAddItem={onAddItem} />
          </div>
        </Group>

        <Group title="Library" isOpen={openGroups.library} onToggle={() => toggleGroup('library')}>
          <div className="space-y-2">
            {libraryBlocks.map((block) => (
              <div key={block.id} className="group relative">
                <div 
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('shapeType', 'CustomBlock');
                    e.dataTransfer.setData('customBlockId', block.id);
                    e.dataTransfer.setData('isLibraryBlock', 'true');
                  }}
                  onClick={() => onAddItem('CustomBlock', block.id)}
                  className="flex items-center gap-3 p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg cursor-grab active:cursor-grabbing transition-all"
                >
                  <div className="p-1.5 bg-blue-500/20 rounded-md">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-blue-100 truncate">{block.label}</div>
                    <div className="text-[9px] text-blue-400/60 font-mono">
                      {block.inputs.length} In / {block.outputs.length} Out
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Group>

        <Group title="Architecture" isOpen={openGroups.architecture} onToggle={() => toggleGroup('architecture')}>
          <div className="grid grid-cols-1 gap-2">
            {filteredArchitectureComponents.map((comp, idx) => (
              <div 
                key={`${comp.type}-${comp.label}-${idx}`}
                draggable
                onDragStart={(e) => {
                  onDragStart(e, comp.type);
                  // We store the specific shape data so we can apply it on drop
                  e.dataTransfer.setData('architectureShapeData', JSON.stringify(comp.data));
                }}
                onClick={() => onAddItem(comp.type)}
                className="flex items-center gap-3 p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg cursor-grab active:cursor-grabbing transition-all group"
              >
                <div className="p-1.5 bg-purple-500/20 rounded-md group-hover:bg-purple-500/30 transition-colors">
                  <Cpu className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-purple-100 truncate uppercase tracking-tighter">
                    {comp.label || comp.type}
                  </div>
                  <div className="text-[8px] text-purple-500/60 font-mono italic">
                    SynthBite-16 COMPONENT
                  </div>
                </div>
                <Plus className="w-3 h-3 text-purple-500/30 group-hover:text-purple-400 transition-colors" />
              </div>
            ))}
            {filteredArchitectureComponents.length === 0 && (
              <div className="text-center py-4 text-white/40 text-[10px] italic">
                No component architecture found
              </div>
            )}
          </div>
        </Group>

        <Group title="Custom Blocks" isOpen={openGroups.custom} onToggle={() => toggleGroup('custom')}>
          <div className="space-y-2">
            {customBlocks.length === 0 ? (
              <div className="text-[10px] text-white/20 text-center py-4 border border-dashed border-white/10 rounded-lg">
                No custom blocks yet. Select multiple components to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {customBlocks.map((block) => (
                  <div key={block.id} className="group relative">
                    <div 
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('shapeType', 'CustomBlock');
                        e.dataTransfer.setData('customBlockId', block.id);
                      }}
                      onClick={() => onAddItem('CustomBlock', block.id)}
                      className="flex items-center gap-3 p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg cursor-grab active:cursor-grabbing transition-all"
                    >
                      <div className="p-1.5 bg-purple-500/20 rounded-md">
                        <PlusSquare className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-purple-100 truncate">{block.label}</div>
                        <div className="text-[9px] text-purple-400/60 font-mono">
                          {block.inputs.length} In / {block.outputs.length} Out
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomBlock(block.id);
                      }}
                      className="absolute top-1 right-1 p-1 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Group>

        <div className="pt-4">
        </div>
      </div>
        </div>
      </aside>
    </>
  );
};

const Group = ({ title, children, isOpen, onToggle }: { title: string, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) => (
  <div className="space-y-1">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors text-xs font-bold text-gray-400 uppercase tracking-widest"
    >
      {title}
      {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
    </button>
    {isOpen && <div className="p-1 space-y-2">{children}</div>}
  </div>
);

interface DraggableItemProps {
  type: ShapeType;
  label: string;
  icon?: React.ReactNode;
  onDragStart: (e: React.DragEvent, type: ShapeType) => void;
  onAddItem?: (type: ShapeType) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ type, label, icon, onDragStart, onAddItem }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, type)}
    onClick={() => onAddItem?.(type)}
    onDoubleClick={() => onAddItem?.(type)}
    className="flex items-center gap-3 p-2 bg-dk-darker-bg hover:bg-dk-darker-bg/80 border border-dk-darker-bg rounded cursor-grab active:cursor-grabbing transition-all hover:border-yellow-500/30 group touch-none"
  >
    {icon ? (
      <div className="text-gray-400 group-hover:text-yellow-500 transition-colors">{icon}</div>
    ) : (
      <div className="w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-dk-dark-bg rounded border border-dk-darker-bg text-gray-500 group-hover:text-yellow-500">
        {type.substring(0, 3)}
      </div>
    )}
    <span className="text-xs font-medium text-gray-300 group-hover:text-white">{label}</span>
  </div>
);

const ALL_COMPONENTS: { type: ShapeType, label: string, icon?: React.ReactNode }[] = [
  // Input Controls
  { type: "InputL", label: "Logic Input", icon: <Zap className="w-5 h-5" /> },
  { type: "PushButton", label: "Push Button", icon: <PlusSquare className="w-5 h-5" /> },
  { type: "ToggleSwitch", label: "Toggle Switch", icon: <Zap className="w-5 h-5" /> },
  { type: "HighConstant", label: "High (1)", icon: <ArrowUp className="w-5 h-5" /> },
  { type: "LowConstant", label: "Low (0)", icon: <ArrowDown className="w-5 h-5" /> },
  { type: "PassSwitch", label: "Pass Switch", icon: <Zap className="w-5 h-5" /> },
  { type: "InputControl_4", label: "Input Control 4", icon: <Zap className="w-5 h-5" /> },
  { type: "InputControl_7", label: "Input Control 7", icon: <Zap className="w-5 h-5" /> },
  { type: "InputControl_8", label: "Input Control 8", icon: <Zap className="w-5 h-5" /> },
  { type: "Clock", label: "Clock", icon: <Clock className="w-5 h-5" /> },
  { type: "Clock_ms", label: "Clock (ms)", icon: <Clock className="w-5 h-5" /> },
  { type: "Clock_Hz_Adj", label: "Clock Hz Adj", icon: <Clock className="w-5 h-5" /> },
  { type: "Clock_ms_Adj", label: "Clock ms Adj", icon: <Clock className="w-5 h-5" /> },
  { type: "GatedClock", label: "Gated Clock", icon: <Clock className="w-5 h-5" /> },
  
  // Output Controls
  { type: "OutPutL", label: "Logic LED", icon: <Lightbulb className="w-5 h-5" /> },
  { type: "Oscilloscope", label: "Oscilloscope", icon: <Activity className="w-5 h-5" /> },
  { type: "Display7Segment", label: "7-Seg Display", icon: <Grid3X3 className="w-5 h-5" /> },
  { type: "Display8Segment", label: "8-Seg Display", icon: <Grid3X3 className="w-5 h-5" /> },
  { type: "Display9Segment", label: "9-Seg Display", icon: <Grid3X3 className="w-5 h-5" /> },
  { type: "Display14Segment", label: "14-Seg Display", icon: <Grid3X3 className="w-5 h-5" /> },
  { type: "Display16Segment", label: "16-Seg Display", icon: <Grid3X3 className="w-5 h-5" /> },
  { type: "DotMatrixDisplay", label: "Dot-Matrix Display", icon: <Grid3X3 className="w-5 h-5" /> },
  { type: "DisplayBCD", label: "4-Bit 7-Seg", icon: <Grid3X3 className="w-5 h-5" /> },
  { type: "Buzzer", label: "Buzzer", icon: <Volume2 className="w-5 h-5" /> },
  { type: "Motor", label: "DC Motor", icon: <RotateCw className="w-5 h-5" /> },
  { type: "RGB_LED", label: "RGB LED", icon: <Circle className="w-5 h-5 fill-current" /> },
  { type: "OLED_Display", label: "OLED Display", icon: <Monitor className="w-5 h-5" /> },
  { type: "Screen", label: "RGB Screen", icon: <Monitor className="w-5 h-5" /> },
  { type: "XYScreen", label: "XY RGB Screen", icon: <Monitor className="w-5 h-5" /> },
  { type: "Bus", label: "Bus-7 Wires", icon: <Layers className="w-5 h-5" /> },
  { type: "Bus8", label: "Bus-8 Wires", icon: <Layers className="w-5 h-5" /> },
  { type: "Bus16", label: "Bus-16 Wires", icon: <Layers className="w-5 h-5" /> },

  // Logic Gates
  { type: "AND", label: "AND" },
  { type: "AND3", label: "AND 3-In" },
  { type: "AND4", label: "AND 4-In" },
  { type: "AND5", label: "AND 5-In" },
  { type: "OR", label: "OR" },
  { type: "OR3", label: "OR 3-In" },
  { type: "OR4", label: "OR 4-In" },
  { type: "OR5", label: "OR 5-In" },
  { type: "NOT", label: "NOT" },
  { type: "NAND", label: "NAND" },
  { type: "NAND3", label: "NAND 3-In" },
  { type: "NAND4", label: "NAND 4-In" },
  { type: "NOR", label: "NOR" },
  { type: "NOR3", label: "NOR 3-In" },
  { type: "NOR4", label: "NOR 4-In" },
  { type: "XOR", label: "XOR" },
  { type: "XOR3", label: "XOR 3-In" },
  { type: "XOR4", label: "XOR 4-In" },
  { type: "XNOR", label: "XNOR" },
  { type: "Buffer", label: "Buffer" },
  { type: "ThreeState", label: "Three State" },

  // Flip Flops
  { type: "SR_Flip_Flop", label: "SR FF" },
  { type: "D_Flip_Flop", label: "D FF" },
  { type: "T_Flip_Flop", label: "T FF" },
  { type: "JK_Flip_Flop", label: "JK FF" },
  { type: "D_Latch", label: "D Latch" },

  // ICs
  { type: "IC7408", label: "7408 (AND)" },
  { type: "IC7400", label: "7400 (NAND)" },
  { type: "IC7432", label: "7432 (OR)" },
  { type: "IC7402", label: "7402 (NOR)" },
  { type: "IC7486", label: "7486 (XOR)" },
  { type: "IC7404", label: "7404 (NOT)" },
  { type: "IC7410", label: "7410 (3-NAND)" },
  { type: "IC7420", label: "7420 (4-NAND)" },
  { type: "IC7430", label: "7430 (8-NAND)" },
  { type: "IC7445", label: "7445 (BCD)" },
  { type: "IC7447", label: "7447 (BCD-7S)" },
  { type: "IC7490", label: "7490 (Decade)" },
  { type: "IC7493", label: "7493 (4-Bit)" },
  { type: "IC74161", label: "74161 (Counter)" },
  { type: "IC74138", label: "74138 (Decoder)" },
  { type: "IC74151", label: "74151 (Mux 8:1)" },
  { type: "IC74153", label: "74153 (Mux 4:1)" },
  { type: "IC74HC595", label: "74HC595 (SR)" },
  { type: "IC74175", label: "74175 (Quad D-FF)" },
  { type: "IC74139", label: "74139 (Dual Decoder)" },
  { type: "IC7485", label: "7485 (Comp)" },
  { type: "IC74181", label: "74181 (ALU)" },

  // CMOS
  { type: "IC4001", label: "4001 (NOR)" },
  { type: "IC4011", label: "4011 (NAND)" },
  { type: "IC4071", label: "4071 (OR)" },
  { type: "IC4081", label: "4081 (AND)" },
  { type: "IC4069", label: "4069 (NOT)" },
  { type: "IC4013", label: "4013 (D-FF)" },
  { type: "IC4017", label: "4017 (Decade)" },
  { type: "IC4049", label: "4049 (Buffer)" },
  { type: "IC4066", label: "4066 (Switch)" },

  // MCUs
  { type: "LGT8F328P", label: "LGT8F328P" },
  { type: "ATmega328P", label: "ATmega328P" },
  { type: "ATmega16U2", label: "ATmega16U2" },
  { type: "ATmega16", label: "ATmega16" },
  { type: "ATtiny85", label: "ATtiny85" },
  { type: "PIC18F2520", label: "PIC18F2520" },
  { type: "ESP32", label: "ESP32" },
  { type: "RP2040", label: "RP2040" },

  // Analog
  { type: "IC555_Simple", label: "555 Timer" },
  { type: "LM741", label: "LM741 Op-Amp" },
  { type: "LM358", label: "LM358 Dual" },
  { type: "LM324", label: "LM324 Quad" },
  { type: "LM311", label: "LM311 Comp" },
  { type: "LM386", label: "LM386 Audio" },
  { type: "ICMAX7219", label: "MAX7219 Driver" },

  // Electronics
  { type: "MOSFET_N", label: "N-MOSFET", icon: <Cpu className="w-4 h-4" /> },
  { type: "MOSFET_P", label: "P-MOSFET", icon: <Cpu className="w-4 h-4" /> },
  { type: "JFET_N", label: "N-JFET", icon: <Cpu className="w-4 h-4" /> },
  { type: "JFET_P", label: "P-JFET", icon: <Cpu className="w-4 h-4" /> },
  { type: "VCCS", label: "VCCS", icon: <Zap className="w-4 h-4" /> },
  { type: "VCVS", label: "VCVS", icon: <Zap className="w-4 h-4" /> },
  { type: "CCCS", label: "CCCS", icon: <Zap className="w-4 h-4" /> },
  { type: "CCVS", label: "CCVS", icon: <Zap className="w-4 h-4" /> },
  { type: "Switch_SPST", label: "SPST Switch", icon: <ToggleLeft className="w-4 h-4" /> },
  { type: "Switch_SPDT", label: "SPDT Switch", icon: <ToggleLeft className="w-4 h-4" /> },
  { type: "Switch_DPST", label: "DPST Switch", icon: <ToggleLeft className="w-4 h-4" /> },
  { type: "Switch_DPDT", label: "DPDT Switch", icon: <ToggleLeft className="w-4 h-4" /> },
  { type: "Relay_SPDT", label: "SPDT Relay", icon: <Zap className="w-4 h-4" /> },
  { type: "Relay_DPDT", label: "DPDT Relay", icon: <Zap className="w-4 h-4" /> },
  { type: "Resistor", label: "Resistor", icon: <Activity className="w-4 h-4" /> },
  { type: "Preset_Resistor", label: "Preset Resistor", icon: <Activity className="w-4 h-4" /> },
  { type: "Attenuator", label: "Attenuator", icon: <Activity className="w-4 h-4" /> },
  { type: "Capacitor", label: "Capacitor", icon: <Grid3X3 className="w-4 h-4" /> },
  { type: "Trimmer_Capacitor", label: "Trimmer Cap", icon: <Grid3X3 className="w-4 h-4" /> },
  { type: "Inductor", label: "Inductor", icon: <RotateCw className="w-4 h-4" /> },
  { type: "Heater", label: "Heater", icon: <Activity className="w-4 h-4" /> },
  { type: "Diode", label: "Diode", icon: <Zap className="w-4 h-4" /> },
  { type: "Zener_Diode", label: "Zener Diode", icon: <Zap className="w-4 h-4" /> },
  { type: "Schottky_Diode", label: "Schottky Diode", icon: <Zap className="w-4 h-4" /> },
  { type: "Photodiode", label: "Photodiode", icon: <Lightbulb className="w-4 h-4" /> },
  { type: "LED", label: "LED", icon: <Lightbulb className="w-4 h-4" /> },
  { type: "Neon_Lamp", label: "Neon Lamp", icon: <Lightbulb className="w-4 h-4" /> },
  { type: "Fluorescent_Lamp", label: "Fluor. Lamp", icon: <Lightbulb className="w-4 h-4" /> },
  { type: "Transistor_NPN", label: "NPN Transistor", icon: <Cpu className="w-4 h-4" /> },
  { type: "Transistor_PNP", label: "PNP Transistor", icon: <Cpu className="w-4 h-4" /> },
  { type: "Potentiometer", label: "Potentiometer", icon: <RotateCw className="w-4 h-4" /> },
  { type: "Cell", label: "Cell", icon: <Zap className="w-4 h-4" /> },
  { type: "Battery", label: "Battery", icon: <Zap className="w-4 h-4" /> },
  { type: "DC_Voltage_Source", label: "DC Voltage", icon: <Zap className="w-4 h-4" /> },
  { type: "AC_Voltage_Source", label: "AC Voltage", icon: <Activity className="w-4 h-4" /> },
  { type: "Voltage_Source_Ideal", label: "Ideal Voltage", icon: <Zap className="w-4 h-4" /> },
  { type: "Current_Source_Ideal", label: "Ideal Current", icon: <Zap className="w-4 h-4" /> },
  { type: "DC_Current_Source", label: "DC Current", icon: <Zap className="w-4 h-4" /> },
  { type: "AC_Current_Source", label: "AC Current", icon: <Activity className="w-4 h-4" /> },
  { type: "Step_Voltage_Source", label: "Step Voltage", icon: <Zap className="w-4 h-4" /> },
  { type: "Step_Current_Source", label: "Step Current", icon: <Zap className="w-4 h-4" /> },
  { type: "PWL_Voltage_Source", label: "PWL Voltage", icon: <Zap className="w-4 h-4" /> },
  { type: "PWL_Current_Source", label: "PWL Current", icon: <Zap className="w-4 h-4" /> },
  { type: "Pulse_Generator", label: "Pulse Gen", icon: <Activity className="w-4 h-4" /> },
  { type: "Sawtooth_Generator", label: "Sawtooth Gen", icon: <Activity className="w-4 h-4" /> },
  { type: "Step_Generator", label: "Step Gen", icon: <Activity className="w-4 h-4" /> },
  { type: "OpAmp", label: "Op-Amp", icon: <Cpu className="w-4 h-4" /> },
  { type: "Node_Label", label: "Node Label", icon: <Type className="w-4 h-4" /> },
  { type: "Coil", label: "Coil", icon: <RotateCw className="w-4 h-4" /> },
  { type: "Fuse", label: "Fuse", icon: <Scissors className="w-4 h-4" /> },
  { type: "Fuse_IEC", label: "Fuse (IEC)", icon: <Scissors className="w-4 h-4" /> },
  { type: "Regulator", label: "Regulator", icon: <Cpu className="w-4 h-4" /> },
  { type: "VCC", label: "VCC (+V)", icon: <ArrowUp className="w-4 h-4" /> },
  { type: "GND", label: "GND (0V)", icon: <ArrowDown className="w-4 h-4" /> },
  { type: "GND_Earth", label: "GND Earth", icon: <ArrowDown className="w-4 h-4" /> },
  { type: "GND_Protective", label: "GND Prot.", icon: <ArrowDown className="w-4 h-4" /> },
  { type: "GND_Signal", label: "GND Signal", icon: <ArrowDown className="w-4 h-4" /> },
  { type: "Relay", label: "Relay", icon: <Zap className="w-4 h-4" /> },
  { type: "Transformer", label: "Transformer", icon: <Zap className="w-4 h-4" /> },
  { type: "Bridge_Rectifier", label: "Bridge Rectifier", icon: <Zap className="w-4 h-4" /> },
  { type: "Darlington_NPN", label: "Darlington NPN", icon: <Cpu className="w-4 h-4" /> },
  { type: "Darlington_PNP", label: "Darlington PNP", icon: <Cpu className="w-4 h-4" /> },
  { type: "Variable_Capacitor", label: "Var. Capacitor", icon: <Grid3X3 className="w-4 h-4" /> },
  { type: "Polarized_Capacitor", label: "Pol. Capacitor", icon: <Grid3X3 className="w-4 h-4" /> },
  { type: "Crystal", label: "Crystal", icon: <Activity className="w-4 h-4" /> },
  { type: "Speaker", label: "Speaker", icon: <Volume2 className="w-4 h-4" /> },
  { type: "Antenna", label: "Antenna", icon: <Activity className="w-4 h-4" /> },
  { type: "Lamp", label: "Lamp", icon: <Lightbulb className="w-4 h-4" /> },
  { type: "Microphone", label: "Microphone", icon: <Volume2 className="w-4 h-4" /> },
  { type: "LDR", label: "LDR", icon: <Lightbulb className="w-4 h-4" /> },
  { type: "SCR", label: "SCR", icon: <Zap className="w-4 h-4" /> },
  { type: "DIAC", label: "DIAC", icon: <Zap className="w-4 h-4" /> },
  { type: "TRIAC", label: "TRIAC", icon: <Zap className="w-4 h-4" /> },
  { type: "IC555", label: "555 Timer", icon: <Cpu className="w-4 h-4" /> },
  { type: "Wattmeter", label: "Wattmeter", icon: <Activity className="w-4 h-4" /> },
  { type: "Varmeter", label: "Varmeter", icon: <Activity className="w-4 h-4" /> },
  { type: "Hz_Meter", label: "Hz Meter", icon: <Activity className="w-4 h-4" /> },
  { type: "Hour_Meter", label: "Hour Meter", icon: <Clock className="w-4 h-4" /> },
  { type: "Thermometer_Symbol", label: "Thermometer", icon: <Activity className="w-4 h-4" /> },

  // Control Blocks
  { type: "LB1", label: "LB1 Block", icon: <Cpu className="w-4 h-4" /> },
  { type: "SUM1", label: "SUM (+/-)", icon: <PlusSquare className="w-4 h-4" /> },
  { type: "SUM2", label: "SUM (+/+)", icon: <PlusSquare className="w-4 h-4" /> },
  { type: "MUL1", label: "MUL (×)", icon: <X className="w-4 h-4" /> },
  { type: "PWM_Block", label: "PWM Block", icon: <Activity className="w-4 h-4" /> },
  
  // Flowchart
  { type: "FlowStart", label: "Flow Start" },
  { type: "FlowProcess", label: "Flow Process" },
  { type: "FlowDecision", label: "Flow Decision" },
  { type: "FlowInputOutput", label: "Flow Data" },
  { type: "FlowEnd", label: "Flow End" },
  
  // Plexers
  { type: "Multiplexer_Gen", label: "8-to-1 Multiplexer", icon: <Layers className="w-5 h-5" /> },
  { type: "Demultiplexer_Gen", label: "1-to-8 Demultiplexer", icon: <Layers className="w-5 h-5 rotate-180" /> },
  { type: "Decoder_Gen", label: "3-to-8 Decoder", icon: <Grid3X3 className="w-5 h-5" /> },
  { type: "PriorityEncoder_Gen", label: "8-to-3 Priority Encoder", icon: <Activity className="w-5 h-5" /> },
  { type: "BitSelector_Gen", label: "Bit Selector", icon: <Scissors className="w-5 h-5" /> },

  // Label
  { type: "Text", label: "Label / Text", icon: <Type className="w-5 h-5" /> },
];

export default Sidebar;

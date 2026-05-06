import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CircuitCanvas from './components/CircuitCanvas';
import TruthTableModal from './components/TruthTableModal';
import { Shape, Connector, ShapeType, CircuitData, ConnectionPoint, Page } from './types';
import { generateRandomCircuit } from './services/aiService';
import { EXAMPLES, LIBRARY_BLOCKS } from './examples';
import { createShape } from './lib/circuitUtils';
import { parseLogisimCirc } from './lib/logisimImporter';
import { parseDLSCirc } from './lib/dlsImporter';
import { INPUT_CONTROL_TYPES, OUTPUT_CONTROL_TYPES } from './constants';
import { Cpu, PlusSquare, Scissors, Plus, X, Layers, Undo, Redo } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [fileName, setFileName] = useState('Untitled Circuit');
  const [zoom, setZoom] = useState(100);
  const [clipboard, setClipboard] = useState<CircuitData | null>(null);
  const [isTruthTableOpen, setIsTruthTableOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [truthTableData, setTruthTableData] = useState({ inputs: [], outputs: [], rows: [] });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pages, setPages] = useState<Page[]>([
    { id: 'main', name: 'Main Page', shapes: [], connectors: [] }
  ]);
  const [currentPageId, setCurrentPageId] = useState('main');
  const [customBlocks, setCustomBlocks] = useState<Shape[]>([]);
  const [libraryBlocks, setLibraryBlocks] = useState<Shape[]>(LIBRARY_BLOCKS);
  const [isCreateBlockModalOpen, setIsCreateBlockModalOpen] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [wireStyle, setWireStyle] = useState<'curved' | 'orthogonal' | 'schematic'>('schematic');
  const [gridStyle, setGridStyle] = useState<'dots' | 'lines' | 'none'>('dots');
  const [gridColor, setGridColor] = useState('#313348'); // Match Sidebar background
  const [highlightedPin, setHighlightedPin] = useState<{ shapeId: string, type: 'input' | 'output', index: number } | null>(null);

  const [isMagneticWiresEnabled, setIsMagneticWiresEnabled] = useState(false);
  const [isPanModeEnabled, setIsPanModeEnabled] = useState(false);
  const [isFuserEnabled, setIsFuserEnabled] = useState(false);
  const [isConnectionCloningEnabled, setIsConnectionCloningEnabled] = useState(false);
  const [highlightedConnectorId, setHighlightedConnectorId] = useState<string | null>(null);
  const [isStatusVisible, setIsStatusVisible] = useState(false);
  const [isWiresHidden, setIsWiresHidden] = useState(false);
  const [canvasScale, setCanvasScale] = useState<'half' | 'normal' | 'double'>('normal');

  // History for Undo/Redo
  const [history, setHistory] = useState<{ shapes: Shape[], connectors: Connector[], pages: Page[], currentPageId: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const generateId = useCallback(() => {
    return `${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  }, []);

  const saveHistory = useCallback(() => {
    const currentState = { 
      shapes: JSON.parse(JSON.stringify(shapes)), 
      connectors: JSON.parse(JSON.stringify(connectors)), 
      pages: JSON.parse(JSON.stringify(pages)),
      currentPageId
    };
    
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      // Limit history to 50 steps
      if (newHistory.length > 50) newHistory.shift();
      return [...newHistory, currentState];
    });
    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [shapes, connectors, pages, currentPageId, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const prevState = history[currentIndex - 1];
      setShapes(prevState.shapes);
      setConnectors(prevState.connectors);
      setPages(prevState.pages);
      setCurrentPageId(prevState.currentPageId);
      setCurrentIndex(currentIndex - 1);
    }
  }, [history, currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const nextState = history[currentIndex + 1];
      setShapes(nextState.shapes);
      setConnectors(nextState.connectors);
      setPages(nextState.pages);
      setCurrentPageId(nextState.currentPageId);
      setCurrentIndex(currentIndex + 1);
    }
  }, [history, currentIndex]);

  // Initial history snapshot
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ 
        shapes: JSON.parse(JSON.stringify(shapes)), 
        connectors: JSON.parse(JSON.stringify(connectors)), 
        pages: JSON.parse(JSON.stringify(pages)),
        currentPageId 
      }]);
      setCurrentIndex(0);
    }
  }, []);

  useEffect(() => {
    const fetchLibraries = async () => {
    const urls = [
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Full%20Adder%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4-Bit%20Adder%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/8-Bit%20Adder%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/1-Bit%20Register%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4-Bit%20Register%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/8-Bit%20Register%20Block%20Libray.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/7-Seg%20Driver%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Blanking%20Neg%20Driver%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/8-Bit%20Add%20Sub%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Buff%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/8%20Buffer%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Comparator%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4-Bit%20Comparator%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/8-Bit%20Comparator%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Two%20Comp%20Driver%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Logic%20Chip%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4-Bit%20Add%20Sub%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Aritmethic%20Unit%20%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Zero%20Flag%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/2%20to%204%20Decoder%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/3%20to%208%20Decoder%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4%20%20to%2016%20%20Decoder%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Up%20Down%20Shifter%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Hexadecimal%20Display%20Driver%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4-Bit%20Arithmetic%20Unit%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Dabble%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Double%20Dabble%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4-Bit%207-Seg%20Display%20Signed%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4-Bit%207-Seg%20Display%20Unsigned%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4-Bit%20Adder%20SL%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4-Bit%20Register%20LED%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Multiplexer%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4-Bit%20ALU%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Adder%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4-Bit%20Adder%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/16x%208-Bit%20RAM%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/16x%208-Bit%20Stack%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4x%208-Bit%20RAM%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/8-Bit%20Register%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Up%20Down%20Cnt%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/ALU%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/4-Bytes%20RAM%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/Binary%204-16%20Block%20Library.json',
        'https://raw.githubusercontent.com/ravendano014/logicgateslablibrary/refs/heads/main/16-Bytes%20RAM%20Block%20Library.json'
      ];

      try {
        const results = await Promise.all(urls.map(url => 
          fetch(url).then(res => res.json()).catch(err => {
            console.error(`Error fetching ${url}:`, err);
            return null;
          })
        ));

        const allShapes: Shape[] = [];
        
        // Architecture Components (Pre-compiled/Consolidated)
        // ARCHITECTURE Components
        const createRamBlock = (size: number, addrBits: number): Shape => ({
          id: `arch-ram-${size}-8`,
          type: 'CustomBlock',
          x: 0, y: 0, width: 180, height: 400,
          label: `RAM ${size}x8 Bit`,
          name: `ram_${size}_8`,
          color: '#1e1b4b',
          inputs: [
            ...Array.from({ length: addrBits }, (_, i) => ({ x: 0, y: 20 + i * 20, label: `A${i}`, value: 0, name: `a${i}` })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 0, y: 140 + addrBits * 5 + i * 20, label: `D${i}`, value: 0, name: `d${i}` })),
            { x: 0, y: 380, label: 'W/E', value: 0, name: 'we' }
          ],
          outputs: Array.from({ length: 8 }, (_, i) => ({ x: 180, y: 30 + i * 25, label: `Q${i}`, value: 0, name: `q${i}` })),
          isBurned: true,
          burnedData: {
            inputCount: addrBits + 9,
            outputCount: 8,
            lastState: new Array(size).fill(0).map(() => new Array(8).fill(0))
          }
        });

        const createRomBlock = (size: number, addrBits: number): Shape => ({
          id: `arch-rom-${size}-8`,
          type: 'CustomBlock',
          x: 0, y: 0, width: 140, height: 300,
          label: `ROM ${size}x8 Bit`,
          name: `rom_${size}_8`,
          color: '#431407',
          inputs: [
            ...Array.from({ length: addrBits }, (_, i) => ({ x: 0, y: 30 + i * 25, label: `A${i}`, value: 0, name: `a${i}` })),
            { x: 0, y: 270, label: 'OE', value: 1, name: 'oe' } // Output Enable
          ],
          outputs: Array.from({ length: 8 }, (_, i) => ({ x: 140, y: 30 + i * 25, label: `D${i}`, value: 0, name: `d${i}` })),
          isBurned: true,
          burnedData: {
            inputCount: addrBits + 1,
            outputCount: 8,
            lastState: new Array(size).fill(0).map(() => new Array(8).fill(0))
          }
        });

        const archBlocks: Shape[] = [
          {
            id: 'arch-decoder-4-16',
            type: 'CustomBlock',
            x: 0, y: 0, width: 120, height: 400,
            label: 'Decoder 4:16',
            name: 'decoder_4_16',
            color: '#1e293b',
            inputs: Array.from({ length: 4 }, (_, i) => ({ x: 0, y: 20 + i * 25, label: `A${i}`, value: 0, name: `in_${i}` })),
            outputs: Array.from({ length: 16 }, (_, i) => ({ x: 120, y: 20 + i * 23, label: `D${i}`, value: 0, name: `out_${i}` })),
            isBurned: true,
            burnedData: {
              inputCount: 4,
              outputCount: 16,
              truthTable: (() => {
                const tt: Record<string, number[]> = {};
                for(let i=0; i<16; i++) {
                  const key = [i&1, (i>>1)&1, (i>>2)&1, (i>>3)&1].join(',');
                  const outs = new Array(16).fill(0);
                  outs[i] = 1;
                  tt[key] = outs;
                }
                return tt;
              })()
            }
          },
          createRamBlock(16, 4),
          {
            ...createRamBlock(16, 4),
            id: 'arch-ram-16-8-static',
            label: 'RAM 16x8 Bit Static (SRAM)',
            name: 'ram_16_8_static'
          },
          createRamBlock(64, 6),
          createRamBlock(128, 7),
          createRamBlock(256, 8),
          createRomBlock(16, 4),
          createRomBlock(64, 6),
          createRomBlock(128, 7),
          createRomBlock(256, 8),
          {
            id: 'arch-alu-8',
            type: 'CustomBlock',
            x: 0, y: 0, width: 180, height: 400,
            label: '8-BIT ALU',
            name: 'alu_8',
            color: '#1e3a8a',
            inputs: [
              ...Array.from({ length: 8 }, (_, i) => ({ x: 0, y: 20 + i * 20, label: `A${i}`, value: 0, name: `a${i}` })),
              ...Array.from({ length: 8 }, (_, i) => ({ x: 0, y: 190 + i * 20, label: `B${i}`, value: 0, name: `b${i}` })),
              { x: 0, y: 355, label: 'OP0', value: 0, name: 'op0' },
              { x: 0, y: 375, label: 'OP1', value: 0, name: 'op1' }
            ],
            outputs: [
              ...Array.from({ length: 8 }, (_, i) => ({ x: 180, y: 30 + i * 25, label: `Q${i}`, value: 0, name: `q${i}` })),
              { x: 180, y: 240, label: 'Z', value: 0, name: 'z_flag' },
              { x: 180, y: 265, label: 'C', value: 0, name: 'c_flag' }
            ],
            isBurned: true,
            burnedData: {
              inputCount: 18,
              outputCount: 10
            }
          },
          {
            id: 'arch-stack-16-8',
            type: 'CustomBlock',
            x: 0, y: 0, width: 160, height: 350,
            label: '16x 8-BIT STACK',
            name: 'stack_16_8',
            color: '#1e3a8a',
            inputs: [
              ...Array.from({ length: 8 }, (_, i) => ({ x: 0, y: 30 + i * 22, label: `D${i}`, value: 0, name: `d${i}` })),
              { x: 0, y: 220, label: 'PUSH', value: 0, name: 'push' },
              { x: 0, y: 245, label: 'POP', value: 0, name: 'pop' },
              { x: 0, y: 270, label: 'CLK', value: 0, name: 'clk' },
              { x: 0, y: 295, label: 'RST', value: 0, name: 'rst' }
            ],
            outputs: [
              ...Array.from({ length: 8 }, (_, i) => ({ x: 160, y: 30 + i * 22, label: `Q${i}`, value: 0, name: `q${i}` })),
              { x: 160, y: 220, label: 'FULL', value: 0, name: 'full' },
              { x: 160, y: 245, label: 'EMPT', value: 0, name: 'empty' },
              { x: 160, y: 270, label: 'SP0', value: 0, name: 'sp0' },
              { x: 160, y: 295, label: 'SP1', value: 0, name: 'sp1' },
              { x: 160, y: 320, label: 'SP2', value: 0, name: 'sp2' }
            ],
            isBurned: true,
            burnedData: {
              inputCount: 12,
              outputCount: 13,
              lastState: new Array(16).fill(0).map(() => new Array(8).fill(0)),
              sp: 0, // Stack Pointer
              lastClock: 0
            }
          },
          {
            id: 'arch-bus-8',
            type: 'CustomBlock',
            x: 0, y: 0, width: 150, height: 250,
            label: '8-Bit Data Bus',
            name: 'bus_8',
            color: '#0f172a',
            inputs: [
              ...Array.from({ length: 8 }, (_, i) => ({ x: 0, y: 20 + i * 20, label: `I${i}`, value: 0, name: `in_${i}` })),
              { x: 0, y: 220, label: 'OE', value: 0, name: 'oe' }
            ],
            outputs: Array.from({ length: 8 }, (_, i) => ({ x: 150, y: 20 + i * 20, label: `B${i}`, value: 0, name: `bus_${i}` })),
            isBurned: true,
            burnedData: {
              inputCount: 9,
              outputCount: 8,
              truthTable: {}
            }
          },
          {
            id: 'arch-cu',
            type: 'CustomBlock',
            x: 0, y: 0, width: 220, height: 480,
            label: 'Control Unit (CU)',
            name: 'arch_cu',
            color: '#312e81',
            inputs: [
              ...Array.from({ length: 4 }, (_, i) => ({ x: 0, y: 30 + i * 25, label: `INST${i}`, value: 0, name: `inst_${i}` })),
              ...Array.from({ length: 3 }, (_, i) => ({ x: 0, y: 150 + i * 25, label: `STEP${i}`, value: 0, name: `step_${i}` })),
              { x: 0, y: 250, label: 'Z', value: 0, name: 'z_flag' },
              { x: 0, y: 275, label: 'C', value: 0, name: 'c_flag' }
            ],
            outputs: [
              { x: 220, y: 25, label: 'HLT', value: 0, name: 'hlt' },
              { x: 220, y: 50, label: 'MI', value: 0, name: 'mi' },
              { x: 220, y: 75, label: 'RI', value: 0, name: 'ri' },
              { x: 220, y: 100, label: 'RO', value: 0, name: 'ro' },
              { x: 220, y: 125, label: 'IO', value: 0, name: 'io' },
              { x: 220, y: 150, label: 'II', value: 0, name: 'ii' },
              { x: 220, y: 175, label: 'AI', value: 0, name: 'ai' },
              { x: 220, y: 200, label: 'AO', value: 0, name: 'ao' },
              { x: 220, y: 225, label: 'EO', value: 0, name: 'eo' },
              { x: 220, y: 250, label: 'SU', value: 0, name: 'su' },
              { x: 220, y: 275, label: 'BI', value: 0, name: 'bi' },
              { x: 220, y: 300, label: 'OI', value: 0, name: 'oi' },
              { x: 220, y: 325, label: 'CE', value: 0, name: 'ce' },
              { x: 220, y: 350, label: 'CO', value: 0, name: 'co' },
              { x: 220, y: 375, label: 'J', value: 0, name: 'j' },
              { x: 220, y: 400, label: 'FI', value: 0, name: 'fi' }
            ],
            isBurned: true,
            burnedData: {
              inputCount: 9,
              outputCount: 16
            }
          },
          {
            id: 'arch-reg-8',
            type: 'CustomBlock',
            x: 0, y: 0, width: 140, height: 320,
            label: '8-BIT REGISTER',
            name: 'reg_8',
            color: '#065f46',
            inputs: [
              ...Array.from({ length: 8 }, (_, i) => ({ x: 0, y: 20 + i * 20, label: `D${i}`, value: 0, name: `d${i}` })),
              { x: 0, y: 200, label: 'CLK', value: 0, name: 'clk' },
              { x: 0, y: 225, label: 'EN', value: 0, name: 'en' },
              { x: 0, y: 250, label: 'OE', value: 0, name: 'oe' }
            ],
            outputs: Array.from({ length: 8 }, (_, i) => ({ x: 140, y: 30 + i * 25, label: `Q${i}`, value: 0, name: `q${i}` })),
            isBurned: true,
            burnedData: {
              inputCount: 11,
              outputCount: 8,
              state: new Array(8).fill(0),
              lastClock: 0
            }
          }
        ];
        
        const uniqueShapes: Shape[] = [];
        const seenIds = new Set<string>();

        const addUniqueShape = (s: Shape) => {
          let uniqueId = s.id;
          if (seenIds.has(uniqueId)) {
            uniqueId = `${uniqueId}_${Math.random().toString(36).substr(2, 5)}`;
          }
          seenIds.add(uniqueId);
          uniqueShapes.push({ ...s, id: uniqueId });
        };

        archBlocks.forEach(addUniqueShape);

        results.forEach(data => {
          if (data && data.shapes) {
            data.shapes.forEach(addUniqueShape);
          }
        });

        if (uniqueShapes.length > 0) {
          // All blocks should be visible, filter out ones with empty labels if any
          const filteredShapes = uniqueShapes.filter(s => s.label && s.label.length >= 2);
          setLibraryBlocks(filteredShapes);
        }

      } catch (error) {
        console.error('Error fetching libraries:', error);
      }
    };
    fetchLibraries();
  }, []);

  const bcdToSegments = (bcd: string) => {
    switch (bcd) {
      case "0000": return [1, 1, 1, 1, 1, 1, 0]; // 0
      case "0001": return [0, 1, 1, 0, 0, 0, 0]; // 1
      case "0010": return [1, 1, 0, 1, 1, 0, 1]; // 2
      case "0011": return [1, 1, 1, 1, 0, 0, 1]; // 3
      case "0100": return [0, 1, 1, 0, 0, 1, 1]; // 4
      case "0101": return [1, 0, 1, 1, 0, 1, 1]; // 5
      case "0110": return [1, 0, 1, 1, 1, 1, 1]; // 6
      case "0111": return [1, 1, 1, 0, 0, 0, 0]; // 7
      case "1000": return [1, 1, 1, 1, 1, 1, 1]; // 8
      case "1001": return [1, 1, 1, 1, 0, 1, 1]; // 9
      case "1010": return [1, 1, 1, 0, 1, 1, 1]; // A
      case "1011": return [0, 0, 1, 1, 1, 1, 1]; // b
      case "1100": return [1, 0, 0, 1, 1, 1, 0]; // C
      case "1101": return [0, 1, 1, 1, 1, 0, 1]; // d
      case "1110": return [1, 0, 0, 1, 1, 1, 1]; // E
      case "1111": return [1, 0, 0, 0, 1, 1, 1]; // F
      default: return [0, 0, 0, 0, 0, 0, 0];
    }
  };

  // Simulation Logic
  const evaluateCircuit = useCallback((currentShapes: Shape[], currentConnectors: Connector[] = connectors, depth: number = 0): Shape[] => {
    if (depth > 5) return currentShapes; // Prevent infinite recursion

    let isModified = false;
    const updatedShapes = currentShapes.map(s => {
      const inputsCopy = (s.inputs || []).map(i => ({ ...i }));
      const outputsCopy = (s.outputs || []).map(o => ({ ...o }));
      const prevInputsCopy = (s.inputs || []).map(i => i.value);
      
      return { 
        ...s, 
        inputs: inputsCopy, 
        outputs: outputsCopy,
        prevInputs: prevInputsCopy,
        history: s.history ? [...s.history] : undefined
      };
    });
    
    // Optimization: Shape lookup map
    const shapeMap = new Map<string, Shape>(updatedShapes.map(s => [s.id, s]));

    // Optimization: Group connectors by target shape for faster lookup
    const incomingConnectorsMap = new Map<string, Connector[]>();
    currentConnectors.forEach(c => {
      if (!incomingConnectorsMap.has(c.endShapeId)) {
        incomingConnectorsMap.set(c.endShapeId, []);
      }
      incomingConnectorsMap.get(c.endShapeId)!.push(c);
    });

    // Simple propagation logic - iterate multiple times to handle feedback loops.
    // For depth > 0 (subcircuits), we only need a few iterations per parent iteration to propagate changes.
    const maxIterations = depth === 0 ? 60 : 3; 

    for (let iter = 0; iter < maxIterations; iter++) {
      let hasChangedInThisIter = false;

      updatedShapes.forEach(shape => {
        // Handle Clock inside evaluateCircuit for synchronization
        if (shape.type === 'Clock' || shape.type === 'Clock_ms' || shape.type === 'Clock_Hz_Adj' || shape.type === 'Clock_ms_Adj' || shape.type === 'GatedClock') {
          const freq = shape.frequency || 1;
          const periodMs = 1000 / freq;
          const now = Date.now();
          let newValue = Math.floor(now / (periodMs / 2)) % 2 === 0 ? 1 : 0;
          
          if (shape.type === 'GatedClock') {
            const enableInput = shape.inputs?.[0]?.value || 0;
            if (!enableInput) newValue = 0;
          }
          
          if (shape.outputs[0] && shape.outputs[0].value !== newValue) {
            shape.outputs[0].value = newValue;
            shape.color = newValue === 1 ? 'green' : 'red';
            hasChangedInThisIter = true;
            isModified = true;
          }
        }

        const incomingConnectors = incomingConnectorsMap.get(shape.id) || [];
        
        // Reset inputs that have logic connections to 0 before aggregating (OR behavior)
        // We do this to ensure we don't have "sticky" high signals from previous iterations
        const connectedInputIndices = new Set(incomingConnectors.map(c => c.endInputIndex));
        const oldInputs = shape.inputs.map(i => i.value);
        
        connectedInputIndices.forEach(idx => {
          if (shape.inputs[idx]) shape.inputs[idx].value = 0;
        });

        incomingConnectors.forEach(conn => {
          const sourceShape = shapeMap.get(conn.startShapeId);
          if (sourceShape && sourceShape.outputs[conn.startOutputIndex] && shape.inputs[conn.endInputIndex]) {
            const rawValue = sourceShape.outputs[conn.startOutputIndex].value;
            const sourceValue = typeof rawValue === 'number' ? rawValue : (rawValue === '1' ? 1 : 0);
            if (sourceValue === 1) {
              shape.inputs[conn.endInputIndex].value = 1;
            }
          }
        });

        // Check if inputs changed
        shape.inputs.forEach((input, idx) => {
          if (input.value !== oldInputs[idx]) {
            hasChangedInThisIter = true;
            isModified = true;
          }
        });

        // Compute logic
        const inputValues = (shape.inputs || []).map(i => typeof i.value === 'number' ? i.value : (i.value === '1' ? 1 : 0));
        const prevInputValues = shape.prevInputs?.map(v => typeof v === 'number' ? v : (v === '1' ? 1 : 0)) || inputValues;
        
        const oldOutputs = shape.outputs.map(o => o.value);
        switch (shape.type) {
          case 'AND':
          case 'AND3':
          case 'AND4':
          case 'AND5':
            if (shape.outputs[0]) shape.outputs[0].value = inputValues.every(v => v) ? 1 : 0;
            break;
          case 'OR':
          case 'OR3':
          case 'OR4':
          case 'OR5':
            if (shape.outputs[0]) shape.outputs[0].value = inputValues.some(v => v) ? 1 : 0;
            break;
          case 'NOT':
            if (shape.outputs[0]) shape.outputs[0].value = !inputValues[0] ? 1 : 0;
            break;
          case 'NAND':
          case 'NAND3':
          case 'NAND4':
            if (shape.outputs[0]) shape.outputs[0].value = !inputValues.every(v => v) ? 1 : 0;
            break;
          case 'NOR':
          case 'NOR3':
          case 'NOR4':
            if (shape.outputs[0]) shape.outputs[0].value = !inputValues.some(v => v) ? 1 : 0;
            break;
          case 'XOR':
          case 'XOR3':
          case 'XOR4':
            if (shape.outputs[0]) shape.outputs[0].value = inputValues.filter(v => v).length % 2 !== 0 ? 1 : 0;
            break;
          case 'XNOR':
            if (shape.outputs[0]) shape.outputs[0].value = inputValues.filter(v => v).length % 2 === 0 ? 1 : 0;
            break;
          case 'IC7SegToBCD': {
            // Converts 7-segment active inputs to 4-bit BCD
            // a, b, c, d, e, f, g at inputs 0-6
            const a = !!inputValues[0], b = !!inputValues[1], c = !!inputValues[2];
            const d = !!inputValues[3], e = !!inputValues[4], f = !!inputValues[5], g = !!inputValues[6];
            let val = 0;
            if (a && b && c && d && e && f && !g) val = 0;
            else if (!a && b && c && !d && !e && !f && !g) val = 1;
            else if (a && b && !c && d && e && !f && g) val = 2;
            else if (a && b && c && d && !e && !f && g) val = 3;
            else if (!a && b && c && !d && !e && f && g) val = 4;
            else if (a && !b && c && d && !e && f && g) val = 5;
            else if (a && !b && c && d && e && f && g) val = 6;
            else if (a && b && c && !d && !e && !f && !g) val = 7;
            else if (a && b && c && d && e && f && g) val = 8;
            else if (a && b && c && d && !e && f && g) val = 9;
            
            for (let i = 0; i < 4; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (val >> i) & 1;
            }
            break;
          }
          case 'Buffer':
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0] ? 1 : 0;
            break;
          case 'ThreeState':
            if (shape.outputs[0]) {
              const A = inputValues[0];
              const E = inputValues[1];
              shape.outputs[0].value = E ? (A ? 1 : 0) : 0; // If E is 1, Y=A. If E is 0, Y=0 (simulator limitation)
            }
            break;
          case 'SR_Flip_Flop': {
            const S = inputValues[0];
            const R = inputValues[1];
            const CLK = inputValues[2];
            const prevCLK = prevInputValues[2];
            let Q = shape.state !== undefined ? shape.state : 0;
            
            // Rising edge detection
            if (CLK && !prevCLK) {
              if (S && !R) Q = 1;
              else if (!S && R) Q = 0;
              else if (S && R) Q = 1; // Invalid state, usually both high in SR latch
            }
            
            shape.state = Q;
            if (shape.outputs[0]) shape.outputs[0].value = Q;
            if (shape.outputs[1]) shape.outputs[1].value = Q === 1 ? 0 : 1;
            break;
          }
          case 'D_Flip_Flop': {
            const D = inputValues[0];
            const CLK = inputValues[1];
            const PRE = inputValues[2];
            const CLR = inputValues[3];
            const prevCLK = prevInputValues[1];
            
            let Q = shape.state !== undefined ? shape.state : 0;
            
            if (PRE) Q = 1;
            else if (CLR) Q = 0;
            else if (CLK && !prevCLK) { // Rising edge
              Q = D ? 1 : 0;
            }
            
            shape.state = Q;
            if (shape.outputs[0]) shape.outputs[0].value = Q;
            if (shape.outputs[1]) shape.outputs[1].value = Q ? 0 : 1;
            break;
          }
          case 'T_Flip_Flop': {
            const T = inputValues[0];
            const CLK = inputValues[1];
            const PRE = inputValues[2];
            const CLR = inputValues[3];
            const prevCLK = prevInputValues[1];
            let Q = shape.state !== undefined ? shape.state : 0;
            
            if (PRE) Q = 1;
            else if (CLR) Q = 0;
            else if (CLK && !prevCLK) {
              if (T) Q = Q === 1 ? 0 : 1;
            }
            
            shape.state = Q;
            if (shape.outputs[0]) shape.outputs[0].value = Q;
            if (shape.outputs[1]) shape.outputs[1].value = Q ? 0 : 1;
            break;
          }
          case 'D_Latch': {
            const D = inputValues[0];
            const EN = inputValues[1];
            let Q = shape.state !== undefined ? shape.state : 0;
            
            if (EN) {
              Q = D ? 1 : 0;
            }
            
            shape.state = Q;
            if (shape.outputs[0]) shape.outputs[0].value = Q;
            if (shape.outputs[1]) shape.outputs[1].value = Q === 1 ? 0 : 1;
            break;
          }
          case 'JK_Flip_Flop': {
            const J = inputValues[0];
            const K = inputValues[1];
            const CLK = inputValues[2];
            const PRE = inputValues[3];
            const CLR = inputValues[4];
            const prevCLK = prevInputValues[2];
            let Q = shape.state !== undefined ? shape.state : 0;
            
            if (PRE) Q = 1;
            else if (CLR) Q = 0;
            else if (CLK && !prevCLK) {
              if (J && !K) Q = 1;
              else if (!J && K) Q = 0;
              else if (J && K) Q = Q === 1 ? 0 : 1;
            }
            
            shape.state = Q;
            if (shape.outputs[0]) shape.outputs[0].value = Q;
            if (shape.outputs[1]) shape.outputs[1].value = Q ? 0 : 1;
            break;
          }
          case 'SR_Flip_Flop': {
            const S = inputValues[0];
            const R = inputValues[1];
            const CLK = inputValues[2];
            const PRE = inputValues[3];
            const CLR = inputValues[4];
            const prevCLK = prevInputValues[2];
            let Q = shape.state !== undefined ? shape.state : 0;
            
            if (PRE) Q = 1;
            else if (CLR) Q = 0;
            else if (CLK && !prevCLK) {
              if (S && !R) Q = 1;
              else if (!S && R) Q = 0;
            }
            
            shape.state = Q;
            if (shape.outputs[0]) shape.outputs[0].value = Q;
            if (shape.outputs[1]) shape.outputs[1].value = Q ? 0 : 1;
            break;
          }
          case 'PushButton':
            if (shape.outputs[0]) shape.outputs[0].value = shape.isPressed ? 1 : 0;
            break;
          case 'HighConstant':
            if (shape.outputs[0]) shape.outputs[0].value = 1;
            break;
          case 'LowConstant':
            if (shape.outputs[0]) shape.outputs[0].value = 0;
            break;
          case 'ToggleSwitch':
            // Value is toggled via interaction, logic just propagates it
            break;
          case 'PassSwitch':
            if (shape.outputs[0]) shape.outputs[0].value = (inputValues[0] && shape.state) ? 1 : 0;
            break;
          case 'OutPutL':
            shape.color = inputValues[0] ? (shape.onColor || '#22c55e') : (shape.offColor || '#3b82f6');
            break;
          case 'Oscilloscope':
            if (!shape.state) shape.state = { history: [[], [], [], []] };
            if (!shape.state.history) shape.state.history = [[], [], [], []];
            
            inputValues.forEach((v, i) => {
              if (i < 4) {
                const val = typeof v === 'number' ? v : (v ? 1 : 0);
                shape.state.history[i].push(val);
                if (shape.state.history[i].length > 100) shape.state.history[i].shift();
              }
            });
            break;
          case 'Voltmeter':
          case 'Ammeter':
          case 'Probe':
            // These are measurement tools, they just display the input value
            shape.state = inputValues[0];
            break;
          case 'MUX_2to1': {
            const in0 = inputValues[0];
            const in1 = inputValues[1];
            const sel = inputValues[2];
            if (shape.outputs[0]) shape.outputs[0].value = sel ? in1 : in0;
            break;
          }
          case 'MUX_4to1': {
            const in0 = inputValues[0];
            const in1 = inputValues[1];
            const in2 = inputValues[2];
            const in3 = inputValues[3];
            const s0 = inputValues[4];
            const s1 = inputValues[5];
            const sel = (s1 ? 2 : 0) | (s0 ? 1 : 0);
            const val = [in0, in1, in2, in3][sel];
            if (shape.outputs[0]) shape.outputs[0].value = val;
            break;
          }
          case 'Half_Adder': {
            const a = inputValues[0] ? 1 : 0;
            const b = inputValues[1] ? 1 : 0;
            if (shape.outputs[0]) shape.outputs[0].value = a ^ b;
            if (shape.outputs[1]) shape.outputs[1].value = a & b;
            break;
          }
          case 'Full_Adder': {
            const a = inputValues[0] ? 1 : 0;
            const b = inputValues[1] ? 1 : 0;
            const cin = inputValues[2] ? 1 : 0;
            const sum = a ^ b ^ cin;
            const cout = (a & b) | (cin & (a ^ b));
            if (shape.outputs[0]) shape.outputs[0].value = sum;
            if (shape.outputs[1]) shape.outputs[1].value = cout;
            break;
          }
          case 'Adder_4bit': {
            let cin = inputValues[8] ? 1 : 0;
            for (let i = 0; i < 4; i++) {
              const a = inputValues[i] ? 1 : 0;
              const b = inputValues[i + 4] ? 1 : 0;
              const sum = a ^ b ^ cin;
              cin = (a & b) | (cin & (a ^ b));
              if (shape.outputs[i]) shape.outputs[i].value = sum;
            }
            if (shape.outputs[4]) shape.outputs[4].value = cin;
            break;
          }
          case 'Adder_8bit': {
            let cin = inputValues[16] ? 1 : 0;
            for (let i = 0; i < 8; i++) {
              const a = inputValues[i] ? 1 : 0;
              const b = inputValues[i + 8] ? 1 : 0;
              const sum = a ^ b ^ cin;
              cin = (a & b) | (cin & (a ^ b));
              if (shape.outputs[i]) shape.outputs[i].value = sum;
            }
            if (shape.outputs[8]) shape.outputs[8].value = cin;
            break;
          }
          case 'SR_Latch':
          case 'SR_Latch_Inv': {
            let s = inputValues[0] ? 1 : 0;
            let r = inputValues[1] ? 1 : 0;
            if (shape.type === 'SR_Latch_Inv') {
              s = s ? 0 : 1;
              r = r ? 0 : 1;
            }
            let q = shape.state !== undefined ? shape.state : 0;
            if (s && !r) q = 1;
            else if (!s && r) q = 0;
            // s=1, r=1 is invalid for SR latch, usually keeps state or goes to meta
            shape.state = q;
            if (shape.outputs[0]) shape.outputs[0].value = q;
            if (shape.outputs[1]) shape.outputs[1].value = q ? 0 : 1;
            break;
          }
          case 'Comparator': {
            const pos = typeof inputValues[0] === 'number' ? inputValues[0] : (inputValues[0] ? 5 : 0);
            const neg = typeof inputValues[1] === 'number' ? inputValues[1] : (inputValues[1] ? 5 : 0);
            if (shape.outputs[0]) shape.outputs[0].value = pos > neg ? 1 : 0;
            break;
          }
          case 'IC74160':
          case 'IC74161': {
            // 4-bit binary/decade counter
            // Inputs: 0: CLK, 1: CLEAR (active low), 2: LOAD (active low), 3: ENP, 4: ENT, 5-8: D0-D3
            const clk = inputValues[0];
            const clear = inputValues[1];
            const load = inputValues[2];
            const enp = inputValues[3];
            const ent = inputValues[4];
            const prevClk = prevInputValues[0];
            
            let count = shape.state !== undefined ? shape.state : 0;
            const isDecade = shape.type === 'IC74160';
            const maxCount = isDecade ? 10 : 16;
            
            if (!clear) {
              count = 0;
            } else if (clk && !prevClk) { // Rising edge
              if (!load) {
                count = (inputValues[5] ? 1 : 0) | (inputValues[6] ? 2 : 0) | (inputValues[7] ? 4 : 0) | (inputValues[8] ? 8 : 0);
                if (isDecade && count > 9) count = 0;
              } else if (enp && ent) {
                count = (count + 1) % maxCount;
              }
            }
            
            shape.state = count;
            if (shape.outputs[0]) shape.outputs[0].value = (count & 1) ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = (count & 2) ? 1 : 0;
            if (shape.outputs[2]) shape.outputs[2].value = (count & 4) ? 1 : 0;
            if (shape.outputs[3]) shape.outputs[3].value = (count & 8) ? 1 : 0;
            if (shape.outputs[4]) shape.outputs[4].value = (count === (maxCount - 1) && ent) ? 1 : 0; // RCO
            break;
          }
          case 'IC74173': {
            // 4-bit D-type register with 3-state outputs
            // Inputs: 0: M(OE1), 1: N(OE2), 2: CP(CLK), 3: D3, 4: D2, 5: D1, 6: D0, 7: G2, 8: G1, 9: MR(Reset)
            // Outputs: 0: Q0, 1: Q1, 2: Q2, 3: Q3
            const m = inputValues[0], n = inputValues[1], cp = inputValues[2];
            const d3 = inputValues[3], d2 = inputValues[4], d1 = inputValues[5], d0 = inputValues[6];
            const g2 = inputValues[7], g1 = inputValues[8], mr = inputValues[9];
            const prevCp = prevInputValues[2];

            if (!shape.state || typeof shape.state !== 'object' || !Array.isArray(shape.state.q)) {
              shape.state = { q: [0, 0, 0, 0] };
            }

            // Reset
            if (mr) {
              shape.state.q = [0, 0, 0, 0];
            } else if (cp && !prevCp) {
              // Rising edge clock
              if (!g1 && !g2) {
                // Data Enable is active low
                shape.state.q = [d0, d1, d2, d3];
              }
            }

            // Outputs (3-state)
            const oe = !m && !n; // Output Enable is active low
            for (let i = 0; i < 4; i++) {
              if (shape.outputs[i]) {
                shape.outputs[i].value = oe ? shape.state.q[i] : 0;
              }
            }
            break;
          }
          case 'IC74175': {
            // Quad D Flip-Flop
            const clk = inputValues[0], clr = inputValues[1];
            const prevClk = prevInputValues[0];
            const d = [inputValues[2], inputValues[3], inputValues[4], inputValues[5]];
            if (!Array.isArray(shape.state)) shape.state = [0, 0, 0, 0];
            if (clr) shape.state = [0, 0, 0, 0];
            else if (clk && !prevClk) shape.state = [...d];
            for (let i = 0; i < 4; i++) {
              if (shape.outputs[i * 2]) shape.outputs[i * 2].value = shape.state[i];
              if (shape.outputs[i * 2 + 1]) shape.outputs[i * 2 + 1].value = shape.state[i] ? 0 : 1;
            }
            break;
          }
          case 'IC74139': {
            // Dual 2-to-4 Decoder
            const g1 = inputValues[0], a1 = inputValues[1], b1 = inputValues[2];
            const g2 = inputValues[3], a2 = inputValues[4], b2 = inputValues[5];
            const sel1 = (a1 ? 1 : 0) | (b1 ? 2 : 0);
            const sel2 = (a2 ? 1 : 0) | (b2 ? 2 : 0);
            for (let i = 0; i < 4; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (!g1 && i === sel1) ? 0 : 1;
            }
            for (let i = 0; i < 4; i++) {
              if (shape.outputs[i + 4]) shape.outputs[i + 4].value = (!g2 && i === sel2) ? 0 : 1;
            }
            break;
          }
          case 'MAR_8Bit': {
            // 8-bit Memory Address Register
            // Inputs: 0-7: D0-D7, 8: CLK, 9: EN (load enable), 10: OE (output enable)
            // Outputs: 0-7: Q0-Q7
            const clk = inputValues[8];
            const en = inputValues[9] !== undefined ? inputValues[9] : 1;
            const oe = inputValues[10] !== undefined ? inputValues[10] : 1;

            if (!shape.state || !Array.isArray(shape.state.q)) {
              shape.state = { q: [0, 0, 0, 0, 0, 0, 0, 0], lastClk: 0 };
            }

            const lastClk = shape.state.lastClk || 0;

            // EN is Load Enable (Active High)
            if (clk && !lastClk && en) {
              for (let i = 0; i < 8; i++) {
                shape.state.q[i] = inputValues[i] ? 1 : 0;
              }
            }

            // Update lastClk for next iteration
            shape.state.lastClk = clk;

            // OE is Output Enable (Active High)
            for (let i = 0; i < 8; i++) {
              if (shape.outputs[i]) {
                shape.outputs[i].value = oe ? shape.state.q[i] : 0;
              }
            }
            break;
          }
          case 'SRAM':
          case 'EEPROM': {
            // Basic memory simulation
            // Inputs: 0: ADDR, 1: DATA_IN, 2: CS, 3: WE, 4: OE
            // This is a simplified version (using single inputs for bus if they are connected as such)
            // But usually we'd have 8 lines. Let's assume we handle single value for demonstration if needed.
            const cs = inputValues[2];
            const we = inputValues[3];
            const oe = inputValues[4];
            const addr = inputValues[0] || 0; // Assuming it's a number/bus value
            const dataIn = inputValues[1] || 0;

            if (!shape.state || !shape.state.memory) {
              shape.state = { memory: {} };
            }

            if (cs) {
              if (we) {
                // Write
                shape.state.memory[addr] = dataIn;
              }
              
              const dataOut = shape.state.memory[addr] || 0;
              if (shape.outputs[0]) {
                shape.outputs[0].value = oe ? dataOut : 0;
              }
            } else {
              if (shape.outputs[0]) shape.outputs[0].value = 0;
            }
            break;
          }
          case 'IC74192':
          case 'IC74193': {
            // Synchronous Up/Down Counter
            // Inputs: 0: UP, 1: DN, 2: PL (active low), 3: MR (active high), 4-7: D0-D3
            // Outputs: 0-3: Q0-Q3, 4: TCU (active low), 5: TCD (active low)
            const up = inputValues[0];
            const dn = inputValues[1];
            const pl = inputValues[2];
            const mr = inputValues[3];
            const d = [inputValues[4], inputValues[5], inputValues[6], inputValues[7]];
            const prevUp = prevInputValues[0];
            const prevDn = prevInputValues[1];
            
            if (shape.state === undefined || typeof shape.state !== 'number') shape.state = 0;
            
            const max = (shape.type === 'IC74192') ? 9 : 15;
            
            if (mr) {
              shape.state = 0;
            } else if (!pl) {
              shape.state = (d[0] ? 1 : 0) | (d[1] ? 2 : 0) | (d[2] ? 4 : 0) | (d[3] ? 8 : 0);
            } else {
              // Rising edge for UP (while DN is HIGH)
              if (up && !prevUp && dn) {
                shape.state = (shape.state + 1) > max ? 0 : shape.state + 1;
              }
              // Rising edge for DN (while UP is HIGH)
              if (dn && !prevDn && up) {
                shape.state = (shape.state - 1) < 0 ? max : shape.state - 1;
              }
            }
            
            // Outputs
            for (let i = 0; i < 4; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (shape.state & (1 << i)) ? 1 : 0;
            }
            // TCU (Terminal Count Up) - Active Low
            if (shape.outputs[4]) shape.outputs[4].value = (shape.state === max && !up) ? 0 : 1;
            // TCD (Terminal Count Down) - Active Low
            if (shape.outputs[5]) shape.outputs[5].value = (shape.state === 0 && !dn) ? 0 : 1;
            break;
          }
          case 'IC7493': {
            // 4-bit binary counter (asynchronous)
            // Inputs: 0: CKA, 1: CKB, 2: R0(1), 3: R0(2)
            // Outputs: 0: QA, 1: QB, 2: QC, 3: QD
            const cka = inputValues[0];
            const ckb = inputValues[1];
            const r01 = inputValues[2];
            const r02 = inputValues[3];
            const prevCka = prevInputValues[0];
            const prevCkb = prevInputValues[1];
            
            if (!shape.state) shape.state = { qa: 0, qbcd: 0 };
            
            if (r01 && r02) {
              shape.state.qa = 0;
              shape.state.qbcd = 0;
            } else {
              // Falling edge for CKA
              if (!cka && prevCka) {
                shape.state.qa = (shape.state.qa + 1) % 2;
              }
              // Falling edge for CKB
              if (!ckb && prevCkb) {
                shape.state.qbcd = (shape.state.qbcd + 1) % 8;
              }
            }
            
            if (shape.outputs[0]) shape.outputs[0].value = shape.state.qa;
            if (shape.outputs[1]) shape.outputs[1].value = (shape.state.qbcd & 1) ? 1 : 0;
            if (shape.outputs[2]) shape.outputs[2].value = (shape.state.qbcd & 2) ? 1 : 0;
            if (shape.outputs[3]) shape.outputs[3].value = (shape.state.qbcd & 4) ? 1 : 0;
            break;
          }
          case 'IC74138': {
            // 3-to-8 decoder
            // Inputs: 0-2: A, B, C; 3: G1 (active high); 4: G2A (active low); 5: G2B (active low)
            const a = inputValues[0];
            const b = inputValues[1];
            const c = inputValues[2];
            const g1 = inputValues[3];
            const g2a = inputValues[4];
            const g2b = inputValues[5];
            
            const enabled = g1 && !g2a && !g2b;
            const select = (a ? 1 : 0) | (b ? 2 : 0) | (c ? 4 : 0);
            
            for (let i = 0; i < 8; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (enabled && select === i) ? 0 : 1; // Active low outputs
            }
            break;
          }
          case 'IC74151': {
            // 8-to-1 mux
            // Inputs: 0-7: D0-D7; 8-10: A, B, C; 11: STROBE (active low)
            const select = (inputValues[8] ? 1 : 0) | (inputValues[9] ? 2 : 0) | (inputValues[10] ? 4 : 0);
            const strobe = inputValues[11];
            const y = (!strobe) ? (inputValues[select] ? 1 : 0) : 0;
            if (shape.outputs[0]) shape.outputs[0].value = y;
            if (shape.outputs[1]) shape.outputs[1].value = y ? 0 : 1; // W (inverted Y)
            break;
          }
          case 'IC74153': {
            // Dual 4-to-1 mux
            // Inputs: 0-3: 1D0-1D3; 4: 1G (active low); 5-8: 2D0-2D3; 9: 2G (active low); 10-11: A, B (common select)
            const select = (inputValues[10] ? 1 : 0) | (inputValues[11] ? 2 : 0);
            const g1 = inputValues[4];
            const g2 = inputValues[9];
            
            if (shape.outputs[0]) shape.outputs[0].value = (!g1) ? (inputValues[select] ? 1 : 0) : 0;
            if (shape.outputs[1]) shape.outputs[1].value = (!g2) ? (inputValues[5 + select] ? 1 : 0) : 0;
            break;
          }
          case 'Splitter': {
            const busVal = inputValues[0] || 0;
            for (let i = 0; i < 8; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (busVal >> i) & 1;
            }
            break;
          }
          case 'ROM': {
            const addr = inputValues.reduce((acc, v, i) => acc | (v ? (1 << i) : 0), 0);
            const data = shape.state?.data?.[addr] || 0;
            for (let i = 0; i < 8; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (data >> i) & 1;
            }
            break;
          }
          case 'Counter_Gen': {
            const clk = inputValues[0];
            const rst = inputValues[1];
            const prevClk = prevInputValues[0];
            let count = shape.state?.count ?? 0;
            if (rst) {
              count = 0;
            } else if (clk && !prevClk) {
              count = (count + 1) % 256;
            }
            shape.state = { count };
            for (let i = 0; i < 8; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (count >> i) & 1;
            }
            break;
          }
          case 'Multiplexer_Gen': {
            const numInputs = shape.inputs.length;
            const selectCount = Math.floor(Math.log2(numInputs)); // Rough estimate for Power of 2 data inputs
            const dataCount = 1 << selectCount;
            // If the math doesn't align exactly (e.g. extra pins like enable), we use the last N as select
            const actualSelectCount = Math.min(selectCount, numInputs - dataCount); 
            const data = inputValues.slice(0, dataCount);
            let sel = 0;
            for (let i = 0; i < actualSelectCount; i++) {
              if (inputValues[dataCount + i]) sel |= (1 << i);
            }
            if (shape.outputs[0]) shape.outputs[0].value = data[sel] || 0;
            break;
          }
          case 'Demultiplexer_Gen': {
            const data = inputValues[0];
            const numOutputs = shape.outputs.length;
            const selectCount = Math.ceil(Math.log2(numOutputs));
            let sel = 0;
            for (let i = 0; i < selectCount; i++) {
              if (inputValues[1 + i]) sel |= (1 << i);
            }
            for (let i = 0; i < numOutputs; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (i === sel) ? data : 0;
            }
            break;
          }
          case 'Decoder_Gen': {
            const selectCount = shape.inputs.length;
            const numOutputs = shape.outputs.length;
            let sel = 0;
            for (let i = 0; i < selectCount; i++) {
              if (inputValues[i]) sel |= (1 << i);
            }
            for (let i = 0; i < numOutputs; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (i === sel) ? 1 : 0;
            }
            break;
          }
          case 'Splitter': {
            if (shape.inputs.length === 1) {
              // Bus to Bits Splitter
              const busValue = Number(inputValues[0] || 0);
              for (let i = 0; i < shape.outputs.length; i++) {
                if (shape.outputs[i]) {
                  shape.outputs[i].value = (busValue >> i) & 1;
                }
              }
            } else if (shape.outputs.length === 1) {
              // Bits to Bus Merger
              let busValue = 0;
              for (let i = 0; i < shape.inputs.length; i++) {
                if (inputValues[i]) {
                  busValue |= (1 << i);
                }
              }
              if (shape.outputs[0]) shape.outputs[0].value = busValue;
            }
            break;
          }
          case 'PriorityEncoder_Gen': {
            const numInputs = shape.inputs.length;
            const numOutputs = shape.outputs.length - 1; // GS is usually last
            let highest = -1;
            for (let i = numInputs - 1; i >= 0; i--) {
              if (inputValues[i]) {
                highest = i;
                break;
              }
            }
            if (highest === -1) {
              for (let i = 0; i < numOutputs; i++) if (shape.outputs[i]) shape.outputs[i].value = 0;
              if (shape.outputs[numOutputs]) shape.outputs[numOutputs].value = 0; // GS
            } else {
              for (let i = 0; i < numOutputs; i++) if (shape.outputs[i]) shape.outputs[i].value = (highest >> i) & 1;
              if (shape.outputs[numOutputs]) shape.outputs[numOutputs].value = 1; // GS
            }
            break;
          }
          case 'BitSelector_Gen': {
            const numData = shape.inputs.length - Math.ceil(Math.log2(shape.inputs.length));
            const data = inputValues.slice(0, numData);
            let sel = 0;
            const selectCount = shape.inputs.length - numData;
            for (let i = 0; i < selectCount; i++) {
              if (inputValues[numData + i]) sel |= (1 << i);
            }
            if (shape.outputs[0]) shape.outputs[0].value = data[sel] || 0;
            break;
          }
          case 'IC7408':
            if (shape.outputs[0]) shape.outputs[0].value = (inputValues[0] && inputValues[1]) ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = (inputValues[2] && inputValues[3]) ? 1 : 0;
            if (shape.outputs[2]) shape.outputs[2].value = (inputValues[4] && inputValues[5]) ? 1 : 0;
            if (shape.outputs[3]) shape.outputs[3].value = (inputValues[6] && inputValues[7]) ? 1 : 0;
            break;
          case 'IC7400':
            if (shape.outputs[0]) shape.outputs[0].value = !(inputValues[0] && inputValues[1]) ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = !(inputValues[2] && inputValues[3]) ? 1 : 0;
            if (shape.outputs[2]) shape.outputs[2].value = !(inputValues[4] && inputValues[5]) ? 1 : 0;
            if (shape.outputs[3]) shape.outputs[3].value = !(inputValues[6] && inputValues[7]) ? 1 : 0;
            break;
          case 'IC7432':
            if (shape.outputs[0]) shape.outputs[0].value = (inputValues[0] || inputValues[1]) ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = (inputValues[2] || inputValues[3]) ? 1 : 0;
            if (shape.outputs[2]) shape.outputs[2].value = (inputValues[4] || inputValues[5]) ? 1 : 0;
            if (shape.outputs[3]) shape.outputs[3].value = (inputValues[6] || inputValues[7]) ? 1 : 0;
            break;
          case 'IC7402':
            if (shape.outputs[0]) shape.outputs[0].value = !(inputValues[0] || inputValues[1]) ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = !(inputValues[2] || inputValues[3]) ? 1 : 0;
            if (shape.outputs[2]) shape.outputs[2].value = !(inputValues[4] || inputValues[5]) ? 1 : 0;
            if (shape.outputs[3]) shape.outputs[3].value = !(inputValues[6] || inputValues[7]) ? 1 : 0;
            break;
          case 'IC7486':
            if (shape.outputs[0]) shape.outputs[0].value = (inputValues[0] !== inputValues[1]) ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = (inputValues[2] !== inputValues[3]) ? 1 : 0;
            if (shape.outputs[2]) shape.outputs[2].value = (inputValues[4] !== inputValues[5]) ? 1 : 0;
            if (shape.outputs[3]) shape.outputs[3].value = (inputValues[6] !== inputValues[7]) ? 1 : 0;
            break;
          case 'IC7404':
            if (shape.outputs[0]) shape.outputs[0].value = !inputValues[0] ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = !inputValues[1] ? 1 : 0;
            if (shape.outputs[2]) shape.outputs[2].value = !inputValues[2] ? 1 : 0;
            if (shape.outputs[3]) shape.outputs[3].value = !inputValues[3] ? 1 : 0;
            if (shape.outputs[4]) shape.outputs[4].value = !inputValues[4] ? 1 : 0;
            if (shape.outputs[5]) shape.outputs[5].value = !inputValues[5] ? 1 : 0;
            break;
          case 'IC74245': {
            const dir = inputValues[0];
            const gn = inputValues[1]; // !G (Active Low)
            const aPins = inputValues.slice(2, 10);
            const bPins = inputValues.slice(10, 18);

            if (gn) {
              // Disabled (High Impedance -> 0 in our simulator)
              shape.outputs.forEach(o => o.value = 0);
            } else if (dir) {
              // A to B
              for (let i = 0; i < 8; i++) {
                if (shape.outputs[i]) shape.outputs[i].value = 0; // AY (A is input)
                if (shape.outputs[i + 8]) shape.outputs[i + 8].value = aPins[i] ? 1 : 0; // BY (B is output)
              }
            } else {
              // B to A
              for (let i = 0; i < 8; i++) {
                if (shape.outputs[i]) shape.outputs[i].value = bPins[i] ? 1 : 0; // AY (A is output)
                if (shape.outputs[i + 8]) shape.outputs[i + 8].value = 0; // BY (B is input)
              }
            }
            break;
          }
          case 'IC7445': {
            const bcd = inputValues.slice(0, 4).reverse().map(v => v ? '1' : '0').join('');
            const segments = bcdToSegments(bcd);
            segments.forEach((val, i) => {
              if (shape.outputs[i]) shape.outputs[i].value = val;
            });
            break;
          }
          case 'IC7447': {
            // BCD to 7-Segment Decoder
            const bcd = inputValues.slice(0, 4).reverse().map(v => v ? '1' : '0').join('');
            const segments = bcdToSegments(bcd);
            segments.forEach((val, i) => {
              if (shape.outputs[i]) shape.outputs[i].value = val;
            });
            break;
          }
          case 'IC7448': {
            // BCD to 7-Segment Decoder (Common Cathode / Active High outputs)
            // Inputs: 0: A, 1: B, 2: C, 3: D, 4: LT, 5: RBI, 6: BI
            const a = inputValues[0];
            const b = inputValues[1];
            const c = inputValues[2];
            const d = inputValues[3];
            const lt = inputValues[4];
            const rbi = inputValues[5];
            const bi = inputValues[6];

            if (!bi) {
              // Blanking input active (active low)
              shape.outputs.forEach(o => o.value = 0);
            } else if (!lt) {
              // Lamp test active (active low)
              shape.outputs.forEach(o => o.value = 1);
            } else {
              const bcdValue = (a ? 1 : 0) | (b ? 2 : 0) | (c ? 4 : 0) | (d ? 8 : 0);
              const bcdStrMSB = [d, c, b, a].map(v => v ? '1' : '0').join('');
              
              const segments = bcdToSegments(bcdStrMSB);
              
              // If RBI is active (low) and BCD is 0, blank display
              if (!rbi && bcdValue === 0) {
                shape.outputs.forEach(o => o.value = 0);
              } else {
                segments.forEach((val, i) => {
                  if (shape.outputs[i]) shape.outputs[i].value = val;
                });
              }
            }
            break;
          }
          case 'IC7490': {
            // Decade Counter
            // Inputs: 0: CP0, 1: CP1, 2: MR1, 3: MR2, 4: MS1, 5: MS2
            const cp0 = inputValues[0];
            const prevCp0 = prevInputValues[0];
            const cp1 = inputValues[1];
            const prevCp1 = prevInputValues[1];
            const mr = inputValues[2] && inputValues[3];
            const ms = inputValues[4] && inputValues[5];
            
            let q0 = shape.state?.q0 ?? 0;
            let q123 = shape.state?.q123 ?? 0; // 3-bit counter for CP1
            
            if (mr) {
              q0 = 0;
              q123 = 0;
            } else if (ms) {
              q0 = 1;
              q123 = 4; // Binary 100 -> Q3=1, Q2=0, Q1=0. Combined with Q0=1 gives 1001 (9)
            } else {
              // CP0 triggers Q0
              if (prevCp0 === 1 && cp0 === 0) { // Falling edge
                q0 = q0 === 0 ? 1 : 0;
              }
              // CP1 triggers Q1, Q2, Q3
              if (prevCp1 === 1 && cp1 === 0) { // Falling edge
                q123 = (q123 + 1) % 5; // Decade counter part (mod 5)
              }
            }
            
            shape.state = { q0, q123 };
            if (shape.outputs[0]) shape.outputs[0].value = q0;
            if (shape.outputs[1]) shape.outputs[1].value = (q123 & 1);
            if (shape.outputs[2]) shape.outputs[2].value = (q123 & 2) >> 1;
            if (shape.outputs[3]) shape.outputs[3].value = (q123 & 4) >> 2;
            break;
          }
          case 'IC555':
          case 'IC555_Simple': {
            let trig, thres, reset, vcc = 1, gnd = 0;
            if (shape.inputs.length === 3) {
              // Simple version: 0: TRIG, 1: THRES, 2: RESET
              trig = inputValues[0];
              thres = inputValues[1];
              reset = inputValues[2];
            } else {
              // Complex version: 0: RES, 1: TRI, 2: VCC, 3: DIS, 4: THR, 5: CON, 6: GND
              reset = inputValues[0];
              trig = inputValues[1];
              vcc = inputValues[2];
              thres = inputValues[4];
              gnd = inputValues[6];
            }
            
            const mode = shape.mode || 'astable';
            let q = shape.state?.q ?? 0;
            const now = Date.now();

            if (!shape.state) shape.state = { q: 0 };

            if (!vcc || gnd) {
              q = 0;
            } else if (reset === 0) {
              // Reset is active low
              q = 0;
            } else {
              if (mode === 'astable') {
                const freq = shape.frequency || 1;
                const periodMs = 1000 / freq;
                q = Math.floor(now / (periodMs / 2)) % 2 === 0 ? 1 : 0;
              } else if (mode === 'monostable') {
                const R = shape.resistance || 10000;
                const C = shape.capacitance || 0.00001;
                const T_ms = 1.1 * R * C * 1000;
                
                const prevTrig = shape.state?.lastTrig ?? shape.state?.lastTrigger ?? 1;
                // Trigger on falling edge (1 -> 0)
                if (prevTrig === 1 && trig === 0) {
                  shape.state.pulseEndTime = now + T_ms;
                  q = 1;
                } else if (now < (shape.state?.pulseEndTime || 0)) {
                  q = 1;
                } else {
                  q = 0;
                }
              } else if (mode === 'bistable') {
                // TRI sets (active low), THR resets (active high)
                if (!trig) q = 1;
                else if (thres) q = 0;
              }
            }

            shape.state.lastTrig = trig;
            shape.state.lastTrigger = trig;
            shape.state.q = q;
            if (shape.outputs[0]) shape.outputs[0].value = q;
            break;
          }
          case 'IC7410':
            if (shape.outputs[0]) shape.outputs[0].value = !(inputValues[0] && inputValues[1] && inputValues[2]) ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = !(inputValues[3] && inputValues[4] && inputValues[5]) ? 1 : 0;
            if (shape.outputs[2]) shape.outputs[2].value = !(inputValues[6] && inputValues[7] && inputValues[8]) ? 1 : 0;
            break;
          case 'IC7420':
            if (shape.outputs[0]) shape.outputs[0].value = !(inputValues[0] && inputValues[1] && inputValues[2] && inputValues[3]) ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = !(inputValues[4] && inputValues[5] && inputValues[6] && inputValues[7]) ? 1 : 0;
            break;
          case 'IC7430':
            if (shape.outputs[0]) shape.outputs[0].value = !inputValues.every(v => v) ? 1 : 0;
            break;
          case 'IC4013': {
            // Dual D Flip-Flop
            const d1 = inputValues[0], clk1 = inputValues[1], r1 = inputValues[2], s1 = inputValues[3];
            const d2 = inputValues[4], clk2 = inputValues[5], r2 = inputValues[6], s2 = inputValues[7];
            const prevClk1 = prevInputValues[1], prevClk2 = prevInputValues[5];
            if (!shape.state) shape.state = { q1: 0, q2: 0 };
            if (r1) shape.state.q1 = 0; else if (s1) shape.state.q1 = 1; else if (clk1 && !prevClk1) shape.state.q1 = d1 ? 1 : 0;
            if (r2) shape.state.q2 = 0; else if (s2) shape.state.q2 = 1; else if (clk2 && !prevClk2) shape.state.q2 = d2 ? 1 : 0;
            if (shape.outputs[0]) shape.outputs[0].value = shape.state.q1;
            if (shape.outputs[1]) shape.outputs[1].value = shape.state.q1 ? 0 : 1;
            if (shape.outputs[2]) shape.outputs[2].value = shape.state.q2;
            if (shape.outputs[3]) shape.outputs[3].value = shape.state.q2 ? 0 : 1;
            break;
          }
          case 'IC4017': {
            // Decade Counter
            const clk = inputValues[0], clken = inputValues[1], reset = inputValues[2];
            
            if (!shape.state || typeof shape.state !== 'object') {
              shape.state = { count: 0, lastClk: 0 };
            }
            
            const lastClk = shape.state.lastClk || 0;
            
            if (reset) {
              shape.state.count = 0;
            } else if (clk && !lastClk && !clken) {
              shape.state.count = (shape.state.count + 1) % 10;
            }
            
            shape.state.lastClk = clk;
            
            for (let i = 0; i < 10; i++) {
              if (shape.outputs && shape.outputs[i]) shape.outputs[i].value = (shape.state.count === i) ? 1 : 0;
            }
            if (shape.outputs && shape.outputs[10]) shape.outputs[10].value = (shape.state.count < 5) ? 1 : 0; // Carry out
            break;
          }
          case 'LM358':
          case 'LM324':
          case 'LM311':
            // Comparator logic for all
            if (shape.outputs[0]) shape.outputs[0].value = (inputValues[0] > inputValues[1]) ? 1 : 0;
            if (shape.outputs[1] && inputValues.length > 3) shape.outputs[1].value = (inputValues[2] > inputValues[3]) ? 1 : 0;
            break;
          case 'IC7SegToBCD': {
            // Converts 7-segment lines (a-g) back to 4-bit BCD (0-9, A-F)
            const segs = inputValues.slice(0, 7).map(v => v ? '1' : '0').join('');
            // Map common 7-seg patterns back to hex
            const segMap: { [key: string]: number } = {
              "1111110": 0, "0110000": 1, "1101101": 2, "1111001": 3, "0110011": 4,
              "1011011": 5, "1011111": 6, "1110000": 7, "1111111": 8, "1111011": 9,
              "1110111": 10, "0011111": 11, "1001110": 12, "0111101": 13, "1001111": 14, "1000111": 15
            };
            const val = segMap[segs] ?? 0;
            for (let i = 0; i < 4; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (val >> i) & 1;
            }
            break;
          }
          case 'IC74HC595': {
            const data = inputValues[0];
            const clk = inputValues[1];
            const latch = inputValues[2];
            
            if (!shape.state || typeof shape.state !== 'object' || !shape.state.storageReg) {
              shape.state = { 
                shiftReg: Array(8).fill(0), 
                storageReg: Array(8).fill(0),
                lastClk: 0,
                lastLatch: 0
              };
            }
            
            const lastClk = shape.state.lastClk || 0;
            const lastLatch = shape.state.lastLatch || 0;
            
            // Shift on rising edge of clock
            if (clk && !lastClk) {
              shape.state.shiftReg.unshift(data ? 1 : 0);
              shape.state.shiftReg.pop();
            }
            
            // Latch on rising edge of latch
            if (latch && !lastLatch) {
              shape.state.storageReg = [...shape.state.shiftReg];
            }
            
            shape.state.lastClk = clk;
            shape.state.lastLatch = latch;
            
            // Update outputs
            if (Array.isArray(shape.state.storageReg)) {
              shape.state.storageReg.forEach((val: number, i: number) => {
                if (shape.outputs[i]) shape.outputs[i].value = val;
              });
            }
            break;
          }
          case 'Display4Digit': {
            // New mapping based on SunFounder 12-pin layout
            // Segments: A:10, B:6, C:3, D:1, E:0, F:9, G:4, DP:2
            // Digits: D1:11, D2:8, D3:7, D4:5
            if (!shape.state) {
              shape.state = {
                digitSegments: Array(4).fill(0).map(() => Array(8).fill(0))
              };
            }
            
            const segMap = [10, 6, 3, 1, 0, 9, 4, 2]; // A, B, C, D, E, F, G, DP
            const digMap = [11, 8, 7, 5]; // D1, D2, D3, D4

            for (let d = 0; d < 4; d++) {
              const digitIdx = digMap[d];
              // Common Cathode: Digit is active when LOW (logic 0)
              // But in digital simulation libraries, sometimes digit selectors are active HIGH.
              // SunFounder displays are often Common Cathode (Digit pin to GND).
              // Let's assume Active LOW for digit selection (standard for common cathode)
              // Actually, many simulations use active HIGH for simplicity. 
              // The user might expect standard behavior. 
              // Let's check SunFounder docs: pin 12, 9, 8, 6 are COM. 
              // If Common Cathode, you pull COM to GND (0) to select.
              // However, usually these digital simulators treat 'High' as enabling.
              // Let's use Active LOW to be 'Realistic' since user provided docs.
              const isDigitActive = !inputValues[digitIdx]; 
              
              if (isDigitActive) {
                for (let s = 0; s < 8; s++) {
                  const segIdx = segMap[s];
                  shape.state.digitSegments[d][s] = inputValues[segIdx] ? 1 : 0;
                }
              }
            }
            break;
          }
          case 'Buzzer':
            // Visual feedback handled in rendering
            break;
          case 'Motor':
            if (!shape.state) shape.state = { rotation: 0 };
            if (inputValues[0]) {
              shape.state.rotation = (shape.state.rotation + 15) % 360;
            }
            break;
          case 'RGB_LED': {
            // Inputs: 0:R, 1:G, 2:B
            const getComp = (val: any) => {
              const n = typeof val === 'number' ? val : (val === '1' ? 1 : 0);
              // Support both 0-1 and 0-5V ranges
              const intensity = n > 1 ? n / 5 : n;
              return Math.min(255, Math.max(0, Math.round(intensity * 255)));
            };
            const r = getComp(inputValues[0]);
            const g = getComp(inputValues[1]);
            const b = getComp(inputValues[2]);
            shape.color = `rgb(${r},${g},${b})`;
            break;
          }
          case 'Bus':
          case 'Bus8':
          case 'Bus16': {
            inputValues.forEach((val, i) => {
              if (shape.outputs[i]) shape.outputs[i].value = val;
            });
            break;
          }
          case 'OLED_Display':
            // Simple display simulation
            if (!shape.state) shape.state = { text: 'OLED READY' };
            if (inputValues[0]) shape.state.text = 'SIGNAL HIGH';
            else shape.state.text = 'SIGNAL LOW';
            break;
          case 'IC74147':
          case 'IC74148': {
            if (shape.type === 'IC74147') {
              // 10-line to 4-line Priority Encoder (Active Low)
              let highest = -1;
              for (let i = 8; i >= 0; i--) {
                if (!inputValues[i]) {
                  highest = i + 1;
                  break;
                }
              }
              const bcd = highest === -1 ? 0xF : (~highest & 0xF);
              for (let i = 0; i < 4; i++) {
                if (shape.outputs[i]) shape.outputs[i].value = (bcd >> i) & 1;
              }
            } else {
              // 74148: 8-line to 3-line Priority Encoder (Active Low)
              // Inputs: 0-7: I0-I7, 8: EI
              const ei = inputValues[8];
              if (ei) {
                // Disabled
                shape.outputs.forEach(o => o.value = 1);
              } else {
                let highest = -1;
                for (let i = 7; i >= 0; i--) {
                  if (!inputValues[i]) {
                    highest = i;
                    break;
                  }
                }
                if (highest === -1) {
                  // No input active
                  if (shape.outputs[0]) shape.outputs[0].value = 1; // A0
                  if (shape.outputs[1]) shape.outputs[1].value = 1; // A1
                  if (shape.outputs[2]) shape.outputs[2].value = 1; // A2
                  if (shape.outputs[3]) shape.outputs[3].value = 1; // GS
                  if (shape.outputs[4]) shape.outputs[4].value = 0; // EO
                } else {
                  // Input active
                  const bin = ~highest & 0x7;
                  if (shape.outputs[0]) shape.outputs[0].value = (bin >> 0) & 1;
                  if (shape.outputs[1]) shape.outputs[1].value = (bin >> 1) & 1;
                  if (shape.outputs[2]) shape.outputs[2].value = (bin >> 2) & 1;
                  if (shape.outputs[3]) shape.outputs[3].value = 0; // GS
                  if (shape.outputs[4]) shape.outputs[4].value = 1; // EO
                }
              }
            }
            break;
          }
          case 'FlowStart':
            if (shape.outputs[0]) shape.outputs[0].value = 1;
            break;
          case 'FlowProcess':
          case 'FlowInputOutput':
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0] ? 1 : 0;
            break;
          case 'FlowDecision':
            const trigger = inputValues[0] ? 1 : 0;
            if (shape.outputs[0]) shape.outputs[0].value = trigger; // YES
            if (shape.outputs[1]) shape.outputs[1].value = trigger ? 0 : 1; // NO
            break;
          case 'FlowEnd':
            break;
          case 'CustomBlock': {
            // Generic RAM simulation
            if (shape.name?.startsWith('ram_') && shape.burnedData) {
              const addrBits = shape.burnedData.inputCount - 9;
              const we = Number(inputValues[inputValues.length - 1] || 0); // Last input is Write Enable
              
              // Calculate address from first N bits
              let addr = 0;
              for (let i = 0; i < addrBits; i++) {
                if (Number(inputValues[i] || 0) === 1) {
                  addr |= (1 << i);
                }
              }
              
              // Data inputs are between address bits and WE
              const dataIn = inputValues.slice(addrBits, addrBits + 8);
              
              const size = 1 << addrBits;
              if (!shape.burnedData.lastState) shape.burnedData.lastState = new Array(size).fill(0).map(() => new Array(8).fill(0));
              
              // Safety check for address range
              const safeAddr = addr % size;

              if (we === 1) {
                shape.burnedData.lastState[safeAddr] = [...dataIn];
              }
              
              const currentData = shape.burnedData.lastState[safeAddr];
              currentData.forEach((val: number, idx: number) => {
                if (shape.outputs[idx]) shape.outputs[idx].value = val;
              });
              break;
            }

            // ROM simulation
            if (shape.name?.startsWith('rom_') && shape.burnedData) {
              const addrBits = shape.burnedData.inputCount - 1;
              const oe = Number(inputValues[inputValues.length - 1] || 0);

              let addr = 0;
              for (let i = 0; i < addrBits; i++) {
                if (Number(inputValues[i] || 0) === 1) {
                  addr |= (1 << i);
                }
              }

              const size = 1 << addrBits;
              if (!shape.burnedData.lastState) shape.burnedData.lastState = new Array(size).fill(0).map(() => new Array(8).fill(0));
              
              const safeAddr = addr % size;
              const currentData = shape.burnedData.lastState[safeAddr] || new Array(8).fill(0);

              currentData.forEach((val: number, idx: number) => {
                if (shape.outputs[idx]) shape.outputs[idx].value = oe === 1 ? val : 0;
              });
              break;
            }

            // ALU simulation
            if (shape.name === 'alu_8' && shape.burnedData) {
              const valA = Array.from({length: 8}, (_, i) => Number(inputValues[i] || 0)).reduce((acc, v, i) => acc | (v << i), 0);
              const valB = Array.from({length: 8}, (_, i) => Number(inputValues[i+8] || 0)).reduce((acc, v, i) => acc | (v << i), 0);
              const op = Number(inputValues[16] || 0) | (Number(inputValues[17] || 0) << 1);

              let res = 0;
              let carry = 0;

              switch(op) {
                case 0: // ADD
                  res = valA + valB;
                  carry = res > 255 ? 1 : 0;
                  res &= 255;
                  break;
                case 1: // SUB
                  res = valA - valB;
                  carry = res < 0 ? 1 : 0;
                  res = (res + 256) & 255;
                  break;
                case 2: // OR
                  res = valA | valB;
                  break;
                case 3: // AND
                  res = valA & valB;
                  break;
              }

              // Set outputs
              for (let i = 0; i < 8; i++) {
                if (shape.outputs[i]) shape.outputs[i].value = (res >> i) & 1;
              }
              if (shape.outputs[8]) shape.outputs[8].value = res === 0 ? 1 : 0; // Zero flag
              if (shape.outputs[9]) shape.outputs[9].value = carry; // Carry flag
              break;
            }

            // Stack simulation
            if (shape.name === 'stack_16_8' && shape.burnedData) {
              const dataIn = inputValues.slice(0, 8);
              const push = Number(inputValues[8] || 0);
              const pop = Number(inputValues[9] || 0);
              const clk = Number(inputValues[10] || 0);
              const rst = Number(inputValues[11] || 0);
              
              if (!shape.burnedData.lastState) {
                shape.burnedData.lastState = new Array(16).fill(0).map(() => new Array(8).fill(0));
                shape.burnedData.sp = 0;
                shape.burnedData.lastClock = 0;
              }

              if (rst === 1) {
                shape.burnedData.sp = 0;
              } else if (clk === 1 && shape.burnedData.lastClock === 0) {
                // Rising edge
                if (push === 1 && shape.burnedData.sp < 16) {
                  shape.burnedData.lastState[shape.burnedData.sp] = [...dataIn];
                  shape.burnedData.sp++;
                } else if (pop === 1 && shape.burnedData.sp > 0) {
                  shape.burnedData.sp--;
                }
              }
              shape.burnedData.lastClock = clk;

              // Output logic: Q shows top of stack (last pushed element)
              const topIdx = Math.max(0, shape.burnedData.sp - 1);
              const currentData = shape.burnedData.lastState[topIdx] || new Array(8).fill(0);
              currentData.forEach((val: number, idx: number) => {
                if (shape.outputs[idx]) shape.outputs[idx].value = (shape.burnedData.sp > 0) ? val : 0;
              });

              // Flags
              if (shape.outputs[8]) shape.outputs[8].value = (shape.burnedData.sp === 16) ? 1 : 0; // FULL
              if (shape.outputs[9]) shape.outputs[9].value = (shape.burnedData.sp === 0) ? 1 : 0;  // EMPTY
              
              // Stack Pointer Bits
              if (shape.outputs[10]) shape.outputs[10].value = (shape.burnedData.sp & 1) ? 1 : 0;
              if (shape.outputs[11]) shape.outputs[11].value = (shape.burnedData.sp & 2) ? 1 : 0;
              if (shape.outputs[12]) shape.outputs[12].value = (shape.burnedData.sp & 4) ? 1 : 0;

              break;
            }

            if (shape.name === 'arch_cu') {
              const inst = Number(inputValues[0] || 0) | (Number(inputValues[1] || 0) << 1) | (Number(inputValues[2] || 0) << 2) | (Number(inputValues[3] || 0) << 3);
              const step = Number(inputValues[4] || 0) | (Number(inputValues[5] || 0) << 1) | (Number(inputValues[6] || 0) << 2);
              const z = Number(inputValues[7] || 0);
              const c = Number(inputValues[8] || 0);

              // Reset outputs
              shape.outputs.forEach(o => { if (o) o.value = 0; });

              // Microcode Signals Index Mapping:
              // 0:HLT, 1:MI, 2:RI, 3:RO, 4:IO, 5:II, 6:AI, 7:AO, 8:EO, 9:SU, 10:BI, 11:OI, 12:CE, 13:CO, 14:J, 15:FI
              const setSignals = (indices: number[]) => {
                indices.forEach(idx => {
                  if (shape.outputs[idx]) shape.outputs[idx].value = 1;
                });
              };

              // T-States 0-2: Instruction Fetch (Common to all instructions)
              if (step === 0) setSignals([1, 13]); // CO | MI
              else if (step === 1) setSignals([3, 5, 12]); // RO | II | CE
              else if (step >= 2) {
                // Execute phase
                switch(inst) {
                  case 0x1: // LDA (0001)
                    if (step === 2) setSignals([4, 1]); // IO | MI
                    if (step === 3) setSignals([3, 6]); // RO | AI
                    break;
                  case 0x2: // ADD (0010)
                    if (step === 2) setSignals([4, 1]); // IO | MI
                    if (step === 3) setSignals([3, 10]); // RO | BI
                    if (step === 4) setSignals([8, 6, 15]); // EO | AI | FI
                    break;
                  case 0x3: // SUB (0011)
                    if (step === 2) setSignals([4, 1]); // IO | MI
                    if (step === 3) setSignals([3, 10]); // RO | BI
                    if (step === 4) setSignals([8, 6, 9, 15]); // EO | AI | SU | FI
                    break;
                  case 0x4: // STA (0100)
                    if (step === 2) setSignals([4, 1]); // IO | MI
                    if (step === 3) setSignals([7, 2]); // AO | RI
                    break;
                  case 0x5: // LDI (0101)
                    if (step === 2) setSignals([4, 6]); // IO | AI
                    break;
                  case 0x6: // JMP (0110)
                    if (step === 2) setSignals([4, 14]); // IO | J
                    break;
                  case 0x7: // JC (0111)
                    if (step === 2 && c === 1) setSignals([4, 14]); // IO | J (Conditional)
                    break;
                  case 0x8: // JZ (1000)
                    if (step === 2 && z === 1) setSignals([4, 14]); // IO | J (Conditional)
                    break;
                  case 0xE: // OUT (1110)
                    if (step === 2) setSignals([7, 11]); // AO | OI
                    break;
                  case 0xF: // HLT (1111)
                    if (step === 2) setSignals([0]); // HLT
                    break;
                }
              }
              break;
            }

            if (shape.name === 'reg_8' && shape.burnedData) {
              const dataIn = inputValues.slice(0, 8);
              const en = Number(inputValues[8] || 0); // Store Out
              const clk = Number(inputValues[9] || 0); // Clock CLK

              if (shape.burnedData.state === undefined) {
                shape.burnedData.state = new Array(8).fill(0);
                shape.burnedData.lastClock = 0;
              }

              if (clk === 1 && shape.burnedData.lastClock === 0) {
                // Rising edge
                if (en === 1) {
                  shape.burnedData.state = [...dataIn];
                }
              }
              shape.burnedData.lastClock = clk;

              shape.outputs.forEach((out, idx) => {
                if (out) out.value = (shape.burnedData.state[idx] || 0);
              });
              break;
            }

            if (shape.name === 'bus_8') {
              const oe = Number(inputValues[8] || 0);
              shape.outputs.forEach((out, idx) => {
                if (out) out.value = oe === 1 ? (inputValues[idx] || 0) : 0;
              });
              break;
            }

            if (shape.isBurned && shape.burnedData?.truthTable) {
              const inputKey = inputValues.join(',');
              const outputValues = shape.burnedData.truthTable[inputKey];
              if (outputValues) {
                outputValues.forEach((val, idx) => {
                  if (shape.outputs[idx]) shape.outputs[idx].value = val;
                });
              }
              break;
            }
            if (shape.subcircuit) {
              const { inputMapping, outputMapping, shapes: subShapes, connectors: subConnectors } = shape.subcircuit;
              
              // Use a fresh map for this iteration to avoid stale references
              const internalShapeMap = new Map<string, Shape>(subShapes.map(s => [s.id, s]));

              // Map external block inputs to internal subcircuit components
              if (inputMapping) {
                inputMapping.forEach((mapping, idx) => {
                  const internalShape = internalShapeMap.get(mapping.internalShapeId);
                  if (internalShape && shape.inputs[idx]) {
                    const val = shape.inputs[idx].value;
                    if (mapping.type === 'input') {
                      if (internalShape.inputs?.[mapping.index]) {
                        internalShape.inputs[mapping.index].value = val;
                      }
                    } else if (mapping.type === 'output') {
                      if (internalShape.outputs?.[mapping.index]) {
                        internalShape.outputs[mapping.index].value = val;
                      }
                    }
                    
                    // Sync visual states for internal input controls (visual feedback inside the block)
                    if (internalShape.type === 'PushButton') internalShape.isPressed = val === 1;
                    if (internalShape.type === 'ToggleSwitch') internalShape.state = val === 1;
                    if (internalShape.type === 'InputL' || internalShape.type === 'ToggleSwitch' || internalShape.type === 'PushButton') {
                      internalShape.color = val === 1 ? '#22c55e' : '#ef4444';
                    }
                  }
                });
              }

              // Evaluate the subcircuit (recursion happens here)
              const internalShapes = evaluateCircuit(subShapes, subConnectors, depth + 1);
              shape.subcircuit.shapes = internalShapes;
              
              // Map stabilized internal component states back to external block outputs
              if (outputMapping) {
                const updatedInternalShapeMap = new Map<string, Shape>(internalShapes.map(s => [s.id, s]));
                outputMapping.forEach((mapping, idx) => {
                  const internalShape = updatedInternalShapeMap.get(mapping.internalShapeId);
                  if (internalShape && shape.outputs?.[idx]) {
                    const val = mapping.type === 'input' 
                      ? (internalShape.inputs?.[mapping.index]?.value ?? 0)
                      : (internalShape.outputs?.[mapping.index]?.value ?? 0);
                    
                    shape.outputs[idx].value = val;

                    // Sync visual states for internal output controls
                    if (internalShape.type === 'OutPutL') {
                      internalShape.color = val === 1 ? (internalShape.onColor || '#22c55e') : (internalShape.offColor || '#3b82f6');
                    }
                  }
                });
              }
            }
            break;
          }
          case 'IC7485': {
            // 4-bit Magnitude Comparator
            // A: in0-3, B: in4-7, Cascading: in8-10
            const a = (inputValues[0] ? 1 : 0) | (inputValues[1] ? 2 : 0) | (inputValues[2] ? 4 : 0) | (inputValues[3] ? 8 : 0);
            const b = (inputValues[4] ? 1 : 0) | (inputValues[5] ? 2 : 0) | (inputValues[6] ? 4 : 0) | (inputValues[7] ? 8 : 0);
            let altb = a < b ? 1 : 0;
            let aeqb = a === b ? 1 : 0;
            let agtb = a > b ? 1 : 0;
            if (shape.outputs[0]) shape.outputs[0].value = altb;
            if (shape.outputs[1]) shape.outputs[1].value = aeqb;
            if (shape.outputs[2]) shape.outputs[2].value = agtb;
            break;
          }
          case 'IC74181': {
            // 4-bit ALU (74181)
            // Inputs: 0-3: A, 4-7: B, 8-11: S (Select), 12: M (Mode), 13: Cn (Carry in)
            const a = (inputValues[0] ? 1 : 0) | (inputValues[1] ? 2 : 0) | (inputValues[2] ? 4 : 0) | (inputValues[3] ? 8 : 0);
            const b = (inputValues[4] ? 1 : 0) | (inputValues[5] ? 2 : 0) | (inputValues[6] ? 4 : 0) | (inputValues[7] ? 8 : 0);
            const s = (inputValues[8] ? 1 : 0) | (inputValues[9] ? 2 : 0) | (inputValues[10] ? 4 : 0) | (inputValues[11] ? 8 : 0);
            const m = inputValues[12] ? 1 : 0; // 1 for Logic, 0 for Arithmetic
            const cn = inputValues[13] ? 1 : 0; // Active low carry in (0 = carry present)
            
            let f = 0;
            let cout = 1; // Active low carry out (1 = no carry)

            if (m) {
              // Logic Mode (M=1)
              switch (s) {
                case 0: f = ~a; break;
                case 1: f = ~(a | b); break;
                case 2: f = (~a) & b; break;
                case 3: f = 0; break;
                case 4: f = ~(a & b); break;
                case 5: f = ~b; break;
                case 6: f = a ^ b; break;
                case 7: f = a & (~b); break;
                case 8: f = (~a) | b; break;
                case 9: f = ~(a ^ b); break;
                case 10: f = b; break;
                case 11: f = a & b; break;
                case 12: f = 15; break;
                case 13: f = a | (~b); break;
                case 14: f = a | b; break;
                case 15: f = a; break;
              }
            } else {
              // Arithmetic Mode (M=0)
              const cin = cn ? 0 : 1;
              let res = 0;
              switch (s) {
                case 0: res = a + cin; break;
                case 9: res = a + b + cin; break;
                case 6: res = a - b - 1 + cin; break;
                case 15: res = a - 1 + cin; break;
                default: res = a + cin; // Default fallback
              }
              f = res & 0xF;
              cout = (res > 15 || res < 0) ? 0 : 1;
            }
            
            f = f & 0xF;
            for (let i = 0; i < 4; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (f >> i) & 1;
            }
            if (shape.outputs[4]) shape.outputs[4].value = (a === b) ? 1 : 0; // A=B
            if (shape.outputs[5]) shape.outputs[5].value = cout; // Cn+4
            break;
          }
          case 'IC4013': {
            // Dual D Flip-Flop
            const d = inputValues[0];
            const clk = inputValues[1];
            const prevClk = shape.prevInputs?.[1] === 1;
            if (!shape.state) shape.state = { q: 0 };
            if (clk && !prevClk) {
              shape.state.q = d ? 1 : 0;
            }
            if (shape.outputs[0]) shape.outputs[0].value = shape.state.q;
            if (shape.outputs[1]) shape.outputs[1].value = shape.state.q ? 0 : 1;
            break;
          }
          case 'IC74107': {
            // Dual JK Flip-Flop with Clear, Negative-Edge Triggered
            if (!shape.state) shape.state = { q1: 0, q2: 0 };
            
            const j1 = inputValues[0];
            const k1 = inputValues[1];
            const clk1 = inputValues[2];
            const clr1 = inputValues[3];
            
            const j2 = inputValues[4];
            const k2 = inputValues[5];
            const clk2 = inputValues[6];
            const clr2 = inputValues[7];
            
            const prevClk1 = shape.prevInputs?.[2] === 1;
            const prevClk2 = shape.prevInputs?.[6] === 1;
            
            // Unit 1
            if (clr1 === 0) {
              shape.state.q1 = 0;
            } else if (prevClk1 && !clk1) { // Falling edge
              if (j1 && !k1) shape.state.q1 = 1;
              else if (!j1 && k1) shape.state.q1 = 0;
              else if (j1 && k1) shape.state.q1 = shape.state.q1 ? 0 : 1;
            }
            
            // Unit 2
            if (clr2 === 0) {
              shape.state.q2 = 0;
            } else if (prevClk2 && !clk2) { // Falling edge
              if (j2 && !k2) shape.state.q2 = 1;
              else if (!j2 && k2) shape.state.q2 = 0;
              else if (j2 && k2) shape.state.q2 = shape.state.q2 ? 0 : 1;
            }
            
            if (shape.outputs[0]) shape.outputs[0].value = shape.state.q1;
            if (shape.outputs[1]) shape.outputs[1].value = shape.state.q1 ? 0 : 1;
            if (shape.outputs[2]) shape.outputs[2].value = shape.state.q2;
            if (shape.outputs[3]) shape.outputs[3].value = shape.state.q2 ? 0 : 1;
            break;
          }
          case 'IC4066': {
            // Quad Bilateral Switch
            const sig = inputValues[0];
            const ctrl = inputValues[1];
            if (shape.outputs[0]) shape.outputs[0].value = ctrl ? (sig ? 1 : 0) : 0;
            break;
          }
          case 'LGT8F328P':
          case 'ATmega16U2':
          case 'ATmega16':
          case 'ATtiny85':
          case 'PIC18F2520':
          case 'ESP32':
          case 'RP2040': {
            // Generic MCU simulation: simple pass-through for now or custom logic
            inputValues.forEach((val, i) => {
              if (shape.outputs[i]) shape.outputs[i].value = val ? 1 : 0;
            });
            break;
          }
          case 'ATmega328P': {
            const reset = inputValues[0];
            const vcc = inputValues[1];
            if (!shape.state) shape.state = { count: 0 };
            
            if (!vcc) {
              shape.outputs.forEach(o => o.value = 0);
            } else if (!reset) {
              shape.state.count = 0;
              shape.outputs.forEach(o => o.value = 0);
            } else {
              // Simple counter logic for demonstration
              shape.state.count = (shape.state.count + 1) % 256;
              for (let i = 0; i < 8; i++) {
                if (shape.outputs[i]) {
                  shape.outputs[i].value = (shape.state.count >> i) & 1;
                }
              }
            }
            break;
          }
          case 'IC4001': // NOR
            if (shape.outputs[0]) shape.outputs[0].value = !(inputValues[0] || inputValues[1]) ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = !(inputValues[2] || inputValues[3]) ? 1 : 0;
            break;
          case 'IC4011': // NAND
            if (shape.outputs[0]) shape.outputs[0].value = !(inputValues[0] && inputValues[1]) ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = !(inputValues[2] && inputValues[3]) ? 1 : 0;
            break;
          case 'IC4071': // OR
            if (shape.outputs[0]) shape.outputs[0].value = (inputValues[0] || inputValues[1]) ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = (inputValues[2] || inputValues[3]) ? 1 : 0;
            break;
          case 'IC4081': // AND
            if (shape.outputs[0]) shape.outputs[0].value = (inputValues[0] && inputValues[1]) ? 1 : 0;
            if (shape.outputs[1]) shape.outputs[1].value = (inputValues[2] && inputValues[3]) ? 1 : 0;
            break;
          case 'IC4069': // NOT
            for (let i = 0; i < 6; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = !inputValues[i] ? 1 : 0;
            }
            break;
          case 'LM386':
            // Audio Amp: Simple buffer
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0] ? 1 : 0;
            break;
          case 'ICMAX7219': {
            // MAX7219 Serial Driver
            // Inputs: 0:DIN, 1:CLK, 2:LOAD, 3:VCC, 4:GND, 5:ISET
            // For now, simple pass-through to DOUT and basic state
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0]; // DOUT = DIN
            // Placeholder for DIG/SEG outputs
            for (let i = 1; i < shape.outputs.length; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = 0;
            }
            break;
          }
          case 'DisplayBCD': {
            const bcdStr = [inputValues[3], inputValues[2], inputValues[1], inputValues[0]].map(v => v ? '1' : '0').join('');
            const segments = bcdToSegments(bcdStr);
            if (!shape.state) shape.state = {};
            shape.state.segments = segments;
            break;
          }
          case 'Screen': {
            if (!shape.state) {
              shape.state = {
                buffer: new Array(96).fill(0),
                x: 0,
                y: 0,
                prevCK: 0,
                lastRefresh: 0
              };
            }
            const r = inputValues[0] ? 1 : 0;
            const g = inputValues[1] ? 1 : 0;
            const b = inputValues[2] ? 1 : 0;
            const ck = inputValues[3] ? 1 : 0;
            const rst = inputValues[4] ? 1 : 0;
            const prevCK = shape.state.prevCK || 0;
            
            // Internal Clock logic
            const freq = shape.frequency || 60;
            const periodMs = 1000 / freq;
            const now = Date.now();
            const lastRefresh = shape.state.lastRefresh || 0;
            let internalTick = false;
            // Only use internal tick if CK is NOT connected (optional: or both)
            // But user said "agrega un reloj incorporado", so let's allow it to act as an auto-refresh if enabled.
            if (now - lastRefresh >= periodMs) {
              internalTick = true;
              shape.state.lastRefresh = now;
            }

            if (rst) {
              shape.state.buffer = new Array(96).fill(0);
              shape.state.x = 0;
              shape.state.y = 0;
            } else if ((ck && !prevCK) || internalTick) {
              // Trigger on external CK rising edge OR internal clock tick
              const colorVal = (r << 2) | (g << 1) | b;
              const idx = shape.state.y * 12 + shape.state.x;
              if (idx < 96) {
                const newBuffer = [...shape.state.buffer];
                newBuffer[idx] = colorVal;
                shape.state.buffer = newBuffer;
              }
              shape.state.x++;
              if (shape.state.x >= 12) {
                shape.state.x = 0;
                shape.state.y++;
                if (shape.state.y >= 8) {
                  shape.state.y = 0;
                }
              }
            }
            shape.state.prevCK = ck;
            break;
          }
          case 'XYScreen': {
            if (!shape.state) {
              shape.state = {
                buffer: new Array(512).fill(0),
                prevS: 0
              };
            }
            const r = inputValues[0] ? 1 : 0;
            const g = inputValues[1] ? 1 : 0;
            const b = inputValues[2] ? 1 : 0;
            const s = inputValues[3] ? 1 : 0;
            const clear = inputValues[4] ? 1 : 0;
            const x = (inputValues[5] ? 1 : 0) | (inputValues[6] ? 2 : 0) | (inputValues[7] ? 4 : 0) | (inputValues[8] ? 8 : 0) | (inputValues[9] ? 16 : 0);
            const y = (inputValues[10] ? 1 : 0) | (inputValues[11] ? 2 : 0) | (inputValues[12] ? 4 : 0) | (inputValues[13] ? 8 : 0);
            const prevS = shape.state.prevS || 0;

            if (clear) {
              shape.state.buffer = new Array(512).fill(0);
            } else if (s && !prevS) {
              // Write on rising edge of Store
              if (x < 32 && y < 16) {
                const colorVal = (r << 2) | (g << 1) | b;
                const idx = y * 32 + x;
                const newBuffer = [...shape.state.buffer];
                newBuffer[idx] = colorVal;
                shape.state.buffer = newBuffer;
              }
            }
            shape.state.prevS = s;
            break;
          }
          case 'Battery':
          case 'VCC':
            if (shape.outputs[0]) shape.outputs[0].value = 1;
            if (shape.type === 'Battery' && shape.outputs[1]) shape.outputs[1].value = 0;
            break;
          case 'DC_Voltage_Source':
          case 'Battery':
          case 'VCC':
            if (shape.outputs[0]) shape.outputs[0].value = shape.voltage || 5;
            if (shape.type === 'Battery' && shape.outputs[1]) shape.outputs[1].value = 0;
            break;
          case 'AC_Voltage_Source': {
            const now = Date.now();
            const freq = shape.frequency || 1;
            const amp = shape.voltage || 5;
            const phase = shape.phase || 0;
            const offset = shape.offset || 0;
            const newValue = offset + amp * Math.sin(now / 1000 * 2 * Math.PI * freq + (phase * Math.PI / 180));
            if (shape.outputs[0]) shape.outputs[0].value = newValue;
            break;
          }
          case 'Step_Voltage_Source': {
            const now = Date.now();
            const freq = shape.frequency || 1;
            const amp = shape.voltage || 5;
            const duty = (shape.dutyCycle || 50) / 100;
            const offset = shape.offset || 0;
            const period = 1 / freq;
            const t = (now / 1000) % period;
            const newValue = offset + (t < period * duty ? amp : 0);
            if (shape.outputs[0]) shape.outputs[0].value = newValue;
            break;
          }
          case 'GND':
            if (shape.outputs[0]) shape.outputs[0].value = 0;
            break;
          case 'Resistor':
          case 'Capacitor':
          case 'Inductor':
          case 'Diode':
          case 'LED': {
            // Pass-through + update state
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0];
            if (!shape.state) shape.state = {};
            shape.state.isOn = inputValues[0] > 0.5;
            break;
          }
          case 'Fuse':
          case 'Coil':
          case 'Transformer':
            // Pass-through
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0];
            if (shape.type === 'Transformer' && shape.outputs[1]) shape.outputs[1].value = inputValues[1];
            break;
          case 'Regulator':
            // Simple regulator: output fixed voltage if input is higher
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0] > 7 ? 5 : 0;
            break;
          case 'Transistor_NPN':
          case 'MOSFET_N':
          case 'JFET_N': {
            const gate = inputValues[0];
            const drain = inputValues[1];
            const threshold = shape.type === 'Transistor_NPN' ? 0.7 : 2.0;
            if (shape.outputs[1]) shape.outputs[1].value = gate > threshold ? drain : 0;
            break;
          }
          case 'Transistor_PNP':
          case 'MOSFET_P':
          case 'JFET_P': {
            const gate = inputValues[0];
            const drain = inputValues[1];
            const threshold = shape.type === 'Transistor_PNP' ? 0.7 : 2.0;
            if (shape.outputs[1]) shape.outputs[1].value = gate < threshold ? drain : 0;
            break;
          }
          case 'Potentiometer': {
            const v1 = inputValues[0];
            const v2 = inputValues[1];
            const ratio = (shape.resistance || 50) / 100; // Using resistance as % for now
            if (shape.outputs[0]) shape.outputs[0].value = v1 + (v2 - v1) * ratio;
            break;
          }
          case 'Relay':
          case 'Relay_SPDT':
          case 'Relay_DPDT': {
            const coil = Math.abs(inputValues[0] - inputValues[1]) > 3; // 3V threshold for relay
            if (shape.type === 'Relay') {
              const com = inputValues[2];
              if (shape.outputs[0]) shape.outputs[0].value = coil ? com : 0;
              if (shape.outputs[1]) shape.outputs[1].value = !coil ? com : 0;
            } else if (shape.type === 'Relay_SPDT') {
              const com = inputValues[2];
              if (shape.outputs[1]) shape.outputs[1].value = !coil ? com : 0; // NC
              if (shape.outputs[2]) shape.outputs[2].value = coil ? com : 0; // NO
            } else if (shape.type === 'Relay_DPDT') {
              const com1 = inputValues[2];
              const com2 = inputValues[5];
              if (shape.outputs[1]) shape.outputs[1].value = !coil ? com1 : 0; // NC1
              if (shape.outputs[2]) shape.outputs[2].value = coil ? com1 : 0; // NO1
              if (shape.outputs[4]) shape.outputs[4].value = !coil ? com2 : 0; // NC2
              if (shape.outputs[5]) shape.outputs[5].value = coil ? com2 : 0; // NO2
            }
            break;
          }
          case 'Switch_SPST':
            if (shape.outputs[0]) shape.outputs[0].value = shape.state ? inputValues[0] : 0;
            break;
          case 'Switch_SPDT':
            if (shape.outputs[0]) shape.outputs[0].value = !shape.state ? inputValues[0] : 0;
            if (shape.outputs[1]) shape.outputs[1].value = shape.state ? inputValues[0] : 0;
            break;
          case 'OpAmp': {
            const pos = inputValues[0];
            const neg = inputValues[1];
            const vcc = inputValues[2] || 15;
            const vee = inputValues[3] || -15;
            const gain = 100000; // Open loop gain
            let out = (pos - neg) * gain;
            out = Math.min(Math.max(out, vee), vcc);
            if (shape.outputs[0]) shape.outputs[0].value = out;
            break;
          }
          case 'LB1':
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0] * (shape.gain || 1);
            break;
          case 'SUM1':
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0] - inputValues[1];
            break;
          case 'SUM2':
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0] + inputValues[1];
            break;
          case 'MUL1':
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0] * inputValues[1];
            break;
          case 'Bridge_Rectifier': {
            const ac1 = inputValues[0];
            const ac2 = inputValues[1];
            const diff = Math.abs(ac1 - ac2);
            if (shape.outputs[0]) shape.outputs[0].value = diff; // +
            if (shape.outputs[1]) shape.outputs[1].value = 0; // -
            break;
          }
          case 'Darlington_NPN': {
            const gate = inputValues[0];
            const drain = inputValues[1];
            if (shape.outputs[1]) shape.outputs[1].value = gate > 1.2 ? drain : 0;
            break;
          }
          case 'Darlington_PNP': {
            const gate = inputValues[0];
            const drain = inputValues[1];
            if (shape.outputs[1]) shape.outputs[1].value = gate < 1.2 ? drain : 0;
            break;
          }
          case 'SCR': {
            const anode = inputValues[0];
            const gate = inputValues[1];
            let isOn = shape.state?.isOn || false;
            if (gate > 0.7) isOn = true;
            if (anode < 0.1) isOn = false;
            if (!shape.state) shape.state = {};
            shape.state.isOn = isOn;
            if (shape.outputs[0]) shape.outputs[0].value = isOn ? anode : 0;
            break;
          }
          case 'DIAC': {
            const v = inputValues[0];
            let isOn = shape.state?.isOn || false;
            if (Math.abs(v) > 30) isOn = true;
            if (Math.abs(v) < 5) isOn = false;
            if (!shape.state) shape.state = {};
            shape.state.isOn = isOn;
            if (shape.outputs[0]) shape.outputs[0].value = isOn ? v : 0;
            break;
          }
          case 'TRIAC': {
            const mt1 = inputValues[0];
            const gate = inputValues[1];
            let isOn = shape.state?.isOn || false;
            if (Math.abs(gate) > 0.7) isOn = true;
            if (Math.abs(mt1) < 0.1) isOn = false;
            if (!shape.state) shape.state = {};
            shape.state.isOn = isOn;
            if (shape.outputs[0]) shape.outputs[0].value = isOn ? mt1 : 0;
            break;
          }
          case 'PWM_Block': {
            const now = Date.now();
            const period = 1000; // 1s
            const duty = (shape.dutyCycle || 50) / 100;
            const t = now % period;
            if (shape.outputs[0]) shape.outputs[0].value = t < period * duty ? 5 : 0;
            break;
          }
          case 'Variable_Capacitor':
          case 'Polarized_Capacitor':
          case 'Crystal':
          case 'Speaker':
          case 'Antenna':
          case 'Lamp':
          case 'Microphone':
          case 'LDR':
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0];
            break;
          case 'Sens_Temp':
            if (shape.outputs[0]) shape.outputs[0].value = 25 + Math.sin(performance.now() / 2000) * 10;
            break;
          case 'Sens_Light':
            if (shape.outputs[0]) shape.outputs[0].value = 500 + Math.sin(performance.now() / 3000) * 200;
            break;
          case 'Sens_Ultrasonic':
            if (shape.outputs[0]) shape.outputs[0].value = inputValues[0] > 0.5 ? Math.abs(Math.sin(performance.now() / 1000) * 400) : 0;
            break;
          case 'MCU_ATmega328P':
          case 'MCU_ESP32':
          case 'MCU_ATTiny85': {
            if (!shape.state) shape.state = { tick: 0 };
            shape.state.tick++;
            
            // Default "Blink" on last pin
            const lastOutIdx = shape.outputs.length - 1;
            if (shape.outputs[lastOutIdx]) {
              shape.outputs[lastOutIdx].value = (performance.now() / 500) % 2 > 1 ? 1 : 0;
            }
            
            // Logic for Traffic Controller example
            if (shape.label === 'TRAFFIC_LITE') {
               const cycle = (performance.now() / 1000) % 6;
               if (shape.outputs[0]) shape.outputs[0].value = cycle < 2 ? 1 : 0; // Red
               if (shape.outputs[1]) shape.outputs[1].value = (cycle >= 2 && cycle < 3) ? 1 : 0; // Yellow
               if (shape.outputs[2]) shape.outputs[2].value = cycle >= 3 ? 1 : 0; // Green
            }
            
            // If any analog input is active, pass it to first 8 digital outputs (ADC demo)
            const firstAnalogIdx = shape.type === 'MCU_ATmega328P' ? 3 : (shape.type === 'MCU_ESP32' ? 2 : 0);
            const analogVal = inputValues[firstAnalogIdx] || 0;
            if (analogVal > 1 && shape.type !== 'MCU_ATTiny85') { // Only for multi-pin MCUs
              const adc = Math.floor(Math.min(1, analogVal / 5) * 255);
              for (let i = 0; i < 8; i++) {
                if (shape.outputs[i]) shape.outputs[i].value = (adc >> i) & 1;
              }
            }
            break;
          }
          case 'Register_4bit':
          case 'Register_8bit':
          case 'Register_16bit':
          case 'Register_32bit': {
            const bits = shape.type === 'Register_4bit' ? 4 : shape.type === 'Register_8bit' ? 8 : shape.type === 'Register_16bit' ? 16 : 32;
            const clkIdx = bits;
            const enIdx = bits + 1;
            const clrIdx = bits + 2;
            
            const clk = inputValues[clkIdx];
            const en = inputValues[enIdx] !== undefined ? inputValues[enIdx] : 1;
            const clr = inputValues[clrIdx] || 0;
            
            if (!shape.state) shape.state = { data: 0, lastClk: 0 };
            const lastClk = shape.state.lastClk || 0;
            
            if (clr) {
              shape.state.data = 0;
            } else if (clk && !lastClk && en) {
              let val = 0;
              for (let i = 0; i < bits; i++) {
                if (inputValues[i]) val |= (1 << i);
              }
              shape.state.data = val;
            }
            
            // Update lastClk for next iteration
            shape.state.lastClk = clk;
            
            for (let i = 0; i < bits; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (shape.state.data >> i) & 1;
            }
            break;
          }
          case 'RAM_8x8': {
            if (!shape.state) shape.state = { mem: new Array(8).fill(0) };
            const addr = 0 | (inputValues[0] ? 1 : 0) | (inputValues[1] ? 2 : 0) | (inputValues[2] ? 4 : 0);
            const dataIn = 0 | 
              (inputValues[3] ? 1 : 0) | (inputValues[4] ? 2 : 0) | (inputValues[5] ? 4 : 0) | (inputValues[6] ? 8 : 0) |
              (inputValues[7] ? 16 : 0) | (inputValues[8] ? 32 : 0) | (inputValues[9] ? 64 : 0) | (inputValues[10] ? 128 : 0);
            const we = inputValues[11];
            const cs = inputValues[12] !== undefined ? (inputValues[12] > 0.5 ? 1 : 0) : 1;
            
            if (cs) {
              if (we) {
                shape.state.mem[addr] = dataIn;
              }
              const dataOut = shape.state.mem[addr];
              for (let i = 0; i < 8; i++) {
                if (shape.outputs[i]) shape.outputs[i].value = (dataOut >> i) & 1;
              }
            } else {
              shape.outputs.forEach(o => { o.value = 0; });
            }
            break;
          }
          case 'ALU_8bit': {
            const a = 0 | 
              (inputValues[0] ? 1 : 0) | (inputValues[1] ? 2 : 0) | (inputValues[2] ? 4 : 0) | (inputValues[3] ? 8 : 0) |
              (inputValues[4] ? 16 : 0) | (inputValues[5] ? 32 : 0) | (inputValues[6] ? 64 : 0) | (inputValues[7] ? 128 : 0);
            const b = 0 | 
              (inputValues[8] ? 1 : 0) | (inputValues[9] ? 2 : 0) | (inputValues[10] ? 4 : 0) | (inputValues[11] ? 8 : 0) |
              (inputValues[12] ? 16 : 0) | (inputValues[13] ? 32 : 0) | (inputValues[14] ? 64 : 0) | (inputValues[15] ? 128 : 0);
            const s = (inputValues[16] ? 1 : 0) | (inputValues[17] ? 2 : 0) | (inputValues[18] ? 4 : 0);
            
            let res = 0;
            switch (s) {
              case 0: res = a + b; break;
              case 1: res = a - b; break;
              case 2: res = a & b; break;
              case 3: res = a | b; break;
              case 4: res = a ^ b; break;
              case 5: res = (~a) & 0xFF; break;
              case 6: res = (a << 1) & 0xFF; break;
              case 7: res = (a >> 1) & 0xFF; break;
            }
            
            for (let i = 0; i < 8; i++) {
              if (shape.outputs[i]) shape.outputs[i].value = (res >> i) & 1;
            }
            if (shape.outputs[8]) shape.outputs[8].value = (res > 255 || res < 0) ? 1 : 0;
            if (shape.outputs[9]) shape.outputs[9].value = (res & 0xFF) === 0 ? 1 : 0;
            break;
          }
          case 'VCCS':
          case 'VCVS':
          case 'CCCS':
          case 'CCVS': {
            const ctrl = inputValues[0] - inputValues[1];
            const gain = shape.gain || 1;
            if (shape.outputs[0]) shape.outputs[0].value = ctrl * gain;
            break;
          }
        }
        // After case switch (end of loop iteration for this shape)
        shape.outputs.forEach((o, idx) => {
          if (o.value !== oldOutputs[idx]) {
            hasChangedInThisIter = true;
            isModified = true;
          }
        });

        // Update prevInputs for next iteration/frame to prevent multiple triggers
        shape.prevInputs = inputValues;
      });

      // Fixed-point optimization: if nothing changed in this iteration, we've reached stabilization
      if (!hasChangedInThisIter && iter > 0) {
        break;
      }
    }

    return isModified ? updatedShapes : currentShapes;
  }, [connectors, bcdToSegments]);

  // Run simulation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setShapes(prev => evaluateCircuit(prev));
    }, 50); // Faster interval for smoother simulation and higher clock support
    return () => clearInterval(interval);
  }, [evaluateCircuit]);

  const generateTruthTable = () => {
    const INPUT_TYPES: ShapeType[] = ['InputL', 'ToggleSwitch', 'PushButton', 'InputControl', 'InputControl_4', 'InputControl_7', 'InputControl_8', 'HighConstant', 'LowConstant'];
    const OUTPUT_TYPES: ShapeType[] = ['OutPutL', 'Display', 'DisplayBCD', 'Display7Segment', 'Display8Segment', 'Display9Segment', 'Display14Segment', 'Display16Segment', 'Buzzer', 'Motor', 'LED'];

    const inputPins: { shapeId: string; pinIndex: number; label: string }[] = [];
    shapes.forEach(s => {
      if (INPUT_TYPES.includes(s.type)) {
        s.outputs.forEach((p, i) => {
          inputPins.push({
            shapeId: s.id,
            pinIndex: i,
            label: s.outputs.length > 1 ? `${s.label} (${p.label || i})` : s.label
          });
        });
      }
    });

    const outputPins: { shapeId: string; pinIndex: number; label: string }[] = [];
    shapes.forEach(s => {
      if (OUTPUT_TYPES.includes(s.type)) {
        s.inputs.forEach((p, i) => {
          outputPins.push({
            shapeId: s.id,
            pinIndex: i,
            label: s.inputs.length > 1 ? `${s.label} (${p.label || i})` : s.label
          });
        });
      }
    });

    if (inputPins.length === 0 || outputPins.length === 0) {
      alert('Circuit must have at least one Logic Input (Input, Toggle, etc.) and one Logic Output (LED, Display, etc.).');
      return;
    }

    if (inputPins.length > 8) {
      alert('Too many inputs for truth table generation (max 8).');
      return;
    }

    const numCombinations = Math.pow(2, inputPins.length);
    const rows: number[][] = [];

    for (let i = 0; i < numCombinations; i++) {
      const combination = i.toString(2).padStart(inputPins.length, '0').split('').map(Number);
      
      // Setup test state
      let testShapes = shapes.map(s => ({ 
        ...s, 
        inputs: (s.inputs || []).map(in_ => ({ ...in_ })), 
        outputs: (s.outputs || []).map(o => ({ ...o })),
        prevInputs: (s.inputs || []).map(in_ => in_.value) 
      }));

      inputPins.forEach((pin, idx) => {
        const shapeIdx = testShapes.findIndex(s => s.id === pin.shapeId);
        if (shapeIdx !== -1 && testShapes[shapeIdx].outputs?.[pin.pinIndex]) {
          testShapes[shapeIdx].outputs[pin.pinIndex].value = combination[idx];
        }
      });

      // Run simulation on test state
      testShapes = evaluateCircuit(testShapes);

      // Collect results
      const results = outputPins.map(pin => {
        const shape = testShapes.find(s => s.id === pin.shapeId);
        const val = shape?.inputs?.[pin.pinIndex]?.value;
        return val === 1 || val === '1' || (typeof val === 'number' && val > 0.5) ? 1 : 0;
      });

      rows.push([...combination, ...results]);
    }

    setTruthTableData({
      inputs: inputPins.map(p => p.label),
      outputs: outputPins.map(p => p.label),
      rows
    });
    setIsTruthTableOpen(true);
  };

  const exportTruthTableToCanvas = () => {
    if (!truthTableData.rows.length) return;

    const startX = 200;
    const startY = 200;
    const cellWidth = 80;
    const cellHeight = 30;
    
    const newLabels: Shape[] = [];
    
    // Headers
    const headers = [...truthTableData.inputs, ...truthTableData.outputs];
    headers.forEach((header, i) => {
      newLabels.push({
        ...createShape('Text', startX + i * cellWidth, startY),
        label: header,
        color: i < truthTableData.inputs.length ? '#eab308' : '#22c55e', // yellow for inputs, green for outputs
        width: cellWidth,
        height: cellHeight,
        font: 'bold 12px Mono'
      });
    });

    // Rows
    truthTableData.rows.forEach((row, rowIndex) => {
      row.forEach((val, colIndex) => {
        newLabels.push({
          ...createShape('Text', startX + colIndex * cellWidth, startY + (rowIndex + 1) * cellHeight),
          label: val.toString(),
          color: '#ffffff',
          width: cellWidth,
          height: cellHeight,
          font: '12px Mono'
        });
      });
    });

    setShapes(prev => [...prev, ...newLabels]);
    setIsTruthTableOpen(false);
  };

  const handleDragStart = (e: React.DragEvent, type: ShapeType) => {
    e.dataTransfer.setData('shapeType', type);
  };

  const handleAddItem = (type: ShapeType, blockId?: string) => {
    saveHistory();
    let x = 400;
    let y = 300;
    let overlapping = true;
    const offset = 30;

    while (overlapping) {
      overlapping = shapes.some(s => Math.abs(s.x - x) < 20 && Math.abs(s.y - y) < 20);
      if (overlapping) {
        x += offset;
        y += offset;
      }
    }

    let newShape: Shape;
    if (type === 'CustomBlock' && blockId) {
      const template = customBlocks.find(b => b.id === blockId) || libraryBlocks.find(b => b.id === blockId);
      if (template) {
        newShape = {
          ...JSON.parse(JSON.stringify(template)),
          id: generateId(),
          x,
          y,
          isSelected: false
        };
      } else {
        newShape = createShape(type, x, y);
      }
    } else {
      newShape = createShape(type, x, y);
    }
    setShapes(prev => [...prev, newShape]);
  };

  const handleLoadExample = (name: string) => {
    saveHistory();
    const example = EXAMPLES[name];
    if (example) {
      const initializeShape = (s: Shape): Shape => {
        const template = createShape(s.type, s.x, s.y);
        const initialized: Shape = {
          ...template,
          ...s,
          inputs: (s.inputs && s.inputs.length > 0) ? s.inputs.map(i => ({ ...i })) : template.inputs,
          outputs: (s.outputs && s.outputs.length > 0) ? s.outputs.map(o => ({ ...o })) : template.outputs,
        };

        if (initialized.subcircuit && initialized.subcircuit.shapes) {
          initialized.subcircuit.shapes = initialized.subcircuit.shapes.map(initializeShape);
        }

        return initialized;
      };

      const initializedShapes = example.shapes.map(initializeShape);
      setShapes(initializedShapes);
      setConnectors(example.connectors.map(c => ({ ...c })));
      setFileName(example.fileName);
    }
  };

  const handleClearConnections = () => {
    saveHistory();
    const selectedIds = new Set(shapes.filter(s => s.isSelected).map(s => s.id));
    if (selectedIds.size === 0) return;
    
    setConnectors(prev => prev.filter(c => 
      !selectedIds.has(c.startShapeId) && !selectedIds.has(c.endShapeId)
    ));

    // Reset component states (values and internal state)
    setShapes(prev => prev.map(s => {
      if (selectedIds.has(s.id)) {
        return {
          ...s,
          inputs: s.inputs.map(i => ({ ...i, value: 0 })),
          outputs: s.outputs.map(o => ({ ...o, value: 0 })),
          state: {} // Reset internal state
        };
      }
      return s;
    }));
  };

  const handleOptimizeDiagram = () => {
    if (shapes.length === 0) return;

    // Find bounding box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    shapes.forEach(s => {
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      const w = (s.width / 2) * (s.scale || 1);
      const h = (s.height / 2) * (s.scale || 1);
      maxX = Math.max(maxX, s.x + w);
      maxY = Math.max(maxY, s.y + h);
    });

    const diagramWidth = maxX - minX;
    const diagramHeight = maxY - minY;
    
    // Canvas dimensions based on current scale
    let canvasW = 2000;
    let canvasH = 1500;
    if (canvasScale === 'half') { canvasW = 1000; canvasH = 750; }
    else if (canvasScale === 'double') { canvasW = 4000; canvasH = 3000; }

    const centerX = canvasW / 2;
    const centerY = canvasH / 2;
    const diagramCenterX = (minX + maxX) / 2;
    const diagramCenterY = (minY + maxY) / 2;

    const dx = centerX - diagramCenterX;
    const dy = centerY - diagramCenterY;

    // First move all shapes to center
    const movedShapes = shapes.map(s => ({
      ...s,
      x: s.x + dx,
      y: s.y + dy
    }));

    // Apply compression
    const compressionFactor = 0.8; 
    const finalShapes = movedShapes.map(s => {
      const distToCenterX = s.x - centerX;
      const distToCenterY = s.y - centerY;
      
      // Compress and then snap to a 10px grid
      const newX = Math.round((centerX + distToCenterX * compressionFactor) / 10) * 10;
      const newY = Math.round((centerY + distToCenterY * compressionFactor) / 10) * 10;

      return {
        ...s,
        x: newX,
        y: newY
      };
    });

    setShapes(finalShapes);
    saveHistory();
  };

  const handleAction = (action: string, meta?: { x?: number, y?: number }) => {
    switch (action) {
      case 'optimize-diagram':
        handleOptimizeDiagram();
        break;
      case 'reset-scale': {
        const hasSelected = shapes.some(s => s.isSelected);
        if (hasSelected || selectedShape) {
          saveHistory();
          setShapes(prev => prev.map(s => {
            if (s.isSelected || (selectedShape && s.id === selectedShape.id)) {
              // Get default values from createShape
              const defaultShape = createShape(s.type, s.x, s.y);
              let baseWidth = defaultShape.width;
              let baseHeight = defaultShape.height;
              let baseInputs = defaultShape.inputs;
              let baseOutputs = defaultShape.outputs;

              // If it's a custom block, try to find it in the library to get original dimensions and pins
              if (s.type === 'CustomBlock') {
                const libBlock = libraryBlocks.find(lb => lb.label === s.label);
                if (libBlock) {
                  baseWidth = libBlock.width;
                  baseHeight = libBlock.height;
                  baseInputs = libBlock.inputs;
                  baseOutputs = libBlock.outputs;
                }
              }

              // Update inputs and outputs positions preserving state
              const newInputs = s.inputs.map((inp, idx) => {
                const defInp = baseInputs[idx];
                if (defInp) return { ...inp, x: defInp.x, y: defInp.y };
                return inp;
              });

              const newOutputs = s.outputs.map((out, idx) => {
                const defOut = baseOutputs[idx];
                if (defOut) return { ...out, x: defOut.x, y: defOut.y };
                return out;
              });

              return { 
                ...s, 
                scale: 1,
                width: baseWidth,
                height: baseHeight,
                inputs: newInputs,
                outputs: newOutputs
              };
            }
            return s;
          }));
        }
        break;
      }
      case 'undo':
        undo();
        break;
      case 'redo':
        redo();
        break;
      case 'new':
        saveHistory();
        setShapes([]);
        setConnectors([]);
        setFileName('Untitled Circuit');
        setSelectedShape(null);
        setSelectedConnector(null);
        setPages([{ id: 'main', name: 'Main Page', shapes: [], connectors: [] }]);
        setCurrentPageId('main');
        break;
      case 'ai-generate':
        handleAIGenerate();
        break;
      case 'save': {
        const currentPages = pages.map(p => p.id === currentPageId ? { ...p, shapes, connectors } : p);
        const data: CircuitData = { 
          fileName, 
          shapes, 
          connectors, 
          pages: currentPages, 
          currentPageId, 
          customBlocks 
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.json`;
        a.click();
        break;
      }
      case 'load':
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (re) => {
            try {
              const loadedData = JSON.parse(re.target?.result as string) as CircuitData;
              
              // Additive load logic
              const idMap: Record<string, string> = {};
              const getNewId = generateId;
              
              // 1. Process and remap shapes
              let sourceShapes = loadedData.shapes || [];
              let sourceConnectors = loadedData.connectors || [];

              // Fallback to pages if top-level is empty
              if (sourceShapes.length === 0 && loadedData.pages && loadedData.pages.length > 0) {
                sourceShapes = loadedData.pages[0].shapes || [];
                sourceConnectors = loadedData.pages[0].connectors || [];
              }

              const newShapes = sourceShapes.map(s => {
                const newId = getNewId();
                idMap[s.id] = newId;
                return { ...s, id: newId, isSelected: true };
              });
              
              // 2. Process and remap connectors
              const newConnectors = sourceConnectors.map(c => ({
                ...c,
                id: getNewId(),
                startShapeId: idMap[c.startShapeId] || c.startShapeId,
                endShapeId: idMap[c.endShapeId] || c.endShapeId,
                isSelected: true
              }));

              // 3. Merge custom blocks (avoiding duplicates)
              if (loadedData.customBlocks) {
                setCustomBlocks(prev => {
                  const existingLabels = new Set(prev.map(b => b.label));
                  const uniqueNewBlocks = loadedData.customBlocks!.filter(b => !existingLabels.has(b.label));
                  return [...prev, ...uniqueNewBlocks];
                });
              }

              // Apply to state
              setShapes(prev => [
                ...prev.map(s => ({ ...s, isSelected: false })),
                ...newShapes
              ]);
              setConnectors(prev => [
                ...prev.map(c => ({ ...c, isSelected: false })),
                ...newConnectors
              ]);
              
              saveHistory();
            } catch (error) {
              console.error("Error loading additive JSON:", error);
            }
          };
          reader.readAsText(file);
        };
        input.click();
        break;
      case 'import-dls':
        const dlsInput = document.createElement('input');
        dlsInput.type = 'file';
        dlsInput.accept = '.json';
        dlsInput.onchange = (e: any) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (re) => {
            try {
              const jsonString = re.target?.result as string;
              const { shapes: importedShapes, connectors: importedConnectors } = parseDLSCirc(jsonString);
              
              const idMap: Record<string, string> = {};
              const getNewId = generateId;
              
              const newShapes = importedShapes.map(s => {
                const newId = getNewId();
                idMap[s.id] = newId;
                return { ...s, id: newId, isSelected: true };
              });
              
              const newConnectors = importedConnectors.map(c => ({
                ...c,
                id: getNewId(),
                startShapeId: idMap[c.startShapeId] || c.startShapeId,
                endShapeId: idMap[c.endShapeId] || c.endShapeId,
                isSelected: true
              }));

              setShapes(prev => [
                ...prev.map(s => ({ ...s, isSelected: false })),
                ...newShapes
              ]);
              setConnectors(prev => [
                ...prev.map(c => ({ ...c, isSelected: false })),
                ...newConnectors
              ]);
              
              setFileName(file.name.replace('.json', ''));
              saveHistory();
            } catch (error) {
              console.error("Error importing DLS file:", error);
              alert("Error importing DLS file. Please check the file format.");
            }
          };
          reader.readAsText(file);
        };
        dlsInput.click();
        break;
      case 'import-logisim':
        const circInput = document.createElement('input');
        circInput.type = 'file';
        circInput.accept = '.circ';
        circInput.onchange = (e: any) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (re) => {
            try {
              const xmlString = re.target?.result as string;
              const { shapes: importedShapes, connectors: importedConnectors, bounds } = parseLogisimCirc(xmlString);
              
              const idMap: Record<string, string> = {};
              const getNewId = generateId;
              
              const SCALE = 1.8; 
              
              const circuitWidth = (bounds.maxX - bounds.minX) * SCALE;
              const circuitHeight = (bounds.maxY - bounds.minY) * SCALE;
              
              // Find a good centered position
              const offsetX = (window.innerWidth / 2) - ((bounds.maxX + bounds.minX) / 2 * SCALE);
              const offsetY = (window.innerHeight / 2) - ((bounds.maxY + bounds.minY) / 2 * SCALE);

              const newShapes = importedShapes.map(s => {
                const newId = getNewId();
                idMap[s.id] = newId;
                
                // Scale pins
                const scaledInputs = (s.inputs || []).map(pin => ({
                  ...pin,
                  x: pin.x * SCALE,
                  y: pin.y * SCALE
                }));
                const scaledOutputs = (s.outputs || []).map(pin => ({
                  ...pin,
                  x: pin.x * SCALE,
                  y: pin.y * SCALE
                }));

                return { 
                  ...s, 
                  id: newId, 
                  x: s.x * SCALE + offsetX,
                  y: s.y * SCALE + offsetY,
                  width: s.width * SCALE,
                  height: s.height * SCALE,
                  inputs: scaledInputs,
                  outputs: scaledOutputs,
                  isSelected: true 
                };
              });
              
              const newConnectors = importedConnectors.map(c => ({
                ...c,
                id: getNewId(),
                startShapeId: idMap[c.startShapeId] || c.startShapeId,
                endShapeId: idMap[c.endShapeId] || c.endShapeId,
                isSelected: true
              }));

              setShapes(prev => [
                ...prev.map(s => ({ ...s, isSelected: false })),
                ...newShapes
              ]);
              setConnectors(prev => [
                ...prev.map(c => ({ ...c, isSelected: false })),
                ...newConnectors
              ]);
              
              setFileName(file.name.replace('.circ', ''));
              saveHistory();
            } catch (error) {
              console.error("Error importing Logisim file:", error);
              alert("Error importing Logisim file. Please check the file format.");
            }
          };
          reader.readAsText(file);
        };
        circInput.click();
        break;
      case 'copy': {
        const selectedShapes = shapes.filter(s => s.isSelected);
        const selectedIds = new Set(selectedShapes.map(s => s.id));
        
        // Include connectors that are explicitly selected OR connect two selected shapes
        const connectorsToCopy = connectors.filter(c => 
          c.isSelected || (selectedIds.has(c.startShapeId) && selectedIds.has(c.endShapeId))
        );
        
        if (selectedShapes.length > 0) {
          setClipboard({
            fileName: 'Clipboard',
            // Use JSON stringify/parse for a deep copy of properties and nested arrays
            shapes: selectedShapes.map(s => JSON.parse(JSON.stringify(s))),
            connectors: connectorsToCopy.map(c => ({ ...c }))
          });
        } else if (selectedShape) {
          setClipboard({
            fileName: 'Clipboard',
            shapes: [JSON.parse(JSON.stringify(selectedShape))],
            connectors: []
          });
        }
        break;
      }
      case 'paste': {
        if (clipboard && clipboard.shapes.length > 0) {
          saveHistory();
          const idMap: Record<string, string> = {};

          let offsetX = 40;
          let offsetY = 40;

          if (meta?.x !== undefined && meta?.y !== undefined) {
            const minX = Math.min(...clipboard.shapes.map(s => s.x));
            const minY = Math.min(...clipboard.shapes.map(s => s.y));
            offsetX = meta.x - minX;
            offsetY = meta.y - minY;
          }

          const newShapes = clipboard.shapes.map(s => {
            const newId = generateId();
            idMap[s.id] = newId;
            return {
              ...s,
              id: newId,
              x: meta ? s.x + offsetX : s.x + 40,
              y: meta ? s.y + offsetY : s.y + 40,
              isSelected: true,
              isRunning: false,
              intervalId: null,
              history: s.history ? [] : undefined
            };
          });

          const newConnectors = clipboard.connectors
            .filter(c => idMap[c.startShapeId] && idMap[c.endShapeId])
            .map(c => ({
              ...c,
              id: generateId(),
              startShapeId: idMap[c.startShapeId],
              endShapeId: idMap[c.endShapeId],
              isSelected: true
            }));

          // Deselect current
          const deselectedShapes = shapes.map(s => ({ ...s, isSelected: false }));
          const deselectedConnectors = connectors.map(c => ({ ...c, isSelected: false }));

          setShapes([...deselectedShapes, ...newShapes]);
          setConnectors([...deselectedConnectors, ...newConnectors]);
        }
        break;
      }
      case 'cut': {
        handleAction('copy');
        handleAction('delete');
        break;
      }
      case 'delete': {
        if (shapes.some(s => s.isSelected) || connectors.some(c => c.isSelected)) {
          saveHistory();
          const selectedIds = new Set(shapes.filter(s => s.isSelected).map(s => s.id));
          setShapes(prev => prev.filter(s => !s.isSelected));
          setConnectors(prev => prev.filter(c => !c.isSelected && !selectedIds.has(c.startShapeId) && !selectedIds.has(c.endShapeId)));
          setSelectedShape(null);
          setSelectedConnector(null);
        } else if (selectedShape) {
          saveHistory();
          setShapes(shapes.filter(s => s.id !== selectedShape.id));
          setConnectors(connectors.filter(c => c.startShapeId !== selectedShape.id && c.endShapeId !== selectedShape.id));
          setSelectedShape(null);
        } else if (selectedConnector) {
          saveHistory();
          setConnectors(prev => prev.filter(c => c.id !== selectedConnector.id));
          setSelectedConnector(null);
        }
        break;
      }
      case 'clear-connections': {
        handleClearConnections();
        break;
      }
      case 'move-up':
        if (shapes.some(s => s.isSelected)) {
          saveHistory();
          setShapes(shapes.map(s => s.isSelected ? { ...s, y: (s.y || 0) - 10 } : s));
        } else if (selectedShape) {
          updateShape(selectedShape.id, { y: selectedShape.y - 10 });
        }
        break;
      case 'move-down':
        if (shapes.some(s => s.isSelected)) {
          saveHistory();
          setShapes(shapes.map(s => s.isSelected ? { ...s, y: (s.y || 0) + 10 } : s));
        } else if (selectedShape) {
          updateShape(selectedShape.id, { y: selectedShape.y + 10 });
        }
        break;
      case 'move-left':
        if (shapes.some(s => s.isSelected)) {
          saveHistory();
          setShapes(shapes.map(s => s.isSelected ? { ...s, x: (s.x || 0) - 10 } : s));
        } else if (selectedShape) {
          updateShape(selectedShape.id, { x: selectedShape.x - 10 });
        }
        break;
      case 'move-right':
        if (shapes.some(s => s.isSelected)) {
          saveHistory();
          setShapes(shapes.map(s => s.isSelected ? { ...s, x: (s.x || 0) + 10 } : s));
        } else if (selectedShape) {
          updateShape(selectedShape.id, { x: selectedShape.x + 10 });
        }
        break;
      case 'align-left':
      case 'align-right':
      case 'align-top':
      case 'align-bottom': {
        const selectedShapes = shapes.filter(s => s.isSelected);
        if (selectedShapes.length < 2) break;
        saveHistory();

        if (action === 'align-left') {
          const targetVal = Math.min(...selectedShapes.map(s => s.x));
          setShapes(shapes.map(s => s.isSelected ? { ...s, x: targetVal } : s));
        } else if (action === 'align-right') {
          const targetVal = Math.max(...selectedShapes.map(s => {
            const { width } = getShapeDimensions(s);
            return s.x + width;
          }));
          setShapes(shapes.map(s => {
            if (!s.isSelected) return s;
            const { width } = getShapeDimensions(s);
            return { ...s, x: targetVal - width };
          }));
        } else if (action === 'align-top') {
          const targetVal = Math.min(...selectedShapes.map(s => s.y));
          setShapes(shapes.map(s => s.isSelected ? { ...s, y: targetVal } : s));
        } else if (action === 'align-bottom') {
          const targetVal = Math.max(...selectedShapes.map(s => {
            const { height } = getShapeDimensions(s);
            return s.y + height;
          }));
          setShapes(shapes.map(s => {
            if (!s.isSelected) return s;
            const { height } = getShapeDimensions(s);
            return { ...s, y: targetVal - height };
          }));
        }
        break;
      }
      case 'truth-table':
        generateTruthTable();
        break;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't move if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
          return;
        }
        if (e.key === 'y') {
          e.preventDefault();
          redo();
          return;
        }
        if (e.key === 'c') {
          handleAction('copy');
          return;
        }
        if (e.key === 'v') {
          handleAction('paste');
          return;
        }
        if (e.key === 'x') {
          handleAction('cut');
          return;
        }
        if (e.key === 'a') {
          e.preventDefault();
          saveHistory();
          setShapes(prev => prev.map(s => ({ ...s, isSelected: true })));
          setConnectors(prev => prev.map(c => ({ ...c, isSelected: true })));
          return;
        }
      }

      if (!selectedShape && !selectedConnector && !shapes.some(s => s.isSelected) && !connectors.some(c => c.isSelected)) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleAction('move-up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleAction('move-down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleAction('move-left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleAction('move-right');
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          handleAction('delete');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShape, shapes, connectors]);

  const handleAIGenerate = async () => {
    saveHistory();
    setIsGeneratingAI(true);
    try {
      const circuit = await generateRandomCircuit();
      setShapes(circuit.shapes);
      setConnectors(circuit.connectors);
      setFileName(circuit.fileName);
      setSelectedShape(null);
      setSelectedConnector(null);
    } catch (error) {
      console.error('Failed to generate AI circuit:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const deleteConnector = (id: string) => {
    saveHistory();
    setConnectors(prev => prev.filter(c => c.id !== id));
    setSelectedConnector(null);
  };

  const disconnectWire = (shapeId: string, type: 'input' | 'output', index: number) => {
    saveHistory();
    setConnectors(prev => prev.filter(c => {
      if (type === 'input') {
        return !(c.endShapeId === shapeId && c.endInputIndex === index);
      } else {
        return !(c.startShapeId === shapeId && c.startOutputIndex === index);
      }
    }));
  };

  const updateShape = (id: string, updates: Partial<Shape>) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    if (selectedShape?.id === id) {
      setSelectedShape(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const getShapeDimensions = (shape: Shape) => {
    const scale = shape.scale || 1;
    let width = shape.width / 2;
    let height = shape.height / 2;

    if (shape.type.includes('Flip_Flop') || shape.type === 'D_Latch') {
      width = 50; height = 50;
    } else if (shape.type === 'PushButton' || shape.type === 'HighConstant' || shape.type === 'LowConstant') {
      width = 30; height = 30;
    } else if (shape.type === 'ToggleSwitch') {
      width = 40; height = 20;
    } else if (shape.type === 'VCC' || shape.type === 'GND') {
      width = 20; height = 20;
    } else if (shape.type === 'Battery' || shape.type === 'AC_Voltage_Source' || shape.type === 'DC_Voltage_Source' || shape.type.includes('Current_Source') || shape.type.includes('Voltage_Source')) {
      width = 40; height = 40;
    } else if (shape.type === 'Resistor' || shape.type === 'Capacitor' || shape.type === 'Inductor' || shape.type.includes('Diode') || shape.type === 'LED' || shape.type === 'Fuse' || shape.type === 'Coil') {
      width = 50; height = 25;
    } else if (shape.type === 'Transistor_NPN' || shape.type === 'Transistor_PNP' || shape.type.startsWith('MOSFET') || shape.type.startsWith('JFET')) {
      width = 40; height = 40;
    } else if (shape.type === 'Regulator' || shape.type === 'OpAmp' || shape.type.includes('Relay') || shape.type.includes('Source') || shape.type.length === 4 || shape.type === 'Comparator') {
      width = 60; height = 40;
    } else if (shape.type.startsWith('Switch_') || shape.type.startsWith('MUX_') || shape.type.includes('Adder') || shape.type.includes('Latch')) {
      width = 60; height = 40;
      if (shape.type === 'MUX_4to1') height = 80;
      if (shape.type === 'Adder_8bit') width = 120;
    } else if (shape.type === 'Voltmeter' || shape.type === 'Ammeter') {
      width = 40; height = 40;
    } else if (shape.type === 'Probe') {
      width = 30; height = 30;
    }

    return { width: width * scale, height: height * scale };
  };

  const handleConnectShapes = (startShapeId: string, startOutputIndex: number, endShapeId: string, endInputIndex: number) => {
    saveHistory();
    // Check if connection already exists
    const exists = connectors.some(c => 
      c.startShapeId === startShapeId && 
      c.startOutputIndex === startOutputIndex && 
      c.endShapeId === endShapeId && 
      c.endInputIndex === endInputIndex
    );

    if (!exists) {
      const newConnector: Connector = {
        id: generateId(),
        startShapeId,
        startOutputIndex,
        endShapeId,
        endInputIndex
      };
      setConnectors(prev => [...prev, newConnector]);
    }
  };

  const createCustomBlock = () => {
    const selectedShapes = shapes.filter(s => s.isSelected);
    if (selectedShapes.length === 0) return;

    const selectedIds = new Set(selectedShapes.map(s => s.id));
    const selectedConnectors = connectors.filter(c => selectedIds.has(c.startShapeId) && selectedIds.has(c.endShapeId));

    // Identify inputs and outputs based on Input and Output Control types (including Displays as outputs)
    const internalInputControls = selectedShapes.filter(s => INPUT_CONTROL_TYPES.includes(s.type));
    const internalOutputControls = selectedShapes.filter(s => 
      OUTPUT_CONTROL_TYPES.includes(s.type) || s.type.toLowerCase().includes('display')
    );

    const blockType: ShapeType = 'CustomBlock';
    const block = createShape(blockType, 0, 0);
    block.label = newBlockName || 'Custom Block';
    
    const inputMapping: { internalShapeId: string; type: 'input' | 'output'; index: number }[] = [];
    const outputMapping: { internalShapeId: string; type: 'input' | 'output'; index: number }[] = [];

    // Configure external inputs
    const blockInputs: ConnectionPoint[] = [];
    internalInputControls.forEach((s) => {
      const baseLabel = s.label && s.label !== s.type ? s.label : s.type;
      
      // Input controls generally export their outputs as block inputs
      s.outputs.forEach((out, i) => {
        const pinLabel = out.label || (s.outputs.length > 1 ? `Out ${i}` : '');
        blockInputs.push({
          x: 0,
          y: 20 + blockInputs.length * 25,
          label: pinLabel ? `${baseLabel} ${pinLabel}` : baseLabel,
          value: 0,
          name: `in_${blockInputs.length}`
        });
        inputMapping.push({ internalShapeId: s.id, type: 'output', index: i });
      });
      // If they have inputs (like PassSwitch), export them too
      s.inputs.forEach((inp, i) => {
        const pinLabel = inp.label || (s.inputs.length > 1 ? `In ${i}` : '');
        blockInputs.push({
          x: 0,
          y: 20 + blockInputs.length * 25,
          label: pinLabel ? `${baseLabel} ${pinLabel}` : baseLabel,
          value: 0,
          name: `in_${blockInputs.length}`
        });
        inputMapping.push({ internalShapeId: s.id, type: 'input', index: i });
      });
    });

    // Configure external outputs
    const blockOutputs: ConnectionPoint[] = [];
    internalOutputControls.forEach((s) => {
      const baseLabel = s.label && s.label !== s.type ? s.label : s.type;

      if (s.outputs && s.outputs.length > 0) {
        // If it has outputs, export ONLY outputs
        s.outputs.forEach((out, i) => {
          const pinLabel = out.label || (s.outputs.length > 1 ? `Out ${i}` : '');
          blockOutputs.push({
            x: 120,
            y: 20 + blockOutputs.length * 25,
            label: pinLabel ? `${baseLabel} ${pinLabel}` : baseLabel,
            value: 0,
            name: `out_${blockOutputs.length}`
          });
          outputMapping.push({ internalShapeId: s.id, type: 'output', index: i });
        });
      } else {
        // Otherwise, export inputs as block outputs (to monitor their states)
        s.inputs.forEach((inp, i) => {
          const pinLabel = inp.label || (s.inputs.length > 1 ? `In ${i}` : '');
          blockOutputs.push({
            x: 120,
            y: 20 + blockOutputs.length * 25,
            label: pinLabel ? `${baseLabel} ${pinLabel}` : baseLabel,
            value: 0,
            name: `out_${blockOutputs.length}`
          });
          outputMapping.push({ internalShapeId: s.id, type: 'input', index: i });
        });
      }
    });

    block.inputs = blockInputs;
    block.outputs = blockOutputs;
    block.subcircuit = {
      shapes: JSON.parse(JSON.stringify(selectedShapes)),
      connectors: JSON.parse(JSON.stringify(selectedConnectors)),
      inputMapping,
      outputMapping
    };

    // Calculate width based on longest label
    const allLabels = [...blockInputs, ...blockOutputs].map(p => p.label || '');
    const maxLabelLen = Math.max(0, ...allLabels.map(l => l.length));
    block.width = Math.max(120, maxLabelLen * 8 + 60);
    block.height = Math.max(80, Math.max(blockInputs.length, blockOutputs.length) * 25 + 40);
    
    // Update output pin X positions if width changed
    block.outputs.forEach(p => p.x = block.width);

    setCustomBlocks(prev => [...prev, block]);
    setIsCreateBlockModalOpen(false);
    setNewBlockName('');
  };

  const switchPage = (pageId: string) => {
    // 1. Sync current state to the pages array before switching
    setPages(prev => prev.map(p => p.id === currentPageId ? { ...p, shapes, connectors } : p));
    
    // 2. Clear current selection
    setSelectedShape(null);
    setSelectedConnector(null);

    // 3. Find and load the new page
    const newPage = pages.find(p => p.id === pageId);
    if (newPage) {
      setCurrentPageId(pageId);
      setShapes(newPage.shapes);
      setConnectors(newPage.connectors);
    }
  };

  const addPage = (name?: string) => {
    saveHistory();
    const newId = generateId();
    const newPage: Page = {
      id: newId,
      name: name || `Page ${pages.length + 1}`,
      shapes: [],
      connectors: [],
      panOffset: { x: 0, y: 0 }
    };
    setPages(prev => {
      const updated = prev.map(p => p.id === currentPageId ? { ...p, shapes, connectors } : p);
      return [...updated, newPage];
    });
    
    // Switch to new page
    setCurrentPageId(newId);
    setShapes([]);
    setConnectors([]);
  };

  const deletePage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pages.length <= 1) return;
    saveHistory();
    const newPages = pages.filter(p => p.id !== id);
    setPages(newPages);
    if (currentPageId === id) {
      const first = newPages[0];
      setCurrentPageId(first.id);
      setShapes(first.shapes);
      setConnectors(first.connectors);
    }
  };

  const handleFuseRequest = (inputId: string, ledId: string) => {
    saveHistory();
    const inputShape = shapes.find(s => s.id === inputId);
    const ledShape = shapes.find(s => s.id === ledId);
    if (!inputShape || !ledShape) return;

    // Connection feeding the LED (incoming to LED)
    const incomingToLED = connectors.find(c => c.endShapeId === ledId);
    if (!incomingToLED) return;

    const sourceShapeId = incomingToLED.startShapeId;
    const sourceOutputIdx = incomingToLED.startOutputIndex;

    // Connections from the Input (outgoing from Input)
    const outgoingFromInput = connectors.filter(c => c.startShapeId === inputId);

    // New connections: Bridge the LED's source to the Input's targets
    const newConnectorsFromSource = outgoingFromInput.map(c => ({
      ...c,
      id: generateId(),
      startShapeId: sourceShapeId,
      startOutputIndex: sourceOutputIdx
    }));

    // Perform state updates
    setConnectors(prev => {
      // Remove all connections associated with the Input and the connection to the LED
      const filtered = prev.filter(c => 
        c.endShapeId !== ledId && 
        c.startShapeId !== inputId &&
        c.id !== incomingToLED.id
      );
      return [...filtered, ...newConnectorsFromSource];
    });

    setShapes(prev => prev.filter(s => s.id !== inputId && s.id !== ledId));
    setSelectedShape(null);
    setIsFuserEnabled(false); // Disable fuser mode after successful fuse
  };

  useEffect(() => {
    if (isCreateBlockModalOpen) {
      const selectedShapes = shapes.filter(s => s.isSelected);
      const selectedIds = new Set(selectedShapes.map(s => s.id));
      const warnings: string[] = [];

      selectedShapes.forEach(s => {
        if (s.type === 'Text' || s.type === 'Node_Label') return;

        const isInputControl = INPUT_CONTROL_TYPES.includes(s.type);
        const isOutputControl = OUTPUT_CONTROL_TYPES.includes(s.type) || s.type.toLowerCase().includes('display');

        if (isInputControl) {
          s.outputs.forEach((_, i) => {
            const isConnectedInside = connectors.some(c => 
              c.startShapeId === s.id && c.startOutputIndex === i && selectedIds.has(c.endShapeId)
            );
            if (!isConnectedInside) {
              warnings.push(`Input "${s.label || s.type}" not connected to internal components.`);
            }
          });
        } else if (isOutputControl) {
          s.inputs.forEach((_, i) => {
            const isConnectedInside = connectors.some(c => 
              c.endShapeId === s.id && c.endInputIndex === i && selectedIds.has(c.startShapeId)
            );
            if (!isConnectedInside) {
              warnings.push(`Output "${s.label || s.type}" not receiving signals from internal components.`);
            }
          });
        } else {
          s.inputs.forEach((_, i) => {
            const isConnected = connectors.some(c => c.endShapeId === s.id && c.endInputIndex === i && selectedIds.has(c.startShapeId));
            if (!isConnected) {
              warnings.push(`${s.label || s.type} pin In ${i + 1} is unconnected.`);
            }
          });
          s.outputs.forEach((_, i) => {
            const isConnected = connectors.some(c => c.startShapeId === s.id && c.startOutputIndex === i && selectedIds.has(c.endShapeId));
            if (!isConnected) {
              warnings.push(`${s.label || s.type} pin Out ${i + 1} is unconnected.`);
            }
          });
        }
      });
      setValidationWarnings(warnings);
    } else {
      setValidationWarnings([]);
    }
  }, [isCreateBlockModalOpen, shapes, connectors]);

  const burnShape = useCallback((id: string) => {
    const shape = shapes.find(s => s.id === id);
    if (!shape || shape.type !== 'CustomBlock' || !shape.subcircuit) return;

    const inputCount = shape.inputs.length;
    const outputCount = shape.outputs.length;

    if (inputCount > 8) {
      alert("Demasiadas entradas para compilación completa (máx 8). Se optimizará solo visualmente.");
      setShapes(prev => prev.map(s => s.id === id ? { ...s, isBurned: true } : s));
      return;
    }

    // Generate truth table
    const table: Record<string, number[]> = {};
    const subShapes = JSON.parse(JSON.stringify(shape.subcircuit.shapes));
    const subConnectors = JSON.parse(JSON.stringify(shape.subcircuit.connectors));
    const inputMapping = shape.subcircuit.inputMapping || [];
    const outputMapping = shape.subcircuit.outputMapping || [];

    const totalCombinations = Math.pow(2, inputCount);
    
    for (let i = 0; i < totalCombinations; i++) {
      // Mock inputs
      const currentInputs = Array.from({ length: inputCount }, (_, bit) => (i >> bit) & 1);
      
      // Setup internal state for this combination
      let testShapes = JSON.parse(JSON.stringify(subShapes));
      
      // Apply inputs
      inputMapping.forEach((mapping, idx) => {
        const internalShape = testShapes.find((s: any) => s.id === mapping.internalShapeId);
        if (internalShape) {
          if (mapping.type === 'input') {
            if (internalShape.inputs?.[mapping.index]) internalShape.inputs[mapping.index].value = currentInputs[idx];
          } else {
            if (internalShape.outputs?.[mapping.index]) internalShape.outputs[mapping.index].value = currentInputs[idx];
          }
        }
      });

      // Run simulation until stable or max 50 cycles
      for (let cycles = 0; cycles < 50; cycles++) {
        testShapes = evaluateCircuit(testShapes, subConnectors, 5); // Use high depth to avoid further recursion but enable logic
      }

      // Read outputs
      const currentOutputs = outputMapping.map(mapping => {
        const internalShape = testShapes.find((s: any) => s.id === mapping.internalShapeId);
        if (internalShape) {
          return mapping.type === 'input' 
            ? (internalShape.inputs?.[mapping.index]?.value ?? 0)
            : (internalShape.outputs?.[mapping.index]?.value ?? 0);
        }
        return 0;
      });

      table[currentInputs.join(',')] = currentOutputs as number[];
    }

    setShapes(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          isBurned: true,
          burnedData: {
            truthTable: table,
            inputCount,
            outputCount
          }
          // Optimization: No longer purging shapes to allow "Un-burn" or "Gate Level Expand"
        };
      }
      return s;
    }));
    
    saveHistory();
  }, [shapes, evaluateCircuit, saveHistory]);

  const explodeCustomBlock = (block: Shape) => {
    if (block.type !== 'CustomBlock' || !block.subcircuit) return;

    const { shapes: subShapes, connectors: subConnectors } = block.subcircuit;
    
    // Create a new page for the exploded content
    const newPageId = generateId();
    const newPage: Page = {
      id: newPageId,
      name: `Bloque: ${block.label}`,
      shapes: JSON.parse(JSON.stringify(subShapes)),
      connectors: JSON.parse(JSON.stringify(subConnectors)),
      panOffset: { x: 0, y: 0 }
    };

    setPages(prev => {
      const updated = prev.map(p => p.id === currentPageId ? { ...p, shapes, connectors } : p);
      return [...updated, newPage];
    });
    
    // Switch to new page
    setCurrentPageId(newPageId);
    setShapes(newPage.shapes);
    setConnectors(newPage.connectors);
    setSelectedShape(null);
  };

  const expandToGateLevel = (block: Shape) => {
    if (block.type !== 'CustomBlock' || !block.subcircuit) return;

    const { shapes: subShapes, connectors: subConnectors, inputMapping, outputMapping } = block.subcircuit;
    
    // 1. Create a map for new IDs
    const idMap: Record<string, string> = {};
    const getNewId = generateId;
    
    // 2. Clone internal shapes with offsets
    const newInternalShapes = subShapes.map(s => {
      const newId = getNewId();
      idMap[s.id] = newId;
      return {
        ...JSON.parse(JSON.stringify(s)),
        id: newId,
        x: s.x + block.x - 100, // Reasonable offset to center mostly
        y: s.y + block.y - 100,
        isSelected: true
      };
    });

    // 3. Clone internal connectors
    const newInternalConnectors = subConnectors.map(c => ({
      ...JSON.parse(JSON.stringify(c)),
      id: getNewId(),
      startShapeId: idMap[c.startShapeId],
      endShapeId: idMap[c.endShapeId],
      isSelected: true
    }));

    // 4. Connect external wires to internal points
    const externalToInternalConnectors: Connector[] = [];
    
    // Inputs: wires coming from outside into the block
    connectors.forEach(c => {
      if (c.endShapeId === block.id) {
        // Find mapping for this input pin
        const mapping = inputMapping?.[c.endInputIndex];
        if (mapping && idMap[mapping.internalShapeId]) {
          externalToInternalConnectors.push({
            ...JSON.parse(JSON.stringify(c)),
            id: getNewId(),
            endShapeId: idMap[mapping.internalShapeId],
            endInputIndex: mapping.index,
            isSelected: true
          });
        }
      }
      
      // Outputs: wires going from block to outside
      if (c.startShapeId === block.id) {
        // Find mapping for this output pin
        const mapping = outputMapping?.[c.startOutputIndex];
        if (mapping && idMap[mapping.internalShapeId]) {
          externalToInternalConnectors.push({
            ...JSON.parse(JSON.stringify(c)),
            id: getNewId(),
            startShapeId: idMap[mapping.internalShapeId],
            startOutputIndex: mapping.index,
            isSelected: true
          });
        }
      }
    });

    // 5. Update state: Remove block and add new elements
    setShapes(prev => [
      ...prev.filter(s => s.id !== block.id),
      ...newInternalShapes
    ]);
    
    setConnectors(prev => [
      ...prev.filter(c => c.startShapeId !== block.id && c.endShapeId !== block.id),
      ...newInternalConnectors,
      ...externalToInternalConnectors
    ]);

    setSelectedShape(null);
    saveHistory();
  };

  const recoverFromBurn = (id: string) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, isBurned: false, burnedData: undefined } : s));
    saveHistory();
  };

  const saveCustomBlockToLibrary = (block: Shape) => {
    if (block.type !== 'CustomBlock') return;
    // Check if it already exists by label
    const exists = customBlocks.some(cb => cb.label === block.label);
    if (!exists) {
      const template: Shape = {
        ...JSON.parse(JSON.stringify(block)),
        id: generateId(),
        x: 0,
        y: 0,
        isSelected: false
      };
      setCustomBlocks(prev => [...prev, template]);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-dk-darker-bg text-white font-sans">
      <Navbar 
        fileName={fileName} 
        onFileNameChange={setFileName} 
        onAction={handleAction} 
        isGeneratingAI={isGeneratingAI}
        magneticWiresEnabled={isMagneticWiresEnabled}
        onToggleMagneticWires={() => setIsMagneticWiresEnabled(!isMagneticWiresEnabled)}
        connectionCloningEnabled={isConnectionCloningEnabled}
        onToggleConnectionCloning={() => setIsConnectionCloningEnabled(!isConnectionCloningEnabled)}
        onClearConnections={handleClearConnections}
        statusVisible={isStatusVisible}
        onToggleStatus={() => setIsStatusVisible(!isStatusVisible)}
        panModeEnabled={isPanModeEnabled}
        onTogglePanMode={() => setIsPanModeEnabled(!isPanModeEnabled)}
        fuserEnabled={isFuserEnabled}
        onToggleFuser={() => setIsFuserEnabled(!isFuserEnabled)}
        isWiresHidden={isWiresHidden}
        onToggleWires={() => setIsWiresHidden(!isWiresHidden)}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          onDragStart={handleDragStart} 
          onAddItem={handleAddItem}
          selectedShape={selectedShape}
          selectedShapes={shapes.filter(s => s.isSelected)}
          selectedConnector={selectedConnector}
          onUpdateShape={(updates) => selectedShape && updateShape(selectedShape.id, updates)}
          onUpdateShapes={(updates) => {
            setShapes(prev => prev.map(s => {
              const update = updates.find(u => u.id === s.id);
              return update ? { ...s, label: update.label } : s;
            }));
            saveHistory();
          }}
          onUpdateCommonShapes={(updates) => {
            setShapes(prev => prev.map(s => s.isSelected ? { ...s, ...updates } : s));
            saveHistory();
          }}
          onDeleteConnector={deleteConnector}
          onDisconnectWire={disconnectWire}
          onLoadExample={handleLoadExample}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          wireStyle={wireStyle}
          onWireStyleChange={setWireStyle}
          gridStyle={gridStyle}
          onGridStyleChange={setGridStyle}
          gridColor={gridColor}
          onGridColorChange={setGridColor}
          shapes={shapes}
          connectors={connectors}
          onHighlightPin={setHighlightedPin}
          onHighlightConnector={setHighlightedConnectorId}
          onConnectShapes={handleConnectShapes}
          onAction={handleAction}
          customBlocks={customBlocks}
          onDeleteCustomBlock={(id) => setCustomBlocks(prev => prev.filter(b => b.id !== id))}
          onSaveCustomBlock={saveCustomBlockToLibrary}
          onBurnShape={burnShape}
          onRecoverBurn={recoverFromBurn}
          libraryBlocks={libraryBlocks}
          canUndo={currentIndex > 0}
          canRedo={currentIndex < history.length - 1}
          canvasScale={canvasScale}
          onCanvasScaleChange={setCanvasScale}
        />
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Create Block Button */}
          {shapes.filter(s => s.isSelected).length > 1 && (
            <button 
              onClick={() => setIsCreateBlockModalOpen(true)}
              className="absolute bottom-24 right-6 z-30 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-2xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 transition-all active:scale-95"
            >
              <PlusSquare className="w-5 h-5" /> Create Block
            </button>
          )}

          {/* Expand to Gate Level Button */}
          {selectedShape?.type === 'CustomBlock' && (
            <div className="absolute bottom-24 right-6 z-30 flex flex-col gap-2">
              <button 
                onClick={() => expandToGateLevel(selectedShape)}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-2xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 transition-all active:scale-95 shadow-red-500/20"
                title="Replace this IC with its internal components (Gate Level)"
              >
                <Cpu className="w-5 h-5" /> Convert to Gates
              </button>
              <button 
                onClick={() => explodeCustomBlock(selectedShape)}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-2xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 transition-all active:scale-95 shadow-orange-500/20"
                title="View internal diagram on a new page"
              >
                <Scissors className="w-5 h-5" /> View Internal Design
              </button>
            </div>
          )}
          {/* Mobile Sidebar Toggle */}
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-4 left-4 z-30 p-2 bg-dk-dark-bg/80 backdrop-blur-md border border-white/10 rounded-lg shadow-xl hover:bg-dk-dark-bg transition-all md:hidden"
            >
              <Cpu className="w-6 h-6 text-yellow-500" />
            </button>
          )}
          <CircuitCanvas 
            shapes={shapes}
            connectors={connectors}
            onShapesChange={setShapes}
            onConnectorsChange={setConnectors}
            onCommitHistory={saveHistory}
            onAction={handleAction}
            canUndo={currentIndex > 0}
            canRedo={currentIndex < history.length - 1}
            hasClipboard={!!clipboard}
            onSelectShape={setSelectedShape}
            onSelectConnector={setSelectedConnector}
            zoom={zoom}
            wireStyle={wireStyle}
            gridStyle={gridStyle}
            gridColor={gridColor}
            highlightedPin={highlightedPin}
            onHighlightPin={setHighlightedPin}
            selectedShape={selectedShape}
            customBlocks={customBlocks}
            magneticWiresEnabled={isMagneticWiresEnabled}
            onDisableMagneticWires={() => setIsMagneticWiresEnabled(false)}
            connectionCloningEnabled={isConnectionCloningEnabled}
            onDisableConnectionCloning={() => setIsConnectionCloningEnabled(false)}
            highlightedConnectorId={highlightedConnectorId}
            statusVisible={isStatusVisible}
            libraryBlocks={libraryBlocks}
            panModeEnabled={isPanModeEnabled}
            canvasScale={canvasScale}
            panOffset={pages.find(p => p.id === currentPageId)?.panOffset || { x: 0, y: 0 }}
            onPanChange={(offset) => {
              setPages(prev => prev.map(p => p.id === currentPageId ? { ...p, panOffset: offset } : p));
            }}
            fuserEnabled={isFuserEnabled}
            onFuseRequest={handleFuseRequest}
            isWiresHidden={isWiresHidden}
          />
          
          {/* Pages Tab Bar */}
          <div className="absolute bottom-6 left-6 z-30 flex items-center gap-1 bg-dk-dark-bg/80 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-2xl overflow-x-auto max-w-[calc(100%-350px)] no-scrollbar">
            {pages.map(page => (
              <div 
                key={page.id}
                onClick={() => switchPage(page.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all animate-in fade-in zoom-in-95 ${
                  currentPageId === page.id 
                    ? 'bg-yellow-500 text-dk-darker-bg font-bold shadow-lg' 
                    : 'hover:bg-white/5 text-white/50 border border-transparent'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${currentPageId === page.id ? 'text-dk-darker-bg' : 'text-white/20'}`} />
                <span className="text-[11px] whitespace-nowrap tracking-wide">{page.name}</span>
                {pages.length > 1 && (
                  <button 
                    onClick={(e) => deletePage(page.id, e)} 
                    className={`ml-1 p-0.5 rounded hover:bg-black/20 transition-all ${
                      currentPageId === page.id ? 'hover:text-red-600' : 'hover:text-red-400'
                    }`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={() => addPage()}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 transition-all ml-1 border border-dashed border-white/10 flex items-center gap-1 px-3"
              title="New Page"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">New Page</span>
            </button>
          </div>
          
          {/* Zoom Controls */}
          <div className="absolute bottom-6 right-6 bg-dk-dark-bg/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-4 shadow-2xl z-20">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Zoom</span>
            <input 
              type="range" 
              min="25" 
              max="200" 
              value={zoom} 
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="w-32 accent-yellow-500"
            />
            <span className="text-xs font-mono w-10 text-right">{zoom}%</span>
          </div>
        </main>
      </div>

      <TruthTableModal 
        isOpen={isTruthTableOpen} 
        onClose={() => setIsTruthTableOpen(false)} 
        onExportToCanvas={exportTruthTableToCanvas}
        data={truthTableData} 
      />

      {/* Create Block Modal */}
      {isCreateBlockModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-dk-dark-bg border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <PlusSquare className="text-purple-500" /> Create Custom Block
            </h2>
            <p className="text-white/60 text-sm mb-6">
              This will group the selected components into a reusable block. 
              InputL and OutPutL components will become the block's pins.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Block Name</label>
                <input 
                  type="text" 
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                  placeholder="e.g., Half Adder"
                  className="w-full bg-dk-darker-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  autoFocus
                />
              </div>

              {validationWarnings.length > 0 && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
                    <Scissors className="w-4 h-4" /> 
                    <span>Logic Warnings ({validationWarnings.length})</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto text-xs text-white/60 space-y-1 pr-2 thin-scrollbar">
                    {validationWarnings.map((warning, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-orange-500/50">•</span>
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/40 italic pt-1">
                    Unconnected components inside a block may not function as expected.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsCreateBlockModalOpen(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={createCustomBlock}
                disabled={!newBlockName.trim()}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-lg shadow-purple-900/20"
              >
                Create Block
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

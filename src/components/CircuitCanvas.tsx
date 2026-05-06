import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Shape, Connector, ShapeType, Point, ConnectionPoint } from '../types';
import { SVG_TEMPLATES } from '../constants';
import { createShape } from '../lib/circuitUtils';
import ContextMenu from './ContextMenu';

interface CircuitCanvasProps {
  shapes: Shape[];
  connectors: Connector[];
  onShapesChange: (shapes: Shape[]) => void;
  onConnectorsChange: (connectors: Connector[]) => void;
  onSelectShape: (shape: Shape | null) => void;
  onSelectConnector: (connector: Connector | null) => void;
  zoom: number;
  wireStyle?: 'curved' | 'orthogonal' | 'schematic';
  gridStyle?: 'dots' | 'lines' | 'none';
  gridColor?: string;
  highlightedPin: { shapeId: string, type: 'input' | 'output', index: number } | null;
  onHighlightPin: (pin: { shapeId: string, type: 'input' | 'output', index: number } | null) => void;
  selectedShape: Shape | null;
  customBlocks: Shape[];
  magneticWiresEnabled?: boolean;
  onDisableMagneticWires?: () => void;
  connectionCloningEnabled?: boolean;
  onDisableConnectionCloning?: () => void;
  highlightedConnectorId?: string | null;
  statusVisible?: boolean;
  libraryBlocks: Shape[];
  panModeEnabled?: boolean;
  panOffset?: Point;
  onPanChange?: (offset: Point) => void;
  fuserEnabled?: boolean;
  onFuseRequest?: (inputId: string, ledId: string) => void;
  isWiresHidden?: boolean;
  onCommitHistory?: () => void;
  onAction?: (action: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  hasClipboard?: boolean;
  canvasScale?: 'half' | 'normal' | 'double';
}

const formatValue = (value: number, unit: string) => {
  if (value === 0) return `0${unit}`;
  const absVal = Math.abs(value);
  if (absVal >= 1e6) return `${(value / 1e6).toFixed(1)}M${unit}`;
  if (absVal >= 1e3) return `${(value / 1e3).toFixed(1)}k${unit}`;
  if (absVal < 1e-6) return `${(value * 1e9).toFixed(1)}n${unit}`;
  if (absVal < 1e-3) return `${(value * 1e6).toFixed(1)}μ${unit}`;
  if (absVal < 1) return `${(value * 1e3).toFixed(1)}m${unit}`;
  return `${value.toFixed(1)}${unit}`;
};

const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  shapes,
  connectors,
  onShapesChange,
  onConnectorsChange,
  onSelectShape,
  onSelectConnector,
  zoom,
  wireStyle = 'curved',
  gridStyle = 'dots',
  gridColor = '#2a2b3d',
  highlightedPin,
  onHighlightPin,
  selectedShape,
  customBlocks,
  magneticWiresEnabled = false,
  onDisableMagneticWires,
  connectionCloningEnabled = false,
  onDisableConnectionCloning,
  highlightedConnectorId = null,
  statusVisible = false,
  libraryBlocks,
  panModeEnabled = false,
  panOffset = { x: 0, y: 0 },
  onPanChange,
  fuserEnabled = false,
  onFuseRequest,
  isWiresHidden = false,
  onCommitHistory,
  onAction,
  canUndo = false,
  canRedo = false,
  hasClipboard = false,
  canvasScale = 'normal'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState<Point>({ x: 0, y: 0 });
  const [draggedShapeId, setDraggedShapeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ 
    shapeId: string, 
    index: number,
    type: 'input' | 'output'
  } | null>(null);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [hoveredConnectorId, setHoveredConnectorId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Point | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Point | null>(null);
  const [potentialConnectors, setPotentialConnectors] = useState<Connector[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, canvasX: number, canvasY: number } | null>(null);

  const SHAPE_SIZE_SCALE = 2;
  const GRID_SIZE = 10;

  const getPinCoords = useCallback((shape: Shape, pin: ConnectionPoint) => {
    const scale = shape.scale || 1;
    let px = pin.x / SHAPE_SIZE_SCALE;
    let py = pin.y / SHAPE_SIZE_SCALE;
    px *= scale;
    py *= scale;
    if (shape.rotation) {
      const centerX = (shape.width / SHAPE_SIZE_SCALE) * scale / 2;
      const centerY = (shape.height / SHAPE_SIZE_SCALE) * scale / 2;
      const rad = (shape.rotation * Math.PI) / 180;
      const rx = Math.cos(rad) * (px - centerX) - Math.sin(rad) * (py - centerY) + centerX;
      const ry = Math.sin(rad) * (px - centerX) + Math.cos(rad) * (py - centerY) + centerY;
      return { x: shape.x + rx, y: shape.y + ry };
    }
    return { x: shape.x + px, y: shape.y + py };
  }, []);

  // Cache for loaded SVG images
  const imageCache = useRef<Record<string, HTMLImageElement>>({});

  const loadImages = useCallback(() => {
    Object.entries(SVG_TEMPLATES).forEach(([type, svg]) => {
      if (!imageCache.current[type]) {
        const img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        imageCache.current[type] = img;
      }
    });
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (draggedShapeId) {
          onShapesChange(shapes.filter(s => s.id !== draggedShapeId));
          onConnectorsChange(connectors.filter(c => c.startShapeId !== draggedShapeId && c.endShapeId !== draggedShapeId));
          onSelectShape(null);
          onSelectConnector(null);
          setDraggedShapeId(null);
        }
        const selectedConnector = connectors.find(c => c.isSelected);
        if (selectedConnector) {
          onConnectorsChange(connectors.filter(c => c.id !== selectedConnector.id));
          onSelectConnector(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [draggedShapeId, shapes, connectors, onShapesChange, onConnectorsChange, onSelectShape]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw background
    ctx.fillStyle = gridColor;
    ctx.fillRect(0, 0, width, height);

    if (gridStyle === 'none') return;

    // Determine grid color based on background luminance
    const isLightBackground = gridColor === '#ffffff' || gridColor === '#e0f2fe';
    const gridStrokeColor = isLightBackground ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    ctx.strokeStyle = gridStrokeColor;
    ctx.fillStyle = gridStrokeColor;
    
    if (gridStyle === 'dots') {
      const dotRadius = 0.8;
      for (let x = 0; x <= width; x += GRID_SIZE) {
        for (let y = 0; y <= height; y += GRID_SIZE) {
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (gridStyle === 'lines') {
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  };

  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.save();
    
    const scale = shape.scale || 1;
    const drawWidth = shape.width / SHAPE_SIZE_SCALE;
    const drawHeight = shape.height / SHAPE_SIZE_SCALE;

    ctx.translate(shape.x, shape.y);
    ctx.scale(scale, scale);
    
    if (shape.rotation) {
      const centerX = drawWidth / 2;
      const centerY = drawHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((shape.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    const img = imageCache.current[shape.type];
    const isMicrocontroller = shape.type.startsWith('MCU_') || 
      ['ATmega328P', 'ATmega16', 'LGT8F328P', 'ATtiny85', 'PIC18F2520', 'ESP32', 'RP2040', 'ATmega16U2'].includes(shape.type as string);

    if (img && shape.type !== 'Display' && shape.type !== 'Oscilloscope' && shape.type !== 'Text' && !shape.type.startsWith('IC') && !isMicrocontroller && shape.type !== 'InputL' && shape.type !== 'ToggleSwitch' && shape.type !== 'PushButton') {
      // Specific sizing for certain components
      let finalWidth = drawWidth;
      let finalHeight = drawHeight;
      
      if (shape.type.includes('Flip_Flop') || shape.type === 'D_Latch') {
        finalWidth = 50;
        finalHeight = 50;
      } else if (shape.type === 'HighConstant' || shape.type === 'LowConstant') {
        finalWidth = 30;
        finalHeight = 30;
      } else if (shape.type === 'VCC' || shape.type === 'GND') {
        finalWidth = 20;
        finalHeight = 20;
      } else if (shape.type === 'Battery' || shape.type === 'Cell' || shape.type === 'AC_Voltage_Source' || shape.type === 'DC_Voltage_Source' || shape.type.includes('Current_Source') || shape.type.includes('Voltage_Source') || shape.type.includes('Generator')) {
        finalWidth = 40;
        finalHeight = 40;
      } else if (shape.type === 'Resistor' || shape.type === 'Preset_Resistor' || shape.type === 'Attenuator' || shape.type === 'Capacitor' || shape.type === 'Trimmer_Capacitor' || shape.type === 'Inductor' || shape.type === 'Heater' || shape.type.includes('Diode') || shape.type === 'LED' || shape.type === 'Fuse' || shape.type === 'Fuse_IEC' || shape.type === 'Coil') {
        finalWidth = 50;
        finalHeight = 25;
      } else if (shape.type === 'Transistor_NPN' || shape.type === 'Transistor_PNP' || shape.type.startsWith('MOSFET') || shape.type.startsWith('JFET')) {
        finalWidth = 40;
        finalHeight = 40;
      } else if (shape.type === 'Regulator' || shape.type === 'OpAmp' || shape.type.includes('Relay') || shape.type.includes('Source') || shape.type.length === 4 || shape.type === 'Comparator') {
        // Length 4 catch-all for VCCS, VCVS, etc.
        finalWidth = 60;
        finalHeight = 40;
      } else if (shape.type.startsWith('Switch_') || shape.type.startsWith('MUX_') || shape.type.includes('Adder') || shape.type.includes('Latch')) {
        finalWidth = 60;
        finalHeight = 40;
        if (shape.type === 'MUX_4to1') finalHeight = 80;
        if (shape.type === 'Adder_8bit') finalWidth = 120;
      } else if (shape.type === 'Voltmeter' || shape.type === 'Ammeter' || shape.type.includes('Meter')) {
        finalWidth = 40;
        finalHeight = 40;
      } else if (shape.type === 'Probe' || shape.type === 'Thermometer_Symbol' || shape.type.includes('Lamp')) {
        finalWidth = 30;
        finalHeight = 30;
      }
      
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

      // LED Glow effect
      if (shape.type === 'LED' && shape.state?.isOn) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.beginPath();
        ctx.arc(finalWidth / 2, finalHeight / 2, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw component label below the symbol for Electronics
      const electronicsTypes = [
        'Resistor', 'Preset_Resistor', 'Attenuator', 'Capacitor', 'Trimmer_Capacitor', 'Inductor', 'Heater', 'Diode', 'LED', 'Fuse', 'Fuse_IEC', 'Coil', 
        'Battery', 'Cell', 'AC_Voltage_Source', 'DC_Voltage_Source', 'Regulator', 
        'Voltage_Source_Ideal', 'Current_Source_Ideal', 'Pulse_Generator', 'Sawtooth_Generator', 'Step_Generator',
        'Transformer', 'Potentiometer', 'Relay', 'DC_Current_Source', 
        'AC_Current_Source', 'Step_Voltage_Source', 'Step_Current_Source', 
        'PWL_Voltage_Source', 'PWL_Current_Source', 'Zener_Diode', 
        'Schottky_Diode', 'Photodiode', 'OpAmp', 'Node_Label',
        'MOSFET_N', 'MOSFET_P', 'JFET_N', 'JFET_P',
        'VCCS', 'VCVS', 'CCCS', 'CCVS',
        'Switch_SPST', 'Switch_SPDT', 'Switch_DPST', 'Switch_DPDT',
        'Relay_SPDT', 'Relay_DPDT', 'Voltmeter', 'Ammeter', 'Probe',
        'Wattmeter', 'Varmeter', 'Hz_Meter', 'Hour_Meter', 'Thermometer_Symbol',
        'Neon_Lamp', 'Fluorescent_Lamp',
        'MUX_2to1', 'MUX_4to1', 'Half_Adder', 'Full_Adder', 'Adder_4bit', 'Adder_8bit',
        'SR_Latch', 'SR_Latch_Inv', 'Comparator'
      ];
      if (electronicsTypes.includes(shape.type)) {
        ctx.font = '10px Orbitron';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText(shape.label || shape.type, finalWidth / 2, finalHeight + 12);

        // Draw property value
        let propertyText = '';
        if (shape.model) propertyText = shape.model;
        else if (shape.resistance !== undefined) propertyText = formatValue(shape.resistance, 'Ω');
        else if (shape.capacitance !== undefined) propertyText = formatValue(shape.capacitance, 'F');
        else if (shape.inductance !== undefined) propertyText = formatValue(shape.inductance, 'H');
        else if (shape.voltage !== undefined) propertyText = formatValue(shape.voltage, 'V');
        else if (shape.current !== undefined) propertyText = formatValue(shape.current, 'A');
        else if (shape.gain !== undefined) {
          const unit = shape.type === 'VCCS' ? '℧' : shape.type === 'CCVS' ? 'Ω' : '';
          propertyText = `${formatValue(shape.gain, unit)}`;
        }

        if (propertyText) {
          ctx.font = '8px Orbitron';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(propertyText, finalWidth / 2, -5);
        }
      }

      // Clock labels and arrows
      if (shape.type === 'Clock' || shape.type === 'Clock_ms' || shape.type === 'Clock_Hz_Adj' || shape.type === 'Clock_ms_Adj') {
        ctx.font = '8px Orbitron';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        const freq = shape.frequency || 1;
        let text = '';
        if (shape.type === 'Clock' || shape.type === 'Clock_Hz_Adj') {
          text = `${freq.toFixed(1)} Hz`;
        } else {
          text = `${(1000 / freq).toFixed(0)} ms`;
        }
        ctx.fillText(text, finalWidth / 2, -5);

        if (shape.type === 'Clock_Hz_Adj' || shape.type === 'Clock_ms_Adj') {
          // Draw arrows
          ctx.fillStyle = '#9ca3af';
          // Up arrow
          ctx.beginPath();
          ctx.moveTo(finalWidth + 5, 5);
          ctx.lineTo(finalWidth + 15, 5);
          ctx.lineTo(finalWidth + 10, 0);
          ctx.fill();
          // Down arrow
          ctx.beginPath();
          ctx.moveTo(finalWidth + 5, 15);
          ctx.lineTo(finalWidth + 15, 15);
          ctx.lineTo(finalWidth + 10, 20);
          ctx.fill();
        }
      }
    }

    // Custom Rendering for specific components
    if (shape.type === 'Text') {
      ctx.font = shape.font || '16px Orbitron';
      ctx.fillStyle = shape.color || '#e5e7eb';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      const lines = (shape.label || '').split('\n');
      const lineHeight = parseInt(ctx.font) || 20;
      lines.forEach((line, i) => {
        ctx.fillText(line, 0, i * lineHeight);
      });
    } else if ((shape.type as string) === 'PCB_Board') {
      ctx.fillStyle = shape.color || '#000000'; // Match image black board
      ctx.strokeStyle = '#22c55e'; // Green outline
      ctx.lineWidth = 2;
      // Rounded rectangle
      const radius = 10;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(drawWidth - radius, 0);
      ctx.quadraticCurveTo(drawWidth, 0, drawWidth, radius);
      ctx.lineTo(drawWidth, drawHeight - radius);
      ctx.quadraticCurveTo(drawWidth, drawHeight, drawWidth - radius, drawHeight);
      ctx.lineTo(radius, drawHeight);
      ctx.quadraticCurveTo(0, drawHeight, 0, drawHeight - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Silk screen lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(5, 5, drawWidth - 10, drawHeight - 10);
      
      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 12px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label, drawWidth / 2, drawHeight - 15);
    } else if (shape.type.startsWith('PCB_DIP')) {
      const pins = parseInt(shape.type.replace('PCB_DIP', ''));
      const rows = pins / 2;
      ctx.strokeStyle = '#22c55e'; // Green silk screen
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 2, drawWidth - 16, drawHeight - 4);
      
      // Draw notch
      ctx.beginPath();
      ctx.arc(drawWidth / 2, 2, 4, 0, Math.PI);
      ctx.stroke();

      // Draw pads
      const drawPad = (px: number, py: number) => {
        ctx.fillStyle = '#e5e7eb'; // Silver/White
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000'; // Hole
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      };

      for (let i = 0; i < rows; i++) {
        drawPad(4, 10 + i * 10); // Left pins
        drawPad(drawWidth - 4, 10 + i * 10); // Right pins
      }
      
      ctx.fillStyle = '#22c55e';
      ctx.font = '7px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label || shape.type.replace('PCB_', ''), drawWidth / 2, drawHeight / 2 + 3);
    } else if (shape.type === 'PCB_Resistor' || shape.type === 'PCB_Capacitor' || shape.type === 'PCB_Capacitor_Polar' || shape.type === 'PCB_Crystal') {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 2, drawWidth - 16, drawHeight - 4);
      
      const drawPad = (px: number, py: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      };

      drawPad(4, drawHeight / 2);
      drawPad(drawWidth - 4, drawHeight / 2);
      
      if (shape.type === 'PCB_Capacitor_Polar') {
        ctx.fillStyle = '#22c55e';
        ctx.font = '10px bold';
        ctx.fillText('+', 12, 10);
      }
    } else if (shape.type === 'PCB_LED') {
      ctx.strokeStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(drawWidth / 2, drawHeight / 2, 10, 0, Math.PI * 2);
      ctx.stroke();
      
      const drawPad = (px: number, py: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fill();
      };
      
      drawPad(drawWidth / 2 - 5, drawHeight / 2);
      drawPad(drawWidth / 2 + 5, drawHeight / 2);
    } else if (shape.type === 'PCB_Potentiometer') {
      ctx.strokeStyle = '#22c55e';
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      ctx.beginPath();
      ctx.arc(drawWidth / 2, drawHeight / 2, 15, 0, Math.PI * 2);
      ctx.stroke();
      
      const drawPad = (px: number, py: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      };
      drawPad(5, 5);
      drawPad(drawWidth - 5, 5);
      drawPad(drawWidth / 2, drawHeight - 5);
    } else if (shape.type === 'PCB_Switch_Tactile') {
      ctx.strokeStyle = '#22c55e';
      ctx.strokeRect(2, 2, drawWidth - 4, drawHeight - 4);
      ctx.beginPath();
      ctx.arc(drawWidth / 2, drawHeight / 2, 8, 0, Math.PI * 2);
      ctx.stroke();
      
      const drawPad = (px: number, py: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      };
      drawPad(4, 8);
      drawPad(4, drawHeight - 8);
      drawPad(drawWidth - 4, 8);
      drawPad(drawWidth - 4, drawHeight - 8);
    } else if (shape.type.startsWith('PCB_Header_')) {
      const pins = parseInt(shape.type.replace('PCB_Header_', ''));
      ctx.strokeStyle = '#22c55e';
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      
      for (let i = 0; i < pins; i++) {
        const py = i * 12 + 8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(drawWidth / 2, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(drawWidth / 2, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (shape.type === 'PCB_Pad_Circular' || shape.type === 'PCB_Via') {
      const radius = shape.type === 'PCB_Via' ? 3 : 6;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(drawWidth / 2, drawHeight / 2, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(drawWidth / 2, drawHeight / 2, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape.type === 'PCB_Pad_Square') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 2, drawWidth - 4, drawHeight - 4);
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(drawWidth / 2, drawHeight / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape.type === 'PCB_Mounting_Hole') {
      ctx.strokeStyle = '#555';
      ctx.setLineDash([2, 1]);
      ctx.beginPath();
      ctx.arc(drawWidth / 2, drawHeight / 2, drawWidth / 2 - 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(drawWidth / 2, drawHeight / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape.type === 'PCB_LCD16x2') {
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      ctx.strokeRect(5, 5, drawWidth - 10, drawHeight - 20);
      
      // Pads
      for (let i = 0; i < 16; i++) {
        const px = 10 + i * 9;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, 10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(px, 10, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#888';
      ctx.font = '8px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('LCD 16x2 OUTLINE', drawWidth / 2, drawHeight - 5);
    } else if (shape.type === 'InputL' || shape.type === 'ToggleSwitch' || shape.type === 'PushButton') {
      const isOn = shape.outputs?.[0]?.value === 1 || shape.outputs?.[0]?.value === '1';
      const color = shape.color || (isOn ? '#22c55e' : '#ef4444');
      
      // Draw a switch/button body
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      
      if (shape.type === 'InputL' || shape.type === 'PushButton') {
        if (shape.type === 'PushButton') {
          // Circular button
          ctx.beginPath();
          ctx.arc(drawWidth / 2, drawHeight / 2, Math.min(drawWidth, drawHeight) / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Inner status light
          ctx.fillStyle = color;
          if (isOn || shape.isPressed) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
          }
          ctx.beginPath();
          ctx.arc(drawWidth / 2, drawHeight / 2, Math.min(drawWidth, drawHeight) / 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Square button
          ctx.fillRect(0, 0, drawWidth, drawHeight);
          ctx.strokeRect(0, 0, drawWidth, drawHeight);
          
          // Inner status light
          ctx.fillStyle = color;
          if (isOn) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
          }
          ctx.fillRect(drawWidth / 4, drawHeight / 4, drawWidth / 2, drawHeight / 2);
          ctx.shadowBlur = 0;
        }
      } else {
        // Toggle Switch body
        ctx.beginPath();
        ctx.roundRect(0, 0, drawWidth, drawHeight, 5);
        ctx.fill();
        ctx.stroke();
        
        // Handle
        ctx.fillStyle = color;
        if (isOn) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.fillRect(drawWidth / 2, 2, drawWidth / 2 - 2, drawHeight - 4);
        } else {
          ctx.fillRect(2, 2, drawWidth / 2 - 2, drawHeight - 4);
        }
        ctx.shadowBlur = 0;
      }
      
      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '7px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label || '', drawWidth / 2, -10);

      ctx.fillStyle = 'white';
      ctx.font = '8px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(isOn ? 'ON' : 'OFF', drawWidth / 2, drawHeight + 10);

    } else if (shape.type === 'OutPutL') {
      const isOn = shape.inputs?.[0]?.value === 1 || shape.inputs?.[0]?.value === '1';
      
      // Bezel
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(25, 10, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      // LED
      const ledColor = shape.color || (isOn ? '#22c55e' : '#3b82f6');
      ctx.fillStyle = isOn ? ledColor : '#0f172a';
      ctx.beginPath();
      ctx.arc(25, 10, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '7px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label || '', 15, -10); // Offset for OutPutL bezel which is centered at 25

      // Glow effect
      if (isOn) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = ledColor;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Highlight shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(22, 7, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (shape.type === 'FlowStart' || shape.type === 'FlowEnd') {
      ctx.fillStyle = shape.type === 'FlowStart' ? '#22c55e' : '#ef4444'; 
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      const r = drawHeight / 2;
      ctx.beginPath();
      ctx.arc(r, r, r, Math.PI / 2, 3 * Math.PI / 2);
      ctx.lineTo(drawWidth - r, 0);
      ctx.arc(drawWidth - r, r, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(r, drawHeight);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label || (shape.type === 'FlowStart' ? 'START' : 'END'), drawWidth / 2, drawHeight / 2 + 4);
    } else if (shape.type === 'FlowProcess') {
      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fillRect(0, 0, drawWidth, drawHeight);
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label || 'PROCESS', drawWidth / 2, drawHeight / 2 + 4);
    } else if (shape.type === 'FlowDecision') {
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(drawWidth / 2, 0);
      ctx.lineTo(drawWidth, drawHeight / 2);
      ctx.lineTo(drawWidth / 2, drawHeight);
      ctx.lineTo(0, drawHeight / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'black';
      ctx.font = 'bold 9px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label || 'DECISION', drawWidth / 2, drawHeight / 2 + 4);
    } else if (shape.type === 'FlowInputOutput') {
      ctx.fillStyle = '#8b5cf6';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      const offset = 15;
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(drawWidth, 0);
      ctx.lineTo(drawWidth - offset, drawHeight);
      ctx.lineTo(0, drawHeight);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label || 'DATA', drawWidth / 2, drawHeight / 2 + 4);
    } else if (isMicrocontroller) {
      // Draw MCU Block - Highly Refined Appearance
      const gradient = ctx.createLinearGradient(0, 0, drawWidth, drawHeight);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.strokeStyle = shape.isSelected ? '#3b82f6' : '#334155';
      ctx.lineWidth = 2;
      
      const r = 6;
      ctx.beginPath();
      ctx.roundRect?.(0, 0, drawWidth, drawHeight, r);
      if(!ctx.roundRect) ctx.rect(0, 0, drawWidth, drawHeight);
      ctx.fill();
      ctx.stroke();

      // Top Notch detail
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(drawWidth / 2, 0, 8, 0, Math.PI);
      ctx.fill();
      
      // Branding / Textures
      ctx.font = '6px Inter';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillText('DESIGNED BY LOGIC LAB AI', 10, drawHeight - 10);

      // Label 
      ctx.fillStyle = '#fbbf24'; 
      ctx.font = 'bold 11px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label || (shape.type as string), drawWidth / 2, drawHeight / 2 - 5);
      
      if (shape.label && shape.label !== shape.type) {
         ctx.font = '7px Orbitron';
         ctx.fillStyle = '#94a3b8';
         ctx.fillText(shape.type as string, drawWidth / 2, drawHeight / 2 + 8);
      }

      // Pins on the sides with numbers
      const pinW = 8;
      const pinH = 4;
      shape.inputs.forEach((inp, idx) => {
        const py = inp.y / (shape.height / drawHeight);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-pinW/2, py - pinH/2, pinW, pinH);
        
        ctx.font = '6px Inter';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'left';
        ctx.fillText(inp.label || idx.toString(), pinW/2 + 2, py + 2);
      });
      shape.outputs.forEach((out, idx) => {
        const py = out.y / (shape.height / drawHeight);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(drawWidth - pinW/2, py - pinH/2, pinW, pinH);
        
        ctx.font = '6px Inter';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'right';
        ctx.fillText(out.label || idx.toString(), drawWidth - pinW/2 - 2, py + 2);
      });

    } else if (shape.type === 'Splitter') {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, 50);
      ctx.lineTo(drawWidth - 10, 50);
      for(let i=0; i<8; i++) {
        ctx.moveTo(drawWidth - 10, 50);
        ctx.lineTo(drawWidth, 10 + i * 12);
      }
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.font = '8px Inter';
      ctx.fillText('SPLIT', 15, 45);
    } else if (shape.type === 'ROM') {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      ctx.fillRect(0, 0, drawWidth, drawHeight);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('ROM', drawWidth / 2, drawHeight / 2);
      
      // Memory hex detail
      ctx.font = '6px JetBrains Mono';
      ctx.fillStyle = '#475569';
      for(let i=0; i<4; i++) {
        ctx.fillText('0x00 0xFF 0xAA', drawWidth / 2, drawHeight / 2 + 15 + i * 8);
      }

      // Pin Labels
      ctx.font = '6px JetBrains Mono';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      
      shape.inputs.forEach((input) => {
        const py = input.y / SHAPE_SIZE_SCALE;
        const px = input.x / SHAPE_SIZE_SCALE;
        
        if (px < 5) { // Left side
          ctx.textAlign = 'left';
          ctx.fillText(input.label || '', 6, py + 2);
        } else if (py > drawHeight - 10) { // Bottom side
          ctx.textAlign = 'center';
          ctx.fillText(input.label || '', px, py - 6);
        } else if (py < 10) { // Top side
          ctx.textAlign = 'center';
          ctx.fillText(input.label || '', px, py + 10);
        } else { // Anywhere else (default left)
          ctx.textAlign = 'left';
          ctx.fillText(input.label || '', px + 6, py + 2);
        }
      });

      shape.outputs.forEach((output) => {
        const py = output.y / SHAPE_SIZE_SCALE;
        const px = output.x / SHAPE_SIZE_SCALE;
        
        if (px > drawWidth - 5) { // Right side
          ctx.textAlign = 'right';
          ctx.fillText(output.label || '', drawWidth - 6, py + 2);
        } else if (py > drawHeight - 10) { // Bottom side
          ctx.textAlign = 'center';
          ctx.fillText(output.label || '', px, py - 6);
        } else if (py < 10) { // Top side
          ctx.textAlign = 'center';
          ctx.fillText(output.label || '', px, py + 10);
        } else { // Anywhere else (default right)
          ctx.textAlign = 'right';
          ctx.fillText(output.label || '', px - 6, py + 2);
        }
      });

      // Selection Glow
      if (shape.isSelected) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#3b82f6';
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    } else if (shape.type === 'Counter_Gen') {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#3b82f6';
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      ctx.fillRect(0, 0, drawWidth, drawHeight);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 9px Orbitron';
      ctx.fillText('COUNTER', drawWidth/2, 15);
      
      const count = shape.state?.count || 0;
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 16px JetBrains Mono';
      ctx.fillText(count.toString().padStart(3, '0'), drawWidth/2, drawHeight/2 + 5);
    } else if (['Multiplexer_Gen', 'Demultiplexer_Gen', 'Decoder_Gen', 'PriorityEncoder_Gen', 'BitSelector_Gen'].includes(shape.type)) {
      const bgColor = shape.color || '#1e1b4b';
      const strokeColor = shape.isSelected ? '#3b82f6' : '#334155';
      
      ctx.fillStyle = bgColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;

      // Draw specialized trapezoid for MUX/DEMUX, or rectangle for others
      if (shape.type === 'Multiplexer_Gen') {
          ctx.beginPath();
          ctx.moveTo(0, 15); 
          ctx.lineTo(drawWidth, 0); 
          ctx.lineTo(drawWidth, drawHeight); 
          ctx.lineTo(0, drawHeight - 15);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // Title Bar Shade
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.moveTo(0, 15); ctx.lineTo(drawWidth, 0); ctx.lineTo(drawWidth, 12); ctx.lineTo(0, 22);
          ctx.fill();
      } else if (shape.type === 'Demultiplexer_Gen') {
          ctx.beginPath();
          ctx.moveTo(0, 0); 
          ctx.lineTo(drawWidth, 15); 
          ctx.lineTo(drawWidth, drawHeight - 15); 
          ctx.lineTo(0, drawHeight);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Title Bar Shade
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(drawWidth, 15); ctx.lineTo(drawWidth, 27); ctx.lineTo(0, 12);
          ctx.fill();
      } else {
          ctx.fillRect(0, 0, drawWidth, drawHeight);
          ctx.strokeRect(0, 0, drawWidth, drawHeight);
          
          // Title Bar Shade
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(0, 0, drawWidth, 12);
      }

      // Add Centered Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 8px Orbitron';
      ctx.textAlign = 'center';
      const labelText = shape.type.replace('_Gen', '').toUpperCase();
      ctx.fillText(labelText, drawWidth / 2, drawHeight / 2 + 3);
      
      // Technical Grid/Detail for higher count blocks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      if (drawHeight > 40) {
        for(let i=1; i<4; i++) {
          ctx.beginPath();
          ctx.moveTo(0, i * (drawHeight/4));
          ctx.lineTo(drawWidth, i * (drawHeight/4));
          ctx.stroke();
        }
      }
    } else if (shape.type === 'Sens_Temp' || shape.type === 'Sens_Light' || shape.type === 'Sens_Ultrasonic') {
      // Draw Sensor Component
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = shape.isSelected ? '#3b82f6' : '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(drawWidth/2, drawHeight/2, Math.min(drawWidth, drawHeight)/2 - 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner details based on type
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(drawWidth/2, drawHeight/2, Math.min(drawWidth, drawHeight)/2 - 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 8px Inter';
      ctx.textAlign = 'center';
      const shortName = shape.type === 'Sens_Temp' ? 'TEMP' : shape.type === 'Sens_Light' ? 'LUX' : 'DIST';
      ctx.fillText(shortName, drawWidth/2, drawHeight/2 + 3);

      // Value display
      const val = shape.outputs[0]?.value || 0;
      ctx.fillStyle = '#10b981';
      ctx.font = '6px JetBrains Mono';
      ctx.fillText(Number(val).toFixed(1), drawWidth/2, drawHeight - 5);

    } else if (shape.type === 'Register_4bit' || shape.type === 'Register_8bit' || shape.type === 'Register_16bit' || shape.type === 'Register_32bit' || shape.type === 'MAR_8Bit' || shape.type === 'IC74173') {
      // Draw Register Block
      ctx.fillStyle = '#0f1727'; // Deep Navy
      ctx.strokeStyle = shape.isSelected ? '#3b82f6' : '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      ctx.fillRect(0, 0, drawWidth, drawHeight);

      // Title header
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, drawWidth, 22);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 9px Orbitron';
      ctx.textAlign = 'center';
      
      let label = shape.label;
      if (!label) {
        if (shape.type === 'Register_4bit') label = '4-BIT REG';
        else if (shape.type === 'Register_8bit') label = '8-BIT REG';
        else if (shape.type === 'Register_16bit') label = '16-BIT REG';
        else if (shape.type === 'Register_32bit') label = '32-BIT REG';
        else if (shape.type === 'MAR_8Bit') label = 'MAR';
        else if (shape.type === 'IC74173') label = '74LS173';
      }
      ctx.fillText(label, drawWidth / 2, 14);

      // Internal Value Display
      let val = 0;
      if (shape.type === 'MAR_8Bit' || shape.type === 'IC74173') {
        if (shape.state?.q) {
          val = shape.state.q.reduce((acc: number, bit: number, i: number) => acc + (bit << i), 0);
        }
      } else {
        val = shape.state?.data || 0;
      }
      
      const bits = shape.type === 'Register_4bit' || shape.type === 'IC74173' ? 4 : (shape.type === 'Register_32bit' ? 32 : (shape.type === 'Register_16bit' ? 16 : 8));
      
      ctx.fillStyle = '#10b981'; // Emerald
      ctx.font = bits > 16 ? 'bold 12px JetBrains Mono' : 'bold 16px JetBrains Mono';
      ctx.textAlign = 'center';
      
      const displayVal = bits <= 8 ? `0x${val.toString(16).toUpperCase().padStart(2, '0')}` : 
                         bits <= 16 ? `0x${val.toString(16).toUpperCase().padStart(4, '0')}` :
                         `0x${(val >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
                       
      ctx.fillText(displayVal, drawWidth / 2, drawHeight / 2 + 5);
      
      // Binary strip at bottom
      const dotRadius = bits > 16 ? 1.5 : 2.5;
      const margin = 15;
      const dotSpacing = (drawWidth - margin * 2) / (bits - 1 || 1);
      for(let i=0; i<bits; i++) {
          const bitOn = shape.type === 'MAR_8Bit' ? (shape.state?.q?.[i] === 1) : ((val >> i) & 1);
          ctx.beginPath();
          ctx.arc(margin + i * dotSpacing, drawHeight - 15, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = bitOn ? '#10b981' : '#1e293b';
          ctx.fill();
          if(bitOn) {
              ctx.shadowBlur = 8;
              ctx.shadowColor = '#10b981';
              ctx.stroke();
              ctx.shadowBlur = 0;
          }
      }
    } else if (shape.type === 'RAM_8x8' || shape.type === 'SRAM' || shape.type === 'EEPROM') {
      // Draw RAM/SRAM/EEPROM Block
      ctx.fillStyle = '#0f1727';
      ctx.strokeStyle = shape.isSelected ? '#3b82f6' : '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      ctx.fillRect(0, 0, drawWidth, drawHeight);

      // Header
      ctx.fillStyle = shape.type === 'EEPROM' ? '#1e1b4b' : '#1e293b';
      ctx.fillRect(0, 0, drawWidth, 22);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 9px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label || shape.type, drawWidth / 2, 14);

      if (shape.type === 'RAM_8x8') {
        // Memory Cells Grid visualization for small RAM
        const mem = shape.state?.mem || new Array(8).fill(0);
        const cellSize = 10;
        const gridStartX = (drawWidth - 8 * cellSize) / 2;
        const gridStartY = 60;
        
        for(let r=0; r<8; r++) {
            const rowVal = mem[r];
            for(let c=0; c<8; c++) {
                const bitVal = (rowVal >> c) & 1;
                ctx.fillStyle = bitVal ? '#10b981' : '#020617';
                ctx.fillRect(gridStartX + c * cellSize, gridStartY + r * cellSize, cellSize - 2, cellSize - 2);
            }
        }
        
        // Address Indicator
        const addr = (shape.inputs[0]?.value ? 1 : 0) | (shape.inputs[1]?.value ? 2 : 0) | (shape.inputs[2]?.value ? 4 : 0);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.strokeRect(gridStartX - 2, gridStartY + addr * cellSize - 2, 8 * cellSize + 2, cellSize + 2);
      } else {
        // Visualization for larger memories
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(15, 40, drawWidth - 30, drawHeight - 70);
        
        ctx.fillStyle = '#10b981';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('MEMORY BANK', drawWidth / 2, 60);
        
        // Show current address and data
        let addr = 0;
        if (shape.type === 'SRAM' || shape.type === 'EEPROM') {
          // Assuming 8-bit address for visualization
          for (let i = 0; i < 8; i++) {
            // Need to map inputs correctly if they are grouped
            // For now just show "ACTIVE"
          }
        }
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px Orbitron';
        ctx.fillText('STATUS: OK', drawWidth / 2, 80);
        
        // Draw some "activity" lines
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(25, 100 + i * 15);
          ctx.lineTo(drawWidth - 25, 100 + i * 15);
          ctx.stroke();
        }
      }

    } else if (shape.type === 'ALU_8bit') {
      // ALU shape (V-like/polygonal)
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = shape.isSelected ? '#3b82f6' : '#334155';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(drawWidth - 15, 0);
      ctx.lineTo(drawWidth, 50);
      ctx.lineTo(drawWidth, drawHeight);
      ctx.lineTo(0, drawHeight);
      ctx.lineTo(0, 50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('ALU', drawWidth / 2, 35);

      // Show current operation
      // s0, s1, s2 at indices 16, 17, 18
      const s0 = shape.inputs[16]?.value || 0;
      const s1 = shape.inputs[17]?.value || 0;
      const s2 = shape.inputs[18]?.value || 0;
      const op = (s0 ? 1 : 0) | (s1 ? 2 : 0) | (s2 ? 4 : 0);
      const opNames = ['ADD', 'SUB', 'AND', 'OR', 'XOR', 'NOT', 'SHL', 'SHR'];
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px JetBrains Mono';
      ctx.fillText(opNames[op] || 'IDLE', drawWidth / 2, drawHeight - 40);

      // Show tiny status indicators
      const isZero = (shape.outputs[9]?.value || 0) === 1;
      const isCarry = (shape.outputs[8]?.value || 0) === 1;
      
      ctx.font = '8px Orbitron';
      ctx.fillStyle = isZero ? '#10b981' : '#334155';
      ctx.fillText('ZERO', drawWidth / 2 - 20, drawHeight - 15);
      ctx.fillStyle = isCarry ? '#10b981' : '#334155';
      ctx.fillText('CARRY', drawWidth / 2 + 20, drawHeight - 15);

    } else if (shape.type === 'CustomBlock') {
      // Draw Custom Block
      const isBurned = shape.isBurned;
      
      // IC Body
      ctx.fillStyle = isBurned ? '#0f172a' : '#1e1b4b'; // Sleek dark for burned IC
      ctx.strokeStyle = shape.isSelected ? (isBurned ? '#fb923c' : '#8b5cf6') : (isBurned ? '#9a3412' : '#4c1d95');
      ctx.lineWidth = 2;
      
      const radius = isBurned ? 4 : 8; // Sharper corners for real ICs
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(drawWidth - radius, 0);
      ctx.quadraticCurveTo(drawWidth, 0, drawWidth, radius);
      ctx.lineTo(drawWidth, drawHeight - radius);
      ctx.quadraticCurveTo(drawWidth, drawHeight, drawWidth - radius, drawHeight);
      ctx.lineTo(radius, drawHeight);
      ctx.quadraticCurveTo(0, drawHeight, 0, drawHeight - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (isBurned) {
        // Metallic texture/finish or dot marker
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(8, 8, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Heat sink style lines if relevant
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for(let i = 20; i < drawHeight - 10; i += 8) {
          ctx.beginPath();
          ctx.moveTo(drawWidth * 0.3, i);
          ctx.lineTo(drawWidth * 0.7, i);
          ctx.stroke();
        }
      } else {
        // Draw subtle header for regular block
        ctx.fillStyle = '#312e81';
        ctx.fillRect(1, 1, drawWidth - 2, 25);
      }
      
      // Draw label
      ctx.fillStyle = isBurned ? '#fb923c' : 'white';
      ctx.font = isBurned ? 'bold 10px "JetBrains Mono", monospace' : 'bold 11px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label || 'Custom Block', drawWidth / 2, isBurned ? drawHeight / 2 + 4 : 17);

      if (isBurned) {
        ctx.font = '7px Orbitron';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('CONSOLIDATED', drawWidth / 2, drawHeight - 8);
      }

      // Draw input labels
      ctx.font = '9px Orbitron';
      ctx.textAlign = 'left';
      shape.inputs.forEach((input) => {
        const py = input.y / SHAPE_SIZE_SCALE;
        ctx.fillStyle = isBurned ? '#64748b' : '#9ca3af';
        if (!isBurned) ctx.fillText(input.label || '', 12, py + 3);
        else {
          // Smaller labels for IC
          ctx.font = '7px monospace';
          ctx.fillText(input.label?.substring(0, 4) || '', 6, py + 2);
          ctx.font = '9px Orbitron';
        }
        
        // Pin indicator
        ctx.fillStyle = input.value === 1 ? (isBurned ? '#fb923c' : '#22c55e') : '#475569';
        ctx.fillRect(-2, py - 3, 4, 6);
      });

      // Draw output labels
      ctx.textAlign = 'right';
      shape.outputs.forEach((output) => {
        const py = output.y / SHAPE_SIZE_SCALE;
        ctx.fillStyle = isBurned ? '#64748b' : '#9ca3af';
        if (!isBurned) ctx.fillText(output.label || '', drawWidth - 12, py + 3);
        else {
          ctx.font = '7px monospace';
          ctx.fillText(output.label?.substring(0, 4) || '', drawWidth - 6, py + 2);
          ctx.font = '9px Orbitron';
        }
        
        // Pin indicator
        ctx.fillStyle = output.value === 1 ? (isBurned ? '#fb923c' : '#22c55e') : '#475569';
        ctx.fillRect(drawWidth - 2, py - 3, 4, 6);
      });
    } else if (shape.type === 'InputControl' || shape.type === 'InputControl_4' || shape.type === 'InputControl_7' || shape.type === 'InputControl_8') {
      // Draw InputControl Block (Multi-switch)
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = shape.isSelected ? '#3b82f6' : '#1e293b';
      ctx.lineWidth = 2;
      
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(drawWidth - radius, 0);
      ctx.quadraticCurveTo(drawWidth, 0, drawWidth, radius);
      ctx.lineTo(drawWidth, drawHeight - radius);
      ctx.quadraticCurveTo(drawWidth, drawHeight, drawWidth - radius, drawHeight);
      ctx.lineTo(radius, drawHeight);
      ctx.quadraticCurveTo(0, drawHeight, 0, drawHeight - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Title
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1, 1, drawWidth - 2, 22);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label || 'INPUT PANEL', drawWidth / 2, 15);

      // Toggle items
      shape.outputs.forEach((output, i) => {
        const py = output.y / SHAPE_SIZE_SCALE;
        const isActive = output.value === 1 || output.value === '1';

        // Switch background track
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        const rx = 10;
        const rw = drawWidth - 30;
        const rh = 16;
        const ry = py - 8;
        ctx.roundRect?.(rx, ry, rw, rh, 8); // Use native roundRect if available or fallback
        if (!ctx.roundRect) ctx.rect(rx, ry, rw, rh);
        ctx.fill();
        
        // Label
        ctx.fillStyle = isActive ? 'white' : '#64748b';
        ctx.font = 'bold 8px Orbitron';
        ctx.textAlign = 'left';
        ctx.fillText(output.label || `OUT ${i}`, rx + 8, py + 3);

        // Toggle knob (visual switch)
        const knobX = isActive ? rx + rw - 14 : rx + 2;
        ctx.fillStyle = isActive ? '#22c55e' : '#475569';
        ctx.beginPath();
        ctx.arc(knobX + 6, py, 6, 0, Math.PI * 2);
        ctx.fill();
        
        if (isActive) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#22c55e';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Pin indicator
        ctx.fillStyle = isActive ? '#22c55e' : '#475569';
        ctx.fillRect(drawWidth - 2, py - 3, 4, 6);
      });
    } else if (shape.type === 'Display' || shape.type === 'Display7Segment' || shape.type === 'Display7SegmentSigned' || shape.type === 'Display8Segment') {
      // Draw background bezel
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      ctx.fillRect(0, 0, drawWidth, drawHeight);

      const segments = [
        [[1, 1], [2, 0], [8, 0], [9, 1], [8, 2], [2, 2]], // a
        [[9, 1], [10, 2], [10, 8], [9, 9], [8, 8], [8, 2]], // b
        [[9, 9], [10, 10], [10, 16], [9, 17], [8, 16], [8, 10]], // c
        [[9, 17], [8, 18], [2, 18], [1, 17], [2, 16], [8, 16]], // d
        [[1, 17], [0, 16], [0, 10], [1, 9], [2, 10], [2, 16]], // e
        [[1, 9], [0, 8], [0, 2], [1, 1], [2, 2], [2, 8]], // f
        [[1, 9], [2, 8], [8, 8], [9, 9], [8, 10], [2, 10]] // g
      ];
      const size = 3.5;
      const offsetX = 18;
      const offsetY = 12;
      
      segments.forEach((vertices, i) => {
        const isActive = shape.inputs[i]?.value === 1 || shape.inputs[i]?.value === '1';
        ctx.fillStyle = isActive ? (shape.color || '#ef4444') : '#1e293b'; 
        ctx.shadowBlur = isActive ? 10 : 0;
        ctx.shadowColor = shape.color || '#ef4444';
        
        ctx.beginPath();
        ctx.moveTo(offsetX + vertices[0][0] * size, offsetY + vertices[0][1] * size);
        for (let j = 1; j < vertices.length; j++) {
          ctx.lineTo(offsetX + vertices[j][0] * size, offsetY + vertices[j][1] * size);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (shape.type === 'Display8Segment') {
        const isActive = shape.inputs[7]?.value === 1 || shape.inputs[7]?.value === '1';
        ctx.fillStyle = isActive ? (shape.color || '#ef4444') : '#1e293b';
        ctx.beginPath();
        ctx.arc(offsetX + 11 * size, offsetY + 18 * size, size / 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (shape.type === 'Display7SegmentSigned') {
        const isActive = shape.inputs[7]?.value === 1 || shape.inputs[7]?.value === '1';
        ctx.fillStyle = isActive ? (shape.color || '#ef4444') : '#1e293b';
        ctx.fillRect(offsetX - 12, offsetY + 9 * size - 1, 8, 2);
      }
    } else if (shape.type === 'Display9Segment') {
      // Draw background bezel
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      ctx.fillRect(0, 0, drawWidth, drawHeight);

      const segments = [
        [[1, 1], [2, 0], [8, 0], [9, 1], [8, 2], [2, 2]], // a
        [[9, 1], [10, 2], [10, 8], [9, 9], [8, 8], [8, 2]], // b
        [[9, 9], [10, 10], [10, 16], [9, 17], [8, 16], [8, 10]], // c
        [[9, 17], [8, 18], [2, 18], [1, 17], [2, 16], [8, 16]], // d
        [[1, 17], [0, 16], [0, 10], [1, 9], [2, 10], [2, 16]], // e
        [[1, 9], [0, 8], [0, 2], [1, 1], [2, 2], [2, 8]], // f
        [[1, 9], [2, 8], [4, 8], [4, 10], [2, 10]], // g1
        [[6, 8], [8, 8], [9, 9], [8, 10], [6, 10]], // g2
        [[4, 1], [6, 1], [6, 17], [4, 17]] // h (vertical)
      ];
      const size = 3.5;
      const offsetX = 18;
      const offsetY = 12;
      
      segments.forEach((vertices, i) => {
        const isActive = shape.inputs[i]?.value === 1 || shape.inputs[i]?.value === '1';
        ctx.fillStyle = isActive ? (shape.color || '#ef4444') : '#1e293b';
        ctx.shadowBlur = isActive ? 10 : 0;
        ctx.shadowColor = shape.color || '#ef4444';
        
        ctx.beginPath();
        ctx.moveTo(offsetX + vertices[0][0] * size, offsetY + vertices[0][1] * size);
        for (let j = 1; j < vertices.length; j++) {
          ctx.lineTo(offsetX + vertices[j][0] * size, offsetY + vertices[j][1] * size);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    } else if (shape.type === 'Display14Segment' || shape.type === 'Display16Segment') {
      // Draw background bezel
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      ctx.fillRect(0, 0, drawWidth, drawHeight);
      const segments = [
        [[1, 1], [2, 0], [4.5, 0], [4.5, 2], [2, 2]], // a1
        [[5.5, 0], [8, 0], [9, 1], [8, 2], [5.5, 2]], // a2
        [[9, 1], [10, 2], [10, 8], [9, 9], [8, 8], [8, 2]], // b
        [[9, 9], [10, 10], [10, 16], [9, 17], [8, 16], [8, 10]], // c
        [[5.5, 16], [8, 16], [9, 17], [8, 18], [5.5, 18]], // d1
        [[1, 17], [2, 16], [4.5, 16], [4.5, 18], [2, 18]], // d2
        [[1, 17], [0, 16], [0, 10], [1, 9], [2, 10], [2, 16]], // e
        [[1, 9], [0, 8], [0, 2], [1, 1], [2, 2], [2, 8]], // f
        [[1, 9], [2, 8], [4.5, 8], [4.5, 10], [2, 10]], // g1
        [[5.5, 8], [8, 8], [9, 9], [8, 10], [5.5, 10]], // g2
        [[2, 2], [4.5, 8], [3.5, 8], [1, 2]], // h (diag top-left)
        [[5.5, 8], [8, 2], [9, 2], [6.5, 8]], // i (diag top-right)
        [[5.5, 10], [8, 16], [9, 16], [6.5, 10]], // j (diag bottom-right)
        [[2, 16], [4.5, 10], [3.5, 10], [1, 16]], // k (diag bottom-left)
        [[4.5, 2], [5.5, 2], [5.5, 8], [4.5, 8]], // l (vert top)
        [[4.5, 10], [5.5, 10], [5.5, 16], [4.5, 16]] // m (vert bottom)
      ];
      const size = 4;
      const offsetX = 15;
      const offsetY = 10;
      
      segments.forEach((vertices, i) => {
        const isActive = shape.inputs[i]?.value === 1 || shape.inputs[i]?.value === '1';
        ctx.fillStyle = isActive ? (shape.color || '#ef4444') : '#374151';
        ctx.beginPath();
        ctx.moveTo(offsetX + vertices[0][0] * size, offsetY + vertices[0][1] * size);
        for (let j = 1; j < vertices.length; j++) {
          ctx.lineTo(offsetX + vertices[j][0] * size, offsetY + vertices[j][1] * size);
        }
        ctx.closePath();
        ctx.fill();
      });
    } else if (shape.type === 'DotMatrixDisplay') {
      const rows = 7;
      const cols = 5;
      const dotSize = 4;
      const spacing = 8;
      const offsetX = 20;
      const offsetY = 20;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // A dot is active if both its row and column are active
          // Usually dot matrix displays are active-low or active-high depending on common anode/cathode.
          // Let's assume active-high for both for simplicity.
          const colActive = shape.inputs[c]?.value === 1 || shape.inputs[c]?.value === '1';
          const rowActive = shape.inputs[cols + r]?.value === 1 || shape.inputs[cols + r]?.value === '1';
          const isActive = colActive && rowActive;

          ctx.fillStyle = isActive ? (shape.color || '#ef4444') : '#1e293b';
          ctx.beginPath();
          ctx.arc(offsetX + c * spacing, offsetY + r * spacing, dotSize / 2, 0, Math.PI * 2);
          ctx.fill();
          if (isActive) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = shape.color || '#ef4444';
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }
    } else if (shape.type === 'DisplayBCD') {
      // Draw background bezel
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      ctx.fillRect(0, 0, drawWidth, drawHeight);

      const segments = [
        [[1, 1], [2, 0], [8, 0], [9, 1], [8, 2], [2, 2]], // a
        [[9, 1], [10, 2], [10, 8], [9, 9], [8, 8], [8, 2]], // b
        [[9, 9], [10, 10], [10, 16], [9, 17], [8, 16], [8, 10]], // c
        [[9, 17], [8, 18], [2, 18], [1, 17], [2, 16], [8, 16]], // d
        [[1, 17], [0, 16], [0, 10], [1, 9], [2, 10], [2, 16]], // e
        [[1, 9], [0, 8], [0, 2], [1, 1], [2, 2], [2, 8]], // f
        [[1, 9], [2, 8], [8, 8], [9, 9], [8, 10], [2, 10]] // g
      ];
      const size = 3;
      const offsetX = 25;
      const offsetY = 15;
      
      segments.forEach((vertices, i) => {
        const isActive = shape.state?.segments?.[i] === 1;
        ctx.fillStyle = isActive ? (shape.color || '#ef4444') : '#1e293b';
        ctx.shadowBlur = isActive ? 10 : 0;
        ctx.shadowColor = shape.color || '#ef4444';
        
        ctx.beginPath();
        ctx.moveTo(offsetX + vertices[0][0] * size, offsetY + vertices[0][1] * size);
        for (let j = 1; j < vertices.length; j++) {
          ctx.lineTo(offsetX + vertices[j][0] * size, offsetY + vertices[j][1] * size);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      // Label for BCD
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 7px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('HEX/BCD', drawWidth / 2, drawHeight - 10);

    } else if (shape.type === 'Oscilloscope') {
      // Body
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, drawWidth, drawHeight);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      
      // Grid
      ctx.strokeStyle = '#1e293b';
      ctx.setLineDash([2, 2]);
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (drawHeight / 4) * i);
        ctx.lineTo(drawWidth, (drawHeight / 4) * i);
        ctx.stroke();
      }
      for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo((drawWidth / 8) * i, 0);
        ctx.lineTo((drawWidth / 8) * i, drawHeight);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      
      // Waves
      const history = shape.state?.history || [];
      if (history.some((h: any) => h.length > 1)) {
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
        const step = drawWidth / 100;
        const channelHeight = drawHeight / 4;
        
        for (let ch = 0; ch < 4; ch++) {
          const chHistory = history[ch] || [];
          if (chHistory.length < 2) continue;

          ctx.strokeStyle = colors[ch];
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          
          chHistory.forEach((val: number, i: number) => {
            const x = i * step;
            // Normalize val for display. Assume 0-5V range for now.
            const normalizedVal = Math.min(Math.max(val / 5, 0), 1);
            const y = (ch + 1) * channelHeight - (normalizedVal * channelHeight * 0.8 + channelHeight * 0.1);
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }
      }
      ctx.lineWidth = 1;
    } else if (shape.type === 'Voltmeter' || shape.type === 'Ammeter' || shape.type === 'Probe') {
      // Meter display
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, drawWidth, drawHeight);
      ctx.strokeStyle = '#3b82f6';
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      
      const val = shape.state !== undefined ? shape.state : 0;
      const unit = shape.type === 'Voltmeter' ? 'V' : shape.type === 'Ammeter' ? 'A' : '';
      const text = typeof val === 'number' ? formatValue(val, unit) : (val ? 'HIGH' : 'LOW');
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = '10px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(text, drawWidth / 2, drawHeight / 2 + 4);
    } else if (shape.type === 'Display4Digit' || shape.type === 'Display2Digit') {
      // Body - More realistic module look, similar to single 7-seg but wider
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.fillRect(0, 0, drawWidth, drawHeight);
      ctx.strokeRect(1, 1, drawWidth - 2, drawHeight - 2);
      
      const segments = [
        [[1, 1], [2, 0], [8, 0], [9, 1], [8, 2], [2, 2]], // a
        [[9, 1], [10, 2], [10, 8], [9, 9], [8, 8], [8, 2]], // b
        [[9, 9], [10, 10], [10, 16], [9, 17], [8, 16], [8, 10]], // c
        [[9, 17], [8, 18], [2, 18], [1, 17], [2, 16], [8, 16]], // d
        [[1, 17], [0, 16], [0, 10], [1, 9], [2, 10], [2, 16]], // e
        [[1, 9], [0, 8], [0, 2], [1, 1], [2, 2], [2, 8]], // f
        [[1, 9], [2, 8], [8, 8], [9, 9], [8, 10], [2, 10]] // g
      ];
      
      const digitCount = shape.type === 'Display4Digit' ? 4 : 2;
      const size = 3.5;
      const digitSpacing = drawWidth / digitCount;
      const digMap = [11, 8, 7, 5]; // For 4-digit
      const segMap = [10, 6, 3, 1, 0, 9, 4, 2]; // A, B, C, D, E, F, G, DP
      
      for (let d = 0; d < digitCount; d++) {
        const dx = (d * digitSpacing) + (digitSpacing - 10 * size) / 2;
        const dy = (drawHeight - 18 * size) / 2;
        
        // Digit separator (subtle line between digits)
        if (d > 0) {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(d * digitSpacing, 5);
          ctx.lineTo(d * digitSpacing, drawHeight - 5);
          ctx.stroke();
        }

        // Digit selector logic
        let digitActive = false;
        if (shape.type === 'Display4Digit') {
          const digitIdx = digMap[d];
          digitActive = !(shape.inputs[digitIdx]?.value === 1 || shape.inputs[digitIdx]?.value === '1');
        } else {
          digitActive = shape.inputs[8 + d]?.value === 1 || shape.inputs[8 + d]?.value === '1';
        }

        segments.forEach((vertices, i) => {
          let isActive = false;
          if (shape.type === 'Display4Digit') {
            const segIdx = segMap[i];
            isActive = (digitActive && (shape.inputs[segIdx]?.value === 1 || shape.inputs[segIdx]?.value === '1')) || 
                       (shape.state?.digitSegments?.[d]?.[i] === 1);
          } else {
            isActive = (digitActive && (shape.inputs[i]?.value === 1 || shape.inputs[i]?.value === '1')) || 
                       (shape.state?.digitSegments?.[d]?.[i] === 1);
          }

          ctx.fillStyle = isActive ? (shape.color || '#ef4444') : '#1e293b';
          if (isActive) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = shape.color || '#ef4444';
          }
          
          ctx.beginPath();
          ctx.moveTo(dx + vertices[0][0] * size, dy + vertices[0][1] * size);
          for (let j = 1; j < vertices.length; j++) {
            ctx.lineTo(dx + vertices[j][0] * size, dy + vertices[j][1] * size);
          }
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        });
        
        // Decimal point
        let dpActive = false;
        if (shape.type === 'Display4Digit') {
          const dpIdx = 2; // DP is pin 3 -> index 2
          dpActive = (digitActive && (shape.inputs[dpIdx]?.value === 1 || shape.inputs[dpIdx]?.value === '1')) ||
                     (shape.state?.digitSegments?.[d]?.[7] === 1);
        } else {
          dpActive = (digitActive && (shape.inputs[7]?.value === 1 || shape.inputs[7]?.value === '1')) ||
                     (shape.state?.digitSegments?.[d]?.[7] === 1);
        }

        ctx.fillStyle = dpActive ? (shape.color || '#ef4444') : '#1e293b';
        if (dpActive) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = shape.color || '#ef4444';
        }
        ctx.beginPath();
        ctx.arc(dx + 11 * size, dy + 18 * size, size / 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      // Module Title (Optional, keeping it small)
      ctx.fillStyle = '#334155';
      ctx.font = '6px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('4-DIGIT 7-SEGMENT MODULE', drawWidth / 2, drawHeight - 2);

    } else if (shape.type.startsWith('IC') || shape.type.startsWith('LM')) {
      // IC Body
      ctx.fillStyle = '#111827';
      ctx.fillRect(10, 0, drawWidth - 20, drawHeight);
      ctx.strokeStyle = '#4b5563';
      ctx.strokeRect(10, 0, drawWidth - 20, drawHeight);
      
      // Notch
      ctx.beginPath();
      ctx.arc(10, drawHeight / 2, 6, -Math.PI/2, Math.PI/2);
      ctx.fillStyle = '#1f2937';
      ctx.fill();
      
      // Pin 1 indicator dot
      ctx.beginPath();
      ctx.arc(20, drawHeight - 15, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#374151';
      ctx.fill();
      
      // Pins
      ctx.fillStyle = '#9ca3af';
      const pinWidth = 8;
      const pinHeight = 4;
      
      const drawPin = (pin: ConnectionPoint, isOutput: boolean) => {
        const px = pin.x / SHAPE_SIZE_SCALE;
        const py = pin.y / SHAPE_SIZE_SCALE;
        
        let labelX = 0;
        let labelY = py + 2;
        let align: CanvasTextAlign = 'left';

        if (pin.y === 0) {
          ctx.fillRect(px - pinHeight/2, py - pinWidth, pinHeight, pinWidth);
          align = 'center';
          labelX = px;
          labelY = py + 10;
        } else if (pin.y === shape.height) {
          ctx.fillRect(px - pinHeight/2, py, pinHeight, pinWidth);
          align = 'center';
          labelX = px;
          labelY = py - 4;
        } else if (pin.x === 0) {
          ctx.fillRect(px - pinWidth, py - pinHeight/2, pinWidth, pinHeight);
          align = 'left';
          labelX = 12;
        } else if (pin.x === shape.width) {
          ctx.fillRect(px, py - pinHeight/2, pinWidth, pinHeight);
          align = 'right';
          labelX = drawWidth - 12;
        } else {
          if (isOutput) {
            ctx.fillRect(drawWidth - pinWidth - 2, py - pinHeight/2, pinWidth, pinHeight);
            align = 'right';
            labelX = drawWidth - 12;
          } else {
            ctx.fillRect(2, py - pinHeight/2, pinWidth, pinHeight);
            align = 'left';
            labelX = 12;
          }
        }

        if (pin.label) {
          ctx.save();
          ctx.font = '6px Inter';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.textAlign = align;
          ctx.fillText(pin.label, labelX, labelY);
          ctx.restore();
        }
      };

      (shape.inputs || []).forEach(pin => drawPin(pin, false));
      (shape.outputs || []).forEach(pin => drawPin(pin, true));

      // Label
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label || shape.type, drawWidth / 2, drawHeight / 2 + 5);
    } else if (shape.type === 'Buzzer') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(drawWidth / 2, drawHeight / 2, drawWidth / 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4b5563';
      ctx.stroke();
      
      const isActive = shape.inputs?.[0]?.value === 1 || shape.inputs?.[0]?.value === '1';
      if (isActive) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(drawWidth / 2, drawHeight / 2, drawWidth / 2.5 + 5 + i * 5, -Math.PI/4, Math.PI/4);
          ctx.stroke();
        }
        ctx.lineWidth = 1;
      }
    } else if (shape.type === 'Motor') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(10, 10, drawWidth - 20, drawHeight - 20);
      
      ctx.save();
      ctx.translate(drawWidth / 2, drawHeight / 2);
      ctx.rotate(((shape.state?.rotation || 0) * Math.PI) / 180);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-2, -drawHeight/2 + 5, 4, drawHeight - 10);
      ctx.fillRect(-drawWidth/2 + 5, -2, drawWidth - 10, 4);
      ctx.restore();
    } else if (shape.type === 'RGB_LED') {
      // Draw a block body for RGB LED with labels
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = shape.isSelected ? '#3b82f6' : '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      ctx.fillRect(0, 0, drawWidth, drawHeight);

      // The actual glowing LED circle
      ctx.fillStyle = shape.color || '#374151';
      ctx.shadowBlur = (shape.inputs[0]?.value || shape.inputs[1]?.value || shape.inputs[2]?.value) ? 15 : 0;
      ctx.shadowColor = shape.color || '#ffffff';
      ctx.beginPath();
      ctx.arc(drawWidth - 20, drawHeight / 2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw pins and labels (R, G, B)
      ctx.font = '10px Orbitron';
      ctx.textAlign = 'left';
      shape.inputs.forEach((input) => {
        const py = input.y / SHAPE_SIZE_SCALE;
        ctx.fillStyle = '#9ca3af';
        ctx.fillText(input.label || '', 10, py + 4);
        
        // Pin indicator
        ctx.fillStyle = input.value === 1 ? '#22c55e' : '#475569';
        ctx.fillRect(-2, py - 3, 4, 6);
      });
    } else if (shape.type === 'Bus' || shape.type === 'Bus8' || shape.type === 'Bus16') {
      // Draw Bus Bar
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = shape.isSelected ? '#3b82f6' : '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(drawWidth * 0.2, 0, drawWidth * 0.6, drawHeight);
      ctx.fillRect(drawWidth * 0.2, 0, drawWidth * 0.6, drawHeight);
      
      // Connection points are standard, but let's draw some internal bus lines
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      shape.inputs.forEach((_, i) => {
        const py = (15 + i * 20) / SHAPE_SIZE_SCALE;
        ctx.beginPath();
        ctx.moveTo(drawWidth * 0.2, py);
        ctx.lineTo(drawWidth * 0.8, py);
        ctx.stroke();
      });

      // Draw input/output pin indicators manually since it's not an IC
      shape.inputs.forEach((input) => {
        const py = input.y / SHAPE_SIZE_SCALE;
        ctx.fillStyle = input.value === 1 ? '#22c55e' : '#475569';
        ctx.fillRect(-2, py - 3, 4, 6);
        // Short line connecting pin to bus bar
        ctx.strokeStyle = '#9ca3af';
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(drawWidth * 0.2, py);
        ctx.stroke();
      });

      shape.outputs.forEach((output) => {
        const py = output.y / SHAPE_SIZE_SCALE;
        ctx.fillStyle = output.value === 1 ? '#22c55e' : '#475569';
        ctx.fillRect(drawWidth - 2, py - 3, 4, 6);
        // Short line connecting bus bar to output pin
        ctx.strokeStyle = '#9ca3af';
        ctx.beginPath();
        ctx.moveTo(drawWidth * 0.8, py);
        ctx.lineTo(drawWidth, py);
        ctx.stroke();
      });
    } else if (shape.type === 'OLED_Display') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, drawWidth, drawHeight);
      ctx.strokeStyle = '#3b82f6';
      ctx.strokeRect(0, 0, drawWidth, drawHeight);
      
      ctx.fillStyle = '#3b82f6';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(shape.state?.text || 'OLED', drawWidth / 2, drawHeight / 2 + 4);
    } else if (shape.type === 'Screen' || shape.type === 'XYScreen') {
      const isXY = shape.type === 'XYScreen';
      const cols = isXY ? 32 : 12;
      const rows = isXY ? 16 : 8;
      const totalPixels = cols * rows;
      // Draw screen matrix - filling most of the space for combine-ability
      const offsetX = 10; // Tight offset
      const matrixW = drawWidth - offsetX; 
      const matrixH = drawHeight;
      const offsetY = 0;
      
      // Render the grid
      const grid = shape.state?.buffer || new Array(totalPixels).fill(0);
      const cellW = matrixW / cols;
      const cellH = matrixH / rows;

      ctx.fillStyle = '#000';
      ctx.fillRect(offsetX, offsetY, matrixW, matrixH);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const colorCode = grid[row * cols + col];
          const r_bit = (colorCode >> 2) & 1;
          const g_bit = (colorCode >> 1) & 1;
          const b_bit = colorCode & 1;
          
          if (r_bit || g_bit || b_bit) {
            const r_val = r_bit ? 255 : 0;
            const g_val = g_bit ? 255 : 0;
            const b_val = b_bit ? 255 : 0;
            ctx.fillStyle = `rgb(${r_val}, ${g_val}, ${b_val})`;
            ctx.shadowBlur = isXY ? 6 : 4;
            ctx.shadowColor = `rgb(${r_val}, ${g_val}, ${b_val})`;
          } else {
            ctx.fillStyle = isXY ? '#05070a' : '#0a0d14';
            ctx.shadowBlur = 0;
          }

          ctx.fillRect(
             offsetX + col * cellW + (isXY ? 0.3 : 0.2),
             offsetY + row * cellH + (isXY ? 0.3 : 0.2),
             cellW - (isXY ? 0.6 : 0.4),
             cellH - (isXY ? 0.6 : 0.4)
          );
          ctx.shadowBlur = 0;
        }
      }

      if (isXY) {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < matrixH; i += 2) {
          ctx.beginPath();
          ctx.moveTo(offsetX, i);
          ctx.lineTo(offsetX + matrixW, i);
          ctx.stroke();
        }
      }

      // Draw minimalist input pins - formation mas cuadrada
      shape.inputs.forEach((input) => {
        const py = input.y / SHAPE_SIZE_SCALE;
        const val = typeof input.value === 'number' ? input.value : (input.value === '1' ? 1 : 0);
        
        ctx.strokeStyle = val ? '#22c55e' : '#374151';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(offsetX - 10, py); 
        ctx.lineTo(offsetX, py);
        ctx.stroke();
      });
    } else if ((shape.type as string) === 'PCB_Board') {
      ctx.fillStyle = shape.color || '#000000'; // Match image black board
      ctx.strokeStyle = '#22c55e'; // Green outline
      ctx.lineWidth = 2;
      // Rounded rectangle
      const radius = 10;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(drawWidth - radius, 0);
      ctx.quadraticCurveTo(drawWidth, 0, drawWidth, radius);
      ctx.lineTo(drawWidth, drawHeight - radius);
      ctx.quadraticCurveTo(drawWidth, drawHeight, drawWidth - radius, drawHeight);
      ctx.lineTo(radius, drawHeight);
      ctx.quadraticCurveTo(0, drawHeight, 0, drawHeight - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Silk screen lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(5, 5, drawWidth - 10, drawHeight - 10);
      
      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 12px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label, drawWidth / 2, drawHeight - 15);
    }

    // Draw connection points (in local coordinate system)
    ctx.fillStyle = shape.color || 'gray';
    
    (shape.outputs || []).forEach((output, idx) => {
      const isHighlighted = highlightedPin?.shapeId === shape.id && highlightedPin?.type === 'output' && highlightedPin?.index === idx;
      ctx.beginPath();
      
      let radius = 3;
      if (isHighlighted) radius = 6;
      else if (statusVisible) radius = 4.5;
      
      ctx.arc(output.x / SHAPE_SIZE_SCALE, output.y / SHAPE_SIZE_SCALE, radius, 0, Math.PI * 2);
      
      if (isHighlighted) {
        ctx.fillStyle = '#fbbf24';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#fbbf24';
      } else if (statusVisible) {
        const val = typeof output.value === 'number' ? output.value : (output.value === '1' ? 1 : 0);
        ctx.fillStyle = val ? '#22c55e' : '#ef4444'; // Green for high, Red for low
        ctx.shadowBlur = 15;
        ctx.shadowColor = val ? '#22c55e' : '#ef4444';
      } else {
        ctx.fillStyle = shape.color || 'gray';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    (shape.inputs || []).forEach((input, idx) => {
      const isHighlighted = highlightedPin?.shapeId === shape.id && highlightedPin?.type === 'input' && highlightedPin?.index === idx;
      ctx.beginPath();
      
      let radius = 3;
      if (isHighlighted) radius = 6;
      else if (statusVisible) radius = 4.5;
      
      ctx.arc(input.x / SHAPE_SIZE_SCALE, input.y / SHAPE_SIZE_SCALE, radius, 0, Math.PI * 2);

      if (isHighlighted) {
        ctx.fillStyle = '#fbbf24';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#fbbf24';
      } else if (statusVisible) {
        const val = typeof input.value === 'number' ? input.value : (input.value === '1' ? 1 : 0);
        ctx.fillStyle = val ? '#22c55e' : '#ef4444'; // Green for high, Red for low
        ctx.shadowBlur = 15;
        ctx.shadowColor = val ? '#22c55e' : '#ef4444';
      } else {
        ctx.fillStyle = shape.color || 'gray';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw label for non-Text components (if not already drawn)
    const electronicsTypes = ['Resistor', 'Capacitor', 'Inductor', 'Diode', 'LED', 'RGB_LED', 'Fuse', 'Coil', 'Battery', 'AC_Voltage_Source', 'Regulator', 'Transformer', 'Potentiometer', 'Relay'];
    const isMCU = shape.type.startsWith('MCU_') || 
      ['ATmega328P', 'ATmega16', 'LGT8F328P', 'ATtiny85', 'PIC18F2520', 'ESP32', 'RP2040', 'ATmega16U2'].includes(shape.type as string);
    const labelAlreadyDrawn = electronicsTypes.includes(shape.type) || 
      shape.type === 'DisplayBCD' || 
      shape.type === 'Display4Digit' || 
      shape.type === 'Screen' || 
      shape.type === 'XYScreen' ||
      shape.type === 'InputL' ||
      shape.type === 'OutPutL' ||
      shape.type === 'ToggleSwitch' ||
      shape.type === 'PushButton' ||
      shape.type === 'InputControl' ||
      shape.type.startsWith('InputControl_') ||
      shape.type === 'CustomBlock' ||
      isMCU ||
      shape.type.startsWith('Flow') ||
      shape.type.startsWith('Register_') ||
      shape.type === 'MAR_8Bit' ||
      shape.type === 'ALU_8bit' ||
      shape.type.startsWith('RAM_') ||
      shape.type === 'SRAM' ||
      shape.type === 'EEPROM' ||
      shape.type.startsWith('MUX_') ||
      shape.type.startsWith('DEMUX_') ||
      shape.type.includes('_Gen') ||
      shape.type.startsWith('IC') ||
      shape.type.startsWith('LM') ||
      shape.type === 'Buzzer' ||
      shape.type === 'Motor' ||
      shape.type === 'Voltmeter' ||
      shape.type === 'Ammeter' ||
      shape.type === 'Probe' ||
      shape.type === 'Oscilloscope' ||
      (shape.type as string) === 'PCB_Board';

    if (shape.type !== 'Text' && !labelAlreadyDrawn) {
      ctx.font = '10px Orbitron';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.fillText(shape.label, drawWidth / 2, drawHeight + 12);
    }

    // Draw selection highlight
    if (shape.isSelected || shape.id === selectedShape?.id) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
      ctx.strokeRect(-5, -5, drawWidth + 10, drawHeight + 10);
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  const drawConnector = (ctx: CanvasRenderingContext2D, connector: Connector) => {
    const startShape = shapes.find(s => s.id === connector.startShapeId);
    const endShape = shapes.find(s => s.id === connector.endShapeId);
    if (!startShape || !endShape) return;

    const startOutput = startShape.outputs[connector.startOutputIndex];
    const endInput = endShape.inputs[connector.endInputIndex];
    if (!startOutput || !endInput) return;

    const startCoords = getPinCoords(startShape, startOutput);
    const endCoords = getPinCoords(endShape, endInput);
    const startX = startCoords.x;
    const startY = startCoords.y;
    const endX = endCoords.x;
    const endY = endCoords.y;

    const isActive = startShape.outputs[connector.startOutputIndex].value === 1 || startShape.outputs[connector.startOutputIndex].value === '1';

    const isPCB = startShape.type.startsWith('PCB_') || endShape.type.startsWith('PCB_');

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    if (isPCB) {
      // Straight lines for PCB "Ratsnest"
      ctx.lineTo(endX, endY);
    } else if (wireStyle === 'curved') {
      // Bezier curve for connector
      const cp1x = startX + 50;
      const cp2x = endX - 50;
      ctx.bezierCurveTo(cp1x, startY, cp2x, endY, endX, endY);
    } else if (wireStyle === 'orthogonal') {
      // Orthogonal (Manhattan) path
      const midX = (startX + endX) / 2;
      ctx.lineTo(midX, startY);
      ctx.lineTo(midX, endY);
      ctx.lineTo(endX, endY);
    } else if (wireStyle === 'schematic') {
      // Schematic style with jumps and joints
      const midX = (startX + endX) / 2;
      
      // Horizontal segment 1: startX to midX at startY
      ctx.lineTo(midX, startY);
      
      // Vertical segment: midX, startY to midX, endY
      // Detect crossings with other wires to draw jumps
      const drawVerticalWithJumps = (x: number, y1: number, y2: number) => {
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        const jumpRadius = 6;
        
        // Find all horizontal segments from other connectors that cross this vertical line
        const crossings: number[] = [];
        connectors.forEach(other => {
          if (other.id === connector.id) return;
          const sS = shapes.find(s => s.id === other.startShapeId);
          const eS = shapes.find(s => s.id === other.endShapeId);
          if (!sS || !eS) return;
          const sO = sS.outputs[other.startOutputIndex];
          const eI = eS.inputs[other.endInputIndex];
          if (!sO || !eI) return;
          
          const osCoords = getPinCoords(sS, sO);
          const oeCoords = getPinCoords(eS, eI);
          const osX = osCoords.x;
          const osY = osCoords.y;
          const oeX = oeCoords.x;
          const oeY = oeCoords.y;
          const omX = (osX + oeX) / 2;
          
          // Horizontal segments of the other wire:
          // 1. (osX, osY) to (omX, osY)
          // 2. (omX, oeY) to (oeX, oeY)
          
          if (osY > minY + jumpRadius && osY < maxY - jumpRadius) {
            if ((osX < x && omX > x) || (osX > x && omX < x)) {
              crossings.push(osY);
            }
          }
          if (oeY > minY + jumpRadius && oeY < maxY - jumpRadius) {
            if ((omX < x && oeX > x) || (omX > x && oeX < x)) {
              crossings.push(oeY);
            }
          }
        });
        
        // Sort crossings to draw them in order
        crossings.sort((a, b) => y1 < y2 ? a - b : b - a);
        
        let currentY = y1;
        crossings.forEach(cy => {
          ctx.lineTo(x, cy - (y1 < y2 ? jumpRadius : -jumpRadius));
          ctx.arc(x, cy, jumpRadius, y1 < y2 ? -Math.PI/2 : Math.PI/2, y1 < y2 ? Math.PI/2 : -Math.PI/2, y1 > y2);
          currentY = cy + (y1 < y2 ? jumpRadius : -jumpRadius);
        });
        ctx.lineTo(x, y2);
      };

      drawVerticalWithJumps(midX, startY, endY);
      
      // Horizontal segment 2: midX to endX at endY
      ctx.lineTo(endX, endY);
    }
    
    if (connector.id === highlightedConnectorId) {
      ctx.shadowBlur = 15;
      const isOutput = connector.startShapeId === selectedShape?.id;
      const highlightColor = isOutput ? '#22c55e' : '#3b82f6'; // Green for output, Blue for input
      ctx.shadowColor = highlightColor;
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = 4;
    } else if (statusVisible) {
      const isLightBackground = gridColor === '#ffffff' || gridColor === '#e0f2fe';
      const baseColor = isLightBackground ? '0, 0, 0' : '255, 255, 255';
      // Refined: wires are tenue (almost invisible) to focus on indicators
      ctx.strokeStyle = isActive ? `rgba(${baseColor}, 0.3)` : `rgba(${baseColor}, 0.04)`;
      ctx.lineWidth = 1;
      ctx.shadowBlur = isActive ? 10 : 0;
      ctx.shadowColor = isLightBackground ? 'rgba(0, 0, 0, 0.2)' : '#ffffff';
    } else if (isActive) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fbbf24';
      ctx.strokeStyle = '#fbbf24';
    } else if (connector.isSelected) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ef4444';
      ctx.strokeStyle = '#ef4444';
    } else if (connector.id === hoveredConnectorId) {
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#3b82f6';
      ctx.strokeStyle = '#3b82f6';
    } else if (isPCB) {
      ctx.strokeStyle = '#5555ff';
      ctx.lineWidth = 1;
    } else {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#4b5563';
    }
    
    if (statusVisible) {
      ctx.lineWidth = isActive ? 1.5 : 0.8;
    } else {
      ctx.lineWidth = (isActive || connector.isSelected || connector.id === highlightedConnectorId) ? 3 : 2;
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset for next draw
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);

    drawGrid(ctx, canvas.width, canvas.height);

    shapes.forEach(s => drawShape(ctx, s));

    if (!isWiresHidden) {
      connectors.forEach(c => drawConnector(ctx, c));
    }

    // Draw potential group connectors (previews)
    if (!isWiresHidden) {
      potentialConnectors.forEach(c => {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.setLineDash([5, 5]);
        drawConnector(ctx, { ...c, isSelected: false });
        ctx.restore();
      });
    }

    // Draw joints for schematic style
    if (wireStyle === 'schematic') {
      const branchPoints: Record<string, { x: number, y: number, active: boolean }[]> = {};
      
      connectors.forEach(c => {
        const startShape = shapes.find(s => s.id === c.startShapeId);
        if (!startShape) return;
        const startOutput = startShape.outputs[c.startOutputIndex];
        if (!startOutput) return;
        
        const startX = startShape.x + startOutput.x / SHAPE_SIZE_SCALE;
        const startY = startShape.y + startOutput.y / SHAPE_SIZE_SCALE;
        const endShape = shapes.find(s => s.id === c.endShapeId);
        if (!endShape) return;
        const endInput = endShape.inputs[c.endInputIndex];
        if (!endInput) return;
        
        const endX = endShape.x + endInput.x / SHAPE_SIZE_SCALE;
        const midX = (startX + endX) / 2;
        const isActive = startOutput.value === 1 || startOutput.value === '1';
        
        const key = `${c.startShapeId}_${c.startOutputIndex}`;
        if (!branchPoints[key]) branchPoints[key] = [];
        
        // Potential joint at output pin
        branchPoints[key].push({ x: startX, y: startY, active: isActive });
        // Potential joint at first corner
        branchPoints[key].push({ x: midX, y: startY, active: isActive });
      });

      Object.values(branchPoints).forEach(points => {
        if (!Array.isArray(points)) return;
        // Count occurrences of each point
        const counts: Record<string, { count: number, active: boolean }> = {};
        points.forEach(p => {
          const k = `${Math.round(p.x)},${Math.round(p.y)}`;
          if (!counts[k]) counts[k] = { count: 0, active: p.active };
          counts[k].count++;
        });
        
        Object.entries(counts).forEach(([k, info]) => {
          if (info.count > 1) {
            const [x, y] = k.split(',').map(Number);
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = info.active ? '#fbbf24' : '#4b5563';
            ctx.fill();
          }
        });
      });
    }

    // Draw selection box
    if (isSelecting && selectionStart && selectionEnd) {
      const x = Math.min(selectionStart.x, selectionEnd.x);
      const y = Math.min(selectionStart.y, selectionEnd.y);
      const width = Math.abs(selectionStart.x - selectionEnd.x);
      const height = Math.abs(selectionStart.y - selectionEnd.y);
      
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
      ctx.fillRect(x, y, width, height);
      ctx.setLineDash([]);
    }

    // Draw active connection line
    if (isConnecting && connectionStart) {
      const startShape = shapes.find(s => s.id === connectionStart.shapeId);
      if (startShape) {
        const pin = connectionStart.type === 'output' 
          ? startShape.outputs[connectionStart.index] 
          : startShape.inputs[connectionStart.index];
          
        if (!pin) return;
        const coords = getPinCoords(startShape, pin);
        const startX = coords.x;
        const startY = coords.y;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.strokeStyle = '#fbbf24';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.restore();
  }, [shapes, connectors, isConnecting, connectionStart, mousePos, hoveredConnectorId, panOffset, wireStyle, statusVisible, selectedShape, highlightedPin, potentialConnectors, isSelecting, selectionStart, selectionEnd]);

  useEffect(() => {
    render();
  }, [render]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (panModeEnabled || e.button === 1) {
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
      return;
    }

    const x = (e.clientX - rect.left) / (zoom / 100) - panOffset.x;
    const y = (e.clientY - rect.top) / (zoom / 100) - panOffset.y;

    // Check for connection points
    for (const shape of shapes) {
      // Outputs
      for (let i = 0; i < shape.outputs.length; i++) {
        const coords = getPinCoords(shape, shape.outputs[i]);
        if (Math.hypot(x - coords.x, y - coords.y) < 10) {
          setIsConnecting(true);
          setConnectionStart({ shapeId: shape.id, index: i, type: 'output' });
          onHighlightPin({ shapeId: shape.id, type: 'output', index: i });
          return;
        }
      }
      // Inputs
      for (let i = 0; i < shape.inputs.length; i++) {
        const coords = getPinCoords(shape, shape.inputs[i]);
        if (Math.hypot(x - coords.x, y - coords.y) < 10) {
          setIsConnecting(true);
          setConnectionStart({ shapeId: shape.id, index: i, type: 'input' });
          onHighlightPin({ shapeId: shape.id, type: 'input', index: i });
          return;
        }
      }
    }

    // Check for shapes
    for (const shape of shapes) {
      const scale = shape.scale || 1;
      if (x >= shape.x && x <= shape.x + (shape.width / SHAPE_SIZE_SCALE) * scale &&
          y >= shape.y && y <= shape.y + (shape.height / SHAPE_SIZE_SCALE) * scale) {
        
        // Check for adjustable clock arrows
        if (shape.type === 'Clock_Hz_Adj' || shape.type === 'Clock_ms_Adj') {
          const finalWidth = (shape.width / SHAPE_SIZE_SCALE); // scale is applied via ctx.scale in draw, but here we are in canvas coords
          // Wait, the hit detection here is in canvas coords.
          // shape.x and shape.y are in canvas coords.
          // (shape.width / SHAPE_SIZE_SCALE) * scale is the actual width on canvas.
          
          const actualWidth = (shape.width / SHAPE_SIZE_SCALE) * scale;
          const arrowX = shape.x + actualWidth - (20 * scale); // The arrows are drawn at finalWidth + 5 to + 15
          // Wait, in drawShape I used finalWidth + 5.
          // If width is 120, finalWidth is 60. Arrows at 65-75.
          // So arrowX is around shape.x + 65*scale to 75*scale.
          
          const upArrowY = shape.y + 2.5 * scale;
          const downArrowY = shape.y + 17.5 * scale;
          const arrowCenterX = shape.x + (actualWidth * (60/60)) + 10 * scale; 
          // Let's be more precise. In drawShape:
          // finalWidth = shape.width / 2 (which is 60 if width is 120)
          // Arrows at finalWidth + 10.
          const fWidth = (shape.width / SHAPE_SIZE_SCALE);
          const aX = shape.x + (fWidth + 10) * scale;
          const aUpY = shape.y + 2.5 * scale;
          const aDownY = shape.y + 17.5 * scale;

          if (Math.hypot(x - aX, y - aUpY) < 15 * scale) {
            let nextFreq = shape.frequency || 1;
            if (shape.type === 'Clock_Hz_Adj') {
              nextFreq += 1;
            } else {
              const currentMs = 1000 / nextFreq;
              const nextMs = currentMs + 100;
              nextFreq = 1000 / nextMs;
            }
            onShapesChange(shapes.map(s => s.id === shape.id ? { ...s, frequency: nextFreq } : s));
            return;
          }
          if (Math.hypot(x - aX, y - aDownY) < 15 * scale) {
            let nextFreq = shape.frequency || 1;
            if (shape.type === 'Clock_Hz_Adj') {
              nextFreq = Math.max(0.1, nextFreq - 1);
            } else {
              const currentMs = 1000 / nextFreq;
              const nextMs = Math.max(10, currentMs - 100);
              nextFreq = 1000 / nextMs;
            }
            onShapesChange(shapes.map(s => s.id === shape.id ? { ...s, frequency: nextFreq } : s));
            return;
          }
        }

        if (shape.type === 'PushButton') {
          onShapesChange(shapes.map(s => s.id === shape.id ? { ...s, isPressed: true } : s));
        }

        setIsDragging(true);
        setDraggedShapeId(shape.id);
        setDragOffset({ x: x - shape.x, y: y - shape.y });
        onSelectShape(shape);

        if (e.ctrlKey) {
          onShapesChange(shapes.map(s => s.id === shape.id ? { ...s, isSelected: !s.isSelected } : s));
        } else {
          // If the shape is not already selected, clear others and select this one
          if (!shape.isSelected) {
            onShapesChange(shapes.map(s => ({ ...s, isSelected: s.id === shape.id })));
            onConnectorsChange(connectors.map(c => ({ ...c, isSelected: false })));
          }
        }
        return;
      }
    }

    // Check for connectors
    for (const connector of connectors) {
      const startShape = shapes.find(s => s.id === connector.startShapeId);
      const endShape = shapes.find(s => s.id === connector.endShapeId);
      if (startShape && endShape) {
        const startOutput = startShape.outputs[connector.startOutputIndex];
        const endInput = endShape.inputs[connector.endInputIndex];
        if (!startOutput || !endInput) continue;

        const startCoords = getPinCoords(startShape, startOutput);
        const endCoords = getPinCoords(endShape, endInput);
        const startX = startCoords.x;
        const startY = startCoords.y;
        const endX = endCoords.x;
        const endY = endCoords.y;
        
        // Simple distance to line check (midpoint)
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        if (Math.hypot(x - midX, y - midY) < 15) {
          if (e.ctrlKey) {
            onConnectorsChange(connectors.map(c => c.id === connector.id ? { ...c, isSelected: !c.isSelected } : c));
          } else {
            onConnectorsChange(connectors.map(c => ({ ...c, isSelected: c.id === connector.id })));
            // Clear multi-selection for shapes
            onShapesChange(shapes.map(s => ({ ...s, isSelected: false })));
            onSelectConnector(connector);
            onSelectShape(null);
          }
          return;
        }
      }
    }

    onSelectShape(null);
    onSelectConnector(null);
    onConnectorsChange(connectors.map(c => ({ ...c, isSelected: false })));
    onShapesChange(shapes.map(s => ({ ...s, isSelected: false })));
    
    // Start selection box
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isPanning && onPanChange) {
      const dx = (e.clientX - lastPanPos.x) / (zoom / 100);
      const dy = (e.clientY - lastPanPos.y) / (zoom / 100);
      onPanChange({ x: panOffset.x + dx, y: panOffset.y + dy });
      setLastPanPos({ x: e.clientX, y: e.clientY });
      return;
    }

    const x = (e.clientX - rect.left) / (zoom / 100) - panOffset.x;
    const y = (e.clientY - rect.top) / (zoom / 100) - panOffset.y;
    setMousePos({ x, y });

    // Hover detection for connectors
    let foundHover = null;
    for (const connector of connectors) {
      const startShape = shapes.find(s => s.id === connector.startShapeId);
      const endShape = shapes.find(s => s.id === connector.endShapeId);
      if (startShape && endShape) {
        const startOutput = startShape.outputs[connector.startOutputIndex];
        const endInput = endShape.inputs[connector.endInputIndex];
        if (startOutput && endInput) {
          const startCoords = getPinCoords(startShape, startOutput);
          const endCoords = getPinCoords(endShape, endInput);
          const startX = startCoords.x;
          const startY = startCoords.y;
          const endX = endCoords.x;
          const endY = endCoords.y;
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          if (Math.hypot(x - midX, y - midY) < 15) {
            foundHover = connector.id;
            break;
          }
        }
      }
    }
    setHoveredConnectorId(foundHover);

    if (isSelecting) {
      setSelectionEnd({ x, y });
    }

    if (isDragging && draggedShapeId) {
      const draggedShape = shapes.find(s => s.id === draggedShapeId);
      if (draggedShape) {
        let newX = x - dragOffset.x;
        let newY = y - dragOffset.y;

        const selectedShapes = shapes.filter(s => s.isSelected || s.id === draggedShapeId);
        const selectedIds = new Set(selectedShapes.map(s => s.id));
        const unselectedShapes = shapes.filter(s => !selectedIds.has(s.id));

        // Visual Magnetization (Snapping)
        if (magneticWiresEnabled) {
          const SNAP_THRESHOLD = 20;
          let bestSnap = null;
          let minDist = SNAP_THRESHOLD;

          const currentDx = x - dragOffset.x - draggedShape.x;
          const currentDy = y - dragOffset.y - draggedShape.y;

          for (const s of selectedShapes) {
            const allPins = [...(s.inputs || []), ...(s.outputs || [])];
            const tempShapeX = s.x + currentDx;
            const tempShapeY = s.y + currentDy;

            for (const other of unselectedShapes) {
              const otherPins = [...(other.inputs || []), ...(other.outputs || [])];
              
              for (const draggedPin of allPins) {
                const dCoords = getPinCoords({ ...s, x: tempShapeX, y: tempShapeY }, draggedPin);
                
                for (const otherPin of otherPins) {
                  const oCoords = getPinCoords(other, otherPin);
                  const dist = Math.hypot(dCoords.x - oCoords.x, dCoords.y - oCoords.y);
                  
                  if (dist < minDist) {
                    minDist = dist;
                    bestSnap = {
                      dx: oCoords.x - dCoords.x,
                      dy: oCoords.y - dCoords.y
                    };
                  }
                }
              }
            }
          }

          if (bestSnap) {
            newX += bestSnap.dx;
            newY += bestSnap.dy;
          }
        }

        const dx = newX - draggedShape.x;
        const dy = newY - draggedShape.y;

        if (dx !== 0 || dy !== 0) {
          const newShapes = shapes.map(s => {
            if (s.isSelected) {
              return { ...s, x: s.x + dx, y: s.y + dy };
            }
            if (s.id === draggedShapeId) {
              return { ...s, x: newX, y: newY };
            }
            return s;
          });
          onShapesChange(newShapes);
        }

        // Logic for Group Connection Previews
        if (magneticWiresEnabled && selectedShapes.length > 0) {
          const PREVIEW_THRESHOLD = 300;
          const COMMIT_THRESHOLD = 100;
          let newPotential: Connector[] = [];

          // Find unselected shape closest to the dragged/selected group
          let closestTarget: Shape | null = null;
          let minGroupDist = PREVIEW_THRESHOLD;

          // Compute group bounding box
          const gMinX = Math.min(...selectedShapes.map(s => s.x));
          const gMaxX = Math.max(...selectedShapes.map(s => s.x + (s.width / SHAPE_SIZE_SCALE) * (s.scale || 1)));
          const gMinY = Math.min(...selectedShapes.map(s => s.y));
          const gMaxY = Math.max(...selectedShapes.map(s => s.y + (s.height / SHAPE_SIZE_SCALE) * (s.scale || 1)));

          for (const other of unselectedShapes) {
            const oW = (other.width / SHAPE_SIZE_SCALE) * (other.scale || 1);
            const oH = (other.height / SHAPE_SIZE_SCALE) * (other.scale || 1);
            
            // Distance between bounding boxes (more robust for variable distances)
            const bX = Math.max(0, gMinX - (other.x + oW), other.x - gMaxX);
            const bY = Math.max(0, gMinY - (other.y + oH), other.y - gMaxY);
            const dist = Math.hypot(bX, bY);

            if (dist < minGroupDist) {
              minGroupDist = dist;
              closestTarget = other;
            }
          }

          if (closestTarget) {
            const target = closestTarget;
            const oW = (target.width / SHAPE_SIZE_SCALE) * (target.scale || 1);
            const isGroupOnLeft = gMaxX < target.x + oW / 2;

            if (isGroupOnLeft) {
              // Group's outputs -> Component's inputs
              // Filter out target inputs that are already connected
              const freeTargetInputs: { index: number, y: number }[] = target.inputs
                .map((inp, idx) => ({ index: idx, y: getPinCoords(target, inp).y }))
                .filter(inp => !connectors.some(c => c.endShapeId === target.id && c.endInputIndex === inp.index))
                .sort((a, b) => a.y - b.y);

              const allGroupOutputs: { shapeId: string, index: number, y: number }[] = [];
              selectedShapes.forEach(s => {
                s.outputs.forEach((out, idx) => {
                  const coords = getPinCoords(s, out);
                  allGroupOutputs.push({ shapeId: s.id, index: idx, y: coords.y });
                });
              });
              allGroupOutputs.sort((a, b) => a.y - b.y);

              const count = Math.min(allGroupOutputs.length, freeTargetInputs.length);
              for (let i = 0; i < count; i++) {
                newPotential.push({
                  id: `preview-${i}`,
                  startShapeId: allGroupOutputs[i].shapeId,
                  startOutputIndex: allGroupOutputs[i].index,
                  endShapeId: target.id,
                  endInputIndex: freeTargetInputs[i].index
                });
              }
            } else {
              // Component's outputs -> Group's inputs
              // Filter out target outputs that are already connected
              const freeTargetOutputs: { index: number, y: number }[] = target.outputs
                .map((out, idx) => ({ index: idx, y: getPinCoords(target, out).y }))
                .filter(out => !connectors.some(c => c.startShapeId === target.id && c.startOutputIndex === out.index))
                .sort((a, b) => a.y - b.y);

              const allGroupInputs: { shapeId: string, index: number, y: number }[] = [];
              selectedShapes.forEach(s => {
                s.inputs.forEach((inp, idx) => {
                  const coords = getPinCoords(s, inp);
                  allGroupInputs.push({ shapeId: s.id, index: idx, y: coords.y });
                });
              });
              allGroupInputs.sort((a, b) => a.y - b.y);

              const count = Math.min(freeTargetOutputs.length, allGroupInputs.length);
              for (let i = 0; i < count; i++) {
                newPotential.push({
                  id: `preview-${i}`,
                  startShapeId: target.id,
                  startOutputIndex: freeTargetOutputs[i].index,
                  endShapeId: allGroupInputs[i].shapeId,
                  endInputIndex: allGroupInputs[i].index
                });
              }
            }
          }
          setPotentialConnectors(newPotential);

          // Auto-connect if very close
          if (closestTarget && minGroupDist < COMMIT_THRESHOLD) {
            // This is handled in handleMouseUp to be safer, or can do it here.
            // But doing it here might be annoying if it auto-snaps and connects instantly.
            // The prompt says "if the user brings it almost to touch, then they form".
          }
        }
      }
    }

    // Proximity detection for pins during connection
    if (isConnecting) {
      let closestPin = null;
      let minDistance = 30; // Max distance to trigger highlight

      for (const shape of shapes) {
        // Check inputs (as we usually connect output -> input)
        for (let i = 0; i < shape.inputs.length; i++) {
          const coords = getPinCoords(shape, shape.inputs[i]);
          const dist = Math.hypot(x - coords.x, y - coords.y);
          if (dist < minDistance) {
            minDistance = dist;
            closestPin = { shapeId: shape.id, type: 'input' as const, index: i };
          }
        }
        // Also check outputs (in case user wants to connect to another output - though less common)
        for (let i = 0; i < shape.outputs.length; i++) {
          const coords = getPinCoords(shape, shape.outputs[i]);
          const dist = Math.hypot(x - coords.x, y - coords.y);
          if (dist < minDistance) {
            minDistance = dist;
            closestPin = { shapeId: shape.id, type: 'output' as const, index: i };
          }
        }
      }
      onHighlightPin(closestPin);
    } else {
      // Clear highlight if not connecting
      if (highlightedPin) onHighlightPin(null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (contextMenu) {
      setContextMenu(null);
    }
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / (zoom / 100) - panOffset.x;
    const y = (e.clientY - rect.top) / (zoom / 100) - panOffset.y;

    if (isSelecting && selectionStart && selectionEnd) {
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);

      const newShapes = shapes.map(s => {
        const scale = s.scale || 1;
        const sWidth = (s.width / SHAPE_SIZE_SCALE) * scale;
        const sHeight = (s.height / SHAPE_SIZE_SCALE) * scale;
        const isInside = s.x >= minX && s.x + sWidth <= maxX &&
                         s.y >= minY && s.y + sHeight <= maxY;
        return { ...s, isSelected: isInside };
      });

      const newConnectors = connectors.map(c => {
        const startShape = shapes.find(s => s.id === c.startShapeId);
        const endShape = shapes.find(s => s.id === c.endShapeId);
        if (startShape && endShape) {
          const startOutput = startShape.outputs[c.startOutputIndex];
          const endInput = endShape.inputs[c.endInputIndex];
          if (startOutput && endInput) {
            const startCoords = getPinCoords(startShape, startOutput);
            const endCoords = getPinCoords(endShape, endInput);
            const isInside = startCoords.x >= minX && startCoords.x <= maxX &&
                             startCoords.y >= minY && startCoords.y <= maxY &&
                             endCoords.x >= minX && endCoords.x <= maxX &&
                             endCoords.y >= minY && endCoords.y <= maxY;
            return { ...c, isSelected: isInside };
          }
        }
        return c;
      });

      onShapesChange(newShapes);
      onConnectorsChange(newConnectors);
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      if (onCommitHistory) onCommitHistory();
      return;
    }

    if (isDragging && draggedShapeId) {
      const shape = shapes.find(s => s.id === draggedShapeId);
      
      if (fuserEnabled && shape) {
        const isInput = shape.type === 'InputL' || shape.type === 'ToggleSwitch' || shape.type === 'PushButton' || shape.type === 'HighConstant' || shape.type === 'LowConstant';
        if (isInput) {
          const sW_drag = (shape.width / SHAPE_SIZE_SCALE) * (shape.scale || 1);
          const sH_drag = (shape.height / SHAPE_SIZE_SCALE) * (shape.scale || 1);
          
          const overlappingLED = shapes.find(s => {
            if (s.id === draggedShapeId || s.type !== 'OutPutL') return false;
            const sW = (s.width / SHAPE_SIZE_SCALE) * (s.scale || 1);
            const sH = (s.height / SHAPE_SIZE_SCALE) * (s.scale || 1);
            return (
              shape.x < s.x + sW &&
              shape.x + sW_drag > s.x &&
              shape.y < s.y + sH &&
              shape.y + sH_drag > s.y
            );
          });

          if (overlappingLED && onFuseRequest) {
            onFuseRequest(draggedShapeId, overlappingLED.id);
            setIsDragging(false);
            setDraggedShapeId(null);
            return;
          }
        }
      }

      // Commit potential group connectors if they exist and group is close enough
      if (potentialConnectors.length > 0) {
        const COMMIT_THRESHOLD = 40; // Slightly more forgiving than snap
        const selectedShapes = shapes.filter(s => s.isSelected || s.id === draggedShapeId);
        const selectedIds = new Set(selectedShapes.map(s => s.id));
        const unselectedShapes = shapes.filter(s => !selectedIds.has(s.id));

        // Recalculate distance to confirm commit
        let closestDist = Infinity;
        let targetComp: Shape | null = null;
        
        // Find the target component used for the previews
        if (potentialConnectors.length > 0) {
          const firstTargetId = potentialConnectors[0].startShapeId;
          const secondTargetId = potentialConnectors[0].endShapeId;
          const targetId = selectedIds.has(firstTargetId) ? secondTargetId : firstTargetId;
          targetComp = unselectedShapes.find(s => s.id === targetId) || null;
        }

        if (targetComp) {
          const gMinX = Math.min(...selectedShapes.map(s => s.x));
          const gMaxX = Math.max(...selectedShapes.map(s => s.x + (s.width / SHAPE_SIZE_SCALE) * (s.scale || 1)));
          const gMinY = Math.min(...selectedShapes.map(s => s.y));
          const gMaxY = Math.max(...selectedShapes.map(s => s.y + (s.height / SHAPE_SIZE_SCALE) * (s.scale || 1)));
          const oW = (targetComp.width / SHAPE_SIZE_SCALE) * (targetComp.scale || 1);
          const oH = (targetComp.height / SHAPE_SIZE_SCALE) * (targetComp.scale || 1);
          
          const gcX = (gMinX + gMaxX) / 2;
          const gcY = (gMinY + gMaxY) / 2;
          const ocX = targetComp.x + oW / 2;
          const ocY = targetComp.y + oH / 2;
          
          // Distance between bounding boxes (more accurate for "almost touch")
          const bDX = Math.max(0, gMinX - (targetComp.x + oW), targetComp.x - gMaxX);
          const bDY = Math.max(0, gMinY - (targetComp.y + oH), targetComp.y - gMaxY);
          const bbDist = Math.hypot(bDX, bDY);

          // If bounding boxes are within 100px, consider it "almost touch" for group commit
          if (bbDist < 100) {
            const newConns = potentialConnectors.map(pc => ({
              ...pc,
              id: Math.random().toString(36).substr(2, 9)
            })).filter(pc => !connectors.some(c => 
              c.startShapeId === pc.startShapeId && c.endShapeId === pc.endShapeId && 
              c.startOutputIndex === pc.startOutputIndex && c.endInputIndex === pc.endInputIndex
            ));
            
            if (newConns.length > 0) {
              onConnectorsChange([...connectors, ...newConns]);
            }
          }
        }
      }
      setPotentialConnectors([]);

      if (shape) {
        if (shape.type === 'PushButton') {
          onShapesChange(shapes.map(s => s.id === draggedShapeId ? { ...s, isPressed: false } : s));
        }

        // Auto-connect logic: check if dropped on or near other shapes
        const overlappingShapes = shapes.filter(s => {
          if (s.id === shape.id) return false;
          const scale = s.scale || 1;
          const sWidth = (s.width / SHAPE_SIZE_SCALE) * scale;
          const sHeight = (s.height / SHAPE_SIZE_SCALE) * scale;
          
          const shapeScale = shape.scale || 1;
          const shapeWidth = (shape.width / SHAPE_SIZE_SCALE) * shapeScale;
          const shapeHeight = (shape.height / SHAPE_SIZE_SCALE) * shapeScale;

          // Padding for proximity detection
          const padding = magneticWiresEnabled ? 40 : 10;

          return shape.x < s.x + sWidth + padding &&
                 shape.x + shapeWidth > s.x - padding &&
                 shape.y < s.y + sHeight + padding &&
                 shape.y + shapeHeight > s.y - padding;
        });

        if (overlappingShapes.length > 0) {
          const newConnectors: Connector[] = [];
          
          overlappingShapes.forEach(targetShape => {
            if (magneticWiresEnabled) {
              // Magnetic Wires: Check all pin combinations for spatial proximity
              const shapePins = [
                ...shape.inputs.map((p, i) => ({ ...p, index: i, type: 'input' as const })),
                ...shape.outputs.map((p, i) => ({ ...p, index: i, type: 'output' as const }))
              ];
              const targetPins = [
                ...targetShape.inputs.map((p, i) => ({ ...p, index: i, type: 'input' as const })),
                ...targetShape.outputs.map((p, i) => ({ ...p, index: i, type: 'output' as const }))
              ];

              shapePins.forEach(sPin => {
                targetPins.forEach(tPin => {
                  // Only connect Output to Input
                  if (sPin.type === tPin.type) return;

                  const sCoords = getPinCoords(shape, sPin);
                  const tCoords = getPinCoords(targetShape, tPin);
                  const distance = Math.hypot(sCoords.x - tCoords.x, sCoords.y - tCoords.y);

                  if (distance < 10) { // Snapped pins will have near 0 distance
                    const startShapeId = sPin.type === 'output' ? shape.id : targetShape.id;
                    const startOutputIndex = sPin.type === 'output' ? sPin.index : tPin.index;
                    const endShapeId = sPin.type === 'input' ? shape.id : targetShape.id;
                    const endInputIndex = sPin.type === 'input' ? sPin.index : tPin.index;

                    const exists = connectors.some(c => 
                      c.startShapeId === startShapeId && c.endShapeId === endShapeId && 
                      c.startOutputIndex === startOutputIndex && c.endInputIndex === endInputIndex
                    ) || newConnectors.some(c => 
                      c.startShapeId === startShapeId && c.endShapeId === endShapeId && 
                      c.startOutputIndex === startOutputIndex && c.endInputIndex === endInputIndex
                    );

                    if (!exists) {
                      newConnectors.push({
                        id: Math.random().toString(36).substr(2, 9),
                        startShapeId,
                        endShapeId,
                        startOutputIndex,
                        endInputIndex
                      });
                    }
                  }
                });
              });
            } else if (connectionCloningEnabled) {
              // Connection Cloning Mode
              connectors.forEach(conn => {
                // Copy input connections
                if (conn.endShapeId === targetShape.id) {
                  // Check if current shape has this input index
                  if (shape.inputs[conn.endInputIndex]) {
                    const exists = connectors.some(c => 
                      c.startShapeId === conn.startShapeId && c.endShapeId === shape.id && 
                      c.startOutputIndex === conn.startOutputIndex && c.endInputIndex === conn.endInputIndex
                    ) || newConnectors.some(c => 
                      c.startShapeId === conn.startShapeId && c.endShapeId === shape.id && 
                      c.startOutputIndex === conn.startOutputIndex && c.endInputIndex === conn.endInputIndex
                    );
                    if (!exists) {
                      newConnectors.push({
                        id: Math.random().toString(36).substr(2, 9),
                        startShapeId: conn.startShapeId,
                        endShapeId: shape.id,
                        startOutputIndex: conn.startOutputIndex,
                        endInputIndex: conn.endInputIndex
                      });
                    }
                  }
                }
                // Copy output connections
                if (conn.startShapeId === targetShape.id) {
                  // Check if current shape has this output index
                  if (shape.outputs[conn.startOutputIndex]) {
                    const exists = connectors.some(c => 
                      c.startShapeId === shape.id && c.endShapeId === conn.endShapeId && 
                      c.startOutputIndex === conn.startOutputIndex && c.endInputIndex === conn.endInputIndex
                    ) || newConnectors.some(c => 
                      c.startShapeId === shape.id && c.endShapeId === conn.endShapeId && 
                      c.startOutputIndex === conn.startOutputIndex && c.endInputIndex === conn.endInputIndex
                    );
                    if (!exists) {
                      newConnectors.push({
                        id: Math.random().toString(36).substr(2, 9),
                        startShapeId: shape.id,
                        endShapeId: conn.endShapeId,
                        startOutputIndex: conn.startOutputIndex,
                        endInputIndex: conn.endInputIndex
                      });
                    }
                  }
                }
              });
            } else {
              // Standard sequential auto-connect logic
              if (shape.outputs.length > 0 && targetShape.inputs.length > 0 && shape.outputs.length === targetShape.inputs.length) {
                for (let i = 0; i < shape.outputs.length; i++) {
                  const exists = connectors.some(c => 
                    c.startShapeId === shape.id && c.endShapeId === targetShape.id && 
                    c.startOutputIndex === i && c.endInputIndex === i
                  );
                  if (!exists) {
                    newConnectors.push({
                      id: Math.random().toString(36).substr(2, 9),
                      startShapeId: shape.id,
                      endShapeId: targetShape.id,
                      startOutputIndex: i,
                      endInputIndex: i
                    });
                  }
                }
              }
              else if (shape.inputs.length > 0 && targetShape.outputs.length > 0 && shape.inputs.length === targetShape.outputs.length) {
                for (let i = 0; i < shape.inputs.length; i++) {
                  const exists = connectors.some(c => 
                    c.startShapeId === targetShape.id && c.endShapeId === shape.id && 
                    c.startOutputIndex === i && c.endInputIndex === i
                  );
                  if (!exists) {
                    newConnectors.push({
                      id: Math.random().toString(36).substr(2, 9),
                      startShapeId: targetShape.id,
                      endShapeId: shape.id,
                      startOutputIndex: i,
                      endInputIndex: i
                    });
                  }
                }
              }
            }
          });

          if (newConnectors.length > 0) {
            onConnectorsChange([...connectors, ...newConnectors]);
          }

          if (magneticWiresEnabled) {
            onDisableMagneticWires?.();
          }

          if (connectionCloningEnabled) {
            onDisableConnectionCloning?.();
          }
        }
      }
    }

    if (isConnecting && connectionStart) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / (zoom / 100) - panOffset.x;
      const y = (e.clientY - rect.top) / (zoom / 100) - panOffset.y;

      for (const shape of shapes) {
        // If we started from an output, look for an input
        if (connectionStart.type === 'output') {
          for (let i = 0; i < shape.inputs.length; i++) {
            const coords = getPinCoords(shape, shape.inputs[i]);
            if (Math.hypot(x - coords.x, y - coords.y) < 15) {
              const newConnector: Connector = {
                id: Math.random().toString(36).substr(2, 9),
                startShapeId: connectionStart.shapeId,
                endShapeId: shape.id,
                startOutputIndex: connectionStart.index,
                endInputIndex: i
              };
              onConnectorsChange([...connectors, newConnector]);
              break;
            }
          }
        } 
        // If we started from an input, look for an output
        else {
          for (let i = 0; i < shape.outputs.length; i++) {
            const coords = getPinCoords(shape, shape.outputs[i]);
            if (Math.hypot(x - coords.x, y - coords.y) < 15) {
              const newConnector: Connector = {
                id: Math.random().toString(36).substr(2, 9),
                startShapeId: shape.id,
                endShapeId: connectionStart.shapeId,
                startOutputIndex: i,
                endInputIndex: connectionStart.index
              };
              onConnectorsChange([...connectors, newConnector]);
              break;
            }
          }
        }
      }
    }

    const wasAction = isDragging || isConnecting || isSelecting;
    setIsDragging(false);
    setDraggedShapeId(null);
    setIsConnecting(false);
    setConnectionStart(null);
    onHighlightPin(null);
    if (wasAction && onCommitHistory) {
      onCommitHistory();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('shapeType') as ShapeType;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / (zoom / 100) - panOffset.x;
    const y = (e.clientY - rect.top) / (zoom / 100) - panOffset.y;

    let newShape: Shape;
    const archDataStr = e.dataTransfer.getData('architectureShapeData');
    
    if (archDataStr) {
      try {
        const archData = JSON.parse(archDataStr) as Shape;
        newShape = {
          ...archData,
          id: Math.random().toString(36).substr(2, 9),
          x,
          y,
          isSelected: true
        };
      } catch (err) {
        console.error('Failed to parse architecture shape data:', err);
        newShape = createShape(type, x, y);
      }
    } else if (type === 'CustomBlock') {
      const blockId = e.dataTransfer.getData('customBlockId');
      const isLibrary = e.dataTransfer.getData('isLibraryBlock') === 'true';
      
      let blockTemplate = customBlocks.find(b => b.id === blockId);
      if (!blockTemplate && isLibrary) {
        blockTemplate = libraryBlocks.find(b => b.id === blockId);
      }

      if (blockTemplate) {
        newShape = {
          ...JSON.parse(JSON.stringify(blockTemplate)),
          id: Math.random().toString(36).substr(2, 9),
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
    
    // Auto-connect logic for drop
    const targetShape = shapes.find(s => {
      const scale = s.scale || 1;
      const sWidth = (s.width / SHAPE_SIZE_SCALE) * scale;
      const sHeight = (s.height / SHAPE_SIZE_SCALE) * scale;
      return x >= s.x && x <= s.x + sWidth &&
             y >= s.y && y <= s.y + sHeight;
    });

    let updatedConnectors = [...connectors];
    if (targetShape) {
      if (newShape.outputs.length > 0 && targetShape.inputs.length > 0 && newShape.outputs.length === targetShape.inputs.length) {
        for (let i = 0; i < newShape.outputs.length; i++) {
          updatedConnectors.push({
            id: Math.random().toString(36).substr(2, 9),
            startShapeId: newShape.id,
            endShapeId: targetShape.id,
            startOutputIndex: i,
            endInputIndex: i
          });
        }
        onConnectorsChange(updatedConnectors);
      } else if (newShape.inputs.length > 0 && targetShape.outputs.length > 0 && newShape.inputs.length === targetShape.outputs.length) {
        for (let i = 0; i < newShape.inputs.length; i++) {
          updatedConnectors.push({
            id: Math.random().toString(36).substr(2, 9),
            startShapeId: targetShape.id,
            endShapeId: newShape.id,
            startOutputIndex: i,
            endInputIndex: i
          });
        }
        onConnectorsChange(updatedConnectors);
      }
    }

    onShapesChange([...shapes, newShape]);
    if (onCommitHistory) onCommitHistory();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onAction) return;

    // Handle selection on right-click if not already selected
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);

    const hitShape = shapes.find(s => 
      x >= s.x && 
      x <= s.x + (s.width / SHAPE_SIZE_SCALE) * (s.scale || 1) && 
      y >= s.y && 
      y <= s.y + (s.height / SHAPE_SIZE_SCALE) * (s.scale || 1)
    );

    if (hitShape && !hitShape.isSelected) {
      onShapesChange(shapes.map(s => ({ ...s, isSelected: s.id === hitShape.id })));
      onConnectorsChange(connectors.map(c => ({ ...c, isSelected: false })));
      onSelectShape(hitShape);
    }

    const canvasX = (e.clientX - rect.left) / (zoom / 100) - panOffset.x;
    const canvasY = (e.clientY - rect.top) / (zoom / 100) - panOffset.y;

    setContextMenu({ x: e.clientX, y: e.clientY, canvasX, canvasY });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / (zoom / 100) - panOffset.x;
    const y = (e.clientY - rect.top) / (zoom / 100) - panOffset.y;

    const clickedShape = shapes.find(s => {
      const scale = s.scale || 1;
      return x >= s.x && x <= s.x + (s.width / SHAPE_SIZE_SCALE) * scale &&
             y >= s.y && y <= s.y + (s.height / SHAPE_SIZE_SCALE) * scale;
    });

    if (!clickedShape) return;

    // Feature: Select all components of the same type
    onSelectShape(clickedShape);
    onSelectConnector(null);
    onConnectorsChange(connectors.map(c => ({ ...c, isSelected: false })));

    let nextShapes = shapes.map(s => ({
      ...s,
      isSelected: s.type === clickedShape.type
    }));

    if (clickedShape.type === 'InputL' || clickedShape.type === 'ToggleSwitch' || clickedShape.type === 'PassSwitch') {
      nextShapes = nextShapes.map(s => {
        if (s.id === clickedShape.id) {
          if (s.type === 'PassSwitch') {
            const newState = s.state === 1 ? 0 : 1;
            return { ...s, state: newState, color: newState === 1 ? 'green' : 'gray' };
          }
          const newValue = s.outputs?.[0]?.value === 1 ? 0 : 1;
          return {
            ...s,
            color: newValue === 1 ? 'green' : 'red',
            outputs: s.outputs.map(o => ({ ...o, value: newValue }))
          };
        }
        return s;
      });
      onShapesChange(nextShapes);
    } else if (clickedShape.type === 'InputControl' || clickedShape.type === 'InputControl_4' || clickedShape.type === 'InputControl_7' || clickedShape.type === 'InputControl_8') {
      const scale = clickedShape.scale || 1;
      const relativeY = (y - clickedShape.y) / scale;
      const py = relativeY * SHAPE_SIZE_SCALE;
      
      nextShapes = nextShapes.map(s => {
        if (s.id === clickedShape.id) {
          const newOutputs = s.outputs.map((o) => {
             const pinY = o.y;
             if (Math.abs(py - pinY) < 15) {
                return { ...o, value: o.value === 1 ? 0 : 1 };
             }
             return o;
          });
          return { ...s, outputs: newOutputs };
        }
        return s;
      });
      onShapesChange(nextShapes);
    } else if (clickedShape.type === 'Text') {
      const newText = prompt('Enter text:', clickedShape.label);
      if (newText !== null) {
        onShapesChange(nextShapes.map(s => s.id === clickedShape.id ? { ...s, label: newText } : s));
      } else {
        onShapesChange(nextShapes);
      }
    } else if (clickedShape && (clickedShape.type === 'Clock' || clickedShape.type === 'Clock_ms' || clickedShape.type === 'Clock_Hz_Adj' || clickedShape.type === 'Clock_ms_Adj')) {
      const isMs = clickedShape.type === 'Clock_ms' || clickedShape.type === 'Clock_ms_Adj';
      const currentVal = isMs ? (1000 / (clickedShape.frequency || 1)).toFixed(0) : (clickedShape.frequency || 1);
      const unit = isMs ? 'ms' : 'Hz';
      const newValStr = prompt(`Enter ${isMs ? 'Period' : 'Frequency'} (${unit}):`, currentVal.toString());
      if (newValStr !== null) {
        const newVal = parseFloat(newValStr);
        if (!isNaN(newVal) && newVal > 0) {
          const nextFreq = isMs ? 1000 / newVal : newVal;
          onShapesChange(nextShapes.map(s => s.id === clickedShape.id ? { ...s, frequency: nextFreq } : s));
        } else {
          onShapesChange(nextShapes);
        }
      } else {
        onShapesChange(nextShapes);
      }
    } else {
      onShapesChange(nextShapes);
    }
  };

  const baseWidth = canvasScale === 'half' ? 1000 : canvasScale === 'double' ? 4000 : 2000;
  const baseHeight = canvasScale === 'half' ? 750 : canvasScale === 'double' ? 3000 : 1500;

  return (
    <div className="flex-1 bg-dk-darker-bg overflow-auto relative p-8 custom-scrollbar">
      <div 
        style={{ 
          width: `${baseWidth * (zoom / 100)}px`, 
          height: `${baseHeight * (zoom / 100)}px`,
          position: 'relative'
        }}
      >
        <canvas
          ref={canvasRef}
          width={baseWidth}
          height={baseHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{ 
            transform: `scale(${zoom / 100})`, 
            transformOrigin: 'top left',
            cursor: isPanning ? 'grabbing' : panModeEnabled ? 'grab' : (isDragging ? 'grabbing' : 'crosshair'),
            position: 'absolute',
            top: 0,
            left: 0
          }}
          className="bg-white shadow-2xl rounded-sm"
        />
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            canvasX={contextMenu.canvasX}
            canvasY={contextMenu.canvasY}
            onClose={() => setContextMenu(null)}
            onAction={onAction!}
            canUndo={canUndo}
            canRedo={canRedo}
            hasSelection={shapes.some(s => s.isSelected) || connectors.some(c => c.isSelected)}
            hasClipboard={hasClipboard}
            selectedCount={shapes.filter(s => s.isSelected).length}
          />
        )}
      </div>
    </div>
  );
};

export default CircuitCanvas;

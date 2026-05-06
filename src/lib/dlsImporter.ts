
import { Shape, Connector, ShapeType, Point, CircuitData, ConnectionPoint } from '../types';
import { createShape } from './circuitUtils';

interface DLSPin {
  Name: string;
  ID: number;
  Position: Point;
  BitCount?: number;
}

interface DLSSubChip {
  Name: string;
  ID: number;
  Label: string;
  Position: Point;
  OutputPinColourInfo?: { PinID: number }[];
}

interface DLSWire {
  SourcePinAddress: { PinID: number; PinOwnerID: number };
  TargetPinAddress: { PinID: number; PinOwnerID: number };
}

interface DLSData {
  Name: string;
  InputPins: DLSPin[];
  OutputPins: DLSPin[];
  SubChips: DLSSubChip[];
  Wires: DLSWire[];
}

export const parseDLSCirc = (jsonString: string): CircuitData => {
  const dls: DLSData = JSON.parse(jsonString);
  const shapes: Shape[] = [];
  const connectors: Connector[] = [];
  
  // DLS units are roughly 20-40 pixels
  const scale = 35;
  
  const idMap: Record<number, string> = {}; // DLS Owner ID -> App Shape ID
  const ownerToShape: Record<number, Shape> = {};
  
  // Map to store discovered pins for each owner
  // Key: ownerID -> { inputs: Set<pinID>, outputs: Set<pinID> }
  const discoveredPins: Record<number, { inputs: Set<number>, outputs: Set<number> }> = {};

  // Initialize discovered pins for all subchips
  dls.SubChips.forEach(sc => {
    discoveredPins[sc.ID] = { inputs: new Set(), outputs: new Set() };
    if (sc.OutputPinColourInfo) {
      sc.OutputPinColourInfo.forEach(p => discoveredPins[sc.ID].outputs.add(p.PinID));
    }
  });

  // Also for top-level pins which act as owners in wires
  dls.InputPins.forEach(p => discoveredPins[p.ID] = { inputs: new Set(), outputs: new Set([0, p.ID]) });
  dls.OutputPins.forEach(p => discoveredPins[p.ID] = { inputs: new Set([0, p.ID]), outputs: new Set() });

  // Pass 1: Scan wires to find all pins
  dls.Wires.forEach(w => {
    const srcO = w.SourcePinAddress.PinOwnerID;
    const srcP = w.SourcePinAddress.PinID;
    const tgtO = w.TargetPinAddress.PinOwnerID;
    const tgtP = w.TargetPinAddress.PinID;

    if (!discoveredPins[srcO]) discoveredPins[srcO] = { inputs: new Set(), outputs: new Set() };
    discoveredPins[srcO].outputs.add(srcP);

    if (!discoveredPins[tgtO]) discoveredPins[tgtO] = { inputs: new Set(), outputs: new Set() };
    discoveredPins[tgtO].inputs.add(tgtP);
  });

  // Mapping for individual pins within shapes
  // Key: ownerID:pinID -> { type: 'input'|'output', index: number }
  const pinMapping: Record<string, { type: 'input' | 'output', index: number }> = {};

  // Helper to get sorted indices for pins
  const mapPinsToIndices = (ownerID: number, type: 'input' | 'output', pinIDs: Set<number>) => {
    const sorted = Array.from(pinIDs).sort((a, b) => a - b);
    sorted.forEach((pID, idx) => {
      pinMapping[`${ownerID}:${pID}`] = { type, index: idx };
    });
    return sorted.length;
  };

  // 1. Process top-level Inputs
  dls.InputPins.forEach(p => {
    const shape = createShape('InputL', p.Position.x * scale, p.Position.y * scale);
    shape.label = p.Name;
    shapes.push(shape);
    idMap[p.ID] = shape.id;
    ownerToShape[p.ID] = shape;
    mapPinsToIndices(p.ID, 'output', discoveredPins[p.ID].outputs);
  });

  // 2. Process top-level Outputs
  dls.OutputPins.forEach(p => {
    const shape = createShape('OutPutL', p.Position.x * scale, p.Position.y * scale);
    shape.label = p.Name;
    shapes.push(shape);
    idMap[p.ID] = shape.id;
    ownerToShape[p.ID] = shape;
    mapPinsToIndices(p.ID, 'input', discoveredPins[p.ID].inputs);
  });

  // 3. Process SubChips (Gates/Blocks)
  dls.SubChips.forEach(sc => {
    const name = sc.Name.trim().toLowerCase();
    let type: ShapeType = 'CustomBlock';
    
    // Basic mapping
    if (name === 'and') type = 'AND';
    else if (name === 'or') type = 'OR';
    else if (name === 'not') type = 'NOT';
    else if (name === 'nand') type = 'NAND';
    else if (name === 'nor') type = 'NOR';
    else if (name === 'xor') type = 'XOR';
    else if (name === 'xnor') type = 'XNOR';
    else if (name === 'buffer') type = 'Buffer';
    else if (name.includes('3-state') || name.includes('tri-state') || name.includes('three-state')) type = 'ThreeState';
    else if (name.includes('d-ff') || name.includes('d flip-flop') || name === 'dff') type = 'D_Flip_Flop';
    else if (name.includes('jk-ff') || name.includes('jk flip-flop') || name === 'jkff') type = 'JK_Flip_Flop';
    else if (name.includes('sr-ff') || name.includes('sr flip-flop') || name === 'srff') type = 'SR_Flip_Flop';
    else if (name.includes('t-ff') || name.includes('t flip-flop') || name === 'tff') type = 'T_Flip_Flop';
    else if (name.includes('d-latch') || name.includes('d latch')) type = 'D_Latch';
    else if (name.includes('sr-latch') || name.includes('sr latch')) type = 'SR_Latch';
    else if (name.includes('1bit fa') || name.includes('full adder')) type = 'Full_Adder';
    else if (name.includes('half adder')) type = 'Half_Adder';
    
    const shape = createShape(type, sc.Position.x * scale, sc.Position.y * scale);
    shape.label = sc.Label || sc.Name;
    shapes.push(shape);
    idMap[sc.ID] = shape.id;
    ownerToShape[sc.ID] = shape;

    const inCount = mapPinsToIndices(sc.ID, 'input', discoveredPins[sc.ID].inputs);
    const outCount = mapPinsToIndices(sc.ID, 'output', discoveredPins[sc.ID].outputs);

    // If it's a CustomBlock or has non-standard pin counts, rebuild pins
    if (type === 'CustomBlock' || shape.inputs.length !== inCount || shape.outputs.length !== outCount) {
      shape.inputs = Array.from({ length: inCount }, (_, i) => ({
        x: 0,
        y: 10 + i * 20,
        label: `IN${i}`,
        value: 0
      }));
      shape.outputs = Array.from({ length: outCount }, (_, i) => ({
        x: shape.width,
        y: 10 + i * 20,
        label: `OUT${i}`,
        value: 0
      }));
      // Adjust size for many pins
      shape.height = Math.max(shape.height, Math.max(inCount, outCount) * 20 + 20);
    }
  });

  // 4. Resolve wires
  dls.Wires.forEach(w => {
    const srcOwner = w.SourcePinAddress.PinOwnerID;
    const srcPin = w.SourcePinAddress.PinID;
    const tgtOwner = w.TargetPinAddress.PinOwnerID;
    const tgtPin = w.TargetPinAddress.PinID;

    const src = pinMapping[`${srcOwner}:${srcPin}`];
    const tgt = pinMapping[`${tgtOwner}:${tgtPin}`];

    if (src && tgt && idMap[srcOwner] && idMap[tgtOwner]) {
      connectors.push({
        id: `dls-conn-${Math.random().toString(36).substr(2, 6)}`,
        startShapeId: idMap[srcOwner],
        startOutputIndex: src.index,
        endShapeId: idMap[tgtOwner],
        endInputIndex: tgt.index
      });
    }
  });

  // Center the circuit
  if (shapes.length > 0) {
    const minX = Math.min(...shapes.map(s => s.x));
    const minY = Math.min(...shapes.map(s => s.y));
    shapes.forEach(s => {
      s.x -= minX - 150;
      s.y -= minY - 150;
    });
  }

  return { fileName: dls.Name || 'Imported DLS', shapes, connectors };
};

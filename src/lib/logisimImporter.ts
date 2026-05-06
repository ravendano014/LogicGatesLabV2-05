
import { Shape, Connector, ShapeType, Point } from '../types';
import { createShape } from './circuitUtils';

interface LogisimComp {
  name: string;
  lib: string;
  loc: Point;
  attrs: Record<string, string>;
}

interface LogisimWire {
  from: Point;
  to: Point;
}


export const parseLogisimCirc = (xmlString: string): { shapes: Shape[], connectors: Connector[], bounds: { minX: number, minY: number, maxX: number, maxY: number } } => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
  const libMap: Record<string, string> = {};
  xmlDoc.querySelectorAll("lib").forEach(lib => {
    const name = lib.getAttribute("name");
    const desc = lib.getAttribute("desc");
    if (name && desc) libMap[name] = desc;
  });

  const mainTag = xmlDoc.querySelector("main");
  const mainName = mainTag?.getAttribute("name");
  
  let circuit: Element | null = null;
  if (mainName) {
    circuit = xmlDoc.querySelector(`circuit[name="${mainName}"]`);
  }
  if (!circuit) circuit = xmlDoc.querySelector("circuit");
  if (!circuit) throw new Error("No circuit found in .circ file");

  const allCircuits = Array.from(xmlDoc.querySelectorAll("circuit"));
  const circuitMap: Record<string, Element> = {};
  allCircuits.forEach(c => {
    const name = c.getAttribute("name");
    if (name) circuitMap[name] = c;
  });

  const logisimComps: LogisimComp[] = [];
  const logisimWires: LogisimWire[] = [];
  const logisimJunctions: Point[] = [];

  circuit.querySelectorAll("comp").forEach(comp => {
    const name = comp.getAttribute("name") || "";
    const lib = comp.getAttribute("lib") || "";
    const loc = parseLoc(comp.getAttribute("loc") || "(0,0)");
    const attrs: Record<string, string> = {};
    comp.querySelectorAll("a").forEach(a => {
      const attrName = a.getAttribute("name");
      const attrVal = a.getAttribute("val");
      if (attrName && attrVal) attrs[attrName] = attrVal;
    });
    logisimComps.push({ name, lib, loc, attrs });
  });

  circuit.querySelectorAll("wire").forEach(wire => {
    const from = parseLoc(wire.getAttribute("from") || "(0,0)");
    const to = parseLoc(wire.getAttribute("to") || "(0,0)");
    if (from.x !== to.x || from.y !== to.y) {
      logisimWires.push({ from, to });
    }
  });

  circuit.querySelectorAll("junction").forEach(j => {
    logisimJunctions.push(parseLoc(j.getAttribute("pos") || "(0,0)"));
  });

  const shapes: Shape[] = [];
  const allPins: { shapeId: string, type: 'input' | 'output', index: number, x: number, y: number }[] = [];

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  logisimComps.forEach((lc) => {
    let typeInfo = mapLogisimType(lc, libMap);
    if (!typeInfo && circuitMap[lc.name]) typeInfo = { type: 'CustomBlock' };
    if (!typeInfo) return;

    const shape = createShape(typeInfo.type, lc.loc.x, lc.loc.y);
    shape.label = lc.attrs.label || lc.attrs.text || lc.name || shape.label;
    
    minX = Math.min(minX, lc.loc.x);
    minY = Math.min(minY, lc.loc.y);
    maxX = Math.max(maxX, lc.loc.x);
    maxY = Math.max(maxY, lc.loc.y);

    const pinCoords = getLogisimPinCoords(lc, typeInfo.type);
    
    // Calculate bounding box of pins to determine shape position and size
    // We add {0,0} because it's usually the output or a reference point in Logisim
    const allRelPoints = [...pinCoords.inputs, ...pinCoords.outputs, { x: 0, y: 0 }];
    const relMinX = Math.min(...allRelPoints.map(p => p.x));
    const relMaxX = Math.max(...allRelPoints.map(p => p.x));
    const relMinY = Math.min(...allRelPoints.map(p => p.y));
    const relMaxY = Math.max(...allRelPoints.map(p => p.y));

    // Pad the box a bit for visual comfort
    const padding = 20;
    shape.x = lc.loc.x + relMinX - padding;
    shape.y = lc.loc.y + relMinY - padding;
    shape.width = (relMaxX - relMinX) + 2 * padding;
    shape.height = (relMaxY - relMinY) + 2 * padding;

    // Relative Pin visual mapping for the App's UI (local to the shape box)
    shape.inputs = pinCoords.inputs.map((p, i) => ({
      x: (lc.loc.x + p.x) - shape.x,
      y: (lc.loc.y + p.y) - shape.y,
      label: `in_${i}`,
      value: 0,
      name: `in_${i}`
    }));

    shape.outputs = pinCoords.outputs.map((p, i) => ({
      x: (lc.loc.x + p.x) - shape.x,
      y: (lc.loc.y + p.y) - shape.y,
      label: `out_${i}`,
      value: 0,
      name: `out_${i}`
    }));

    // Collect absolute pin coordinates for connectivity logic
    pinCoords.inputs.forEach((p, i) => allPins.push({ shapeId: shape.id, type: 'input', index: i, x: lc.loc.x + p.x, y: lc.loc.y + p.y }));
    pinCoords.outputs.forEach((p, i) => allPins.push({ shapeId: shape.id, type: 'output', index: i, x: lc.loc.x + p.x, y: lc.loc.y + p.y }));

    shapes.push(shape);
  });

  console.group("Logisim Import Detail");
  console.log("Components:", logisimComps.map(c => `${c.name} at (${c.loc.x}, ${c.loc.y})`).join(", "));
  console.log("Wires:", logisimWires.map(w => `(${w.from.x}, ${w.from.y}) to (${w.to.x}, ${w.to.y})`).join(", "));

  // connectivity resolution using DSU on points of interest (POIs)
  const pois = new Set<string>();
  logisimWires.forEach(w => { 
    pois.add(`${w.from.x},${w.from.y}`); 
    pois.add(`${w.to.x},${w.to.y}`); 
  });
  logisimJunctions.forEach(j => pois.add(`${j.x},${j.y}`));
  allPins.forEach(p => pois.add(`${p.x},${p.y}`));

  const poiArray = Array.from(pois);
  const parent: Record<string, string> = {};
  poiArray.forEach(p => parent[p] = p);

  const find = (c: string): string => {
    if (!parent[c]) parent[c] = c;
    if (parent[c] === c) return c;
    return parent[c] = find(parent[c]);
  };

  const union = (c1: string, c2: string) => {
    const root1 = find(c1);
    const root2 = find(c2);
    if (root1 !== root2) parent[root1] = root2;
  };

  const isPointOnSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    if (y1 === y2) { // Horizontal
      return py === y1 && px >= Math.min(x1, x2) && px <= Math.max(x1, x2);
    }
    if (x1 === x2) { // Vertical
      return px === x1 && py >= Math.min(y1, y2) && py <= Math.max(y1, y2);
    }
    return false;
  };

  console.group("Logisim Import Trace");
  console.log("Processing", shapes.length, "shapes and", logisimWires.length, "wires.");

  // 1. Union endpoints
  logisimWires.forEach(w => {
    union(`${w.from.x},${w.from.y}`, `${w.to.x},${w.to.y}`);
  });

  // 2. Union POIs (pins/endpoints) that touch wire segments
  logisimWires.forEach(w => {
    const startKey = `${w.from.x},${w.from.y}`;
    const horizontal = w.from.y === w.to.y;
    const vertical = w.from.x === w.to.x;

    poiArray.forEach(poiStr => {
      const [px, py] = poiStr.split(',').map(Number);
      if (horizontal) {
          if (py === w.from.y && px >= Math.min(w.from.x, w.to.x) && px <= Math.max(w.from.x, w.to.x)) {
              union(startKey, poiStr);
          }
      } else if (vertical) {
          if (px === w.from.x && py >= Math.min(w.from.y, w.to.y) && py <= Math.max(w.from.y, w.to.y)) {
              union(startKey, poiStr);
          }
      }
    });
  });

  // 3. Tunnels
  const tunnels: Record<string, string[]> = {};
  logisimComps.forEach(lc => {
    if (lc.name === "Tunnel") {
      const label = lc.attrs.label || "default";
      if (!tunnels[label]) tunnels[label] = [];
      tunnels[label].push(`${lc.loc.x},${lc.loc.y}`);
    }
  });
  Object.values(tunnels).forEach(coords => {
    for (let i = 0; i < coords.length - 1; i++) {
        union(coords[i], coords[i+1]);
    }
  });

  // 4. Junctions (Explicitly union endpoints of wires sharing a junction)
  logisimJunctions.forEach(j => {
      const jKey = `${j.x},${j.y}`;
      logisimWires.forEach(w => {
          if (isPointOnSegment(j.x, j.y, w.from.x, w.from.y, w.to.x, w.to.y)) {
              union(jKey, `${w.from.x},${w.from.y}`);
          }
      });
  });

  // Resolve nets
  const connectors: Connector[] = [];
  const nets: Record<string, { inputs: typeof allPins, outputs: typeof allPins }> = {};

  poiArray.forEach(pStr => {
    const root = find(pStr);
    if (!nets[root]) nets[root] = { inputs: [], outputs: [] };
    
    const [px, py] = pStr.split(',').map(Number);
    const matchingPins = allPins.filter(p => p.x === px && p.y === py);
    matchingPins.forEach(p => {
      if (p.type === 'output') nets[root].outputs.push(p);
      else nets[root].inputs.push(p);
    });
  });

  const connectorKeySet = new Set<string>();
  Object.keys(nets).forEach(root => {
    const net = nets[root];
    if (net.outputs.length > 0 && net.inputs.length > 0) {
      net.outputs.forEach(out => {
        net.inputs.forEach(inp => {
          if (out.shapeId === inp.shapeId) return;
          const key = `${out.shapeId}:${out.index}->${inp.shapeId}:${inp.index}`;
          if (!connectorKeySet.has(key)) {
            connectors.push({
              id: `conn-${Math.random().toString(36).substr(2, 6)}`,
              startShapeId: out.shapeId,
              startOutputIndex: out.index,
              endShapeId: inp.shapeId,
              endInputIndex: inp.index
            });
            connectorKeySet.add(key);
          }
        });
      });
    }
  });

  console.log("Resulting Connections:", connectors.map(c => `${c.startShapeId} -> ${c.endShapeId}`).join(", "));
  console.groupEnd();

  if (minX === Infinity) {
    minX = 0; minY = 0; maxX = 400; maxY = 400;
  }
  return { shapes, connectors, bounds: { minX, minY, maxX, maxY } };
};

const parseLoc = (loc: string): Point => {
  const match = loc.match(/\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/);
  if (match) {
    return { x: parseInt(match[1]), y: parseInt(match[2]) };
  }
  return { x: 0, y: 0 };
};

const mapLogisimType = (lc: LogisimComp, libMap: Record<string, string>): { type: ShapeType } | null => {
  const { name, lib, attrs } = lc;
  const libDesc = libMap[lib] || lib;
  
  if (libDesc === "#Wiring" || lib === "0" || lib === "") { // Wiring
    if (name === "Pin") {
      if (attrs.output === "true") return { type: 'OutPutL' };
      return { type: 'InputL' };
    }
    if (name === "Clock") return { type: 'Clock' };
    if (name === "Constant") {
      return attrs.value === "0x1" ? { type: 'HighConstant' } : { type: 'LowConstant' };
    }
    if (name === "Probe") return { type: 'Probe' };
    if (name === "Splitter") return { type: 'Splitter' };
    if (name === "Ground") return { type: 'GND' };
  }
  
  if (libDesc === "#Gates" || lib === "1") { // Gates
    const inputs = attrs.inputs || "2";
    if (name === "AND Gate") {
        if (inputs === "3") return { type: 'AND3' };
        if (inputs === "4") return { type: 'AND4' };
        if (inputs === "5") return { type: 'AND5' };
        return { type: 'AND' };
    }
    if (name === "OR Gate") {
        if (inputs === "3") return { type: 'OR3' };
        if (inputs === "4") return { type: 'OR4' };
        if (inputs === "5") return { type: 'OR5' };
        return { type: 'OR' };
    }
    if (name === "NAND Gate") {
        if (inputs === "3") return { type: 'NAND3' };
        if (inputs === "4") return { type: 'NAND4' };
        return { type: 'NAND' };
    }
    if (name === "NOR Gate") {
        if (inputs === "3") return { type: 'NOR3' };
        if (inputs === "4") return { type: 'NOR4' };
        return { type: 'NOR' };
    }
    if (name === "NOT Gate") return { type: 'NOT' };
    if (name === "XOR Gate") {
        if (inputs === "3") return { type: 'XOR3' };
        if (inputs === "4") return { type: 'XOR4' };
        return { type: 'XOR' };
    }
    if (name === "XNOR Gate") return { type: 'XNOR' };
    if (name === "Buffer") return { type: 'Buffer' };
    if (name === "Controlled Buffer") return { type: 'ThreeState' };
  }

  if (libDesc === "#Base" || lib === "6") {
    if (name === "Text") return { type: 'Text' };
  }

  if (libDesc === "#Plexers" || lib === "2") { // Plexers
    if (name === "Multiplexer") return { type: 'Multiplexer_Gen' };
    if (name === "Demultiplexer") return { type: 'Demultiplexer_Gen' };
    if (name === "Decoder") return { type: 'Decoder_Gen' };
    if (name === "Priority Encoder") return { type: 'PriorityEncoder_Gen' };
    if (name === "Bit Selector") return { type: 'BitSelector_Gen' };
  }

  if (libDesc === "#Arithmetic" || lib === "3") { // Arithmetic
    if (name === "Adder") return { type: 'Full_Adder' };
    if (name === "Comparator") return { type: 'Comparator' };
    if (name === "Multiplier") return { type: 'MUL1' };
  }

  if (libDesc === "#Memory" || lib === "4") { // Memory
    if (name === "D Flip-Flop") return { type: 'D_Flip_Flop' };
    if (name === "JK Flip-Flop") return { type: 'JK_Flip_Flop' };
    if (name === "SR Flip-Flop") return { type: 'SR_Flip_Flop' };
    if (name === "T Flip-Flop") return { type: 'T_Flip_Flop' };
    if (name === "D Latch") return { type: 'D_Latch' };
    if (name === "Register") return { type: 'Register_8bit' };
    if (name === "Counter") return { type: 'Counter_Gen' };
    if (name === "RAM") return { type: 'RAM_8x8' };
    if (name === "ROM") return { type: 'ROM' };
  }

  if (libDesc === "#I/O" || lib === "5") { // I/O
    if (name === "7-Segment Display") return { type: 'Display7Segment' };
    if (name === "Hex Digit Display") return { type: 'DisplayBCD' };
    if (name === "LED") return { type: 'LED' };
    if (name === "Button") return { type: 'PushButton' };
  }

  // 7400 Series and others
  const icMatch = name.match(/(74[HLSC]*\d{2,3}|555|7000)/i);
  const cleanName = icMatch ? icMatch[1].toUpperCase().replace(/LS|HC|HCT|C|L|F|ALS|S|AS/, '') : name;
  
  if (cleanName === "7400") return { type: 'IC7400' };
  if (cleanName === "7402") return { type: 'IC7402' };
  if (cleanName === "7404") return { type: 'IC7404' };
  if (cleanName === "7408") return { type: 'IC7408' };
  if (cleanName === "7410") return { type: 'IC7410' };
  if (cleanName === "7420") return { type: 'IC7420' };
  if (cleanName === "7430") return { type: 'IC7430' };
  if (cleanName === "7432") return { type: 'IC7432' };
  if (cleanName === "7486") return { type: 'IC7486' };
  if (cleanName === "74107") return { type: 'IC74107' };
  if (cleanName === "74138") return { type: 'IC74138' };
  if (cleanName === "74139") return { type: 'IC74139' };
  if (cleanName === "74151") return { type: 'IC74151' };
  if (cleanName === "74153") return { type: 'IC74153' };
  if (cleanName === "74160") return { type: 'IC74160' };
  if (cleanName === "74161") return { type: 'IC74161' };
  if (cleanName === "74173") return { type: 'IC74173' };
  if (cleanName === "74175") return { type: 'IC74175' };
  if (cleanName === "7448") return { type: 'IC7448' };
  if (cleanName === "7485") return { type: 'IC7485' };
  if (cleanName === "74147") return { type: 'IC74147' };
  if (cleanName === "74148") return { type: 'IC74148' };
  if (cleanName === "74181") return { type: 'IC74181' };
  if (cleanName === "7490") return { type: 'IC7490' };
  if (cleanName === "7493") return { type: 'IC7493' };
  if (cleanName === "74192") return { type: 'IC74192' };
  if (cleanName === "74193") return { type: 'IC74193' };
  if (cleanName === "74HC595") return { type: 'IC74HC595' };
  if (cleanName === "555") return { type: 'IC555' };
  if (cleanName === "7000") return { type: 'IC_TD7000' };

  return null;
};


// Robust Logisim pin coordinate mapping based on component standards
const getLogisimPinCoords = (lc: LogisimComp, type: ShapeType): { inputs: Point[], outputs: Point[] } => {
  const { attrs } = lc;
  const facing = attrs.facing || "east";
  
  const rotate = (p: Point): Point => {
    if (facing === "west") return { x: -p.x, y: -p.y }; // 180 deg
    if (facing === "north") return { x: p.y, y: -p.x }; // 90 deg CCW
    if (facing === "south") return { x: -p.y, y: p.x }; // 90 deg CW
    return p; // east
  };

  // Standard Gates logic
  if (["AND Gate", "OR Gate", "NAND Gate", "NOR Gate", "XOR Gate", "XNOR Gate"].includes(lc.name)) {
    const inputs: Point[] = [];
    const inputCount = parseInt(attrs.inputs || "2");
    const gateSize = parseInt(attrs.size || "50");
    
    let spacing = 10;
    if (gateSize >= 50 && inputCount <= 3) spacing = 20;
    
    for (let i = 0; i < inputCount; i++) {
        let offset = 0;
        if (inputCount % 2 === 0) {
            // Even counts skip the center to stay on grid
            const half = inputCount / 2;
            offset = (i < half) ? (i - half) * spacing : (i - half + 1) * spacing;
        } else {
            // Odd counts are centered on zero
            offset = (i - (inputCount - 1) / 2) * spacing;
        }
        inputs.push(rotate({ x: -gateSize, y: offset }));
    }
    
    return {
      inputs,
      outputs: [rotate({ x: 0, y: 0 })] 
    };
  }

  if (lc.name === "NOT Gate") {
    const s = parseInt(attrs.size || "30");
    return { 
      inputs: [rotate({ x: -s, y: 0 })], 
      outputs: [rotate({ x: 0, y: 0 })] 
    };
  }

  if (lc.name === "Converter") {
      return { inputs: [rotate({ x: -20, y: 0 })], outputs: [rotate({ x: 0, y: 0 })] };
  }

  if (lc.name === "D Flip-Flop" || lc.name === "JK Flip-Flop" || lc.name === "SR Flip-Flop" || lc.name === "T Flip-Flop" || lc.name === "D Latch") {
    const inputs: Point[] = [];
    const outputs: Point[] = [rotate({ x: 0, y: 0 })]; // Q
    outputs.push(rotate({ x: 0, y: 20 })); // Not Q

    if (lc.name === "D Flip-Flop" || lc.name === "D Latch") {
        inputs.push(rotate({ x: -40, y: 0 })); // D
    } else if (lc.name === "JK Flip-Flop") {
        inputs.push(rotate({ x: -40, y: 0 })); // J
        inputs.push(rotate({ x: -40, y: 20 })); // K
    } else if (lc.name === "SR Flip-Flop") {
        inputs.push(rotate({ x: -40, y: 0 })); // S
        inputs.push(rotate({ x: -40, y: 20 })); // R
    } else if (lc.name === "T Flip-Flop") {
        inputs.push(rotate({ x: -40, y: 10 })); // T
    }

    inputs.push(rotate({ x: -40, y: 10 })); // Clock (default position)
    // Pre/Clr
    inputs.push(rotate({ x: -20, y: -10 })); // Preset
    inputs.push(rotate({ x: -20, y: 30 }));  // Clear
    
    return { inputs, outputs };
  }

  if (lc.name === "Adder" || lc.name === "Subtracter" || lc.name === "Multiplier" || lc.name === "Divider") {
      const inputs = [
          rotate({ x: -40, y: -10 }), // In A
          rotate({ x: -40, y: 10 }),  // In B
      ];
      const outputs = [rotate({ x: 0, y: 0 })]; // Main Result
      
      if (lc.name === "Adder" || lc.name === "Subtracter") {
          inputs.push(rotate({ x: -20, y: -20 })); // Carry/Borrow In
          outputs.push(rotate({ x: -20, y: 20 })); // Carry/Borrow Out
      } else if (lc.name === "Divider") {
          outputs.push(rotate({ x: -20, y: 20 })); // Remainder
      } else if (lc.name === "Multiplier") {
          inputs.push(rotate({ x: -20, y: -20 })); // Carry High In
          outputs.push(rotate({ x: -20, y: 20 })); // Carry High Out
      }
      return { inputs, outputs };
  }

  if (lc.name === "Negator" || lc.name === "Bit Adder") {
      return { inputs: [rotate({ x: -40, y: 0 })], outputs: [rotate({ x: 0, y: 0 })] };
  }

  if (lc.name === "Shifter") {
      return {
          inputs: [
              rotate({ x: -40, y: -10 }), // Data
              rotate({ x: -20, y: 20 })   // Distance
          ],
          outputs: [rotate({ x: 0, y: 0 })]
      };
  }

  if (lc.name === "Shift Register") {
      return {
          inputs: [
              rotate({ x: -40, y: 0 }),  // Data In
              rotate({ x: -20, y: 20 }), // Clock
              rotate({ x: -10, y: 20 })  // Load
          ],
          outputs: [rotate({ x: 0, y: 0 })] // Data Out
      }
  }

  if (lc.name === "Comparator") {
      return {
          inputs: [rotate({ x: -40, y: -10 }), rotate({ x: -40, y: 10 })],
          outputs: [rotate({ x: 0, y: -10 }), rotate({ x: 0, y: 0 }), rotate({ x: 0, y: 10 })]
      };
  }

  if (lc.name === "Buffer" || lc.name === "Controlled Buffer") {
    const s = parseInt(attrs.size || "30");
    const inputs = [rotate({ x: -s, y: 0 })];
    if (lc.name === "Controlled Buffer") {
      // Control pin is usually at bottom/side midway
      inputs.push(rotate({ x: -s/2, y: 10 })); 
    }
    return { inputs, outputs: [rotate({ x: 0, y: 0 })] };
  }

  if (lc.name === "Pin") {
      if (attrs.output === "true") {
          return { inputs: [rotate({ x: 0, y: 0 })], outputs: [] };
      } else {
          return { inputs: [], outputs: [rotate({ x: 0, y: 0 })] };
      }
  }

  if (lc.name === "Clock" || lc.name === "Constant" || lc.name === "Ground") {
      return { inputs: [], outputs: [rotate({ x: 0, y: 0 })] };
  }

  if (lc.name === "Probe") {
    return { inputs: [rotate({ x: 0, y: 0 })], outputs: [] };
  }

  if (lc.name === "Register") {
    const dataWidth = parseInt(attrs.width || "8");
    return {
        inputs: [
            rotate({ x: -40, y: 0 }),  // Data In
            rotate({ x: -30, y: 20 }), // Clock
            rotate({ x: -20, y: 20 }), // Clear
            rotate({ x: -10, y: 20 })  // Enable
        ],
        outputs: [rotate({ x: 0, y: 0 })] // Data Out
    };
  }

  if (lc.name === "Counter") {
    return {
        inputs: [
            rotate({ x: -40, y: 0 }),  // Load Data
            rotate({ x: -30, y: 20 }), // Clock
            rotate({ x: -25, y: 20 }), // Clear
            rotate({ x: -20, y: 20 }), // Load
            rotate({ x: -15, y: 20 }), // Enable
            rotate({ x: -10, y: 20 })  // Up/Down
        ],
        outputs: [rotate({ x: 0, y: 0 })]
    };
  }

  if (lc.name === "RAM" || lc.name === "ROM") {
     const addrWidth = parseInt(attrs.addrWidth || "8");
     const dataWidth = parseInt(attrs.dataWidth || "8");
     const isRAM = lc.name === "RAM";
     
     const inputs: Point[] = [
         rotate({ x: -80, y: 0 }), // A (Address)
     ];
     const outputs: Point[] = [
         rotate({ x: 0, y: 0 })   // D (Data out/in)
     ];

     if (isRAM) {
         // RAM bottom pins: clk, sel, en (write), clr, out (enable)
         inputs.push(rotate({ x: -60, y: 40 })); // clk
         inputs.push(rotate({ x: -50, y: 40 })); // sel
         inputs.push(rotate({ x: -40, y: 40 })); // en (write)
         inputs.push(rotate({ x: -30, y: 40 })); // clr
         inputs.push(rotate({ x: -20, y: 40 })); // out (oe)
     } else {
         // ROM bottom pins: sel
         inputs.push(rotate({ x: -40, y: 40 })); // sel
     }
     
     return { inputs, outputs };
  }

  if (lc.name === "Splitter") {
    const fanout = parseInt(attrs.fanout || "2");
    const incoming: Point[] = [{ x: 0, y: 0 }];
    const outgoing: Point[] = [];
    const appearance = attrs.appear || "left"; 
    const spacing = 10;
    
    for (let i = 0; i < fanout; i++) {
        let offset = 0;
        if (appearance === "left") offset = -i * spacing;
        else if (appearance === "right") offset = i * spacing;
        else {
            // center appearance
            if (fanout % 2 === 0) {
                const half = fanout / 2;
                offset = (i < half) ? (i - half) * spacing : (i - half + 1) * spacing;
            } else {
                offset = (i - (fanout - 1) / 2) * spacing;
            }
        }
        
        outgoing.push(rotate({ x: 20, y: offset }));
    }
    
    // Splitters are passive: all pins can act as drivers or receivers in our connection model.
    const all = [...incoming, ...outgoing];
    return { inputs: all, outputs: all };
  }

  if (lc.name === "Bit Selector") {
    return {
      inputs: [
        rotate({ x: -20, y: 0 }), // Data
        rotate({ x: -20, y: 20 }) // Select
      ],
      outputs: [rotate({ x: 0, y: 0 })]
    };
  }

  if (lc.name === "Multiplexer" || lc.name === "Demultiplexer") {
    const select = parseInt(attrs.select || "1");
    const inputCount = 1 << select;
    const width = 40;
    const spacing = 10;
    const inputs: Point[] = [];
    const outputs: Point[] = [];
    
    if (lc.name === "Multiplexer") {
        for (let i = 0; i < inputCount; i++) {
            const offset = (i - (inputCount - 1) / 2) * spacing;
            inputs.push(rotate({ x: -width, y: offset }));
        }
        // Select pins at the bottom
        for (let i = 0; i < select; i++) {
            const selOffset = (i - (select - 1) / 2) * 10;
            inputs.push(rotate({ x: -width/2 + selOffset, y: (inputCount/2) * spacing + 10 })); 
        }
        outputs.push(rotate({ x: 0, y: 0 }));
    } else {
        for (let i = 0; i < inputCount; i++) {
            const offset = (i - (inputCount - 1) / 2) * spacing;
            outputs.push(rotate({ x: 0, y: offset }));
        }
        inputs.push(rotate({ x: -width, y: 0 }));
        // Select pins at the bottom
        for (let i = 0; i < select; i++) {
            const selOffset = (i - (select - 1) / 2) * 10;
            inputs.push(rotate({ x: -width/2 + selOffset, y: (inputCount/2) * spacing + 10 })); 
        }
    }
    return { inputs, outputs };
  }

  if (lc.name === "Decoder" || lc.name === "Encoder" || lc.name === "Priority Encoder") {
    const select = parseInt(attrs.select || "1");
    const inputCount = (lc.name === "Decoder") ? 0 : (1 << select);
    const outputCount = (lc.name === "Decoder") ? (1 << select) : 0;
    const width = 40;
    const spacing = 10;
    const inputs: Point[] = [];
    const outputs: Point[] = [];
    
    if (lc.name === "Decoder") {
        for (let i = 0; i < outputCount; i++) {
            const offset = (i - (outputCount - 1) / 2) * spacing;
            outputs.push(rotate({ x: 0, y: offset }));
        }
        for (let i = 0; i < select; i++) {
            const selOffset = (i - (select - 1) / 2) * 10;
            inputs.push(rotate({ x: -width/2 + selOffset, y: (outputCount/2) * spacing + 10 }));
        }
        inputs.push(rotate({ x: -width, y: 0 })); // Enable
    } else {
        for (let i = 0; i < inputCount; i++) {
            const offset = (i - (inputCount - 1) / 2) * spacing;
            inputs.push(rotate({ x: -width, y: offset }));
        }
        for (let i = 0; i < select; i++) {
            const selOffset = (i - (select - 1) / 2) * 10;
            outputs.push(rotate({ x: 0, y: selOffset }));
        }
        if (lc.name === "Priority Encoder") {
            outputs.push(rotate({ x: 0, y: (select / 2) * 10 + 10 })); // GS
        }
    }
    return { inputs, outputs };
  }

  // 7400 Series ICs - Logic Mapping for DIP Package Pins
  const icMatch = lc.name.match(/(74[HLSC]*\d{2,3}|555|7000)/i);
  const cleanName = icMatch ? icMatch[1].toUpperCase().replace(/LS|HC|HCT|C|L|F|ALS|S|AS/, '') : lc.name;
    
  if (cleanName.startsWith('74') || cleanName === '555' || cleanName === '7000') {
    let pinCount = 14;
    const inputs: Point[] = [];
    const outputs: Point[] = [];
    
    // DIP Pin Coordinate Generator
    const getPinLoc = (pin: number, total: number) => {
        if (pin <= total / 2) return rotate({ x: (pin - 1) * 10, y: 30 });
        return rotate({ x: (total - pin) * 10, y: 0 });
    };

    if (["7400", "7402", "7408", "7432", "7486"].includes(cleanName)) {
        pinCount = 14;
        // Our App Layout: Inputs [1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, VCC, GND], Outputs [1Y, 2Y, 3Y, 4Y]
        // Standard DIP-14 for these: 
        // 1:1A, 2:1B, 3:1Y, 4:2A, 5:2B, 6:2Y, 7:GND, 8:3Y, 9:3A, 10:3B, 11:4Y, 12:4A, 13:4B, 14:VCC
        const ipins = [1, 2, 4, 5, 9, 10, 12, 13, 14, 7];
        const opins = [3, 6, 8, 11];
        if (cleanName === "7402") { // 7402 is different: 1:1Y, 2:1A, 3:1B, 4:2Y, 5:2A, 6:2B...
            const ipins02 = [2, 3, 5, 6, 8, 9, 11, 12, 14, 7];
            const opins02 = [1, 4, 10, 13];
            ipins02.forEach(p => inputs.push(getPinLoc(p, 14)));
            opins02.forEach(p => outputs.push(getPinLoc(p, 14)));
        } else {
            ipins.forEach(p => inputs.push(getPinLoc(p, 14)));
            opins.forEach(p => outputs.push(getPinLoc(p, 14)));
        }
    } else if (cleanName === "7404") {
        pinCount = 14;
        // 1:1A, 2:1Y, 3:2A, 4:2Y, 5:3A, 6:3Y, 7:GND, 8:4Y, 9:4A, 10:5Y, 11:5A, 12:6Y, 13:6A, 14:VCC
        const ipins = [1, 3, 5, 11, 13, 9, 14, 7];
        const opins = [2, 4, 6, 12, 10, 8];
        ipins.forEach(p => inputs.push(getPinLoc(p, 14)));
        opins.forEach(p => outputs.push(getPinLoc(p, 14)));
    } else if (cleanName === "74138" || cleanName === "74139") {
        pinCount = 16;
        if (cleanName === "74138") {
            const ipins = [1, 2, 3, 6, 4, 5]; // A, B, C, G1, G2A, G2B
            const opins = [15, 14, 13, 12, 11, 10, 9, 7]; // Y0-Y7
            ipins.forEach(p => inputs.push(getPinLoc(p, 16)));
            opins.forEach(p => outputs.push(getPinLoc(p, 16)));
        } else { // 74139
            const ipins = [1, 2, 3, 15, 14, 13]; // 1G, 1A, 1B, 2G, 2A, 2B
            const opins = [4, 5, 6, 7, 12, 11, 10, 9]; // 1Y0-3, 2Y0-3
            ipins.forEach(p => inputs.push(getPinLoc(p, 16)));
            opins.forEach(p => outputs.push(getPinLoc(p, 16)));
        }
    } else if (cleanName === "74175") {
        pinCount = 16;
        const ipins = [9, 1, 4, 5, 12, 13, 16, 8]; // CLK, CLR, 1D-4D, VCC, GND
        const opins = [2, 3, 7, 6, 10, 11, 15, 14]; // 1Q, 1/Q, 2Q, 2/Q, 3Q, 3/Q, 4Q, 4/Q
        ipins.forEach(p => inputs.push(getPinLoc(p, 16)));
        opins.forEach(p => outputs.push(getPinLoc(p, 16)));
    } else {
        // Fallback generic DIP mapping for other 74 series
        if (["74151", "74153", "74160", "74161", "74173", "74175", "7448", "7485", "7493", "74192", "74193", "74HC595"].includes(cleanName)) pinCount = 16;
        if (cleanName === "74181") pinCount = 24;
        if (cleanName === "555") pinCount = 8;
        
        for (let i = 1; i <= pinCount; i++) {
            const loc = getPinLoc(i, pinCount);
            inputs.push(loc);
            outputs.push(loc);
        }
    }
    return { inputs, outputs };
  }

  // Fallback for generic components (centering relative to loc)
  return { inputs: [], outputs: [rotate({ x: 0, y: 0 })] };
};

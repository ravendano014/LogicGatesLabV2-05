import { GoogleGenAI, Type } from "@google/genai";
import { CircuitData, Shape, Connector, ShapeType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const CIRCUIT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fileName: { type: Type.STRING, description: "A descriptive name for the circuit" },
    shapes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, description: "One of the valid ShapeType values (e.g., AND, OR, NOT, InputL, OutPutL, Clock, Text, IC7408, etc.)" },
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER },
          width: { type: Type.NUMBER, description: "Standard width is 100" },
          height: { type: Type.NUMBER, description: "Standard height is 50" },
          label: { type: Type.STRING, description: "Label to display on the component" },
          inputs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                label: { type: Type.STRING },
                value: { type: Type.NUMBER },
                name: { type: Type.STRING }
              }
            }
          },
          outputs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                label: { type: Type.STRING },
                value: { type: Type.NUMBER },
                name: { type: Type.STRING }
              }
            }
          },
          name: { type: Type.STRING },
          color: { type: Type.STRING },
          font: { type: Type.STRING },
          frequency: { type: Type.NUMBER, description: "Only for Clock type" }
        },
        required: ["id", "type", "x", "y", "width", "height", "label", "inputs", "outputs", "name"]
      }
    },
    connectors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          startShapeId: { type: Type.STRING },
          endShapeId: { type: Type.STRING },
          startOutputIndex: { type: Type.NUMBER },
          endInputIndex: { type: Type.NUMBER }
        },
        required: ["id", "startShapeId", "endShapeId", "startOutputIndex", "endInputIndex"]
      }
    }
  },
  required: ["fileName", "shapes", "connectors"]
};

export async function generateRandomCircuit(): Promise<CircuitData> {
  const prompt = `
    Generate a valid, complex, and functional electronic/digital circuit for a logic simulator.
    
    CRITICAL REQUIREMENTS:
    1. COMPLEXITY: The circuit must be a complete system (e.g., a multi-digit counter with reset, a memory-mapped I/O system, a complex ALU with registers, a microcontroller-based controller with multiple sensors and actuators).
    2. CATEGORIES: Prioritize using components from these categories:
       - IC (7400 series: 74161, 74138, 74153, 74HC595, 7485, 74181, 74245)
       - CMOS (4000 series: 4017, 4066, 4013)
       - MICROCONTROLLERS (LGT8F328P, ATmega16, ATtiny85, PIC18F2520, ESP32, RP2040)
       - ANALOG & POWER (555 Timer, LM741, LM358)
    3. DOCUMENTATION: Include at least 4 'Text' shapes as labels/annotations to explain the circuit's purpose, sub-blocks, and how to operate it. Use different colors and font sizes for hierarchy.
    4. CONNECTIVITY: ENSURE ALL COMPONENTS ARE FULLY CONNECTED. Every input of a logic gate or IC should be connected to an output, a switch, or a constant (HighConstant/LowConstant).
    5. FUNCTIONALITY: The circuit must be logically sound. If it uses a shift register, connect a clock and data. If it uses a microcontroller, connect its pins to relevant components.
    6. Use valid ShapeType values: AND, OR, NOT, NAND, NOR, XOR, XNOR, InputL, OutPutL, Clock, Text, IC7408, IC7400, IC7432, IC7402, IC7486, IC7404, IC74245, IC7445, IC7447, IC7490, IC74161, IC74138, IC74151, IC74153, IC555, LM741, LGT8F328P, ATmega16, ATtiny85, PIC18F2520, ESP32, RP2040, IC4001, IC4011, IC4017, PushButton, ToggleSwitch, Display4Digit, Buzzer, Motor, RGB_LED, OLED_Display, HighConstant, LowConstant, IC74HC595, IC7485, IC74181, Resistor, Capacitor, Diode, Transistor_NPN, Battery, VCC, GND.
    4. Ensure all connectors reference valid shape IDs and indices.
    5. Position elements logically on a grid (x: 0-1800, y: 0-1300).
    6. For ICs, inputs are on the left, outputs on the right.
    7. Connect inputs to outputs to make a functional system.
    
    Return the data in the specified JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: CIRCUIT_SCHEMA as any
      }
    });

    const result = JSON.parse(response.text);
    return result as CircuitData;
  } catch (error) {
    console.error("Error generating circuit:", error);
    throw error;
  }
}

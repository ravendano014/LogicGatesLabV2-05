export type ShapeType = 
  | 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR' 
  | 'AND3' | 'AND4' | 'AND5' | 'OR3' | 'OR4' | 'OR5' 
  | 'NAND3' | 'NAND4' | 'NOR3' | 'NOR4' | 'XOR3' | 'XOR4' | 'Buffer' | 'ThreeState'
  | 'InputL' | 'OutPutL' | 'Clock' | 'Clock_ms' | 'Clock_Hz_Adj' | 'Clock_ms_Adj' | 'GatedClock' | 'Oscilloscope' | 'Display' | 'Text'
  | 'SR_Flip_Flop' | 'D_Flip_Flop' | 'T_Flip_Flop' | 'JK_Flip_Flop' | 'D_Latch'
  | 'Pin14' | 'IC7408' | 'IC74107' | 'IC7400' | 'IC7432' | 'IC7402' | 'IC7486' | 'IC7404' | 'IC7445' | 'IC7447' | 'IC7490' | 'IC7493'
  | 'IC74160' | 'IC74161' | 'IC74192' | 'IC74193' | 'IC74138' | 'IC74139' | 'IC74151' | 'IC74153' | 'IC74173' | 'IC74175' | 'IC7400' | 'IC7402' | 'IC7404' | 'IC7408' | 'IC7410' | 'IC7420' | 'IC7430' | 'IC7432' | 'IC7486' | 'IC74245'
  | 'IC555' | 'IC555_Simple' | 'LM741' | 'LM358' | 'LM324' | 'LM311'
  | 'IC4001' | 'IC4011' | 'IC4071' | 'IC4081' | 'IC4069' | 'IC4013' | 'IC4017' | 'IC4049' | 'IC4066'
  | 'LM386'
  | 'PCB_Board'
  | 'IC74HC595' | 'Display4Digit' | 'IC7485' | 'IC7448' | 'IC74147' | 'IC74148' | 'IC74181' | 'DisplayBCD' | 'IC7SegToBCD'
  | 'Resistor' | 'Capacitor' | 'Inductor' | 'Diode' | 'Transistor_NPN' | 'Transistor_PNP' | 'Potentiometer' | 'Battery' | 'VCC' | 'GND' | 'Relay' | 'Transformer'
  | 'GND_Earth' | 'GND_Protective' | 'GND_Signal'
  | 'AC_Voltage_Source' | 'DC_Voltage_Source' | 'Coil' | 'LED' | 'Fuse' | 'Regulator'
  | 'Voltage_Source_Ideal' | 'Current_Source_Ideal' | 'Pulse_Generator' | 'Sawtooth_Generator' | 'Step_Generator' | 'Cell'
  | 'Preset_Resistor' | 'Attenuator' | 'Trimmer_Capacitor' | 'Heater' | 'Fuse_IEC'
  | 'Wattmeter' | 'Varmeter' | 'Hz_Meter' | 'Thermometer_Symbol' | 'Hour_Meter'
  | 'Neon_Lamp' | 'Fluorescent_Lamp'
  | 'DC_Current_Source' | 'AC_Current_Source' | 'Step_Voltage_Source' | 'Step_Current_Source' | 'PWL_Voltage_Source' | 'PWL_Current_Source'
  | 'Zener_Diode' | 'Schottky_Diode' | 'Photodiode' | 'OpAmp' | 'Node_Label'
  | 'Voltmeter' | 'Ammeter' | 'Probe'
  | 'MUX_2to1' | 'MUX_4to1'
  | 'Half_Adder' | 'Full_Adder' | 'Adder_4bit' | 'Adder_8bit'
  | 'SR_Latch' | 'SR_Latch_Inv'
  | 'Comparator'
  | 'MOSFET_N' | 'MOSFET_P' | 'JFET_N' | 'JFET_P'
  | 'VCCS' | 'VCVS' | 'CCCS' | 'CCVS'
  | 'Switch_SPST' | 'Switch_SPDT' | 'Switch_DPST' | 'Switch_DPDT'
  | 'Relay_SPDT' | 'Relay_DPDT'
  | 'PushButton' | 'HighConstant' | 'LowConstant' | 'ToggleSwitch' | 'PassSwitch'
  | 'Buzzer' | 'Motor' | 'RGB_LED' | 'OLED_Display' | 'Bus' | 'Bus8' | 'Bus16'
  | 'LGT8F328P' | 'ATmega328P' | 'ATmega16U2' | 'ATmega16' | 'ATtiny85' | 'PIC18F2520' | 'ESP32' | 'RP2040'
  | 'Display7Segment' | 'Display7SegmentSigned' | 'Display8Segment' | 'Display9Segment' | 'Display14Segment' | 'Display16Segment' | 'DotMatrixDisplay' | 'Display2Digit'
  | 'LB1' | 'SUM1' | 'SUM2' | 'MUL1' | 'Bridge_Rectifier' | 'Darlington_NPN' | 'Darlington_PNP'
  | 'Variable_Capacitor' | 'Crystal' | 'Speaker' | 'Antenna' | 'Lamp' | 'Microphone' | 'LDR'
  | 'SCR' | 'DIAC' | 'TRIAC' | 'PWM_Block' | 'Polarized_Capacitor'
  | 'ICMAX7219'
  | 'IC_TD7000'
  | 'InputControl' | 'InputControl_4' | 'InputControl_7' | 'InputControl_8'
  | 'Screen'
  | 'XYScreen'
  | 'Sens_Temp' | 'Sens_Light' | 'Sens_Pressure' | 'Sens_Ultrasonic'
  | 'MCU_ATmega328P' | 'MCU_ESP32' | 'MCU_STM32' | 'MCU_PIC16F877A' | 'MCU_ATTiny85'
  | 'FlowStart' | 'FlowProcess' | 'FlowDecision' | 'FlowInputOutput' | 'FlowEnd'
  | 'PCB_DIP8' | 'PCB_DIP14' | 'PCB_DIP16' | 'PCB_DIP20' | 'PCB_DIP28' | 'PCB_DIP40'
  | 'PCB_LCD16x2' | 'PCB_Resistor' | 'PCB_Capacitor' | 'PCB_Capacitor_Polar'
  | 'PCB_LED' | 'PCB_Potentiometer' | 'PCB_Switch_Tactile' | 'PCB_Header_2' | 'PCB_Header_4' | 'PCB_Header_8' | 'PCB_Header_16'
  | 'PCB_Pad_Circular' | 'PCB_Pad_Square' | 'PCB_Via' | 'PCB_Mounting_Hole' | 'PCB_Crystal'
  | 'Register_4bit' | 'Register_8bit' | 'Register_16bit' | 'Register_32bit' 
  | 'RAM_8x8' | 'ALU_8bit' | 'SRAM' | 'EEPROM'
  | 'Splitter' | 'ROM' | 'Counter_Gen' | 'Multiplexer_Gen' | 'Demultiplexer_Gen' | 'Decoder_Gen' | 'PriorityEncoder_Gen' | 'BitSelector_Gen'
  | 'CustomBlock' | 'MAR_8Bit';

export interface Point {
  x: number;
  y: number;
}

export interface ConnectionPoint extends Point {
  label: string;
  value: string | number;
  name: string;
}

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  inputs: ConnectionPoint[];
  outputs: ConnectionPoint[];
  name: string;
  color: string;
  font?: string;
  fontSize?: number;
  rotation?: number;
  isRunning?: boolean;
  intervalId?: number | null;
  history?: number[];
  prevInputs?: (number | string)[];
  state?: any;
  isPressed?: boolean;
  frequency?: number; // For Clock
  onColor?: string;   // For OutPutL
  offColor?: string;  // For OutPutL
  scale?: number;
  resistance?: number;
  capacitance?: number;
  inductance?: number;
  voltage?: number;
  current?: number;
  dutyCycle?: number;
  offset?: number;
  phase?: number;
  gain?: number;
  model?: string;
  mode?: 'astable' | 'monostable' | 'bistable';
  isBurned?: boolean;
  burnedData?: {
    truthTable?: Record<string, number[]>;
    inputCount: number;
    outputCount: number;
    lastState?: any;
    [key: string]: any;
  };
  isSelected?: boolean;
  subcircuit?: {
    shapes: Shape[];
    connectors: Connector[];
    inputMapping?: { internalShapeId: string; type: 'input' | 'output'; index: number }[];
    outputMapping?: { internalShapeId: string; type: 'input' | 'output'; index: number }[];
  };
}

export interface Connector {
  id: string;
  startShapeId: string;
  endShapeId: string;
  startOutputIndex: number;
  endInputIndex: number;
  isSelected?: boolean;
}

export interface Page {
  id: string;
  name: string;
  shapes: Shape[];
  connectors: Connector[];
  panOffset?: Point;
}

export interface CircuitData {
  fileName: string;
  shapes: Shape[];
  connectors: Connector[];
  pages?: Page[];
  currentPageId?: string;
  customBlocks?: Shape[];
}

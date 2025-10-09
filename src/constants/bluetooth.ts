// BLE Service and Characteristic UUIDs
// These match the ESP32 FireBot code

export const DEVICE_NAME_PREFIX = 'FireBot';

// Actual UUIDs from ESP32
export const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const MOVEMENT_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
export const PUMP_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';
export const SENSOR_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26aa';

// Command strings
export const COMMANDS = {
  FORWARD: 'F',
  BACKWARD: 'B',
  LEFT: 'L',
  RIGHT: 'R',
  STOP: 'S',
  PUMP_ON: 'P1',
  PUMP_OFF: 'P0',
  EXTINGUISH: 'EXTINGUISH', // Autonomous fire extinguishing mode
} as const;

export type Command = typeof COMMANDS[keyof typeof COMMANDS];

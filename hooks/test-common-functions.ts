/**
 * Test file to verify common functions
 * 
 * This is only for testing and can be removed after verification
 */

import {
  calculateNewTime,
  roundStops,
  parseShutterSpeed,
  formatShutterSpeed,
  calculateEV,
  formatTime,
  parseTimeInput,
  findClosestValue,
  calculateBladeThickness
} from './commonFunctions';

// Test exposure calculations
const timeTest = calculateNewTime(10, 1); // Should be 20
const stopsTest = roundStops(1.499); // Should be 1.5

// Test shutter speed functions
const speedTest1 = parseShutterSpeed('1/125'); // Should be 0.008
const speedTest2 = formatShutterSpeed(0.008); // Should be "1/125"

// Test EV calculation
const evTest = calculateEV(8, 100, 1/125); // Calculate EV

// Test time formatting
const formattedTime = formatTime(125); // Should be "2 minutes 5 seconds"
const parsedTime = parseTimeInput('2m5s'); // Should be 125

// Test closest value finder
const values = ['1.0', '1.4', '2.0', '2.8', '4.0', '5.6', '8.0', '11', '16', '22', '32'];
const closest = findClosestValue(7.2, values); // Should find "8.0"

// Test blade thickness calculator
const thickness = calculateBladeThickness(16, 20, 20 * 24, 2); // Calculate thickness

// Log results to console for verification
console.log({
  timeTest,
  stopsTest,
  speedTest1,
  speedTest2,
  evTest,
  formattedTime,
  parsedTime,
  closest,
  thickness
}); 
import { AspectRatio, PaperSize } from '@/types/borderTypes';

// Define raw data without the derived 'value'
const rawAspectRatiosData = [
  { label: "35mm standard frame, 6x9 (3:2)", width: 3, height: 2 },
  { label: "XPan Pano (65:24)", width: 65, height: 24 },
  { label: "6x4.5/6x8/35mm Half Frame (4:3)", width: 4, height: 3 },
  { label: "6x6/Square (1:1)", width: 1, height: 1 },
  { label: "6x7", width: 7, height: 6 },
  { label: "4x5", width: 5, height: 4 },
  { label: "5x7", width: 7, height: 5 },
  { label: "HDTV (16:9)", width: 16, height: 9 },
  { label: "Academy Ratio (1.37:1)", width: 1.37, height: 1 },
  { label: "Widescreen (1.85:1)", width: 1.85, height: 1 },
  { label: "Univisium (2:1)", width: 2, height: 1 },
  { label: "CinemaScope (2.39:1)", width: 2.39, height: 1 },
  { label: "Ultra Panavision (2.76:1)", width: 2.76, height: 1 },
];

const rawPaperSizesData = [
  { label: "4x5", width: 4, height: 5 },
  { label: "4x6 (postcard)", width: 4, height: 6 },
  { label: "5x7", width: 5, height: 7 },
  { label: "8x10", width: 8, height: 10 },
  { label: "11x14", width: 11, height: 14 },
  { label: "16x20", width: 16, height: 20 },
  { label: "20x24", width: 20, height: 24 },
];

const rawEaselSizesData: PaperSize[] = [
  { label: "5x7", value: "7x5", width: 7, height: 5 },
  { label: "8x10", value: "10x8", width: 10, height: 8 },
  { label: "11x14", value: "14x11", width: 14, height: 11 },
  { label: "16x20", value: "20x16", width: 20, height: 16 },
  { label: "20x24", value: "24x20", width: 24, height: 20 },
];


// Map raw data to include the derived 'value', keeping numbers defined once
export const ASPECT_RATIOS: AspectRatio[] = [
  ...rawAspectRatiosData.map(item => ({
    ...item,
    value: `${item.width}/${item.height}`,
  })),
  // Add the custom entry separately
  { label: "Custom Ratio", value: "custom", width: 0, height: 0 },
];

export const PAPER_SIZES: PaperSize[] = [
  ...rawPaperSizesData.map(item => ({
    ...item,
    value: `${item.width}x${item.height}`,
  })),
  // Add the custom entry separately
  { label: "Custom Paper Size", value: "custom", width: 0, height: 0 },
];

export const EASEL_SIZES: PaperSize[] = [
  ...rawPaperSizesData.map(item => ({
    ...item,
    value: `${item.width}x${item.height}`,
  }))
];


// UI Constants
export const BLADE_THICKNESS = 15;

// Default export to satisfy router requirement - updated
export default {
  ASPECT_RATIOS,
  PAPER_SIZES,
  EASEL_SIZES,
  BLADE_THICKNESS,
}; 
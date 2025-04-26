import { AspectRatio, PaperSize } from '@/types/border';

// Common aspect ratios
export const ASPECT_RATIOS: AspectRatio[] = [
  {
    label: "3:2 (35mm standard frame, 6x9)",
    value: "3/2",
    width: 3,
    height: 2,
  },
  { label: "65:24 (XPan Pano)", value: "65/24", width: 65, height: 24 },
  { label: "6:4.5", value: "6/4.5", width: 6, height: 4.5 },
  { label: "1:1 (Square/6x6)", value: "1/1", width: 1, height: 1 },
  { label: "7:6 (6x7)", value: "7/6", width: 7, height: 6 },
  { label: "8:6 (6x8)", value: "8/6", width: 8, height: 6 },
  { label: "5:4 (4x5)", value: "5/4", width: 5, height: 4 },
  { label: "7:5 (5x7)", value: "7/5", width: 7, height: 5 },
  { label: "4:3", value: "4/3", width: 4, height: 3 },
  { label: "custom", value: "custom", width: 0, height: 0 },
];

// Common paper sizes in inches
export const PAPER_SIZES: PaperSize[] = [
  { label: "4x5", value: "4x5", width: 4, height: 5 },
  { label: "4x6 (postcard)", value: "4x6", width: 4, height: 6 },
  { label: "5x7", value: "5x7", width: 5, height: 7 },
  { label: "8x10", value: "8x10", width: 8, height: 10 },
  { label: "11x14", value: "11x14", width: 11, height: 14 },
  { label: "16x20", value: "16x20", width: 16, height: 20 },
  { label: "20x24", value: "20x24", width: 20, height: 24 },
  { label: "custom", value: "custom", width: 0, height: 0 },
];

export const EASEL_SIZES: PaperSize[] = [
  { label: "7x5", value: "7x5", width: 7, height: 5 },
  { label: "10x8", value: "10x8", width: 10, height: 8 },
  { label: "14x11", value: "14x11", width: 14, height: 11 },
  { label: "20x16", value: "20x16", width: 20, height: 16 },
  { label: "24x20", value: "24x20", width: 24, height: 20 },
];

// UI Constants
export const BLADE_THICKNESS = 15;

// Default export to satisfy router requirement
export default {
  ASPECT_RATIOS,
  PAPER_SIZES,
  EASEL_SIZES,
  BLADE_THICKNESS,
}; 
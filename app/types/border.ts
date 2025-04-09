interface AspectRatio {
  label: string;
  value: string;
  width?: number;
  height?: number;
}

interface PaperSize {
  label: string;
  value: string;
  width: number;
  height: number;
}

interface BorderCalculation {
  leftBorder: number;
  rightBorder: number;
  topBorder: number;
  bottomBorder: number;
  printWidth: number;
  printHeight: number;
  paperWidth: number;
  paperHeight: number;
  
  previewScale: number;
  previewHeight: number;
  previewWidth: number;
  
  printWidthPercent: number;
  printHeightPercent: number;
  leftBorderPercent: number;
  topBorderPercent: number;
  rightBorderPercent: number;
  bottomBorderPercent: number;
  
  leftBladePos: number;
  rightBladePos: number;
  topBladePos: number;
  bottomBladePos: number;
  
  // Easel information
  isNonStandardSize: boolean;
  easelSize: { width: number; height: number };
}

interface SelectListProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  placeholder?: string;
}

const types = {
  AspectRatio: {} as AspectRatio,
  PaperSize: {} as PaperSize,
  BorderCalculation: {} as BorderCalculation,
  SelectListProps: {} as SelectListProps,
};

export type { AspectRatio, PaperSize, BorderCalculation, SelectListProps };
export default types; 
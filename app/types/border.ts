export interface AspectRatio {
  label: string;
  value: string;
  width?: number;
  height?: number;
}

export interface PaperSize {
  label: string;
  value: string;
  width: number;
  height: number;
}

export interface BorderCalculation {
  leftBorder: number;
  rightBorder: number;
  topBorder: number;
  bottomBorder: number;
  printWidth: number;
  printHeight: number;
  paperWidth: number;
  paperHeight: number;
}

export interface SelectListProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  placeholder?: string;
} 
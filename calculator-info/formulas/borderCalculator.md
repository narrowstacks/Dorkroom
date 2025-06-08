# Border Calculator Formulas and Algorithms

## Introduction

The Border Calculator is a tool for calculating optimal print sizes and borders for darkroom printing. It helps determine proper dimensions, borders, and blade positions for easel trimming while maintaining desired aspect ratios. The calculator uses a React hook (`useBorderCalculator`) that manages UI state and calls pure geometry helper functions.

## Architecture Overview

The calculator separates concerns into:

- **UI State Management**: React hook with reducer pattern for managing user inputs and derived state
- **Pure Geometry Functions**: Utility functions in `@/utils/borderCalculations` for mathematical calculations
- **Constants**: Standard paper sizes, easel dimensions, and aspect ratios

## Core Formulas

### Print Size Calculation

The print size is calculated based on the paper dimensions, minimum border requirement, and desired aspect ratio.

**Function**: `computePrintSize(w, h, rw, rh, mb)`

Given:

- Paper dimensions: $W_p \times H_p$ (oriented based on landscape setting)
- Minimum border: $B_{min}$
- Aspect ratio: $R = W_r / H_r$

Available print area:

- Available width: $W_a = W_p - 2 \times B_{min}$
- Available height: $H_a = H_p - 2 \times B_{min}$

Print dimensions are determined by comparing the available area ratio to the desired ratio:

```psuedo
ratio = rw / rh
if (availW / availH > ratio) {
  // Height limited
  printW = availH * ratio
  printH = availH
} else {
  // Width limited  
  printW = availW
  printH = availW / ratio
}
```

### Offset Handling and Clamping

**Function**: `clampOffsets(paperW, paperH, printW, printH, mb, offH, offV, ignoreMB)`

The calculator computes the maximum allowed offsets and clamps user input accordingly:

```javascript
const halfW = (paperW - printW) / 2;  // Half the horizontal gap
const halfH = (paperH - printH) / 2;  // Half the vertical gap

// Maximum offsets depend on ignore minimum border setting
const maxH = ignoreMB ? halfW : Math.min(halfW - mb, halfW);
const maxV = ignoreMB ? halfH : Math.min(halfH - mb, halfH);

// Clamp the offsets
const h = Math.max(-maxH, Math.min(maxH, offH));
const v = Math.max(-maxV, Math.min(maxV, offV));
```

Warning messages are generated when offsets are clamped:

- If `ignoreMB` is true: "Offset adjusted to keep print on paper."
- Otherwise: "Offset adjusted to honour min‑border."

### Border Calculation

**Function**: `bordersFromGaps(halfW, halfH, h, v)`

Borders are calculated from the gap halves and applied offsets:

```javascript
borders = {
  left: halfW - h,
  right: halfW + h,
  bottom: halfH - v,
  top: halfH + v
}
```

Where:

- `h` is the clamped horizontal offset (positive = shift right)
- `v` is the clamped vertical offset (positive = shift up)

### Easel Size Determination

**Function**: `findCenteringOffsets(paperW, paperH, landscape)`

The algorithm determines the appropriate easel slot and whether the paper is non-standard:

1. **Orient the paper** based on landscape setting:

   ```javascript
   const paper = landscape ? { width: paperH, height: paperW } : { width: paperW, height: paperH };
   ```

2. **Find the smallest fitting easel** from `EASEL_SIZES` (sorted by area):
   - Check if easel fits as-is: `easel.width >= paper.width && easel.height >= paper.height`
   - Check if easel fits when flipped: `easel.height >= paper.width && easel.width >= paper.height`
   - Use the first (smallest area) easel that satisfies either condition

3. **Determine effective slot dimensions**:

   ```javascript
   const slot = bestEaselFitsDirectly 
     ? { width: best.width, height: best.height }
     : { width: best.height, height: best.width };  // Flipped
   ```

4. **Check if paper is non-standard**:

   ```javascript
   const isNonStandardPaperSize = !EASEL_SIZES.some(e =>
     (e.width === paperW && e.height === paperH) ||
     (e.width === paperH && e.height === paperW)
   );
   ```

### Blade Position Calculation

**Function**: `bladeReadings(printW, printH, sX, sY)`

Blade positions are calculated using the formula `R = I ± 2s`:

```javascript
return {
  left: printW - 2 * sX,
  right: printW + 2 * sX,
  top: printH - 2 * sY,
  bottom: printH + 2 * sY,
};
```

Where:

- `sX`, `sY` are the total shifts combining paper centering and user offsets
- `sX = spX + offH` (paper shift + horizontal offset)
- `sY = spY + offV` (paper shift + vertical offset)

**Paper shift calculation**:

```javascript
const spX = isNonStandardPaperSize ? (orientedPaper.w - effectiveSlot.width) / 2 : 0;
const spY = isNonStandardPaperSize ? (orientedPaper.h - effectiveSlot.height) / 2 : 0;
```

### Blade Thickness Scaling

**Function**: `calculateBladeThickness(paperW, paperH)`

Visual blade thickness scales based on paper area relative to base size (20×24 inches):

```javascript
const BASE_PAPER_AREA = 20 * 24;  // 480 sq inches
const area = Math.max(paperW * paperH, EPS);  // Prevent division by zero
const scale = Math.min(BASE_PAPER_AREA / area, 2);  // Cap at 2x scaling
return Math.round(BLADE_THICKNESS * scale);
```

### Optimal Minimum Border Algorithm

**Function**: `calculateOptimalMinBorder(paperW, paperH, ratioW, ratioH, start)`

This algorithm finds a minimum border value that results in blade positions close to quarter-inch increments:

1. **Define search space**: `start ± 0.5` inches
2. **Score function**: For each border value, calculate how close each border is to a 0.25" increment:

   ```javascript
   const snapScore = (b) => {
     const r = b % 0.25;
     return Math.min(r, 0.25 - r);
   };
   ```

3. **Binary search optimization**: Iteratively narrow the search space to find the minimum total score
4. **Return**: The border value with the best (lowest) score, rounded to 2 decimal places

## Edge Cases and Warnings

### Minimum Border Validation

During input processing, the calculator validates minimum border:

```javascript
const maxBorder = Math.min(orientedPaper.w, orientedPaper.h) / 2;
if (minBorder >= maxBorder && maxBorder > 0) {
  // Use last valid border and show warning
  minBorderWarning = `Minimum border too large; using ${lastValid}.`;
  minBorder = lastValid;
}
```

### Blade Position Warnings

```javascript
const values = Object.values(blades);
if (values.some(v => v < 0))
  bladeWarning = 'Negative blade reading – use opposite side of scale.';
if (values.some(v => Math.abs(v) < 3 && v !== 0))
  bladeWarning += 'Many easels have no markings below about 3 in.';
```

### Paper Size Warnings

For custom paper sizes:

```javascript
const paperSizeWarning = (paperW > MAX_EASEL_DIMENSION || paperH > MAX_EASEL_DIMENSION)
  ? `Custom paper (${paperW}×${paperH}) exceeds largest standard easel (20×24").`
  : null;
```

## Constants and Standards

### Standard Easel Sizes

The calculator uses these standard easel slot dimensions:

- 7×5, 10×8, 14×11, 20×16, 24×20 inches

### Default Values

- Default minimum border: 0.5 inches
- Default custom paper: 13×10 inches  
- Default custom aspect ratio: 2:3
- Base blade thickness: 15 pixels (from `BLADE_THICKNESS` constant)
- Optimization search span: ±0.5 inches around current border
- Snap increment: 0.25 inches

### Preview Scaling

Preview dimensions for UI display:

```javascript
const previewScale = useMemo(() => {
  const maxW = Math.min(winW * 0.9, 400);
  const maxH = Math.min(winH * 0.5, 400);
  return Math.min(maxW / w, maxH / h);
}, [orientedPaper, winW, winH]);
```

## State Management

The calculator uses a React reducer pattern with these key state updates:

- **Input validation**: Custom dimensions are validated and cached as "last valid" values
- **Warning management**: Warnings are computed in the calculation phase and synchronized back to state
- **Orientation handling**: Paper and aspect ratio can be independently flipped
- **Offset enablement**: Offsets are only applied when `enableOffset` is true

This ensures a clean separation between UI state and mathematical calculations while providing real-time feedback to users.

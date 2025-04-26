# Border Calculator Formulas and Algorithms

## Introduction

The Border Calculator is a tool for calculating optimal print sizes and borders for darkroom printing. It helps determine proper dimensions, borders, and blade positions for easel trimming while maintaining desired aspect ratios.

## Core Formulas

### Print Size Calculation

The print size is calculated based on the paper dimensions, minimum border requirement, and desired aspect ratio.

Given:

- Paper dimensions: $W_p \times H_p$
- Minimum border: $B_{min}$
- Aspect ratio: $R = W_r / H_r$

Available print area:

- Available width: $W_a = W_p - 2 \times B_{min}$
- Available height: $H_a = H_p - 2 \times B_{min}$

Print dimensions are determined by comparing the available area ratio to the desired ratio:

If $W_a / H_a > R$ (height limited):
$H_{print} = H_a$
$W_{print} = H_a \times R$

If $W_a / H_a \leq R$ (width limited):
$W_{print} = W_a$
$H_{print} = W_a / R$

### Border Calculation

The borders are calculated as the space between the print and paper edges:

- Left border: $B_L = (W_p - W_{print})/2 + O_h$
- Right border: $B_R = (W_p - W_{print})/2 - O_h$
- Top border: $B_T = (H_p - H_{print})/2 + O_v$
- Bottom border: $B_B = (H_p - H_{print})/2 - O_v$

Where $O_h$ and $O_v$ are horizontal and vertical offsets.

### Offset Handling

Horizontal and vertical offsets allow adjusting the print position. These values are clamped to maintain minimum borders:

Maximum allowed horizontal offset:
$$O_{h,max} = \begin{cases}
\frac{W_p - W_{print}}{2} & \text{if ignoring minimum border} \\
\min(\frac{W_p - W_{print}}{2} - B_{min}, \frac{W_p - W_{print}}{2}) & \text{otherwise}
\end{cases}$$

Maximum allowed vertical offset:
$$O_{v,max} = \begin{cases}
\frac{H_p - H_{print}}{2} & \text{if ignoring minimum border} \\
\min(\frac{H_p - H_{print}}{2} - B_{min}, \frac{H_p - H_{print}}{2}) & \text{otherwise}
\end{cases}$$

The offsets are clamped to these ranges:
$O_h = \max(-O_{h,max}, \min(O_{h,max}, O_h))$
$O_v = \max(-O_{v,max}, \min(O_{v,max}, O_v))$

### Blade Position Calculation

Blade positions (readings) for the easel are calculated based on the print dimensions ($I_x, I_y$) and the total center shift ($s_x, s_y$) applied to the paper relative to the easel center.

Given:
- Oriented paper width: $W_{p,x}$ (corresponds to `orientedPaperWidth`)
- Oriented paper height: $W_{p,y}$ (corresponds to `orientedPaperHeight`)
- Oriented print width: $I_x$ (corresponds to `printWidth`)
- Oriented print height: $I_y$ (corresponds to `printHeight`)
- Oriented easel slot width: $W_{s,x}$ (from `findCenteringOffsets`)
- Oriented easel slot height: $W_{s,y}$ (from `findCenteringOffsets`)
- Left Border: $B_{1,x}$ (Near horizontal border, corresponds to `leftBorder`)
- Right Border: $B_{2,x}$ (Far horizontal border, corresponds to `rightBorder`)
- Bottom Border: $B_{1,y}$ (Near vertical border, corresponds to `bottomBorder`)
- Top Border: $B_{2,y}$ (Far vertical border, corresponds to `topBorder`)
- Horizontal Offset (clamped): $O_h$ (corresponds to `clampedHorizontalOffset`)
- Vertical Offset (clamped): $O_v$ (corresponds to `clampedVerticalOffset`)
- Is Paper Non-Standard: `isNonStandardPaperSize` (boolean flag from `findCenteringOffsets`)

Calculate Shift Components:

1.  **Paper Shift ($sp$)**: This accounts for centering a non-standard paper size within the chosen easel slot. It's zero if the paper is a standard size.
    - $sp_x = \\text{isNonStandardPaperSize} ? (W_{p,x} - W_{s,x}) / 2 : 0$
    - $sp_y = \\text{isNonStandardPaperSize} ? (W_{p,y} - W_{s,y}) / 2 : 0$

2.  **Border-Induced Shift ($sb$)**: This shift is caused by unequal borders due to user-applied offsets.
    - $sb_x = (B_{2,x} - B_{1,x}) / 2 = -O_h$
    - $sb_y = (B_{2,y} - B_{1,y}) / 2 = O_v$

Calculate Total Center Shift ($s$):

- $s_x = sp_x + sb_x$
- $s_y = sp_y + sb_y$

Calculate Blade Readings ($R$):

The readings represent the dimensions to set on the easel's scales.

- Left Blade Reading ($R_{Left}$): $I_x - 2s_x$
- Right Blade Reading ($R_{Right}$): $I_x + 2s_x$
- Top Blade Reading ($R_{Top}$): $I_y - 2s_y$
- Bottom Blade Reading ($R_{Bottom}$): $I_y + 2s_y$

Note: The formulas $R = I \pm 2s$ effectively combine the print size and all necessary shifts (paper centering and user offset) into the final scale readings.

### Blade Thickness Scaling

The visual thickness of the blades in the preview is scaled based on the relative area of the paper compared to a base size (20x24 inches), with a maximum scaling factor to prevent excessively thick blades on small paper.

Given:
- Base Blade Thickness: $T_{base}$ (constant `BLADE_THICKNESS`)
- Base Paper Area: $A_{base} = 20 \\times 24 = 480$ sq inches
- Current Oriented Paper Area: $A_{paper} = W_{p,x} \\times W_{p,y}$

Scaling Factor:
$ScaleFactor = \\min( A_{base} / A_{paper}, 2 )$

Scaled Blade Thickness:
$T_{blade} = T_{base} \\times ScaleFactor$

### Optimal Minimum Border Algorithm

The algorithm finds an optimal minimum border value that results in blade positions divisible by 0.25 inches:

1. Calculate initial print dimensions and blade positions with current minimum border
2. For a range of minimum border values around the current value ($B_{min} \pm 0.5$), in 0.01 increments:
   a. Recalculate print dimensions and blade positions
   b. Calculate a "score" based on how close each blade position is to being divisible by 0.25
   c. Score = $\sum_{pos} \min(pos \bmod 0.25, 0.25 - (pos \bmod 0.25))$
3. Select the minimum border value that gives the lowest score

### Preview Scaling

Preview dimensions are calculated for proper UI display:

- Fixed preview height: $H_{preview} = 300px$ (fixed)
- Preview scale: $S_{preview} = H_{preview} / \max(W_p, H_p)$
- Preview width: $W_{preview} = H_{preview} \times (W_p / H_p)$

### Easel Size Determination

The algorithm identifies the appropriate standard easel slot dimensions ($W_{s,x}, W_{s,y}$) for the paper based on its *current orientation* and determines if the *original* paper dimensions are considered non-standard relative to any standard easel size.

1.  Determine the oriented paper dimensions based on the landscape toggle:
    - $W_{p,x} = \\text{isLandscape} ? H_p : W_p$
    - $W_{p,y} = \\text{isLandscape} ? W_p : H_p$

2.  Find the *smallest* standard easel (from `EASEL_SIZES`, sorted by area) that can accommodate the oriented paper ($W_{p,x}, W_{p,y}$). The easel might need to be conceptually "flipped" relative to the paper's orientation to fit.
    - Check if fits current: $W_{easel} \\geq W_{p,x}$ AND $H_{easel} \\geq W_{p,y}$
    - Check if fits flipped: $W_{easel} \\geq W_{p,y}$ AND $H_{easel} \\geq W_{p,x}$
    - Select the first (smallest area) easel satisfying either condition. Determine if flipping was required (`useFlippedEasel`).

3.  Determine the *oriented* easel slot dimensions ($W_{s,x}, W_{s,y}$) based on the chosen easel and whether it was flipped:
    - $W_{s,x} = \\text{useFlippedEasel} ? H_{easel} : W_{easel}$
    - $W_{s,y} = \\text{useFlippedEasel} ? W_{easel} : H_{easel}$
    If no fitting easel is found, use the oriented paper dimensions as the effective slot size: $W_{s,x} = W_{p,x}$, $W_{s,y} = W_{p,y}$.

4.  Determine if the *original* paper dimensions ($W_p, H_p$) match any standard easel size in either orientation. Set `isNonStandardPaperSize = true` if no exact match is found.

5.  Return the oriented easel slot dimensions ($W_{s,x}, W_{s,y}$) and the `isNonStandardPaperSize` flag.

## Edge Cases and Warnings

### Minimum Border Validation

If the minimum border is too large (resulting in zero or negative print dimensions):
$B_{min} \geq \min(W_p/2, H_p/2)$

Then the last valid minimum border value is used instead.

### Blade Position Warnings

- Warning if any blade position is less than 3 inches (below typical easel markings)
- Warning if any blade position is negative, indicating need for alternative positioning

### Percentage Calculations

For responsive UI display, dimensions are also expressed as percentages:

- Print width percentage: $W_{print} = (W_{print} / W_p) \times 100$ %
- Print height percentage: $H_{print} = (H_{print} / H_p) \times 100$ %
- Border percentages: $B_{L} = (B_L / W_p) \times 100$ %, etc.

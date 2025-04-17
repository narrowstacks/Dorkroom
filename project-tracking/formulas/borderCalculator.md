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
$O_{h,max} = \begin{cases}
\frac{W_p - W_{print}}{2} & \text{if ignoring minimum border} \\
\min(\frac{W_p - W_{print}}{2} - B_{min}, \frac{W_p - W_{print}}{2}) & \text{otherwise}
\end{cases}$

Maximum allowed vertical offset:
$O_{v,max} = \begin{cases}
\frac{H_p - H_{print}}{2} & \text{if ignoring minimum border} \\
\min(\frac{H_p - H_{print}}{2} - B_{min}, \frac{H_p - H_{print}}{2}) & \text{otherwise}
\end{cases}$

The offsets are clamped to these ranges:
$O_h = \max(-O_{h,max}, \min(O_{h,max}, O_h))$
$O_v = \max(-O_{v,max}, \min(O_{v,max}, O_v))$

### Blade Position Calculation

Blade positions for the easel are calculated based on print dimensions, borders, and the centering offset required to fit the paper within the chosen easel size.

Given:
- Oriented paper width: $W_{p,oriented}$ (paper width or height depending on landscape toggle)
- Oriented paper height: $H_{p,oriented}$ (paper height or width depending on landscape toggle)
- Chosen easel dimensions: $W_{easel} \times H_{easel}$ (smallest standard size fitting the oriented paper)

Centering offsets:
- Horizontal offset: $O_{easel,X} = (W_{easel} - W_{p,oriented}) / 2$
- Vertical offset: $O_{easel,Y} = (H_{easel} - H_{p,oriented}) / 2$

Blade positions:
- Left blade position: $B_{L,pos} = W_{print} + B_L - B_R + O_{easel,X}$
- Right blade position: $B_{R,pos} = W_{print} - B_L + B_R - O_{easel,X}$
- Top blade position: $B_{T,pos} = H_{print} + B_T - B_B + O_{easel,Y}$
- Bottom blade position: $B_{B,pos} = H_{print} - B_T + B_B - O_{easel,Y}$

Note: $O_{easel,X}$ and $O_{easel,Y}$ are zero if the paper dimensions exactly match the chosen easel size.

### Blade Thickness Scaling

The blade thickness is scaled based on paper area to ensure proper measurements:

$T_{blade} = T_{base} \times \sqrt{\frac{A_{paper}}{A_{base}}}$

Where:

- $T_{base}$ is the base blade thickness (for 20×24 paper)
- $A_{base}$ is the base paper area (20×24 = 480 square inches)
- $A_{paper}$ is the current paper area

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

The algorithm finds the smallest standard easel size that can accommodate the paper *in its current orientation* and calculates the necessary centering offsets.

1. Determine the oriented paper dimensions based on the landscape setting:
   - $W_{p,oriented} = \text{isLandscape} ? H_p : W_p$
   - $H_{p,oriented} = \text{isLandscape} ? W_p : H_p$

2. Find the smallest standard easel (sorted by area) where:
   $W_{easel} \geq W_{p,oriented}$ AND $H_{easel} \geq H_{p,oriented}$

3. Calculate the centering offsets:
   - $O_{easel,X} = (W_{easel} - W_{p,oriented}) / 2$
   - $O_{easel,Y} = (H_{easel} - H_{p,oriented}) / 2$

   (Offsets are 0 if $W_{easel} = W_{p,oriented}$ and $H_{easel} = H_{p,oriented}$)

4. The paper is considered "non-standard" if either $O_{easel,X} > 0$ or $O_{easel,Y} > 0$.

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

# Resize Calculator Formulas and Algorithms

## Introduction
The Resize Calculator helps determine the correct exposure time when enlarging or reducing the size of darkroom prints. It accounts for the inverse-square law of light, which affects exposure as print size changes.

## Core Formulas

### Area Calculation
The calculation begins by determining the areas of both the original and new print sizes:

- Original print area: $A_{original} = W_{original} \times H_{original}$
- New print area: $A_{new} = W_{new} \times H_{new}$

Where:
- $W_{original}$ and $H_{original}$ are the width and height of the original print in inches
- $W_{new}$ and $H_{new}$ are the width and height of the new print in inches

### Exposure Time Calculation
The new exposure time is calculated based on the ratio of the new area to the original area:

$T_{new} = T_{original} \times \frac{A_{new}}{A_{original}}$

Where:
- $T_{original}$ is the original exposure time in seconds
- $T_{new}$ is the new exposure time in seconds
- $\frac{A_{new}}{A_{original}}$ is the area ratio

This formula is derived from the inverse-square law of light, which states that the intensity of light is inversely proportional to the square of the distance from the source. When enlarging, the same amount of light is spread over a larger area, requiring more exposure time.

### Stops Difference Calculation
The difference in exposure is also expressed in photographic stops, which is a logarithmic scale:

$Stops = \log_2\left(\frac{A_{new}}{A_{original}}\right)$

Where:
- A positive stops value indicates more exposure is needed (for a larger print)
- A negative stops value indicates less exposure is needed (for a smaller print)
- Each stop represents a doubling or halving of exposure

### Aspect Ratio Validation
The calculator also checks if the aspect ratios of the original and new print sizes match:

$Ratio_{original} = \frac{W_{original}}{H_{original}}$

$Ratio_{new} = \frac{W_{new}}{H_{new}}$

The aspect ratios match if: $Ratio_{original} = Ratio_{new}$

If the aspect ratios don't match, a warning is displayed to indicate that the proportions of the image will be distorted.

## Implementation Details

### Input Validation
Before calculating, the following validations are performed:
- All dimension inputs must be positive numbers greater than zero
- The original exposure time must be a positive number greater than zero
- Original area must be greater than zero

### Precision
- The new exposure time is rounded to one decimal place
- The stops difference is rounded to two decimal places
- Aspect ratio comparison uses three decimal places of precision

## Mathematical Background

### Inverse-Square Law
The formula is based on the inverse-square law, which in photography states that:

$E \propto \frac{1}{d^2}$

Where:
- $E$ is the illuminance (light intensity)
- $d$ is the distance from the light source

Since the area of projection is proportional to the square of the distance ($A \propto d^2$), we can rewrite this as:

$E \propto \frac{1}{A}$

To maintain the same exposure (density) in the final print, the exposure time must be adjusted inversely to the change in illuminance:

$T \propto \frac{1}{E}$

Therefore:

$T \propto A$

Which gives us our final formula:

$T_{new} = T_{original} \times \frac{A_{new}}{A_{original}}$

## Usage Notes

- The calculator provides a best-guess estimate and should be used as a starting point
- Test strips are still recommended when resizing prints
- When making significant size changes (more than 2 stops), consider intermediate test exposures
- The formula assumes the enlarger's light source and optical characteristics remain constant 
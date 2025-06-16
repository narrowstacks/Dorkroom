import { Buffer } from 'buffer';
import { ASPECT_RATIOS, PAPER_SIZES } from '@/constants/border';
import type { BorderPresetSettings } from '@/types/borderPresetTypes';

const findIndexByValue = (arr: readonly { value: string }[], value: string) => arr.findIndex(item => item.value === value);

const getBooleanBitmask = (settings: BorderPresetSettings): number => {
  let mask = 0;
  if (settings.enableOffset) mask |= 1;
  if (settings.ignoreMinBorder) mask |= 2;
  if (settings.showBlades) mask |= 4;
  if (settings.isLandscape) mask |= 8;
  if (settings.isRatioFlipped) mask |= 16;
  return mask;
};

const fromBooleanBitmask = (mask: number): Pick<BorderPresetSettings, 'enableOffset' | 'ignoreMinBorder' | 'showBlades' | 'isLandscape' | 'isRatioFlipped'> => ({
  enableOffset: (mask & 1) !== 0,
  ignoreMinBorder: (mask & 2) !== 0,
  showBlades: (mask & 4) !== 0,
  isLandscape: (mask & 8) !== 0,
  isRatioFlipped: (mask & 16) !== 0,
});

export const encodePreset = (settings: BorderPresetSettings): string => {
  try {
    const parts: (string | number)[] = [];

    const aspectRatioIndex = findIndexByValue(ASPECT_RATIOS, settings.aspectRatio);
    const paperSizeIndex = findIndexByValue(PAPER_SIZES, settings.paperSize);

    if (aspectRatioIndex === -1 || paperSizeIndex === -1) {
      throw new Error('Invalid aspect ratio or paper size');
    }

    parts.push(aspectRatioIndex);
    parts.push(paperSizeIndex);
    parts.push(Math.round(settings.minBorder * 100));
    parts.push(Math.round(settings.horizontalOffset * 100));
    parts.push(Math.round(settings.verticalOffset * 100));
    parts.push(getBooleanBitmask(settings));

    if (settings.aspectRatio === 'custom') {
      parts.push(Math.round(settings.customAspectWidth * 100));
      parts.push(Math.round(settings.customAspectHeight * 100));
    }
    if (settings.paperSize === 'custom') {
      parts.push(Math.round(settings.customPaperWidth * 100));
      parts.push(Math.round(settings.customPaperHeight * 100));
    }

    const rawString = parts.join('-');
    return Buffer.from(rawString).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (error) {
    console.error("Failed to encode preset:", error);
    return '';
  }
};

export const decodePreset = (encoded: string): BorderPresetSettings | null => {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const rawString = Buffer.from(base64, 'base64').toString('ascii');
    const parts = rawString.split('-').map(Number);

    let partIndex = 0;
    const aspectRatioIndex = parts[partIndex++];
    const paperSizeIndex = parts[partIndex++];
    const minBorder = parts[partIndex++] / 100;
    const horizontalOffset = parts[partIndex++] / 100;
    const verticalOffset = parts[partIndex++] / 100;
    const boolMask = parts[partIndex++];

    const aspectRatio = ASPECT_RATIOS[aspectRatioIndex]?.value;
    const paperSize = PAPER_SIZES[paperSizeIndex]?.value;

    if (!aspectRatio || !paperSize) {
      throw new Error('Invalid aspect ratio or paper size index');
    }

    const settings: BorderPresetSettings = {
      aspectRatio,
      paperSize,
      minBorder,
      horizontalOffset,
      verticalOffset,
      ...fromBooleanBitmask(boolMask),
      customAspectWidth: 0,
      customAspectHeight: 0,
      customPaperWidth: 0,
      customPaperHeight: 0,
    };

    if (settings.aspectRatio === 'custom') {
      settings.customAspectWidth = parts[partIndex++] / 100;
      settings.customAspectHeight = parts[partIndex++] / 100;
    }
    if (settings.paperSize === 'custom') {
      settings.customPaperWidth = parts[partIndex++] / 100;
      settings.customPaperHeight = parts[partIndex++] / 100;
    }

    return settings;
  } catch (error) {
    console.error("Failed to decode preset:", error);
    return null;
  }
};
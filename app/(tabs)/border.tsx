import React from 'react';
import {
  StyleSheet,
  Platform,
  TextInput,   // ← still used only for the print-preview sliders; feel free to migrate later
  Switch,      // ← same here
} from 'react-native';

// Shared slider/input component & constants
import { LabeledSliderInput } from '@/components/LabeledSliderInput';
import {
  DESKTOP_BREAKPOINT,
  SLIDER_MIN_BORDER,
  SLIDER_MAX_BORDER,
  SLIDER_STEP_BORDER,
  BORDER_SLIDER_LABELS,
  OFFSET_SLIDER_MIN,
  OFFSET_SLIDER_MAX,
  OFFSET_SLIDER_STEP,
  OFFSET_SLIDER_LABELS,
} from '@/constants/borderCalc';

import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { useBorderCalculator } from '@/hooks/useBorderCalculator';
import { ThemedView } from '@/components/ThemedView'; // kept for print-preview
import { useThemeColor } from '@/hooks/useThemeColor';
import { getPlatformFont } from '@/styles/common';
import { ASPECT_RATIOS, PAPER_SIZES } from '@/constants/border';
import { ThemedSelect } from '@/components/ThemedSelect';

import {
  Box,
  Text,
  ScrollView,
  Button,
  ButtonText,
  HStack,
  Alert,
  AlertIcon,
  AlertText,
  InfoIcon,
} from '@gluestack-ui/themed';

export default function BorderCalculator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > DESKTOP_BREAKPOINT;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor       = useThemeColor({}, 'text');
  const borderColor     = useThemeColor({}, 'icon');
  const tintColor       = useThemeColor({}, 'tint');

  const {
    aspectRatio,
    setAspectRatio,
    paperSize,
    setPaperSize,
    customAspectWidth,
    setCustomAspectWidth,
    customAspectHeight,
    setCustomAspectHeight,
    customPaperWidth,
    setCustomPaperWidth,
    customPaperHeight,
    setCustomPaperHeight,
    minBorder,
    setMinBorder,
    enableOffset,
    setEnableOffset,
    ignoreMinBorder,
    setIgnoreMinBorder,
    horizontalOffset,
    setHorizontalOffset,
    verticalOffset,
    setVerticalOffset,
    showBlades,
    setShowBlades,
    isLandscape,
    setIsLandscape,
    isRatioFlipped,
    setIsRatioFlipped,
    offsetWarning,
    bladeWarning,
    calculation,
    minBorderWarning,
    paperSizeWarning,
    resetToDefaults,
  } = useBorderCalculator();

  return (
    <ScrollView
      sx={{ flex: 1, bg: backgroundColor }}
      contentContainerStyle={styles.scrollContent}
    >
      {/* --------------- MAIN WRAPPER --------------- */}
      <Box style={[styles.content, Platform.OS === 'web' && styles.webContent]}>
        {/* ------------ HEADER ------------ */}
        <Box style={styles.header}>
          <Text style={styles.title}>border calculator</Text>
        </Box>

        {/* ------------ BODY ------------ */}
        <Box
          style={[
            styles.mainContent,
            Platform.OS === 'web' && isDesktop && styles.webMainContent,
          ]}
        >
          {/* ---------- PRINT-PREVIEW & RESULTS (kept as-is) ---------- */}
          {calculation && (
            <ThemedView
              style={[
                styles.previewSection,
                Platform.OS === 'web' && isDesktop && styles.webPreviewSection,
              ]}
            >
              {/* -- PREVIEW CANVAS (unchanged) -- */}
              <ThemedView
                style={[
                  styles.previewContainer,
                  {
                    height: calculation.previewHeight,
                    width : calculation.previewWidth,
                    borderColor,
                  },
                ]}
              >
                <ThemedView
                  style={[
                    styles.paperPreview,
                    {
                      width : '100%',
                      height: '100%',
                      borderColor,
                      backgroundColor: 'white',
                    },
                  ]}
                >
                  <ThemedView
                    style={[
                      styles.printPreview,
                      {
                        width : `${calculation.printWidthPercent}%`,
                        height: `${calculation.printHeightPercent}%`,
                        left  : `${calculation.leftBorderPercent}%`,
                        top   : `${calculation.topBorderPercent}%`,
                        backgroundColor: 'grey',
                      },
                    ]}
                  />
                  {showBlades && (
                    <>
                      <ThemedView
                        style={[
                          styles.blade,
                          styles.bladeVertical,
                          {
                            left: `${calculation.leftBorderPercent}%`,
                            transform: [{ translateX: -calculation.bladeThickness }],
                            backgroundColor: borderColor,
                            width: calculation.bladeThickness,
                          },
                        ]}
                      />
                      <ThemedView
                        style={[
                          styles.blade,
                          styles.bladeVertical,
                          {
                            right: `${calculation.rightBorderPercent}%`,
                            transform: [{ translateX: calculation.bladeThickness }],
                            backgroundColor: borderColor,
                            width: calculation.bladeThickness,
                          },
                        ]}
                      />
                      <ThemedView
                        style={[
                          styles.blade,
                          styles.bladeHorizontal,
                          {
                            top: `${calculation.topBorderPercent}%`,
                            transform: [{ translateY: -calculation.bladeThickness }],
                            backgroundColor: borderColor,
                            height: calculation.bladeThickness,
                          },
                        ]}
                      />
                      <ThemedView
                        style={[
                          styles.blade,
                          styles.bladeHorizontal,
                          {
                            bottom: `${calculation.bottomBorderPercent}%`,
                            transform: [{ translateY: calculation.bladeThickness }],
                            backgroundColor: borderColor,
                            height: calculation.bladeThickness,
                          },
                        ]}
                      />
                    </>
                  )}
                </ThemedView>
              </ThemedView>

              {/* orientation controls */}
              <HStack space="md">
                <Button onPress={() => setIsLandscape(!isLandscape)} variant="outline">
                  <ButtonText>Flip Paper Orientation</ButtonText>
                </Button>
                <Button onPress={() => setIsRatioFlipped(!isRatioFlipped)} variant="outline">
                  <ButtonText>Flip Aspect Ratio</ButtonText>
                </Button>
              </HStack>

              {/* result read-out */}
              <ThemedView style={styles.resultContainer}>
                <Text style={styles.subtitle}>Result</Text>

                <ThemedView style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Image Dimensions:</Text>
                  <Text style={styles.resultValue}>
                    {calculation.printWidth.toFixed(2)} x {calculation.printHeight.toFixed(2)} inches
                  </Text>
                </ThemedView>
                <ThemedView style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Left Blade:</Text>
                  <Text style={styles.resultValue}>
                    {calculation.leftBladeReading.toFixed(2)} inches
                  </Text>
                </ThemedView>
                <ThemedView style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Right Blade:</Text>
                  <Text style={styles.resultValue}>
                    {calculation.rightBladeReading.toFixed(2)} inches
                  </Text>
                </ThemedView>
                <ThemedView style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Top Blade:</Text>
                  <Text style={styles.resultValue}>
                    {calculation.topBladeReading.toFixed(2)} inches
                  </Text>
                </ThemedView>
                <ThemedView style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Bottom Blade:</Text>
                  <Text style={styles.resultValue}>
                    {calculation.bottomBladeReading.toFixed(2)} inches
                  </Text>
                </ThemedView>

                <Button onPress={resetToDefaults} action="negative">
                  <ButtonText>Reset to Defaults</ButtonText>
                </Button>

                {calculation.isNonStandardPaperSize && (
                  <ThemedView
                    style={[
                      styles.easelInstructionBox,
                      { borderColor: tintColor, backgroundColor: `${tintColor}20` },
                    ]}
                  >
                    <Text style={styles.easelInstructionTitle}>Non-Standard Paper Size</Text>
                    <Text style={styles.easelInstructionText}>
                      Position paper in the {calculation.easelSizeLabel} slot all the way to the left.
                    </Text>
                  </ThemedView>
                )}

                {bladeWarning && (
                  <Alert action="error" variant="outline" mt="$2">
                    <AlertIcon as={InfoIcon} mr="$3" />
                    <AlertText>{bladeWarning}</AlertText>
                  </Alert>
                )}
                {minBorderWarning && (
                  <Alert action="error" variant="outline" mt="$2">
                    <AlertIcon as={InfoIcon} mr="$3" />
                    <AlertText>{minBorderWarning}</AlertText>
                  </Alert>
                )}
                {paperSizeWarning && (
                  <Alert action="warning" variant="outline" mt="$2">
                    <AlertIcon as={InfoIcon} mr="$3" />
                    <AlertText>{paperSizeWarning}</AlertText>
                  </Alert>
                )}
              </ThemedView>
            </ThemedView>
          )}

          {/* ---------- FORM SECTION ---------- */}
          <Box
            style={[
              styles.form,
              Platform.OS === 'web' && isDesktop && styles.webForm,
            ]}
          >
            {/* Aspect ratio */}
            <ThemedSelect
              label="Aspect Ratio:"
              selectedValue={aspectRatio}
              onValueChange={setAspectRatio}
              items={ASPECT_RATIOS}
              placeholder="Select Aspect Ratio"
            />

            {/* Custom aspect ratio inputs */}
            {aspectRatio === 'custom' && (
              <Box style={styles.formGroup}>
                <Box style={styles.row}>
                  <Box style={styles.inputGroup}>
                    <Text style={styles.label}>width:</Text>
                    <TextInput
                      style={[styles.input, { color: textColor, borderColor }]}
                      value={String(customAspectWidth)}
                      onChangeText={setCustomAspectWidth}
                      keyboardType="numeric"
                      placeholder="Width"
                      defaultValue="2"
                      placeholderTextColor={borderColor}
                    />
                  </Box>
                  <Box style={styles.inputGroup}>
                    <Text style={styles.label}>height:</Text>
                    <TextInput
                      style={[styles.input, { color: textColor, borderColor }]}
                      value={String(customAspectHeight)}
                      onChangeText={setCustomAspectHeight}
                      keyboardType="numeric"
                      placeholder="Height"
                      defaultValue="3"
                      placeholderTextColor={borderColor}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {/* Paper size */}
            <ThemedSelect
              label="Paper Size:"
              selectedValue={paperSize}
              onValueChange={setPaperSize}
              items={PAPER_SIZES}
              placeholder="Select Paper Size"
            />

            {/* Custom paper size inputs */}
            {paperSize === 'custom' && (
              <Box style={styles.formGroup}>
                <Box style={styles.row}>
                  <Box style={styles.inputGroup}>
                    <Text style={styles.label}>Width (inches):</Text>
                    <TextInput
                      style={[styles.input, { color: textColor, borderColor }]}
                      value={String(customPaperWidth)}
                      onChangeText={setCustomPaperWidth}
                      keyboardType="numeric"
                      placeholder="Width"
                      defaultValue="8"
                      placeholderTextColor={borderColor}
                    />
                  </Box>
                  <Box style={styles.inputGroup}>
                    <Text style={styles.label}>Height (inches):</Text>
                    <TextInput
                      style={[styles.input, { color: textColor, borderColor }]}
                      value={String(customPaperHeight)}
                      onChangeText={setCustomPaperHeight}
                      keyboardType="numeric"
                      placeholder="Height"
                      defaultValue="10"
                      placeholderTextColor={borderColor}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {/* Minimum border */}
            <Box style={styles.formGroup}>
              <LabeledSliderInput
                label="Minimum Border (inches):"
                value={minBorder}
                onChange={setMinBorder}
                min={SLIDER_MIN_BORDER}
                max={SLIDER_MAX_BORDER}
                step={SLIDER_STEP_BORDER}
                labels={BORDER_SLIDER_LABELS}
                textColor={textColor}
                borderColor={borderColor}
                tintColor={tintColor}
                inputWidth={Platform.OS === 'web' && isDesktop ? 80 : undefined}
              />
            </Box>

            {/* Toggles */}
            <Box style={styles.togglesRow}>
              <Box style={styles.toggleColumn}>
                <Box style={styles.row}>
                  <Text style={styles.label}>Enable Offsets:</Text>
                  <Switch
                    value={enableOffset}
                    onValueChange={setEnableOffset}
                    trackColor={{ false: borderColor, true: tintColor }}
                    thumbColor={enableOffset ? tintColor : '#f4f3f4'}
                  />
                </Box>
              </Box>

              <Box style={styles.toggleColumn}>
                <Box style={styles.row}>
                  <Text style={styles.label}>Show Easel Blades:</Text>
                  <Switch
                    value={showBlades}
                    onValueChange={setShowBlades}
                    trackColor={{ false: borderColor, true: tintColor }}
                    thumbColor={showBlades ? tintColor : '#f4f3f4'}
                  />
                </Box>
              </Box>
            </Box>

            {/* Offset controls */}
            {enableOffset && (
              <>
                <Box style={styles.formGroup}>
                  <Box style={styles.row}>
                    <Text style={styles.label}>ignore min border:</Text>
                    <Switch
                      value={ignoreMinBorder}
                      onValueChange={setIgnoreMinBorder}
                      trackColor={{ false: borderColor, true: tintColor }}
                      thumbColor={ignoreMinBorder ? tintColor : '#f4f3f4'}
                    />
                  </Box>
                  {ignoreMinBorder && (
                    <Text style={styles.infoText}>
                      Print can be positioned freely but will stay within paper edges
                    </Text>
                  )}
                </Box>

                <Box style={styles.formGroup}>
                  <Box style={[styles.row, styles.offsetRow]}>
                    {/* Horizontal offset */}
                    <Box style={styles.inputGroup}>
                      <LabeledSliderInput
                        label="horizontal offset:"
                        value={horizontalOffset}
                        onChange={setHorizontalOffset}
                        min={OFFSET_SLIDER_MIN}
                        max={OFFSET_SLIDER_MAX}
                        step={OFFSET_SLIDER_STEP}
                        labels={OFFSET_SLIDER_LABELS}
                        textColor={textColor}
                        borderColor={borderColor}
                        tintColor={tintColor}
                        warning={!!offsetWarning}
                      />
                    </Box>

                    {/* Vertical offset */}
                    <Box style={styles.inputGroup}>
                      <LabeledSliderInput
                        label="vertical offset:"
                        value={verticalOffset}
                        onChange={setVerticalOffset}
                        min={OFFSET_SLIDER_MIN}
                        max={OFFSET_SLIDER_MAX}
                        step={OFFSET_SLIDER_STEP}
                        labels={OFFSET_SLIDER_LABELS}
                        textColor={textColor}
                        borderColor={borderColor}
                        tintColor={tintColor}
                        warning={!!offsetWarning}
                      />
                    </Box>
                  </Box>

                  {offsetWarning && (
                    <Alert action="warning" variant="outline" mt="$2">
                      <AlertIcon as={InfoIcon} mr="$3" />
                      <AlertText>{offsetWarning}</AlertText>
                    </Alert>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* ---------- INFO SECTION ---------- */}
        <Box
          style={[
            styles.infoSection,
            Platform.OS === 'web' && isDesktop && styles.webInfoSection,
          ]}
        >
          <Text style={styles.infoTitle}>About this Tool</Text>

          <Text style={styles.infoContentText}>
            The border calculator helps you determine the optimal placement of your enlarger easel blades when printing photos, ensuring consistent and aesthetically pleasing borders.
          </Text>

          <Text style={styles.infoSubtitle}>How to Use:</Text>
          {[
            '1. Select your desired aspect ratio (the ratio of your negative or image)',
            "2. Choose your paper size (the size of photo paper you're printing on)",
            '3. Set your minimum border width (at least 0.5" recommended)',
            '4. Optionally enable offsets to shift the image from center',
            '5. View the blade positions in the results section',
          ].map((t) => (
            <Text key={t} style={styles.infoContentText}>
              {t}
            </Text>
          ))}

          <Text style={styles.infoSubtitle}>Blade Measurements:</Text>
          <Text style={styles.infoContentText}>
            The measurements shown are distances from the edge of your enlarger baseboard to where each blade should be positioned. For non-standard paper sizes (sizes that don't have a standard easel slot), follow the instructions to place your paper in the appropriate easel slot.
          </Text>

          <Text style={styles.infoSubtitle}>Tips:</Text>
          {[
            '• Easels only provide markings for quarter-inch increments, so you are on your own for measuring the blade positions with a ruler.',
            '• For uniform borders, keep offsets at 0',
            '• The "flip paper orientation" button rotates the paper between portrait and landscape',
            '• The "flip aspect ratio" button swaps the width and height of your image',
          ].map((t) => (
            <Text key={t} style={styles.infoContentText}>
              {t}
            </Text>
          ))}
        </Box>
      </Box>
    </ScrollView>
  );
}

/* ------------------ StyleSheet (unchanged) ------------------ */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' || Platform.OS === 'android' ? 100 : 80,
  },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 24, textAlign: 'center' },
  subtitle: { fontSize: 20 },
  form: { gap: 16, width: '100%' },
  formGroup: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  label: { fontSize: 16, marginBottom: Platform.OS === 'web' ? 0 : 4 },
  inputGroup: { flex: 1, gap: 4 },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  previewSection: {
    gap: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: Platform.OS === 'web' ? 0 : 32,
  },
  previewContainer: { position: 'relative', backgroundColor: 'transparent', overflow: 'hidden' },
  paperPreview: { position: 'relative', borderWidth: 1, backgroundColor: 'transparent', overflow: 'hidden' },
  printPreview: { position: 'absolute' },
  blade: { position: 'absolute', boxShadow: '0px 2px 4px rgba(0,0,0,0.25)', elevation: 5 },
  bladeVertical: { top: -1000, bottom: -1000 },
  bladeHorizontal: { left: -1000, right: -1000 },
  resultContainer: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    minWidth: Platform.OS === 'web' ? 140 : 160,
    justifyContent: 'center',
  },
  resultRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 16 },
  resultLabel: { fontSize: 16, textAlign: 'right', fontFamily: getPlatformFont(), flex: 1 },
  resultValue: { fontSize: 16, textAlign: 'left', fontFamily: getPlatformFont(), flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: 16 },
  webContent: { maxWidth: 1024, marginHorizontal: 'auto', width: '100%', padding: 24 },
  mainContent: { width: '100%' },
  webMainContent: { flexDirection: 'row', gap: 32, alignItems: 'flex-start' },
  webForm: { flex: 1, maxWidth: 480 },
  webPreviewSection: { flex: 1, alignSelf: 'stretch', marginBottom: 0 },
  inputWarning: { borderColor: '#FFA500', borderWidth: 2 },
  infoText: { fontSize: 14, marginBottom: 8, lineHeight: 20 },
  togglesRow: { flexDirection: 'row', gap: 16, width: '100%' },
  toggleColumn: { flex: 1 },
  easelInstructionBox: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
    width: '100%',
  },
  easelInstructionTitle: { fontSize: 16, textAlign: 'center', marginBottom: 8 },
  easelInstructionText: { fontSize: 14, textAlign: 'center' },
  infoSection: { padding: 16, marginTop: 16, borderTopWidth: 1, borderTopColor: '#ccc' },
  infoTitle: { fontSize: 20, textAlign: 'center', marginBottom: 16 },
  infoSubtitle: { fontSize: 16, marginTop: 16, marginBottom: 8 },
  infoContentText: { fontSize: 14, marginBottom: 8, lineHeight: 20 },
  webInfoSection: {
    maxWidth: 1024,
    marginHorizontal: 'auto',
    width: '100%',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  minBorderInput: { width: 80, flex: 0 },
  sliderContainer: { flex: 1, marginHorizontal: 8 },
  mobileSliderContainer: { marginTop: 16, width: '100%' },
  offsetRow: { alignItems: 'flex-start', gap: 24 },
});
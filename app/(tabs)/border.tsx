import React, { useRef, useEffect } from 'react';
import {
  Platform,
  TextInput,   // ← still used only for the print-preview sliders; feel free to migrate later
  Switch,      // ← same here
  Animated,    // ← Added for animations
} from 'react-native';
// why is the vercel build failing?
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
import { useThemeColor } from '@/hooks/useThemeColor';
import { getPlatformFont } from '@/styles/common';
import { ASPECT_RATIOS, PAPER_SIZES } from '@/constants/border';
import { ThemedSelect } from '@/components/ThemedSelect';
import { DEFAULT_BORDER_PRESETS } from '@/constants/borderPresets';
import { useBorderPresets } from '@/hooks/useBorderPresets';
import { 
  EditIcon, 
  RepeatIcon, 
  ArrowUpIcon,
  CheckIcon,
  TrashIcon
} from '@/components/ui/icon';
import { RotateCwSquare, Proportions }  from "lucide-react-native"
import type { BorderPreset } from '@/types/borderPresetTypes';

import {
  Box,
  Text,
  ScrollView,
  HStack,
  Alert,
  AlertIcon,
  AlertText,
  InfoIcon,
} from '@gluestack-ui/themed';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';

// Animated Preview Component
const AnimatedPreview = ({ calculation, showBlades, borderColor }: {
  calculation: any;
  showBlades: boolean;
  borderColor: string;
}) => {
  const animatedValues = useRef({
    previewWidth: new Animated.Value(calculation?.previewWidth || 0),
    previewHeight: new Animated.Value(calculation?.previewHeight || 0),
    printLeft: new Animated.Value(calculation?.leftBorderPercent || 0),
    printTop: new Animated.Value(calculation?.topBorderPercent || 0),
    printWidth: new Animated.Value(calculation?.printWidthPercent || 0),
    printHeight: new Animated.Value(calculation?.printHeightPercent || 0),
    bladeOpacity: new Animated.Value(showBlades ? 1 : 0),
    leftBladePosition: new Animated.Value(calculation?.leftBorderPercent || 0),
    rightBladePosition: new Animated.Value(calculation?.rightBorderPercent || 0),
    topBladePosition: new Animated.Value(calculation?.topBorderPercent || 0),
    bottomBladePosition: new Animated.Value(calculation?.bottomBorderPercent || 0),
  }).current;

  useEffect(() => {
    if (!calculation) return;

    const animationConfig = {
      duration: 100,
      useNativeDriver: false,
    };

    Animated.parallel([
      // Animate container dimensions
      Animated.timing(animatedValues.previewWidth, {
        toValue: calculation.previewWidth,
        ...animationConfig,
      }),
      Animated.timing(animatedValues.previewHeight, {
        toValue: calculation.previewHeight,
        ...animationConfig,
      }),
      // Animate print area position and size
      Animated.timing(animatedValues.printLeft, {
        toValue: calculation.leftBorderPercent,
        ...animationConfig,
      }),
      Animated.timing(animatedValues.printTop, {
        toValue: calculation.topBorderPercent,
        ...animationConfig,
      }),
      Animated.timing(animatedValues.printWidth, {
        toValue: calculation.printWidthPercent,
        ...animationConfig,
      }),
      Animated.timing(animatedValues.printHeight, {
        toValue: calculation.printHeightPercent,
        ...animationConfig,
      }),
      // Animate blade positions
      Animated.timing(animatedValues.leftBladePosition, {
        toValue: calculation.leftBorderPercent,
        ...animationConfig,
      }),
      Animated.timing(animatedValues.rightBladePosition, {
        toValue: calculation.rightBorderPercent,
        ...animationConfig,
      }),
      Animated.timing(animatedValues.topBladePosition, {
        toValue: calculation.topBorderPercent,
        ...animationConfig,
      }),
      Animated.timing(animatedValues.bottomBladePosition, {
        toValue: calculation.bottomBorderPercent,
        ...animationConfig,
      }),
    ]).start();
  }, [calculation]);

  useEffect(() => {
    Animated.timing(animatedValues.bladeOpacity, {
      toValue: showBlades ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [showBlades]);

  if (!calculation) return null;

  return (
    <Animated.View
      style={{
        position: 'relative', 
        backgroundColor: 'transparent', 
        overflow: 'hidden',
        width: animatedValues.previewWidth,
        height: animatedValues.previewHeight,
        borderColor,
      }}
    >
      <Animated.View
        style={{
          position: 'relative', 
          borderWidth: 1, 
          backgroundColor: 'white', 
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          borderColor,
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            backgroundColor: 'grey',
            left: animatedValues.printLeft.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            top: animatedValues.printTop.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            width: animatedValues.printWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            height: animatedValues.printHeight.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
        <Animated.View
          style={{
            position: 'absolute', 
            boxShadow: '0px 2px 4px rgba(0,0,0,0.25)', 
            elevation: 5,
            top: -1000, 
            bottom: -1000,
            opacity: animatedValues.bladeOpacity,
            left: animatedValues.leftBladePosition.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            transform: [{ translateX: -calculation.bladeThickness }],
            backgroundColor: borderColor,
            width: calculation.bladeThickness,
          }}
        />
        <Animated.View
          style={{
            position: 'absolute', 
            boxShadow: '0px 2px 4px rgba(0,0,0,0.25)', 
            elevation: 5,
            top: -1000, 
            bottom: -1000,
            opacity: animatedValues.bladeOpacity,
            right: animatedValues.rightBladePosition.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            transform: [{ translateX: calculation.bladeThickness }],
            backgroundColor: borderColor,
            width: calculation.bladeThickness,
          }}
        />
        <Animated.View
          style={{
            position: 'absolute', 
            boxShadow: '0px 2px 4px rgba(0,0,0,0.25)', 
            elevation: 5,
            left: -1000, 
            right: -1000,
            opacity: animatedValues.bladeOpacity,
            top: animatedValues.topBladePosition.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            transform: [{ translateY: -calculation.bladeThickness }],
            backgroundColor: borderColor,
            height: calculation.bladeThickness,
          }}
        />
        <Animated.View
          style={{
            position: 'absolute', 
            boxShadow: '0px 2px 4px rgba(0,0,0,0.25)', 
            elevation: 5,
            left: -1000, 
            right: -1000,
            opacity: animatedValues.bladeOpacity,
            bottom: animatedValues.bottomBladePosition.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            transform: [{ translateY: calculation.bladeThickness }],
            backgroundColor: borderColor,
            height: calculation.bladeThickness,
          }}
        />
      </Animated.View>
    </Animated.View>
  );
};

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
    applyPreset,
  } = useBorderCalculator();

  const { presets, addPreset, updatePreset, removePreset } = useBorderPresets();
  const [selectedPresetId, setSelectedPresetId] = React.useState('');
  const [presetName, setPresetName] = React.useState('');
  const [isEditingPreset, setIsEditingPreset] = React.useState(false);
  const loadedPresetRef = React.useRef<BorderPreset | null>(null);

  const currentSettings = {
    aspectRatio,
    paperSize,
    customAspectWidth,
    customAspectHeight,
    customPaperWidth,
    customPaperHeight,
    minBorder,
    enableOffset,
    ignoreMinBorder,
    horizontalOffset,
    verticalOffset,
    showBlades,
    isLandscape,
    isRatioFlipped,
  };

  const deepEqual = (a: any, b: any) =>
    JSON.stringify(a) === JSON.stringify(b);

  const presetDirty = React.useMemo(
    () =>
      loadedPresetRef.current &&
      !deepEqual(loadedPresetRef.current.settings, currentSettings),
    [currentSettings]
  );

  React.useEffect(() => {
    if (presetDirty) setIsEditingPreset(true);
  }, [presetDirty]);

  const presetItems = [
    ...presets.map(p => ({ label: p.name, value: p.id })),
    { label: '────────', value: '__divider__' },
    ...DEFAULT_BORDER_PRESETS.map(p => ({ label: p.name, value: p.id })),
  ];

  const handleSelectPreset = (id: string) => {
    if (id === '__divider__') return;
    setSelectedPresetId(id);
    const preset = presets.find(p => p.id === id) ||
      DEFAULT_BORDER_PRESETS.find(p => p.id === id);
    if (preset) {
      applyPreset(preset.settings);
      setPresetName(preset.name);
      loadedPresetRef.current = preset;
      setIsEditingPreset(false);
    }
  };

  const savePreset = () => {
    if (!presetName.trim()) return;
    const newPreset = {
      id: 'user-' + Date.now(),
      name: presetName.trim(),
      settings: currentSettings,
    };
    addPreset(newPreset);
    loadedPresetRef.current = newPreset;
    setSelectedPresetId(newPreset.id);
    setIsEditingPreset(false);
  };

  const updatePresetHandler = () => {
    if (!selectedPresetId) return;
    const updated = { name: presetName.trim(), settings: currentSettings };
    updatePreset(selectedPresetId, updated);
    loadedPresetRef.current = { ...(loadedPresetRef.current as BorderPreset), ...updated, id: selectedPresetId };
    setIsEditingPreset(false);
  };

  const deletePresetHandler = () => {
    if (!selectedPresetId) return;
    removePreset(selectedPresetId);
    setSelectedPresetId('');
    setPresetName('');
    loadedPresetRef.current = null;
    setIsEditingPreset(false);
  };

  return (
    <ScrollView
      sx={{ 
        flex: 1, 
        bg: backgroundColor 
      }}
      contentContainerStyle={{ 
        flexGrow: 1,
        paddingBottom: Platform.OS === 'ios' || Platform.OS === 'android' ? 100 : 80,
      }}
    >
      {/* --------------- MAIN WRAPPER --------------- */}
      <Box sx={{ 
        flex: 1, 
        p: 16,
        ...(Platform.OS === 'web' && { 
          maxWidth: 1024, 
          marginHorizontal: 'auto', 
          width: '100%', 
          p: 24 
        })
      }}>
        {/* ------------ HEADER ------------ */}
        <Box sx={{ 
          flexDirection: 'row', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%', 
          mb: 16 
        }}>
          <Text sx={{ fontSize: 24, textAlign: 'center' }}>border calculator</Text>
        </Box>

        {/* ------------ BODY ------------ */}
        <Box
          sx={{
            width: '100%',
            ...(Platform.OS === 'web' && isDesktop && { 
              flexDirection: 'row', 
              gap: 32, 
              alignItems: 'flex-start' 
            })
          }}
        >
          {/* ---------- ANIMATED PREVIEW & RESULTS ---------- */}
          {calculation && (
            <Box
              sx={{
                gap: 16,
                alignItems: 'center',
                width: '100%',
                mb: Platform.OS === 'web' ? 0 : 32,
                ...(Platform.OS === 'web' && isDesktop && { 
                  flex: 1, 
                  alignSelf: 'stretch', 
                  mb: 0 
                })
              }}
            >
              {/* -- ANIMATED PREVIEW CANVAS -- */}
              <AnimatedPreview 
                calculation={calculation}
                showBlades={showBlades}
                borderColor={borderColor}
              />

              {/* orientation controls */}
              <Box sx={{ 
                flex: 1, 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                gap: 12 
              }}>
                <Button onPress={() => setIsLandscape(!isLandscape)} variant="solid" action="primary" size="sm">
                  <ButtonIcon as={RotateCwSquare} />
                  <ButtonText style={{ marginLeft: 18 }}>Flip Paper Orientation</ButtonText>
                </Button>
                <Button onPress={() => setIsRatioFlipped(!isRatioFlipped)} variant="solid" action="primary" size="sm">
                  <ButtonIcon as={Proportions} />
                  <ButtonText style={{ marginLeft: 18 }}>Flip Aspect Ratio</ButtonText>
                </Button>
              </Box>

              {/* result read-out */}
              <Box sx={{
                alignItems: 'center',
                gap: 8,
                width: '100%',
                maxWidth: 400,
                alignSelf: 'center',
                minWidth: Platform.OS === 'web' ? 140 : 160,
                justifyContent: 'center',
              }}>
                <Text sx={{ fontSize: 20 }}>Result</Text>

                <Box sx={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 16 }}>
                  <Text sx={{ fontSize: 16, textAlign: 'right', fontFamily: getPlatformFont(), flex: 1 }}>Image Dimensions:</Text>
                  <Text sx={{ fontSize: 16, textAlign: 'left', fontFamily: getPlatformFont(), flex: 1 }}>
                    {calculation.printWidth.toFixed(2)} x {calculation.printHeight.toFixed(2)} inches
                  </Text>
                </Box>
                <Box sx={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 16 }}>
                  <Text sx={{ fontSize: 16, textAlign: 'right', fontFamily: getPlatformFont(), flex: 1 }}>Left Blade:</Text>
                  <Text sx={{ fontSize: 16, textAlign: 'left', fontFamily: getPlatformFont(), flex: 1 }}>
                    {calculation.leftBladeReading.toFixed(2)} inches
                  </Text>
                </Box>
                <Box sx={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 16 }}>
                  <Text sx={{ fontSize: 16, textAlign: 'right', fontFamily: getPlatformFont(), flex: 1 }}>Right Blade:</Text>
                  <Text sx={{ fontSize: 16, textAlign: 'left', fontFamily: getPlatformFont(), flex: 1 }}>
                    {calculation.rightBladeReading.toFixed(2)} inches
                  </Text>
                </Box>
                <Box sx={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 16 }}>
                  <Text sx={{ fontSize: 16, textAlign: 'right', fontFamily: getPlatformFont(), flex: 1 }}>Top Blade:</Text>
                  <Text sx={{ fontSize: 16, textAlign: 'left', fontFamily: getPlatformFont(), flex: 1 }}>
                    {calculation.topBladeReading.toFixed(2)} inches
                  </Text>
                </Box>
                <Box sx={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 16 }}>
                  <Text sx={{ fontSize: 16, textAlign: 'right', fontFamily: getPlatformFont(), flex: 1 }}>Bottom Blade:</Text>
                  <Text sx={{ fontSize: 16, textAlign: 'left', fontFamily: getPlatformFont(), flex: 1 }}>
                    {calculation.bottomBladeReading.toFixed(2)} inches
                  </Text>
                </Box>

                <Button onPress={resetToDefaults} variant="solid" action="negative" size="lg">
                  <ButtonIcon as={RepeatIcon} />
                  <ButtonText style={{ marginLeft: 18 }}>Reset to Defaults</ButtonText>
                </Button>

                {calculation.isNonStandardPaperSize && (
                  <Box
                    sx={{
                      borderWidth: 1,
                      p: 16,
                      borderRadius: 8,
                      mt: 16,
                      mb: 8,
                      width: '100%',
                      borderColor: tintColor, 
                      backgroundColor: `${tintColor}20`
                    }}
                  >
                    <Text sx={{ fontSize: 16, textAlign: 'center', mb: 8 }}>Non-Standard Paper Size</Text>
                    <Text sx={{ fontSize: 14, textAlign: 'center' }}>
                      Position paper in the {calculation.easelSizeLabel} slot all the way to the left.
                    </Text>
                  </Box>
                )}

                {bladeWarning && (
                  <Box style={{ marginTop: 8 }}>
                    <Alert action="error" variant="outline">
                      <AlertIcon as={InfoIcon} />
                      <AlertText>{bladeWarning}</AlertText>
                    </Alert>
                  </Box>
                )}
                {minBorderWarning && (
                  <Box style={{ marginTop: 8 }}>
                    <Alert action="error" variant="outline">
                      <AlertIcon as={InfoIcon} />
                      <AlertText>{minBorderWarning}</AlertText>
                    </Alert>
                  </Box>
                )}
                {paperSizeWarning && (
                  <Box style={{ marginTop: 8 }}>
                    <Alert action="warning" variant="outline">
                      <AlertIcon as={InfoIcon} />
                      <AlertText>{paperSizeWarning}</AlertText>
                    </Alert>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* ---------- FORM SECTION ---------- */}
          <Box
            sx={{
              gap: 16, 
              width: '100%',
              ...(Platform.OS === 'web' && isDesktop && { 
                flex: 1, 
                maxWidth: 480 
              })
            }}
          >
          <Box sx={{ gap: 8 }}>
            <HStack style={{ gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Box style={{ flex: 1 }}>
              <ThemedSelect
                label="Presets:"
                selectedValue={selectedPresetId}
                onValueChange={handleSelectPreset}
                items={presetItems as any}
                placeholder="Select Preset"
              />
            </Box>
            {!isEditingPreset && !presetDirty && (
              <Box style={{ marginTop: 12 }}>
                <Button onPress={() => setIsEditingPreset(true)} size="md" variant="outline">
                  <ButtonIcon as={EditIcon} />
                </Button>
              </Box>
            )}
            </HStack>
            {(isEditingPreset || presetDirty) && (
              <>
              <Text sx={{ fontSize: 20 }}>Preset Name</Text>
                <TextInput
                  style={{
                    height: 40,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    fontSize: 16,
                    marginBottom: 4,
                    color: textColor, 
                    borderColor
                  }}
                  value={presetName}
                  onChangeText={setPresetName}
                  placeholder="Preset Name"
                  placeholderTextColor={borderColor}
                />
                <HStack style={{ gap: 8, justifyContent: 'space-between' }}>
                  <Button onPress={savePreset} variant="solid" action="positive" size="md">
                    <ButtonIcon as={CheckIcon} />
                    <ButtonText style={{ marginLeft: 18 }}>Save</ButtonText>
                  </Button>
                  <Button onPress={updatePresetHandler} variant="solid" action="primary" size="md" isDisabled={!selectedPresetId}>
                    <ButtonIcon as={ArrowUpIcon} />
                    <ButtonText style={{ marginLeft: 18 }}>Update</ButtonText>
                  </Button>
                  <Button onPress={deletePresetHandler} variant="solid" action="negative" size="md" isDisabled={!selectedPresetId}>
                    <ButtonIcon as={TrashIcon} />
                    <ButtonText style={{ marginLeft: 18 }}>Delete</ButtonText>
                  </Button>
                </HStack>
              </>
            )}
          </Box>

          {/* Aspect ratio */}
          <ThemedSelect
            label="Aspect Ratio:"
            selectedValue={aspectRatio}
              onValueChange={setAspectRatio}
              items={ASPECT_RATIOS as any}
              placeholder="Select Aspect Ratio"
            />

            {/* Custom aspect ratio inputs */}
            {aspectRatio === 'custom' && (
              <Box sx={{ gap: 8 }}>
                <Box sx={{ flexDirection: 'row', alignItems: 'center', gap: 16, mt: 8 }}>
                  <Box sx={{ flex: 1, gap: 4 }}>
                    <Text sx={{ fontSize: 16, mb: Platform.OS === 'web' ? 0 : 4 }}>width:</Text>
                    <TextInput
                      style={{
                        height: 40,
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        fontSize: 16,
                        marginBottom: 4,
                        color: textColor, 
                        borderColor
                      }}
                      value={String(customAspectWidth)}
                      onChangeText={setCustomAspectWidth}
                      keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                      placeholder="Width"
                      defaultValue="2"
                      placeholderTextColor={borderColor}
                    />
                  </Box>
                  <Box sx={{ flex: 1, gap: 4 }}>
                    <Text sx={{ fontSize: 16, mb: Platform.OS === 'web' ? 0 : 4 }}>height:</Text>
                    <TextInput
                      style={{
                        height: 40,
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        fontSize: 16,
                        marginBottom: 4,
                        color: textColor, 
                        borderColor
                      }}
                      value={String(customAspectHeight)}
                      onChangeText={setCustomAspectHeight}
                      keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
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
              items={PAPER_SIZES as any}
              placeholder="Select Paper Size"
            />

            {/* Custom paper size inputs */}
            {paperSize === 'custom' && (
              <Box sx={{ gap: 8 }}>
                <Box sx={{ flexDirection: 'row', alignItems: 'center', gap: 16, mt: 8 }}>
                  <Box sx={{ flex: 1, gap: 4 }}>
                    <Text sx={{ fontSize: 16, mb: Platform.OS === 'web' ? 0 : 4 }}>Width (inches):</Text>
                    <TextInput
                      style={{
                        height: 40,
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        fontSize: 16,
                        marginBottom: 4,
                        color: textColor, 
                        borderColor
                      }}
                      value={String(customPaperWidth)}
                      onChangeText={setCustomPaperWidth}
                      keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                      placeholder="Width"
                      defaultValue="8"
                      placeholderTextColor={borderColor}
                    />
                  </Box>
                  <Box sx={{ flex: 1, gap: 4 }}>
                    <Text sx={{ fontSize: 16, mb: Platform.OS === 'web' ? 0 : 4 }}>Height (inches):</Text>
                    <TextInput
                      style={{
                        height: 40,
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        fontSize: 16,
                        marginBottom: 4,
                        color: textColor, 
                        borderColor
                      }}
                      value={String(customPaperHeight)}
                      onChangeText={setCustomPaperHeight}
                      keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                      placeholder="Height"
                      defaultValue="10"
                      placeholderTextColor={borderColor}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {/* Minimum border */}
            <Box sx={{ gap: 8 }}>
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
                continuousUpdate={true}
              />
            </Box>

            {/* Toggles */}
            <Box sx={{ flexDirection: 'row', gap: 16, width: '100%' }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ flexDirection: 'row', alignItems: 'center', gap: 16, mt: 8 }}>
                  <Text sx={{ fontSize: 16, mb: Platform.OS === 'web' ? 0 : 4 }}>Enable Offsets:</Text>
                  <Switch
                    value={enableOffset}
                    onValueChange={setEnableOffset}
                    trackColor={{ false: borderColor, true: tintColor }}
                    thumbColor={enableOffset ? tintColor : '#f4f3f4'}
                  />
                </Box>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ flexDirection: 'row', alignItems: 'center', gap: 16, mt: 8 }}>
                  <Text sx={{ fontSize: 16, mb: Platform.OS === 'web' ? 0 : 4 }}>Show Easel Blades:</Text>
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
                <Box sx={{ gap: 8 }}>
                  <Box sx={{ flexDirection: 'row', alignItems: 'center', gap: 16, mt: 8 }}>
                    <Text sx={{ fontSize: 16, mb: Platform.OS === 'web' ? 0 : 4 }}>ignore min border:</Text>
                    <Switch
                      value={ignoreMinBorder}
                      onValueChange={setIgnoreMinBorder}
                      trackColor={{ false: borderColor, true: tintColor }}
                      thumbColor={ignoreMinBorder ? tintColor : '#f4f3f4'}
                    />
                  </Box>
                  {ignoreMinBorder && (
                    <Text sx={{ fontSize: 14, mb: 8, lineHeight: 20 }}>
                      Print can be positioned freely but will stay within paper edges
                    </Text>
                  )}
                </Box>

                <Box sx={{ gap: 8 }}>
                  <Box sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: 24, mt: 8 }}>
                    {/* Horizontal offset */}
                    <Box sx={{ flex: 1, gap: 4 }}>
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
                        continuousUpdate={true}
                      />
                    </Box>

                    {/* Vertical offset */}
                    <Box sx={{ flex: 1, gap: 4 }}>
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
                        continuousUpdate={true}
                      />
                    </Box>
                  </Box>

                  {offsetWarning && (
                    <Box style={{ marginTop: 8 }}>
                      <Alert action="warning" variant="outline">
                        <AlertIcon as={InfoIcon} />
                        <AlertText>{offsetWarning}</AlertText>
                      </Alert>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* ---------- INFO SECTION ---------- */}
        <Box
          sx={{
            p: 16, 
            mt: 16, 
            borderTopWidth: 1, 
            borderTopColor: '#ccc',
            ...(Platform.OS === 'web' && isDesktop && {
              maxWidth: 1024,
              marginHorizontal: 'auto',
              width: '100%',
              p: 24,
              borderTopWidth: 1,
              borderTopColor: '#ccc',
            })
          }}
        >
          <Text sx={{ fontSize: 20, textAlign: 'center', mb: 16 }}>About this Tool</Text>

          <Text sx={{ fontSize: 14, mb: 8, lineHeight: 20 }}>
            The border calculator helps you determine the optimal placement of your enlarger easel blades when printing photos, ensuring consistent and aesthetically pleasing borders.
          </Text>

          <Text sx={{ fontSize: 16, mt: 16, mb: 8 }}>How to Use:</Text>
          {[
            '1. Select your desired aspect ratio (the ratio of your negative or image)',
            "2. Choose your paper size (the size of photo paper you're printing on)",
            '3. Set your minimum border width (at least 0.5" recommended)',
            '4. Optionally enable offsets to shift the image from center',
            '5. View the blade positions in the results section',
          ].map((t) => (
            <Text key={t} sx={{ fontSize: 14, mb: 8, lineHeight: 20 }}>
              {t}
            </Text>
          ))}

          <Text sx={{ fontSize: 16, mt: 16, mb: 8 }}>Blade Measurements:</Text>
          <Text sx={{ fontSize: 14, mb: 8, lineHeight: 20 }}>
            The measurements shown are distances from the edge of your enlarger baseboard to where each blade should be positioned. For non-standard paper sizes (sizes that don't have a standard easel slot), follow the instructions to place your paper in the appropriate easel slot.
          </Text>

          <Text sx={{ fontSize: 16, mt: 16, mb: 8 }}>Tips:</Text>
          {[
            '• Easels only provide markings for quarter-inch increments, so you are on your own for measuring the blade positions with a ruler.',
            '• For uniform borders, keep offsets at 0',
            '• The "flip paper orientation" button rotates the paper between portrait and landscape',
            '• The "flip aspect ratio" button swaps the width and height of your image',
          ].map((t) => (
            <Text key={t} sx={{ fontSize: 14, mb: 8, lineHeight: 20 }}>
              {t}
            </Text>
          ))}
        </Box>
      </Box>
    </ScrollView>
  );
}

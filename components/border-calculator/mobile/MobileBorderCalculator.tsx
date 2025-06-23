import React, { useState, useEffect, useMemo } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { 
  Box, 
  ScrollView, 
  VStack, 
  HStack, 
  Button, 
  ButtonText, 
  ButtonIcon,
  useToast,
  Toast,
  ToastTitle,
  VStack as ToastVStack
} from '@gluestack-ui/themed';
import { 
  Drawer, 
  DrawerContent, 
  DrawerBody 
} from '@/components/ui/drawer/index';
import { useThemeColor } from '@/hooks/useThemeColor';
import { WarningAlert } from '@/components/ui/feedback';
import { useAnimationExperiment } from '@/hooks/useAnimationExperiment';
import { debugLog } from '@/utils/debugLogger';

// Mobile components
import { 
  BladeResultsDisplay, 
  CompactPreview, 
  SettingsButton,
} from './index';
import { ShareModal } from './ShareModal';
import { SaveBeforeShareModal } from './SaveBeforeShareModal';

// Inline sections instead of modals
import {
  PaperSizeSection,
  BorderSizeSection,
  PositionOffsetsSection,
  PresetsSection,
} from './sections';

// Icons
import { 
  ImageIcon, 
  RulerIcon, 
  MoveIcon, 
  RotateCcw,
  Eye,
  EyeOff,
  BookOpen,
  Share,
  Zap
} from 'lucide-react-native';

// Border calculator functionality
import { useBorderCalculator, useBorderPresets } from '@/hooks/borderCalculator';
import type { BorderPreset } from '@/types/borderPresetTypes';

// Debug helper (dev only)
if (__DEV__) {
  import('@/utils/deepLinkDebug');
}

// Active section type
type ActiveSection = 'paperSize' | 'borderSize' | 'positionOffsets' | 'presets';

interface MobileBorderCalculatorProps {
  loadedPresetFromUrl?: { name: string, settings: any, isFromUrl?: boolean } | null;
  clearLoadedPreset?: () => void;
}

export const MobileBorderCalculator: React.FC<MobileBorderCalculatorProps> = ({ loadedPresetFromUrl, clearLoadedPreset }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const toast = useToast();
  
  // Animation experiment hook for A/B testing
  const { engine, setEngine, isLoading: isAnimationLoading } = useAnimationExperiment();

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('paperSize');
  const [currentPreset, setCurrentPreset] = useState<BorderPreset | null>(null);
  
  // Share modal state
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isSaveBeforeShareModalVisible, setIsSaveBeforeShareModalVisible] = useState(false);
  
  // Track loaded preset to prevent infinite re-application
  const [hasAppliedLoadedPreset, setHasAppliedLoadedPreset] = useState(false);
  const [lastAppliedPresetId, setLastAppliedPresetId] = useState<string | null>(null);

  // Border calculator hooks
  const {
    aspectRatio, setAspectRatio, 
    paperSize, setPaperSize, 
    customAspectWidth, setCustomAspectWidth, 
    customAspectHeight, setCustomAspectHeight, 
    customPaperWidth, setCustomPaperWidth, 
    customPaperHeight, setCustomPaperHeight, 
    minBorder, setMinBorder, 
    enableOffset, setEnableOffset, 
    ignoreMinBorder, setIgnoreMinBorder, 
    horizontalOffset, setHorizontalOffset, 
    verticalOffset, setVerticalOffset, 
    showBlades, setShowBlades, 
    isLandscape, setIsLandscape, 
    isRatioFlipped, setIsRatioFlipped, 
    offsetWarning, bladeWarning, 
    calculation, minBorderWarning, 
    paperSizeWarning, resetToDefaults, 
    applyPreset 
  } = useBorderCalculator();

  const { presets, addPreset, updatePreset, removePreset } = useBorderPresets();

  // Optimized settings comparison using more efficient approach
  const currentSettingsHash = useMemo(() => {
    // Use array join for better performance than string template
    return [
      aspectRatio, paperSize, customAspectWidth, customAspectHeight,
      customPaperWidth, customPaperHeight, minBorder, enableOffset,
      ignoreMinBorder, horizontalOffset, verticalOffset, showBlades,
      isLandscape, isRatioFlipped
    ].join('|');
  }, [
    aspectRatio, paperSize, customAspectWidth, customAspectHeight,
    customPaperWidth, customPaperHeight, minBorder, enableOffset,
    ignoreMinBorder, horizontalOffset, verticalOffset, showBlades,
    isLandscape, isRatioFlipped
  ]);

  const presetSettingsHash = useMemo(() => {
    if (!currentPreset) return null;
    const settings = currentPreset.settings;
    return [
      settings.aspectRatio, settings.paperSize, settings.customAspectWidth, settings.customAspectHeight,
      settings.customPaperWidth, settings.customPaperHeight, settings.minBorder, settings.enableOffset,
      settings.ignoreMinBorder, settings.horizontalOffset, settings.verticalOffset, settings.showBlades,
      settings.isLandscape, settings.isRatioFlipped
    ].join('|');
  }, [currentPreset]);

  // Reset current preset when settings change (much faster than deep object comparison)
  useEffect(() => {
    if (currentPreset && currentSettingsHash !== presetSettingsHash) {
      setCurrentPreset(null);
    }
  }, [currentSettingsHash, presetSettingsHash, currentPreset]);

  // Handle loaded preset from URL
  useEffect(() => {
    if (!loadedPresetFromUrl) {
      debugLog('📱 [MOBILE CALC] No loadedPresetFromUrl, resetting applied state');
      setHasAppliedLoadedPreset(false);
      setLastAppliedPresetId(null);
      return;
    }

    // Create a unique ID for this preset based on its content
    const presetId = `${loadedPresetFromUrl.name}-${JSON.stringify(loadedPresetFromUrl.settings)}`;
    
    debugLog('📱 [MOBILE CALC] Mobile preset effect triggered, loadedPresetFromUrl:', loadedPresetFromUrl, 'hasAppliedLoadedPreset:', hasAppliedLoadedPreset, 'lastAppliedPresetId:', lastAppliedPresetId, 'currentPresetId:', presetId);
    
    // Check if this is a new preset (different from the last applied one)
    if (presetId !== lastAppliedPresetId) {
      debugLog('📱 [MOBILE CALC] New preset detected, applying:', loadedPresetFromUrl);
      applyPreset(loadedPresetFromUrl.settings);
      // Create a temporary preset object to indicate it's loaded
      const tempPreset = { 
        id: 'shared-' + Date.now(), 
        name: loadedPresetFromUrl.name, 
        settings: loadedPresetFromUrl.settings 
      };
      setCurrentPreset(tempPreset);
      setHasAppliedLoadedPreset(true);
      setLastAppliedPresetId(presetId);
      
      // Determine the appropriate toast message
      const isFromUrl = loadedPresetFromUrl.isFromUrl;
      const toastTitle = isFromUrl 
        ? `Shared preset "${loadedPresetFromUrl.name}" loaded!`
        : `Last settings "${loadedPresetFromUrl.name}" loaded`;
      
      debugLog('📱 [MOBILE CALC] Mobile showing toast, isFromUrl:', isFromUrl, 'title:', toastTitle);
      
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="success" variant="solid">
            <ToastVStack space="xs">
              <ToastTitle>{toastTitle}</ToastTitle>
            </ToastVStack>
          </Toast>
        ),
      });
      
      // Clear the preset after processing to prevent it from persisting
      if (clearLoadedPreset) {
        clearLoadedPreset();
      }
    } else {
      debugLog('📱 [MOBILE CALC] Same preset already applied, skipping');
    }
  }, [loadedPresetFromUrl, applyPreset, toast, lastAppliedPresetId, clearLoadedPreset]);

  // Memoized helper functions for display values to prevent parseFloat on every render
  const paperSizeDisplayValue = useMemo(() => {
    if (paperSize === 'custom') {
      return `${customPaperWidth}" × ${customPaperHeight}"`;
    }
    return paperSize;
  }, [paperSize, customPaperWidth, customPaperHeight]);

  const aspectRatioDisplayValue = useMemo(() => {
    if (aspectRatio === 'custom') {
      return `${customAspectWidth}:${customAspectHeight}`;
    }
    return aspectRatio;
  }, [aspectRatio, customAspectWidth, customAspectHeight]);

  const borderSizeDisplayValue = useMemo(() => {
    const borderValue = parseFloat(String(minBorder));
    return `${(isNaN(borderValue) ? 0 : borderValue).toFixed(2)}"`;
  }, [minBorder]);

  const positionDisplayValue = useMemo(() => {
    if (!enableOffset) return 'Centered';
    const hOffset = parseFloat(String(horizontalOffset));
    const vOffset = parseFloat(String(verticalOffset));
    return `H:${(isNaN(hOffset) ? 0 : hOffset).toFixed(1)} V:${(isNaN(vOffset) ? 0 : vOffset).toFixed(1)}`;
  }, [enableOffset, horizontalOffset, verticalOffset]);

  const presetsDisplayValue = useMemo(() => {
    if (!currentPreset) return 'Presets';
    return currentPreset.name.length > 10 ? currentPreset.name : `${currentPreset.name}`;
  }, [currentPreset]);

  // Current settings for sharing
  const currentSettings = useMemo(() => ({
    aspectRatio, paperSize, 
    customAspectWidth: parseFloat(String(customAspectWidth)) || 0,
    customAspectHeight: parseFloat(String(customAspectHeight)) || 0,
    customPaperWidth: parseFloat(String(customPaperWidth)) || 0,
    customPaperHeight: parseFloat(String(customPaperHeight)) || 0,
    minBorder: parseFloat(String(minBorder)) || 0,
    enableOffset, ignoreMinBorder,
    horizontalOffset: parseFloat(String(horizontalOffset)) || 0,
    verticalOffset: parseFloat(String(verticalOffset)) || 0,
    showBlades, isLandscape, isRatioFlipped,
  }), [
    aspectRatio, paperSize, customAspectWidth, customAspectHeight,
    customPaperWidth, customPaperHeight, minBorder, enableOffset,
    ignoreMinBorder, horizontalOffset, verticalOffset, showBlades,
    isLandscape, isRatioFlipped
  ]);

  // Action handlers
  const handleCopyResults = () => {
    // TODO: Implement copy results functionality
    console.log('Copy results');
  };

  const handleShare = () => {
    // Check if the current settings match a saved preset
    const matchedPreset = presets.find(p => JSON.stringify(p.settings) === JSON.stringify(currentSettings));

    if (matchedPreset) {
      // If it's a saved preset, share it directly
      setIsShareModalVisible(true);
    } else {
      // If not saved, open the modal to force saving
      setIsSaveBeforeShareModalVisible(true);
    }
  };

  const handleSavePreset = () => {
    setActiveSection('presets');
    setIsDrawerOpen(true);
  };

  const handleSaveAndShare = (presetName: string) => {
    // Create and save the new preset
    const newPreset = { 
      id: 'user-' + Date.now(), 
      name: presetName, 
      settings: currentSettings 
    };
    addPreset(newPreset);
    setCurrentPreset(newPreset);
    
    // Now open the share modal
    setIsShareModalVisible(true);
  };

  // Open drawer handlers
  const openDrawerSection = (section: ActiveSection) => {
    setActiveSection(section);
    setIsDrawerOpen(true);
  };

  // Close drawer handler
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Animation engine toggle handler (dev only)
  const toggleAnimationEngine = () => {
    if (!__DEV__) return;
    
    const newEngine = engine === 'legacy' ? 'reanimated' : 'legacy';
    debugLog(`🔄 [DEV SWITCH] Switching animation engine from ${engine} to ${newEngine}`);
    setEngine(newEngine);
  };

  if (!calculation) {
    return null;
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor }} 
      contentContainerStyle={{ 
        flexGrow: 1, 
        paddingBottom: Platform.OS === 'ios' || Platform.OS === 'android' ? 100 : 80 
      }}
    >
      <Box style={{ flex: 1, padding: 16 }}>
        <VStack space="lg">
          {/* Hero Section - Blade Results */}
          <BladeResultsDisplay 
            calculation={calculation}
            paperSize={paperSizeDisplayValue}
            aspectRatio={aspectRatioDisplayValue}
          />

          {/* Compact Preview */}
          <CompactPreview 
            calculation={calculation}
            showBlades={showBlades}
          />

          {/* Warnings */}
          {bladeWarning && <WarningAlert message={bladeWarning} action="error" />}
          {minBorderWarning && <WarningAlert message={minBorderWarning} action="error" />}
          {paperSizeWarning && <WarningAlert message={paperSizeWarning} action="warning" />}
          {offsetWarning && <WarningAlert message={offsetWarning} action="warning" />}

          {/* Settings Buttons */}
          <VStack space="xs" style={{ marginTop: 5 }}>
            <SettingsButton 
              label="Paper and Image Size"
              value={`${aspectRatioDisplayValue} on ${paperSizeDisplayValue}`}
              onPress={() => openDrawerSection('paperSize')}
              icon={ImageIcon}
            />

            <SettingsButton 
              label="Border Size"
              value={borderSizeDisplayValue}
              onPress={() => openDrawerSection('borderSize')}
              icon={RulerIcon}
            />

            <SettingsButton 
              label="Position & Offsets"
              value={positionDisplayValue}
              onPress={() => openDrawerSection('positionOffsets')}
              icon={MoveIcon}
            />
            <HStack space="sm" style={{ flex: 1 }}>
            <Box style={{ flex: 1 }}>
              <SettingsButton 
                label="Show Blades"                onPress={() => setShowBlades(!showBlades)}
                icon={showBlades ? Eye : EyeOff}
                showChevron={false}
                centerLabel={true}
              />
            </Box>

            <Box style={{ flex: 1 }}>
              <SettingsButton 
                value={presetsDisplayValue}
                onPress={() => openDrawerSection('presets')}
                icon={BookOpen}
              />
            </Box>

            <Box style={{ flex: 0.3 }}>
              <TouchableOpacity onPress={handleShare} activeOpacity={0.7}>
                <Box
                  style={{
                    backgroundColor: '#10B981',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    minHeight: 56,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Share size={20} color="white" />
                </Box>
              </TouchableOpacity>
            </Box>
            </HStack>
          </VStack>

          {/* Dev Only: Animation Engine Toggle */}
          {__DEV__ && (
            <Button 
              onPress={toggleAnimationEngine} 
              variant="outline" 
              action="secondary" 
              size="sm" 
              style={{ 
                marginTop: 8, 
                opacity: isAnimationLoading ? 0.5 : 1 
              }}
              disabled={isAnimationLoading}
            >
              <ButtonIcon as={Zap} size="sm" />
              <ButtonText style={{ marginLeft: 8, fontSize: 14 }}>
                Animation: {engine === 'reanimated' ? 'Reanimated v3' : 'Legacy Animated'}
              </ButtonText>
            </Button>
          )}

          {/* Reset Button */}
          <Button 
            onPress={resetToDefaults} 
            variant="solid" 
            action="negative" 
            size="md" 
            style={{ marginTop: 4 }}
          >
            <ButtonIcon as={RotateCcw} />
            <ButtonText style={{ marginLeft: 8 }}>Reset to Defaults</ButtonText>
          </Button>



          {/* Bottom Drawer */}
          <Drawer 
            isOpen={isDrawerOpen}
            onClose={closeDrawer}
            size="md"
            anchor="bottom"
          >
            <DrawerContent style={{ flex: 1, backgroundColor }}>
              <DrawerBody style={{ flex: 1, backgroundColor, padding: 0 }}>
                {activeSection === 'paperSize' && (
                  <PaperSizeSection 
                    onClose={closeDrawer}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                    customAspectWidth={customAspectWidth}
                    setCustomAspectWidth={setCustomAspectWidth}
                    customAspectHeight={customAspectHeight}
                    setCustomAspectHeight={setCustomAspectHeight}
                    paperSize={paperSize}
                    setPaperSize={setPaperSize}
                    customPaperWidth={customPaperWidth}
                    setCustomPaperWidth={setCustomPaperWidth}
                    customPaperHeight={customPaperHeight}
                    setCustomPaperHeight={setCustomPaperHeight}
                    isLandscape={isLandscape}
                    setIsLandscape={setIsLandscape}
                    isRatioFlipped={isRatioFlipped}
                    setIsRatioFlipped={setIsRatioFlipped}
                  />
                )}

                {activeSection === 'borderSize' && (
                  <BorderSizeSection 
                    onClose={closeDrawer}
                    minBorder={(() => {
                      const parsed = parseFloat(String(minBorder));
                      return isNaN(parsed) ? 0 : parsed;
                    })()}
                    setMinBorder={(value: number) => setMinBorder(String(value))}
                    minBorderWarning={minBorderWarning}
                  />
                )}

                {activeSection === 'positionOffsets' && (
                  <PositionOffsetsSection 
                    onClose={closeDrawer}
                    enableOffset={enableOffset}
                    setEnableOffset={setEnableOffset}
                    ignoreMinBorder={ignoreMinBorder}
                    setIgnoreMinBorder={setIgnoreMinBorder}
                    horizontalOffset={(() => {
                      const parsed = parseFloat(String(horizontalOffset));
                      return isNaN(parsed) ? 0 : parsed;
                    })()}
                    setHorizontalOffset={(value: number) => setHorizontalOffset(String(value))}
                    verticalOffset={(() => {
                      const parsed = parseFloat(String(verticalOffset));
                      return isNaN(parsed) ? 0 : parsed;
                    })()}
                    setVerticalOffset={(value: number) => setVerticalOffset(String(value))}
                    offsetWarning={offsetWarning}
                  />
                )}

                {activeSection === 'presets' && (
                  <PresetsSection 
                    onClose={closeDrawer}
                    presets={presets}
                    currentPreset={currentPreset}
                    onApplyPreset={(preset) => {
                      applyPreset(preset.settings);
                      setCurrentPreset(preset);
                      closeDrawer();
                    }}
                    onSavePreset={(name, settings) => {
                      const newPreset: BorderPreset = {
                        id: Date.now().toString(),
                        name,
                        settings,
                      };
                      addPreset(newPreset);
                      setCurrentPreset(newPreset);
                      closeDrawer();
                    }}
                    onUpdatePreset={(id, name, settings) => {
                      updatePreset(id, { name, settings });
                      if (currentPreset?.id === id) {
                        setCurrentPreset({ ...currentPreset, name, settings });
                      }
                    }}
                    onDeletePreset={(id) => {
                      removePreset(id);
                      if (currentPreset?.id === id) {
                        setCurrentPreset(null);
                      }
                    }}
                    getCurrentSettings={() => ({
                      aspectRatio,
                      paperSize,
                      customAspectWidth: parseFloat(String(customAspectWidth)) || 0,
                      customAspectHeight: parseFloat(String(customAspectHeight)) || 0,
                      customPaperWidth: parseFloat(String(customPaperWidth)) || 0,
                      customPaperHeight: parseFloat(String(customPaperHeight)) || 0,
                      minBorder: parseFloat(String(minBorder)) || 0,
                      enableOffset,
                      ignoreMinBorder,
                      horizontalOffset: parseFloat(String(horizontalOffset)) || 0,
                      verticalOffset: parseFloat(String(verticalOffset)) || 0,
                      showBlades,
                      isLandscape,
                      isRatioFlipped,
                    })}
                  />
                )}
              </DrawerBody>
            </DrawerContent>
          </Drawer>

          {/* Share Modal */}
          <ShareModal
            isVisible={isShareModalVisible}
            onClose={() => setIsShareModalVisible(false)}
            currentSettings={currentSettings}
            presetName={currentPreset?.name || 'Unnamed Preset'}
          />

          {/* Save Before Share Modal */}
          <SaveBeforeShareModal
            isVisible={isSaveBeforeShareModalVisible}
            onClose={() => setIsSaveBeforeShareModalVisible(false)}
            onSaveAndShare={handleSaveAndShare}
            currentSettings={currentSettings}
          />
        </VStack>
      </Box>
    </ScrollView>
  );
}; 
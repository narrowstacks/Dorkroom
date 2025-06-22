import React from 'react';
import { Platform } from 'react-native';
import { Box, ScrollView, VStack, Text } from '@gluestack-ui/themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { WarningAlert } from '@/components/ui/feedback';

// Mobile components
import { 
  BladeResultsDisplay, 
  CompactPreview, 
  SettingsButton, 
  ActionButtons,
  useMobileModalState 
} from './index';

// Modals
import {
  PaperSizeModal,
  BorderSizeModal,
  PositionOffsetsModal,
  AdvancedOptionsModal,
} from './modals';

// Icons
import { 
  ImageIcon, 
  RulerIcon, 
  MoveIcon, 
  SettingsIcon,
  RotateCcw
} from 'lucide-react-native';

// Border calculator functionality
import { useBorderCalculator, useBorderPresets } from '@/hooks/borderCalculator';
import { Button, ButtonText, ButtonIcon } from '@gluestack-ui/themed';

interface MobileBorderCalculatorProps {
  // This component will use the same hooks as the desktop version
}

export const MobileBorderCalculator: React.FC<MobileBorderCalculatorProps> = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const outline = useThemeColor({}, 'outline');

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

  const { presets } = useBorderPresets();

  // Modal state management
  const {
    paperSizeModalVisible,
    setBorderSizeModalVisible,
    setPositionOffsetsModalVisible,
    setAdvancedOptionsModalVisible,
    setPaperSizeModalVisible,
    borderSizeModalVisible,
    positionOffsetsModalVisible,
    advancedOptionsModalVisible,
  } = useMobileModalState();

  // Helper functions for display values
  const getPaperSizeDisplayValue = () => {
    if (paperSize === 'custom') {
      return `${customPaperWidth}&quot; × ${customPaperHeight}&quot;`;
    }
    return paperSize;
  };

  const getAspectRatioDisplayValue = () => {
    if (aspectRatio === 'custom') {
      return `${customAspectWidth}:${customAspectHeight}`;
    }
    return aspectRatio;
  };

  const getBorderSizeDisplayValue = () => {
    const borderValue = parseFloat(String(minBorder));
    return `${(isNaN(borderValue) ? 0 : borderValue).toFixed(2)}&quot;`;
  };

  const getPositionDisplayValue = () => {
    if (!enableOffset) return 'Centered';
    const hOffset = parseFloat(String(horizontalOffset));
    const vOffset = parseFloat(String(verticalOffset));
    return `H:${(isNaN(hOffset) ? 0 : hOffset).toFixed(1)} V:${(isNaN(vOffset) ? 0 : vOffset).toFixed(1)}`;
  };

  const getAdvancedDisplayValue = () => {
    return showBlades ? 'Blades On' : 'Blades Off';
  };

  // Action handlers
  const handleCopyResults = () => {
    // TODO: Implement copy results functionality
    console.log('Copy results');
  };

  const handleShare = () => {
    // TODO: Implement share functionality  
    console.log('Share');
  };

  const handleSavePreset = () => {
    // TODO: Implement save preset functionality
    console.log('Save preset');
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
            paperSize={getPaperSizeDisplayValue()}
            aspectRatio={getAspectRatioDisplayValue()}
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
          <VStack space="xs" style={{ marginTop: 40 }}>
            <SettingsButton 
              label="Paper and Image Size"
              value={`${getAspectRatioDisplayValue()} on ${getPaperSizeDisplayValue()}`}
              onPress={() => setPaperSizeModalVisible(true)}
              icon={ImageIcon}
            />

            <SettingsButton 
              label="Border Size"
              value={getBorderSizeDisplayValue()}
              onPress={() => setBorderSizeModalVisible(true)}
              icon={RulerIcon}
            />

            <SettingsButton 
              label="Position & Offsets"
              value={getPositionDisplayValue()}
              onPress={() => setPositionOffsetsModalVisible(true)}
              icon={MoveIcon}
            />

            <SettingsButton 
              label="Advanced Options"
              value={getAdvancedDisplayValue()}
              onPress={() => setAdvancedOptionsModalVisible(true)}
              icon={SettingsIcon}
            />
          </VStack>

          {/* Reset Button */}
          <Button 
            onPress={resetToDefaults} 
            variant="solid" 
            action="negative" 
            size="md" 
            style={{ marginTop: 16 }}
          >
            <ButtonIcon as={RotateCcw} />
            <ButtonText style={{ marginLeft: 8 }}>Reset to Defaults</ButtonText>
          </Button>

          {/* Action Buttons */}
          <ActionButtons 
            onCopyResults={handleCopyResults}
            onShare={handleShare}
            onSavePreset={handleSavePreset}
          />
        </VStack>

        {/* Modals */}
        <PaperSizeModal 
          isVisible={paperSizeModalVisible}
          onClose={() => setPaperSizeModalVisible(false)}
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

        <BorderSizeModal 
          isVisible={borderSizeModalVisible}
          onClose={() => setBorderSizeModalVisible(false)}
          minBorder={(() => {
            const parsed = parseFloat(String(minBorder));
            return isNaN(parsed) ? 0 : parsed;
          })()}
          setMinBorder={(value: number) => setMinBorder(String(value))}
          minBorderWarning={minBorderWarning}
        />

        <PositionOffsetsModal 
          isVisible={positionOffsetsModalVisible}
          onClose={() => setPositionOffsetsModalVisible(false)}
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

        <AdvancedOptionsModal 
          isVisible={advancedOptionsModalVisible}
          onClose={() => setAdvancedOptionsModalVisible(false)}
          showBlades={showBlades}
          setShowBlades={setShowBlades}
        />
      </Box>
    </ScrollView>
  );
}; 
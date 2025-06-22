import React from 'react';
import { Box, VStack, HStack, Text, Heading, Button, ButtonIcon } from '@gluestack-ui/themed';
import { LabeledSliderInput } from '@/components/ui/forms';
import { WarningAlert } from '@/components/ui/feedback';
import { useThemeColor } from '@/hooks/useThemeColor';
import { X } from 'lucide-react-native';
import {
  SLIDER_MIN_BORDER,
  SLIDER_MAX_BORDER,
  SLIDER_STEP_BORDER,
  BORDER_SLIDER_LABELS,
} from '@/constants/borderCalc';

interface BorderSizeSectionProps {
  onClose: () => void;
  minBorder: number;
  setMinBorder: (value: number) => void;
  minBorderWarning: string | null;
}

export const BorderSizeSection: React.FC<BorderSizeSectionProps> = ({
  onClose,
  minBorder,
  setMinBorder,
  minBorderWarning,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'outline');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <Box 
      style={{ 
        backgroundColor,
        borderTopWidth: 1,
        borderTopColor: borderColor,
        padding: 16,
        borderRadius: 8,
        marginTop: 16
      }}
    >
      {/* Header with close button */}
      <HStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Heading size="lg">Border Size</Heading>
        <Button onPress={onClose} variant="outline" size="sm">
          <ButtonIcon as={X} />
        </Button>
      </HStack>
      
      <VStack space="lg">
        <Text style={{ fontSize: 16, color: textColor, textAlign: 'center' }}>
          Set the minimum border size for your print
        </Text>
        
        <LabeledSliderInput 
          label="Minimum Border (inches):" 
          value={minBorder} 
          onChange={(v) => {
            const parsed = parseFloat(v);
            setMinBorder(isNaN(parsed) ? 0 : parsed);
          }} 
          min={SLIDER_MIN_BORDER} 
          max={SLIDER_MAX_BORDER} 
          step={SLIDER_STEP_BORDER} 
          labels={BORDER_SLIDER_LABELS} 
          textColor={textColor} 
          borderColor={iconColor} 
          tintColor={tintColor} 
          continuousUpdate={true} 
        />
        
        {minBorderWarning && (
          <WarningAlert message={minBorderWarning} action="error" />
        )}
      </VStack>
    </Box>
  );
}; 
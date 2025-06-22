import React, { useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  Button, 
  ButtonIcon, 
  ButtonText,
  Input,
  InputField
} from '@gluestack-ui/themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { X, Save, Trash2, Download, Plus } from 'lucide-react-native';
import { showConfirmAlert } from '@/components/ui/layout/ConfirmAlert';
import type { BorderPreset, BorderPresetSettings } from '@/types/borderPresetTypes';

interface PresetsSectionProps {
  onClose: () => void;
  presets: BorderPreset[];
  currentPreset: BorderPreset | null;
  onApplyPreset: (preset: BorderPreset) => void;
  onSavePreset: (name: string, settings: BorderPresetSettings) => void;
  onDeletePreset: (id: string) => void;
  getCurrentSettings: () => BorderPresetSettings;
}

export const PresetsSection: React.FC<PresetsSectionProps> = ({
  onClose,
  presets,
  currentPreset,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  getCurrentSettings,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'outline');
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'cardBackground');

  const [showSaveForm, setShowSaveForm] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim(), getCurrentSettings());
      setPresetName('');
      setShowSaveForm(false);
    }
  };

  const handleDeletePreset = (id: string) => {
    showConfirmAlert(
      'Delete Preset',
      'Are you sure you want to delete this preset? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeletePreset(id) }
      ]
    );
  };

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
        <Heading size="lg">Presets</Heading>
        <Button onPress={onClose} variant="outline" size="sm">
          <ButtonIcon as={X} />
        </Button>
      </HStack>
      
      <VStack space="lg">
        {/* Save New Preset Section */}
        <Box>
          {!showSaveForm ? (
            <Button 
              onPress={() => setShowSaveForm(true)} 
              variant="solid" 
              action="primary" 
              size="md"
            >
              <ButtonIcon as={Plus} />
              <ButtonText style={{ marginLeft: 8 }}>Save Current Settings as Preset</ButtonText>
            </Button>
          ) : (
            <VStack space="sm">
              <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
                Save New Preset
              </Text>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="Enter preset name..."
                  value={presetName}
                  onChangeText={setPresetName}
                />
              </Input>
              <HStack space="sm">
                <Button 
                  flex={1}
                  onPress={handleSavePreset}
                  variant="solid"
                  action="positive"
                  isDisabled={!presetName.trim()}
                >
                  <ButtonIcon as={Save} />
                  <ButtonText style={{ marginLeft: 8 }}>Save</ButtonText>
                </Button>
                <Button 
                  flex={1}
                  onPress={() => {
                    setShowSaveForm(false);
                    setPresetName('');
                  }}
                  variant="outline"
                  action="secondary"
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
              </HStack>
            </VStack>
          )}
        </Box>

        {/* Current Preset Display */}
        {currentPreset && (
          <Box
            style={{
              backgroundColor: cardBackground,
              padding: 12,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: borderColor,
            }}
          >
            <Text style={{ fontSize: 14, color: textColor, opacity: 0.7 }}>
              Current Preset:
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
              {currentPreset.name}
            </Text>
          </Box>
        )}

        {/* Presets List */}
        <VStack space="sm">
          <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
            Saved Presets ({presets.length})
          </Text>
          
          {presets.length === 0 ? (
            <Box
              style={{
                backgroundColor: cardBackground,
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, color: textColor, opacity: 0.7, textAlign: 'center' }}>
                No saved presets yet.{'\n'}Save your current settings to create your first preset.
              </Text>
            </Box>
          ) : (
            presets.map((preset) => (
              <Box
                key={preset.id}
                style={{
                  backgroundColor: cardBackground,
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: currentPreset?.id === preset.id ? 2 : 1,
                  borderColor: currentPreset?.id === preset.id ? '#007AFF' : borderColor,
                }}
              >
                <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <VStack style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
                      {preset.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: textColor, opacity: 0.7 }}>
                      {preset.settings.aspectRatio} • {preset.settings.paperSize} • {preset.settings.minBorder}&quot;
                    </Text>
                  </VStack>
                  
                  <HStack space="xs">
                    <Button 
                      onPress={() => onApplyPreset(preset)}
                      variant="solid"
                      action="primary"
                      size="xs"
                    >
                      <ButtonIcon as={Download} size="sm" />
                    </Button>
                    
                    <Button 
                      onPress={() => handleDeletePreset(preset.id)}
                      variant="outline"
                      action="negative"
                      size="xs"
                    >
                      <ButtonIcon as={Trash2} size="sm" />
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            ))
          )}
        </VStack>
      </VStack>
    </Box>
  );
}; 
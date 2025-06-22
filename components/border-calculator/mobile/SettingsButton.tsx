import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, HStack, Text } from '@gluestack-ui/themed';
import { ChevronRight } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SettingsButtonProps {
  label?: string | null;
  value: string;
  onPress: () => void;
  icon?: React.ComponentType<any>;
  showChevron?: boolean;
  centerLabel?: boolean;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
  label,
  value,
  onPress,
  icon: IconComponent,
  showChevron = true,
  centerLabel = false,
}) => {
  const cardBackground = useThemeColor({}, 'cardBackground');
  const textColor = useThemeColor({}, 'text');
  const outline = useThemeColor({}, 'outline');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Box
        style={{
          backgroundColor: cardBackground,
          borderColor: outline,
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          minHeight: 56,
        }}
      >
        <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <HStack space="sm" style={{ alignItems: 'center', flex: 1 }}>
            {IconComponent && (
              <IconComponent 
                size={20} 
                color={tintColor} 
              />
            )}
            <Text style={{ fontSize: 16, fontWeight: '500', color: textColor, textAlign: centerLabel ? 'center' : 'left', flex: centerLabel ? 1 : 0 }}>
              {label}
            </Text>
          </HStack>
          
          <HStack space="sm" style={{ alignItems: 'center' }}>
            <Text 
              style={{ 
                fontSize: 14, 
                color: tintColor, 
                fontWeight: '500',
                maxWidth: 120,
              }}
              numberOfLines={1}
            >
              {value}
            </Text>
            {showChevron && <ChevronRight size={20} color={tintColor} />}
          </HStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
}; 
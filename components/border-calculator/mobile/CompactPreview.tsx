import React from 'react';
import { Box } from '@gluestack-ui/themed';
import { AnimatedPreview } from '@/components/border-calculator';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { BorderCalculation } from '@/types/borderTypes';

interface CompactPreviewProps {
  calculation: BorderCalculation;
  showBlades: boolean;
}

export const CompactPreview: React.FC<CompactPreviewProps> = ({
  calculation,
  showBlades,
}) => {
  const borderColor = useThemeColor({}, 'icon');

  return (
    <Box style={{ alignItems: 'center', width: '100%', marginBottom: 85 }}>
      {/* Preview */}
      <Box style={{ maxHeight: 200, width: '100%', alignItems: 'center' }}>
        <AnimatedPreview 
          calculation={calculation} 
          showBlades={showBlades} 
          borderColor={borderColor} 
        />
      </Box>
    </Box>
  );
}; 
import React, { useMemo } from 'react';
import { Box } from '@gluestack-ui/themed';
import { AnimatedPreview } from '@/components/border-calculator';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { BorderCalculation } from '@/types/borderTypes';

interface CompactPreviewProps {
  calculation: BorderCalculation;
  showBlades: boolean;
}

export const CompactPreview: React.FC<CompactPreviewProps> = React.memo(({
  calculation,
  showBlades,
}) => {
  const borderColor = useThemeColor({}, 'icon');

  // Fixed container dimensions that never change
  const CONTAINER_WIDTH = 780;
  const CONTAINER_HEIGHT = 300;

  // Memoize scale calculation to prevent recalculation on every render
  const scale = useMemo(() => {
    const scaleX = CONTAINER_WIDTH / (calculation.previewWidth || 1);
    const scaleY = CONTAINER_HEIGHT / (calculation.previewHeight || 1);
    return Math.min(scaleX, scaleY, 1); // Don't scale up, only down if needed
  }, [calculation.previewWidth, calculation.previewHeight]);

  return (
    <Box style={{ 
      alignItems: 'center', 
      justifyContent: 'center',
      width: '100%', 
      marginBottom: 0 
    }}>
      {/* Fixed-size preview container */}
      <Box style={{ 
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', // Ensure content never escapes the bounds
        backgroundColor: 'transparent'
      }}>
        {/* Scaled preview content */}
        <Box style={{
          transform: [{ scale }],
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AnimatedPreview 
            calculation={calculation} 
            showBlades={showBlades} 
            borderColor={borderColor} 
          />
        </Box>
      </Box>
    </Box>
  );
});

CompactPreview.displayName = 'CompactPreview'; 
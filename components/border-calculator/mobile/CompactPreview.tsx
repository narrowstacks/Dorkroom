import React, { useMemo } from "react";
import { Box } from "@gluestack-ui/themed";
import { AnimatedPreview } from "@/components/border-calculator";
import { AnimatedPreview as AnimatedPreviewReanimated } from "@/components/border-calculator/AnimatedPreview.reanimated";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useIsReanimatedEnabled } from "@/hooks/useAnimationExperiment";
import { debugLog, debugLogPerformance } from "@/utils/debugLogger";
import type { BorderCalculation } from "@/types/borderTypes";

interface CompactPreviewProps {
  calculation: BorderCalculation;
  showBlades: boolean;
}

export const CompactPreview: React.FC<CompactPreviewProps> = React.memo(
  ({ calculation, showBlades }) => {
    const borderColor = useThemeColor({}, "icon");
    const isReanimatedEnabled = useIsReanimatedEnabled();

    // Fixed container dimensions that never change
    const CONTAINER_WIDTH = 780;
    const CONTAINER_HEIGHT = 300;

    // Memoize scale calculation to prevent recalculation on every render
    const scale = useMemo(() => {
      const scaleX = CONTAINER_WIDTH / (calculation.previewWidth || 1);
      const scaleY = CONTAINER_HEIGHT / (calculation.previewHeight || 1);
      return Math.min(scaleX, scaleY, 1); // Don't scale up, only down if needed
    }, [calculation.previewWidth, calculation.previewHeight]);

    // Log which animation engine is being used
    useMemo(() => {
      const engine = isReanimatedEnabled ? "Reanimated v3" : "Legacy Animated";
      debugLog(`🎭 [COMPACT PREVIEW] Using animation engine: ${engine}`);
      debugLogPerformance("Animation Engine Selection", {
        engine,
        isReanimatedEnabled,
        isDev: __DEV__,
        timestamp: new Date().toISOString(),
      });
    }, [isReanimatedEnabled]);

    // Select the appropriate AnimatedPreview component
    const AnimatedPreviewComponent = isReanimatedEnabled
      ? AnimatedPreviewReanimated
      : AnimatedPreview;

    return (
      <Box
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          marginBottom: 0,
        }}
      >
        {/* Fixed-size preview container */}
        <Box
          style={{
            width: CONTAINER_WIDTH,
            height: CONTAINER_HEIGHT,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden", // Ensure content never escapes the bounds
            backgroundColor: "transparent",
          }}
        >
          {/* Scaled preview content */}
          <Box
            style={{
              transform: [{ scale }],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AnimatedPreviewComponent
              calculation={calculation}
              showBlades={showBlades}
              borderColor={borderColor}
            />
          </Box>
        </Box>
      </Box>
    );
  },
);

CompactPreview.displayName = "CompactPreview";

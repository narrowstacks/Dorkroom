import React from "react";
import { Platform, StyleSheet } from "react-native";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Button, ButtonText } from "@/components/ui/button";
import { useReciprocityCalculator } from "@/hooks/useReciprocityCalculator";
import { FILM_TYPES, EXPOSURE_PRESETS } from "@/constants/reciprocity";
import { Box, Text } from "@gluestack-ui/themed";
import { useThemeColor } from "@/hooks/useThemeColor";
import { fonts } from "@/styles/common";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { ResultsSection, ResultRow } from "@/components/ResultsSection";
import { FormSection, FormGroup } from "@/components/FormSection";
import { InfoSection, InfoText } from "@/components/InfoSection";
import { StyledSelect } from "@/components/StyledSelect";

export default function ReciprocityCalculator() {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borderColor");
  const tintColor = useThemeColor({}, "tint");
  const inputBackground = useThemeColor({}, "inputBackground");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const errorColor = useThemeColor({}, "errorColor");
  const surfaceVariant = useThemeColor({}, "surfaceVariant");

  const {
    filmType,
    setFilmType,
    meteredTime,
    setMeteredTime,
    customFactor,
    setCustomFactor,
    formattedTime,
    timeFormatError,
    calculation,
    formatTime,
  } = useReciprocityCalculator();


  const infoSection = (
    <InfoSection title="What is reciprocity failure?">
      <InfoText>
        Film becomes less sensitive to light during long exposures,
        requiring additional exposure time beyond what your light meter
        indicates. Different films have different characteristics,
        represented by the reciprocity factor.
      </InfoText>
    </InfoSection>
  );

  return (
    <CalculatorLayout title="Reciprocity Calculator" infoSection={infoSection}>
      <ResultsSection show={!!calculation}>
        <ResultRow 
          label="Film" 
          value={calculation?.filmName || ""} 
        />
        <ResultRow 
          label="Increase" 
          value={`${Math.round(calculation?.percentageIncrease || 0)}%`} 
        />
        <ResultRow 
          label="Formula" 
          value={
            <Text>
              {calculation?.originalTime}
              <Text className="text-xs leading-6 relative px-1 py-0.5 rounded border" style={[
                styles.subscript, 
                { 
                  backgroundColor: 'transparent',
                  borderColor: textColor,
                  borderWidth: 1,
                }
              ]}>
                {calculation?.factor.toFixed(2)}
              </Text>
              {" = "}
              {Math.round((calculation?.adjustedTime || 0) * 10) / 10}
            </Text>
          } 
        />
        <ResultRow 
          label="Metered Time" 
          value={formatTime(calculation?.originalTime || 0)} 
        />
        <ResultRow 
          label="Adjusted Time" 
          value={formatTime(calculation?.adjustedTime || 0)} 
          isLast
        />
        
        {/* Visual Time Comparison */}
        {calculation && (
          <Box className="w-full mt-4 gap-3" style={styles.timeComparisonContainer}>
            <Text className="text-base mb-2 font-semibold text-center" style={styles.timeComparisonTitle}>
              Time Comparison
            </Text>
            <Box className="w-full h-5 rounded-lg overflow-hidden relative" style={[styles.timeBarContainer, { backgroundColor: `${textSecondary}20` }]}>
              <Box
                className="absolute left-0 top-0 h-full rounded-lg z-10 w-3/10"
                style={[
                  styles.timeBar,
                  styles.meteredTimeBar,
                  { backgroundColor: tintColor },
                ]}
              />
              <Box
                className="absolute left-0 top-0 h-full rounded-lg z-20"
                style={[
                  styles.timeBar,
                  styles.adjustedTimeBar,
                  {
                    backgroundColor: `${tintColor}66`,
                    width: `${Math.min(
                      (calculation.adjustedTime / calculation.originalTime) * 100,
                      100
                    )}%`,
                  },
                ]}
              />
            </Box>
            <Box className="flex-row justify-between w-full mt-2" style={styles.timeBarLabels}>
              <Text className="text-xs" style={[styles.timeBarLabel, { color: textSecondary }]}>
                Metered: {formatTime(calculation.originalTime)}
              </Text>
              <Text className="text-xs" style={[styles.timeBarLabel, { color: textSecondary }]}>
                Adjusted: {formatTime(calculation.adjustedTime)}
              </Text>
            </Box>
          </Box>
        )}
      </ResultsSection>

      <FormSection>
        <FormGroup label="Film Type">
          <StyledSelect 
            value={filmType}
            onValueChange={setFilmType}
            items={FILM_TYPES}
          />
        </FormGroup>

        {filmType === "custom" && (
          <FormGroup label="Reciprocity Factor">
            <Textarea
              className={`w-full border rounded-xl`}
              style={{
                backgroundColor: inputBackground,
                borderColor,
                height: 48,
              }}
            >
              <TextareaInput
                value={customFactor}
                onChangeText={setCustomFactor}
                keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                placeholder="1.3"
                placeholderTextColor={textMuted}
                multiline={false}
                className={`text-base px-4 py-3`}
                style={{ color: textColor }}
              />
            </Textarea>
            <Text className="text-xs italic mt-1.5" style={[styles.infoText, { color: textMuted }]}>
              Higher values mean more compensation needed
            </Text>
          </FormGroup>
        )}

        <FormGroup label="Metered Exposure Time">
          <Textarea
            className={`w-full border rounded-xl`}
            style={{
              backgroundColor: inputBackground,
              borderColor: timeFormatError ? errorColor : borderColor,
              height: 48,
            }}
          >
            <TextareaInput
              value={meteredTime}
              onChangeText={setMeteredTime}
              placeholder="e.g. 30s, 1m30s, 2h"
              placeholderTextColor={textMuted}
              multiline={false}
              className={`text-base px-4 py-3`}
              style={{ color: textColor }}
            />
          </Textarea>
          {formattedTime && (
            <Text className="text-xs italic mt-1.5" style={[styles.helpText, { color: textMuted }]}>
              Parsed as: {formattedTime}
            </Text>
          )}
          {timeFormatError && (
            <Text className="text-xs mt-1.5 font-medium" style={[styles.errorText, { color: errorColor }]}>
              {timeFormatError}
            </Text>
          )}
        </FormGroup>

        <FormGroup label="Common Presets">
          <Box className="flex-row flex-wrap gap-3 mt-2" style={styles.presetsContainer}>
            {EXPOSURE_PRESETS.map((seconds: number) => (
              <Button
                key={seconds}
                variant="outline"
                action="default"
                size="sm"
                className={`min-w-20 rounded-xl border`}
                style={{
                  borderColor,
                  backgroundColor: surfaceVariant,
                }}
                onPress={() => setMeteredTime(seconds.toString() + "s")}
              >
                <ButtonText
                  className={`text-sm font-medium`}
                  style={{ color: textColor }}
                >
                  {formatTime(seconds)}
                </ButtonText>
              </Button>
            ))}
          </Box>
        </FormGroup>
      </FormSection>
    </CalculatorLayout>
  );
}

const styles = StyleSheet.create({
  subscript: {
    fontSize: 12,
    lineHeight: 25,
    textAlignVertical: "bottom",
    position: "relative",
    bottom: 0,
    fontFamily: Platform.select({
      ios: fonts.ios.primary,
      android: fonts.android.primary,
      web: fonts.web.primary,
    }),
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  presetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },
  infoText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 6,
  },
  timeComparisonContainer: {
    width: "100%",
    marginTop: 16,
    gap: 12,
  },
  timeComparisonTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  timeBarContainer: {
    width: "100%",
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  timeBar: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: 10,
  },
  meteredTimeBar: {
    width: "30%",
    zIndex: 1,
  },
  adjustedTimeBar: {
    zIndex: 2,
  },
  timeBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  timeBarLabel: {
    fontSize: 12,
  },
});

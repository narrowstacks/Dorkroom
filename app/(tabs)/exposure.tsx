import React from "react";
import { Platform } from "react-native";
import { useExposureCalculator } from "@/hooks/useExposureCalculator";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  Button,
  ButtonText,
  HStack,
  Input,
  InputField,
} from "@gluestack-ui/themed";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { ResultsSection, ResultRow } from "@/components/ResultsSection";
import { FormSection, FormGroup } from "@/components/FormSection";
import { InfoSection, InfoText, InfoSubtitle } from "@/components/InfoSection";

export default function ExposureCalculator() {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borderColor");
  const inputBackground = useThemeColor({}, "inputBackground");
  const surfaceVariant = useThemeColor({}, "surfaceVariant");

  const {
    originalTime,
    setOriginalTime,
    newTime,
    stops,
    setStops,
    adjustStops,
  } = useExposureCalculator();

  const renderStopButton = (label: string, increment: number) => (
    <Button
      onPress={() => adjustStops(increment)}
      variant="outline"
      size="sm"
      className="py-2 px-2 rounded-lg justify-center items-center"
      style={{
        backgroundColor: surfaceVariant,
        borderColor,
      }}
    >
      <ButtonText
        className={`text-base ${Platform.OS === "web" ? "select-none" : ""}`}
        style={{ color: textColor }}
      >
        {label}
      </ButtonText>
    </Button>
  );

  const infoSection = (
    <InfoSection title="about this tool">
      <InfoText>
        The exposure calculator helps you adjust your exposure time by
        stops. Each stop represents a doubling or halving of the light
        reaching the paper. This is handy when you are changing your
        aperture or doing f-stop printing when darkroom printing.
      </InfoText>

      <InfoSubtitle>how to use:</InfoSubtitle>
      <InfoText>
        1. Enter your original exposure time in seconds
      </InfoText>
      <InfoText>
        2. Use the buttons to adjust the exposure by stops
      </InfoText>
      <InfoText>
        3. The new exposure time will be calculated automatically
      </InfoText>

      <InfoSubtitle>tips:</InfoSubtitle>
      <InfoText>
        • Each stop doubles or halves the exposure time
      </InfoText>
      <InfoText>
        • Use 1/3 and 1/2 stop adjustments for fine-tuning
      </InfoText>
      <InfoText>
        • Use 1 stop adjustments for significant changes
      </InfoText>
      <InfoText>
        • Worth noting: Because exposure is logarithmic, half stops are not exactly half
        the exposure time
      </InfoText>
    </InfoSection>
  );

  return (
    <CalculatorLayout title="exposure calculator" infoSection={infoSection}>
      <ResultsSection show={!!newTime}>
        {originalTime && newTime && (
          <ResultRow 
            label={parseFloat(newTime) > parseFloat(originalTime) ? "add" : "remove"}
            value={`${Math.abs(parseFloat(newTime) - parseFloat(originalTime)).toFixed(2)} seconds`} 
          />
        )}
        <ResultRow 
          label="original time" 
          value={`${originalTime} seconds`} 
        />
        <ResultRow 
          label="new time" 
          value={`${newTime} seconds`} 
          isLast
        />
      </ResultsSection>

      <FormSection>
        <FormGroup label="original exposure time (seconds)">
          <Input
            variant="outline"
            size="md"
            className="w-full border rounded-xl"
            style={{
              backgroundColor: inputBackground,
              borderColor,
            }}
          >
            <InputField
              value={originalTime}
              onChangeText={setOriginalTime}
              keyboardType="numeric"
              placeholder="Enter time"
              maxLength={6}
              className="text-base px-4 py-3"
              style={{ color: textColor }}
            />
          </Input>
        </FormGroup>

        <FormGroup label="stop adjustment">
          <HStack space="sm" className="items-center justify-center gap-2 my-2" alignItems="center" justifyContent="center">
            <HStack space="xs" className="items-center gap-1">
              {renderStopButton("-1", -1)}
              {renderStopButton("-1/2", -0.5)}
              {renderStopButton("-1/3", -1 / 3)}
            </HStack>

            <Input
              variant="outline"
              size="md"
              className="border rounded-lg"
              style={{
                width: 60,
                backgroundColor: inputBackground,
                borderColor,
              }}
            >
              <InputField
                value={stops}
                onChangeText={setStops}
                keyboardType="numeric"
                placeholder="1"
                className="text-center"
              />
            </Input>

            <HStack space="xs" className="items-center gap-1">
              {renderStopButton("+1/3", 1 / 3)}
              {renderStopButton("+1/2", 0.5)}
              {renderStopButton("+1", 1)}
            </HStack>
          </HStack>
        </FormGroup>
      </FormSection>
    </CalculatorLayout>
  );
}

// No styles needed - using shared components
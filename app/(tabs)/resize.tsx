import React from "react";
import {
  Text,
  Link,
  LinkText,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertText,
  InfoIcon,
  Switch,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@gluestack-ui/themed";
import { useResizeCalculator } from "@/hooks/useResizeCalculator";
import { NumberInput } from "@/components/NumberInput";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { ResultsSection, ResultRow } from "@/components/ResultsSection";
import { FormSection, FormGroup } from "@/components/FormSection";
import { InfoSection, InfoText, InfoSubtitle } from "@/components/InfoSection";

export default function ResizeScreen() {
  const inverseSquareLawUrl = "https://en.wikipedia.org/wiki/Inverse-square_law";

  // Use the custom hook for state and logic
  const {
    isEnlargerHeightMode,
    setIsEnlargerHeightMode,
    originalWidth,
    setOriginalWidth,
    originalLength,
    setOriginalLength,
    newWidth,
    setNewWidth,
    newLength,
    setNewLength,
    originalTime,
    setOriginalTime,
    newTime,
    stopsDifference,
    isAspectRatioMatched,
    originalHeight,
    setOriginalHeight,
    newHeight,
    setNewHeight,
  } = useResizeCalculator();

  const infoSection = (
    <InfoSection title="About This Tool">
      <InfoText>
        The print resize calculator helps you determine the correct exposure
        time when enlarging or reducing the size of your darkroom prints.
      </InfoText>

      <InfoSubtitle>how to use:</InfoSubtitle>
      <InfoText>
        1. Choose your calculation method: Print Size or Enlarger Height
      </InfoText>
      <InfoText>
        2. Print size is easier to use, but enlarger height is more accurate
      </InfoText>
      {isEnlargerHeightMode ? (
        <>
          <InfoText>
            3. Enter the original and new enlarger heights (lens to paper distance)
          </InfoText>
          <InfoText>
            4. Enter the original exposure time in seconds
          </InfoText>
        </>
      ) : (
        <>
          <InfoText>
            3. Enter the width and height of your original print
          </InfoText>
          <InfoText>
            4. Enter the width and height of your desired new print size
          </InfoText>
          <InfoText>
            5. Enter the original exposure time in seconds
          </InfoText>
        </>
      )}
      <InfoText>
        {isEnlargerHeightMode ? "5" : "6"}. The new exposure time will be calculated automatically
      </InfoText>

      <InfoSubtitle>how it works:</InfoSubtitle>
      <InfoText>
        When you change the size of a print, the light is spread across a
        different area, affecting the exposure needed. This is caused by the{" "}
        <Link href={inverseSquareLawUrl} isExternal>
          <LinkText>inverse-square law</LinkText>
        </Link>
        .
      </InfoText>
      <InfoText>
        The formula used depends on your selected mode:
      </InfoText>
      {isEnlargerHeightMode ? (
        <Text className="text-base leading-6 font-semibold" style={{ fontWeight: "600" }}>
          New Time = Original Time × (New Height)² ÷ (Original Height)²
        </Text>
      ) : (
        <Text className="text-base leading-6 font-semibold" style={{ fontWeight: "600" }}>
          New Time = Original Time × (New Area ÷ Original Area)
        </Text>
      )}

      <InfoSubtitle>Tips:</InfoSubtitle>
      <InfoText>
        • The results should only be treated as a best-guess estimate
      </InfoText>
      <InfoText>
        • Always make a test strip when resizing prints!
      </InfoText>
      <InfoText>
        • The &quot;stops difference&quot; shows exposure change in photographic stops
      </InfoText>
      <InfoText>
        • Positive stops = more exposure needed (larger print)
      </InfoText>
      <InfoText>
        • Negative stops = less exposure needed (smaller print)
      </InfoText>
      {isEnlargerHeightMode && (
        <InfoText>
          • Enlarger height method is more accurate when properly calibrated
        </InfoText>
      )}
    </InfoSection>
  );

  return (
    <CalculatorLayout title="Print Resize Calculator" infoSection={infoSection}>
      <ResultsSection show={!!newTime}>
        <ResultRow 
          label="New Time" 
          value={`${newTime} seconds`} 
        />
        <ResultRow 
          label="Difference" 
          value={`${stopsDifference} stops`} 
          isLast
        />
      </ResultsSection>

      <FormSection>
        <FormGroup label="Calculation Method">
          <FormControl>
            <HStack space="md" alignItems="center" justifyContent="left" paddingTop={10}>
              <FormControlLabel>
                <FormControlLabelText>Print Size</FormControlLabelText>
              </FormControlLabel>
              <Switch
                value={isEnlargerHeightMode}
                onValueChange={(value) => {
                  setIsEnlargerHeightMode(value);
                }}
              />
              <FormControlLabel>
                <FormControlLabelText>Enlarger Height</FormControlLabelText>
              </FormControlLabel>
            </HStack>
          </FormControl>
        </FormGroup>

        {!isEnlargerHeightMode ? (
          <>
            <FormGroup label="Initial Image Size">
              <HStack space="sm">
                <HStack alignItems="center" space="sm">
                  <Text w="$16" textAlign="right">Width:</Text>
                  <NumberInput
                    value={originalWidth}
                    onChangeText={setOriginalWidth}
                    placeholder="4"
                  />
                  <Text minWidth={30} textAlign="left">in</Text>
                </HStack>
                <HStack alignItems="center" space="sm">
                  <Text w="$16" textAlign="right">Height:</Text>
                  <NumberInput
                    value={originalLength}
                    onChangeText={setOriginalLength}
                    placeholder="6"
                  />
                  <Text minWidth={30} textAlign="left">in</Text>
                </HStack>
              </HStack>
            </FormGroup>

            <FormGroup label="New Image Size">
              <HStack space="sm">
                <HStack alignItems="center" space="sm">
                  <Text w="$16" textAlign="right">Width:</Text>
                  <NumberInput
                    value={newWidth}
                    onChangeText={setNewWidth}
                    placeholder="6"
                  />
                  <Text minWidth={30} textAlign="left">in</Text>
                </HStack>
                <HStack alignItems="center" space="sm">
                  <Text w="$16" textAlign="right">Height:</Text>
                  <NumberInput
                    value={newLength}
                    onChangeText={setNewLength}
                    placeholder="9"
                  />
                  <Text minWidth={30} textAlign="left">in</Text>
                </HStack>
              </HStack>
            </FormGroup>
          </>
        ) : (
          <FormGroup label="Enlarger Heights">
            <HStack space="sm">
              <HStack alignItems="center" space="sm">
                <Text w="$20" textAlign="right">Original:</Text>
                <NumberInput
                  value={originalHeight}
                  onChangeText={setOriginalHeight}
                  placeholder="500"
                />
                <Text minWidth={30} textAlign="left">cm</Text>
              </HStack>
              <HStack alignItems="center" space="sm">
                <Text w="$20" textAlign="right">New:</Text>
                <NumberInput
                  value={newHeight}
                  onChangeText={setNewHeight}
                  placeholder="600"
                />
                <Text minWidth={30} textAlign="left">cm</Text>
              </HStack>
            </HStack>
          </FormGroup>
        )}

        {!isEnlargerHeightMode && !isAspectRatioMatched && (
          <Alert action="warning" variant="outline" mb="$4" width="100%">
            <AlertIcon as={InfoIcon} size="lg" mr="$3" />
            <AlertText>
              The aspect ratios of the initial and new sizes don&apos;t match!
            </AlertText>
          </Alert>
        )}

        <FormGroup label="Original Exposure Time">
          <HStack alignItems="center" space="sm">
            <NumberInput
              value={originalTime}
              onChangeText={setOriginalTime}
              placeholder="10"
            />
            <Text minWidth={60} textAlign="left">seconds</Text>
          </HStack>
        </FormGroup>
      </FormSection>
    </CalculatorLayout>
  );
}
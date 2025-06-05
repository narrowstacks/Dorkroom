import React from "react";
import { Platform } from "react-native";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useExposureCalculator } from "@/hooks/useExposureCalculator";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  Box,
  Text,
  ScrollView,
  Button,
  ButtonText,
  HStack,
  VStack,
  Input,
  InputField,
  Center,
  Heading,
} from "@gluestack-ui/themed";

export default function ExposureCalculator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

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
      variant="solid"
      size="sm"
      className="py-2 px-2 rounded-lg justify-center items-center"
      style={{ backgroundColor: tintColor }}
    >
      <ButtonText className={`text-black text-base ${Platform.OS === "web" ? "select-none" : ""}`}>
        {label}
      </ButtonText>
    </Button>
  );

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: Platform.OS === "ios" || Platform.OS === "android" ? 100 : 80,
      }}
    >
      <Box className={`flex-1 p-4 ${Platform.OS === "web" ? "max-w-4xl mx-auto w-full p-6" : ""}`}>
        <Center className="mb-4">
          <Heading size="2xl" className="text-center">
            exposure calculator
          </Heading>
        </Center>

        <Box className={`w-full ${Platform.OS === "web" && isDesktop ? "flex-col items-center justify-center gap-8" : ""}`}>
          {/* Input Section */}
          <VStack
            space="md"
            className={`gap-4 w-full ${Platform.OS === "web" && isDesktop ? "max-w-2xl self-center" : ""}`}
          >
            <HStack space="md" className="items-center justify-between gap-4" alignItems="center">
              <Text className="flex-1 text-base pr-2">
                original exposure time (seconds):
              </Text>
              <Input
                variant="outline"
                size="md"
                className="w-30 border"
                style={{ borderColor }}
              >
                <InputField
                  value={originalTime}
                  onChangeText={setOriginalTime}
                  keyboardType="numeric"
                  placeholder="Enter time"
                  maxLength={6}
                />
              </Input>
            </HStack>

            {/* Stop Adjustment Section */}
            <VStack
              space="sm"
              className={Platform.OS === "web" && isDesktop ? "items-center" : ""}
            >
              <Text className="text-base">stop adjustment:</Text>
              <HStack space="sm" className="items-center justify-center gap-2 my-2" alignItems="center" justifyContent="center">
                <HStack space="xs" className="items-center gap-1">
                  {renderStopButton("-1", -1)}
                  {renderStopButton("-1/2", -0.5)}
                  {renderStopButton("-1/3", -1 / 3)}
                </HStack>

                <Input
                  variant="outline"
                  size="md"
                  className="w-20 border rounded-lg"
                  style={{ borderColor, backgroundColor }}
                >
                  <InputField
                    value={stops}
                    onChangeText={setStops}
                    keyboardType="numeric"
                    placeholder="0"
                    textAlign="center"
                  />
                </Input>

                <HStack space="xs" className="items-center gap-1">
                  {renderStopButton("+1/3", 1 / 3)}
                  {renderStopButton("+1/2", 0.5)}
                  {renderStopButton("+1", 1)}
                </HStack>
              </HStack>
            </VStack>

            {/* Result Section */}
            {newTime && (
              <VStack space="sm" className="items-center gap-2 mt-4" alignItems="center">
                {/* Time difference display */}
                {originalTime && newTime && (
                  <HStack space="sm" className="items-center gap-2 mb-1 p-1 rounded-lg bg-gray-50" alignItems="center">
                    <Text className="text-base font-medium">
                      {parseFloat(newTime) > parseFloat(originalTime) 
                        ? "add:" 
                        : "remove:"}
                    </Text>
                    <Text className="text-base font-mono">
                      {Math.abs(parseFloat(newTime) - parseFloat(originalTime)).toFixed(2)} seconds
                    </Text>
                  </HStack>
                )}
                <Heading size="lg" className="text-xl">
                  new exposure time
                </Heading>
                <Text className="text-2xl font-mono">
                  {newTime} seconds
                </Text>
              </VStack>
            )}
          </VStack>
        </Box>

        {/* Information Section */}
        <Box className={`p-4 mt-4 border-t border-gray-300 ${Platform.OS === "web" && isDesktop ? "max-w-4xl mx-auto w-full p-6 border-t border-gray-300" : ""}`}>
          <VStack space="md">
            <Heading size="lg" className="text-xl text-center mb-4">
              about this tool
            </Heading>

            <Text className="text-sm mb-2 leading-5">
              The exposure calculator helps you adjust your exposure time by
              stops. Each stop represents a doubling or halving of the light
              reaching the paper. This is handy when you are changing your
              aperture or doing f-stop printing when darkroom printing.
            </Text>

            <Text className="text-base font-bold mt-4 mb-2">
              how to use:
            </Text>
            <Text className="text-sm mb-2 leading-5">
              1. Enter your original exposure time in seconds
            </Text>
            <Text className="text-sm mb-2 leading-5">
              2. Use the buttons to adjust the exposure by stops
            </Text>
            <Text className="text-sm mb-2 leading-5">
              3. The new exposure time will be calculated automatically
            </Text>
            <Text className="text-base font-bold mt-4 mb-2">
              tips:
            </Text>
            <Text className="text-sm mb-2 leading-5">
              • Each stop doubles or halves the exposure time
            </Text>
            <Text className="text-sm mb-2 leading-5">
              • Use 1/3 and 1/2 stop adjustments for fine-tuning
            </Text>
            <Text className="text-sm mb-2 leading-5">
              • Use 1 stop adjustments for significant changes
            </Text>
            <Text className="text-sm mb-2 leading-5">
              • Worth noting: Because exposure is logarithmic, half stops are not exactly half
              the exposure time
            </Text>
          </VStack>
        </Box>
      </Box>
    </ScrollView>
  );
}
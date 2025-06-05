import React from "react";
import {
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
  SelectScrollView,
} from "@/components/ui/select";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import {
  useCameraExposureCalculator,
  ExposureSetting,
} from "@/hooks/useCameraExposureCalculator";
import { APERTURE_VALUES, ISO_VALUES, SHUTTER_SPEED_VALUES } from "@/constants/exposure";
import { Box, Text } from "@gluestack-ui/themed";
import { useThemeColor } from "@/hooks/useThemeColor";
import { fonts } from "@/styles/common";

export default function CameraExposureCalculator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const isMobile =
    Platform.OS === "ios" ||
    Platform.OS === "android" ||
    (Platform.OS === "web" && width <= 768);
  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "cardBackground");
  const shadowColor = useThemeColor({}, "shadowColor");
  const textSecondary = useThemeColor({}, "textSecondary");
  const outline = useThemeColor({}, "outline");

  const {
    aperture,
    setAperture,
    iso,
    setIso,
    shutterSpeed,
    setShutterSpeed,
    settingToChange,
    setSettingToChange,
    newValue,
    setNewValue,
    equivalentExposure,
  } = useCameraExposureCalculator();

  const settingOptions = [
    { label: "Aperture", value: "aperture" as ExposureSetting },
    { label: "ISO", value: "iso" as ExposureSetting },
    { label: "Shutter Speed", value: "shutterSpeed" as ExposureSetting },
  ];

  const getNewValueOptions = () => {
    switch (settingToChange) {
      case "aperture":
        return APERTURE_VALUES;
      case "iso":
        return ISO_VALUES;
      case "shutterSpeed":
        return SHUTTER_SPEED_VALUES;
      default:
        return [];
    }
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: Platform.OS === "ios" || Platform.OS === "android" ? 100 : 80,
      }}
    >
      <Box
        className="flex-1 p-4"
        style={Platform.OS === "web" ? {
          maxWidth: 1024,
          marginHorizontal: "auto",
          width: "100%",
          padding: 24,
        } : {}}
      >
        <Box
          className="flex-row justify-center items-center w-full mb-6 pb-4 border-b"
          style={{ borderBottomColor: outline }}
        >
          <Heading
            size="2xl"
            className="text-center font-semibold"
          >
            camera exposure calculator
          </Heading>
        </Box>

        <Box
          className="w-full"
          style={Platform.OS === "web" && isDesktop ? {
            flexDirection: "row",
            gap: 40,
            alignItems: "flex-start",
          } : {}}
        >
          {/* Results Section - Will show on initial load due to default values */}
          {equivalentExposure && (
            <VStack
              space="lg"
              className="items-center w-full mb-8"
              style={Platform.OS === "web" && isDesktop ? {
                flex: 1,
                alignSelf: "stretch",
                marginBottom: 0,
              } : {}}
            >
              <Heading
                size="xl"
                className="mb-4 text-center font-semibold"
              >
                equivalent exposure
              </Heading>

              <Box
                className="items-center w-full max-w-120 p-6 rounded-2xl"
                style={{
                  backgroundColor: cardBackground,
                  shadowColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <HStack
                  className="w-full justify-between items-center py-3 border-b"
                  style={{ borderBottomColor: outline }}
                >
                  <Text
                    className="text-base text-right flex-1 font-medium"
                    style={{ color: textSecondary }}
                  >
                    aperture:
                  </Text>
                  <Text
                    className="text-base text-left flex-1 font-semibold"
                  >
                    f/{equivalentExposure.aperture}
                  </Text>
                </HStack>

                <HStack
                  className="w-full justify-between items-center py-3 border-b"
                  style={{ borderBottomColor: outline }}
                >
                  <Text
                    className="text-base text-right flex-1 font-medium"
                    style={{ color: textSecondary }}
                  >
                    iso:
                  </Text>
                  <Text
                    className="text-base text-left flex-1 font-semibold"
                  >
                    {equivalentExposure.iso}
                  </Text>
                </HStack>

                <HStack
                  className="w-full justify-between items-center py-3 border-b"
                  style={{ borderBottomColor: outline }}
                >
                  <Text
                    className="text-base text-right flex-1 font-medium"
                    style={{ color: textSecondary }}
                  >
                    shutter speed:
                  </Text>
                  <Text
                    className="text-base text-left flex-1 font-semibold"
                  >
                    {equivalentExposure.shutterSpeed}s
                  </Text>
                </HStack>

                <HStack
                  className="w-full justify-between items-center py-3"
                >
                  <Text
                    className="text-base text-right flex-1 font-medium"
                    style={{ color: textSecondary }}
                  >
                    exposure value:
                  </Text>
                  <Text
                    className="text-base text-left flex-1 font-semibold"
                  >
                    EV {equivalentExposure.ev}
                  </Text>
                </HStack>
              </Box>
            </VStack>
          )}

          {/* Form Section */}
          <VStack
            space="lg"
            className="w-full"
            style={Platform.OS === "web" && isDesktop ? {
              flex: 1,
              maxWidth: 480,
            } : {}}
          >
            {/* Two column layout container for mobile */}
            <Box
              style={isMobile ? {
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 12,
              } : {}}
            >
              {/* Current Settings Column */}
              <VStack
                space="md"
                style={isMobile ? { flex: 1, width: "48%" } : { width: "100%" }}
              >
                <Heading
                  size="lg"
                  className="mb-4 font-semibold"
                >
                  current settings
                </Heading>

                {/* Aperture Input - Use ThemedSelect */}
                <VStack space="sm" className="mb-4">
                  <ThemedSelect
                    label="aperture:"
                    selectedValue={aperture}
                    onValueChange={setAperture}
                    items={APERTURE_VALUES}
                    placeholder="Select Aperture"
                    testID="aperture-picker"
                  />
                </VStack>

                {/* ISO Input - Use ThemedSelect */}
                <VStack space="sm" className="mb-4">
                  <ThemedSelect
                    label="iso:"
                    selectedValue={iso}
                    onValueChange={setIso}
                    items={ISO_VALUES}
                    placeholder="Select ISO"
                    testID="iso-picker"
                  />
                </VStack>

                {/* Shutter Speed Input - Use ThemedSelect */}
                <VStack space="sm" className="mb-4">
                  <ThemedSelect
                    label="shutter speed:"
                    selectedValue={shutterSpeed}
                    onValueChange={setShutterSpeed}
                    items={SHUTTER_SPEED_VALUES}
                    placeholder="Select Shutter Speed"
                    testID="shutter-speed-picker"
                  />
                </VStack>
              </VStack>

              {/* Change Setting Column */}
              <VStack
                space="md"
                style={isMobile ? { flex: 1, width: "48%" } : { width: "100%" }}
              >
                <Heading
                  size="lg"
                  className="mb-4 font-semibold"
                >
                  change setting
                </Heading>

                {/* Setting to Change - Use ThemedSelect */}
                <VStack space="sm" className="mb-4">
                  <ThemedSelect
                    label="setting to change:"
                    selectedValue={settingToChange}
                    onValueChange={setSettingToChange as (value: string) => void} // Cast needed due to ExposureSetting type
                    items={settingOptions}
                    placeholder="Select Setting"
                  />
                </VStack>

                {/* New Value Input - Use ThemedSelect */}
                <VStack space="sm" className="mb-4">
                  <ThemedSelect
                    label="new value:"
                    selectedValue={newValue}
                    onValueChange={setNewValue}
                    items={getNewValueOptions()}
                    placeholder="Select New Value"
                    testID="new-value-picker"
                  />
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Box>

        {/* Information Section */}
        <Box
          className="mt-8 p-5 rounded-2xl border"
          style={{
            borderColor: outline,
            backgroundColor: cardBackground,
            shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Heading
            size="lg"
            className="mb-4 font-semibold"
          >
            about this tool
          </Heading>

          <Text
            className="text-sm mb-2 leading-6"
            style={{ color: textSecondary }}
          >
            The camera exposure calculator helps you find equivalent exposures
            when you want to change one aspect of your exposure triangle
            (aperture, ISO, or shutter speed) while maintaining the same overall
            exposure.
          </Text>

          <Text
            className="text-base mt-4 mb-2 font-semibold"
          >
            how to use:
          </Text>
          <Text
            className="text-sm mb-2 leading-6"
            style={{ color: textSecondary }}
          >
            1. Enter your current camera settings (aperture, ISO, and shutter
            speed)
          </Text>
          <Text
            className="text-sm mb-2 leading-6"
            style={{ color: textSecondary }}
          >
            2. Select which setting you want to change
          </Text>
          <Text
            className="text-sm mb-2 leading-6"
            style={{ color: textSecondary }}
          >
            3. Choose the new value for that setting
          </Text>
          <Text
            className="text-sm mb-2 leading-6"
            style={{ color: textSecondary }}
          >
            4. The calculator will show equivalent settings that maintain the
            same exposure
          </Text>

          <Text
            className="text-base mt-4 mb-2 font-semibold"
          >
            the exposure triangle:
          </Text>
          <Text
            className="text-sm mb-2 leading-6"
            style={{ color: textSecondary }}
          >
            • Aperture: Controls depth of field. Lower number = larger opening =
            more light
          </Text>
          <Text
            className="text-sm mb-2 leading-6"
            style={{ color: textSecondary }}
          >
            • ISO: Controls sensitivity. Higher number = more sensitivity = more
            noise
          </Text>
          <Text
            className="text-sm mb-2 leading-6"
            style={{ color: textSecondary }}
          >
            • Shutter Speed: Controls motion blur. Faster speed = less motion
            blur = less light
          </Text>

          <Text
            className="text-base mt-4 mb-2 font-semibold"
          >
            notes:
          </Text>
          <Text
            className="text-sm mb-2 leading-6"
            style={{ color: textSecondary }}
          >
            • Calculated shutter speeds are automatically rounded to the nearest
            standard camera value (e.g., 1/125, 1/60, 1/30, etc.)
          </Text>
          <Text
            className="text-sm mb-2 leading-6"
            style={{ color: textSecondary }}
          >
            • Aperture values are also rounded to standard f-stops when changing
            shutter speed
          </Text>
          <Text
            className="text-sm mb-2 leading-6"
            style={{ color: textSecondary }}
          >
            • Default values (f/5.6, ISO 100, 1/250s) with aperture change to
            f/16 are pre-loaded for quick reference
          </Text>
        </Box>
      </Box>
    </ScrollView>
  );
}


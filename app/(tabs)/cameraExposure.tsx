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

export default function CameraExposureCalculator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const isMobile =
    Platform.OS === "ios" ||
    Platform.OS === "android" ||
    (Platform.OS === "web" && width <= 768);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borderColor");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const inputBackground = useThemeColor({}, "inputBackground");
  const shadowColor = useThemeColor({}, "shadowColor");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const surfaceVariant = useThemeColor({}, "surfaceVariant");
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

  const renderPicker = (
    value: string,
    onValueChange: (value: string) => void,
    items: { label: string; value: string }[]
  ) => {
    const selectedItem = items.find(item => item.value === value);
    
    return (
      <Select
        selectedValue={value}
        onValueChange={onValueChange}
        className={`w-full border rounded-xl`}
        style={{
          backgroundColor: inputBackground,
          borderColor,
        }}
      >
        <SelectTrigger
          className={`h-12 flex-row items-center justify-between px-4`}
          style={{
            backgroundColor: inputBackground,
            borderColor,
          }}
        >
          <SelectInput
            placeholder="Select an option"
            value={selectedItem?.label || ""}
            editable={false}
            className={`flex-1 text-base`}
            style={{ color: textColor }}
          />
          <SelectIcon className={`ml-2`}>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={textColor} />
          </SelectIcon>
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent className={`bg-background rounded-t-xl`}>
            <SelectScrollView>
              {items.map((item) => (
                <SelectItem
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  className={`py-4 px-6 border-b border-outline-200`}
                />
              ))}
            </SelectScrollView>
          </SelectContent>
        </SelectPortal>
      </Select>
    );
  };

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
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Box
        className="flex-1 p-4 web:max-w-5xl web:mx-auto web:w-full web:p-6"
        style={[styles.content, Platform.OS === "web" && styles.webContent]}
      >
        <Box className="flex-row justify-center items-center w-full mb-6 pb-4 border-b" style={[styles.header, { borderBottomColor: outline }]}>
          <Text className="text-3xl text-center font-semibold" style={styles.title}>
            camera exposure calculator
          </Text>
        </Box>

        <Box
          className="w-full web:flex-row web:gap-10 web:items-start"
          style={[
            styles.mainContent,
            Platform.OS === "web" && isDesktop && styles.webMainContent,
          ]}
        >
          {/* Results Section - Will show on initial load due to default values */}
          {equivalentExposure && (
            <Box
              className="gap-5 items-center w-full mb-8 web:flex-1 web:self-stretch web:mb-0"
              style={[
                styles.resultsSection,
                Platform.OS === "web" && isDesktop && styles.webResultsSection,
              ]}
            >
              <Text className="text-2xl mb-4 text-center font-semibold" style={styles.subtitle}>
                equivalent exposure
              </Text>

              <Box
                className="items-center gap-4 w-full max-w-lg p-6 rounded-2xl shadow-lg"
                style={[
                  styles.resultContainer,
                  {
                    backgroundColor: cardBackground,
                    shadowColor,
                  },
                ]}
              >
                <Box
                  className="flex-row w-full justify-between rounded-2xl gap-4 py-2 border-b"
                  style={[styles.resultRow, { borderBottomColor: outline }]}
                >
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>aperture:</Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    f/{equivalentExposure.aperture}
                  </Text>
                </Box>

                <Box
                  className="flex-row w-full justify-between rounded-2xl gap-4 py-2 border-b"
                  style={[styles.resultRow, { borderBottomColor: outline }]}
                >
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>iso:</Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    {equivalentExposure.iso}
                  </Text>
                </Box>

                <Box
                  className="flex-row w-full justify-between rounded-2xl gap-4 py-2 border-b"
                  style={[styles.resultRow, { borderBottomColor: outline }]}
                >
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>
                    shutter speed:
                  </Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    {equivalentExposure.shutterSpeed}s
                  </Text>
                </Box>

                <Box className="flex-row w-full justify-between rounded-2xl gap-4 py-2" style={styles.resultRow}>
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>
                    exposure value:
                  </Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    EV {equivalentExposure.ev}
                  </Text>
                </Box>
              </Box>
            </Box>
          )}

          {/* Form Section */}
          <Box
            className="gap-5 w-full web:flex-1 web:max-w-lg"
            style={[
              styles.form,
              Platform.OS === "web" && isDesktop && styles.webForm,
            ]}
          >
            {/* Two column layout container for mobile */}
            <Box style={[isMobile ? styles.mobileFormColumns : {}]}>
              {/* Current Settings Column */}
              <Box
                style={[isMobile ? styles.mobileFormColumn : styles.fullWidth]}
              >
                <Text className="text-lg mb-4 font-semibold" style={styles.sectionTitle}>
                  current settings
                </Text>

                {/* Aperture Input */}
                <Box className="gap-3" style={styles.formGroup}>
                  <Text className="text-base font-medium mb-1" style={styles.label}>aperture:</Text>
                  {renderPicker(aperture, setAperture, APERTURE_VALUES)}
                </Box>

                {/* ISO Input */}
                <Box className="gap-3" style={styles.formGroup}>
                  <Text className="text-base font-medium mb-1" style={styles.label}>iso:</Text>
                  {renderPicker(iso, setIso, ISO_VALUES)}
                </Box>

                {/* Shutter Speed Input */}
                <Box className="gap-3" style={styles.formGroup}>
                  <Text className="text-base font-medium mb-1" style={styles.label}>shutter speed:</Text>
                  {renderPicker(shutterSpeed, setShutterSpeed, SHUTTER_SPEED_VALUES)}
                </Box>
              </Box>

              {/* Change Setting Column */}
              <Box
                style={[isMobile ? styles.mobileFormColumn : styles.fullWidth]}
              >
                <Text className="text-lg mb-4 font-semibold" style={styles.sectionTitle}>
                  change setting
                </Text>

                {/* Setting to Change */}
                <Box className="gap-3" style={styles.formGroup}>
                  <Text className="text-base font-medium mb-1" style={styles.label}>setting to change:</Text>
                  {renderPicker(settingToChange, setSettingToChange as (value: string) => void, settingOptions)}
                </Box>

                {/* New Value Input */}
                <Box className="gap-3" style={styles.formGroup}>
                  <Text className="text-base font-medium mb-1" style={styles.label}>new value:</Text>
                  {renderPicker(newValue, setNewValue, getNewValueOptions())}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Information Section */}
        <Box className="p-5 rounded-2xl mt-8 border shadow-sm" style={[
          styles.infoSection,
          {
            borderColor: outline,
            backgroundColor: cardBackground,
            shadowColor,
          },
        ]}>
          <Text className="text-lg mb-3 font-semibold" style={styles.infoTitle}>
            about this tool
          </Text>

          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            The camera exposure calculator helps you find equivalent exposures
            when you want to change one aspect of your exposure triangle
            (aperture, ISO, or shutter speed) while maintaining the same overall
            exposure.
          </Text>

          <Text className="text-base mt-4 mb-2 font-semibold" style={styles.infoSubtitle}>
            how to use:
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            1. Enter your current camera settings (aperture, ISO, and shutter
            speed)
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            2. Select which setting you want to change
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            3. Choose the new value for that setting
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            4. The calculator will show equivalent settings that maintain the
            same exposure
          </Text>

          <Text className="text-base mt-4 mb-2 font-semibold" style={styles.infoSubtitle}>
            the exposure triangle:
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • Aperture: Controls depth of field. Lower number = larger opening =
            more light
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • ISO: Controls sensitivity. Higher number = more sensitivity = more
            noise
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • Shutter Speed: Controls motion blur. Faster speed = less motion
            blur = less light
          </Text>

          <Text className="text-base mt-4 mb-2 font-semibold" style={styles.infoSubtitle}>
            notes:
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • Calculated shutter speeds are automatically rounded to the nearest
            standard camera value (e.g., 1/125, 1/60, 1/30, etc.)
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • Aperture values are also rounded to standard f-stops when changing
            shutter speed
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • Default values (f/5.6, ISO 100, 1/250s) with aperture change to
            f/16 are pre-loaded for quick reference
          </Text>
        </Box>
      </Box>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom:
      Platform.OS === "ios" || Platform.OS === "android" ? 100 : 80,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  webContent: {
    maxWidth: 1024,
    marginHorizontal: "auto",
    width: "100%",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    // borderBottomColor will be set dynamically
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: "600",
  },
  mainContent: {
    width: "100%",
  },
  webMainContent: {
    flexDirection: "row",
    gap: 40,
    alignItems: "flex-start",
  },
  resultsSection: {
    gap: 20,
    alignItems: "center",
    width: "100%",
    marginBottom: 32,
  },
  webResultsSection: {
    flex: 1,
    alignSelf: "stretch",
    marginBottom: 0,
  },
  form: {
    gap: 20,
    width: "100%",
  },
  webForm: {
    flex: 1,
    maxWidth: 480,
  },
  formGroup: {
    gap: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    opacity: 0.5,
    marginVertical: 8,
  },
  resultContainer: {
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 480,
    // backgroundColor set dynamically
    padding: 24,
    borderRadius: 16,
    // shadowColor set dynamically
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  resultRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 16,
    borderRadius: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    // borderBottomColor set dynamically
  },
  resultLabel: {
    fontSize: 16,
    textAlign: "right",
    flex: 1,
    // color set dynamically
    fontWeight: "500",
  },
  resultValue: {
    fontSize: 16,
    textAlign: "left",
    flex: 1,
    fontWeight: "600",
  },
  infoSection: {
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    // borderColor set dynamically
    // backgroundColor set dynamically
    // shadowColor set dynamically
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  webInfoSection: {
    maxWidth: 800,
    marginHorizontal: "auto",
  },
  infoTitle: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: "600",
  },
  infoSubtitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  infoContentText: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 22,
    // color set dynamically
  },
  // New styles for mobile two-column layout
  mobileFormColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  mobileFormColumn: {
    flex: 1,
    width: "48%",
  },
  fullWidth: {
    width: "100%",
  },
});

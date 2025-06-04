import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import {
  useCameraExposureCalculator,
  ExposureSetting,
} from "@/hooks/useCameraExposureCalculator";
import { APERTURE_VALUES, ISO_VALUES, SHUTTER_SPEED_VALUES } from "@/constants/exposure";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedSelect } from "@/components/ThemedSelect";

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
      <ThemedView
        style={[styles.content, Platform.OS === "web" && styles.webContent]}
      >
        <ThemedView style={[styles.header, { borderBottomColor: outline }]}>
          <ThemedText type="large" style={styles.title}>
            camera exposure calculator
          </ThemedText>
        </ThemedView>

        <ThemedView
          style={[
            styles.mainContent,
            Platform.OS === "web" && isDesktop && styles.webMainContent,
          ]}
        >
          {/* Results Section - Will show on initial load due to default values */}
          {equivalentExposure && (
            <ThemedView
              style={[
                styles.resultsSection,
                Platform.OS === "web" && isDesktop && styles.webResultsSection,
              ]}
            >
              <ThemedText type="largeSemiBold" style={styles.subtitle}>
                equivalent exposure
              </ThemedText>

              <ThemedView
                style={[
                  styles.resultContainer,
                  {
                    backgroundColor: cardBackground,
                    shadowColor,
                  },
                ]}
              >
                <ThemedView style={[styles.resultRow, { borderBottomColor: outline }]}>
                  <ThemedText style={[styles.resultLabel, { color: textSecondary }]}>aperture:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.resultValue}>
                    f/{equivalentExposure.aperture}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={[styles.resultRow, { borderBottomColor: outline }]}>
                  <ThemedText style={[styles.resultLabel, { color: textSecondary }]}>iso:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.resultValue}>
                    {equivalentExposure.iso}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={[styles.resultRow, { borderBottomColor: outline }]}>
                  <ThemedText style={[styles.resultLabel, { color: textSecondary }]}>
                    shutter speed:
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.resultValue}>
                    {equivalentExposure.shutterSpeed}s
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.resultRow}>
                  <ThemedText style={[styles.resultLabel, { color: textSecondary }]}>
                    exposure value:
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.resultValue}>
                    EV {equivalentExposure.ev}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          )}

          {/* Form Section */}
          <ThemedView
            style={[
              styles.form,
              Platform.OS === "web" && isDesktop && styles.webForm,
            ]}
          >
            {/* Two column layout container for mobile */}
            <ThemedView style={[isMobile ? styles.mobileFormColumns : {}]}>
              {/* Current Settings Column */}
              <ThemedView
                style={[isMobile ? styles.mobileFormColumn : styles.fullWidth]}
              >
                <ThemedText type="largeSemiBold" style={styles.sectionTitle}>
                  current settings
                </ThemedText>

                {/* Aperture Input - Use ThemedSelect */}
                <ThemedView style={styles.formGroup}>
                  <ThemedSelect
                    label="aperture:"
                    selectedValue={aperture}
                    onValueChange={setAperture}
                    items={APERTURE_VALUES}
                    placeholder="Select Aperture"
                    testID="aperture-picker"
                  />
                </ThemedView>

                {/* ISO Input - Use ThemedSelect */}
                <ThemedView style={styles.formGroup}>
                  <ThemedSelect
                    label="iso:"
                    selectedValue={iso}
                    onValueChange={setIso}
                    items={ISO_VALUES}
                    placeholder="Select ISO"
                    testID="iso-picker"
                  />
                </ThemedView>

                {/* Shutter Speed Input - Use ThemedSelect */}
                <ThemedView style={styles.formGroup}>
                  <ThemedSelect
                    label="shutter speed:"
                    selectedValue={shutterSpeed}
                    onValueChange={setShutterSpeed}
                    items={SHUTTER_SPEED_VALUES}
                    placeholder="Select Shutter Speed"
                    testID="shutter-speed-picker"
                  />
                </ThemedView>
              </ThemedView>

              {/* Change Setting Column */}
              <ThemedView
                style={[isMobile ? styles.mobileFormColumn : styles.fullWidth]}
              >
                <ThemedText type="largeSemiBold" style={styles.sectionTitle}>
                  change setting
                </ThemedText>

                {/* Setting to Change - Use ThemedSelect */}
                <ThemedView style={styles.formGroup}>
                  <ThemedSelect
                    label="setting to change:"
                    selectedValue={settingToChange}
                    onValueChange={setSettingToChange as (value: string) => void} // Cast needed due to ExposureSetting type
                    items={settingOptions}
                    placeholder="Select Setting"
                  />
                </ThemedView>

                {/* New Value Input - Use ThemedSelect */}
                <ThemedView style={styles.formGroup}>
                  <ThemedSelect
                    label="new value:"
                    selectedValue={newValue}
                    onValueChange={setNewValue}
                    items={getNewValueOptions()}
                    placeholder="Select New Value"
                    testID="new-value-picker"
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Information Section */}
        <ThemedView
          style={[
            styles.infoSection,
            {
              borderColor: outline,
              backgroundColor: cardBackground,
              shadowColor,
            },
          ]}
        >
          <ThemedText type="largeSemiBold" style={styles.infoTitle}>
            about this tool
          </ThemedText>

          <ThemedText style={[styles.infoContentText, { color: textSecondary }]}>
            The camera exposure calculator helps you find equivalent exposures
            when you want to change one aspect of your exposure triangle
            (aperture, ISO, or shutter speed) while maintaining the same overall
            exposure.
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            how to use:
          </ThemedText>
          <ThemedText style={[styles.infoContentText, { color: textSecondary }]}>
            1. Enter your current camera settings (aperture, ISO, and shutter
            speed)
          </ThemedText>
          <ThemedText style={[styles.infoContentText, { color: textSecondary }]}>
            2. Select which setting you want to change
          </ThemedText>
          <ThemedText style={[styles.infoContentText, { color: textSecondary }]}>
            3. Choose the new value for that setting
          </ThemedText>
          <ThemedText style={[styles.infoContentText, { color: textSecondary }]}>
            4. The calculator will show equivalent settings that maintain the
            same exposure
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            the exposure triangle:
          </ThemedText>
          <ThemedText style={[styles.infoContentText, { color: textSecondary }]}>
            • Aperture: Controls depth of field. Lower number = larger opening =
            more light
          </ThemedText>
          <ThemedText style={[styles.infoContentText, { color: textSecondary }]}>
            • ISO: Controls sensitivity. Higher number = more sensitivity = more
            noise
          </ThemedText>
          <ThemedText style={[styles.infoContentText, { color: textSecondary }]}>
            • Shutter Speed: Controls motion blur. Faster speed = less motion
            blur = less light
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            notes:
          </ThemedText>
          <ThemedText style={[styles.infoContentText, { color: textSecondary }]}>
            • Calculated shutter speeds are automatically rounded to the nearest
            standard camera value (e.g., 1/125, 1/60, 1/30, etc.)
          </ThemedText>
          <ThemedText style={[styles.infoContentText, { color: textSecondary }]}>
            • Aperture values are also rounded to standard f-stops when changing
            shutter speed
          </ThemedText>
          <ThemedText style={[styles.infoContentText, { color: textSecondary }]}>
            • Default values (f/5.6, ISO 100, 1/250s) with aperture change to
            f/16 are pre-loaded for quick reference
          </ThemedText>
        </ThemedView>
      </ThemedView>
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

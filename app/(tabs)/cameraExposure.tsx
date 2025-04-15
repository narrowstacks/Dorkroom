import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import Head from "expo-router/head"; 
import { Picker } from "@react-native-picker/picker";
import { useWindowDimensions } from "../hooks/useWindowDimensions";
import {
  useCameraExposureCalculator,
  APERTURE_VALUES,
  ISO_VALUES,
  SHUTTER_SPEED_VALUES,
  ExposureSetting,
} from "../hooks/useCameraExposureCalculator";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { useThemeColor } from "../hooks/useThemeColor";

export default function CameraExposureCalculator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const isMobile =
    Platform.OS === "ios" ||
    Platform.OS === "android" ||
    (Platform.OS === "web" && width <= 768);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

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
    items: Array<string>,
    testID?: string
  ) => {
    if (Platform.OS === "ios") {
      return (
        <ThemedView style={[styles.pickerContainer, { borderColor }]}>
          <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            itemStyle={{ color: textColor, height: 120 }}
            testID={testID}
          >
            {items.map((item) => (
              <Picker.Item key={item} label={item} value={item} />
            ))}
          </Picker>
        </ThemedView>
      );
    }

    return (
      <>
      <Head>
        <title>Camera Exposure Calculator</title>
        <meta name="description" content="Calculate the correct exposure time for your prints when resizing them." />
      </Head>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={[
          styles.picker,
          {
            backgroundColor,
            color: textColor,
            borderColor,
          },
        ]}
        dropdownIconColor={textColor}
        testID={testID}
      >
        {items.map((item) => (
          <Picker.Item key={item} label={item} value={item} />
        ))}
      </Picker>
      </>
    );
  };

  const settingOptions = [
    { label: "Aperture", value: "aperture" as ExposureSetting },
    { label: "ISO", value: "iso" as ExposureSetting },
    { label: "Shutter Speed", value: "shutterSpeed" as ExposureSetting },
  ];

  const renderSettingPicker = (
    value: ExposureSetting,
    onValueChange: (value: ExposureSetting) => void
  ) => {
    if (Platform.OS === "ios") {
      return (
        <ThemedView style={[styles.pickerContainer, { borderColor }]}>
          <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            itemStyle={{ color: textColor, height: 120 }}
          >
            {settingOptions.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </ThemedView>
      );
    }

    return (
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={[
          styles.picker,
          {
            backgroundColor,
            color: textColor,
            borderColor,
          },
        ]}
        dropdownIconColor={textColor}
      >
        {settingOptions.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    );
  };

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
        <ThemedView style={styles.header}>
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

              <ThemedView style={styles.resultContainer}>
                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>aperture:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.resultValue}>
                    f/{equivalentExposure.aperture}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>iso:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.resultValue}>
                    {equivalentExposure.iso}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>
                    shutter speed:
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.resultValue}>
                    {equivalentExposure.shutterSpeed}s
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>
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
                <ThemedText type="largeSemiBold" style={styles.subtitle}>
                  current settings
                </ThemedText>

                {/* Aperture Input */}
                <ThemedView style={styles.formGroup}>
                  <ThemedText style={styles.label}>aperture:</ThemedText>
                  {renderPicker(
                    aperture,
                    setAperture,
                    APERTURE_VALUES,
                    "aperture-picker"
                  )}
                </ThemedView>

                {/* ISO Input */}
                <ThemedView style={styles.formGroup}>
                  <ThemedText style={styles.label}>iso:</ThemedText>
                  {renderPicker(iso, setIso, ISO_VALUES, "iso-picker")}
                </ThemedView>

                {/* Shutter Speed Input */}
                <ThemedView style={styles.formGroup}>
                  <ThemedText style={styles.label}>shutter speed:</ThemedText>
                  {renderPicker(
                    shutterSpeed,
                    setShutterSpeed,
                    SHUTTER_SPEED_VALUES,
                    "shutter-speed-picker"
                  )}
                </ThemedView>
              </ThemedView>

              {/* Change Setting Column */}
              <ThemedView
                style={[isMobile ? styles.mobileFormColumn : styles.fullWidth]}
              >
                <ThemedText type="largeSemiBold" style={styles.subtitle}>
                  change setting
                </ThemedText>

                {/* Setting to Change */}
                <ThemedView style={styles.formGroup}>
                  <ThemedText style={styles.label}>
                    setting to change:
                  </ThemedText>
                  {renderSettingPicker(settingToChange, setSettingToChange)}
                </ThemedView>

                {/* New Value Input */}
                <ThemedView style={styles.formGroup}>
                  <ThemedText style={styles.label}>new value:</ThemedText>
                  {renderPicker(
                    newValue,
                    setNewValue,
                    getNewValueOptions(),
                    "new-value-picker"
                  )}
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Information Section */}
        <ThemedView
          style={[
            styles.infoSection,
            Platform.OS === "web" && isDesktop && styles.webInfoSection,
          ]}
        >
          <ThemedText type="largeSemiBold" style={styles.infoTitle}>
            about this tool
          </ThemedText>

          <ThemedText style={styles.infoContentText}>
            The camera exposure calculator helps you find equivalent exposures
            when you want to change one aspect of your exposure triangle
            (aperture, ISO, or shutter speed) while maintaining the same overall
            exposure.
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            how to use:
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            1. Enter your current camera settings (aperture, ISO, and shutter
            speed)
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            2. Select which setting you want to change
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            3. Choose the new value for that setting
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            4. The calculator will show equivalent settings that maintain the
            same exposure
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            the exposure triangle:
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • Aperture: Controls depth of field. Lower number = larger opening =
            more light
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • ISO: Controls sensitivity. Higher number = more sensitivity = more
            noise
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • Shutter Speed: Controls motion blur. Faster speed = less motion
            blur = less light
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            notes:
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • Calculated shutter speeds are automatically rounded to the nearest
            standard camera value (e.g., 1/125, 1/60, 1/30, etc.)
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • Aperture values are also rounded to standard f-stops when changing
            shutter speed
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
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
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  mainContent: {
    gap: 24,
  },
  webMainContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 32,
  },
  resultsSection: {
    marginBottom: 24,
    width: "100%",
  },
  webResultsSection: {
    flex: 1,
    marginBottom: 0,
  },
  form: {
    gap: 16,
    width: "100%",
  },
  webForm: {
    flex: 1,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    width: "50%",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    opacity: 0.5,
    marginVertical: 8,
  },
  resultContainer: {
    borderRadius: 8,
    padding: 16,
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 16,
  },
  resultValue: {
    fontSize: 16,
  },
  infoSection: {
    marginTop: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  webInfoSection: {
    maxWidth: 800,
    marginHorizontal: "auto",
  },
  infoTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  infoSubtitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  infoContentText: {
    fontSize: 16,
    marginBottom: 8,
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

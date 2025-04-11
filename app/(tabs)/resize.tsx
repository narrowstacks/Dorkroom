import React from "react";
import { StyleSheet, ScrollView, Platform, Linking } from "react-native";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { ResizeCalculator } from "../../components/ResizeCalculator";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { useThemeColor } from "../../hooks/useThemeColor";

export default function ResizeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "icon");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView
        style={[styles.content, Platform.OS === "web" && styles.webContent]}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="large" style={styles.title}>
            print resize calculator
          </ThemedText>
        </ThemedView>

        <ThemedView
          style={[
            styles.mainContent,
            Platform.OS === "web" && isDesktop && styles.webMainContent,
          ]}
        >
          <ResizeCalculator />
        </ThemedView>

        {/* Information about the tool */}
        <ThemedView
          style={[
            styles.infoSection,
            Platform.OS === "web" && isDesktop && styles.webInfoSection,
          ]}
        >
          <ThemedText type="largeSemiBold" style={styles.infoTitle}>
            About this tool
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            The print resize calculator helps you determine the correct exposure
            time when enlarging or reducing the size of your darkroom prints.
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            how to use:
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            1. Enter the width and height of your original print
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            2. Enter the width and height of your desired new print size
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            3. Enter the original exposure time in seconds
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            4. Click "Calculate New Exposure Time" to see the results
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            how it works:
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            When you change the size of a print, the light is spread across a
            different area, affecting the exposure needed. This is caused by the{" "}
            <ThemedText
              style={styles.link}
              onPress={() =>
                Linking.openURL(
                  "https://en.wikipedia.org/wiki/Inverse-square_law"
                )
              }
            >
              inverse-square law
            </ThemedText>
            . This calculator uses the ratio of the areas to determine the new
            exposure time.
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            The formula used is:{"\n"}New Time = Original Time × (New Area ÷
            Original Area)
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            tips:
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • The results of this should only be treated as a best-guess
            estimate. Always make a test strip when resizing prints!
          </ThemedText>

          <ThemedText style={styles.infoContentText}>
            • The "stops difference" shows how much you're changing exposure in
            photographic stops
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • A positive stops value means more exposure is needed (larger
            print)
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • A negative stops value means less exposure is needed (smaller
            print)
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
      Platform.OS === "ios" || Platform.OS === "android" ? 100 : 80, // Extra padding for tab bar
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    padding: 20,
    paddingTop: 0,
    textAlign: "center",
    marginBottom: 16,
  },
  mainContent: {
    width: "100%",
  },
  webContent: {
    maxWidth: 1024,
    marginHorizontal: "auto",
    width: "100%",
    padding: 24,
  },
  webMainContent: {
    flexDirection: "column",
    alignItems: "center",
  },
  infoSection: {
    padding: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  infoTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  infoSubtitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  infoContentText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  link: {
    color: "#2196F3",
    textDecorationLine: "underline",
  },
  webInfoSection: {
    maxWidth: 1024,
    marginHorizontal: "auto",
    width: "100%",
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});

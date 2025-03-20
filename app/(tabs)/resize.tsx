import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { ResizeCalculator } from "../../components/ResizeCalculator";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";

export default function ResizeScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Print Resize Calculator",
          headerLargeTitle: true,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText style={styles.description}>
          Calculate the adjusted exposure time when resizing your darkroom
          prints. Enter your original print dimensions, desired new dimensions,
          and original exposure time to get the new exposure time and stops
          difference.
        </ThemedText>

        <ResizeCalculator />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    padding: 20,
    paddingTop: 0,
    textAlign: "center",
  },
});

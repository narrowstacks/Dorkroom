import React, { ReactNode } from "react";
import { StyleSheet, Platform } from "react-native";
import { Box, Text } from "@gluestack-ui/themed";
import { useWindowDimensions } from "@/hooks/ui/detection";
import { useThemeColor } from "@/hooks/ui/theming";

interface ResultRowProps {
  label: string;
  value: string | ReactNode;
  isLast?: boolean;
}

interface ResultsSectionProps {
  title?: string;
  children: ReactNode;
  show?: boolean;
}

export function ResultRow({ label, value, isLast = false }: ResultRowProps) {
  const textSecondary = useThemeColor({}, "textSecondary");
  const outline = useThemeColor({}, "outline");
  const resultRowBackground = useThemeColor({}, "resultRowBackground");

  return (
    <Box
      className={`w-full flex-row justify-between gap-4 rounded-2xl py-2 ${!isLast ? "border-b" : ""}`}
      style={[
        styles.resultRow,
        !isLast && { borderBottomColor: outline },
        { backgroundColor: resultRowBackground },
      ]}
    >
      <Text
        className="flex-1 text-right text-base font-medium"
        style={[styles.resultLabel, { color: textSecondary }]}
      >
        {label}:
      </Text>
      <Text
        className="flex-1 text-left text-base font-semibold"
        style={styles.resultValue}
      >
        {value}
      </Text>
    </Box>
  );
}

export function ResultsSection({
  title = "Result",
  children,
  show = true,
}: ResultsSectionProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const cardBackground = useThemeColor({}, "cardBackground");
  const shadowColor = useThemeColor({}, "shadowColor");

  if (!show) return null;

  return (
    <Box
      className="mb-8 w-full items-center gap-5 web:mb-0 web:flex-1 web:self-stretch"
      style={[
        // styles.resultsSection,
        Platform.OS === "web" && isDesktop && styles.webResultsSection,
      ]}
    >
      <Text
        className="mb-2 text-center text-2xl font-semibold"
        style={styles.subtitle}
      >
        {title}
      </Text>

      <Box
        className="w-full max-w-lg items-center gap-4 rounded-2xl p-6 shadow-lg"
        style={[
          styles.resultContainer,
          {
            backgroundColor: cardBackground,
            shadowColor,
          },
        ]}
      >
        {children}
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  webResultsSection: {
    flex: 1,
    alignSelf: "stretch",
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  resultContainer: {
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 480,
    padding: 24,
    borderRadius: 16,
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
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  resultLabel: {
    fontSize: 16,
    textAlign: "right",
    flex: 1,
    fontWeight: "500",
  },
  resultValue: {
    fontSize: 16,
    textAlign: "left",
    flex: 1,
    fontWeight: "600",
  },
});

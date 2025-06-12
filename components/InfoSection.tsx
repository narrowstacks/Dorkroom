import React, { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Box, Text } from "@gluestack-ui/themed";
import { useThemeColor } from "@/hooks/useThemeColor";

interface InfoSectionProps {
  title: string;
  children: ReactNode;
}

interface InfoSubtitleProps {
  children: string;
}

interface InfoTextProps {
  children: string | ReactNode;
}

interface InfoListProps {
  items: string[];
}

export function InfoSubtitle({ children }: InfoSubtitleProps) {
  return (
    <Text className="text-base mt-4 mb-2 font-semibold" style={styles.infoSubtitle}>
      {children}
    </Text>
  );
}

export function InfoText({ children }: InfoTextProps) {
  const textSecondary = useThemeColor({}, "textSecondary");
  
  return (
    <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
      {children}
    </Text>
  );
}

export function InfoList({ items }: InfoListProps) {
  const textSecondary = useThemeColor({}, "textSecondary");
  
  return (
    <>
      {items.map((item, index) => (
        <Text 
          key={index} 
          className="text-base leading-6" 
          style={[styles.infoContentText, { color: textSecondary }]}
        >
          {item}
        </Text>
      ))}
    </>
  );
}

export function InfoFormula({ children }: InfoTextProps) {
  const textColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "cardBackground");
  
  return (
    <Box 
      className="p-3 rounded-lg mb-4" 
      style={[
        styles.formulaBox,
        { 
          backgroundColor: cardBackground,
          borderColor: useThemeColor({}, "outline"),
        }
      ]}
    >
      <Text 
        className="text-sm font-semibold text-center" 
        style={[styles.formulaText, { color: textColor }]}
      >
        {children}
      </Text>
    </Box>
  );
}

export function InfoSection({ title, children }: InfoSectionProps) {
  const outline = useThemeColor({}, "outline");
  const cardBackground = useThemeColor({}, "cardBackground");
  const shadowColor = useThemeColor({}, "shadowColor");

  return (
    <Box className="p-5 rounded-2xl mt-8 border shadow-sm" style={[
      styles.infoSection,
      {
        borderColor: outline,
        backgroundColor: cardBackground,
        shadowColor,
      },
    ]}>
      <Text className="text-lg mb-3 font-semibold" style={styles.infoTitle}>
        {title}
      </Text>
      {children}
    </Box>
  );
}

const styles = StyleSheet.create({
  infoSection: {
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
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
  },
  formulaBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  formulaText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
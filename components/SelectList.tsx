import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

interface SelectListProps {
  value: string;
  onValueChange: (value: string) => void;
  items: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export function SelectList({
  value,
  onValueChange,
  items,
  placeholder,
}: SelectListProps) {
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");

  return (
    <ThemedView style={[styles.container, { borderColor }]}>
      <ScrollView
        style={styles.scrollView}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {items.map((item) => (
          <Pressable
            key={item.value}
            style={[
              styles.item,
              value === item.value && { backgroundColor: tintColor },
              value !== item.value && { borderColor },
            ]}
            onPress={() => onValueChange(item.value)}
          >
            <ThemedText
              style={[
                styles.itemText,
                value === item.value && styles.selectedItemText,
              ]}
            >
              {item.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  scrollView: {
    flexGrow: 0,
  },
  item: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  itemText: {
    fontSize: 14,
  },
  selectedItemText: {
    color: "#fff",
  },
});

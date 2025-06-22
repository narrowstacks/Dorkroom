import React from "react";
import { Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Box } from "@gluestack-ui/themed";
import { Search, X } from "lucide-react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { MobileSelectButton } from "@/components/ui/select/MobileSelectButton";
import type { Film, Developer } from "@/api/dorkroom/types";

interface BaseSearchInputProps {
  placeholder: string;
  type: 'film' | 'developer';
}

interface DesktopSearchInputProps extends BaseSearchInputProps {
  variant: 'desktop';
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface MobileSearchInputProps extends BaseSearchInputProps {
  variant: 'mobile';
  selectedItem?: Film | Developer | null;
  onPress: () => void;
}

type SearchInputProps = DesktopSearchInputProps | MobileSearchInputProps;

export function SearchInput(props: SearchInputProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  
  // Always call hooks at the top level
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borderColor");
  const inputBackground = useThemeColor({}, "inputBackground");
  const iconColor = useThemeColor({}, "icon");
  
  // Auto-detect variant if not specified based on platform
  const variant = props.variant || (isDesktop ? 'desktop' : 'mobile');
  
  if (variant === 'mobile') {
    const mobileProps = props as MobileSearchInputProps;
    return (
      <MobileSelectButton
        label={mobileProps.type === 'film' ? 'Film' : 'Developer'}
        selectedItem={mobileProps.selectedItem}
        onPress={mobileProps.onPress}
        type={mobileProps.type}
      />
    );
  }

  // Desktop variant
  const desktopProps = props as DesktopSearchInputProps;

  return (
    <Box style={styles.searchContainer}>
      <Search size={20} color={iconColor} style={styles.searchIcon} />
      <TextInput
        style={[
          styles.searchInput,
          {
            color: textColor,
            backgroundColor: inputBackground,
            borderColor,
          },
        ]}
        value={desktopProps.value}
        onChangeText={desktopProps.onChangeText}
        placeholder={desktopProps.placeholder}
        placeholderTextColor={iconColor}
        onFocus={desktopProps.onFocus}
        onBlur={desktopProps.onBlur}
      />
      {desktopProps.value.length > 0 && (
        <TouchableOpacity onPress={desktopProps.onClear} style={styles.clearButton}>
          <X size={20} color={iconColor} />
        </TouchableOpacity>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    zIndex: 1,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 36,
    paddingRight: 36,
    fontSize: 12,
    flex: 1,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    zIndex: 1,
    padding: 4,
  },
});
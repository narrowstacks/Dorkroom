import React from "react";
import { Platform, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Box, Text, Modal } from "@gluestack-ui/themed";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { MobileSelectionModal } from "./MobileSelectionModal";
import type { Film, Developer } from "@/api/dorkroom/types";

export interface SearchDropdownItem {
  id: string;
  title: string;
  subtitle: string;
}

interface BaseSearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onItemSelect: (item: SearchDropdownItem) => void;
}

interface DesktopSearchDropdownProps extends BaseSearchDropdownProps {
  variant: 'desktop';
  items: SearchDropdownItem[];
  position: 'left' | 'right';
  dynamicPosition?: {
    top: number;
    left: number;
    width: number;
  } | null;
}

interface MobileSearchDropdownProps extends BaseSearchDropdownProps {
  variant: 'mobile';
  type: 'film' | 'developer';
  films?: Film[];
  developers?: Developer[];
  onFilmSelect?: (film: Film) => void;
  onDeveloperSelect?: (developer: Developer) => void;
}

type SearchDropdownProps = DesktopSearchDropdownProps | MobileSearchDropdownProps;

export function SearchDropdown(props: SearchDropdownProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  
  // Always call hooks at the top level
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borderColor");
  const cardBackground = useThemeColor({}, "cardBackground");
  
  // Auto-detect variant if not specified based on platform
  const variant = props.variant || (isDesktop ? 'desktop' : 'mobile');
  
  if (variant === 'mobile') {
    const mobileProps = props as MobileSearchDropdownProps;
    return (
      <MobileSelectionModal
        isOpen={props.isOpen}
        onClose={props.onClose}
        type={mobileProps.type}
        films={mobileProps.films}
        developers={mobileProps.developers}
        onFilmSelect={(film) => {
          if (mobileProps.onFilmSelect) {
            mobileProps.onFilmSelect(film);
          } else {
            // Convert to SearchDropdownItem format
            props.onItemSelect({
              id: film.uuid,
              title: film.name,
              subtitle: film.brand
            });
          }
        }}
        onDeveloperSelect={(developer) => {
          if (mobileProps.onDeveloperSelect) {
            mobileProps.onDeveloperSelect(developer);
          } else {
            // Convert to SearchDropdownItem format
            props.onItemSelect({
              id: developer.uuid,
              title: developer.name,
              subtitle: developer.manufacturer
            });
          }
        }}
      />
    );
  }

  // Desktop variant
  const desktopProps = props as DesktopSearchDropdownProps;

  // Only show on desktop and if we have positioning data
  if (!isDesktop || desktopProps.items.length === 0 || !desktopProps.dynamicPosition) {
    return null;
  }

  // Create dynamic overlay style based on the position data
  const dynamicOverlayStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start' as const,
    alignItems: 'flex-start' as const,
    paddingTop: desktopProps.dynamicPosition.top,
    paddingLeft: desktopProps.dynamicPosition.left,
    paddingRight: 0,
  };

  // Calculate dropdown width (same as search input)
  const dropdownWidth = desktopProps.dynamicPosition.width;

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      size="sm"
    >
      <Box 
        style={dynamicOverlayStyle} 
        onTouchEnd={props.onClose}
      >
        <Box style={[styles.dropdownContent, { 
          borderColor, 
          backgroundColor: cardBackground,
          shadowColor: textColor,
          width: dropdownWidth 
        }]}>
          <ScrollView 
            style={styles.dropdownScroll}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {desktopProps.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.dropdownItem, { borderBottomColor: borderColor }]}
                onPress={() => props.onItemSelect(item)}
              >
                <Text style={[styles.dropdownItemTitle, { color: textColor }]}>
                  {item.title}
                </Text>
                <Text style={[styles.dropdownItemSubtitle, { color: textColor }]}>
                  {item.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Box>
      </Box>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dropdownContent: {
    borderWidth: 1,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    maxHeight: 200,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1000,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  dropdownItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  dropdownItemSubtitle: {
    fontSize: 13,
    opacity: 0.75,
    fontWeight: '500',
    lineHeight: 16,
  },
});
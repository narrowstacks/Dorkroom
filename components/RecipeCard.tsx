import React from "react";
import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Box, Text } from "@gluestack-ui/themed";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { formatTime } from "@/constants/developmentRecipes";
import { formatDilution } from "@/utils/dilutionUtils";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";

interface RecipeCardProps {
  combination: Combination;
  film: Film | undefined;
  developer: Developer | undefined;
  onPress: () => void;
  isCustomRecipe: boolean;
}

export function RecipeCard({ combination, film, developer, onPress, isCustomRecipe }: RecipeCardProps) {
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const borderColor = useThemeColor({}, "borderColor");
  const resultRowBackground = useThemeColor({}, "resultRowBackground");
  const { width } = useWindowDimensions();
  const isMobile = Platform.OS !== "web" || width <= 768;
  
  // Calculate card width based on screen size
  const getCardWidth = () => {
    if (isMobile) {
      return '46%'; // 2 cards per row on mobile with more space
    } else if (width > 1600) {
      return '23%'; // 4 cards per row on very large desktop
    } else if (width > 1200) {
      return '30%'; // 3 cards per row on large desktop
    } else {
      return '47%'; // 2 cards per row on medium desktop
    }
  };

  const filmName = film ? 
    (isMobile ? film.name : `${film.brand} ${film.name}`) : 
    "Unknown Film";
  
  // Check if shooting ISO is different from film stock ISO
  const isNonStandardISO = film && combination.shootingIso !== film.isoSpeed;
  
  // Format push/pull value if present
  const pushPullDisplay = combination.pushPull !== 0 
    ? ` ${combination.pushPull > 0 ? `+${combination.pushPull}` : combination.pushPull}`
    : null;
    
  const developerName = developer ? 
    (isMobile ? developer.name : `${developer.manufacturer} ${developer.name}`) : 
    "Unknown Developer";

  // Get dilution info
  const dilutionInfo = formatDilution(
    combination.customDilution || 
    (developer?.dilutions.find(d => d.id === combination.dilutionId)?.dilution) || 
    "Stock"
  );

  // Check if temperature is non-standard (not 68°F)
  const isNonStandardTemp = combination.temperatureF !== 68;
  const tempDisplay = `${combination.temperatureF}°F`;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.cardTouchable, { width: getCardWidth() }]}>
      <Box style={[
        styles.recipeCard, 
        { 
          backgroundColor: cardBackground,
          borderColor: borderColor,
        }
      ]}>
        {/* Header with Film and ISO */}
        <Box style={styles.cardHeader}>
          <Text style={[styles.cardFilmName, { color: textColor }]} numberOfLines={1}>
            {filmName}
            {isNonStandardISO && (
              <Text style={[styles.cardISO, { color: developmentTint }]}>
                {' @ '}{combination.shootingIso} ISO
              </Text>
            )}
            {!isNonStandardISO && (
              <Text style={[styles.cardISO, { color: textColor }]}>
                {' @ '}{combination.shootingIso} ISO
              </Text>
            )}
            {pushPullDisplay && (
              <Text style={{ color: developmentTint }}>
                {pushPullDisplay}
              </Text>
            )}
          </Text>
          {isCustomRecipe && (
            <Box style={[styles.customBadge, { backgroundColor: developmentTint }]}>
              <Text style={styles.customBadgeText}>●</Text>
            </Box>
          )}
        </Box>
        
        {/* Developer and Dilution Parameters */}
        <Box style={[styles.cardParams, styles.firstParamSection]}>
          <Box style={[styles.paramBox, { backgroundColor: resultRowBackground }]}>
            <Text style={[styles.cardParamLabel, { color: textColor }]}>
              Developer
            </Text>
            <Text style={[styles.cardParamValue, { color: textColor }]} numberOfLines={1}>
              {developerName}
            </Text>
          </Box>
          <Box style={[styles.paramBox, { backgroundColor: resultRowBackground }]}>
            <Text style={[styles.cardParamLabel, { color: textColor }]}>
              Dilution
            </Text>
            <Text style={[styles.cardParamValue, { color: textColor }]}>
              {dilutionInfo}
            </Text>
          </Box>
        </Box>
        
        {/* Time and Temperature Parameters */}
        <Box style={styles.cardParams}>
          <Box style={[styles.paramBox, { backgroundColor: resultRowBackground }]}>
            <Text style={[styles.cardParamLabel, { color: textColor }]}>
              Time
            </Text>
            <Text style={[styles.cardParamValue, { color: textColor }]}>
              {formatTime(combination.timeMinutes)}
            </Text>
          </Box>
          <Box style={[styles.paramBox, { backgroundColor: resultRowBackground }]}>
            <Text style={[
              styles.cardParamLabel,
              { color: isNonStandardTemp ? developmentTint : textColor }
            ]}>
              Temperature
            </Text>
            <Text style={[
              styles.cardParamValue,
              { color: isNonStandardTemp ? developmentTint : textColor }
            ]}>
              {tempDisplay}{isNonStandardTemp && ' ⚠'}
            </Text>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardTouchable: {
    minWidth: 320,
    maxWidth: 500,
    marginBottom: 12,
    marginHorizontal: 6, // Half of the original 12px gap for horizontal spacing
  },
  recipeCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    minHeight: 24,
  },
  cardFilmName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
    marginRight: 8,
  },
  cardISO: {
    fontSize: 14,
    fontWeight: '500',
  },
  customBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 6,
  },
  customBadgeText: {
    fontSize: 6,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 8,
  },
  cardParams: {
    gap: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardParamLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardParamValue: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '400',
  },
  paramBox: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flex: 1,
    maxWidth: '48%',
    minWidth: '48%',
    alignItems: 'center',
  },
  firstParamSection: {
    marginBottom: 6,
  },
});
import React, { useState } from "react";
import { Platform, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal } from "react-native";
import { Box, Text, Button, ButtonText, VStack, HStack } from "@gluestack-ui/themed";
import { Search, X, Filter, RefreshCw } from "lucide-react-native";

import { CalculatorLayout } from "@/components/CalculatorLayout";
import { FormSection, FormGroup } from "@/components/FormSection";
import { InfoSection, InfoText, InfoSubtitle, InfoList } from "@/components/InfoSection";
import { StyledSelect } from "@/components/StyledSelect";
import { RecipeDetail } from "@/components/RecipeDetail";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useDevelopmentRecipes } from "@/hooks/useDevelopmentRecipes";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import {
  FILM_COLOR_TYPES,
  DEVELOPER_TYPES,
  SORT_OPTIONS,
  PUSH_PULL_LABELS,
  convertToDisplay,
  formatTime,
} from "@/constants/developmentRecipes";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onClear: () => void;
}

function SearchInput({ value, onChangeText, placeholder, onClear }: SearchInputProps) {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borderColor");
  const inputBackground = useThemeColor({}, "inputBackground");
  const iconColor = useThemeColor({}, "icon");

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
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={iconColor}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <X size={20} color={iconColor} />
        </TouchableOpacity>
      )}
    </Box>
  );
}

interface CombinationCardProps {
  combination: Combination;
  film: Film | undefined;
  developer: Developer | undefined;
  onPress: () => void;
}

function CombinationCard({ combination, film, developer, onPress }: CombinationCardProps) {
  const cardBackground = useThemeColor({}, "cardBackground");
  const shadowColor = useThemeColor({}, "shadowColor");
  const outline = useThemeColor({}, "outline");
  const textSecondary = useThemeColor({}, "textSecondary");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");

  const filmName = film ? `${film.brand} ${film.name}` : "Unknown Film";
  const developerName = developer ? `${developer.manufacturer} ${developer.name}` : "Unknown Developer";

  // Get dilution info
  const dilutionInfo = combination.customDilution || 
    (developer?.dilutions.find(d => d.id === combination.dilutionId)?.dilution) || 
    "Stock";

  return (
    <TouchableOpacity onPress={onPress}>
      <Box
        style={[
          styles.combinationCard,
          {
            backgroundColor: cardBackground,
            borderColor: outline,
            shadowColor,
          },
        ]}
      >
      {/* Header with film and developer names */}
      <Box style={styles.cardHeader}>
        <Text style={[styles.filmName, { color: developmentTint }]} numberOfLines={1}>
          {filmName}
        </Text>
        <Text style={[styles.developerName, { color: textSecondary }]} numberOfLines={1}>
          {developerName}
        </Text>
      </Box>

      {/* Development parameters */}
      <Box style={styles.parametersGrid}>
        <Box style={styles.parameterItem}>
          <Text style={[styles.parameterLabel, { color: textSecondary }]}>Time</Text>
          <Text style={styles.parameterValue}>{formatTime(combination.timeMinutes)}</Text>
        </Box>
        
        <Box style={styles.parameterItem}>
          <Text style={[styles.parameterLabel, { color: textSecondary }]}>Temp</Text>
          <Text style={styles.parameterValue}>{convertToDisplay(combination.temperatureF)}</Text>
        </Box>
        
        <Box style={styles.parameterItem}>
          <Text style={[styles.parameterLabel, { color: textSecondary }]}>ISO</Text>
          <Text style={styles.parameterValue}>{combination.shootingIso}</Text>
        </Box>
        
        <Box style={styles.parameterItem}>
          <Text style={[styles.parameterLabel, { color: textSecondary }]}>Dilution</Text>
          <Text style={styles.parameterValue}>{dilutionInfo}</Text>
        </Box>
      </Box>

      {/* Push/pull and notes */}
      {(combination.pushPull !== 0 || combination.notes) && (
        <Box style={styles.cardFooter}>
          {combination.pushPull !== 0 && (
            <Text style={[styles.pushPullText, { color: developmentTint }]}>
              {PUSH_PULL_LABELS[combination.pushPull] || `${combination.pushPull > 0 ? '+' : ''}${combination.pushPull} stops`}
            </Text>
          )}
          {combination.notes && (
            <Text style={[styles.notesText, { color: textSecondary }]} numberOfLines={2}>
              {combination.notes}
            </Text>
          )}
        </Box>
      )}
      </Box>
    </TouchableOpacity>
  );
}

export default function DevelopmentRecipes() {
  const {
    // State
    filmSearch,
    developerSearch,
    colorTypeFilter,
    developerTypeFilter,
    sortBy,
    selectedFilm,
    selectedDeveloper,
    isLoading,
    isLoaded,
    error,
    allFilms,
    allDevelopers,
    filteredCombinations,
    
    // Actions
    setFilmSearch,
    setDeveloperSearch,
    setColorTypeFilter,
    setDeveloperTypeFilter,
    setSortBy,
    setSelectedFilm,
    setSelectedDeveloper,
    loadData,
    clearFilters,
    getFilmById,
    getDeveloperById,
  } = useDevelopmentRecipes();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCombination, setSelectedCombination] = useState<Combination | null>(null);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");

  // Film suggestions for search
  const filmSuggestions = React.useMemo(() => {
    if (!filmSearch.trim()) return [];
    return allFilms
      .filter(film =>
        film.name.toLowerCase().includes(filmSearch.toLowerCase()) ||
        film.brand.toLowerCase().includes(filmSearch.toLowerCase())
      )
      .slice(0, 5);
  }, [allFilms, filmSearch]);

  // Developer suggestions for search
  const developerSuggestions = React.useMemo(() => {
    if (!developerSearch.trim()) return [];
    return allDevelopers
      .filter(dev =>
        dev.name.toLowerCase().includes(developerSearch.toLowerCase()) ||
        dev.manufacturer.toLowerCase().includes(developerSearch.toLowerCase())
      )
      .slice(0, 5);
  }, [allDevelopers, developerSearch]);

  const infoSection = (
    <InfoSection title="About Development Recipes">
      <InfoText>
        Browse and search through a comprehensive database of film development 
        combinations. Find the optimal development parameters for your film and 
        developer combinations.
      </InfoText>

      <InfoSubtitle>How to Use:</InfoSubtitle>
      <InfoList
        items={[
          "Search for films by name or brand",
          "Search for developers by manufacturer or name",
          "Use filters to narrow by film type or developer type",
          "Sort results by film name, developer, time, temperature, or ISO",
          "View detailed development parameters for each combination",
        ]}
      />

      <InfoSubtitle>Development Parameters:</InfoSubtitle>
      <InfoText>
        Each combination shows development time, temperature (in both Fahrenheit 
        and Celsius), recommended shooting ISO, dilution ratio, and any push/pull 
        processing notes.
      </InfoText>

      <InfoSubtitle>Tips:</InfoSubtitle>
      <InfoList
        items={[
          "Temperature is critical - maintain consistency within ±0.5°F",
          "Agitation schedule affects contrast and grain structure",
          "Push/pull processing changes both time and development characteristics",
          "Always refer to manufacturer data sheets for safety information",
        ]}
      />
    </InfoSection>
  );

  if (error) {
    return (
      <CalculatorLayout title="Development Recipes" infoSection={infoSection}>
        <Box style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>
            Error loading development data: {error}
          </Text>
          <Button onPress={loadData} style={styles.retryButton}>
            <RefreshCw size={16} color="#fff" />
            <ButtonText style={styles.retryButtonText}>Retry</ButtonText>
          </Button>
        </Box>
      </CalculatorLayout>
    );
  }

  if (isLoading || !isLoaded) {
    return (
      <CalculatorLayout title="Development Recipes" infoSection={infoSection}>
        <Box style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading development data...
          </Text>
        </Box>
      </CalculatorLayout>
    );
  }

  return (
    <CalculatorLayout title="Development Recipes" infoSection={infoSection}>
      <Box style={[styles.mainContainer, isDesktop && styles.desktopMainContainer]}>
        {/* Left Panel - Search, Filters, and Results */}
        <Box style={[styles.leftPanel, isDesktop && styles.desktopLeftPanel]}>
          {/* Search and Filter Section */}
          <FormSection>
        <VStack space="md">
          {/* Search Fields */}
          <Box>
            <Text style={[styles.sectionLabel, { color: textColor }]}>Search</Text>
            
            <VStack space="sm">
              <Box>
                <SearchInput
                  value={filmSearch}
                  onChangeText={setFilmSearch}
                  placeholder="Search films..."
                  onClear={() => setFilmSearch('')}
                />
                
                {/* Film suggestions */}
                {filmSuggestions.length > 0 && (
                  <Box style={styles.suggestionsContainer}>
                    {filmSuggestions.map((film) => (
                      <TouchableOpacity
                        key={film.uuid}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setSelectedFilm(film);
                          setFilmSearch('');
                        }}
                      >
                        <Text style={[styles.suggestionText, { color: textColor }]}>
                          {film.brand} {film.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </Box>
                )}
              </Box>

              <Box>
                <SearchInput
                  value={developerSearch}
                  onChangeText={setDeveloperSearch}
                  placeholder="Search developers..."
                  onClear={() => setDeveloperSearch('')}
                />
                
                {/* Developer suggestions */}
                {developerSuggestions.length > 0 && (
                  <Box style={styles.suggestionsContainer}>
                    {developerSuggestions.map((developer) => (
                      <TouchableOpacity
                        key={developer.uuid}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setSelectedDeveloper(developer);
                          setDeveloperSearch('');
                        }}
                      >
                        <Text style={[styles.suggestionText, { color: textColor }]}>
                          {developer.manufacturer} {developer.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </Box>
                )}
              </Box>
            </VStack>
          </Box>

          {/* Selected Items Display */}
          {(selectedFilm || selectedDeveloper) && (
            <Box style={styles.selectedItemsContainer}>
              <HStack space="sm" style={styles.selectedItemsHeader}>
                <Text style={[styles.sectionLabel, { color: textColor }]}>Selected:</Text>
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={[styles.clearAllText, { color: developmentTint }]}>Clear All</Text>
                </TouchableOpacity>
              </HStack>
              
              {selectedFilm && (
                <Box style={styles.selectedItem}>
                  <Text style={[styles.selectedItemText, { color: textColor }]}>
                    Film: {selectedFilm.brand} {selectedFilm.name}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedFilm(null)}>
                    <X size={16} color={textColor} />
                  </TouchableOpacity>
                </Box>
              )}
              
              {selectedDeveloper && (
                <Box style={styles.selectedItem}>
                  <Text style={[styles.selectedItemText, { color: textColor }]}>
                    Developer: {selectedDeveloper.manufacturer} {selectedDeveloper.name}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedDeveloper(null)}>
                    <X size={16} color={textColor} />
                  </TouchableOpacity>
                </Box>
              )}
            </Box>
          )}

          {/* Filter Toggle */}
          <TouchableOpacity 
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} color={developmentTint} />
            <Text style={[styles.filterToggleText, { color: developmentTint }]}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Text>
          </TouchableOpacity>

          {/* Filters */}
          {showFilters && (
            <VStack space="sm">
              <FormGroup label="Film Type">
                <StyledSelect
                  value={colorTypeFilter}
                  onValueChange={setColorTypeFilter}
                  items={FILM_COLOR_TYPES}
                />
              </FormGroup>

              <FormGroup label="Developer Type">
                <StyledSelect
                  value={developerTypeFilter}
                  onValueChange={setDeveloperTypeFilter}
                  items={DEVELOPER_TYPES}
                />
              </FormGroup>

              <FormGroup label="Sort By">
                <StyledSelect
                  value={sortBy}
                  onValueChange={setSortBy}
                  items={SORT_OPTIONS}
                />
              </FormGroup>
            </VStack>
          )}
        </VStack>
      </FormSection>

      {/* Results Section */}
      <Box style={styles.resultsSection}>
        <Text style={[styles.resultsHeader, { color: textColor }]}>
          {filteredCombinations.length} Development Recipe{filteredCombinations.length !== 1 ? 's' : ''}
        </Text>

        {filteredCombinations.length === 0 ? (
          <Box style={styles.noResultsContainer}>
            <Text style={[styles.noResultsText, { color: textColor }]}>
              No development recipes found.
            </Text>
            <Text style={[styles.noResultsSubtext, { color: textColor }]}>
              Try adjusting your search terms or filters.
            </Text>
          </Box>
        ) : (
          <ScrollView style={styles.resultsScrollView} showsVerticalScrollIndicator={false}>
            {filteredCombinations.map((combination) => (
              <CombinationCard
                key={combination.uuid}
                combination={combination}
                film={getFilmById(combination.filmStockId)}
                developer={getDeveloperById(combination.developerId)}
                onPress={() => setSelectedCombination(combination)}
              />
            ))}
          </ScrollView>
        )}
        </Box>
      </Box>

      {/* Right Panel - Recipe Detail (Desktop) */}
      {isDesktop && selectedCombination && (
        <Box style={styles.desktopRightPanel}>
          <RecipeDetail
            combination={selectedCombination}
            film={getFilmById(selectedCombination.filmStockId)}
            developer={getDeveloperById(selectedCombination.developerId)}
            onClose={() => setSelectedCombination(null)}
          />
        </Box>
      )}

      {/* Mobile Modal - Recipe Detail */}
      {!isDesktop && (
        <Modal
          visible={selectedCombination !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedCombination(null)}
        >
          {selectedCombination && (
            <RecipeDetail
              combination={selectedCombination}
              film={getFilmById(selectedCombination.filmStockId)}
              developer={getDeveloperById(selectedCombination.developerId)}
              onClose={() => setSelectedCombination(null)}
            />
          )}
        </Modal>
      )}
      </Box>
    </CalculatorLayout>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
  },
  desktopMainContainer: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  leftPanel: {
    flex: 1,
  },
  desktopLeftPanel: {
    flex: 1,
    maxWidth: '60%',
  },
  desktopRightPanel: {
    width: '40%',
    minWidth: 400,
    maxHeight: '80vh',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  
  // Search Input Styles
  searchContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 44,
    fontSize: 16,
    flex: 1,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  
  // Suggestions Styles
  suggestionsContainer: {
    marginTop: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  suggestionItem: {
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  suggestionText: {
    fontSize: 14,
  },
  
  // Selected Items Styles
  selectedItemsContainer: {
    marginTop: 8,
  },
  selectedItemsHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedItemText: {
    fontSize: 14,
    flex: 1,
  },
  
  // Filter Toggle Styles
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  
  // Results Styles
  resultsSection: {
    flex: 1,
    marginTop: 16,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  resultsScrollView: {
    flex: 1,
  },
  
  // Combination Card Styles
  combinationCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  filmName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  developerName: {
    fontSize: 14,
    fontWeight: "500",
  },
  parametersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  parameterItem: {
    width: "48%",
    marginBottom: 8,
  },
  parameterLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  pushPullText: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  
  // Loading and Error Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  noResultsSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});
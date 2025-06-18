import React, { useState } from "react";
import { Platform, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal } from "react-native";
import { Box, Text, Button, ButtonText, VStack, HStack } from "@gluestack-ui/themed";
import { Search, X, Filter, RefreshCw, ChevronDown } from "lucide-react-native";

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

interface TableHeaderProps {
  title: string;
  sortKey: string;
  currentSort: string;
  onSort: (sortKey: string) => void;
}

function TableHeader({ title, sortKey, currentSort, onSort }: TableHeaderProps) {
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const isActive = currentSort === sortKey;

  // Define flex values to match the row cells
  const getHeaderStyle = () => {
    switch (sortKey) {
      case 'filmName': return { flex: 2.5 };
      case 'developerName': return { flex: 2 };
      case 'timeMinutes': return { flex: 1 };
      case 'temperatureF': return { flex: 1 };
      case 'shootingIso': return { flex: 0.8 };
      case 'dilution': return { flex: 1.2 };
      default: return { flex: 1 };
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.tableHeader, getHeaderStyle()]} 
      onPress={() => onSort(sortKey)}
    >
      <Text style={[styles.tableHeaderText, { color: isActive ? developmentTint : textColor }]}>
        {title}
      </Text>
      {isActive && (
        <ChevronDown size={12} color={developmentTint} style={styles.sortIcon} />
      )}
    </TouchableOpacity>
  );
}

interface RecipeRowProps {
  combination: Combination;
  film: Film | undefined;
  developer: Developer | undefined;
  onPress: () => void;
  isEven: boolean;
}

function RecipeRow({ combination, film, developer, onPress, isEven }: RecipeRowProps) {
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const rowBackground = useThemeColor({}, isEven ? "cardBackground" : "background");

  const filmName = film ? `${film.brand} ${film.name}` : "Unknown Film";
  const developerName = developer ? `${developer.manufacturer} ${developer.name}` : "Unknown Developer";

  // Get dilution info
  const dilutionInfo = combination.customDilution || 
    (developer?.dilutions.find(d => d.id === combination.dilutionId)?.dilution) || 
    "Stock";

  // Format temperature more compactly
  const tempDisplay = `${combination.temperatureF}°F`;

  return (
    <TouchableOpacity onPress={onPress}>
      <Box style={[styles.tableRow, { backgroundColor: rowBackground }]}>
        <Box style={styles.filmCell}>
          <Text style={[styles.filmText, { color: developmentTint }]} numberOfLines={1}>
            {filmName}
          </Text>
        </Box>
        
        <Box style={styles.developerCell}>
          <Text style={[styles.developerText, { color: textColor }]} numberOfLines={1}>
            {developerName}
          </Text>
        </Box>
        
        <Box style={styles.timeCell}>
          <Text style={[styles.paramText, { color: textColor }]}>
            {formatTime(combination.timeMinutes)}
          </Text>
        </Box>
        
        <Box style={styles.tempCell}>
          <Text style={[styles.paramText, { color: textColor }]}>
            {tempDisplay}
          </Text>
        </Box>
        
        <Box style={styles.isoCell}>
          <Text style={[styles.paramText, { color: textColor }]}>
            {combination.shootingIso}
          </Text>
        </Box>
        
        <Box style={styles.dilutionCell}>
          <Text style={[styles.paramText, { color: textColor }]} numberOfLines={1}>
            {dilutionInfo}
          </Text>
        </Box>
        
        {combination.pushPull !== 0 && (
          <Box style={styles.pushPullCell}>
            <Text style={[styles.pushPullTableText, { color: developmentTint }]}>
              {combination.pushPull > 0 ? `+${combination.pushPull}` : combination.pushPull}
            </Text>
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
  const outline = useThemeColor({}, "outline");

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
          <Box style={styles.tableContainer}>
            {/* Table Header */}
            <Box style={[styles.tableHeaderRow, { borderBottomColor: outline }]}>
              <TableHeader title="Film" sortKey="filmName" currentSort={sortBy} onSort={setSortBy} />
              <TableHeader title="Developer" sortKey="developerName" currentSort={sortBy} onSort={setSortBy} />
              <TableHeader title="Time" sortKey="timeMinutes" currentSort={sortBy} onSort={setSortBy} />
              <TableHeader title="Temp" sortKey="temperatureF" currentSort={sortBy} onSort={setSortBy} />
              <TableHeader title="ISO" sortKey="shootingIso" currentSort={sortBy} onSort={setSortBy} />
              <TableHeader title="Dilution" sortKey="dilution" currentSort={sortBy} onSort={setSortBy} />
            </Box>
            
            {/* Table Body */}
            <ScrollView style={styles.tableScrollView} showsVerticalScrollIndicator={false}>
              {filteredCombinations.map((combination, index) => (
                <RecipeRow
                  key={combination.uuid}
                  combination={combination}
                  film={getFilmById(combination.filmStockId)}
                  developer={getDeveloperById(combination.developerId)}
                  onPress={() => setSelectedCombination(combination)}
                  isEven={index % 2 === 0}
                />
              ))}
            </ScrollView>
          </Box>
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
  // Table Styles
  tableContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 8 : 4,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  tableHeaderText: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    fontWeight: '600',
    marginRight: 4,
    textAlign: 'center',
  },
  sortIcon: {
    marginLeft: 2,
  },
  tableScrollView: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    paddingHorizontal: Platform.OS === 'web' ? 8 : 4,
    minHeight: Platform.OS === 'web' ? 48 : 40,
  },
  filmCell: {
    flex: 2.5,
    paddingRight: 8,
  },
  filmText: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    fontWeight: '600',
  },
  developerCell: {
    flex: 2,
    paddingRight: 8,
  },
  developerText: {
    fontSize: Platform.OS === 'web' ? 13 : 11,
    fontWeight: '500',
  },
  timeCell: {
    flex: 1,
    paddingRight: 8,
    alignItems: 'center',
  },
  tempCell: {
    flex: 1,
    paddingRight: 8,
    alignItems: 'center',
  },
  isoCell: {
    flex: 0.8,
    paddingRight: 8,
    alignItems: 'center',
  },
  dilutionCell: {
    flex: 1.2,
    paddingRight: 8,
    alignItems: 'center',
  },
  pushPullCell: {
    flex: 0.5,
    alignItems: 'center',
  },
  paramText: {
    fontSize: Platform.OS === 'web' ? 13 : 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  pushPullTableText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
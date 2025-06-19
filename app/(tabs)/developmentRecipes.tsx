import React, { useState } from "react";
import { Platform, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal } from "react-native";
import { Box, Text, Button, ButtonText, VStack, HStack } from "@gluestack-ui/themed";
import { Search, X, Filter, RefreshCw, ChevronDown, ChevronUp, Plus } from "lucide-react-native";

import { CalculatorLayout } from "@/components/CalculatorLayout";
import { FormSection, FormGroup } from "@/components/FormSection";
import { InfoSection, InfoText, InfoSubtitle, InfoList } from "@/components/InfoSection";
import { StyledSelect } from "@/components/StyledSelect";
import { RecipeDetail } from "@/components/RecipeDetail";
import { CustomRecipeForm } from "@/components/CustomRecipeForm";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useDevelopmentRecipes } from "@/hooks/useDevelopmentRecipes";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import {
  DEVELOPER_TYPES,
  formatTime,
} from "@/constants/developmentRecipes";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";
import type { CustomRecipe } from "@/types/customRecipeTypes";

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
  sortDirection: 'asc' | 'desc';
  onSort: (sortKey: string) => void;
}

function TableHeader({ title, sortKey, currentSort, sortDirection, onSort }: TableHeaderProps) {
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
        sortDirection === 'asc' ? (
          <ChevronUp size={12} color={developmentTint} style={styles.sortIcon} />
        ) : (
          <ChevronDown size={12} color={developmentTint} style={styles.sortIcon} />
        )
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
  const { width } = useWindowDimensions();
  const isMobile = Platform.OS !== "web" || width <= 768;

  const filmName = film ? 
    (isMobile ? film.name : `${film.brand} ${film.name}`) : 
    "Unknown Film";
  const developerName = developer ? 
    (isMobile ? developer.name : `${developer.manufacturer} ${developer.name}`) : 
    "Unknown Developer";

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
    developerTypeFilter,
    dilutionFilter,
    isoFilter,
    sortBy,
    sortDirection,
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
    setDeveloperTypeFilter,
    setDilutionFilter,
    setIsoFilter,
    handleSort,
    setSelectedFilm,
    setSelectedDeveloper,
    loadData,
    clearFilters,
    getFilmById,
    getDeveloperById,
    getAvailableDilutions,
    getAvailableISOs,
  } = useDevelopmentRecipes();

  const { customRecipes, addCustomRecipe } = useCustomRecipes();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCombination, setSelectedCombination] = useState<Combination | null>(null);
  const [selectedCustomRecipe, setSelectedCustomRecipe] = useState<CustomRecipe | null>(null);
  const [showCustomRecipeForm, setShowCustomRecipeForm] = useState(false);
  const [editingCustomRecipe, setEditingCustomRecipe] = useState<CustomRecipe | undefined>(undefined);
  const [showCustomRecipes, setShowCustomRecipes] = useState(true);
  const [isSavingCustomRecipe, setIsSavingCustomRecipe] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const outline = useThemeColor({}, "outline");

  // Convert custom recipes to combination-like format for display
  const customRecipesAsCombinations = React.useMemo(() => {
    console.log('Converting custom recipes to combinations, count:', customRecipes.length);
    return customRecipes.map((recipe): Combination => ({
      id: recipe.id,
      name: recipe.name,
      uuid: recipe.id,
      slug: recipe.id,
      filmStockId: recipe.filmId,
      developerId: recipe.developerId,
      temperatureF: recipe.temperatureF,
      timeMinutes: recipe.timeMinutes,
      shootingIso: recipe.shootingIso,
      pushPull: recipe.pushPull,
      agitationSchedule: recipe.agitationSchedule,
      notes: recipe.notes,
      customDilution: recipe.customDilution,
      dateAdded: recipe.dateCreated,
      // Custom recipe specific handling
      dilutionId: undefined,
    }));
  }, [customRecipes]);

  // Combined API + custom recipes for display
  const allCombinations = React.useMemo(() => {
    console.log('Recalculating allCombinations, showCustomRecipes:', showCustomRecipes, 'customRecipes.length:', customRecipes.length);
    
    if (!showCustomRecipes) {
      return filteredCombinations;
    }
    
    // Filter custom recipes based on current filters
    let filteredCustom = customRecipesAsCombinations;
    
    // Apply film filter
    if (selectedFilm) {
      filteredCustom = filteredCustom.filter(combo => {
        const recipe = customRecipes.find(r => r.id === combo.id);
        if (!recipe) return false;
        
        if (recipe.isCustomFilm) {
          // For custom films, check if the name/brand matches the selected film
          return recipe.customFilm?.brand?.toLowerCase().includes(selectedFilm.brand.toLowerCase()) ||
                 recipe.customFilm?.name?.toLowerCase().includes(selectedFilm.name.toLowerCase());
        } else {
          return combo.filmStockId === selectedFilm.uuid;
        }
      });
    } else if (filmSearch.trim()) {
      filteredCustom = filteredCustom.filter(combo => {
        const recipe = customRecipes.find(r => r.id === combo.id);
        if (!recipe) return false;
        
        if (recipe.isCustomFilm && recipe.customFilm) {
          const filmMatch = recipe.customFilm.brand.toLowerCase().includes(filmSearch.toLowerCase()) ||
                           recipe.customFilm.name.toLowerCase().includes(filmSearch.toLowerCase());
          return filmMatch;
        } else {
          const film = getFilmById(combo.filmStockId);
          return film && (
            film.name.toLowerCase().includes(filmSearch.toLowerCase()) ||
            film.brand.toLowerCase().includes(filmSearch.toLowerCase())
          );
        }
      });
    }
    
    // Apply developer filter
    if (selectedDeveloper) {
      filteredCustom = filteredCustom.filter(combo => {
        const recipe = customRecipes.find(r => r.id === combo.id);
        if (!recipe) return false;
        
        if (recipe.isCustomDeveloper) {
          return recipe.customDeveloper?.manufacturer?.toLowerCase().includes(selectedDeveloper.manufacturer.toLowerCase()) ||
                 recipe.customDeveloper?.name?.toLowerCase().includes(selectedDeveloper.name.toLowerCase());
        } else {
          return combo.developerId === selectedDeveloper.uuid;
        }
      });
    } else if (developerSearch.trim()) {
      filteredCustom = filteredCustom.filter(combo => {
        const recipe = customRecipes.find(r => r.id === combo.id);
        if (!recipe) return false;
        
        if (recipe.isCustomDeveloper && recipe.customDeveloper) {
          const devMatch = recipe.customDeveloper.manufacturer.toLowerCase().includes(developerSearch.toLowerCase()) ||
                          recipe.customDeveloper.name.toLowerCase().includes(developerSearch.toLowerCase());
          return devMatch;
        } else {
          const dev = getDeveloperById(combo.developerId);
          return dev && (
            dev.name.toLowerCase().includes(developerSearch.toLowerCase()) ||
            dev.manufacturer.toLowerCase().includes(developerSearch.toLowerCase())
          );
        }
      });
    }
    
    // Sort custom recipes by creation date (newest first) to show recently added ones at the top
    const sortedCustomRecipes = filteredCustom.sort((a, b) => {
      const recipeA = customRecipes.find(r => r.id === a.id);
      const recipeB = customRecipes.find(r => r.id === b.id);
      if (!recipeA || !recipeB) return 0;
      return new Date(recipeB.dateCreated).getTime() - new Date(recipeA.dateCreated).getTime();
    });
    
    // Combine custom recipes (newest first) with API recipes
    return [...sortedCustomRecipes, ...filteredCombinations];
  }, [filteredCombinations, customRecipesAsCombinations, customRecipes, showCustomRecipes, selectedFilm, selectedDeveloper, filmSearch, developerSearch, getFilmById, getDeveloperById, forceRefresh]);

  // Custom recipe helpers
  const getCustomRecipeFilm = (recipeId: string): Film | undefined => {
    const recipe = customRecipes.find(r => r.id === recipeId);
    if (!recipe) return undefined;
    
    if (recipe.isCustomFilm && recipe.customFilm) {
      // Convert custom film data to Film interface
      return {
        uuid: `custom_film_${recipe.id}`,
        id: `custom_film_${recipe.id}`,
        slug: `custom_film_${recipe.id}`,
        brand: recipe.customFilm.brand,
        name: recipe.customFilm.name,
        isoSpeed: recipe.customFilm.isoSpeed,
        colorType: recipe.customFilm.colorType,
        grainStructure: recipe.customFilm.grainStructure,
        description: recipe.customFilm.description,
        discontinued: 0, // Fix: discontinued should be a number according to Film type
        manufacturerNotes: [],
        staticImageURL: undefined,
        dateAdded: recipe.dateCreated,
      } as Film;
    } else {
      return getFilmById(recipe.filmId);
    }
  };

  const getCustomRecipeDeveloper = (recipeId: string): Developer | undefined => {
    const recipe = customRecipes.find(r => r.id === recipeId);
    if (!recipe) return undefined;
    
    if (recipe.isCustomDeveloper && recipe.customDeveloper) {
      // Convert custom developer data to Developer interface
      return {
        uuid: `custom_dev_${recipe.id}`,
        id: `custom_dev_${recipe.id}`,
        slug: `custom_dev_${recipe.id}`,
        name: recipe.customDeveloper.name,
        manufacturer: recipe.customDeveloper.manufacturer,
        type: recipe.customDeveloper.type,
        filmOrPaper: recipe.customDeveloper.filmOrPaper,
        workingLifeHours: recipe.customDeveloper.workingLifeHours,
        stockLifeMonths: recipe.customDeveloper.stockLifeMonths,
        notes: recipe.customDeveloper.notes,
        mixingInstructions: recipe.customDeveloper.mixingInstructions,
        safetyNotes: recipe.customDeveloper.safetyNotes,
        discontinued: 0, // Fix: discontinued should be a number according to Developer type
        datasheetUrl: [],
        dilutions: recipe.customDeveloper.dilutions.map((d, idx) => ({
          id: idx,
          name: d.name,
          dilution: d.dilution,
        })),
        dateAdded: recipe.dateCreated,
      } as Developer;
    } else {
      return getDeveloperById(recipe.developerId);
    }
  };

  const handleCustomRecipePress = (recipe: CustomRecipe) => {
    setSelectedCustomRecipe(recipe);
    setSelectedCombination(null); // Clear API recipe selection
  };

  const handleEditCustomRecipe = (recipe: CustomRecipe) => {
    setEditingCustomRecipe(recipe);
    setShowCustomRecipeForm(true);
  };

  const handleNewCustomRecipe = () => {
    setEditingCustomRecipe(undefined);
    setShowCustomRecipeForm(true);
  };

  const handleCustomRecipeFormClose = () => {
    setShowCustomRecipeForm(false);
    setEditingCustomRecipe(undefined);
  };

  const handleCustomRecipeSave = async (recipeId: string) => {
    // Recipe has already been saved by the form at this point
    // Just wait a moment for state to propagate and then close
    setIsSavingCustomRecipe(true);
    
    const initialCount = customRecipes.length;
    console.log('Starting save, initial custom recipes count:', initialCount);
    
    // Wait for the customRecipes state to actually update
    let attempts = 0;
    const maxAttempts = 20; // 2 seconds max
    
    while (customRecipes.length <= initialCount && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
      console.log('Waiting for state update, attempt:', attempts, 'count:', customRecipes.length);
    }
    
    if (customRecipes.length > initialCount) {
      console.log('State updated successfully, new count:', customRecipes.length);
    } else {
      console.log('State did not update within timeout, forcing refresh');
    }
    
    // Force a refresh of the recipe list
    setForceRefresh(prev => prev + 1);
    
    setShowCustomRecipeForm(false);
    setEditingCustomRecipe(undefined);
    setIsSavingCustomRecipe(false);
  };

  // Handle duplicating a recipe (either API or custom)
  const handleDuplicateRecipe = (combination: Combination, isCustom: boolean = false) => {
    const customRecipe = isCustom ? customRecipes.find(r => r.id === combination.id) : undefined;
    const film = isCustom && customRecipe ? getCustomRecipeFilm(customRecipe.id) : getFilmById(combination.filmStockId);
    const developer = isCustom && customRecipe ? getCustomRecipeDeveloper(customRecipe.id) : getDeveloperById(combination.developerId);

    // Create a new custom recipe based on the existing one
    const duplicateRecipe: CustomRecipe = {
      id: `duplicate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `Copy of ${combination.name || (film ? `${film.brand} ${film.name}` : 'Unknown')}`,
      filmId: isCustom && customRecipe?.isCustomFilm ? customRecipe.filmId : combination.filmStockId,
      developerId: isCustom && customRecipe?.isCustomDeveloper ? customRecipe.developerId : combination.developerId,
      temperatureF: combination.temperatureF,
      timeMinutes: combination.timeMinutes,
      shootingIso: combination.shootingIso,
      pushPull: combination.pushPull,
      agitationSchedule: combination.agitationSchedule,
      notes: combination.notes,
      customDilution: combination.customDilution || undefined,
      isCustomFilm: isCustom && customRecipe ? customRecipe.isCustomFilm : false,
      isCustomDeveloper: isCustom && customRecipe ? customRecipe.isCustomDeveloper : false,
      customFilm: isCustom && customRecipe ? customRecipe.customFilm : undefined,
      customDeveloper: isCustom && customRecipe ? customRecipe.customDeveloper : undefined,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      isPublic: false,
    };

    // Set up editing the duplicated recipe
    setEditingCustomRecipe(duplicateRecipe);
    setShowCustomRecipeForm(true);
    
    // Close any open recipe details
    setSelectedCombination(null);
    setSelectedCustomRecipe(null);
  };

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
      <Box style={styles.mainContainer}>
        {/* Search, Filters, and Results */}
        <Box style={styles.leftPanel}>
          {/* Search and Filter Section */}
          <FormSection>
        <VStack space="md">
          {/* Search Fields */}
          <Box>
            <Text style={[styles.sectionLabel, { color: textColor }]}>Search</Text>
            
            <Box style={[styles.searchFieldsContainer, isDesktop && styles.searchFieldsDesktop]}>
              <Box style={[styles.searchField, isDesktop && styles.searchFieldDesktop]}>
                <SearchInput
                  value={filmSearch}
                  onChangeText={setFilmSearch}
                  placeholder="Type to search films..."
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

              <Box style={[styles.searchField, isDesktop && styles.searchFieldDesktop]}>
                <SearchInput
                  value={developerSearch}
                  onChangeText={setDeveloperSearch}
                  placeholder="Type to search developers..."
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
            </Box>
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
              {/* Developer Type Filter - only show when no specific developer is selected */}
              {!selectedDeveloper && (
                <FormGroup label="Developer Type">
                  <StyledSelect
                    value={developerTypeFilter}
                    onValueChange={setDeveloperTypeFilter}
                    items={DEVELOPER_TYPES}
                  />
                </FormGroup>
              )}

              {/* Dilution Filter - only show when developer is selected */}
              {selectedDeveloper && (
                <FormGroup label="Dilution">
                  <StyledSelect
                    value={dilutionFilter}
                    onValueChange={setDilutionFilter}
                    items={getAvailableDilutions()}
                  />
                </FormGroup>
              )}

              {/* ISO Filter - only show when film is selected */}
              {selectedFilm && (
                <FormGroup label="Shooting ISO">
                  <StyledSelect
                    value={isoFilter}
                    onValueChange={setIsoFilter}
                    items={getAvailableISOs()}
                  />
                </FormGroup>
              )}
            </VStack>
          )}
        </VStack>
      </FormSection>

      {/* Results Section */}
      <Box style={styles.resultsSection}>
        <HStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={[styles.resultsHeader, { color: textColor }]}>
            {allCombinations.length} Development Recipe{allCombinations.length !== 1 ? 's' : ''} 
            {customRecipes.length > 0 && showCustomRecipes && (
              <Text style={{ fontSize: 14, fontWeight: 'normal', color: textColor, opacity: 0.7 }}>
                {' '}({customRecipes.length} custom)
              </Text>
            )}
          </Text>
          
          <HStack style={{ gap: 8, alignItems: 'center' }}>
            {customRecipes.length > 0 && (
              <TouchableOpacity 
                onPress={() => setShowCustomRecipes(!showCustomRecipes)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: showCustomRecipes ? developmentTint : 'transparent',
                  borderWidth: 1,
                  borderColor: developmentTint,
                }}
              >
                <Text style={{
                  fontSize: 12,
                  color: showCustomRecipes ? '#fff' : developmentTint,
                  fontWeight: '500'
                }}>
                  My Recipes
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              onPress={handleNewCustomRecipe}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 8,
                borderRadius: 6,
                backgroundColor: developmentTint,
                gap: 4,
              }}
            >
              <Plus size={14} color="#fff" />
              <Text style={{ fontSize: 12, color: '#fff', fontWeight: '500' }}>
                Add Recipe
              </Text>
            </TouchableOpacity>
          </HStack>
        </HStack>

        {allCombinations.length === 0 ? (
          <Box style={styles.noResultsContainer}>
            <Text style={[styles.noResultsText, { color: textColor }]}>
              No development recipes found.
            </Text>
            <Text style={[styles.noResultsSubtext, { color: textColor }]}>
              Try adjusting your search terms or filters, or create your own recipe.
            </Text>
          </Box>
        ) : (
          <Box style={styles.tableContainer}>
            {/* Table Header */}
            <Box style={[styles.tableHeaderRow, { borderBottomColor: outline }]}>
              <TableHeader title="Film" sortKey="filmName" currentSort={sortBy} sortDirection={sortDirection} onSort={handleSort} />
              <TableHeader title="Developer" sortKey="developerName" currentSort={sortBy} sortDirection={sortDirection} onSort={handleSort} />
              <TableHeader title="Time" sortKey="timeMinutes" currentSort={sortBy} sortDirection={sortDirection} onSort={handleSort} />
              <TableHeader title="Temp" sortKey="temperatureF" currentSort={sortBy} sortDirection={sortDirection} onSort={handleSort} />
              <TableHeader title="ISO" sortKey="shootingIso" currentSort={sortBy} sortDirection={sortDirection} onSort={handleSort} />
              <TableHeader title="Dilution" sortKey="dilution" currentSort={sortBy} sortDirection={sortDirection} onSort={handleSort} />
            </Box>
            
            {/* Table Body */}
            <ScrollView style={styles.tableScrollView} showsVerticalScrollIndicator={false}>
              {allCombinations.map((combination, index) => {
                const isCustomRecipe = customRecipes.some(r => r.id === combination.id);
                const customRecipe = isCustomRecipe ? customRecipes.find(r => r.id === combination.id) : undefined;
                
                const film = isCustomRecipe && customRecipe 
                  ? getCustomRecipeFilm(customRecipe.id)
                  : getFilmById(combination.filmStockId);
                  
                const developer = isCustomRecipe && customRecipe
                  ? getCustomRecipeDeveloper(customRecipe.id) 
                  : getDeveloperById(combination.developerId);

                return (
                  <RecipeRow
                    key={combination.uuid}
                    combination={combination}
                    film={film}
                    developer={developer}
                    onPress={() => {
                      if (isCustomRecipe && customRecipe) {
                        handleCustomRecipePress(customRecipe);
                      } else {
                        setSelectedCombination(combination);
                        setSelectedCustomRecipe(null);
                      }
                    }}
                    isEven={index % 2 === 0}
                  />
                );
              })}
            </ScrollView>
          </Box>
        )}
        </Box>
      </Box>

      {/* API Recipe Detail Modal - Mobile */}
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
              onDuplicate={() => handleDuplicateRecipe(selectedCombination, false)}
              isCustomRecipe={false}
            />
          )}
        </Modal>
      )}

      {/* API Recipe Detail Modal - Desktop */}
      {isDesktop && selectedCombination && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedCombination(null)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedCombination(null)}
          >
            <TouchableOpacity 
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <RecipeDetail
                combination={selectedCombination}
                film={getFilmById(selectedCombination.filmStockId)}
                developer={getDeveloperById(selectedCombination.developerId)}
                onClose={() => setSelectedCombination(null)}
                onDuplicate={() => handleDuplicateRecipe(selectedCombination, false)}
                isCustomRecipe={false}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Custom Recipe Detail Modal - Mobile */}
      {!isDesktop && (
        <Modal
          visible={selectedCustomRecipe !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedCustomRecipe(null)}
        >
          {selectedCustomRecipe && (
            <RecipeDetail
              combination={{
                id: selectedCustomRecipe.id,
                name: selectedCustomRecipe.name,
                uuid: selectedCustomRecipe.id,
                slug: selectedCustomRecipe.id,
                filmStockId: selectedCustomRecipe.filmId,
                developerId: selectedCustomRecipe.developerId,
                temperatureF: selectedCustomRecipe.temperatureF,
                timeMinutes: selectedCustomRecipe.timeMinutes,
                shootingIso: selectedCustomRecipe.shootingIso,
                pushPull: selectedCustomRecipe.pushPull,
                agitationSchedule: selectedCustomRecipe.agitationSchedule,
                notes: selectedCustomRecipe.notes,
                customDilution: selectedCustomRecipe.customDilution,
                dateAdded: selectedCustomRecipe.dateCreated,
              }}
              film={getCustomRecipeFilm(selectedCustomRecipe.id)}
              developer={getCustomRecipeDeveloper(selectedCustomRecipe.id)}
              onClose={() => setSelectedCustomRecipe(null)}
              onEdit={() => handleEditCustomRecipe(selectedCustomRecipe)}
              onDuplicate={() => handleDuplicateRecipe({
                id: selectedCustomRecipe.id,
                name: selectedCustomRecipe.name,
                uuid: selectedCustomRecipe.id,
                slug: selectedCustomRecipe.id,
                filmStockId: selectedCustomRecipe.filmId,
                developerId: selectedCustomRecipe.developerId,
                temperatureF: selectedCustomRecipe.temperatureF,
                timeMinutes: selectedCustomRecipe.timeMinutes,
                shootingIso: selectedCustomRecipe.shootingIso,
                pushPull: selectedCustomRecipe.pushPull,
                agitationSchedule: selectedCustomRecipe.agitationSchedule,
                notes: selectedCustomRecipe.notes,
                customDilution: selectedCustomRecipe.customDilution,
                dateAdded: selectedCustomRecipe.dateCreated,
              }, true)}
              isCustomRecipe={true}
            />
          )}
        </Modal>
      )}

      {/* Custom Recipe Detail Modal - Desktop */}
      {isDesktop && selectedCustomRecipe && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedCustomRecipe(null)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedCustomRecipe(null)}
          >
            <TouchableOpacity 
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <RecipeDetail
                combination={{
                  id: selectedCustomRecipe.id,
                  name: selectedCustomRecipe.name,
                  uuid: selectedCustomRecipe.id,
                  slug: selectedCustomRecipe.id,
                  filmStockId: selectedCustomRecipe.filmId,
                  developerId: selectedCustomRecipe.developerId,
                  temperatureF: selectedCustomRecipe.temperatureF,
                  timeMinutes: selectedCustomRecipe.timeMinutes,
                  shootingIso: selectedCustomRecipe.shootingIso,
                  pushPull: selectedCustomRecipe.pushPull,
                  agitationSchedule: selectedCustomRecipe.agitationSchedule,
                  notes: selectedCustomRecipe.notes,
                  customDilution: selectedCustomRecipe.customDilution,
                  dateAdded: selectedCustomRecipe.dateCreated,
                }}
                film={getCustomRecipeFilm(selectedCustomRecipe.id)}
                developer={getCustomRecipeDeveloper(selectedCustomRecipe.id)}
                onClose={() => setSelectedCustomRecipe(null)}
                onEdit={() => handleEditCustomRecipe(selectedCustomRecipe)}
                onDuplicate={() => handleDuplicateRecipe({
                  id: selectedCustomRecipe.id,
                  name: selectedCustomRecipe.name,
                  uuid: selectedCustomRecipe.id,
                  slug: selectedCustomRecipe.id,
                  filmStockId: selectedCustomRecipe.filmId,
                  developerId: selectedCustomRecipe.developerId,
                  temperatureF: selectedCustomRecipe.temperatureF,
                  timeMinutes: selectedCustomRecipe.timeMinutes,
                  shootingIso: selectedCustomRecipe.shootingIso,
                  pushPull: selectedCustomRecipe.pushPull,
                  agitationSchedule: selectedCustomRecipe.agitationSchedule,
                  notes: selectedCustomRecipe.notes,
                  customDilution: selectedCustomRecipe.customDilution,
                  dateAdded: selectedCustomRecipe.dateCreated,
                }, true)}
                isCustomRecipe={true}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Custom Recipe Form Modal - Mobile */}
      {!isDesktop && (
        <Modal
          visible={showCustomRecipeForm}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCustomRecipeFormClose}
        >
          <CustomRecipeForm
            recipe={editingCustomRecipe}
            onClose={handleCustomRecipeFormClose}
            onSave={handleCustomRecipeSave}
          />
        </Modal>
      )}

      {/* Custom Recipe Form Modal - Desktop */}
      {isDesktop && showCustomRecipeForm && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCustomRecipeFormClose}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleCustomRecipeFormClose}
          >
            <TouchableOpacity 
              style={styles.modalContentLarge}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <CustomRecipeForm
                recipe={editingCustomRecipe}
                onClose={handleCustomRecipeFormClose}
                onSave={handleCustomRecipeSave}
              />
            </TouchableOpacity>
          </TouchableOpacity>
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
  leftPanel: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  
  // Search Fields Layout Styles
  searchFieldsContainer: {
    gap: 16,
  },
  searchFieldsDesktop: {
    flexDirection: 'row',
    gap: 16,
  },
  searchField: {
    flex: 1,
  },
  searchFieldDesktop: {
    flex: 1,
    minWidth: 0, // Allows flex items to shrink below content size
  },
  
  // Search Input Styles
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
  
  // Desktop Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    maxWidth: 580,
    maxHeight: '85%',
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  modalContentLarge: {
    backgroundColor: 'white',
    borderRadius: 20,
    maxWidth: 720,
    maxHeight: '90%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
});
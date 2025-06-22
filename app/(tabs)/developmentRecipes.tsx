import React, { useState } from "react";
import { Platform, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Box, Text, Button, ButtonText, VStack, HStack, Modal, ModalBackdrop, ModalContent, ModalCloseButton, ModalHeader, ModalBody, FlatList } from "@gluestack-ui/themed";
import { Search, X, Filter, RefreshCw, ChevronDown, ChevronUp, Plus, Grid3X3, Table } from "lucide-react-native";

import { CalculatorLayout } from "@/components/CalculatorLayout";
import { FormSection, FormGroup } from "@/components/FormSection";
import { InfoSection, InfoText, InfoSubtitle, InfoList } from "@/components/InfoSection";
import { StyledSelect } from "@/components/StyledSelect";
import { ThemedSelect } from "@/components/ThemedSelect";
import { RecipeDetail } from "@/components/RecipeDetail";
import { CustomRecipeForm } from "@/components/CustomRecipeForm";
import { 
  getRecipeDetailModalConfig, 
  getCustomRecipeDetailModalConfig, 
  getRecipeFormModalConfig 
} from "@/components/ui/ModalStyles";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useDevelopmentRecipes } from "@/hooks/useDevelopmentRecipes";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import {
  DEVELOPER_TYPES,
  formatTime,
} from "@/constants/developmentRecipes";
import { formatDilution } from "@/utils/dilutionUtils";
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

interface MobileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'film' | 'developer';
  films: Film[];
  developers: Developer[];
  onFilmSelect: (film: Film) => void;
  onDeveloperSelect: (developer: Developer) => void;
}

function MobileSelectionModal({ 
  isOpen, 
  onClose, 
  type, 
  films, 
  developers, 
  onFilmSelect, 
  onDeveloperSelect 
}: MobileSelectionModalProps) {
  const [searchText, setSearchText] = useState("");
  const textColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "cardBackground");
  const borderColor = useThemeColor({}, "borderColor");

  const filteredItems = React.useMemo(() => {
    const items = type === 'film' ? films : developers;
    if (!searchText.trim()) return items;
    
    return items.filter(item => {
      if (type === 'film') {
        const film = item as Film;
        return film.name.toLowerCase().includes(searchText.toLowerCase()) ||
               film.brand.toLowerCase().includes(searchText.toLowerCase());
      } else {
        const dev = item as Developer;
        return dev.name.toLowerCase().includes(searchText.toLowerCase()) ||
               dev.manufacturer.toLowerCase().includes(searchText.toLowerCase());
      }
    });
  }, [type, films, developers, searchText]);

  const handleSelect = (item: Film | Developer) => {
    if (type === 'film') {
      onFilmSelect(item as Film);
    } else {
      onDeveloperSelect(item as Developer);
    }
    setSearchText("");
    onClose();
  };

  const renderItem = ({ item }: { item: Film | Developer }) => (
    <TouchableOpacity
      style={[styles.selectionItem, { borderBottomColor: borderColor }]}
      onPress={() => handleSelect(item)}
    >
      <VStack space="xs">
        <Text style={[styles.selectionItemTitle, { color: textColor }]}>
          {type === 'film' ? (item as Film).name : (item as Developer).name}
        </Text>
        <Text style={[styles.selectionItemSubtitle, { color: textColor, opacity: 0.7 }]}>
          {type === 'film' ? (item as Film).brand : (item as Developer).manufacturer}
        </Text>
      </VStack>
    </TouchableOpacity>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalBackdrop />
      <ModalContent style={{ backgroundColor: cardBackground, margin: 0, maxHeight: '100%', flex: 1 }}>
        {/* Header */}
        <Box style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            Select {type === 'film' ? 'Film' : 'Developer'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <X size={24} color={textColor} />
          </TouchableOpacity>
        </Box>
        
        {/* Search Box */}
        <Box style={[styles.modalSearchContainer, { borderBottomColor: borderColor }]}>
          <Search size={20} color={textColor} style={styles.modalSearchIcon} />
          <TextInput
            style={[styles.modalSearchInput, { color: textColor, borderColor }]}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={`Search ${type === 'film' ? 'films' : 'developers'}...`}
            placeholderTextColor={textColor + '80'}
            autoFocus
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")} style={styles.modalClearButton}>
              <X size={20} color={textColor} />
            </TouchableOpacity>
          )}
        </Box>

        {/* Results List */}
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.uuid}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <Box style={{ height: 1, backgroundColor: borderColor, opacity: 0.3 }} />}
        />
      </ModalContent>
    </Modal>
  );
}

interface MobileSelectButtonProps {
  label: string;
  selectedItem: Film | Developer | null;
  onPress: () => void;
  type: 'film' | 'developer';
}

function MobileSelectButton({ label, selectedItem, onPress, type }: MobileSelectButtonProps) {
  const textColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "cardBackground");
  const borderColor = useThemeColor({}, "borderColor");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");

  const getDisplayText = () => {
    if (!selectedItem) return `Select ${label}`;
    
    if (type === 'film') {
      const film = selectedItem as Film;
      return `${film.brand} ${film.name}`;
    } else {
      const dev = selectedItem as Developer;
      return `${dev.manufacturer} ${dev.name}`;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.mobileSelectButton,
        {
          backgroundColor: cardBackground,
          borderColor: selectedItem ? developmentTint : borderColor,
          borderWidth: selectedItem ? 2 : 1,
        }
      ]}
      onPress={onPress}
    >
      <VStack space="xs" style={{ flex: 1 }}>
        <Text style={[styles.mobileSelectLabel, { color: textColor, opacity: 0.7 }]}>
          {label}
        </Text>
        <Text 
          style={[
            styles.mobileSelectText, 
            { color: selectedItem ? developmentTint : textColor }
          ]} 
          numberOfLines={1}
        >
          {getDisplayText()}
        </Text>
      </VStack>
      <ChevronDown size={20} color={selectedItem ? developmentTint : textColor} />
    </TouchableOpacity>
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

  // Format temperature more compactly
  const tempDisplay = `${combination.temperatureF}°F`;
  
  // Debug logging for temperature display
  console.log('[RecipeRow] Rendering row for combination:', JSON.stringify({ 
    id: combination.id, 
    temperatureF: combination.temperatureF, 
    tempDisplay,
    uuid: combination.uuid 
  }));

  return (
    <TouchableOpacity onPress={onPress}>
      <Box style={[styles.tableRow, { backgroundColor: rowBackground }]}>
        <Box style={styles.filmCell}>
          <Text style={[styles.filmText, { color: textColor }]} numberOfLines={1}>
            {filmName}
            {pushPullDisplay && (
              <Text style={{ color: developmentTint }}>
                {pushPullDisplay}
              </Text>
            )}
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
      </Box>
    </TouchableOpacity>
  );
}

interface RecipeCardProps {
  combination: Combination;
  film: Film | undefined;
  developer: Developer | undefined;
  onPress: () => void;
  isCustomRecipe: boolean;
}

function RecipeCard({ combination, film, developer, onPress, isCustomRecipe }: RecipeCardProps) {
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
        
        {/* Developer */}
        <Text style={[styles.cardDeveloper, { color: textColor }]} numberOfLines={1}>
          <Text style={{ fontStyle: 'italic' }}>Developer: </Text>
          {developerName}
        </Text>
        
        {/* Divider */}
        <Box style={[styles.cardDivider, { borderBottomColor: borderColor }]} />
        
        {/* Parameters */}
        <Box style={styles.cardParams}>
          <Box style={[styles.paramBox, { backgroundColor: resultRowBackground }]}>
            <Text style={[styles.cardParam, { color: textColor }]}>
              Time: {formatTime(combination.timeMinutes)}
            </Text>
          </Box>
          <Box style={[styles.paramBox, { backgroundColor: resultRowBackground }]}>
            <Text style={[
              styles.cardParam, 
              { color: isNonStandardTemp ? developmentTint : textColor }
            ]}>
              Temperature: {tempDisplay}{isNonStandardTemp && ' ⚠'}
            </Text>
          </Box>
          <Box style={[styles.paramBox, { backgroundColor: resultRowBackground }]}>
            <Text style={[styles.cardParam, { color: textColor }]}>
              Dilution: {dilutionInfo}
            </Text>
          </Box>
        </Box>
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

  const { customRecipes, forceRefresh, stateVersion } = useCustomRecipes();
  console.log('[DevelopmentRecipes] Component render - customRecipes count:', customRecipes.length);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCombination, setSelectedCombination] = useState<Combination | null>(null);
  const [selectedCustomRecipe, setSelectedCustomRecipe] = useState<CustomRecipe | null>(null);
  const [showCustomRecipeForm, setShowCustomRecipeForm] = useState(false);
  const [editingCustomRecipe, setEditingCustomRecipe] = useState<CustomRecipe | undefined>(undefined);
  const [showCustomRecipes, setShowCustomRecipes] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [temperatureFilter, setTemperatureFilter] = useState("68");
  const [showMobileFilmModal, setShowMobileFilmModal] = useState(false);
  const [showMobileDeveloperModal, setShowMobileDeveloperModal] = useState(false);
  
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const outline = useThemeColor({}, "outline");

  // Convert custom recipes to combination-like format for display
  const customRecipesAsCombinations = React.useMemo(() => {
    console.log('[DevelopmentRecipes] customRecipesAsCombinations useMemo triggered');
    console.log('[DevelopmentRecipes] Converting custom recipes to combinations, count:', customRecipes.length);
    console.log('[DevelopmentRecipes] customRecipes reference check:', customRecipes);
    console.log('[DevelopmentRecipes] customRecipes dateModified values:', customRecipes.map(r => ({ id: r.id, dateModified: r.dateModified })));
    
    const combinations = customRecipes.map((recipe): Combination => {
      console.log('[DevelopmentRecipes] Converting recipe to combination:', JSON.stringify({ 
        id: recipe.id, 
        temperatureF: recipe.temperatureF, 
        dateModified: recipe.dateModified 
      }));
      return {
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
      };
    });
    console.log('[DevelopmentRecipes] Converted to combinations:', combinations.length);
    console.log('[DevelopmentRecipes] Combination temperature values:', combinations.map(c => ({ id: c.id, temperatureF: c.temperatureF })));
    return combinations;
  }, [customRecipes, stateVersion]); // stateVersion is intentionally included to force re-computation

  // Combined API + custom recipes for display
  const allCombinations = React.useMemo(() => {
    console.log('[DevelopmentRecipes] allCombinations useMemo triggered');
    console.log('[DevelopmentRecipes] Recalculating allCombinations, showCustomRecipes:', showCustomRecipes, 'customRecipes.length:', customRecipes.length);
    console.log('[DevelopmentRecipes] filteredCombinations.length:', filteredCombinations.length);
    console.log('[DevelopmentRecipes] customRecipesAsCombinations.length:', customRecipesAsCombinations.length);
    console.log('[DevelopmentRecipes] stateVersion:', stateVersion);
    
    if (!showCustomRecipes) {
      console.log('[DevelopmentRecipes] Not showing custom recipes, returning only API recipes');
      return filteredCombinations;
    }
    
    // Filter custom recipes based on current filters
    let filteredCustomCombinations = customRecipesAsCombinations.filter(combination => {
      const recipe = customRecipes.find(r => r.id === combination.id);
      if (!recipe) return false;
      
      // Apply film filter
      if (selectedFilm) {
        if (recipe.isCustomFilm) {
          // For custom films, check if the name/brand matches the selected film
          return recipe.customFilm?.brand?.toLowerCase().includes(selectedFilm.brand.toLowerCase()) ||
                 recipe.customFilm?.name?.toLowerCase().includes(selectedFilm.name.toLowerCase());
        } else {
          return combination.filmStockId === selectedFilm.uuid;
        }
      } else if (filmSearch.trim()) {
        if (recipe.isCustomFilm && recipe.customFilm) {
          const filmMatch = recipe.customFilm.brand.toLowerCase().includes(filmSearch.toLowerCase()) ||
                           recipe.customFilm.name.toLowerCase().includes(filmSearch.toLowerCase());
          return filmMatch;
        } else {
          const film = getFilmById(combination.filmStockId);
          return film && (
            film.name.toLowerCase().includes(filmSearch.toLowerCase()) ||
            film.brand.toLowerCase().includes(filmSearch.toLowerCase())
          );
        }
      }
      
      // Apply developer filter
      if (selectedDeveloper) {
        if (recipe.isCustomDeveloper) {
          return recipe.customDeveloper?.manufacturer?.toLowerCase().includes(selectedDeveloper.manufacturer.toLowerCase()) ||
                 recipe.customDeveloper?.name?.toLowerCase().includes(selectedDeveloper.name.toLowerCase());
        } else {
          return combination.developerId === selectedDeveloper.uuid;
        }
      } else if (developerSearch.trim()) {
        if (recipe.isCustomDeveloper && recipe.customDeveloper) {
          const devMatch = recipe.customDeveloper.manufacturer.toLowerCase().includes(developerSearch.toLowerCase()) ||
                          recipe.customDeveloper.name.toLowerCase().includes(developerSearch.toLowerCase());
          return devMatch;
        } else {
          const dev = getDeveloperById(combination.developerId);
          return dev && (
            dev.name.toLowerCase().includes(developerSearch.toLowerCase()) ||
            dev.manufacturer.toLowerCase().includes(developerSearch.toLowerCase())
          );
        }
      }
      
      // If no specific filters applied, include all custom recipes
      return true;
    });
    
    console.log('[DevelopmentRecipes] Filtered custom combinations:', filteredCustomCombinations.length);
    
    // Sort custom recipes by creation date (newest first) to show recently added ones at the top
    filteredCustomCombinations.sort((a, b) => {
      const recipeA = customRecipes.find(r => r.id === a.id);
      const recipeB = customRecipes.find(r => r.id === b.id);
      if (!recipeA || !recipeB) return 0;
      return new Date(recipeB.dateCreated).getTime() - new Date(recipeA.dateCreated).getTime();
    });
    
    // Combine custom recipes (newest first) with API recipes
    const combined = [...filteredCustomCombinations, ...filteredCombinations];
    console.log('[DevelopmentRecipes] Final combined count:', combined.length, '(custom:', filteredCustomCombinations.length, 'api:', filteredCombinations.length, ')');
    return combined;
  }, [filteredCombinations, customRecipesAsCombinations, showCustomRecipes, selectedFilm, selectedDeveloper, filmSearch, developerSearch, getFilmById, getDeveloperById, customRecipes, stateVersion]);

  // Apply temperature filtering to all combinations
  const temperatureFilteredCombinations = React.useMemo(() => {
    if (temperatureFilter === "all") return allCombinations;
    
    return allCombinations.filter(combination => {
      if (temperatureFilter === "other") {
        return ![68, 70, 72, 75].includes(combination.temperatureF);
      }
      return combination.temperatureF === parseInt(temperatureFilter);
    });
  }, [allCombinations, temperatureFilter]);

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

  // Get current version of selected custom recipe (to handle updates)
  const currentSelectedCustomRecipe = React.useMemo(() => {
    if (!selectedCustomRecipe) return null;
    // Find the current version from the customRecipes array
    const currentVersion = customRecipes.find(r => r.id === selectedCustomRecipe.id);
    return currentVersion || selectedCustomRecipe; // Fallback to original if not found
  }, [selectedCustomRecipe, customRecipes, stateVersion]); // stateVersion ensures fresh data

  // Dynamic sort options based on current filters
  const availableSortOptions = React.useMemo(() => {
    const options = [
      { label: "Film Name", value: "filmName" },
      { label: "Development Time", value: "timeMinutes" },
      { label: "Temperature", value: "temperatureF" },
    ];

    // If no specific developer selected, allow sorting by developer
    if (!selectedDeveloper) {
      options.push({ label: "Developer", value: "developerName" });
    }

    // If specific developer selected, allow sorting by dilution
    if (selectedDeveloper) {
      options.push({ label: "Dilution", value: "dilution" });
    }

    // If specific film selected, allow sorting by ISO
    if (selectedFilm) {
      options.push({ label: "ISO", value: "shootingIso" });
    }

    return options;
  }, [selectedFilm, selectedDeveloper]);

  // Temperature filter options
  const temperatureOptions = React.useMemo(() => [
    { label: "All Temperatures", value: "all" },
    { label: "68°F (Standard)", value: "68" },
    { label: "70°F", value: "70" },
    { label: "72°F", value: "72" },
    { label: "75°F", value: "75" },
    { label: "Other", value: "other" },
  ], []);

  const handleCustomRecipePress = (recipe: CustomRecipe) => {
    console.log('[DevelopmentRecipes] handleCustomRecipePress called for recipe:', recipe.id);
    setSelectedCustomRecipe(recipe);
    setSelectedCombination(null); // Clear API recipe selection
  };

  const handleEditCustomRecipe = (recipe: CustomRecipe) => {
    console.log('[DevelopmentRecipes] ===== handleEditCustomRecipe called =====');
    console.log('[DevelopmentRecipes] Recipe to edit:', recipe.id, recipe.name);
    console.log('[DevelopmentRecipes] Full recipe object:', JSON.stringify(recipe, null, 2));
    console.log('[DevelopmentRecipes] Setting editingCustomRecipe and showing form...');
    setEditingCustomRecipe(recipe);
    setShowCustomRecipeForm(true);
    console.log('[DevelopmentRecipes] State updated - editingCustomRecipe set and form shown');
  };

  const handleNewCustomRecipe = () => {
    console.log('[DevelopmentRecipes] handleNewCustomRecipe called');
    setEditingCustomRecipe(undefined);
    setShowCustomRecipeForm(true);
  };

  const handleCustomRecipeFormClose = () => {
    console.log('[DevelopmentRecipes] handleCustomRecipeFormClose called');
    
    // Force refresh to ensure any recipe deletions are reflected in the UI
    forceRefresh();
    
    // Clear any selected custom recipe if it might have been deleted
    setSelectedCustomRecipe(null);
    
    setShowCustomRecipeForm(false);
    setEditingCustomRecipe(undefined);
  };

  const handleCustomRecipeDelete = () => {
    console.log('[DevelopmentRecipes] handleCustomRecipeDelete called');
    
    // Force refresh to ensure the deletion is reflected in the UI
    forceRefresh();
    
    // Clear the selected custom recipe since it was deleted
    setSelectedCustomRecipe(null);
  };

  const handleCustomRecipeSave = async (recipeId: string) => {
    console.log('[DevelopmentRecipes] handleCustomRecipeSave called for recipe:', recipeId);
    console.log('[DevelopmentRecipes] Current customRecipes count before refresh:', customRecipes.length);
    
    // Force immediate refresh to ensure updated data is displayed
    // This is critical for both saves AND deletes
    console.log('[DevelopmentRecipes] Calling forceRefresh to update recipe list...');
    await forceRefresh();
    console.log('[DevelopmentRecipes] forceRefresh completed');
    
    // Check if the recipe still exists (it won't if it was deleted)
    const recipeStillExists = customRecipes.some(r => r.id === recipeId);
    console.log('[DevelopmentRecipes] Recipe still exists after refresh:', recipeStillExists);
    
    // If recipe was deleted, clear any selections that might reference it
    if (!recipeStillExists) {
      console.log('[DevelopmentRecipes] Recipe was deleted, clearing selections...');
      setSelectedCustomRecipe(null);
    }
    
    console.log('[DevelopmentRecipes] Updated customRecipes count after refresh:', customRecipes.length);
    
    // Close the form modal
    setShowCustomRecipeForm(false);
    setEditingCustomRecipe(undefined);
    console.log('[DevelopmentRecipes] handleCustomRecipeSave completed');
  };

  // Handle duplicating a recipe (either API or custom)
  const handleDuplicateRecipe = (combination: Combination, isCustom: boolean = false) => {
    const customRecipe = isCustom ? customRecipes.find(r => r.id === combination.id) : undefined;
    const film = isCustom && customRecipe ? getCustomRecipeFilm(customRecipe.id) : getFilmById(combination.filmStockId);

    // Create a new custom recipe based on the existing one
    const duplicateRecipe: CustomRecipe = {
      id: `duplicate_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
            
            {!isDesktop ? (
              // Mobile: Show selection buttons
              <VStack space="md">
                <MobileSelectButton
                  label="Film"
                  selectedItem={selectedFilm}
                  onPress={() => setShowMobileFilmModal(true)}
                  type="film"
                />
                <MobileSelectButton
                  label="Developer"
                  selectedItem={selectedDeveloper}
                  onPress={() => setShowMobileDeveloperModal(true)}
                  type="developer"
                />
              </VStack>
            ) : (
              // Desktop: Show traditional search inputs
              <Box style={[styles.searchFieldsContainer, styles.searchFieldsDesktop]}>
                <Box style={[styles.searchField, styles.searchFieldDesktop]}>
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

                <Box style={[styles.searchField, styles.searchFieldDesktop]}>
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
            )}
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
              {/* Sort By */}
              <FormGroup label="Sort By">
                <ThemedSelect
                  selectedValue={sortBy}
                  onValueChange={handleSort}
                  items={availableSortOptions}
                  placeholder="Select sort option"
                />
              </FormGroup>

              {/* Temperature Filter */}
              <FormGroup label="Temperature">
                <ThemedSelect
                  selectedValue={temperatureFilter}
                  onValueChange={setTemperatureFilter}
                  items={temperatureOptions}
                  placeholder="Select temperature"
                />
              </FormGroup>

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
            {temperatureFilteredCombinations.length} Development Recipe{temperatureFilteredCombinations.length !== 1 ? 's' : ''} 
            {customRecipes.length > 0 && showCustomRecipes && (
              <Text style={{ fontSize: 14, fontWeight: 'normal', color: textColor, opacity: 0.7 }}>
                {' '}({customRecipes.length} custom)
              </Text>
            )}
          </Text>
          
          <HStack style={{ gap: 8, alignItems: 'center' }}>
            {isDesktop && (
              <TouchableOpacity 
                onPress={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: developmentTint,
                }}
              >
                {viewMode === 'cards' ? (
                  <Table size={14} color={developmentTint} />
                ) : (
                  <Grid3X3 size={14} color={developmentTint} />
                )}
                <Text style={{
                  fontSize: 12,
                  color: developmentTint,
                  fontWeight: '500',
                  marginLeft: 4,
                }}>
                  {viewMode === 'cards' ? 'Table' : 'Cards'}
                </Text>
              </TouchableOpacity>
            )}
            
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

        {temperatureFilteredCombinations.length === 0 ? (
          <Box style={styles.noResultsContainer}>
            <Text style={[styles.noResultsText, { color: textColor }]}>
              No development recipes found.
            </Text>
            <Text style={[styles.noResultsSubtext, { color: textColor }]}>
              Try adjusting your search terms or filters, or create your own recipe.
            </Text>
          </Box>
        ) : (
          // Determine if we should show cards or table
          ((!isDesktop) || (isDesktop && viewMode === 'cards')) ? (
            // Cards View
            <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
              <Box style={styles.cardsGrid}>
                {temperatureFilteredCombinations.map((combination) => {
                  const isCustomRecipe = customRecipes.some(r => r.id === combination.id);
                  const customRecipe = isCustomRecipe ? customRecipes.find(r => r.id === combination.id) : undefined;
                  
                  const film = isCustomRecipe && customRecipe 
                    ? getCustomRecipeFilm(customRecipe.id)
                    : getFilmById(combination.filmStockId);
                    
                  const developer = isCustomRecipe && customRecipe
                    ? getCustomRecipeDeveloper(customRecipe.id) 
                    : getDeveloperById(combination.developerId);

                  // Generate a stable key that includes modification timestamp for custom recipes
                  const recipeKey = isCustomRecipe && customRecipe 
                    ? `${combination.uuid}_${customRecipe.dateModified}` 
                    : combination.uuid;

                  return (
                    <RecipeCard
                      key={recipeKey}
                      combination={combination}
                      film={film}
                      developer={developer}
                      isCustomRecipe={isCustomRecipe}
                      onPress={() => {
                        if (isCustomRecipe && customRecipe) {
                          handleCustomRecipePress(customRecipe);
                        } else {
                          setSelectedCombination(combination);
                          setSelectedCustomRecipe(null);
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </ScrollView>
          ) : (
            // Table View (Desktop only)
            <Box style={styles.tableContainer}>
              {/* Table Header */}
              <Box style={[styles.tableHeaderRow, { borderBottomColor: outline }]}>
                <TableHeader title="Film" sortKey="filmName" currentSort={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                <TableHeader title="Developer" sortKey="developerName" currentSort={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                <TableHeader title="Time" sortKey="timeMinutes" currentSort={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                <TableHeader title="Temp" sortKey="temperatureF" currentSort={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                <TableHeader title="ISO" sortKey="shootingIso" currentSort={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                <TableHeader 
                  title="Dilution" 
                  sortKey="dilution" 
                  currentSort={sortBy} 
                  sortDirection={sortDirection} 
                  onSort={handleSort} 
                />
              </Box>
              
              {/* Table Body */}
              <ScrollView style={styles.tableScrollView} showsVerticalScrollIndicator={false}>
                {temperatureFilteredCombinations.map((combination, index) => {
                  const isCustomRecipe = customRecipes.some(r => r.id === combination.id);
                  const customRecipe = isCustomRecipe ? customRecipes.find(r => r.id === combination.id) : undefined;
                  
                  const film = isCustomRecipe && customRecipe 
                    ? getCustomRecipeFilm(customRecipe.id)
                    : getFilmById(combination.filmStockId);
                    
                  const developer = isCustomRecipe && customRecipe
                    ? getCustomRecipeDeveloper(customRecipe.id) 
                    : getDeveloperById(combination.developerId);

                  // Generate a stable key that includes modification timestamp for custom recipes
                  const recipeKey = isCustomRecipe && customRecipe 
                    ? `${combination.uuid}_${customRecipe.dateModified}` 
                    : combination.uuid;

                  return (
                    <RecipeRow
                      key={recipeKey}
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
          )
        )}
        </Box>
      </Box>

      {/* API Recipe Detail Modal */}
      <Modal
        isOpen={selectedCombination !== null}
        onClose={() => setSelectedCombination(null)}
        size={getRecipeDetailModalConfig(isDesktop).size}
      >
        <ModalBackdrop />
        <ModalContent 
          className={getRecipeDetailModalConfig(isDesktop).className}
          style={getRecipeDetailModalConfig(isDesktop).style}
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
        </ModalContent>
      </Modal>

      {/* Custom Recipe Detail Modal */}
      <Modal
        isOpen={selectedCustomRecipe !== null}
        onClose={() => setSelectedCustomRecipe(null)}
        size={getCustomRecipeDetailModalConfig(isDesktop).size}
      >
        <ModalBackdrop />
        <ModalContent 
          className={getCustomRecipeDetailModalConfig(isDesktop).className}
          style={getCustomRecipeDetailModalConfig(isDesktop).style}
        >
          {currentSelectedCustomRecipe && (
            <RecipeDetail
              combination={{
                id: currentSelectedCustomRecipe.id,
                name: currentSelectedCustomRecipe.name,
                uuid: currentSelectedCustomRecipe.id,
                slug: currentSelectedCustomRecipe.id,
                filmStockId: currentSelectedCustomRecipe.filmId,
                developerId: currentSelectedCustomRecipe.developerId,
                temperatureF: currentSelectedCustomRecipe.temperatureF,
                timeMinutes: currentSelectedCustomRecipe.timeMinutes,
                shootingIso: currentSelectedCustomRecipe.shootingIso,
                pushPull: currentSelectedCustomRecipe.pushPull,
                agitationSchedule: currentSelectedCustomRecipe.agitationSchedule,
                notes: currentSelectedCustomRecipe.notes,
                customDilution: currentSelectedCustomRecipe.customDilution,
                dateAdded: currentSelectedCustomRecipe.dateCreated,
              }}
              film={getCustomRecipeFilm(currentSelectedCustomRecipe.id)}
              developer={getCustomRecipeDeveloper(currentSelectedCustomRecipe.id)}
              onClose={() => setSelectedCustomRecipe(null)}
              onEdit={() => handleEditCustomRecipe(currentSelectedCustomRecipe)}
              onDuplicate={() => handleDuplicateRecipe({
                id: currentSelectedCustomRecipe.id,
                name: currentSelectedCustomRecipe.name,
                uuid: currentSelectedCustomRecipe.id,
                slug: currentSelectedCustomRecipe.id,
                filmStockId: currentSelectedCustomRecipe.filmId,
                developerId: currentSelectedCustomRecipe.developerId,
                temperatureF: currentSelectedCustomRecipe.temperatureF,
                timeMinutes: currentSelectedCustomRecipe.timeMinutes,
                shootingIso: currentSelectedCustomRecipe.shootingIso,
                pushPull: currentSelectedCustomRecipe.pushPull,
                agitationSchedule: currentSelectedCustomRecipe.agitationSchedule,
                notes: currentSelectedCustomRecipe.notes,
                customDilution: currentSelectedCustomRecipe.customDilution,
                dateAdded: currentSelectedCustomRecipe.dateCreated,
              }, true)}
              onDelete={handleCustomRecipeDelete}
              isCustomRecipe={true}
            />
          )}
        </ModalContent>
      </Modal>

      {/* Custom Recipe Form Modal - Both Mobile and Desktop */}
      <Modal
        isOpen={showCustomRecipeForm}
        onClose={handleCustomRecipeFormClose}
        size={getRecipeFormModalConfig(isDesktop).size}
      >
        <ModalBackdrop />
        <ModalContent 
          className={getRecipeFormModalConfig(isDesktop).className}
          style={getRecipeFormModalConfig(isDesktop).style}
        >
          {isDesktop && (
            <ModalHeader className="pb-4">
              <Text className="text-lg font-semibold">
                {editingCustomRecipe ? 'Edit Recipe' : 'New Recipe'}
              </Text>
              <ModalCloseButton>
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
          )}
          <ModalBody className="flex-1 p-0">
            <CustomRecipeForm
              recipe={editingCustomRecipe}
              onClose={handleCustomRecipeFormClose}
              onSave={handleCustomRecipeSave}
              isDesktop={isDesktop}
              isMobileWeb={Platform.OS === 'web' && !isDesktop}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Mobile Selection Modals */}
      <MobileSelectionModal
        isOpen={showMobileFilmModal}
        onClose={() => setShowMobileFilmModal(false)}
        type="film"
        films={allFilms}
        developers={allDevelopers}
        onFilmSelect={(film) => {
          setSelectedFilm(film);
          setFilmSearch(''); // Clear search when selecting from modal
        }}
        onDeveloperSelect={() => {}} // Not used for film modal
      />

      <MobileSelectionModal
        isOpen={showMobileDeveloperModal}
        onClose={() => setShowMobileDeveloperModal(false)}
        type="developer"
        films={allFilms}
        developers={allDevelopers}
        onFilmSelect={() => {}} // Not used for developer modal
        onDeveloperSelect={(developer) => {
          setSelectedDeveloper(developer);
          setDeveloperSearch(''); // Clear search when selecting from modal
        }}
      />
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
  
  // Cards Layout Styles
  cardsContainer: {
    flex: 1,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  cardTouchable: {
    minWidth: 320,
    maxWidth: 500,
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
    marginBottom: 8,
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
  cardDeveloper: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 18,
  },
  cardDivider: {
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  cardParams: {
    gap: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paramBox: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: '30%',
    alignItems: 'center',
  },
  cardParam: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Mobile Selection Styles
  mobileSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  mobileSelectLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  mobileSelectText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalSearchIcon: {
    position: 'absolute',
    left: 24,
    zIndex: 1,
  },
  modalSearchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 40,
    fontSize: 16,
  },
  modalClearButton: {
    position: 'absolute',
    right: 24,
    zIndex: 1,
    padding: 4,
  },
  selectionItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  selectionItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectionItemSubtitle: {
    fontSize: 14,
    fontWeight: '400',
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
  paramText: {
    fontSize: Platform.OS === 'web' ? 13 : 11,
    fontWeight: '500',
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
import React, { useState, useMemo } from "react";
import {
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Box,
  Text,
  Button,
  ButtonText,
  VStack,
  HStack,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
} from "@gluestack-ui/themed";
import { Spinner } from "@/components/ui/spinner";
import {
  X,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
  Grid3X3,
  Table,
} from "lucide-react-native";

import { CalculatorLayout } from "@/components/ui/layout/CalculatorLayout";
import { FormSection, FormGroup } from "@/components/ui/forms/FormSection";
import {
  InfoSection,
  InfoText,
  InfoSubtitle,
  InfoList,
} from "@/components/ui/calculator/InfoSection";
import { StyledSelect } from "@/components/ui/select/StyledSelect";
import { SearchInput, SearchDropdown } from "@/components/ui/search";
import {
  RecipeDetail,
  CustomRecipeForm,
  RecipeCard,
} from "@/components/development-recipes";
import {
  getRecipeDetailModalConfig,
  getCustomRecipeDetailModalConfig,
  getRecipeFormModalConfig,
} from "@/components/development-recipes/ModalStyles";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useDevelopmentRecipes } from "@/hooks/useDevelopmentRecipes";
import { useRecipeUrlState } from "@/hooks/useRecipeUrlState";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { DEVELOPER_TYPES, formatTime } from "@/constants/developmentRecipes";
import { formatDilution } from "@/utils/dilutionUtils";
import { debugLog } from "@/utils/debugLogger";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";
import type { CustomRecipe } from "@/types/customRecipeTypes";

interface TableHeaderProps {
  title: string;
  sortKey: string;
  currentSort: string;
  sortDirection: "asc" | "desc";
  onSort: (sortKey: string) => void;
}

function TableHeader({
  title,
  sortKey,
  currentSort,
  sortDirection,
  onSort,
}: TableHeaderProps) {
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const isActive = currentSort === sortKey;

  // Define flex values to match the row cells
  const getHeaderStyle = () => {
    switch (sortKey) {
      case "filmName":
        return { flex: 2.5 };
      case "developerName":
        return { flex: 2 };
      case "timeMinutes":
        return { flex: 1 };
      case "temperatureF":
        return { flex: 1 };
      case "shootingIso":
        return { flex: 0.8 };
      case "dilution":
        return { flex: 1.2 };
      default:
        return { flex: 1 };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.tableHeader, getHeaderStyle()]}
      onPress={() => onSort(sortKey)}
    >
      <Text
        style={[
          styles.tableHeaderText,
          { color: isActive ? developmentTint : textColor },
        ]}
      >
        {title}
      </Text>
      {isActive &&
        (sortDirection === "asc" ? (
          <ChevronUp
            size={12}
            color={developmentTint}
            style={styles.sortIcon}
          />
        ) : (
          <ChevronDown
            size={12}
            color={developmentTint}
            style={styles.sortIcon}
          />
        ))}
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

function RecipeRow({
  combination,
  film,
  developer,
  onPress,
  isEven,
}: RecipeRowProps) {
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const rowBackground = useThemeColor(
    {},
    isEven ? "cardBackground" : "background",
  );
  const { width } = useWindowDimensions();
  const isMobile = Platform.OS !== "web" || width <= 768;

  const filmName = film
    ? isMobile
      ? film.name
      : `${film.brand} ${film.name}`
    : "Unknown Film";

  // Format push/pull value if present
  const pushPullDisplay =
    combination.pushPull !== 0
      ? ` ${combination.pushPull > 0 ? `+${combination.pushPull}` : combination.pushPull}`
      : null;

  const developerName = developer ? developer.name : "Unknown Developer";

  // Get dilution info
  const dilutionInfo = formatDilution(
    combination.customDilution ||
      developer?.dilutions.find((d) => d.id === combination.dilutionId)
        ?.dilution ||
      "Stock",
  );

  // Format temperature more compactly
  const tempDisplay = `${combination.temperatureF}°F`;

  // Debug logging for temperature display
  debugLog(
    "[RecipeRow] Rendering row for combination:",
    JSON.stringify({
      id: combination.id,
      temperatureF: combination.temperatureF,
      tempDisplay,
      uuid: combination.uuid,
    }),
  );

  return (
    <TouchableOpacity onPress={onPress}>
      <Box style={[styles.tableRow, { backgroundColor: rowBackground }]}>
        <Box style={styles.filmCell}>
          <Text
            style={[styles.filmText, { color: textColor }]}
            numberOfLines={1}
          >
            {filmName}
            {pushPullDisplay && (
              <Text style={{ color: developmentTint }}>{pushPullDisplay}</Text>
            )}
          </Text>
        </Box>

        <Box style={styles.developerCell}>
          <Text
            style={[styles.developerText, { color: textColor }]}
            numberOfLines={1}
          >
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
          <Text
            style={[styles.paramText, { color: textColor }]}
            numberOfLines={1}
          >
            {dilutionInfo}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

export default function DevelopmentRecipes() {
  // Get development recipes data (this loads the data and provides films/developers for URL parsing)
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
    forceRefresh: forceRefreshData,
    clearFilters,
    getFilmById,
    getDeveloperById,
    getAvailableDilutions,
    getAvailableISOs,
  } = useDevelopmentRecipes();

  // Create a recipe lookup map for shared recipe functionality
  const recipesByUuid = useMemo(() => {
    const map = new Map<string, Combination>();

    // Add API recipes
    filteredCombinations.forEach((recipe) => {
      if (recipe.uuid) {
        map.set(recipe.uuid, recipe);
      }
    });

    // Add custom recipes (they use id instead of uuid)
    customRecipesAsCombinations.forEach((recipe) => {
      if (recipe.id) {
        map.set(recipe.id, recipe);
      }
    });

    return map;
  }, [filteredCombinations, customRecipesAsCombinations]);

  // URL state management - syncs current filter state with URL parameters
  const {
    initialUrlState,
    hasUrlState,
    sharedRecipe,
    isLoadingSharedRecipe,
    sharedRecipeError,
    hasSharedRecipe,
  } = useRecipeUrlState(
    allFilms,
    allDevelopers,
    {
      selectedFilm,
      selectedDeveloper,
      dilutionFilter,
      isoFilter,
    },
    recipesByUuid,
  );

  // Apply URL state to hook state when data is loaded and URL state is available
  React.useEffect(() => {
    if (isLoaded && hasUrlState && initialUrlState.fromUrl) {
      if (
        initialUrlState.selectedFilm &&
        initialUrlState.selectedFilm !== selectedFilm
      ) {
        setSelectedFilm(initialUrlState.selectedFilm);
      }
      if (
        initialUrlState.selectedDeveloper &&
        initialUrlState.selectedDeveloper !== selectedDeveloper
      ) {
        setSelectedDeveloper(initialUrlState.selectedDeveloper);
      }
      if (
        initialUrlState.dilutionFilter &&
        initialUrlState.dilutionFilter !== dilutionFilter
      ) {
        setDilutionFilter(initialUrlState.dilutionFilter);
      }
      if (
        initialUrlState.isoFilter &&
        initialUrlState.isoFilter !== isoFilter
      ) {
        setIsoFilter(initialUrlState.isoFilter);
      }
    }
  }, [
    isLoaded,
    hasUrlState,
    initialUrlState,
    selectedFilm,
    selectedDeveloper,
    dilutionFilter,
    isoFilter,
    setSelectedFilm,
    setSelectedDeveloper,
    setDilutionFilter,
    setIsoFilter,
  ]);

  const { customRecipes, forceRefresh, stateVersion } = useCustomRecipes();
  debugLog(
    "[DevelopmentRecipes] Component render - customRecipes count:",
    customRecipes.length,
  );

  // Handle shared recipe - automatically open the recipe detail when a shared recipe is loaded
  React.useEffect(() => {
    if (hasSharedRecipe && sharedRecipe && !isLoadingSharedRecipe) {
      debugLog(
        "[DevelopmentRecipes] Opening shared recipe:",
        sharedRecipe.id || sharedRecipe.uuid,
      );

      // Check if it's a custom recipe or API recipe
      const isCustomRecipe = customRecipes.some(
        (recipe) => recipe.id === sharedRecipe.id,
      );

      if (isCustomRecipe) {
        const customRecipe = customRecipes.find(
          (recipe) => recipe.id === sharedRecipe.id,
        );
        if (customRecipe) {
          setSelectedCustomRecipe(customRecipe);
          setSelectedCombination(null);
        }
      } else {
        setSelectedCombination(sharedRecipe);
        setSelectedCustomRecipe(null);
      }
    }
  }, [hasSharedRecipe, sharedRecipe, isLoadingSharedRecipe, customRecipes]);

  // Show error message if shared recipe fails to load
  React.useEffect(() => {
    if (sharedRecipeError) {
      debugLog("[DevelopmentRecipes] Shared recipe error:", sharedRecipeError);
      // You could show a toast notification here if desired
    }
  }, [sharedRecipeError]);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCombination, setSelectedCombination] =
    useState<Combination | null>(null);
  const [selectedCustomRecipe, setSelectedCustomRecipe] =
    useState<CustomRecipe | null>(null);
  const [showCustomRecipeForm, setShowCustomRecipeForm] = useState(false);
  const [editingCustomRecipe, setEditingCustomRecipe] = useState<
    CustomRecipe | undefined
  >(undefined);
  const [showCustomRecipes, setShowCustomRecipes] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showMobileFilmModal, setShowMobileFilmModal] = useState(false);
  const [showMobileDeveloperModal, setShowMobileDeveloperModal] =
    useState(false);
  const [isFilmSearchFocused, setIsFilmSearchFocused] = useState(false);
  const [isDeveloperSearchFocused, setIsDeveloperSearchFocused] =
    useState(false);

  // Add refs and position state for dynamic positioning
  const filmSearchRef = React.useRef<any>(null);
  const developerSearchRef = React.useRef<any>(null);
  const [filmSearchPosition, setFilmSearchPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [developerSearchPosition, setDeveloperSearchPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");

  // Convert custom recipes to combination-like format for display
  const customRecipesAsCombinations = React.useMemo(() => {
    debugLog(
      "[DevelopmentRecipes] customRecipesAsCombinations useMemo triggered",
    );
    debugLog(
      "[DevelopmentRecipes] Converting custom recipes to combinations, count:",
      customRecipes.length,
    );
    debugLog(
      "[DevelopmentRecipes] customRecipes reference check:",
      customRecipes,
    );
    debugLog(
      "[DevelopmentRecipes] customRecipes dateModified values:",
      customRecipes.map((r) => ({ id: r.id, dateModified: r.dateModified })),
    );

    const combinations = customRecipes.map((recipe): Combination => {
      debugLog(
        "[DevelopmentRecipes] Converting recipe to combination:",
        JSON.stringify({
          id: recipe.id,
          temperatureF: recipe.temperatureF,
          dateModified: recipe.dateModified,
        }),
      );
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
    debugLog(
      "[DevelopmentRecipes] Converted to combinations:",
      combinations.length,
    );
    debugLog(
      "[DevelopmentRecipes] Combination temperature values:",
      combinations.map((c) => ({ id: c.id, temperatureF: c.temperatureF })),
    );
    return combinations;
  }, [customRecipes]);

  // Combined API + custom recipes for display
  const allCombinations = React.useMemo(() => {
    debugLog("[DevelopmentRecipes] allCombinations useMemo triggered");
    debugLog(
      "[DevelopmentRecipes] Recalculating allCombinations, showCustomRecipes:",
      showCustomRecipes,
      "customRecipes.length:",
      customRecipes.length,
    );
    debugLog(
      "[DevelopmentRecipes] filteredCombinations.length:",
      filteredCombinations.length,
    );
    debugLog(
      "[DevelopmentRecipes] customRecipesAsCombinations.length:",
      customRecipesAsCombinations.length,
    );
    debugLog("[DevelopmentRecipes] stateVersion:", stateVersion);

    if (!showCustomRecipes) {
      debugLog(
        "[DevelopmentRecipes] Not showing custom recipes, returning only API recipes",
      );
      return filteredCombinations;
    }

    // Filter custom recipes based on current filters
    let filteredCustomCombinations = customRecipesAsCombinations.filter(
      (combination) => {
        const recipe = customRecipes.find((r) => r.id === combination.id);
        if (!recipe) return false;

        // Apply film filter
        if (selectedFilm) {
          if (recipe.isCustomFilm) {
            // For custom films, check if the name/brand matches the selected film
            return (
              recipe.customFilm?.brand
                ?.toLowerCase()
                .includes(selectedFilm.brand.toLowerCase()) ||
              recipe.customFilm?.name
                ?.toLowerCase()
                .includes(selectedFilm.name.toLowerCase())
            );
          } else {
            return combination.filmStockId === selectedFilm.uuid;
          }
        } else if (filmSearch.trim()) {
          if (recipe.isCustomFilm && recipe.customFilm) {
            const filmMatch =
              recipe.customFilm.brand
                .toLowerCase()
                .includes(filmSearch.toLowerCase()) ||
              recipe.customFilm.name
                .toLowerCase()
                .includes(filmSearch.toLowerCase());
            return filmMatch;
          } else {
            const film = getFilmById(combination.filmStockId);
            return (
              film &&
              (film.name.toLowerCase().includes(filmSearch.toLowerCase()) ||
                film.brand.toLowerCase().includes(filmSearch.toLowerCase()))
            );
          }
        }

        // Apply developer filter
        if (selectedDeveloper) {
          if (recipe.isCustomDeveloper) {
            return (
              recipe.customDeveloper?.manufacturer
                ?.toLowerCase()
                .includes(selectedDeveloper.manufacturer.toLowerCase()) ||
              recipe.customDeveloper?.name
                ?.toLowerCase()
                .includes(selectedDeveloper.name.toLowerCase())
            );
          } else {
            return combination.developerId === selectedDeveloper.uuid;
          }
        } else if (developerSearch.trim()) {
          if (recipe.isCustomDeveloper && recipe.customDeveloper) {
            const devMatch =
              recipe.customDeveloper.manufacturer
                .toLowerCase()
                .includes(developerSearch.toLowerCase()) ||
              recipe.customDeveloper.name
                .toLowerCase()
                .includes(developerSearch.toLowerCase());
            return devMatch;
          } else {
            const dev = getDeveloperById(combination.developerId);
            return (
              dev &&
              (dev.name.toLowerCase().includes(developerSearch.toLowerCase()) ||
                dev.manufacturer
                  .toLowerCase()
                  .includes(developerSearch.toLowerCase()))
            );
          }
        }

        // If no specific filters applied, include all custom recipes
        return true;
      },
    );

    debugLog(
      "[DevelopmentRecipes] Filtered custom combinations:",
      filteredCustomCombinations.length,
    );

    // Sort custom recipes by creation date (newest first) to show recently added ones at the top
    filteredCustomCombinations.sort((a, b) => {
      const recipeA = customRecipes.find((r) => r.id === a.id);
      const recipeB = customRecipes.find((r) => r.id === b.id);
      if (!recipeA || !recipeB) return 0;
      return (
        new Date(recipeB.dateCreated).getTime() -
        new Date(recipeA.dateCreated).getTime()
      );
    });

    // Combine custom recipes (newest first) with API recipes
    const combined = [...filteredCustomCombinations, ...filteredCombinations];
    debugLog(
      "[DevelopmentRecipes] Final combined count:",
      combined.length,
      "(custom:",
      filteredCustomCombinations.length,
      "api:",
      filteredCombinations.length,
      ")",
    );
    return combined;
  }, [
    filteredCombinations,
    customRecipesAsCombinations,
    showCustomRecipes,
    selectedFilm,
    selectedDeveloper,
    filmSearch,
    developerSearch,
    getFilmById,
    getDeveloperById,
    customRecipes,
    stateVersion,
  ]);

  // Custom recipe helpers
  const getCustomRecipeFilm = (recipeId: string): Film | undefined => {
    const recipe = customRecipes.find((r) => r.id === recipeId);
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

  const getCustomRecipeDeveloper = (
    recipeId: string,
  ): Developer | undefined => {
    const recipe = customRecipes.find((r) => r.id === recipeId);
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
    const currentVersion = customRecipes.find(
      (r) => r.id === selectedCustomRecipe.id,
    );
    return currentVersion || selectedCustomRecipe; // Fallback to original if not found
  }, [selectedCustomRecipe, customRecipes]);

  const handleCustomRecipePress = (recipe: CustomRecipe) => {
    debugLog(
      "[DevelopmentRecipes] handleCustomRecipePress called for recipe:",
      recipe.id,
    );
    setSelectedCustomRecipe(recipe);
    setSelectedCombination(null); // Clear API recipe selection
  };

  const handleEditCustomRecipe = (recipe: CustomRecipe) => {
    debugLog("[DevelopmentRecipes] ===== handleEditCustomRecipe called =====");
    debugLog("[DevelopmentRecipes] Recipe to edit:", recipe.id, recipe.name);
    debugLog(
      "[DevelopmentRecipes] Full recipe object:",
      JSON.stringify(recipe, null, 2),
    );
    debugLog(
      "[DevelopmentRecipes] Setting editingCustomRecipe and showing form...",
    );
    setEditingCustomRecipe(recipe);
    setShowCustomRecipeForm(true);
    debugLog(
      "[DevelopmentRecipes] State updated - editingCustomRecipe set and form shown",
    );
  };

  const handleNewCustomRecipe = () => {
    debugLog("[DevelopmentRecipes] handleNewCustomRecipe called");
    setEditingCustomRecipe(undefined);
    setShowCustomRecipeForm(true);
  };

  const handleForceRefresh = async () => {
    debugLog("[DevelopmentRecipes] handleForceRefresh called");
    debugLog(
      "[DevelopmentRecipes] Force refresh button clicked, isLoading:",
      isLoading,
    );
    try {
      await forceRefreshData();
      debugLog("[DevelopmentRecipes] Force refresh completed successfully");
    } catch (error) {
      debugLog("[DevelopmentRecipes] Force refresh failed:", error);
    }
  };

  const handleCustomRecipeFormClose = () => {
    debugLog("[DevelopmentRecipes] handleCustomRecipeFormClose called");

    // Force refresh to ensure any recipe deletions are reflected in the UI
    forceRefresh();

    // Clear any selected custom recipe if it might have been deleted
    setSelectedCustomRecipe(null);

    setShowCustomRecipeForm(false);
    setEditingCustomRecipe(undefined);
  };

  const handleCustomRecipeDelete = () => {
    debugLog("[DevelopmentRecipes] handleCustomRecipeDelete called");

    // Force refresh to ensure the deletion is reflected in the UI
    forceRefresh();

    // Clear the selected custom recipe since it was deleted
    setSelectedCustomRecipe(null);
  };

  const handleCustomRecipeSave = async (recipeId: string) => {
    debugLog(
      "[DevelopmentRecipes] handleCustomRecipeSave called for recipe:",
      recipeId,
    );
    debugLog(
      "[DevelopmentRecipes] Current customRecipes count before refresh:",
      customRecipes.length,
    );

    // Force immediate refresh to ensure updated data is displayed
    // This is critical for both saves AND deletes
    debugLog(
      "[DevelopmentRecipes] Calling forceRefresh to update recipe list...",
    );
    await forceRefresh();
    debugLog("[DevelopmentRecipes] forceRefresh completed");

    // Check if the recipe still exists (it won't if it was deleted)
    const recipeStillExists = customRecipes.some((r) => r.id === recipeId);
    debugLog(
      "[DevelopmentRecipes] Recipe still exists after refresh:",
      recipeStillExists,
    );

    // If recipe was deleted, clear any selections that might reference it
    if (!recipeStillExists) {
      debugLog(
        "[DevelopmentRecipes] Recipe was deleted, clearing selections...",
      );
      setSelectedCustomRecipe(null);
    }

    debugLog(
      "[DevelopmentRecipes] Updated customRecipes count after refresh:",
      customRecipes.length,
    );

    // Close the form modal
    setShowCustomRecipeForm(false);
    setEditingCustomRecipe(undefined);
    debugLog("[DevelopmentRecipes] handleCustomRecipeSave completed");
  };

  // Handle duplicating a recipe (either API or custom)
  const handleDuplicateRecipe = (
    combination: Combination,
    isCustom: boolean = false,
  ) => {
    const customRecipe = isCustom
      ? customRecipes.find((r) => r.id === combination.id)
      : undefined;
    const film =
      isCustom && customRecipe
        ? getCustomRecipeFilm(customRecipe.id)
        : getFilmById(combination.filmStockId);

    // Create a new custom recipe based on the existing one
    const duplicateRecipe: CustomRecipe = {
      id: `duplicate_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: `Copy of ${combination.name || (film ? `${film.brand} ${film.name}` : "Unknown")}`,
      filmId:
        isCustom && customRecipe?.isCustomFilm
          ? customRecipe.filmId
          : combination.filmStockId,
      developerId:
        isCustom && customRecipe?.isCustomDeveloper
          ? customRecipe.developerId
          : combination.developerId,
      temperatureF: combination.temperatureF,
      timeMinutes: combination.timeMinutes,
      shootingIso: combination.shootingIso,
      pushPull: combination.pushPull,
      agitationSchedule: combination.agitationSchedule,
      notes: combination.notes,
      customDilution: combination.customDilution || undefined,
      isCustomFilm:
        isCustom && customRecipe ? customRecipe.isCustomFilm : false,
      isCustomDeveloper:
        isCustom && customRecipe ? customRecipe.isCustomDeveloper : false,
      customFilm:
        isCustom && customRecipe ? customRecipe.customFilm : undefined,
      customDeveloper:
        isCustom && customRecipe ? customRecipe.customDeveloper : undefined,
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

  // Film and developer lists for desktop search dropdown
  const filteredFilms = React.useMemo(() => {
    if (!isFilmSearchFocused) return [];
    if (!filmSearch.trim()) return allFilms;
    return allFilms.filter(
      (film) =>
        film.name.toLowerCase().includes(filmSearch.toLowerCase()) ||
        film.brand.toLowerCase().includes(filmSearch.toLowerCase()),
    );
  }, [allFilms, filmSearch, isFilmSearchFocused]);

  const filteredDevelopers = React.useMemo(() => {
    if (!isDeveloperSearchFocused) return [];
    if (!developerSearch.trim()) return allDevelopers;
    return allDevelopers.filter(
      (dev) =>
        dev.name.toLowerCase().includes(developerSearch.toLowerCase()) ||
        dev.manufacturer.toLowerCase().includes(developerSearch.toLowerCase()),
    );
  }, [allDevelopers, developerSearch, isDeveloperSearchFocused]);

  // Convert to SearchDropdownItem format
  const filmDropdownItems = React.useMemo(
    () =>
      filteredFilms.map((film) => ({
        id: film.uuid,
        title: film.name,
        subtitle: film.brand,
      })),
    [filteredFilms],
  );

  const developerDropdownItems = React.useMemo(
    () =>
      filteredDevelopers.map((developer) => ({
        id: developer.uuid,
        title: developer.name,
        subtitle: developer.manufacturer,
      })),
    [filteredDevelopers],
  );

  // Handle dropdown item selection
  const handleFilmDropdownSelect = (item: {
    id: string;
    title: string;
    subtitle: string;
  }) => {
    const film = allFilms.find((f) => f.uuid === item.id);
    if (film) {
      setSelectedFilm(film);
      setFilmSearch("");
      setIsFilmSearchFocused(false);
    }
  };

  const handleDeveloperDropdownSelect = (item: {
    id: string;
    title: string;
    subtitle: string;
  }) => {
    const developer = allDevelopers.find((d) => d.uuid === item.id);
    if (developer) {
      setSelectedDeveloper(developer);
      setDeveloperSearch("");
      setIsDeveloperSearchFocused(false);
    }
  };

  // Add layout handlers for dynamic positioning
  const handleFilmSearchLayout = () => {
    if (filmSearchRef.current && isDesktop) {
      filmSearchRef.current.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number,
        ) => {
          setFilmSearchPosition({
            top: pageY + height,
            left: pageX,
            width: width,
          });
        },
      );
    }
  };

  const handleDeveloperSearchLayout = () => {
    if (developerSearchRef.current && isDesktop) {
      developerSearchRef.current.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number,
        ) => {
          setDeveloperSearchPosition({
            top: pageY + height,
            left: pageX,
            width: width,
          });
        },
      );
    }
  };

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
        and Celsius), recommended shooting ISO, dilution ratio, and any
        push/pull processing notes.
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
          <Spinner
            size="large"
            color={developmentTint}
            style={{ marginBottom: 16 }}
          />
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
            <VStack space="md" style={{ overflow: "visible" }}>
              {/* Search/Selection Fields */}
              <Box>
                <Text style={[styles.sectionLabel, { color: textColor }]}>
                  {isDesktop ? "Search" : "Select Film & Developer"}
                </Text>

                <Box
                  style={[
                    styles.searchFieldsContainer,
                    isDesktop && styles.searchFieldsDesktop,
                    {
                      overflow: "visible",
                      zIndex: 999999,
                      position: "relative",
                    },
                  ]}
                >
                  <Box
                    ref={filmSearchRef}
                    style={[
                      styles.searchField,
                      isDesktop && styles.searchFieldDesktop,
                      {
                        overflow: "visible",
                        zIndex: 999999,
                        position: "relative",
                      },
                    ]}
                    onLayout={handleFilmSearchLayout}
                  >
                    <Box style={styles.searchDropdownContainer}>
                      {isDesktop ? (
                        <SearchInput
                          variant="desktop"
                          type="film"
                          placeholder="Type to search films..."
                          value={filmSearch}
                          onChangeText={setFilmSearch}
                          onClear={() => setFilmSearch("")}
                          onFocus={() => {
                            setIsFilmSearchFocused(true);
                            handleFilmSearchLayout();
                          }}
                          onBlur={() => {
                            // Delay hiding to allow item selection
                            setTimeout(
                              () => setIsFilmSearchFocused(false),
                              150,
                            );
                          }}
                        />
                      ) : (
                        <SearchInput
                          variant="mobile"
                          type="film"
                          placeholder="Type to search films..."
                          selectedItem={selectedFilm}
                          onPress={() => setShowMobileFilmModal(true)}
                          onClear={() => setSelectedFilm(null)}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box
                    ref={developerSearchRef}
                    style={[
                      styles.searchField,
                      isDesktop && styles.searchFieldDesktop,
                      {
                        overflow: "visible",
                        zIndex: 999999,
                        position: "relative",
                      },
                    ]}
                    onLayout={handleDeveloperSearchLayout}
                  >
                    <Box style={styles.searchDropdownContainer}>
                      {isDesktop ? (
                        <SearchInput
                          variant="desktop"
                          type="developer"
                          placeholder="Type to search developers..."
                          value={developerSearch}
                          onChangeText={setDeveloperSearch}
                          onClear={() => setDeveloperSearch("")}
                          onFocus={() => {
                            setIsDeveloperSearchFocused(true);
                            handleDeveloperSearchLayout();
                          }}
                          onBlur={() => {
                            // Delay hiding to allow item selection
                            setTimeout(
                              () => setIsDeveloperSearchFocused(false),
                              150,
                            );
                          }}
                        />
                      ) : (
                        <SearchInput
                          variant="mobile"
                          type="developer"
                          placeholder="Type to search developers..."
                          selectedItem={selectedDeveloper}
                          onPress={() => setShowMobileDeveloperModal(true)}
                          onClear={() => setSelectedDeveloper(null)}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Selected Items Display - Desktop only */}
              {isDesktop && (selectedFilm || selectedDeveloper) && (
                <Box style={styles.selectedItemsContainer}>
                  <HStack space="sm" style={styles.selectedItemsHeader}>
                    <Text style={[styles.sectionLabel, { color: textColor }]}>
                      Selected:
                    </Text>
                    <TouchableOpacity onPress={clearFilters}>
                      <Text
                        style={[
                          styles.clearAllText,
                          { color: developmentTint },
                        ]}
                      >
                        Clear All
                      </Text>
                    </TouchableOpacity>
                  </HStack>

                  {selectedFilm && (
                    <Box style={styles.selectedItem}>
                      <Text
                        style={[styles.selectedItemText, { color: textColor }]}
                      >
                        Film: {selectedFilm.brand} {selectedFilm.name}
                      </Text>
                      <TouchableOpacity onPress={() => setSelectedFilm(null)}>
                        <X size={16} color={textColor} />
                      </TouchableOpacity>
                    </Box>
                  )}

                  {selectedDeveloper && (
                    <Box style={styles.selectedItem}>
                      <Text
                        style={[styles.selectedItemText, { color: textColor }]}
                      >
                        Developer: {selectedDeveloper.manufacturer}{" "}
                        {selectedDeveloper.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSelectedDeveloper(null)}
                      >
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
                <Text
                  style={[styles.filterToggleText, { color: developmentTint }]}
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
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
            {/* Title */}
            <Text
              style={[
                styles.resultsHeader,
                { color: textColor, textAlign: isDesktop ? "left" : "center" },
              ]}
            >
              {allCombinations.length} Development Recipe
              {allCombinations.length !== 1 ? "s" : ""}
              {customRecipes.length > 0 && showCustomRecipes && (
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "normal",
                    color: textColor,
                    opacity: 0.7,
                  }}
                >
                  {" "}
                  ({customRecipes.length} custom)
                </Text>
              )}
            </Text>

            {/* Buttons - Different layouts for mobile vs desktop */}
            {isDesktop ? (
              /* Desktop: Buttons in top right */
              <Box style={styles.desktopButtonsContainer}>
                <HStack style={{ gap: 8, alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() =>
                      setViewMode(viewMode === "cards" ? "table" : "cards")
                    }
                    style={styles.desktopButton}
                  >
                    {viewMode === "cards" ? (
                      <Table size={14} color={developmentTint} />
                    ) : (
                      <Grid3X3 size={14} color={developmentTint} />
                    )}
                    <Text
                      style={[
                        styles.desktopButtonText,
                        { color: developmentTint },
                      ]}
                    >
                      {viewMode === "cards" ? "Table" : "Cards"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleForceRefresh}
                    style={styles.desktopButton}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner size="small" color={developmentTint} />
                    ) : (
                      <RefreshCw size={14} color={developmentTint} />
                    )}
                    <Text
                      style={[
                        styles.desktopButtonText,
                        {
                          color: developmentTint,
                          opacity: isLoading ? 0.5 : 1,
                        },
                      ]}
                    >
                      {isLoading ? "Loading..." : "Refresh"}
                    </Text>
                  </TouchableOpacity>

                  {customRecipes.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setShowCustomRecipes(!showCustomRecipes)}
                      style={[
                        styles.desktopButton,
                        {
                          backgroundColor: showCustomRecipes
                            ? developmentTint
                            : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.desktopButtonText,
                          {
                            color: showCustomRecipes ? "#fff" : developmentTint,
                          },
                        ]}
                      >
                        My Recipes
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={handleNewCustomRecipe}
                    style={[
                      styles.desktopButton,
                      { backgroundColor: developmentTint },
                    ]}
                  >
                    <Plus size={14} color="#fff" />
                    <Text style={[styles.desktopButtonText, { color: "#fff" }]}>
                      Add Recipe
                    </Text>
                  </TouchableOpacity>
                </HStack>
              </Box>
            ) : (
              /* Mobile: Buttons centered below title */
              <Box style={styles.mobileButtonsContainer}>
                <HStack style={styles.mobileButtonsRow}>
                  <TouchableOpacity
                    onPress={handleForceRefresh}
                    style={styles.mobileButton}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner size="small" color={developmentTint} />
                    ) : (
                      <RefreshCw size={16} color={developmentTint} />
                    )}
                    <Text
                      style={[
                        styles.mobileButtonText,
                        {
                          color: developmentTint,
                          opacity: isLoading ? 0.5 : 1,
                        },
                      ]}
                    >
                      {isLoading ? "Loading..." : "Refresh"}
                    </Text>
                  </TouchableOpacity>

                  {customRecipes.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setShowCustomRecipes(!showCustomRecipes)}
                      style={[
                        styles.mobileButton,
                        {
                          backgroundColor: showCustomRecipes
                            ? developmentTint
                            : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.mobileButtonText,
                          {
                            color: showCustomRecipes ? "#fff" : developmentTint,
                          },
                        ]}
                      >
                        My Recipes
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={handleNewCustomRecipe}
                    style={[
                      styles.mobileButton,
                      { backgroundColor: developmentTint },
                    ]}
                  >
                    <Plus size={16} color="#fff" />
                    <Text style={[styles.mobileButtonText, { color: "#fff" }]}>
                      Add Recipe
                    </Text>
                  </TouchableOpacity>
                </HStack>
              </Box>
            )}

            {allCombinations.length === 0 ? (
              <Box style={styles.noResultsContainer}>
                <Text style={[styles.noResultsText, { color: textColor }]}>
                  No development recipes found.
                </Text>
                <Text style={[styles.noResultsSubtext, { color: textColor }]}>
                  Try adjusting your search terms or filters, or create your own
                  recipe.
                </Text>
              </Box>
            ) : (
              // Cards or Table View
              <>
                {isDesktop && viewMode === "table" ? (
                  // Table view for desktop
                  <Box style={styles.tableContainer}>
                    <Box style={styles.tableHeaderRow}>
                      <TableHeader
                        title="Film"
                        sortKey="filmName"
                        currentSort={sortBy}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <TableHeader
                        title="Developer"
                        sortKey="developerName"
                        currentSort={sortBy}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <TableHeader
                        title="Time"
                        sortKey="timeMinutes"
                        currentSort={sortBy}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <TableHeader
                        title="Temp"
                        sortKey="temperatureF"
                        currentSort={sortBy}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <TableHeader
                        title="ISO"
                        sortKey="shootingIso"
                        currentSort={sortBy}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <TableHeader
                        title="Dilution"
                        sortKey="dilution"
                        currentSort={sortBy}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                    </Box>

                    <ScrollView style={styles.tableScrollView}>
                      {allCombinations.map((combination, index) => {
                        const isCustom = customRecipes.some(
                          (r) => r.id === combination.id,
                        );
                        const film = isCustom
                          ? getCustomRecipeFilm(combination.id)
                          : getFilmById(combination.filmStockId);
                        const developer = isCustom
                          ? getCustomRecipeDeveloper(combination.id)
                          : getDeveloperById(combination.developerId);

                        return (
                          <RecipeRow
                            key={combination.uuid}
                            combination={combination}
                            film={film}
                            developer={developer}
                            onPress={() => {
                              if (isCustom) {
                                const customRecipe = customRecipes.find(
                                  (r) => r.id === combination.id,
                                );
                                if (customRecipe) {
                                  handleCustomRecipePress(customRecipe);
                                }
                              } else {
                                setSelectedCombination(combination);
                              }
                            }}
                            isEven={index % 2 === 0}
                          />
                        );
                      })}
                    </ScrollView>
                  </Box>
                ) : (
                  // Cards view (default for mobile, optional for desktop)
                  <Box style={styles.cardsContainer}>
                    {allCombinations.map((combination) => {
                      const isCustom = customRecipes.some(
                        (r) => r.id === combination.id,
                      );
                      const film = isCustom
                        ? getCustomRecipeFilm(combination.id)
                        : getFilmById(combination.filmStockId);
                      const developer = isCustom
                        ? getCustomRecipeDeveloper(combination.id)
                        : getDeveloperById(combination.developerId);

                      return (
                        <RecipeCard
                          key={combination.uuid}
                          combination={combination}
                          film={film}
                          developer={developer}
                          onPress={() => {
                            if (isCustom) {
                              const customRecipe = customRecipes.find(
                                (r) => r.id === combination.id,
                              );
                              if (customRecipe) {
                                handleCustomRecipePress(customRecipe);
                              }
                            } else {
                              setSelectedCombination(combination);
                            }
                          }}
                          isCustomRecipe={isCustom}
                        />
                      );
                    })}
                  </Box>
                )}
              </>
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
                onDuplicate={() =>
                  handleDuplicateRecipe(selectedCombination, false)
                }
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
                  agitationSchedule:
                    currentSelectedCustomRecipe.agitationSchedule,
                  notes: currentSelectedCustomRecipe.notes,
                  customDilution: currentSelectedCustomRecipe.customDilution,
                  dateAdded: currentSelectedCustomRecipe.dateCreated,
                }}
                film={getCustomRecipeFilm(currentSelectedCustomRecipe.id)}
                developer={getCustomRecipeDeveloper(
                  currentSelectedCustomRecipe.id,
                )}
                onClose={() => setSelectedCustomRecipe(null)}
                onEdit={() =>
                  handleEditCustomRecipe(currentSelectedCustomRecipe)
                }
                onDuplicate={() =>
                  handleDuplicateRecipe(
                    {
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
                      agitationSchedule:
                        currentSelectedCustomRecipe.agitationSchedule,
                      notes: currentSelectedCustomRecipe.notes,
                      customDilution:
                        currentSelectedCustomRecipe.customDilution,
                      dateAdded: currentSelectedCustomRecipe.dateCreated,
                    },
                    true,
                  )
                }
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
                  {editingCustomRecipe ? "Edit Recipe" : "New Recipe"}
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
                isMobileWeb={Platform.OS === "web" && !isDesktop}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Film Search Dropdown - Desktop only */}
        {isDesktop && (
          <SearchDropdown
            variant="desktop"
            isOpen={isFilmSearchFocused}
            onClose={() => setIsFilmSearchFocused(false)}
            items={filmDropdownItems}
            onItemSelect={handleFilmDropdownSelect}
            position="left"
            dynamicPosition={filmSearchPosition}
          />
        )}

        {/* Developer Search Dropdown - Desktop only */}
        {isDesktop && (
          <SearchDropdown
            variant="desktop"
            isOpen={isDeveloperSearchFocused}
            onClose={() => setIsDeveloperSearchFocused(false)}
            items={developerDropdownItems}
            onItemSelect={handleDeveloperDropdownSelect}
            position="right"
            dynamicPosition={developerSearchPosition}
          />
        )}

        {/* Mobile Selection Modals - handled by SearchInput component now */}
        {!isDesktop && (
          <>
            <SearchDropdown
              variant="mobile"
              type="film"
              isOpen={showMobileFilmModal}
              onClose={() => setShowMobileFilmModal(false)}
              films={allFilms}
              onFilmSelect={(film: Film) => {
                setSelectedFilm(film);
              }}
              onItemSelect={() => {}} // Not used for mobile variant
            />

            <SearchDropdown
              variant="mobile"
              type="developer"
              isOpen={showMobileDeveloperModal}
              onClose={() => setShowMobileDeveloperModal(false)}
              developers={allDevelopers}
              onDeveloperSelect={(developer: Developer) => {
                setSelectedDeveloper(developer);
              }}
              onItemSelect={() => {}} // Not used for mobile variant
            />
          </>
        )}
      </Box>
    </CalculatorLayout>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: "100%",
    overflow: "visible",
  },
  leftPanel: {
    flex: 1,
    overflow: "visible",
  },

  // Cards Container - Minimal layout container for cards
  cardsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingVertical: 8,
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
    flexDirection: "row",
    gap: 16,
  },
  searchField: {
    flex: 1,
  },
  searchFieldDesktop: {
    flex: 1,
    minWidth: 0, // Allows flex items to shrink below content size
  },

  // Search Dropdown Styles (for desktop)
  searchDropdownContainer: {
    position: "relative",
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
    position: "relative",
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  // Table Styles
  tableContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Platform.OS === "web" ? 8 : 4,
    paddingVertical: 4,
    justifyContent: "center",
  },
  tableHeaderText: {
    fontSize: Platform.OS === "web" ? 14 : 12,
    fontWeight: "600",
    marginRight: 4,
    textAlign: "center",
  },
  sortIcon: {
    marginLeft: 2,
  },
  tableScrollView: {
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Platform.OS === "web" ? 12 : 8,
    paddingHorizontal: Platform.OS === "web" ? 8 : 4,
    minHeight: Platform.OS === "web" ? 48 : 40,
  },
  filmCell: {
    flex: 2.5,
    paddingRight: 8,
  },
  filmText: {
    fontSize: Platform.OS === "web" ? 14 : 12,
    fontWeight: "600",
  },
  developerCell: {
    flex: 2,
    paddingRight: 8,
  },
  developerText: {
    fontSize: Platform.OS === "web" ? 13 : 11,
    fontWeight: "500",
  },
  timeCell: {
    flex: 1,
    paddingRight: 8,
    alignItems: "center",
  },
  tempCell: {
    flex: 1,
    paddingRight: 8,
    alignItems: "center",
  },
  isoCell: {
    flex: 0.8,
    paddingRight: 8,
    alignItems: "center",
  },
  dilutionCell: {
    flex: 1.2,
    paddingRight: 8,
    alignItems: "center",
  },
  paramText: {
    fontSize: Platform.OS === "web" ? 13 : 11,
    fontWeight: "500",
    textAlign: "center",
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

  // Desktop Button Styles
  desktopButtonsContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
  },
  desktopButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "currentColor",
    gap: 4,
  },
  desktopButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Mobile Button Styles
  mobileButtonsContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  mobileButtonsRow: {
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mobileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "currentColor",
    gap: 6,
    minWidth: 120,
    justifyContent: "center",
  },
  mobileButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

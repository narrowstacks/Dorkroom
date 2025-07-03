import React, { useState, useMemo, useCallback } from "react";
import { Platform } from "react-native";
import {
  Box,
  Text,
  Button,
  ButtonText,
  VStack,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
} from "@gluestack-ui/themed";
import { Spinner } from "@/components/ui/spinner";
import { X } from "lucide-react-native";

import { CalculatorLayout } from "@/components/ui/layout/CalculatorLayout";
import {
  InfoSection,
  InfoText,
  InfoSubtitle,
  InfoList,
} from "@/components/ui/calculator/InfoSection";
import { SearchDropdown } from "@/components/ui/search";
import {
  RecipeDetail,
  CustomRecipeForm,
  RecipeSearchFilters,
  RecipeResultsView,
} from "@/components/development-recipes";
import {
  getRecipeDetailModalConfig,
  getCustomRecipeDetailModalConfig,
  getRecipeFormModalConfig,
} from "@/components/development-recipes/ModalStyles";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useServerDevelopmentRecipes } from "@/hooks/useServerDevelopmentRecipes";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useDebounce } from "@/hooks/useDebounce";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";
import type { CustomRecipe } from "@/types/customRecipeTypes";

/**
 * Development Recipes component with server-side pagination
 * Optimized for large datasets with improved performance
 */
export default function DevelopmentRecipes() {
  // Server-side data loading with pagination
  const {
    // Data
    combinations,
    allFilms,
    allDevelopers,

    // Pagination state
    currentPage,
    totalPages,
    totalItems,
    hasNext,
    hasPrevious,
    startIndex,
    endIndex,

    // Loading states
    isLoading,
    isInitialLoading,
    error,

    // Filters
    filters,

    // Actions
    setFilters,
    clearFilters,
    goToPage,
    goToNext,
    goToPrevious,
    refresh,

    // Helper functions
    getFilmById,
    getDeveloperById,
  } = useServerDevelopmentRecipes({
    pageSize: 50,
    debounceMs: 300,
    enablePreloading: true,
  });

  // Custom recipes management
  const {
    customRecipes,
    forceRefresh: forceRefreshCustom,
    addCustomRecipe,
  } = useCustomRecipes();

  // UI state
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

  // Search state - converted to server-side filters
  const [filmSearch, setFilmSearch] = useState("");
  const [developerSearch, setDeveloperSearch] = useState("");
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(
    null,
  );

  // Filter state - managed by server hook
  const [sortBy, setSortBy] = useState("filmName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Debounced search to prevent excessive API calls
  const debouncedFilmSearch = useDebounce(filmSearch, 300);
  const debouncedDeveloperSearch = useDebounce(developerSearch, 300);

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");

  // Convert custom recipes to combination format for display
  const customRecipesAsCombinations = useMemo(() => {
    if (!showCustomRecipes) return [];

    return customRecipes.map(
      (recipe): Combination => ({
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
        dilutionId: undefined,
      }),
    );
  }, [customRecipes, showCustomRecipes]);

  // Filtered custom recipes for current search/filters
  const filteredCustomRecipes = useMemo(() => {
    let filtered = customRecipesAsCombinations;

    // Apply film filter
    if (selectedFilm) {
      filtered = filtered.filter((combo) => {
        const recipe = customRecipes.find((r) => r.id === combo.id);
        if (!recipe) return false;

        if (recipe.isCustomFilm) {
          return (
            recipe.customFilm?.brand
              ?.toLowerCase()
              .includes(selectedFilm.brand.toLowerCase()) ||
            recipe.customFilm?.name
              ?.toLowerCase()
              .includes(selectedFilm.name.toLowerCase())
          );
        } else {
          return combo.filmStockId === selectedFilm.uuid;
        }
      });
    } else if (debouncedFilmSearch.trim()) {
      filtered = filtered.filter((combo) => {
        const recipe = customRecipes.find((r) => r.id === combo.id);
        if (!recipe) return false;

        if (recipe.isCustomFilm && recipe.customFilm) {
          return (
            recipe.customFilm.brand
              .toLowerCase()
              .includes(debouncedFilmSearch.toLowerCase()) ||
            recipe.customFilm.name
              .toLowerCase()
              .includes(debouncedFilmSearch.toLowerCase())
          );
        } else {
          const film = getFilmById(combo.filmStockId);
          return (
            film &&
            (film.name
              .toLowerCase()
              .includes(debouncedFilmSearch.toLowerCase()) ||
              film.brand
                .toLowerCase()
                .includes(debouncedFilmSearch.toLowerCase()))
          );
        }
      });
    }

    // Apply developer filter
    if (selectedDeveloper) {
      filtered = filtered.filter((combo) => {
        const recipe = customRecipes.find((r) => r.id === combo.id);
        if (!recipe) return false;

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
          return combo.developerId === selectedDeveloper.uuid;
        }
      });
    } else if (debouncedDeveloperSearch.trim()) {
      filtered = filtered.filter((combo) => {
        const recipe = customRecipes.find((r) => r.id === combo.id);
        if (!recipe) return false;

        if (recipe.isCustomDeveloper && recipe.customDeveloper) {
          return (
            recipe.customDeveloper.manufacturer
              .toLowerCase()
              .includes(debouncedDeveloperSearch.toLowerCase()) ||
            recipe.customDeveloper.name
              .toLowerCase()
              .includes(debouncedDeveloperSearch.toLowerCase())
          );
        } else {
          const dev = getDeveloperById(combo.developerId);
          return (
            dev &&
            (dev.name
              .toLowerCase()
              .includes(debouncedDeveloperSearch.toLowerCase()) ||
              dev.manufacturer
                .toLowerCase()
                .includes(debouncedDeveloperSearch.toLowerCase()))
          );
        }
      });
    }

    // Apply additional filters based on server filters
    if (filters.developerType && filters.developerType !== "all") {
      filtered = filtered.filter((combo) => {
        const recipe = customRecipes.find((r) => r.id === combo.id);
        if (!recipe) return false;

        if (recipe.isCustomDeveloper) {
          return recipe.customDeveloper?.type === filters.developerType;
        } else {
          const dev = getDeveloperById(combo.developerId);
          return dev?.type === filters.developerType;
        }
      });
    }

    if (filters.shootingIso && filters.shootingIso !== "all") {
      filtered = filtered.filter(
        (combo) => combo.shootingIso.toString() === filters.shootingIso,
      );
    }

    return filtered;
  }, [
    customRecipesAsCombinations,
    selectedFilm,
    selectedDeveloper,
    debouncedFilmSearch,
    debouncedDeveloperSearch,
    filters,
    customRecipes,
    getFilmById,
    getDeveloperById,
  ]);

  // Combined results for display (server + custom)
  const displayCombinations = useMemo(() => {
    return [...filteredCustomRecipes, ...combinations];
  }, [filteredCustomRecipes, combinations]);

  // Update server filters when search/selection changes
  React.useEffect(() => {
    const newFilters: any = {};

    if (selectedFilm) {
      newFilters.filmSlug = selectedFilm.slug;
    }

    if (selectedDeveloper) {
      newFilters.developerSlug = selectedDeveloper.slug;
    }

    newFilters.sortBy = sortBy;
    newFilters.sortDirection = sortDirection;

    setFilters(newFilters);
  }, [selectedFilm, selectedDeveloper, sortBy, sortDirection, setFilters]);

  // Event handlers
  const handleSort = useCallback(
    (newSortBy: string) => {
      if (newSortBy === sortBy) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(newSortBy);
        setSortDirection("asc");
      }
    },
    [sortBy],
  );

  const handleClearFilters = useCallback(() => {
    setSelectedFilm(null);
    setSelectedDeveloper(null);
    setFilmSearch("");
    setDeveloperSearch("");
    clearFilters();
  }, [clearFilters]);

  const handleRecipePress = useCallback(
    (combination: Combination, isCustom: boolean) => {
      if (isCustom) {
        const customRecipe = customRecipes.find((r) => r.id === combination.id);
        if (customRecipe) {
          setSelectedCustomRecipe(customRecipe);
          setSelectedCombination(null);
        }
      } else {
        setSelectedCombination(combination);
        setSelectedCustomRecipe(null);
      }
    },
    [customRecipes],
  );

  const isCustomRecipe = useCallback(
    (combination: Combination) => {
      return customRecipes.some((r) => r.id === combination.id);
    },
    [customRecipes],
  );

  const getCustomRecipeFilm = useCallback(
    (recipeId: string) => {
      const recipe = customRecipes.find((r) => r.id === recipeId);
      if (!recipe) return undefined;

      if (recipe.isCustomFilm && recipe.customFilm) {
        // Return a Film-like object for custom films
        return {
          uuid: recipe.id,
          name: recipe.customFilm.name,
          brand: recipe.customFilm.brand,
          slug: recipe.id,
        } as Film;
      } else {
        return getFilmById(recipe.filmId);
      }
    },
    [customRecipes, getFilmById],
  );

  const getCustomRecipeDeveloper = useCallback(
    (recipeId: string) => {
      const recipe = customRecipes.find((r) => r.id === recipeId);
      if (!recipe) return undefined;

      if (recipe.isCustomDeveloper && recipe.customDeveloper) {
        // Return a Developer-like object for custom developers
        return {
          uuid: recipe.id,
          name: recipe.customDeveloper.name,
          manufacturer: recipe.customDeveloper.manufacturer,
          slug: recipe.id,
          type: recipe.customDeveloper.type,
          dilutions: [],
        } as Developer;
      } else {
        return getDeveloperById(recipe.developerId);
      }
    },
    [customRecipes, getDeveloperById],
  );

  // Handle force refresh
  const handleForceRefresh = useCallback(() => {
    refresh();
    forceRefreshCustom();
  }, [refresh, forceRefreshCustom]);

  // Get available options for filters
  const getAvailableDilutions = useCallback(() => {
    if (!selectedDeveloper) return [];

    const dilutions = selectedDeveloper.dilutions || [];
    return [
      { label: "All Dilutions", value: "all" },
      ...dilutions.map((d) => ({ label: d.dilution, value: d.dilution })),
    ];
  }, [selectedDeveloper]);

  const getAvailableISOs = useCallback(() => {
    if (!selectedFilm) return [];

    // Get unique ISOs from combinations for this film
    const filmCombinations = combinations.filter(
      (c) => c.filmStockId === selectedFilm.uuid,
    );
    const isos = [...new Set(filmCombinations.map((c) => c.shootingIso))].sort(
      (a, b) => a - b,
    );

    return [
      { label: "All ISOs", value: "all" },
      ...isos.map((iso) => ({ label: iso.toString(), value: iso.toString() })),
    ];
  }, [selectedFilm, combinations]);

  if (isInitialLoading) {
    return (
      <CalculatorLayout title="Development Recipes">
        <Box
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Spinner size="large" color={developmentTint} />
          <Text style={{ marginTop: 16, color: textColor }}>
            Loading recipes...
          </Text>
        </Box>
      </CalculatorLayout>
    );
  }

  if (error) {
    return (
      <CalculatorLayout title="Development Recipes">
        <Box
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{ color: textColor, textAlign: "center", marginBottom: 16 }}
          >
            Error loading recipes: {error.message}
          </Text>
          <Button onPress={handleForceRefresh}>
            <ButtonText>Retry</ButtonText>
          </Button>
        </Box>
      </CalculatorLayout>
    );
  }

  return (
    <CalculatorLayout title="Development Recipes">
      <VStack space="lg" style={{ flex: 1 }}>
        {/* Info Section */}
        <InfoSection>
          <InfoSubtitle>Film Development Recipes</InfoSubtitle>
          <InfoText>
            Find proven development times and temperatures for black and white
            film combinations.
          </InfoText>
          <InfoList
            items={[
              "Search by film stock and developer",
              "Filter by shooting ISO and dilution",
              "Sort by development time or temperature",
              "Add your own custom recipes",
            ]}
          />
        </InfoSection>

        {/* Search and Filters */}
        <RecipeSearchFilters
          filmSearch={filmSearch}
          developerSearch={developerSearch}
          selectedFilm={selectedFilm}
          selectedDeveloper={selectedDeveloper}
          developerTypeFilter={filters.developerType || "all"}
          dilutionFilter={filters.dilution || "all"}
          isoFilter={filters.shootingIso || "all"}
          allFilms={allFilms}
          allDevelopers={allDevelopers}
          setFilmSearch={setFilmSearch}
          setDeveloperSearch={setDeveloperSearch}
          setSelectedFilm={setSelectedFilm}
          setSelectedDeveloper={setSelectedDeveloper}
          setDeveloperTypeFilter={(value) =>
            setFilters({ developerType: value })
          }
          setDilutionFilter={(value) => setFilters({ dilution: value })}
          setIsoFilter={(value) => setFilters({ shootingIso: value })}
          clearFilters={handleClearFilters}
          getAvailableDilutions={getAvailableDilutions}
          getAvailableISOs={getAvailableISOs}
          onOpenFilmModal={() => setShowMobileFilmModal(true)}
          onOpenDeveloperModal={() => setShowMobileDeveloperModal(true)}
        />

        {/* Results */}
        <RecipeResultsView
          totalItems={totalItems + filteredCustomRecipes.length}
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          paginatedCombinations={displayCombinations}
          viewMode={viewMode}
          showCustomRecipes={showCustomRecipes}
          customRecipesCount={filteredCustomRecipes.length}
          isLoading={isLoading}
          setViewMode={setViewMode}
          setShowCustomRecipes={setShowCustomRecipes}
          goToPage={goToPage}
          goToNext={goToNext}
          goToPrevious={goToPrevious}
          onForceRefresh={handleForceRefresh}
          onNewCustomRecipe={() => setShowCustomRecipeForm(true)}
          onRecipePress={handleRecipePress}
          onSort={handleSort}
          getFilmById={getFilmById}
          getDeveloperById={getDeveloperById}
          getCustomRecipeFilm={getCustomRecipeFilm}
          getCustomRecipeDeveloper={getCustomRecipeDeveloper}
          isCustomRecipe={isCustomRecipe}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      </VStack>

      {/* Mobile Search Modals */}
      {!isDesktop && (
        <>
          <SearchDropdown
            variant="modal"
            isOpen={showMobileFilmModal}
            onClose={() => setShowMobileFilmModal(false)}
            items={allFilms.map((film) => ({
              id: film.uuid,
              title: film.name,
              subtitle: film.brand,
            }))}
            onItemSelect={(item) => {
              const film = allFilms.find((f) => f.uuid === item.id);
              if (film) {
                setSelectedFilm(film);
                setShowMobileFilmModal(false);
              }
            }}
            title="Select Film"
            searchPlaceholder="Search films..."
          />

          <SearchDropdown
            variant="modal"
            isOpen={showMobileDeveloperModal}
            onClose={() => setShowMobileDeveloperModal(false)}
            items={allDevelopers.map((dev) => ({
              id: dev.uuid,
              title: dev.name,
              subtitle: dev.manufacturer,
            }))}
            onItemSelect={(item) => {
              const developer = allDevelopers.find((d) => d.uuid === item.id);
              if (developer) {
                setSelectedDeveloper(developer);
                setShowMobileDeveloperModal(false);
              }
            }}
            title="Select Developer"
            searchPlaceholder="Search developers..."
          />
        </>
      )}

      {/* Recipe Detail Modals */}
      {selectedCombination && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCombination(null)}
          {...getRecipeDetailModalConfig()}
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalCloseButton>
              <X size={24} color={textColor} />
            </ModalCloseButton>
            <ModalHeader />
            <ModalBody>
              <RecipeDetail
                combination={selectedCombination}
                film={getFilmById(selectedCombination.filmStockId)}
                developer={getDeveloperById(selectedCombination.developerId)}
                onClose={() => setSelectedCombination(null)}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {selectedCustomRecipe && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCustomRecipe(null)}
          {...getCustomRecipeDetailModalConfig()}
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalCloseButton>
              <X size={24} color={textColor} />
            </ModalCloseButton>
            <ModalHeader />
            <ModalBody>
              <RecipeDetail
                combination={null}
                customRecipe={selectedCustomRecipe}
                film={getCustomRecipeFilm(selectedCustomRecipe.id)}
                developer={getCustomRecipeDeveloper(selectedCustomRecipe.id)}
                onClose={() => setSelectedCustomRecipe(null)}
                onEdit={() => {
                  setEditingCustomRecipe(selectedCustomRecipe);
                  setSelectedCustomRecipe(null);
                  setShowCustomRecipeForm(true);
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Custom Recipe Form */}
      {showCustomRecipeForm && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowCustomRecipeForm(false);
            setEditingCustomRecipe(undefined);
          }}
          {...getRecipeFormModalConfig()}
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalCloseButton>
              <X size={24} color={textColor} />
            </ModalCloseButton>
            <ModalHeader />
            <ModalBody>
              <CustomRecipeForm
                films={allFilms}
                developers={allDevelopers}
                editingRecipe={editingCustomRecipe}
                onSave={(recipe) => {
                  addCustomRecipe(recipe);
                  setShowCustomRecipeForm(false);
                  setEditingCustomRecipe(undefined);
                }}
                onCancel={() => {
                  setShowCustomRecipeForm(false);
                  setEditingCustomRecipe(undefined);
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </CalculatorLayout>
  );
}

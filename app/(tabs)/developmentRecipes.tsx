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
import {
  RecipeDetail,
  CustomRecipeForm,
  RecipeSearchContainer,
  RecipeDisplayContainer,
} from "@/components/development-recipes";
import {
  getRecipeDetailModalConfig,
  getCustomRecipeDetailModalConfig,
  getRecipeFormModalConfig,
} from "@/components/development-recipes/ModalStyles";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useServerDevelopmentRecipes } from "@/hooks/useServerDevelopmentRecipes";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { useRecipeUtilities } from "@/hooks/useRecipeUtilities";
import { useCustomRecipeManagement } from "@/hooks/useCustomRecipeManagement";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";
import type { CustomRecipe } from "@/types/customRecipeTypes";

/**
 * Development Recipes component with server-side pagination
 * Optimized for large datasets with improved performance
 */
export default function DevelopmentRecipes() {
  // Server-side data loading with pagination
  const serverHook = useServerDevelopmentRecipes({
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

  // Recipe utilities hook
  const recipeUtils = useRecipeUtilities(
    serverHook.allFilms,
    serverHook.allDevelopers,
  );

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

  // Search state
  const [filmSearch, setFilmSearch] = useState("");
  const [developerSearch, setDeveloperSearch] = useState("");
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(
    null,
  );

  // Sort state
  const [sortBy, setSortBy] = useState("filmName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");

  // Custom recipe management
  const customRecipeManagement = useCustomRecipeManagement({
    customRecipes,
    showCustomRecipes,
    selectedFilm,
    selectedDeveloper,
    filmSearch,
    developerSearch,
    filters: serverHook.filters,
    getFilmById: recipeUtils.getFilmById,
    getDeveloperById: recipeUtils.getDeveloperById,
  });

  // Combined results for display (server + custom)
  const displayCombinations = useMemo(() => {
    return [
      ...customRecipeManagement.filteredCustomRecipes,
      ...serverHook.combinations,
    ];
  }, [customRecipeManagement.filteredCustomRecipes, serverHook.combinations]);

  // Update server filters when search/selection changes
  React.useEffect(() => {
    const newFilters: any = {};
    if (selectedFilm) newFilters.filmSlug = selectedFilm.slug;
    if (selectedDeveloper) newFilters.developerSlug = selectedDeveloper.slug;
    newFilters.sortBy = sortBy;
    newFilters.sortDirection = sortDirection;
    serverHook.setFilters(newFilters);
  }, [selectedFilm, selectedDeveloper, sortBy, sortDirection, serverHook]);

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
    serverHook.clearFilters();
  }, [serverHook]);

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

  const handleForceRefresh = useCallback(() => {
    serverHook.refresh();
    forceRefreshCustom();
  }, [serverHook, forceRefreshCustom]);

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
    const filmCombinations = serverHook.combinations.filter(
      (c) => c.filmStockId === selectedFilm.uuid,
    );
    const isos = [...new Set(filmCombinations.map((c) => c.shootingIso))].sort(
      (a, b) => a - b,
    );
    return [
      { label: "All ISOs", value: "all" },
      ...isos.map((iso) => ({ label: iso.toString(), value: iso.toString() })),
    ];
  }, [selectedFilm, serverHook.combinations]);

  if (serverHook.isInitialLoading) {
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

  if (serverHook.error) {
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
            Error loading recipes: {serverHook.error.message}
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
        <InfoSection title="Film Development Recipes">
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

        {/* Search and Filters Container */}
        <RecipeSearchContainer
          filmSearch={filmSearch}
          developerSearch={developerSearch}
          selectedFilm={selectedFilm}
          selectedDeveloper={selectedDeveloper}
          filters={serverHook.filters}
          allFilms={serverHook.allFilms}
          allDevelopers={serverHook.allDevelopers}
          setFilmSearch={setFilmSearch}
          setDeveloperSearch={setDeveloperSearch}
          setSelectedFilm={setSelectedFilm}
          setSelectedDeveloper={setSelectedDeveloper}
          setFilters={serverHook.setFilters}
          showMobileFilmModal={showMobileFilmModal}
          showMobileDeveloperModal={showMobileDeveloperModal}
          setShowMobileFilmModal={setShowMobileFilmModal}
          setShowMobileDeveloperModal={setShowMobileDeveloperModal}
          clearFilters={handleClearFilters}
          getAvailableDilutions={getAvailableDilutions}
          getAvailableISOs={getAvailableISOs}
        />

        {/* Results Display Container */}
        <RecipeDisplayContainer
          totalItems={
            serverHook.totalItems +
            customRecipeManagement.filteredCustomRecipes.length
          }
          currentPage={serverHook.currentPage}
          totalPages={serverHook.totalPages}
          startIndex={serverHook.startIndex}
          endIndex={serverHook.endIndex}
          hasNext={serverHook.hasNext}
          hasPrevious={serverHook.hasPrevious}
          displayCombinations={displayCombinations}
          filteredCustomRecipesCount={
            customRecipeManagement.filteredCustomRecipes.length
          }
          viewMode={viewMode}
          showCustomRecipes={showCustomRecipes}
          isLoading={serverHook.isLoading}
          sortBy={sortBy}
          sortDirection={sortDirection}
          customRecipes={customRecipes}
          getFilmById={recipeUtils.getFilmById}
          getDeveloperById={recipeUtils.getDeveloperById}
          getCustomRecipeFilm={(recipeId) =>
            recipeUtils.getCustomRecipeFilm(recipeId, customRecipes)
          }
          getCustomRecipeDeveloper={(recipeId) =>
            recipeUtils.getCustomRecipeDeveloper(recipeId, customRecipes)
          }
          isCustomRecipe={customRecipeManagement.isCustomRecipe}
          setViewMode={setViewMode}
          setShowCustomRecipes={setShowCustomRecipes}
          goToPage={serverHook.goToPage}
          goToNext={serverHook.goToNext}
          goToPrevious={serverHook.goToPrevious}
          onForceRefresh={handleForceRefresh}
          onNewCustomRecipe={() => setShowCustomRecipeForm(true)}
          onSort={handleSort}
          onRecipePress={handleRecipePress}
        />
      </VStack>

      {/* Recipe Detail Modals */}
      {selectedCombination && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCombination(null)}
          {...getRecipeDetailModalConfig(isDesktop)}
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
                film={recipeUtils.getFilmById(selectedCombination.filmStockId)}
                developer={recipeUtils.getDeveloperById(
                  selectedCombination.developerId,
                )}
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
          {...getCustomRecipeDetailModalConfig(isDesktop)}
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalCloseButton>
              <X size={24} color={textColor} />
            </ModalCloseButton>
            <ModalHeader />
            <ModalBody>
              <RecipeDetail
                combination={
                  customRecipeManagement.customRecipesAsCombinations.find(
                    (c) => c.id === selectedCustomRecipe.id,
                  )!
                }
                film={recipeUtils.getCustomRecipeFilm(
                  selectedCustomRecipe.id,
                  customRecipes,
                )}
                developer={recipeUtils.getCustomRecipeDeveloper(
                  selectedCustomRecipe.id,
                  customRecipes,
                )}
                onClose={() => setSelectedCustomRecipe(null)}
                onEdit={() => {
                  setEditingCustomRecipe(selectedCustomRecipe);
                  setSelectedCustomRecipe(null);
                  setShowCustomRecipeForm(true);
                }}
                isCustomRecipe={true}
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
          {...getRecipeFormModalConfig(isDesktop)}
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalCloseButton>
              <X size={24} color={textColor} />
            </ModalCloseButton>
            <ModalHeader />
            <ModalBody>
              <CustomRecipeForm
                recipe={editingCustomRecipe}
                onClose={() => {
                  setShowCustomRecipeForm(false);
                  setEditingCustomRecipe(undefined);
                }}
                onSave={(recipeId) => {
                  setShowCustomRecipeForm(false);
                  setEditingCustomRecipe(undefined);
                }}
                isDesktop={isDesktop}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </CalculatorLayout>
  );
}

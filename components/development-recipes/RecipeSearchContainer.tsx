import React from "react";
import { Platform } from "react-native";
import { RecipeSearchFilters } from "@/components/development-recipes";
import { MobileSelectionModal } from "@/components/ui/select/MobileSelectionModal";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import type { Film, Developer } from "@/api/dorkroom/types";
import type { ServerRecipeFilters } from "@/hooks/useServerDevelopmentRecipes";

/**
 * Container component for recipe search and filtering
 * Manages search state and filter coordination
 */
interface RecipeSearchContainerProps {
  // Search state
  filmSearch: string;
  developerSearch: string;
  selectedFilm: Film | null;
  selectedDeveloper: Developer | null;

  // Filter state
  filters: ServerRecipeFilters;

  // Data
  allFilms: Film[];
  allDevelopers: Developer[];

  // State setters
  setFilmSearch: (search: string) => void;
  setDeveloperSearch: (search: string) => void;
  setSelectedFilm: (film: Film | null) => void;
  setSelectedDeveloper: (developer: Developer | null) => void;
  setFilters: (filters: Partial<ServerRecipeFilters>) => void;

  // Mobile modal state
  showMobileFilmModal: boolean;
  showMobileDeveloperModal: boolean;
  setShowMobileFilmModal: (show: boolean) => void;
  setShowMobileDeveloperModal: (show: boolean) => void;

  // Actions
  clearFilters: () => void;
  getAvailableDilutions: () => { label: string; value: string }[];
  getAvailableISOs: () => { label: string; value: string }[];
}

export const RecipeSearchContainer: React.FC<RecipeSearchContainerProps> = ({
  filmSearch,
  developerSearch,
  selectedFilm,
  selectedDeveloper,
  filters,
  allFilms,
  allDevelopers,
  setFilmSearch,
  setDeveloperSearch,
  setSelectedFilm,
  setSelectedDeveloper,
  setFilters,
  showMobileFilmModal,
  showMobileDeveloperModal,
  setShowMobileFilmModal,
  setShowMobileDeveloperModal,
  clearFilters,
  getAvailableDilutions,
  getAvailableISOs,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;

  return (
    <>
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
        setDeveloperTypeFilter={(value) => setFilters({ developerType: value })}
        setDilutionFilter={(value) => setFilters({ dilution: value })}
        setIsoFilter={(value) => setFilters({ shootingIso: value })}
        clearFilters={clearFilters}
        getAvailableDilutions={getAvailableDilutions}
        getAvailableISOs={getAvailableISOs}
        onOpenFilmModal={() => setShowMobileFilmModal(true)}
        onOpenDeveloperModal={() => setShowMobileDeveloperModal(true)}
      />

      {/* Mobile Search Modals */}
      {!isDesktop && (
        <>
          <MobileSelectionModal
            type="film"
            isOpen={showMobileFilmModal}
            onClose={() => setShowMobileFilmModal(false)}
            films={allFilms}
            onFilmSelect={(film) => {
              setSelectedFilm(film);
              setShowMobileFilmModal(false);
            }}
          />

          <MobileSelectionModal
            type="developer"
            isOpen={showMobileDeveloperModal}
            onClose={() => setShowMobileDeveloperModal(false)}
            developers={allDevelopers}
            onDeveloperSelect={(developer) => {
              setSelectedDeveloper(developer);
              setShowMobileDeveloperModal(false);
            }}
          />
        </>
      )}
    </>
  );
};

import React, { useState, useMemo, useRef } from "react";
import { Platform, TouchableOpacity } from "react-native";
import { Box, Text, VStack, HStack } from "@gluestack-ui/themed";
import { Filter, X } from "lucide-react-native";

import { FormSection, FormGroup } from "@/components/ui/forms/FormSection";
import { StyledSelect } from "@/components/ui/select/StyledSelect";
import { SearchInput, SearchDropdown } from "@/components/ui/search";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useDebounce } from "@/hooks/useDebounce";
import { DEVELOPER_TYPES } from "@/constants/developmentRecipes";
import type { Film, Developer } from "@/api/dorkroom/types";

interface RecipeSearchFiltersProps {
  // Search state
  filmSearch: string;
  developerSearch: string;
  selectedFilm: Film | null;
  selectedDeveloper: Developer | null;

  // Filter state
  developerTypeFilter: string;
  dilutionFilter: string;
  isoFilter: string;

  // Data
  allFilms: Film[];
  allDevelopers: Developer[];

  // Actions
  setFilmSearch: (value: string) => void;
  setDeveloperSearch: (value: string) => void;
  setSelectedFilm: (film: Film | null) => void;
  setSelectedDeveloper: (developer: Developer | null) => void;
  setDeveloperTypeFilter: (value: string) => void;
  setDilutionFilter: (value: string) => void;
  setIsoFilter: (value: string) => void;
  clearFilters: () => void;

  // Helper functions
  getAvailableDilutions: () => { label: string; value: string }[];
  getAvailableISOs: () => { label: string; value: string }[];

  // Modal handlers for mobile
  onOpenFilmModal: () => void;
  onOpenDeveloperModal: () => void;
}

export const RecipeSearchFilters = React.memo(function RecipeSearchFilters({
  filmSearch,
  developerSearch,
  selectedFilm,
  selectedDeveloper,
  developerTypeFilter,
  dilutionFilter,
  isoFilter,
  allFilms,
  allDevelopers,
  setFilmSearch,
  setDeveloperSearch,
  setSelectedFilm,
  setSelectedDeveloper,
  setDeveloperTypeFilter,
  setDilutionFilter,
  setIsoFilter,
  clearFilters,
  getAvailableDilutions,
  getAvailableISOs,
  onOpenFilmModal,
  onOpenDeveloperModal,
}: RecipeSearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [isFilmSearchFocused, setIsFilmSearchFocused] = useState(false);
  const [isDeveloperSearchFocused, setIsDeveloperSearchFocused] =
    useState(false);

  // Add debouncing to search inputs to prevent excessive filtering operations
  const debouncedFilmSearch = useDebounce(filmSearch, 300);
  const debouncedDeveloperSearch = useDebounce(developerSearch, 300);

  // Add refs and position state for dynamic positioning
  const filmSearchRef = useRef<any>(null);
  const developerSearchRef = useRef<any>(null);
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

  // Film and developer lists for desktop search dropdown (debounced + lazy-loaded for performance)
  const filteredFilms = useMemo(() => {
    if (!isFilmSearchFocused) return [];

    let filtered = allFilms;
    if (debouncedFilmSearch.trim()) {
      filtered = allFilms.filter(
        (film) =>
          film.name.toLowerCase().includes(debouncedFilmSearch.toLowerCase()) ||
          film.brand.toLowerCase().includes(debouncedFilmSearch.toLowerCase()),
      );
    }

    // Limit initial results for better performance - show top 50 results
    return filtered.slice(0, 50);
  }, [allFilms, debouncedFilmSearch, isFilmSearchFocused]);

  const filteredDevelopers = useMemo(() => {
    if (!isDeveloperSearchFocused) return [];

    let filtered = allDevelopers;
    if (debouncedDeveloperSearch.trim()) {
      filtered = allDevelopers.filter(
        (dev) =>
          dev.name
            .toLowerCase()
            .includes(debouncedDeveloperSearch.toLowerCase()) ||
          dev.manufacturer
            .toLowerCase()
            .includes(debouncedDeveloperSearch.toLowerCase()),
      );
    }

    // Limit initial results for better performance - show top 50 results
    return filtered.slice(0, 50);
  }, [allDevelopers, debouncedDeveloperSearch, isDeveloperSearchFocused]);

  // Convert to SearchDropdownItem format
  const filmDropdownItems = useMemo(
    () =>
      filteredFilms.map((film) => ({
        id: film.uuid,
        title: film.name,
        subtitle: film.brand,
      })),
    [filteredFilms],
  );

  const developerDropdownItems = useMemo(
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
          _x: number,
          _y: number,
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
          _x: number,
          _y: number,
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

  return (
    <>
      <FormSection>
        <VStack space="md" style={{ overflow: "visible" }}>
          {/* Search/Selection Fields */}
          <Box>
            <Text
              style={[
                { fontSize: 16, fontWeight: "600", marginBottom: 8 },
                { color: textColor },
              ]}
            >
              {isDesktop ? "Search" : "Select Film & Developer"}
            </Text>

            <Box
              style={[
                { gap: 16 },
                isDesktop && { flexDirection: "row", gap: 16 },
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
                  { flex: 1 },
                  isDesktop && { flex: 1, minWidth: 0 },
                  {
                    overflow: "visible",
                    zIndex: 999999,
                    position: "relative",
                  },
                ]}
                onLayout={handleFilmSearchLayout}
              >
                <Box style={{ position: "relative" }}>
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
                        setTimeout(() => setIsFilmSearchFocused(false), 150);
                      }}
                    />
                  ) : (
                    <SearchInput
                      variant="mobile"
                      type="film"
                      placeholder="Type to search films..."
                      selectedItem={selectedFilm}
                      onPress={onOpenFilmModal}
                      onClear={() => setSelectedFilm(null)}
                    />
                  )}
                </Box>
              </Box>

              <Box
                ref={developerSearchRef}
                style={[
                  { flex: 1 },
                  isDesktop && { flex: 1, minWidth: 0 },
                  {
                    overflow: "visible",
                    zIndex: 999999,
                    position: "relative",
                  },
                ]}
                onLayout={handleDeveloperSearchLayout}
              >
                <Box style={{ position: "relative" }}>
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
                      onPress={onOpenDeveloperModal}
                      onClear={() => setSelectedDeveloper(null)}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Selected Items Display - Desktop only */}
          {isDesktop && (selectedFilm || selectedDeveloper) && (
            <Box style={{ marginTop: 8 }}>
              <HStack
                space="sm"
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={[
                    { fontSize: 16, fontWeight: "600" },
                    { color: textColor },
                  ]}
                >
                  Selected:
                </Text>
                <TouchableOpacity onPress={clearFilters}>
                  <Text
                    style={[
                      { fontSize: 14, fontWeight: "500" },
                      { color: developmentTint },
                    ]}
                  >
                    Clear All
                  </Text>
                </TouchableOpacity>
              </HStack>

              {selectedFilm && (
                <Box
                  style={[
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 8,
                      backgroundColor: "rgba(0,0,0,0.05)",
                      borderRadius: 8,
                      marginBottom: 4,
                    },
                  ]}
                >
                  <Text
                    style={[{ fontSize: 14, flex: 1 }, { color: textColor }]}
                  >
                    Film: {selectedFilm.brand} {selectedFilm.name}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedFilm(null)}>
                    <X size={16} color={textColor} />
                  </TouchableOpacity>
                </Box>
              )}

              {selectedDeveloper && (
                <Box
                  style={[
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 8,
                      backgroundColor: "rgba(0,0,0,0.05)",
                      borderRadius: 8,
                      marginBottom: 4,
                    },
                  ]}
                >
                  <Text
                    style={[{ fontSize: 14, flex: 1 }, { color: textColor }]}
                  >
                    Developer: {selectedDeveloper.manufacturer}{" "}
                    {selectedDeveloper.name}
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
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                padding: 8,
                gap: 8,
              },
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} color={developmentTint} />
            <Text
              style={[
                { fontSize: 14, fontWeight: "500" },
                { color: developmentTint },
              ]}
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

      {/* Desktop Search Dropdowns */}
      {isDesktop && (
        <>
          <SearchDropdown
            variant="desktop"
            isOpen={isFilmSearchFocused}
            onClose={() => setIsFilmSearchFocused(false)}
            items={filmDropdownItems}
            onItemSelect={handleFilmDropdownSelect}
            position="left"
            dynamicPosition={filmSearchPosition}
          />

          <SearchDropdown
            variant="desktop"
            isOpen={isDeveloperSearchFocused}
            onClose={() => setIsDeveloperSearchFocused(false)}
            items={developerDropdownItems}
            onItemSelect={handleDeveloperDropdownSelect}
            position="right"
            dynamicPosition={developerSearchPosition}
          />
        </>
      )}
    </>
  );
});

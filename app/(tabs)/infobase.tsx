import React, { useState, useMemo } from "react";
import { Platform, StyleSheet, FlatList } from "react-native";
import {
  Box,
  Text,
  HStack,
  Button,
  ButtonText,
  Spinner,
} from "@gluestack-ui/themed";
import { Film, FlaskConical, RefreshCw, Grid, List } from "lucide-react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useFilmsData } from "@/hooks/useFilmsData";
import { useDevelopersData } from "@/hooks/useDevelopersData";

import { InfobaseSearch } from "@/components/infobase/InfobaseSearch";
import { InfobaseFilters } from "@/components/infobase/InfobaseFilters";
import { FilmCard } from "@/components/infobase/FilmCard";
import { DeveloperCard } from "@/components/infobase/DeveloperCard";

import type {
  Film as FilmType,
  Developer as DeveloperType,
} from "@/api/dorkroom/types";

type TabType = "films" | "developers";
type ViewMode = "grid" | "list";

export default function InfobaseScreen() {
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<TabType>("films");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "cardBackground");
  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const borderColor = useThemeColor({}, "borderColor");
  const infobaseTint = useThemeColor({}, "infobaseTint");

  // Films data management
  const {
    filteredFilms,
    totalFilms,
    isLoading: filmsLoading,
    error: filmsError,
    searchQuery: filmSearchQuery,
    brandFilter,
    typeFilter,
    availableBrands,
    availableTypes,
    setSearchQuery: setFilmSearchQuery,
    setBrandFilter,
    setTypeFilter,
    clearFilters: clearFilmFilters,
    forceRefresh: refreshFilms,
  } = useFilmsData();

  // Developers data management
  const {
    filteredDevelopers,
    totalDevelopers,
    isLoading: developersLoading,
    error: developersError,
    searchQuery: developerSearchQuery,
    manufacturerFilter,
    typeFilter: developerTypeFilter,
    filmOrPaperFilter,
    availableManufacturers,
    availableTypes: availableDeveloperTypes,
    availableFilmOrPaper,
    setSearchQuery: setDeveloperSearchQuery,
    setManufacturerFilter,
    setTypeFilter: setDeveloperTypeFilter,
    setFilmOrPaperFilter,
    clearFilters: clearDeveloperFilters,
    forceRefresh: refreshDevelopers,
  } = useDevelopersData();

  // Computed values for active tab
  const isLoading = activeTab === "films" ? filmsLoading : developersLoading;
  const error = activeTab === "films" ? filmsError : developersError;
  const searchQuery =
    activeTab === "films" ? filmSearchQuery : developerSearchQuery;
  const setSearchQuery =
    activeTab === "films" ? setFilmSearchQuery : setDeveloperSearchQuery;
  const clearFilters =
    activeTab === "films" ? clearFilmFilters : clearDeveloperFilters;
  const forceRefresh = activeTab === "films" ? refreshFilms : refreshDevelopers;

  // Get grid columns based on screen size
  const getNumColumns = () => {
    if (viewMode === "list") return 1;
    if (width > 1200) return 4;
    if (width > 768) return 3;
    if (width > 480) return 2;
    return 1;
  };

  const numColumns = getNumColumns();

  // Memoized data for performance
  const displayData = useMemo(() => {
    return activeTab === "films" ? filteredFilms : filteredDevelopers;
  }, [activeTab, filteredFilms, filteredDevelopers]);

  const totalCount = activeTab === "films" ? totalFilms : totalDevelopers;
  const displayCount = displayData.length;

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleRefresh = async () => {
    await forceRefresh();
  };

  const renderFilmItem = ({ item }: { item: FilmType }) => (
    <Box style={[styles.cardContainer, { width: `${100 / numColumns}%` }]}>
      <FilmCard
        film={item}
        variant={viewMode === "list" ? "default" : "compact"}
      />
    </Box>
  );

  const renderDeveloperItem = ({ item }: { item: DeveloperType }) => (
    <Box style={[styles.cardContainer, { width: `${100 / numColumns}%` }]}>
      <DeveloperCard
        developer={item}
        variant={viewMode === "list" ? "default" : "compact"}
      />
    </Box>
  );

  const renderContent = () => {
    if (error) {
      return (
        <Box style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>
            Error loading {activeTab}: {error}
          </Text>
          <Button onPress={handleRefresh} style={styles.retryButton}>
            <RefreshCw size={16} color="#fff" />
            <ButtonText style={styles.retryButtonText}>Retry</ButtonText>
          </Button>
        </Box>
      );
    }

    if (isLoading && displayData.length === 0) {
      return (
        <Box style={styles.centerContainer}>
          <Spinner
            size="large"
            color={infobaseTint}
            style={{ marginBottom: 16 }}
          />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading {activeTab}...
          </Text>
        </Box>
      );
    }

    if (displayData.length === 0) {
      return (
        <Box style={styles.centerContainer}>
          <Text style={[styles.noResultsText, { color: textColor }]}>
            No {activeTab} found.
          </Text>
          <Text style={[styles.noResultsSubtext, { color: textSecondary }]}>
            Try adjusting your search terms or filters.
          </Text>
        </Box>
      );
    }

    return (
      <FlatList
        data={displayData}
        renderItem={
          activeTab === "films" ? renderFilmItem : renderDeveloperItem
        }
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={`${activeTab}-${numColumns}`} // Force re-render when columns change
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews={Platform.OS === "android"}
      />
    );
  };

  const tabButtonStyle = (isActive: boolean) => ({
    flex: 1,
    backgroundColor: isActive ? infobaseTint : "transparent",
    borderColor: infobaseTint,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  });

  const tabTextStyle = (isActive: boolean) => ({
    color: isActive ? "#fff" : infobaseTint,
    fontSize: 14,
    fontWeight: "600" as const,
    textAlign: "center" as const,
  });

  return (
    <Box style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <Box style={[styles.header, { borderBottomColor: borderColor }]}>
        <Text style={[styles.title, { color: textColor }]}>
          Film & Developer Infobase
        </Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          Browse comprehensive film and developer information
        </Text>
      </Box>

      {/* Tab Navigation */}
      <Box style={[styles.tabContainer, { backgroundColor: cardBackground }]}>
        <HStack space="xs" style={styles.tabRow}>
          <Button
            style={tabButtonStyle(activeTab === "films")}
            onPress={() => handleTabPress("films")}
          >
            <Film
              size={18}
              color={activeTab === "films" ? "#fff" : infobaseTint}
            />
            <ButtonText style={tabTextStyle(activeTab === "films")}>
              Films ({totalFilms})
            </ButtonText>
          </Button>

          <Button
            style={tabButtonStyle(activeTab === "developers")}
            onPress={() => handleTabPress("developers")}
          >
            <FlaskConical
              size={18}
              color={activeTab === "developers" ? "#fff" : infobaseTint}
            />
            <ButtonText style={tabTextStyle(activeTab === "developers")}>
              Developers ({totalDevelopers})
            </ButtonText>
          </Button>
        </HStack>
      </Box>

      {/* Search and Filters */}
      <Box style={styles.searchContainer}>
        <InfobaseSearch
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
          onClear={() => setSearchQuery("")}
        />

        <InfobaseFilters
          variant={activeTab}
          filmFilters={
            activeTab === "films" ? { brandFilter, typeFilter } : undefined
          }
          availableBrands={availableBrands}
          availableTypes={availableTypes}
          onFilmFiltersChange={
            activeTab === "films"
              ? ({ brandFilter: brand, typeFilter: type }) => {
                  if (brand !== undefined) setBrandFilter(brand);
                  if (type !== undefined) setTypeFilter(type);
                }
              : undefined
          }
          developerFilters={
            activeTab === "developers"
              ? {
                  manufacturerFilter,
                  typeFilter: developerTypeFilter,
                  filmOrPaperFilter,
                }
              : undefined
          }
          availableManufacturers={availableManufacturers}
          availableDeveloperTypes={availableDeveloperTypes}
          availableFilmOrPaper={availableFilmOrPaper}
          onDeveloperFiltersChange={
            activeTab === "developers"
              ? ({
                  manufacturerFilter: manufacturer,
                  typeFilter: type,
                  filmOrPaperFilter: filmOrPaper,
                }) => {
                  if (manufacturer !== undefined)
                    setManufacturerFilter(manufacturer);
                  if (type !== undefined) setDeveloperTypeFilter(type);
                  if (filmOrPaper !== undefined)
                    setFilmOrPaperFilter(filmOrPaper);
                }
              : undefined
          }
          onClearFilters={clearFilters}
        />
      </Box>

      {/* Results Header */}
      <Box style={[styles.resultsHeader, { backgroundColor: cardBackground }]}>
        <HStack space="md" alignItems="center" style={styles.resultsRow}>
          <Text style={[styles.resultsText, { color: textColor }]}>
            {displayCount} of {totalCount} {activeTab}
          </Text>

          <Box style={styles.spacer} />

          {/* View Mode Toggle */}
          <HStack space="xs">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "solid" : "outline"}
              action={viewMode === "grid" ? "primary" : "secondary"}
              onPress={() => setViewMode("grid")}
            >
              <Grid size={16} />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "solid" : "outline"}
              action={viewMode === "list" ? "primary" : "secondary"}
              onPress={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
          </HStack>

          {/* Refresh Button */}
          <Button
            size="sm"
            variant="outline"
            action="secondary"
            onPress={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={16} />
          </Button>
        </HStack>
      </Box>

      {/* Content */}
      <Box style={styles.contentContainer}>{renderContent()}</Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabRow: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  resultsRow: {
    flex: 1,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: "500",
  },
  spacer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  flatListContent: {
    paddingVertical: 8,
  },
  cardContainer: {
    paddingHorizontal: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
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

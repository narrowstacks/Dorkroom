import { useState, useCallback, useMemo, useEffect } from 'react';
import { DorkroomClient } from '@/api/dorkroom/client';
import type { Film, Developer, Combination } from '@/api/dorkroom/types';
import { SORT_OPTIONS } from '@/constants/developmentRecipes';

export interface DevelopmentRecipesState {
  // Search and filter state
  filmSearch: string;
  developerSearch: string;
  colorTypeFilter: string;
  developerTypeFilter: string;
  sortBy: string;
  
  // Selected items
  selectedFilm: Film | null;
  selectedDeveloper: Developer | null;
  
  // Loading and error states
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  
  // Data
  allFilms: Film[];
  allDevelopers: Developer[];
  filteredCombinations: Combination[];
}

export interface DevelopmentRecipesActions {
  // Search and filter actions
  setFilmSearch: (search: string) => void;
  setDeveloperSearch: (search: string) => void;
  setColorTypeFilter: (filter: string) => void;
  setDeveloperTypeFilter: (filter: string) => void;
  setSortBy: (sort: string) => void;
  
  // Selection actions
  setSelectedFilm: (film: Film | null) => void;
  setSelectedDeveloper: (developer: Developer | null) => void;
  
  // Data actions
  loadData: () => Promise<void>;
  clearFilters: () => void;
  
  // Helper functions
  getFilmById: (id: string) => Film | undefined;
  getDeveloperById: (id: string) => Developer | undefined;
  getCombinationsForFilm: (filmId: string) => Combination[];
  getCombinationsForDeveloper: (developerId: string) => Combination[];
}

const client = new DorkroomClient();

export const useDevelopmentRecipes = (): DevelopmentRecipesState & DevelopmentRecipesActions => {
  // State
  const [filmSearch, setFilmSearch] = useState<string>('');
  const [developerSearch, setDeveloperSearch] = useState<string>('');
  const [colorTypeFilter, setColorTypeFilter] = useState<string>('');
  const [developerTypeFilter, setDeveloperTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('filmName');
  
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [allFilms, setAllFilms] = useState<Film[]>([]);
  const [allDevelopers, setAllDevelopers] = useState<Developer[]>([]);
  const [allCombinations, setAllCombinations] = useState<Combination[]>([]);

  // Load data from API
  const loadData = useCallback(async () => {
    if (isLoaded || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await client.loadAll();
      
      const films = client.getAllFilms();
      const developers = client.getAllDevelopers();
      const combinations = client.getAllCombinations();
      
      setAllFilms(films);
      setAllDevelopers(developers);
      setAllCombinations(combinations);
      setIsLoaded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load development data';
      setError(errorMessage);
      console.error('Failed to load development recipes data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading]);

  // Auto-load data on first use
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper functions
  const getFilmById = useCallback((id: string): Film | undefined => {
    return allFilms.find(film => film.id === id || film.uuid === id);
  }, [allFilms]);

  const getDeveloperById = useCallback((id: string): Developer | undefined => {
    return allDevelopers.find(dev => dev.id === id || dev.uuid === id);
  }, [allDevelopers]);

  const getCombinationsForFilm = useCallback((filmId: string): Combination[] => {
    return allCombinations.filter(combo => combo.filmStockId === filmId);
  }, [allCombinations]);

  const getCombinationsForDeveloper = useCallback((developerId: string): Combination[] => {
    return allCombinations.filter(combo => combo.developerId === developerId);
  }, [allCombinations]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilmSearch('');
    setDeveloperSearch('');
    setColorTypeFilter('');
    setDeveloperTypeFilter('');
    setSelectedFilm(null);
    setSelectedDeveloper(null);
    setSortBy('filmName');
  }, []);

  // Filter and sort combinations based on current state
  const filteredCombinations = useMemo(() => {
    let combinations = [...allCombinations];

    // Filter by selected film
    if (selectedFilm) {
      combinations = combinations.filter(combo => combo.filmStockId === selectedFilm.uuid);
    } else if (filmSearch.trim()) {
      // Filter by film search if no specific film selected
      const matchingFilms = allFilms.filter(film =>
        film.name.toLowerCase().includes(filmSearch.toLowerCase()) ||
        film.brand.toLowerCase().includes(filmSearch.toLowerCase())
      );
      const filmIds = matchingFilms.map(film => film.uuid);
      combinations = combinations.filter(combo => filmIds.includes(combo.filmStockId));
    }

    // Filter by color type
    if (colorTypeFilter) {
      const matchingFilms = allFilms.filter(film => film.colorType === colorTypeFilter);
      const filmIds = matchingFilms.map(film => film.uuid);
      combinations = combinations.filter(combo => filmIds.includes(combo.filmStockId));
    }

    // Filter by selected developer
    if (selectedDeveloper) {
      combinations = combinations.filter(combo => combo.developerId === selectedDeveloper.uuid);
    } else if (developerSearch.trim()) {
      // Filter by developer search if no specific developer selected
      const matchingDevelopers = allDevelopers.filter(dev =>
        dev.name.toLowerCase().includes(developerSearch.toLowerCase()) ||
        dev.manufacturer.toLowerCase().includes(developerSearch.toLowerCase())
      );
      const developerIds = matchingDevelopers.map(dev => dev.uuid);
      combinations = combinations.filter(combo => developerIds.includes(combo.developerId));
    }

    // Filter by developer type
    if (developerTypeFilter) {
      const matchingDevelopers = allDevelopers.filter(dev => dev.filmOrPaper === developerTypeFilter);
      const developerIds = matchingDevelopers.map(dev => dev.uuid);
      combinations = combinations.filter(combo => developerIds.includes(combo.developerId));
    }

    // Sort combinations
    combinations.sort((a, b) => {
      switch (sortBy) {
        case 'filmName': {
          const filmA = getFilmById(a.filmStockId);
          const filmB = getFilmById(b.filmStockId);
          const nameA = filmA ? `${filmA.brand} ${filmA.name}` : '';
          const nameB = filmB ? `${filmB.brand} ${filmB.name}` : '';
          return nameA.localeCompare(nameB);
        }
        case 'developerName': {
          const devA = getDeveloperById(a.developerId);
          const devB = getDeveloperById(b.developerId);
          const nameA = devA ? `${devA.manufacturer} ${devA.name}` : '';
          const nameB = devB ? `${devB.manufacturer} ${devB.name}` : '';
          return nameA.localeCompare(nameB);
        }
        case 'timeMinutes':
          return a.timeMinutes - b.timeMinutes;
        case 'temperatureF':
          return a.temperatureF - b.temperatureF;
        case 'shootingIso':
          return a.shootingIso - b.shootingIso;
        default:
          return 0;
      }
    });

    return combinations;
  }, [
    allCombinations,
    allFilms,
    allDevelopers,
    filmSearch,
    developerSearch,
    colorTypeFilter,
    developerTypeFilter,
    selectedFilm,
    selectedDeveloper,
    sortBy,
    getFilmById,
    getDeveloperById,
  ]);

  return {
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
    getCombinationsForFilm,
    getCombinationsForDeveloper,
  };
};
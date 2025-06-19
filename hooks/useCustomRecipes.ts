import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CustomRecipe, CustomRecipeFormData } from '@/types/customRecipeTypes';

const STORAGE_KEY = 'customRecipes';

export const useCustomRecipes = () => {
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load custom recipes from storage
  useEffect(() => {
    const loadRecipes = async () => {
      setIsLoading(true);
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const recipes = JSON.parse(json);
          if (Array.isArray(recipes)) {
            setCustomRecipes(recipes);
          }
        }
      } catch (error) {
        console.warn('Failed to load custom recipes', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, []);

  // Persist recipes to storage
  const persistRecipes = async (recipes: CustomRecipe[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
      setCustomRecipes(recipes);
    } catch (error) {
      console.warn('Failed to save custom recipes', error);
      throw error;
    }
  };

  // Add a new custom recipe
  const addCustomRecipe = useCallback(async (formData: CustomRecipeFormData): Promise<string> => {
    const newRecipe: CustomRecipe = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      filmId: formData.useExistingFilm ? formData.selectedFilmId! : `custom_film_${Date.now()}`,
      developerId: formData.useExistingDeveloper ? formData.selectedDeveloperId! : `custom_dev_${Date.now()}`,
      temperatureF: formData.temperatureF,
      timeMinutes: formData.timeMinutes,
      shootingIso: formData.shootingIso,
      pushPull: formData.pushPull,
      agitationSchedule: formData.agitationSchedule || undefined,
      notes: formData.notes || undefined,
      customDilution: formData.customDilution || undefined,
      isCustomFilm: !formData.useExistingFilm,
      isCustomDeveloper: !formData.useExistingDeveloper,
      customFilm: formData.customFilm,
      customDeveloper: formData.customDeveloper,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      isPublic: formData.isPublic,
    };

    const updatedRecipes = [...customRecipes, newRecipe];
    await persistRecipes(updatedRecipes);
    return newRecipe.id;
  }, [customRecipes]);

  // Update an existing custom recipe
  const updateCustomRecipe = useCallback(async (id: string, formData: CustomRecipeFormData): Promise<void> => {
    const existingRecipe = customRecipes.find(recipe => recipe.id === id);
    if (!existingRecipe) {
      throw new Error('Recipe not found');
    }

    const updatedRecipe: CustomRecipe = {
      ...existingRecipe,
      name: formData.name,
      filmId: formData.useExistingFilm ? formData.selectedFilmId! : existingRecipe.filmId,
      developerId: formData.useExistingDeveloper ? formData.selectedDeveloperId! : existingRecipe.developerId,
      temperatureF: formData.temperatureF,
      timeMinutes: formData.timeMinutes,
      shootingIso: formData.shootingIso,
      pushPull: formData.pushPull,
      agitationSchedule: formData.agitationSchedule || undefined,
      notes: formData.notes || undefined,
      customDilution: formData.customDilution || undefined,
      isCustomFilm: !formData.useExistingFilm,
      isCustomDeveloper: !formData.useExistingDeveloper,
      customFilm: formData.customFilm,
      customDeveloper: formData.customDeveloper,
      dateModified: new Date().toISOString(),
      isPublic: formData.isPublic,
    };

    const updatedRecipes = customRecipes.map(recipe => 
      recipe.id === id ? updatedRecipe : recipe
    );
    await persistRecipes(updatedRecipes);
  }, [customRecipes]);

  // Delete a custom recipe
  const deleteCustomRecipe = useCallback(async (id: string): Promise<void> => {
    const updatedRecipes = customRecipes.filter(recipe => recipe.id !== id);
    await persistRecipes(updatedRecipes);
  }, [customRecipes]);

  // Get a custom recipe by ID
  const getCustomRecipe = useCallback((id: string): CustomRecipe | undefined => {
    return customRecipes.find(recipe => recipe.id === id);
  }, [customRecipes]);

  // Clear all custom recipes
  const clearAllCustomRecipes = useCallback(async (): Promise<void> => {
    await persistRecipes([]);
  }, []);

  return {
    customRecipes,
    isLoading,
    addCustomRecipe,
    updateCustomRecipe,
    deleteCustomRecipe,
    getCustomRecipe,
    clearAllCustomRecipes,
  };
}; 
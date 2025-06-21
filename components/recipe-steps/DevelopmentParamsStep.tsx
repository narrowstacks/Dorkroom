import React, { useEffect, useState } from 'react';
import { VStack, Text } from '@gluestack-ui/themed';
import { FormGroup } from '@/components/FormSection';
import { NumberInput } from '@/components/NumberInput';
import { fahrenheitToCelsius } from '@/utils/githubIssueGenerator';
import type { CustomRecipeFormData } from '@/types/customRecipeTypes';
import type { Film } from '@/api/dorkroom/types';

interface DevelopmentParamsStepProps {
  formData: CustomRecipeFormData;
  updateFormData: (updates: Partial<CustomRecipeFormData>) => void;
  filmOptions: { label: string; value: string }[];
  getFilmById: (id: string) => Film | undefined;
  isDesktop?: boolean;
}

/**
 * DevelopmentParamsStep Component
 * 
 * Third step of the recipe creation process. Handles core development parameters
 * including temperature, time, shooting ISO, and automatic push/pull calculation.
 * 
 * @param formData - Current form data state
 * @param updateFormData - Function to update form data
 * @param filmOptions - Available film options for selection
 * @param getFilmById - Function to get film data by ID
 * @param isDesktop - Whether running on desktop layout
 */
export function DevelopmentParamsStep({
  formData,
  updateFormData,
  filmOptions,
  getFilmById,
  isDesktop = false
}: DevelopmentParamsStepProps) {

  // Local state for raw shooting ISO input to preserve user typing
  const [shootingIsoInput, setShootingIsoInput] = useState<string>(String(formData.shootingIso));

  // Update local input state when formData changes (e.g., when loading existing recipe)
  useEffect(() => {
    setShootingIsoInput(String(formData.shootingIso));
  }, [formData.shootingIso]);

  /**
   * Get the ISO speed of the currently selected or custom film
   */
  const getFilmIso = (): number => {
    if (formData.useExistingFilm && formData.selectedFilmId) {
      const film = getFilmById(formData.selectedFilmId);
      return film?.isoSpeed || 400;
    } else if (!formData.useExistingFilm && formData.customFilm) {
      return formData.customFilm.isoSpeed || 400;
    }
    return 400; // Default fallback
  };

  /**
   * Calculate push/pull in stops based on shooting ISO vs film ISO
   * Returns null if inputs are invalid to prevent calculations with bad data
   */
  const calculatePushPull = (shootingIso: number, filmIso: number): number | null => {
    if (!shootingIso || !filmIso || shootingIso <= 0 || filmIso <= 0) {
      return null; // Return null for invalid cases
    }
    const stops = Math.log2(shootingIso / filmIso);
    // Round to nearest hundredth instead of thirds
    return Math.round(stops * 100) / 100;
  };

  /**
   * Format push/pull value for display
   */
  const formatPushPull = (stops: number | null): string => {
    if (stops === null || stops === 0) return "Normal (0 stops)";
    if (stops > 0) return `Push +${stops} stop${stops === 1 ? '' : 's'}`;
    return `Pull ${stops} stop${stops === -1 ? '' : 's'}`;
  };

  /**
   * Handle shooting ISO input changes with improved validation
   */
  const handleShootingIsoChange = (value: string) => {
    // Always update the display value to preserve user typing
    setShootingIsoInput(value);
    
    // Only update formData if we have a valid number within range
    const numValue = parseFloat(value);
    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 12800)) {
      // Only update formData with valid numbers, not empty strings
      if (value !== '' && !isNaN(numValue)) {
        updateFormData({ shootingIso: numValue });
      }
    }
  };

  // Auto-calculate push/pull when shooting ISO or film selection changes
  useEffect(() => {
    const filmIso = getFilmIso();
    const calculatedPushPull = calculatePushPull(formData.shootingIso, filmIso);
    
    // Only update if we have a valid calculation and it differs from current
    if (calculatedPushPull !== null && calculatedPushPull !== formData.pushPull) {
      updateFormData({ pushPull: calculatedPushPull });
    }
  }, [formData.shootingIso, formData.selectedFilmId, formData.customFilm?.isoSpeed, formData.useExistingFilm, formData.pushPull, getFilmIso, updateFormData]);

  return (
    <VStack space="lg">
      <FormGroup label={`Temperature (°F) - ${fahrenheitToCelsius(formData.temperatureF)}°C`}>
        <NumberInput
          value={String(formData.temperatureF)}
          onChangeText={(value: string) => updateFormData({ temperatureF: parseFloat(value) || 68 })}
          placeholder="68"
        />
      </FormGroup>
      
      <FormGroup label="Development Time (minutes)">
        <NumberInput
          value={String(formData.timeMinutes)}
          onChangeText={(value: string) => updateFormData({ timeMinutes: parseFloat(value) || 7 })}
          placeholder="7"
        />
      </FormGroup>
      
      <FormGroup label="Shooting ISO">
        <NumberInput
          value={shootingIsoInput}
          onChangeText={handleShootingIsoChange}
          placeholder={String(getFilmIso())}
        />
      </FormGroup>
      
      <FormGroup label={`Push/Pull - Film ISO: ${getFilmIso()}`}>
        <Text 
          style={{ 
            fontSize: 16, 
            fontWeight: '500',
            padding: 12,
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            color: formData.pushPull === 0 ? '#666' : formData.pushPull > 0 ? '#d97706' : '#059669'
          }}
        >
          {formatPushPull(formData.pushPull)}
        </Text>
      </FormGroup>
    </VStack>
  );
} 
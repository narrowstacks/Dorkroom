import React, { useEffect, useState, useCallback } from 'react';
import { VStack, Text } from '@gluestack-ui/themed';
import { FormGroup } from '@/components/ui/forms/FormSection';
import { NumberInput } from '@/components/ui/forms/NumberInput';
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

export function DevelopmentParamsStep({
  formData,
  updateFormData,
  filmOptions,
  getFilmById,
  isDesktop = false
}: DevelopmentParamsStepProps) {

  // Local state for raw shooting ISO input
  const [shootingIsoInput, setShootingIsoInput] = useState<string>(String(formData.shootingIso));

  // Resync local input when film selection, film ISO source, or committed shootingIso changes
  useEffect(() => {
    setShootingIsoInput(String(formData.shootingIso));
  }, [
    formData.useExistingFilm,
    formData.selectedFilmId,
    formData.customFilm?.isoSpeed,
    formData.shootingIso,            // ← added here to satisfy ESLint
  ]);

  const getFilmIso = useCallback((): number => {
    if (formData.useExistingFilm && formData.selectedFilmId) {
      const film = getFilmById(formData.selectedFilmId);
      return film?.isoSpeed || 400;
    } else if (!formData.useExistingFilm && formData.customFilm) {
      return formData.customFilm.isoSpeed || 400;
    }
    return 400;
  }, [formData.useExistingFilm, formData.selectedFilmId, formData.customFilm, getFilmById]);

  const calculatePushPull = (shootingIso: number, filmIso: number): number | null => {
    if (!shootingIso || !filmIso || shootingIso <= 0 || filmIso <= 0) {
      return null;
    }
    const stops = Math.log2(shootingIso / filmIso);
    return Math.round(stops * 100) / 100;
  };

  const formatPushPull = (stops: number | null): string => {
    if (stops === null || stops === 0) return "Normal (0 stops)";
    if (stops > 0) return `Push +${stops} stop${stops === 1 ? '' : 's'}`;
    return `Pull ${stops} stop${stops === -1 ? '' : 's'}`;
  };

  // Update only the local text while typing
  const handleShootingIsoChange = (value: string) => {
    setShootingIsoInput(value);
  };

  // Commit to formData when the input loses focus
  const commitShootingIso = () => {
    const numValue = parseFloat(shootingIsoInput);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 12800) {
      updateFormData({ shootingIso: numValue });
    } else {
      setShootingIsoInput(String(formData.shootingIso));
    }
  };

  // Recalculate push/pull once shootingIso (committed) or film changes
  useEffect(() => {
    const filmIso = getFilmIso();
    const calculated = calculatePushPull(formData.shootingIso, filmIso);
    if (calculated !== null && calculated !== formData.pushPull) {
      updateFormData({ pushPull: calculated });
    }
  }, [
    formData.shootingIso,
    formData.selectedFilmId,
    formData.customFilm?.isoSpeed,
    formData.useExistingFilm,
    formData.pushPull,
    getFilmIso,
    updateFormData,
  ]);

  return (
    <VStack space="lg">
      <FormGroup label={`Temperature (°F) - ${fahrenheitToCelsius(formData.temperatureF)}°C`}>
        <NumberInput
          value={String(formData.temperatureF)}
          onChangeText={v => updateFormData({ temperatureF: parseFloat(v) || 68 })}
          placeholder="68"
        />
      </FormGroup>

      <FormGroup label="Development Time (minutes)">
        <NumberInput
          value={String(formData.timeMinutes)}
          onChangeText={v => updateFormData({ timeMinutes: parseFloat(v) || 7 })}
          placeholder="7"
        />
      </FormGroup>

      <FormGroup label="Shooting ISO">
        <NumberInput
          value={shootingIsoInput}
          onChangeText={handleShootingIsoChange}
          onBlur={commitShootingIso}
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
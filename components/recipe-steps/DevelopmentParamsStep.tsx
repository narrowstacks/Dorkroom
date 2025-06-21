import React from 'react';
import { VStack } from '@gluestack-ui/themed';
import { FormGroup } from '@/components/FormSection';
import { StyledSelect } from '@/components/StyledSelect';
import { NumberInput } from '@/components/NumberInput';
import { fahrenheitToCelsius } from '@/utils/githubIssueGenerator';
import type { CustomRecipeFormData } from '@/types/customRecipeTypes';

interface DevelopmentParamsStepProps {
  formData: CustomRecipeFormData;
  updateFormData: (updates: Partial<CustomRecipeFormData>) => void;
  isDesktop?: boolean;
}

const PUSH_PULL_OPTIONS = [
  { label: "-2 stops", value: "-2" },
  { label: "-1 stop", value: "-1" },
  { label: "Normal", value: "0" },
  { label: "+1 stop", value: "1" },
  { label: "+2 stops", value: "2" },
];

/**
 * DevelopmentParamsStep Component
 * 
 * Third step of the recipe creation process. Handles core development parameters
 * including temperature, time, shooting ISO, and push/pull settings.
 * 
 * @param formData - Current form data state
 * @param updateFormData - Function to update form data
 * @param isDesktop - Whether running on desktop layout
 */
export function DevelopmentParamsStep({
  formData,
  updateFormData,
  isDesktop = false
}: DevelopmentParamsStepProps) {
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
          value={String(formData.shootingIso)}
          onChangeText={(value: string) => updateFormData({ shootingIso: parseInt(value) || 400 })}
          placeholder="400"
        />
      </FormGroup>
      
      <FormGroup label="Push/Pull">
        <StyledSelect
          value={formData.pushPull.toString()}
          onValueChange={(value) => updateFormData({ pushPull: parseInt(value) })}
          items={PUSH_PULL_OPTIONS}
        />
      </FormGroup>
    </VStack>
  );
} 
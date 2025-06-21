import React from 'react';
import { Box, Text, Input, InputField, HStack, VStack, Switch } from '@gluestack-ui/themed';
import { FormGroup } from '@/components/FormSection';
import { StyledSelect } from '@/components/StyledSelect';
import { NumberInput } from '@/components/NumberInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { CustomRecipeFormData, CustomFilmData } from '@/types/customRecipeTypes';

interface RecipeIdentityStepProps {
  formData: CustomRecipeFormData;
  updateFormData: (updates: Partial<CustomRecipeFormData>) => void;
  updateCustomFilm: (updates: Partial<CustomFilmData>) => void;
  filmOptions: { label: string; value: string }[];
  isDesktop?: boolean;
}

const FILM_COLOR_TYPES = [
  { label: "Black & White", value: "bw" },
  { label: "Color Negative", value: "color" },
  { label: "Color Slide", value: "slide" },
];

/**
 * RecipeIdentityStep Component
 * 
 * First step of the recipe creation process. Handles recipe naming and film selection.
 * This step focuses on the basic identity of the recipe - what it's called and what film it's for.
 * 
 * @param formData - Current form data state
 * @param updateFormData - Function to update form data
 * @param updateCustomFilm - Function to update custom film data
 * @param filmOptions - Available films for selection dropdown
 * @param isDesktop - Whether running on desktop layout
 */
export function RecipeIdentityStep({
  formData,
  updateFormData,
  updateCustomFilm,
  filmOptions,
  isDesktop = false
}: RecipeIdentityStepProps) {
  const textColor = useThemeColor({}, "text");

  return (
    <VStack space="lg">
      {/* Recipe Name */}
      <FormGroup label="Recipe Name">
        <Input>
          <InputField
            value={formData.name}
            onChangeText={(value) => updateFormData({ name: value })}
            placeholder="Enter recipe name (e.g., 'Tri-X in D-76')"
          />
        </Input>
      </FormGroup>

      {/* Film Section */}
      <VStack space="sm">
        <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
          Film
        </Text>
        
        <HStack style={{ alignItems: 'center', marginBottom: 8 }}>
          <Switch
            value={formData.useExistingFilm}
            onValueChange={(value) => updateFormData({ useExistingFilm: value })}
          />
          <Text style={{ marginLeft: 8, color: textColor, fontSize: 14 }}>
            Use existing film from database
          </Text>
        </HStack>

        {formData.useExistingFilm ? (
          <FormGroup label="Select Film">
            <StyledSelect
              value={formData.selectedFilmId || ''}
              onValueChange={(value) => updateFormData({ selectedFilmId: value })}
              items={filmOptions}
            />
          </FormGroup>
        ) : (
          <VStack space="sm">
            <Box style={{ 
              flexDirection: isDesktop ? 'row' : 'column', 
              gap: isDesktop ? 12 : 8 
            }}>
              <Box style={{ flex: isDesktop ? 1 : undefined }}>
                <FormGroup label="Film Brand">
                  <Input>
                    <InputField
                      value={formData.customFilm?.brand || ''}
                      onChangeText={(value) => updateCustomFilm({ brand: value })}
                      placeholder="e.g., Kodak, Fujifilm, Ilford"
                    />
                  </Input>
                </FormGroup>
              </Box>
              
              <Box style={{ flex: isDesktop ? 1 : undefined }}>
                <FormGroup label="Film Name">
                  <Input>
                    <InputField
                      value={formData.customFilm?.name || ''}
                      onChangeText={(value) => updateCustomFilm({ name: value })}
                      placeholder="e.g., Tri-X 400, HP5 Plus"
                    />
                  </Input>
                </FormGroup>
              </Box>
            </Box>
            
            <Box style={{ 
              flexDirection: isDesktop ? 'row' : 'column', 
              gap: isDesktop ? 12 : 8 
            }}>
              <Box style={{ flex: isDesktop ? 1 : undefined }}>
                <FormGroup label="Film Type">
                  <StyledSelect
                    value={formData.customFilm?.colorType || 'bw'}
                    onValueChange={(value) => updateCustomFilm({ colorType: value as 'bw' | 'color' | 'slide' })}
                    items={FILM_COLOR_TYPES}
                  />
                </FormGroup>
              </Box>
              
              <Box style={{ flex: isDesktop ? 1 : undefined }}>
                <FormGroup label="Box Speed (ISO)">
                  <NumberInput
                    value={String(formData.customFilm?.isoSpeed || 400)}
                    onChangeText={(value) => updateCustomFilm({ isoSpeed: parseFloat(value) || 400 })}
                    placeholder="400"
                  />
                </FormGroup>
              </Box>
            </Box>
            
            <FormGroup label="Grain Structure (Optional)">
              <Input>
                <InputField
                  value={formData.customFilm?.grainStructure || ''}
                  onChangeText={(value) => updateCustomFilm({ grainStructure: value })}
                  placeholder="e.g., Fine, Medium, Coarse"
                />
              </Input>
            </FormGroup>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
} 
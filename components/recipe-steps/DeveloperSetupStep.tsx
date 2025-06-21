import React from 'react';
import { Box, Text, Input, InputField, HStack, VStack, Switch, Button, ButtonText } from '@gluestack-ui/themed';
import { Plus, Trash2 } from 'lucide-react-native';
import { FormGroup } from '@/components/FormSection';
import { StyledSelect } from '@/components/StyledSelect';
import { NumberInput } from '@/components/NumberInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import { normalizeDilution } from '@/utils/dilutionUtils';
import { DEVELOPER_TYPES } from '@/constants/developmentRecipes';
import type { CustomRecipeFormData, CustomDeveloperData } from '@/types/customRecipeTypes';
import type { Developer } from '@/api/dorkroom/types';

interface DeveloperSetupStepProps {
  formData: CustomRecipeFormData;
  updateFormData: (updates: Partial<CustomRecipeFormData>) => void;
  updateCustomDeveloper: (updates: Partial<CustomDeveloperData>) => void;
  developerOptions: Array<{ label: string; value: string }>;
  selectedDeveloper: Developer | null;
  dilutionOptions: Array<{ label: string; value: string }>;
  selectedDilution: string;
  handleDilutionChange: (value: string) => void;
  addDilution: () => void;
  updateDilution: (index: number, field: 'name' | 'dilution', value: string) => void;
  removeDilution: (index: number) => void;
  isDesktop?: boolean;
}

const FILM_OR_PAPER_TYPES = [
  { label: "Film", value: "film" },
  { label: "Paper", value: "paper" },
  { label: "Both", value: "both" },
];

/**
 * DeveloperSetupStep Component
 * 
 * Second step of the recipe creation process. Handles developer selection and configuration.
 * This step manages the complex developer setup including dilutions and custom developer creation.
 * 
 * @param formData - Current form data state
 * @param updateFormData - Function to update form data
 * @param updateCustomDeveloper - Function to update custom developer data
 * @param developerOptions - Available developers for selection dropdown
 * @param selectedDeveloper - Currently selected developer object
 * @param dilutionOptions - Available dilutions for selected developer
 * @param selectedDilution - Currently selected dilution
 * @param handleDilutionChange - Function to handle dilution selection changes
 * @param addDilution - Function to add a new dilution to custom developer
 * @param updateDilution - Function to update a dilution in custom developer
 * @param removeDilution - Function to remove a dilution from custom developer
 * @param isDesktop - Whether running on desktop layout
 */
export function DeveloperSetupStep({
  formData,
  updateFormData,
  updateCustomDeveloper,
  developerOptions,
  selectedDeveloper,
  dilutionOptions,
  selectedDilution,
  handleDilutionChange,
  addDilution,
  updateDilution,
  removeDilution,
  isDesktop = false
}: DeveloperSetupStepProps) {
  const textColor = useThemeColor({}, "text");

  return (
    <VStack space="lg">
      {/* Developer Section */}
      <VStack space="sm">
        <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
          Developer
        </Text>
        
        <HStack style={{ alignItems: 'center', marginBottom: 8 }}>
          <Switch
            value={formData.useExistingDeveloper}
            onValueChange={(value) => updateFormData({ useExistingDeveloper: value })}
          />
          <Text style={{ marginLeft: 8, color: textColor, fontSize: 14 }}>
            Use existing developer from database
          </Text>
        </HStack>

        {formData.useExistingDeveloper ? (
          <VStack space="sm">
            <FormGroup label="Select Developer">
              <StyledSelect
                value={formData.selectedDeveloperId || ''}
                onValueChange={(value) => {
                  updateFormData({ selectedDeveloperId: value });
                }}
                items={developerOptions}
              />
            </FormGroup>
            
            {selectedDeveloper && dilutionOptions.length > 0 && (
              <FormGroup label="Select Dilution">
                <StyledSelect
                  value={selectedDilution}
                  onValueChange={handleDilutionChange}
                  items={dilutionOptions}
                />
              </FormGroup>
            )}
          </VStack>
        ) : (
          <VStack space="sm">
            <Box style={{ 
              flexDirection: isDesktop ? 'row' : 'column', 
              gap: isDesktop ? 12 : 8 
            }}>
              <Box style={{ flex: isDesktop ? 1 : undefined }}>
                <FormGroup label="Developer Manufacturer">
                  <Input>
                    <InputField
                      value={formData.customDeveloper?.manufacturer || ''}
                      onChangeText={(value) => updateCustomDeveloper({ manufacturer: value })}
                      placeholder="e.g., Kodak, Ilford, Adox"
                    />
                  </Input>
                </FormGroup>
              </Box>
              
              <Box style={{ flex: isDesktop ? 1 : undefined }}>
                <FormGroup label="Developer Name">
                  <Input>
                    <InputField
                      value={formData.customDeveloper?.name || ''}
                      onChangeText={(value) => updateCustomDeveloper({ name: value })}
                      placeholder="e.g., D-76, ID-11, Rodinal"
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
                <FormGroup label="Developer Type">
                  <StyledSelect
                    value={formData.customDeveloper?.type || ''}
                    onValueChange={(value) => updateCustomDeveloper({ type: value })}
                    items={DEVELOPER_TYPES}
                  />
                </FormGroup>
              </Box>
              
              <Box style={{ flex: isDesktop ? 1 : undefined }}>
                <FormGroup label="For Use With">
                  <StyledSelect
                    value={formData.customDeveloper?.filmOrPaper || 'film'}
                    onValueChange={(value) => updateCustomDeveloper({ filmOrPaper: value as 'film' | 'paper' | 'both' })}
                    items={FILM_OR_PAPER_TYPES}
                  />
                </FormGroup>
              </Box>
            </Box>

            <Box style={{ 
              flexDirection: isDesktop ? 'row' : 'column', 
              gap: isDesktop ? 12 : 8 
            }}>
              <Box style={{ flex: isDesktop ? 1 : undefined }}>
                <FormGroup label="Working Life (Hours) - Optional">
                  <NumberInput
                    value={String(formData.customDeveloper?.workingLifeHours || '')}
                    onChangeText={(value) => updateCustomDeveloper({ workingLifeHours: parseInt(value) || undefined })}
                    placeholder="24"
                  />
                </FormGroup>
              </Box>
              
              <Box style={{ flex: isDesktop ? 1 : undefined }}>
                <FormGroup label="Stock Life (Months) - Optional">
                  <NumberInput
                    value={String(formData.customDeveloper?.stockLifeMonths || '')}
                    onChangeText={(value) => updateCustomDeveloper({ stockLifeMonths: parseInt(value) || undefined })}
                    placeholder="6"
                  />
                </FormGroup>
              </Box>
            </Box>

            {/* Dilutions */}
            <Box>
              <Text style={{ fontSize: 14, fontWeight: '600', color: textColor, marginBottom: 8 }}>
                Dilutions
              </Text>
              <VStack space="xs">
                {formData.customDeveloper?.dilutions.map((dilution, index) => (
                  <HStack key={index} style={{ alignItems: 'center', gap: 8 }}>
                    <Box style={{ flex: 1 }}>
                      <Input>
                        <InputField
                          value={dilution.name}
                          onChangeText={(value) => updateDilution(index, 'name', value)}
                          placeholder="Name (e.g., Stock)"
                        />
                      </Input>
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Input>
                        <InputField
                          value={dilution.dilution}
                          onChangeText={(value) => updateDilution(index, 'dilution', value)}
                          placeholder="Ratio (e.g., 1+1)"
                        />
                      </Input>
                    </Box>
                    {formData.customDeveloper!.dilutions.length > 1 && (
                      <Button onPress={() => removeDilution(index)} variant="outline" size="sm">
                        <Trash2 size={16} color={textColor} />
                      </Button>
                    )}
                  </HStack>
                ))}
                <Button onPress={addDilution} variant="outline" size="sm" style={{ alignSelf: 'flex-start' }}>
                  <Plus size={16} color={textColor} />
                  <ButtonText>Add Dilution</ButtonText>
                </Button>
              </VStack>
            </Box>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
} 
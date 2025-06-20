import React, { useState, useEffect } from 'react';
import { Platform, ScrollView, Alert, Linking } from 'react-native';
import {
  Box,
  Text,
  Button,
  ButtonText,
  VStack,
  HStack,
  Input,
  InputField,
  Textarea,
  TextareaInput,
  Switch,
} from '@gluestack-ui/themed';
import { X, Plus, Github, Save, Trash2 } from 'lucide-react-native';

import { FormSection, FormGroup } from '@/components/FormSection';
import { StyledSelect } from '@/components/StyledSelect';
import { NumberInput } from '@/components/NumberInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useDevelopmentRecipes } from '@/hooks/useDevelopmentRecipes';
import { useCustomRecipes } from '@/hooks/useCustomRecipes';
import { createRecipeIssue, createFilmIssue, createDeveloperIssue, createIssueUrl, fahrenheitToCelsius } from '@/utils/githubIssueGenerator';
import { DEVELOPER_TYPES } from '@/constants/developmentRecipes';
import { formatDilution, isValidDilution, normalizeDilution } from '@/utils/dilutionUtils';
import type { CustomRecipe, CustomRecipeFormData, CustomFilmData, CustomDeveloperData } from '@/types/customRecipeTypes';
import type { Film, Developer } from '@/api/dorkroom/types';

interface CustomRecipeFormProps {
  recipe?: CustomRecipe; // For editing existing recipes
  onClose: () => void;
  onSave?: (recipeId: string) => void;
}

const FILM_COLOR_TYPES = [
  { label: "Black & White", value: "bw" },
  { label: "Color Negative", value: "color" },
  { label: "Color Slide", value: "slide" },
];

const FILM_OR_PAPER_TYPES = [
  { label: "Film", value: "film" },
  { label: "Paper", value: "paper" },
  { label: "Both", value: "both" },
];

export function CustomRecipeForm({ recipe, onClose, onSave }: CustomRecipeFormProps) {
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const outline = useThemeColor({}, "outline");
  
  const { allFilms, allDevelopers, getFilmById, getDeveloperById } = useDevelopmentRecipes();
  const { addCustomRecipe, updateCustomRecipe, deleteCustomRecipe } = useCustomRecipes();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CustomRecipeFormData>(() => {
    if (recipe) {
      return {
        name: recipe.name,
        useExistingFilm: !recipe.isCustomFilm,
        selectedFilmId: recipe.isCustomFilm ? undefined : recipe.filmId,
        customFilm: recipe.customFilm,
        useExistingDeveloper: !recipe.isCustomDeveloper,
        selectedDeveloperId: recipe.isCustomDeveloper ? undefined : recipe.developerId,
        customDeveloper: recipe.customDeveloper,
        temperatureF: recipe.temperatureF,
        timeMinutes: recipe.timeMinutes,
        shootingIso: recipe.shootingIso,
        pushPull: recipe.pushPull,
        agitationSchedule: recipe.agitationSchedule || '',
        notes: recipe.notes || '',
        customDilution: recipe.customDilution || '',
        isPublic: recipe.isPublic,
      };
    }
    
    return {
      name: '',
      useExistingFilm: true,
      selectedFilmId: undefined,
      customFilm: {
        brand: '',
        name: '',
        isoSpeed: 400,
        colorType: 'bw',
        grainStructure: '',
        description: '',
      },
      useExistingDeveloper: true,
      selectedDeveloperId: undefined,
      customDeveloper: {
        manufacturer: '',
        name: '',
        type: '',
        filmOrPaper: 'film',
        workingLifeHours: undefined,
        stockLifeMonths: undefined,
        notes: '',
        mixingInstructions: '',
        safetyNotes: '',
        dilutions: [{ name: 'Stock', dilution: '1+1' }],
      },
      temperatureF: 68,
      timeMinutes: 7,
      shootingIso: 400,
      pushPull: 0,
      agitationSchedule: '',
      notes: '',
      customDilution: '',
      isPublic: false,
    };
  });

  // Film and developer options for selects
  const filmOptions = [
    { label: "Select a film...", value: "" },
    ...allFilms.map(film => ({
      label: `${film.brand} ${film.name}`,
      value: film.uuid
    }))
  ];

  const developerOptions = [
    { label: "Select a developer...", value: "" },
    ...allDevelopers.map(dev => ({
      label: `${dev.manufacturer} ${dev.name}`,
      value: dev.uuid
    }))
  ];

  const pushPullOptions = [
    { label: "-2 stops", value: "-2" },
    { label: "-1 stop", value: "-1" },
    { label: "Normal", value: "0" },
    { label: "+1 stop", value: "1" },
    { label: "+2 stops", value: "2" },
  ];

  const updateFormData = (updates: Partial<CustomRecipeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateCustomFilm = (updates: Partial<CustomFilmData>) => {
    if (formData.customFilm) {
      updateFormData({
        customFilm: { ...formData.customFilm, ...updates }
      });
    }
  };

  const updateCustomDeveloper = (updates: Partial<CustomDeveloperData>) => {
    if (formData.customDeveloper) {
      updateFormData({
        customDeveloper: { ...formData.customDeveloper, ...updates }
      });
    }
  };

  const addDilution = () => {
    if (formData.customDeveloper) {
      updateCustomDeveloper({
        dilutions: [
          ...formData.customDeveloper.dilutions,
          { name: '', dilution: '' }
        ]
      });
    }
  };

  const updateDilution = (index: number, field: 'name' | 'dilution', value: string) => {
    if (formData.customDeveloper) {
      const newDilutions = [...formData.customDeveloper.dilutions];
      // Normalize dilution values to plus notation
      const processedValue = field === 'dilution' ? normalizeDilution(value) : value;
      newDilutions[index] = { ...newDilutions[index], [field]: processedValue };
      updateCustomDeveloper({ dilutions: newDilutions });
    }
  };

  const removeDilution = (index: number) => {
    if (formData.customDeveloper && formData.customDeveloper.dilutions.length > 1) {
      const newDilutions = formData.customDeveloper.dilutions.filter((_, i) => i !== index);
      updateCustomDeveloper({ dilutions: newDilutions });
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return "Recipe name is required";
    }

    if (formData.useExistingFilm && !formData.selectedFilmId) {
      return "Please select a film";
    }

    if (!formData.useExistingFilm && formData.customFilm) {
      if (!formData.customFilm.brand.trim() || !formData.customFilm.name.trim()) {
        return "Film brand and name are required";
      }
    }

    if (formData.useExistingDeveloper && !formData.selectedDeveloperId) {
      return "Please select a developer";
    }

    if (!formData.useExistingDeveloper && formData.customDeveloper) {
      if (!formData.customDeveloper.manufacturer.trim() || !formData.customDeveloper.name.trim()) {
        return "Developer manufacturer and name are required";
      }
      if (!formData.customDeveloper.type.trim()) {
        return "Developer type is required";
      }
    }

    if (formData.temperatureF < 32 || formData.temperatureF > 120) {
      return "Temperature must be between 32°F and 120°F";
    }

    if (formData.timeMinutes <= 0) {
      return "Development time must be greater than 0";
    }

    if (formData.shootingIso <= 0) {
      return "Shooting ISO must be greater than 0";
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    setIsLoading(true);
    try {
      if (recipe) {
        await updateCustomRecipe(recipe.id, formData);
      } else {
        const newRecipeId = await addCustomRecipe(formData);
        onSave?.(newRecipeId);
      }
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save recipe");
      console.error('Failed to save recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;

    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCustomRecipe(recipe.id);
              onClose();
            } catch (error) {
              Alert.alert("Error", "Failed to delete recipe");
            }
          }
        }
      ]
    );
  };

  const handleSubmitToGitHub = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    // Get film and developer data
    const filmData = formData.useExistingFilm 
      ? getFilmById(formData.selectedFilmId!) 
      : formData.customFilm;
    
    const developerData = formData.useExistingDeveloper 
      ? getDeveloperById(formData.selectedDeveloperId!) 
      : formData.customDeveloper;

    // Create temporary recipe object for issue generation
    const tempRecipe: CustomRecipe = {
      id: recipe?.id || 'temp',
      name: formData.name,
      filmId: formData.selectedFilmId || 'custom',
      developerId: formData.selectedDeveloperId || 'custom',
      temperatureF: formData.temperatureF,
      timeMinutes: formData.timeMinutes,
      shootingIso: formData.shootingIso,
      pushPull: formData.pushPull,
      agitationSchedule: formData.agitationSchedule,
      notes: formData.notes,
      customDilution: formData.customDilution,
      isCustomFilm: !formData.useExistingFilm,
      isCustomDeveloper: !formData.useExistingDeveloper,
      customFilm: formData.customFilm,
      customDeveloper: formData.customDeveloper,
      dateCreated: recipe?.dateCreated || new Date().toISOString(),
      dateModified: new Date().toISOString(),
      isPublic: formData.isPublic,
    };

    // Create GitHub issue
    const issueData = createRecipeIssue(tempRecipe, filmData, developerData, "");
    const githubUrl = createIssueUrl(issueData);

    if (Platform.OS === 'web') {
      window.open(githubUrl, '_blank');
    } else {
      try {
        await Linking.openURL(githubUrl);
      } catch (error) {
        Alert.alert("Error", "Could not open GitHub in browser");
      }
    }
  };

  return (
    <Box style={{ flex: 1, backgroundColor: cardBackground, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box style={{ padding: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: outline }}>
        <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: textColor }}>
            {recipe ? 'Edit Recipe' : 'New Recipe'}
          </Text>
          <Button onPress={onClose} variant="outline" size="sm">
            <X size={16} color={textColor} />
          </Button>
        </HStack>
      </Box>

      {/* Scrollable Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <VStack space="md">
          {/* Basic Info Section */}
          <VStack space="sm">
            {/* Recipe Name */}
            <FormGroup label="Recipe Name">
              <Input>
                <InputField
                  value={formData.name}
                  onChangeText={(value) => updateFormData({ name: value })}
                  placeholder="Enter recipe name"
                />
              </Input>
            </FormGroup>

            {/* Film Selection */}
            <Box>
              <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 8 }}>
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
                  <FormGroup label="Film Brand">
                    <Input>
                      <InputField
                        value={formData.customFilm?.brand || ''}
                        onChangeText={(value) => updateCustomFilm({ brand: value })}
                        placeholder="e.g., Kodak"
                      />
                    </Input>
                  </FormGroup>
                  
                  <FormGroup label="Film Name">
                    <Input>
                      <InputField
                        value={formData.customFilm?.name || ''}
                        onChangeText={(value) => updateCustomFilm({ name: value })}
                        placeholder="e.g., Tri-X 400"
                      />
                    </Input>
                  </FormGroup>
                  
                  <FormGroup label="Film Type">
                    <StyledSelect
                      value={formData.customFilm?.colorType || 'bw'}
                      onValueChange={(value) => updateCustomFilm({ colorType: value as 'bw' | 'color' | 'slide' })}
                      items={FILM_COLOR_TYPES}
                    />
                  </FormGroup>
                  
                  <FormGroup label="Film ISO Speed">
                    <NumberInput
                      value={String(formData.customFilm?.isoSpeed || 400)}
                      onChangeText={(value) => updateCustomFilm({ isoSpeed: parseInt(value) || 400 })}
                      placeholder="400"
                    />
                  </FormGroup>
                  
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
            </Box>

            {/* Developer Selection */}
            <Box>
              <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 8 }}>
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
                <FormGroup label="Select Developer">
                  <StyledSelect
                    value={formData.selectedDeveloperId || ''}
                    onValueChange={(value) => updateFormData({ selectedDeveloperId: value })}
                    items={developerOptions}
                  />
                </FormGroup>
              ) : (
                <VStack space="sm">
                  <FormGroup label="Developer Manufacturer">
                    <Input>
                      <InputField
                        value={formData.customDeveloper?.manufacturer || ''}
                        onChangeText={(value) => updateCustomDeveloper({ manufacturer: value })}
                        placeholder="e.g., Kodak"
                      />
                    </Input>
                  </FormGroup>
                  
                  <FormGroup label="Developer Name">
                    <Input>
                      <InputField
                        value={formData.customDeveloper?.name || ''}
                        onChangeText={(value) => updateCustomDeveloper({ name: value })}
                        placeholder="e.g., D-76"
                      />
                    </Input>
                  </FormGroup>
                  
                  <FormGroup label="Developer Type">
                    <StyledSelect
                      value={formData.customDeveloper?.type || ''}
                      onValueChange={(value) => updateCustomDeveloper({ type: value })}
                      items={DEVELOPER_TYPES}
                    />
                  </FormGroup>
                  
                  <FormGroup label="For Use With">
                    <StyledSelect
                      value={formData.customDeveloper?.filmOrPaper || 'film'}
                      onValueChange={(value) => updateCustomDeveloper({ filmOrPaper: value as 'film' | 'paper' | 'both' })}
                      items={FILM_OR_PAPER_TYPES}
                    />
                  </FormGroup>

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
            </Box>
          </VStack>

          {/* Development Parameters Section */}
          <FormSection>
            <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 12 }}>
              Development Parameters
            </Text>
            
            <VStack space="sm">
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
                  items={pushPullOptions}
                />
              </FormGroup>
              
              <FormGroup label="Custom Dilution (Optional)">
                <Input>
                  <InputField
                    value={formData.customDilution}
                    onChangeText={(value) => updateFormData({ customDilution: normalizeDilution(value) })}
                    placeholder="e.g., 1+1, 1+9, Stock"
                  />
                </Input>
              </FormGroup>
              
              <FormGroup label="Agitation Schedule (Optional)">
                <Textarea>
                  <TextareaInput
                    value={formData.agitationSchedule}
                    onChangeText={(value) => updateFormData({ agitationSchedule: value })}
                    placeholder="e.g., Initial 30s, then 5s every 30s"
                    multiline
                    numberOfLines={3}
                  />
                </Textarea>
              </FormGroup>
              
              <FormGroup label="Notes (Optional)">
                <Textarea>
                  <TextareaInput
                    value={formData.notes}
                    onChangeText={(value) => updateFormData({ notes: value })}
                    placeholder="Additional notes about this recipe"
                    multiline
                    numberOfLines={3}
                  />
                </Textarea>
              </FormGroup>

              {/* Public/GitHub Submission - moved here for better logical flow */}
              <Box style={{ marginTop: 16 }}>
                <HStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <VStack style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }}>
                      Public Recipe
                    </Text>
                    <Text style={{ fontSize: 12, color: textColor, opacity: 0.8 }}>
                      Consider submitting to GitHub for inclusion in the public database
                    </Text>
                  </VStack>
                  <Switch
                    value={formData.isPublic}
                    onValueChange={(value) => updateFormData({ isPublic: value })}
                  />
                </HStack>
              </Box>
            </VStack>
          </FormSection>
        </VStack>
      </ScrollView>

      {/* Fixed Action Buttons at Bottom */}
      <Box style={{ 
        padding: 16, 
        borderTopWidth: 1, 
        borderTopColor: outline,
        backgroundColor: cardBackground
      }}>
        <VStack space="sm">
          <Button 
            onPress={handleSave}
            disabled={isLoading}
            style={{ backgroundColor: developmentTint }}
          >
            <Save size={16} color="#fff" />
            <ButtonText style={{ marginLeft: 8 }}>
              {isLoading ? 'Saving...' : (recipe ? 'Update Recipe' : 'Save Recipe')}
            </ButtonText>
          </Button>

          {formData.isPublic && (
            <Button 
              onPress={handleSubmitToGitHub}
              variant="outline"
              style={{ borderColor: developmentTint }}
            >
              <Github size={16} color={developmentTint} />
              <ButtonText style={{ marginLeft: 8, color: developmentTint }}>
                Submit to GitHub
              </ButtonText>
            </Button>
          )}

          {recipe && (
            <Button 
              onPress={handleDelete}
              variant="outline"
              style={{ borderColor: '#ff4444' }}
            >
              <Trash2 size={16} color="#ff4444" />
              <ButtonText style={{ marginLeft: 8, color: '#ff4444' }}>
                Delete Recipe
              </ButtonText>
            </Button>
          )}
        </VStack>
      </Box>
    </Box>
  );
} 
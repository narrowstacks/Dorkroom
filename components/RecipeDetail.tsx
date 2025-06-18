import React, { useState, useMemo } from "react";
import { StyleSheet, Platform } from "react-native";
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  ButtonText,
  Input,
  InputField,
} from "@gluestack-ui/themed";
import { X, Calculator, Beaker } from "lucide-react-native";

import { FormGroup } from "@/components/FormSection";
import { StyledSelect } from "@/components/StyledSelect";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useChemistryCalculator } from "@/hooks/useChemistryCalculator";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";
import {
  convertToDisplay,
  formatTime,
  PUSH_PULL_LABELS,
} from "@/constants/developmentRecipes";

interface RecipeDetailProps {
  combination: Combination;
  film: Film | undefined;
  developer: Developer | undefined;
  onClose: () => void;
}

export function RecipeDetail({ combination, film, developer, onClose }: RecipeDetailProps) {
  const [showCalculator, setShowCalculator] = useState(false);
  
  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const outline = useThemeColor({}, "outline");
  const inputBackground = useThemeColor({}, "inputBackground");

  const chemistry = useChemistryCalculator();

  // Get film and developer names
  const filmName = film ? `${film.brand} ${film.name}` : "Unknown Film";
  const developerName = developer ? `${developer.manufacturer} ${developer.name}` : "Unknown Developer";

  // Get dilution info
  const dilutionInfo = combination.customDilution || 
    (developer?.dilutions.find(d => d.id === combination.dilutionId)?.dilution) || 
    "Stock";

  // Available dilutions for calculator
  const availableDilutions = useMemo(() => {
    const dilutions = [{ label: "Stock", value: "Stock" }];
    
    if (developer?.dilutions) {
      developer.dilutions.forEach(d => {
        dilutions.push({ label: d.dilution, value: d.dilution });
      });
    }
    
    if (combination.customDilution && 
        !dilutions.find(d => d.value === combination.customDilution)) {
      dilutions.push({ label: combination.customDilution, value: combination.customDilution });
    }
    
    return dilutions;
  }, [developer, combination.customDilution]);

  // Set default dilution when calculator is opened
  React.useEffect(() => {
    if (showCalculator && !chemistry.selectedDilution) {
      chemistry.setSelectedDilution(dilutionInfo);
    }
  }, [showCalculator, chemistry, dilutionInfo]);

  const volumeUnits = [
    { label: "Milliliters (ml)", value: "ml" },
    { label: "Fluid Ounces (fl oz)", value: "oz" },
    { label: "Number of Rolls", value: "rolls" },
  ];

  const filmFormats = [
    { label: "35mm (300ml per roll)", value: "35mm" },
    { label: "120 (500ml per roll)", value: "120" },
  ];

  return (
    <Box style={[styles.container, { backgroundColor: cardBackground, borderColor: outline }]}>
      {/* Header */}
      <Box style={styles.header}>
        <VStack space="xs" style={styles.headerContent}>
          <Text style={[styles.filmName, { color: developmentTint }]} numberOfLines={2}>
            {filmName}
          </Text>
          <Text style={[styles.developerName, { color: textSecondary }]} numberOfLines={2}>
            {developerName}
          </Text>
        </VStack>
        
        <Button variant="ghost" size="sm" onPress={onClose} style={styles.closeButton}>
          <X size={20} color={textColor} />
        </Button>
      </Box>

      {/* Recipe Details */}
      <VStack space="lg" style={styles.content}>
        {/* Basic Parameters */}
        <Box>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Development Parameters</Text>
          
          <Box style={styles.parametersGrid}>
            <Box style={styles.parameterCard}>
              <Text style={[styles.parameterLabel, { color: textSecondary }]}>Development Time</Text>
              <Text style={[styles.parameterValue, { color: textColor }]}>
                {formatTime(combination.timeMinutes)}
              </Text>
            </Box>
            
            <Box style={styles.parameterCard}>
              <Text style={[styles.parameterLabel, { color: textSecondary }]}>Temperature</Text>
              <Text style={[styles.parameterValue, { color: textColor }]}>
                {convertToDisplay(combination.temperatureF)}
              </Text>
            </Box>
            
            <Box style={styles.parameterCard}>
              <Text style={[styles.parameterLabel, { color: textSecondary }]}>Shooting ISO</Text>
              <Text style={[styles.parameterValue, { color: textColor }]}>
                {combination.shootingIso}
              </Text>
            </Box>
            
            <Box style={styles.parameterCard}>
              <Text style={[styles.parameterLabel, { color: textSecondary }]}>Dilution</Text>
              <Text style={[styles.parameterValue, { color: textColor }]}>
                {dilutionInfo}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Push/Pull */}
        {combination.pushPull !== 0 && (
          <Box>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Push/Pull Processing</Text>
            <Text style={[styles.pushPullValue, { color: developmentTint }]}>
              {PUSH_PULL_LABELS[combination.pushPull] || 
               `${combination.pushPull > 0 ? '+' : ''}${combination.pushPull} stops`}
            </Text>
          </Box>
        )}

        {/* Agitation */}
        {combination.agitationSchedule && (
          <Box>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Agitation Schedule</Text>
            <Text style={[styles.detailText, { color: textColor }]}>
              {combination.agitationSchedule}
            </Text>
          </Box>
        )}

        {/* Notes */}
        {combination.notes && (
          <Box>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Notes</Text>
            <Text style={[styles.detailText, { color: textColor }]}>
              {combination.notes}
            </Text>
          </Box>
        )}

        {/* Film Information */}
        {film && (
          <Box>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Film Information</Text>
            <VStack space="xs">
              <Text style={[styles.detailText, { color: textColor }]}>
                <Text style={{ fontWeight: '600' }}>ISO Speed:</Text> {film.isoSpeed}
              </Text>
              <Text style={[styles.detailText, { color: textColor }]}>
                <Text style={{ fontWeight: '600' }}>Type:</Text> {film.colorType}
              </Text>
              {film.grainStructure && (
                <Text style={[styles.detailText, { color: textColor }]}>
                  <Text style={{ fontWeight: '600' }}>Grain:</Text> {film.grainStructure}
                </Text>
              )}
            </VStack>
          </Box>
        )}

        {/* Developer Information */}
        {developer && (
          <Box>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Developer Information</Text>
            <VStack space="xs">
              <Text style={[styles.detailText, { color: textColor }]}>
                <Text style={{ fontWeight: '600' }}>Type:</Text> {developer.type}
              </Text>
              <Text style={[styles.detailText, { color: textColor }]}>
                <Text style={{ fontWeight: '600' }}>For:</Text> {developer.filmOrPaper}
              </Text>
              {developer.workingLifeHours && (
                <Text style={[styles.detailText, { color: textColor }]}>
                  <Text style={{ fontWeight: '600' }}>Working Life:</Text> {developer.workingLifeHours} hours
                </Text>
              )}
              {developer.stockLifeMonths && (
                <Text style={[styles.detailText, { color: textColor }]}>
                  <Text style={{ fontWeight: '600' }}>Stock Life:</Text> {developer.stockLifeMonths} months
                </Text>
              )}
            </VStack>
          </Box>
        )}

        {/* Chemistry Calculator Toggle */}
        <Box style={styles.calculatorSection}>
          <Button 
            variant="outline" 
            onPress={() => setShowCalculator(!showCalculator)}
            style={[styles.calculatorToggle, { borderColor: developmentTint }]}
          >
            <Calculator size={16} color={developmentTint} />
            <ButtonText style={[styles.calculatorToggleText, { color: developmentTint }]}>
              {showCalculator ? 'Hide Calculator' : 'Show Chemistry Calculator'}
            </ButtonText>
          </Button>

          {/* Chemistry Calculator */}
          {showCalculator && (
            <VStack space="md" style={[styles.calculator, { backgroundColor: inputBackground }]}>
              <HStack space="sm" style={styles.calculatorHeader}>
                <Beaker size={16} color={developmentTint} />
                <Text style={[styles.calculatorTitle, { color: textColor }]}>
                  Chemistry Calculator
                </Text>
              </HStack>

              <FormGroup label="Volume Unit">
                <StyledSelect
                  value={chemistry.unit}
                  onValueChange={(value) => chemistry.setUnit(value as any)}
                  items={volumeUnits}
                />
              </FormGroup>

              {chemistry.unit === 'rolls' ? (
                <>
                  <FormGroup label="Film Format">
                    <StyledSelect
                      value={chemistry.filmFormat}
                      onValueChange={(value) => chemistry.setFilmFormat(value as any)}
                      items={filmFormats}
                    />
                  </FormGroup>
                  
                  <FormGroup label="Number of Rolls">
                    <Input style={styles.input}>
                      <InputField
                        value={chemistry.numberOfRolls}
                        onChangeText={chemistry.setNumberOfRolls}
                        placeholder="1"
                        keyboardType="numeric"
                      />
                    </Input>
                  </FormGroup>
                </>
              ) : (
                <FormGroup label={`Total Volume (${chemistry.unit})`}>
                  <Input style={styles.input}>
                    <InputField
                      value={chemistry.totalVolume}
                      onChangeText={chemistry.setTotalVolume}
                      placeholder={chemistry.unit === 'ml' ? '500' : '16.9'}
                      keyboardType="numeric"
                    />
                  </Input>
                </FormGroup>
              )}

              <FormGroup label="Dilution Ratio">
                <StyledSelect
                  value={chemistry.selectedDilution || ''}
                  onValueChange={(value) => chemistry.setSelectedDilution(value || null)}
                  items={availableDilutions}
                />
              </FormGroup>

              {/* Results */}
              {chemistry.calculation && (
                <Box style={[styles.calculationResults, { borderColor: outline }]}>
                  <Text style={[styles.resultsTitle, { color: textColor }]}>Recipe:</Text>
                  
                  <VStack space="xs">
                    <HStack style={styles.resultRow}>
                      <Text style={[styles.resultLabel, { color: textSecondary }]}>
                        Total Volume:
                      </Text>
                      <Text style={[styles.resultValue, { color: textColor }]}>
                        {chemistry.calculation.totalVolumeDisplay}
                      </Text>
                    </HStack>
                    
                    <HStack style={styles.resultRow}>
                      <Text style={[styles.resultLabel, { color: textSecondary }]}>
                        Developer:
                      </Text>
                      <Text style={[styles.resultValue, { color: developmentTint }]}>
                        {chemistry.calculation.developerVolumeDisplay}
                      </Text>
                    </HStack>
                    
                    <HStack style={styles.resultRow}>
                      <Text style={[styles.resultLabel, { color: textSecondary }]}>
                        Water:
                      </Text>
                      <Text style={[styles.resultValue, { color: textColor }]}>
                        {chemistry.calculation.waterVolumeDisplay}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Errors */}
              {chemistry.errors.length > 0 && (
                <Box style={styles.errorContainer}>
                  {chemistry.errors.map((error, index) => (
                    <Text key={index} style={styles.errorText}>
                      {error}
                    </Text>
                  ))}
                </Box>
              )}

              <Button variant="ghost" onPress={chemistry.reset} style={styles.resetButton}>
                <ButtonText style={[styles.resetButtonText, { color: textSecondary }]}>
                  Reset Calculator
                </ButtonText>
              </Button>
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  filmName: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  developerName: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    padding: 0,
    minHeight: 32,
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  parametersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  parameterCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  parameterLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  pushPullValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },
  calculatorSection: {
    marginTop: 8,
  },
  calculatorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  calculatorToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  calculator: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  calculatorHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderRadius: 8,
  },
  calculationResults: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
  },
  resetButton: {
    alignSelf: 'center',
  },
  resetButtonText: {
    fontSize: 12,
  },
});
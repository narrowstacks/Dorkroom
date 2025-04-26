import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, Platform, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Assuming this is installed

// Add window dimension hook
const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

export default function SettingsScreen() {
  const [selectedTheme, setSelectedTheme] = useState('system');
  const [selectedLengthUnit, setSelectedLengthUnit] = useState('inches');
  const [selectedVolumeUnit, setSelectedVolumeUnit] = useState('ml');

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  // Placeholder functions for settings changes (updated to use setters)
  const handleThemeChange = (value: string) => {
    console.log('Theme changed to:', value);
    setSelectedTheme(value);
    // Logic to change theme will go here
  };

  const handleLengthUnitChange = (value: string) => {
    console.log('Length unit changed to:', value);
    setSelectedLengthUnit(value);
    // Logic to change length unit will go here
  };

  const handleVolumeUnitChange = (value: string) => {
    console.log('Volume unit changed to:', value);
    setSelectedVolumeUnit(value);
    // Logic to change volume unit will go here
  };

  // Theme options
  const themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
    { label: 'High Contrast', value: 'highContrast' },
    { label: 'Darkroom', value: 'darkroom' },
  ];

  return (
    <ScrollView>
      {/* Use bg-neutral-50 dark:bg-black for themed background */}
      <View className="flex-1 p-4 items-center bg-neutral-50 dark:bg-black">
        {/* Wrapper View for content centering/width restriction */}
        <View className="w-full max-w-[600px]">
          <Text className="mb-6 text-center text-2xl font-bold dark:text-white">Settings</Text>

          {/* Appearance Section */}
          {/* Use bg-white dark:bg-neutral-900 for themed section background */}
          <View className="mb-6 w-full p-4 rounded-lg bg-white dark:bg-neutral-900 shadow">
            <Text className="text-lg font-bold mb-3 dark:text-white">Appearance</Text>
            <Text className="text-base mb-2 dark:text-neutral-300">Theme</Text>
            {/* Apply theme-aware border and background colors */}
            <View className="border border-neutral-300 dark:border-neutral-700 rounded-lg mb-4 bg-white dark:bg-neutral-800">
              <Picker
                selectedValue={selectedTheme}
                onValueChange={(itemValue) => handleThemeChange(itemValue)}
                // Picker styles might need platform-specific handling or custom components for better NativeWind integration
                // Basic height to ensure visibility
                style={{ height: 50, width: '100%' }}
                // Add itemStyle for potential text color control (might not work consistently across platforms)
                itemStyle={{ color: Platform.OS === 'ios' ? 'black' : undefined }} // Example for iOS text color
                // Consider adding dropdownIconColor prop if needed
              >
                {themeOptions.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Units Section */}
          {/* Use bg-white dark:bg-neutral-900 for themed section background */}
          <View className="mb-6 w-full p-4 rounded-lg bg-white dark:bg-neutral-900 shadow">
            <Text className="text-lg font-bold mb-3 dark:text-white">Units</Text>

            <Text className="text-base mb-2 dark:text-neutral-300">Length</Text>
            {/* Apply theme-aware border colors */}
            <View className="flex-row w-full border border-green-600 dark:border-green-500 rounded-lg overflow-hidden mb-4">
              <Pressable
                className={`flex-1 py-2.5 items-center justify-center ${selectedLengthUnit === 'inches' ? 'bg-green-600 dark:bg-green-500' : ''}`}
                onPress={() => handleLengthUnitChange('inches')}
              >
                <Text className={`text-sm ${selectedLengthUnit === 'inches' ? 'text-white font-bold' : 'text-green-600 dark:text-green-500'}`}>
                  Inches
                </Text>
              </Pressable>
              <Pressable
                className={`flex-1 py-2.5 items-center justify-center ${selectedLengthUnit === 'mm' ? 'bg-green-600 dark:bg-green-500' : ''}`}
                onPress={() => handleLengthUnitChange('mm')}
              >
                <Text className={`text-sm ${selectedLengthUnit === 'mm' ? 'text-white font-bold' : 'text-green-600 dark:text-green-500'}`}>
                  Millimeters
                </Text>
              </Pressable>
            </View>

            <Text className="text-base mb-2 dark:text-neutral-300">Volume</Text>
            {/* Apply theme-aware border colors */}
            <View className="flex-row w-full border border-green-600 dark:border-green-500 rounded-lg overflow-hidden mb-4">
              <Pressable
                className={`flex-1 py-2.5 items-center justify-center ${selectedVolumeUnit === 'floz' ? 'bg-green-600 dark:bg-green-500' : ''}`}
                onPress={() => handleVolumeUnitChange('floz')}
              >
                <Text className={`text-sm ${selectedVolumeUnit === 'floz' ? 'text-white font-bold' : 'text-green-600 dark:text-green-500'}`}>
                  Fl. Oz / Gallons
                </Text>
              </Pressable>
              <Pressable
                className={`flex-1 py-2.5 items-center justify-center ${selectedVolumeUnit === 'ml' ? 'bg-green-600 dark:bg-green-500' : ''}`}
                onPress={() => handleVolumeUnitChange('ml')}
              >
                <Text className={`text-sm ${selectedVolumeUnit === 'ml' ? 'text-white font-bold' : 'text-green-600 dark:text-green-500'}`}>
                  Milliliters / Liters
                </Text>
              </Pressable>
            </View>
          </View>

          {/* TODO: Add other potential settings sections */}
        </View>
      </View>
    </ScrollView>
  );
} 
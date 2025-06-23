import { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { decodePreset } from '@/utils/presetSharing';
import type { BorderPreset, BorderPresetSettings } from '@/types/borderPresetTypes';

export const useSharedPresetLoader = () => {
  const [loadedPreset, setLoadedPreset] = useState<{ name: string, settings: BorderPresetSettings } | null>(null);
  const url = Linking.useURL();

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      try {
        let encodedData: string | null = null;

        // Web: Check for hash fragment. This is the most common case for web sharing.
        const fragmentIndex = url.indexOf('#');
        if (fragmentIndex !== -1) {
          encodedData = url.substring(fragmentIndex + 1);
        } else {
          // Native: If no fragment, parse as a deep link.
          const parsedUrl = Linking.parse(url);
          
          // Handle custom app scheme (production)
          if (parsedUrl.scheme === 'dorkroom' && parsedUrl.path?.startsWith('border')) {
            // Check for query parameter first
            if (parsedUrl.queryParams?.preset) {
              encodedData = parsedUrl.queryParams.preset as string;
            }
            // Fallback to old path-based format for backwards compatibility
            else if (parsedUrl.path?.startsWith('border/s/')) {
              encodedData = parsedUrl.path.substring('border/s/'.length);
            }
          }
          // Handle Expo Go development scheme
          else if (parsedUrl.scheme === 'exp' && parsedUrl.path?.includes('/--/border')) {
            // Check for query parameter first
            if (parsedUrl.queryParams?.preset) {
              encodedData = parsedUrl.queryParams.preset as string;
            }
            // Fallback to old path-based format for backwards compatibility
            else {
              const pathMatch = parsedUrl.path.match(/\/--\/border\/s\/(.+)$/);
              if (pathMatch) {
                encodedData = pathMatch[1];
              }
            }
          }
        }

        if (encodedData) {
          const decodedPreset = decodePreset(encodedData);
          if (decodedPreset) {
            setLoadedPreset(decodedPreset);
          }
        }
      } catch (error) {
        console.error("Failed to handle shared URL:", error);
      }
    };

    handleUrl(url);

  }, [url]);

  return loadedPreset;
};
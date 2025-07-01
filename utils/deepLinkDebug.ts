import Constants from "expo-constants";
import { generateSharingUrls, getNativeUrl } from "./urlHelpers";

/**
 * Debug helper to test deep link URL generation
 */
export const debugDeepLinking = () => {
  const testEncoded = "Qm9yZGVyJTIwU2V0dGluZ3MtMC0zLTUwLTAtMC04";

  console.log("=== Deep Link Debug Info ===");
  console.log("__DEV__:", __DEV__);
  console.log("Constants.appOwnership:", Constants.appOwnership);
  console.log("Constants.expoConfig?.hostUri:", Constants.expoConfig?.hostUri);

  const urls = generateSharingUrls(testEncoded);
  console.log("Generated URLs:", urls);

  const nativeUrl = getNativeUrl(testEncoded);
  console.log("Native URL:", nativeUrl);

  console.log("Test command for iOS simulator:");
  console.log(`npx uri-scheme open "${nativeUrl}" --ios`);

  console.log("===========================");

  return urls;
};

// For easier console testing
if (__DEV__ && typeof window !== "undefined") {
  (window as any).debugDeepLinking = debugDeepLinking;
}

# URL Sharing Scheme for Border Calculator Presets (V2)

This document outlines the plan for implementing a URL sharing scheme for the Border Calculator presets, supporting both web and native platforms.

## 1. URL Structure

We will support two URL formats to ensure a seamless experience across platforms:

-   **Web URL (for browsers):** The encoded preset data will be appended as a hash fragment.
    -   **Production:** `https://dorkroom.art/border#<encoded_string>`
    -   **Development:** `http://localhost:8081/border#<encoded_string>`

-   **Custom URI (for native app deep linking):** A custom URI scheme will be used for native apps.
    -   `dorkroom://border/s/<encoded_string>`

## 2. Encoding Scheme: Custom Compact Encoding

To keep the URL as short as possible, a custom, hyphen-separated string format will be used. This string will then be Base64 encoded.

**Field Order and Format:**

1.  **`aspectRatio` (Index):** The index from the `ASPECT_RATIOS` array.
2.  **`paperSize` (Index):** The index from the `PAPER_SIZES` array.
3.  **`minBorder` (Integer):** The value multiplied by 100 (e.g., `0.75` becomes `75`).
4.  **`horizontalOffset` (Integer):** The value multiplied by 100.
5.  **`verticalOffset` (Integer):** The value multiplied by 100.
6.  **Boolean Flags (Bitmask):** A single integer representing a bitmask of all boolean values:
    -   `enableOffset` (bit 0)
    -   `ignoreMinBorder` (bit 1)
    -   `showBlades` (bit 2)
    -   `isLandscape` (bit 3)
    -   `isRatioFlipped` (bit 4)
7.  **`customAspectWidth` (Integer, Optional):** Appended if `aspectRatio` is "custom". Multiplied by 100.
8.  **`customAspectHeight` (Integer, Optional):** Appended if `aspectRatio` is "custom". Multiplied by 100.
9.  **`customPaperWidth` (Integer, Optional):** Appended if `paperSize` is "custom". Multiplied by 100.
10. **`customPaperHeight` (Integer, Optional):** Appended if `paperSize` is "custom". Multiplied by 100.

The final string will be Base64 encoded to ensure it is URL-safe.

## 3. Implementation Plan

1.  **Create `utils/presetSharing.ts`:**
    -   This new file will contain the core logic:
        -   `encodePreset(settings: BorderPresetSettings): string`
        -   `decodePreset(encoded: string): BorderPresetSettings | null`

2.  **Modify `app/(tabs)/border.tsx`:**
    -   **Add a "Share" button:** This button's logic will be platform-aware.
        -   On **web**, it will construct the web URL (`/border#data`) and copy it.
        -   On **native**, it will generate the deep link URI (`dorkroom://border/s/data`).
    -   **Create `useSharedPresetLoader` hook:** This hook will handle incoming URLs.
        -   It will use `expo-linking` to get the URL that opened the app.
        -   It will parse the URL for either a hash fragment (web) or the `/s/` path (native).
        -   If data is found, it will be decoded using `decodePreset`.
    -   The main `BorderCalculator` component will use this hook to automatically apply any shared preset on load.

3.  **Install Dependencies:**
    -   Ensure `expo-linking` and `expo-clipboard` are installed and configured.

## 4. Visual Flow

```mermaid
graph TD
    subgraph Encoding
        A[Preset Object] --> B{Encode Preset};
        B --> C[Compact String];
        C -->|Platform.OS === 'web'| D_Web[Construct Web URL: /border#data];
        C -->|Platform.OS !== 'web'| D_Native[Construct Native URI: dorkroom://border/s/data];
        D_Web --> E[URL Copied to Clipboard];
        D_Native --> E;
    end

    subgraph Decoding
        F[User Opens Shared Link] --> G{App Receives URL};
        G --> H{useSharedPresetLoader Hook};
        H --> |Parses Web Hash or Native Path| I{Extract & Decode String};
        I --> J[Preset Object];
        J --> K[Apply Preset to UI];
    end
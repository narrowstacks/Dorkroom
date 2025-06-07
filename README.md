# Dorkroom 📷

Dorkroom is a cross-platform React Native application built with Expo, designed to provide photographers with helpful calculators for darkroom printing, film developing, and other photography related tasks. The main feature is the Print Border Calculator, which helps users determine blade positions on adjustable darkroom easels for various paper sizes and aspect ratios.

## Features

- **Print Border Calculator**: Calculate blade positions for adjustable darkroom easels
- **Print Resizing Calculator**: Calculate exposure adjustments based on print size changes
- **Stop-Based Exposure Calculator**: Calculate exposure adjustments by stops
- **Camera Exposure Calculator**: Calculate equivalent camera exposure settings
- **Reciprocity Calculator**: Calculate reciprocity failure compensation
- **Coming Soon**: Developer dilution calculator, Push/Pull calculator, film roll logging

## Technology Stack

- **Framework**: React Native with Expo SDK
- **Language**: TypeScript
- **Package Manager**: bun (or npm, but bun bundles the webpack much quicker)
- **Runtime**: Node.js
- **Architecture**: Expo Router (File-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native) with Gluestack UI

## Getting Started

1. Install bun if you haven't already:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the app:
   ```bash
   bun run dev
   # or
   bunx expo start
   ```

In the output, you'll find options to open the app in a:
- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Web browser](https://docs.expo.dev/workflow/web/)
- [Expo Go](https://expo.dev/go)

## Project Structure

The project uses Expo Router with file-based routing:

```
app/
  (tabs)/             # Tab navigation layout
    _layout.tsx
    index.tsx         # Home screen
    border.tsx        # Print Border Calculator
    resize.tsx        # Print Resizing Calculator
    exposure.tsx      # Stop-Based Exposure Calculator
    ...etc
  components/         # Shared components
  hooks/              # Custom hooks for calculator logic
  _layout.tsx         # Root layout
```

## Available Scripts

- `bun run dev`: Start the development server
- `bun run ios`: Start the app in iOS simulator
- `bun run android`: Start the app in Android emulator
- `bun run web`: Start the app in web browser
- `bun run build`: Build the web version
- `bun run deploy`: Deploy to Vercel
- `bun test`: Run tests


## Learn More

To learn more about the technologies used in this project:

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Gluestack UI Documentation](https://ui.gluestack.io/)

## Project Status

Dorkroom is in active development. Several calculators are complete, while others are in progress or planned. See the project-tracking directory for detailed status information.

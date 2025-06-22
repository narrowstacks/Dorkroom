# Mobile Border Calculator Refactoring Plan

## Overview

This document outlines the comprehensive plan for refactoring the border calculator interface specifically for mobile devices (native and mobile web). The new design follows the provided HTML mockup while maintaining 100% feature parity with the existing implementation.

## Current State Analysis

### Existing Features to Preserve
- **Border Calculations**: All calculation logic using `useBorderCalculator` hook
- **Preset Management**: Save, load, update, delete, and share presets
- **Aspect Ratio & Paper Size**: Complete selection and custom input functionality
- **Border Settings**: Minimum border slider with validation
- **Offset Functionality**: Horizontal/vertical offsets with ignore min border option
- **Show Blades Toggle**: Easel blade visualization control
- **Orientation Controls**: Landscape/portrait flipping and aspect ratio flipping
- **Warning System**: All existing validation and warning messages
- **Animated Preview**: Current preview component functionality
- **Results Display**: Precise blade position calculations

### Current Structure Issues for Mobile
- Single responsive component handling both desktop and mobile
- Inline controls take up too much screen real estate on mobile
- Results display is less prominent than optimal for mobile use
- Touch targets could be larger and more mobile-friendly

## Target Mobile Design

### Key Design Principles
1. **Mobile-First Interface**: Optimized specifically for touch interactions
2. **Modal-Driven Settings**: Replace inline controls with focused modal experiences
3. **Prominent Results Display**: Large, easy-to-read blade measurements as hero section
4. **Modular Architecture**: Separate components for maintainability
5. **Feature Parity**: No functionality lost in transition

### Main Screen Layout
```
┌─────────────────────────┐
│      Border Calculator   │
├─────────────────────────┤
│   BLADE POSITIONS       │
│  ┌─────┬─────┬─────┬──── │
│  │ L   │ R   │ T   │ B  │
│  │1.0" │7.0" │0.5" │9.5"│
│  └─────┴─────┴─────┴──── │
│  6×9" image on 8×10"     │
├─────────────────────────┤
│    [Compact Preview]     │
├─────────────────────────┤
│ Paper and Image Size  › │
│ Border Size           › │
│ Position & Offsets    › │
│ Advanced Options      › │
├─────────────────────────┤
│[Copy][Share][Preset]    │
└─────────────────────────┘
```

## Component Architecture

### New File Structure
```
components/border-calculator/mobile/
├── index.ts
├── BladeResultsDisplay.tsx       # Hero section with 4 blade boxes
├── CompactPreview.tsx            # Smaller preview for main view
├── SettingsButton.tsx            # Reusable settings button
├── ActionButtons.tsx             # Bottom action buttons
├── hooks/
│   ├── useMobileModalState.tsx   # Modal visibility management
│   └── useResponsiveDetection.tsx # Mobile vs desktop detection
└── modals/
    ├── index.ts
    ├── PaperSizeModal.tsx        # Paper and image size settings
    ├── BorderSizeModal.tsx       # Minimum border size settings
    ├── PositionOffsetsModal.tsx  # Position offsets and advanced positioning
    ├── AdvancedOptionsModal.tsx  # Other advanced features (show blades, etc.)
    ├── CopyResultsModal.tsx      # Results display and sharing
    └── PresetModal.tsx           # Preset management
```

### Component Interfaces

#### BladeResultsDisplay
```typescript
interface BladeResultsProps {
  calculation: BorderCalculation;
  paperSize: string;
  aspectRatio: string;
}
```
- Displays 4 prominent boxes for Left, Right, Top, Bottom measurements
- Shows image dimensions and paper info
- Matches the hero section from HTML mockup

#### CompactPreview
```typescript
interface CompactPreviewProps {
  calculation: BorderCalculation;
  showBlades: boolean;
  onOrientationFlip: () => void;
  onAspectRatioFlip: () => void;
}
```
- Smaller preview component for main screen
- Includes orientation and aspect ratio flip buttons
- Contained within proper bounds

#### SettingsButton
```typescript
interface SettingsButtonProps {
  label: string;
  value: string;
  onPress: () => void;
  icon?: React.ComponentType;
}
```
- Reusable button component for opening modals
- Shows current value and arrow indicator
- Consistent styling across all settings

#### ActionButtons
```typescript
interface ActionButtonsProps {
  onCopyResults: () => void;
  onShare: () => void;
  onSavePreset: () => void;
}
```
- Three primary action buttons at bottom
- Copy results, share setup, save preset functionality

## Modal Organization

### 1. Paper Size Modal
**Purpose**: Fundamental image and paper size settings
- Aspect ratio selection dropdown
- Custom aspect ratio inputs (width/height)
- Paper size selection dropdown
- Custom paper size inputs (width/height in inches)
- Orientation flip buttons
- Apply/Cancel actions

### 2. Border Size Modal
**Purpose**: Minimum border size settings
- Minimum border slider with live preview
- Live blade position updates as user adjusts
- Preview component showing changes in real-time
- Current border size display
- Apply/Cancel actions

### 3. Position & Offsets Modal
**Purpose**: Image positioning and offset controls
- Enable offsets toggle
- Horizontal offset slider (when enabled)
- Vertical offset slider (when enabled)  
- Ignore min border toggle
- Warning display for invalid offset combinations
- Live preview showing offset effects
- Apply/Cancel actions

### 4. Advanced Options Modal
**Purpose**: Other advanced features and display options
- Show easel blades toggle
- Any future advanced features
- Apply/Cancel actions

### 5. Copy Results Modal
**Purpose**: Results display and sharing functionality
- Large, formatted blade positions display
- Setup summary (image size, paper size, border info)
- Copy blade positions button
- Copy full setup button
- Share setup functionality
- Preview of copy format

### 6. Preset Modal
**Purpose**: Preset management functionality
- Preset selection dropdown (user + default presets)
- Preset name input field
- Save new preset button
- Update existing preset button
- Delete preset button
- Share preset functionality

## State Management Strategy

### Existing Hook Preservation
- Continue using `useBorderCalculator` for all calculation logic
- Preserve `useBorderPresets` for preset management
- Maintain all existing validation and warning systems

### New State Requirements
```typescript
// Modal visibility management
const useMobileModalState = () => {
  const [paperSizeModalVisible, setPaperSizeModalVisible] = useState(false);
  const [borderSizeModalVisible, setBorderSizeModalVisible] = useState(false);
  const [positionOffsetsModalVisible, setPositionOffsetsModalVisible] = useState(false);
  const [advancedOptionsModalVisible, setAdvancedOptionsModalVisible] = useState(false);
  const [copyResultsModalVisible, setCopyResultsModalVisible] = useState(false);
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  
  // Modal management functions
  return {
    // ... visibility states and setters
  };
};
```

### Data Flow
1. Main component manages modal visibility
2. Modals receive current settings and callback functions
3. Settings changes flow through existing hook functions
4. Live preview updates in modals where appropriate
5. Apply/Cancel pattern for complex modals

## Implementation Plan

### Phase 1: Foundation (Day 1)
1. ✅ Create plan documentation
2. Create mobile component directory structure
3. Set up main mobile border calculator file
4. Create responsive detection hook

### Phase 2: Core Components (Day 2-3)
1. Implement `BladeResultsDisplay` component
2. Create `CompactPreview` component
3. Build `SettingsButton` component
4. Develop `ActionButtons` component
5. Create modal state management hook

### Phase 3: Modal Infrastructure (Day 4)
1. Set up modal wrapper components with Gluestack UI
2. Implement modal backdrop and animation behavior
3. Create base modal component with consistent styling
4. Test modal visibility and state management

### Phase 4: Individual Modals (Day 5-8)
**Priority Order:**
1. `PaperSizeModal` - Most fundamental settings
2. `BorderSizeModal` - Core border sizing functionality
3. `PositionOffsetsModal` - Image positioning and offset controls
4. `CopyResultsModal` - Results display and sharing
5. `PresetModal` - Preset management
6. `AdvancedOptionsModal` - Other advanced features

### Phase 5: Integration (Day 9)
1. Wire up all modal interactions with main component
2. Test complete state flow between components
3. Verify all existing functionality works correctly
4. Add proper error handling and validation

### Phase 6: Polish & Optimization (Day 10-11)
1. Add proper animations and transitions
2. Optimize performance and re-render behavior
3. Test across different mobile devices and browsers
4. Add accessibility improvements
5. Create responsive detection for when to use mobile vs desktop

## Technical Considerations

### Platform Detection
```typescript
const useResponsiveDetection = () => {
  const { width } = useWindowDimensions();
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  const isMobileWeb = Platform.OS === 'web' && width < MOBILE_BREAKPOINT;
  
  return {
    shouldUseMobileLayout: isMobile || isMobileWeb,
    screenSize: { width, height }
  };
};
```

### Performance Optimization
- Lazy load modal content (render only when visible)
- Optimize preview component re-renders
- Use debouncing for slider inputs in modals
- Implement proper memoization for expensive calculations

### Touch Interactions
- Minimum 44px touch targets for all interactive elements
- Proper spacing between buttons and controls
- Consider swipe gestures for modal dismissal
- Implement haptic feedback where appropriate

### Accessibility
- Proper focus management in modals
- Screen reader support for all components
- High contrast mode compatibility
- Keyboard navigation support

## Success Criteria

### Functional Requirements
- [ ] All existing border calculator functionality preserved
- [ ] All calculations produce identical results
- [ ] All preset functionality works correctly
- [ ] All validation and warnings display properly
- [ ] Copy and share functionality works on mobile

### User Experience Requirements  
- [ ] Touch targets are appropriately sized (minimum 44px)
- [ ] Modal interactions feel smooth and responsive
- [ ] Settings are easy to find and modify
- [ ] Results are prominently displayed and easy to read
- [ ] Navigation between settings is intuitive

### Technical Requirements
- [ ] No performance regressions from current implementation
- [ ] Proper error handling and edge case management
- [ ] Responsive behavior works correctly
- [ ] Component architecture is maintainable and modular
- [ ] Code follows existing project conventions

## Risk Mitigation

### Potential Risks & Solutions

1. **Risk**: Modal state management complexity
   **Solution**: Create dedicated hook with clear interfaces

2. **Risk**: Performance impact from live preview updates
   **Solution**: Implement debouncing and optimize re-renders

3. **Risk**: Breaking existing functionality during refactor
   **Solution**: Systematic testing and gradual component replacement

4. **Risk**: Poor mobile performance
   **Solution**: Lazy loading, optimization, and device testing

5. **Risk**: Inconsistent user experience across platforms
   **Solution**: Platform-specific testing and adjustments

## Testing Strategy

### Component Testing
- Unit tests for all new components
- Integration tests for modal interactions
- Visual regression tests for UI consistency

### Functionality Testing
- Comprehensive testing of all calculation scenarios
- Preset management functionality verification
- Copy/share functionality across platforms

### Device Testing
- iOS native app testing
- Android native app testing  
- Mobile web browser testing
- Tablet size responsiveness testing

This plan provides a comprehensive roadmap for creating a mobile-optimized border calculator that maintains all existing functionality while providing a superior mobile user experience. 
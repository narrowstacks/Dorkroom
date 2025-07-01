# Development Recipe URL Sharing Implementation Plan

## Project Overview

Implement comprehensive URL sharing functionality for the development recipes feature, enabling users to share specific search filters and individual recipes through shareable links.

## Goals

- **Search Filter Sharing**: Share current filter state via URL parameters
- **Database Recipe Sharing**: Share individual recipes using UUID-based URLs
- **Custom Recipe Sharing**: Share user-created recipes with encoded data URLs
- **Cross-Platform Compatibility**: Ensure functionality works across web, iOS, and Android
- **User Experience**: Provide intuitive sharing UI with appropriate feedback

## Technical Analysis

### Current State

- Film, Developer, and Combination types have both `slug` and `uuid` fields
- Existing `presetSharing.ts` provides base64 encoding/decoding pattern
- `useDevelopmentRecipes` hook manages comprehensive filter state
- `developmentRecipes.tsx` has full filtering UI implementation

### URL Structure Design

```
Search Filters: /developmentRecipes?film=tri-x&developer=d76&dilution=2&iso=400
Database Recipe: /developmentRecipes?recipe=abc123-uuid-456
Custom Recipe: /developmentRecipes?recipe=encoded-base64-custom-data
```

## Implementation Stages

### Stage 1: Core URL State Management

**Priority**: High | **Estimated Effort**: 2-3 days

**New Files:**

- `hooks/useRecipeUrlState.ts` - URL parameter synchronization hook
- `types/urlTypes.ts` - TypeScript types for URL parameters

**Modified Files:**

- `hooks/useDevelopmentRecipes.ts` - Accept and handle URL parameters on initialization
- `app/(tabs)/developmentRecipes.tsx` - Integrate URL state management

**Key Features:**

- Parse URL parameters on page load (film, developer, dilution, iso)
- Update URL when filters change (without page reload using Expo Router)
- Bidirectional sync between URL state and hook state
- Handle conflicting parameters gracefully
- Maintain backward compatibility

**Technical Implementation:**

- Use Expo Router's useSearchParams for URL parameter management
- Implement debounced URL updates to prevent excessive history entries
- Add parameter validation and sanitization
- Create helper functions for slug-to-ID and ID-to-slug conversion

### Stage 2: Database Recipe UUID Sharing

**Priority**: High | **Estimated Effort**: 2 days

**New Files:**

- `hooks/useShareLink.ts` - Generate shareable URLs for different contexts
- `components/ShareButton.tsx` - Universal sharing component
- `components/ShareRecipeModal.tsx` - Recipe-specific sharing modal

**Modified Files:**

- Recipe row components - Add share buttons
- Recipe detail modals - Add sharing options

**Key Features:**

- Generate URLs for database recipes using UUID
- Handle incoming recipe UUID links
- Cross-platform sharing (Web Share API on mobile, clipboard on desktop)
- Visual feedback for successful sharing
- Error handling for non-existent UUIDs

**Technical Implementation:**

- Detect share capability (Web Share API vs clipboard)
- Generate full URLs with proper base path
- Handle deep linking to specific recipes
- Add loading states while recipe data loads from shared links

### Stage 3: Custom Recipe Encoding & Sharing

**Priority**: Medium | **Estimated Effort**: 3-4 days

**New Files:**

- `utils/recipeSharing.ts` - Custom recipe encoding utilities (based on presetSharing.ts)
- `hooks/useCustomRecipeSharing.ts` - Custom recipe sharing logic

**Modified Files:**

- Custom recipe components - Add sharing functionality
- Custom recipe storage - Handle imported recipes

**Key Features:**

- Encode custom recipes into URL-safe base64 strings
- Decode shared custom recipes with validation
- Option to save shared custom recipes to local storage
- Error handling for corrupted/invalid encoded data
- Version compatibility for future custom recipe format changes

**Technical Implementation:**

- Adapt presetSharing.ts encoding pattern for recipe data
- Include recipe metadata (name, notes, etc.) in encoding
- Add checksum validation for data integrity
- Implement graceful degradation for encoding failures
- Create import confirmation UI for shared custom recipes

### Stage 4: UI Polish & Cross-Platform Optimization

**Priority**: Medium | **Estimated Effort**: 2-3 days

**Enhanced Files:**

- All sharing components - Polish UI/UX
- Platform-specific optimizations
- Comprehensive error handling
- Accessibility improvements

**Key Features:**

- Consistent sharing UI across all platforms
- Platform-appropriate sharing methods (native vs web)
- Loading states and error feedback
- Success animations and confirmations
- Accessibility compliance (screen readers, keyboard navigation)

**Technical Implementation:**

- Platform detection for optimal sharing method
- Haptic feedback on mobile platforms
- Toast notifications for sharing success/failure
- Keyboard shortcuts for sharing actions
- Comprehensive error boundary implementation

## Technical Specifications

### URL Parameter Schema

```typescript
interface RecipeUrlParams {
  // Search filters
  film?: string; // Film slug
  developer?: string; // Developer slug
  dilution?: string; // Dilution ID
  iso?: string; // ISO value

  // Recipe sharing
  recipe?: string; // UUID for database recipes, encoded data for custom

  // Additional metadata
  source?: "share"; // Indicates this is a shared link
}
```

### Custom Recipe Encoding Format

```typescript
interface EncodedCustomRecipe {
  name: string;
  filmId: string;
  developerId: string;
  dilutionId?: number;
  customDilution?: string;
  temperatureF: number;
  timeMinutes: number;
  shootingIso: number;
  pushPull: number;
  agitationSchedule?: string;
  notes?: string;
  version: number; // For future compatibility
}
```

### Dependencies & Compatibility

- **Expo Router**: Use existing routing for URL parameter handling
- **Expo Sharing**: Leverage native sharing capabilities
- **Web Share API**: Progressive enhancement for modern browsers
- **Clipboard API**: Fallback for sharing on desktop web
- **React Native Platform**: Platform-specific optimizations

## Testing Strategy

### Unit Tests

- URL encoding/decoding utilities
- Parameter validation functions
- Share link generation
- Custom recipe encoding/decoding

### Integration Tests

- URL parameter synchronization with hook state
- Deep linking functionality
- Cross-platform sharing methods
- Custom recipe import workflow

### End-to-End Tests

- Complete sharing workflow from filter selection to URL generation
- Shared link consumption and state restoration
- Custom recipe sharing and import
- Error scenarios and edge cases

### Manual Testing

- Cross-platform sharing (iOS, Android, Web)
- Different sharing methods (native share, clipboard, etc.)
- Various URL formats and edge cases
- Accessibility testing with screen readers

## Edge Cases & Error Handling

### URL Parameter Conflicts

- Handle both `recipe` and filter parameters in same URL
- Priority: Recipe parameter takes precedence, filters ignored
- Provide user notification about conflicting parameters

### Invalid/Missing Data

- Non-existent UUIDs → Show error message, redirect to recipe list
- Corrupted encoded custom recipes → Show import failed message
- Missing slug references → Graceful fallback to "Unknown" with search

### Platform Limitations

- No Web Share API → Fallback to clipboard copy
- Clipboard access denied → Show manual copy instructions
- Deep linking on cold app start → Queue URL processing until app ready

### Data Migration

- Future custom recipe format changes → Version-aware decoding
- Deprecated slug formats → Redirect/mapping to current slugs
- Legacy URL formats → Maintain backward compatibility

## Success Metrics

- Successful URL generation and sharing
- Successful shared link consumption and state restoration
- Cross-platform functionality verification
- User adoption of sharing features
- Error rates for encoding/decoding operations

## Future Enhancements

- QR code generation for easy mobile sharing
- Social media preview cards for shared links
- Recipe collection sharing (multiple recipes at once)
- Integration with external recipe databases
- Advanced sharing analytics

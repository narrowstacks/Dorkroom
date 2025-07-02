# Stage 2: Database Recipe UUID Sharing Implementation Plan

## Overview

Implement comprehensive UUID-based sharing functionality for development recipes, enabling users to share specific database recipes through shareable links with cross-platform compatibility.

## Current State Analysis

- ✅ **Stage 1 Complete**: URL state management is fully implemented in `useRecipeUrlState.ts`
- ✅ **Infrastructure Ready**: UUID handling, validation, and URL parsing already functional
- ✅ **Base Components**: Recipe cards and detail modals have action button infrastructure
- ✅ **Expo Sharing Available**: Cross-platform sharing capabilities accessible

## Implementation Plan

### 1. New Files to Create

#### `hooks/useShareLink.ts`

- **Purpose**: Generate shareable URLs for database recipes using UUID
- **Features**:
  - Detect platform capabilities (Web Share API vs clipboard)
  - Generate full URLs with proper base path and recipe UUID
  - Handle different sharing contexts (recipe detail, recipe card)
  - Cross-platform sharing method selection
  - Error handling for sharing failures

#### `components/ShareButton.tsx`

- **Purpose**: Universal sharing component for recipe contexts
- **Features**:
  - Platform-adaptive sharing (Web Share API on mobile, clipboard on desktop)
  - Loading states during sharing operations
  - Success/failure feedback integration
  - Consistent styling across platforms
  - Haptic feedback on mobile platforms

#### `components/ShareRecipeModal.tsx`

- **Purpose**: Recipe-specific sharing modal with enhanced options
- **Features**:
  - Recipe preview with key details
  - Multiple sharing options (direct link, copy to clipboard)
  - QR code generation for easy mobile sharing
  - Social sharing integration
  - Platform-specific optimizations

### 2. Existing Files to Modify

#### `components/development-recipes/RecipeCard.tsx`

- **Add**: Share button to recipe cards
- **Integration**: Quick share functionality with minimal UI
- **Placement**: Subtle share icon in card header or action area

#### `components/development-recipes/RecipeDetail.tsx`

- **Add**: Share button to header actions row
- **Enhancement**: Full sharing modal integration
- **Styling**: Consistent with existing edit/duplicate/delete buttons

#### `hooks/useRecipeUrlState.ts`

- **Enhancement**: Handle incoming recipe UUID links
- **Features**:
  - Recipe lookup by UUID on page load
  - Error handling for non-existent UUIDs
  - Loading states while recipe data loads
  - Automatic recipe detail modal opening for shared links

#### `app/(tabs)/developmentRecipes.tsx`

- **Enhancement**: Handle shared recipe links on app/page load
- **Features**:
  - Detect recipe UUID in URL parameters
  - Display shared recipe automatically
  - Error messaging for invalid/missing recipes
  - Analytics tracking for shared link usage

### 3. Technical Implementation Details

#### URL Structure

```
Database Recipe: /developmentRecipes?recipe=abc123-uuid-456&source=share
```

#### Sharing Flow

1. User clicks share button on recipe card or detail modal
2. System generates shareable URL with recipe UUID
3. Platform-appropriate sharing method initiated
4. Success/failure feedback provided to user
5. Recipient opens link → automatic recipe display

#### Cross-Platform Sharing Strategy

- **Mobile Native**: Expo Sharing with Web Share API
- **Mobile Web**: Web Share API with clipboard fallback
- **Desktop Web**: Clipboard API with manual copy instructions
- **Error Handling**: Graceful degradation for unsupported platforms

#### Error Handling

- Non-existent UUIDs → Show error message, redirect to recipe list
- Sharing failures → Toast notification with retry option
- Platform limitations → Fallback methods with user guidance

### 4. Integration Points

#### Existing Systems

- **URL State Management**: Leverage existing `useRecipeUrlState` infrastructure
- **Toast System**: Use existing toast notifications for feedback
- **Component Patterns**: Follow border calculator sharing patterns
- **API Integration**: Use existing recipe lookup functions

#### Dependencies

- **Expo Sharing**: Already available for cross-platform sharing
- **Expo Router**: Use existing routing for URL parameter handling
- **React Native Platform**: Platform-specific optimizations

### 5. User Experience Flow

#### Sharing a Recipe

1. User views recipe (card or detail)
2. Clicks share button
3. Sharing modal/options appear
4. User selects sharing method
5. Success feedback provided

#### Receiving a Shared Recipe

1. User clicks shared link
2. App/website loads with recipe parameter
3. Recipe details automatically displayed
4. Error handling if recipe not found

### 6. Testing Strategy

#### Unit Tests

- URL generation with various recipe UUIDs
- Platform detection and sharing method selection
- Error handling for invalid UUIDs
- Clipboard and Web Share API integration

#### Integration Tests

- End-to-end sharing workflow
- Shared link consumption and recipe display
- Cross-platform sharing verification
- Error scenarios and edge cases

## Success Criteria

- ✅ Recipe cards and detail modals have functional share buttons
- ✅ URLs generate correctly with recipe UUIDs
- ✅ Cross-platform sharing works on iOS, Android, and web
- ✅ Shared links properly display recipes when opened
- ✅ Error handling provides clear user feedback
- ✅ Performance is responsive and loading states are clear

## Estimated Effort: 2 days

This aligns with the original plan document estimate for Stage 2 implementation.

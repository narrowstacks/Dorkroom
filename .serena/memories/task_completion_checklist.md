# Task Completion Checklist

When completing any development task in this project, follow this checklist:

## Code Quality Checks

### 1. Linting and Formatting

```bash
# Check and fix linting issues
npx eslint . --fix

# Ensure code is properly formatted
npx prettier . --check
npx prettier . --write  # if formatting needed
```

### 2. TypeScript Validation

```bash
# Check for TypeScript errors
npx tsc --noEmit
```

## Testing

### 3. Run Relevant Tests

```bash
# Run all tests
npm test

# Run specific test suites if applicable
npm test -- utils/__tests__/
npm test -- hooks/__tests__/
npm test -- components/__tests__/
```

### 4. Add Tests for New Features

- Unit tests for new calculation logic
- Component tests for new UI components
- Integration tests for complete workflows

## Platform Testing

### 5. Cross-Platform Verification

Test on relevant platforms:

```bash
# Test web version
npx expo start --web

# Test iOS (if available)
npx expo start --ios

# Test Android (if available)
npx expo start --android
```

## Performance Considerations

### 6. Performance Impact Assessment

- Check if heavy calculations need Web Worker optimization
- Verify responsive design works on mobile and desktop
- Test with throttled inputs for smooth UX

## Documentation

### 7. Update Documentation

- Update relevant calculator info files in `/calculator-info/formulas/`
- Update component documentation if creating reusable components
- Update README if adding new features or changing setup

## Git Best Practices

### 8. Commit Standards

```bash
# Follow conventional commit format
git commit -m "feat: add reciprocity calculator validation"
git commit -m "fix: border calculation edge case for small papers"
git commit -m "style: improve mobile layout for exposure calculator"
```

### 9. Final Verification

- Ensure no console errors in development
- Verify all features work as expected
- Test edge cases and error scenarios
- Confirm accessibility features work properly

## Deployment Readiness

### 10. Production Build Check

```bash
# Verify production build works
npx expo build
```

This checklist ensures consistent quality and functionality across all development work on the DorkroomReact project.

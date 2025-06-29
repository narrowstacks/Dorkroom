# Suggested Development Commands

## Core Development Commands

Based on the Expo/React Native setup, these are the essential commands for development:

### Starting Development

```bash
# Start development server
npx expo start

# Start for iOS simulator
npx expo start --ios

# Start for Android emulator
npx expo start --android

# Start web development
npx expo start --web

# Clear cache if needed
npx expo start --clear
```

### Building and Production

```bash
# Build for production
npx expo build

# Create development build
npx expo run:ios
npx expo run:android
```

### Code Quality

```bash
# Run linting
npx eslint .

# Fix linting issues
npx eslint . --fix

# Format code with Prettier
npx prettier . --write

# Check Prettier formatting
npx prettier . --check
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- hooks/__tests__/useBorderCalculator.test.skip.ts
```

### Package Management

```bash
# Install dependencies
npm install

# Add new dependency
npm install <package-name>

# Update dependencies
npm update
```

## Darwin-Specific System Commands

Since the system is Darwin (macOS), these commands are available:

```bash
# File operations
ls -la          # List files with details
find . -name    # Find files by name
grep -r         # Search in files recursively
cd              # Change directory

# Git operations
git status      # Check git status
git add .       # Stage changes
git commit -m   # Commit changes
git push        # Push to remote
git pull        # Pull from remote

# Process management
ps aux          # List running processes
top             # Monitor system processes
killall         # Kill processes by name
```

# Static Rendering for DorkroomReact

This project uses Expo Router with static rendering for optimal web performance and SEO. The setup follows the official [Expo Router Static Rendering documentation](https://docs.expo.dev/router/reference/static-rendering/).

## Key Components

### 1. App Configuration

In `app.json`, we've enabled static rendering with:

```json
"web": {
  "bundler": "metro",
  "output": "static"
}
```

### 2. Metro Configuration

The `metro.config.js` file extends Expo's default Metro configuration:

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

module.exports = withNativeWind(config, { input: "./app/styles/global.css" });
```

### 3. Fast Refresh Configuration

We ensure we're using the correct `react-refresh` version (>= 0.14.0) with an override in `package.json`:

```json
"overrides": {
  "react-refresh": "~0.14.0"
}
```

### 4. Root HTML Template

The `app/+html.tsx` file defines the HTML template for all statically rendered pages:

```tsx
import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        <title>DorkroomReact</title>
        <meta name="description" content="Dorkroom React Native App" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## Build Process

To build the static website, we use:

```bash
npx expo export --platform web
```

This command is configured in our `package.json` as the `vercel-build` script.

## Deployment

The static website is deployed to Vercel with the following configuration in `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures all routes are properly handled by the client-side router.
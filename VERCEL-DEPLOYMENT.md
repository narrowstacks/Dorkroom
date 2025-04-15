# Deploying DorkroomReact to Vercel

This guide will help you deploy your React Native Expo app to Vercel for web hosting using the official static rendering approach from Expo Router.

## Prerequisites

- A Vercel account
- Vercel CLI installed locally (already added as a dev dependency)

## Deployment Steps

### 1. Building for Web

The project is configured to build a static web version using:

```bash
npm run vercel-build
```

This command uses Expo's export functionality to create a static web build in the `dist` directory, following the [official Expo Router static rendering documentation](https://docs.expo.dev/router/reference/static-rendering/).

### 2. Deploying to Vercel

You can deploy to Vercel in two ways:

#### Option 1: Using Vercel CLI

```bash
# Login to Vercel if needed
npx vercel login

# Deploy to Vercel
npm run deploy
```

#### Option 2: Using Vercel GitHub Integration

1. Push your code to GitHub
2. Import the repository in Vercel dashboard
3. Configure the build settings:
   - Build command: `npm run vercel-build`
   - Output directory: `dist`
   - Install command: `npm install`

## Static Rendering Configuration

The app uses Expo Router's static rendering for optimal web performance and SEO:

1. **app.json** - Configured with `"web": { "bundler": "metro", "output": "static" }`
2. **metro.config.js** - Properly configured to extend Expo's default Metro configuration
3. **package.json** - Contains an override for `react-refresh` to ensure compatibility
4. **app/+html.tsx** - Provides the HTML template for all statically rendered pages
5. **vercel.json** - Configured to handle static builds and client-side routing

For more details, refer to [STATIC-RENDERING.md](./STATIC-RENDERING.md).

## Troubleshooting

If you encounter build errors:

1. Ensure all dependencies are properly installed
2. Check that the web configuration in `app.json` is correct
3. Review Vercel build logs for specific errors
4. Try running `npm run vercel-build` locally to debug issues

If you experience routing issues:
1. Make sure the `vercel.json` file has the correct rewrites configuration
2. Check that `app/+html.tsx` is properly configured
3. Clear your browser cache or try a private/incognito window
4. Verify your deployment is using the latest build

## Preview Deployments

Vercel will automatically create preview deployments for pull requests if you use the GitHub integration.

## Environment Variables

To add environment variables to your Vercel deployment:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add your variables as needed
# Deploying DorkroomReact to Vercel

This guide will help you deploy your React Native Expo app to Vercel for web hosting.

## Prerequisites

- A Vercel account
- Vercel CLI installed locally (already added as a dev dependency)

## Deployment Steps

### 1. Building for Web

The project is configured to build a web version using:

```bash
npm run vercel-build
```

This command uses Expo's export functionality to create a static web build in the `dist` directory.

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

## Configuration Files

- `vercel.json`: Contains Vercel-specific deployment configuration
- `app.json`: Contains Expo configuration including web settings

## Troubleshooting

If you encounter build errors:

1. Ensure all dependencies are properly installed
2. Check that the web configuration in `app.json` is correct
3. Review Vercel build logs for specific errors
4. Try running `npm run vercel-build` locally to debug issues

## Preview Deployments

Vercel will automatically create preview deployments for pull requests if you use the GitHub integration.

## Environment Variables

To add environment variables to your Vercel deployment:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add your variables as needed 
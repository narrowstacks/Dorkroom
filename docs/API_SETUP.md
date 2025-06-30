# Supabase API Setup Guide

This guide explains how to configure the DorkroomReact app to use Supabase API with secure API key handling.

## Overview

The app now uses a platform-aware API system that:

- **Web version**: Uses local Vercel API routes that proxy requests to Supabase
- **Native version**: Uses deployed Vercel edge functions that proxy requests to Supabase
- **Security**: API keys are never exposed to the client-side code

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
# Replace with your actual Supabase master API key that has high rate limits
SUPABASE_MASTER_API_KEY=your_supabase_master_api_key_here

# Vercel Deployment Configuration
# This should be your deployed Vercel app URL for native app API calls
EXPO_PUBLIC_VERCEL_URL=https://your-app.vercel.app

# Alternative API URL (fallback)
EXPO_PUBLIC_API_URL=https://your-api-domain.com
```

## Vercel Deployment Setup

1. **Deploy to Vercel**: Deploy your app to Vercel using `bun run deploy`

2. **Set Environment Variables**: In your Vercel dashboard, go to:
   - Project Settings → Environment Variables
   - Add `SUPABASE_MASTER_API_KEY` with your Supabase API key
   - Set it for Production, Preview, and Development environments

3. **Update Native Configuration**: After deployment, update your `.env.local`:
   ```bash
   EXPO_PUBLIC_VERCEL_URL=https://your-actual-app.vercel.app
   ```

## How It Works

### Web Platform (React Native Web on Vercel)

```
Client → Local API Route (/api/{endpoint}) → Supabase API
```

- Uses `/api/developers.ts`, `/api/films.ts`, and `/api/combinations.ts` Vercel functions
- API key stored securely in Vercel environment variables
- Direct proxy to Supabase endpoints

### Native Platform (iOS/Android)

```
Client → Deployed Vercel Function → Supabase API
```

- Uses the same Vercel functions but on the deployed domain
- API key stored securely in Vercel environment variables
- Remote proxy to Supabase endpoints

## Platform Detection

The app automatically detects the platform using `react-native`'s `Platform.OS`:

- `Platform.OS === 'web'` → Web platform
- `Platform.OS !== 'web'` → Native platform

## API Endpoints

### Supabase Endpoints

```
https://ukpdbjhbudgsjqsxlays.supabase.co/functions/v1/developers
https://ukpdbjhbudgsjqsxlays.supabase.co/functions/v1/films
https://ukpdbjhbudgsjqsxlays.supabase.co/functions/v1/combinations
```

### Web Platform Endpoints

```
/api/developers
/api/films
/api/combinations
```

### Native Platform Endpoints

```
https://your-app.vercel.app/api/developers
https://your-app.vercel.app/api/films
https://your-app.vercel.app/api/combinations
```

## Security Features

1. **API Key Protection**: Master API key never exposed to client
2. **CORS Configuration**: Proper CORS headers for cross-origin requests
3. **Error Handling**: Comprehensive error handling with status codes
4. **Rate Limiting**: Inherits Supabase's rate limiting through master key

## Testing

### Local Development (Web)

```bash
bun run web
# Test endpoints:
# http://localhost:8081/api/developers
# http://localhost:8081/api/films
# http://localhost:8081/api/combinations
```

### Local Development (Native)

```bash
bun run ios
# or
bun run android
# Uses deployed Vercel function
```

### Production Testing

```bash
# Deploy first
bun run deploy

# Test web version endpoints
curl https://your-app.vercel.app/api/developers
curl https://your-app.vercel.app/api/films
curl https://your-app.vercel.app/api/combinations

# Test native by running the app
bun run ios
bun run android
```

## Troubleshooting

### Common Issues

1. **API Key Not Set**
   - Error: "API configuration error"
   - Solution: Set `SUPABASE_MASTER_API_KEY` in Vercel environment variables

2. **Wrong Native URL**
   - Error: Network request failed
   - Solution: Update `EXPO_PUBLIC_VERCEL_URL` to your actual Vercel domain

3. **CORS Issues**
   - Error: CORS policy blocked
   - Solution: Check CORS headers in the relevant API function (`/api/developers.ts`, `/api/films.ts`, or `/api/combinations.ts`)

### Debug Information

The client logs platform information on initialization:

```
[DEBUG] Dorkroom client initialized for web platform with base URL: /api
[DEBUG] Dorkroom client initialized for native platform with base URL: https://your-app.vercel.app/api
```

## Migration from Old API

The old API endpoint (`https://api.dorkroom.art/api`) is automatically replaced with the new platform-aware endpoints. No changes needed in existing code that uses the `DorkroomClient`.

## Future Enhancements

- Add caching layer for improved performance
- Implement request deduplication across platforms
- Add analytics and monitoring
- Support for additional Supabase endpoints

import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-specific and will be used by Expo Router on the web.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <title>Dorkroom</title>
        <meta name="description" content="Dorkroom" />
        <ScrollViewStyleReset />
      </head>
      <body>
        {/* This ensures any routing events are properly handled on first load */}
        <div id="root">{children}</div>
      </body>
    </html>
  );
} 
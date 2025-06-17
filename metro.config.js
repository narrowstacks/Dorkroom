const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require("nativewind/metro");


const config = getDefaultConfig(__dirname);

// Enable tree shaking
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Optimize bundle size
config.transformer.minifierConfig = {
  ecma: 8,
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable caching
config.transformer.enableBabelRCLookup = false;
config.transformer.enableBabelRuntime = false;

module.exports = config;


// Configure with proper Tailwind CSS v3 support
module.exports = withNativeWind(config, { input: "./styles/global.css" })
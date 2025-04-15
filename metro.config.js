const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

// Configure with proper Tailwind CSS v3 support
module.exports = withNativeWind(config, { input: "./app/styles/global.css" });
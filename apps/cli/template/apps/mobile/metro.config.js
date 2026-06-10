const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
// biome-ignore lint/correctness/noGlobalDirnameFilename: Metro loads this config with require(); import.meta is unavailable in CommonJS.
const config = getSentryExpoConfig(__dirname);

module.exports = withNativewind(config, {
  inlineVariables: false,
  globalClassNamePolyfill: false,
  inlineRem: 16,
});

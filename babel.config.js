// babel-preset-expo (SDK 50+) already includes Expo Router's Babel plugin,
// so no extra "expo-router/babel" entry is needed here.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};

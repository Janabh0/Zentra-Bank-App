const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ["js", "jsx", "json", "ts", "tsx", "cjs", "mjs"];

config.resolver.assetExts = [
  "bmp",
  "gif",
  "jpg",
  "jpeg",
  "png",
  "psd",
  "svg",
  "webp",
  "ttf",
  "otf",
  "woff",
  "woff2",
];

module.exports = config;

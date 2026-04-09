const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Watchman is crashing on this machine, so force Metro to use Node's filesystem APIs.
config.resolver.useWatchman = false;

module.exports = config;

const Settings = require("../models/Settings");

let cachedSettings = null;

async function getSettings() {
  if (!cachedSettings) {
    cachedSettings = await Settings.findOne();
    if (!cachedSettings) {
      cachedSettings = await Settings.create({});
    }
  }
  return cachedSettings;
}

async function refreshSettings() {
  cachedSettings = await Settings.findOne();
  return cachedSettings;
}

module.exports = { getSettings, refreshSettings };

const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  min: { type: Number, default: 10 },
  max: { type: Number, default: 1000 },
  feePercent: { type: Number, default: 3 },
  charity: { type: Number, default: 1 },
  lp: { type: Number, default: 1 },
  platform: { type: Number, default: 1 },
  rewardAmount: { type: Number, default: 1 },
  minTaps: { type: Number, default: 100 },
  signupBonus: { type: Number, default: 1 },
  maxPerDay: { type: Number, default: 10 },
  dailyLimit: { type: Number, default: 2000 },
  baseReward: { type: Number, default: 0.001 },
  cooldownMs: { type: Number, default: 50 },

  dailyRewards: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      enabled: true,
      rewards: [100, 100, 200, 200, 300, 400, 500],
    },
  },

  earningMilestones: {
    type: mongoose.Schema.Types.Mixed,
    default: [
      { taps: 100, reward: 1 },
      { taps: 1000, reward: 10 },
      { taps: 10000, reward: 100 },
    ],
  },

  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Settings", SettingsSchema);

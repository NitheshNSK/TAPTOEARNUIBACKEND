const mongoose = require("mongoose");

const LevelConfigSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
      unique: true,
    },
    tapsRequired: {
      type: Number,
      required: true,
    },
    rewardMultiplier: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LevelConfig", LevelConfigSchema);

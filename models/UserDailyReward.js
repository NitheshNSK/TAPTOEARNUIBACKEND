const mongoose = require("mongoose");

const DailyRewardSchema = new mongoose.Schema({
  wallet: { type: String, required: true, lowercase: true },
  day: { type: Number, required: true },
  claimed: { type: Boolean, default: false },
  expired: { type: Boolean, default: false },
  claimedAt: { type: Date },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("UserDailyReward", DailyRewardSchema);

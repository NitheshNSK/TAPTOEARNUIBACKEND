const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true, // allows null
  },
  referredBy: {
    type: String,
    default: null,
  },
  level: { type: Number, default: 1 },
  totalTaps: { type: Number, default: 0 },
  dailyTapsLeft: { type: Number, default: 2000 },
  rewardBalance: { type: Number, default: 0 },
  lastTapReset: { type: Date, default: () => new Date() },
  staked: { type: Number, default: 0 },
  lastWithdrawal: { type: Date },
});

module.exports = mongoose.model("User", UserSchema);

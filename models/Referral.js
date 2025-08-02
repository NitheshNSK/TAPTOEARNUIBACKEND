const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema({
  referrerWallet: { type: String, required: true, lowercase: true },
  referredWallet: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  deviceHash: { type: String, default: null },
  referralBonusGiven: { type: Boolean, default: false },
  signupBonusGiven: { type: Boolean, default: false },
  referralTapsCompleted: { type: Number, default: 0 },
  referralTimestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Referral", ReferralSchema);

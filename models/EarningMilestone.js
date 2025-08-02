const mongoose = require("mongoose");

const EarningMilestoneSchema = new mongoose.Schema({
  wallet: { type: String, required: true, lowercase: true },
  milestone: { type: Number, required: true },
  reward: { type: Number, required: true },
  claimed: { type: Boolean, default: false },
  claimedAt: { type: Date },
});

module.exports = mongoose.model("EarningMilestone", EarningMilestoneSchema);

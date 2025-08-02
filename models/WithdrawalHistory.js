const mongoose = require("mongoose");

const WithdrawalHistorySchema = new mongoose.Schema({
  wallet: { type: String, required: true, lowercase: true },
  withdrawalRequest: { type: Number, required: true },
  charityFee: { type: Number, required: true },
  liquidityFee: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  finalUserAmount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },

  // ✅ Approval status
  approved: { type: Boolean, default: false },
  approvedAt: { type: Date },
  txHash: { type: String },
});

module.exports = mongoose.model("WithdrawalHistory", WithdrawalHistorySchema);

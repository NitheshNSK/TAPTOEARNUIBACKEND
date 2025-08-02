const Settings = require("../models/Settings");
const WithdrawalHistory = require("../models/WithdrawalHistory");
const { getAdminBalances } = require("../utils/balanceUtils");
const { sendTokenToUser } = require("../utils/transferUtils");

exports.approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const withdraw = await WithdrawalHistory.findById(id);

    if (!withdraw || withdraw.approved) {
      return res.status(400).json({ error: "Already approved or not found" });
    }

    const receipt = await sendTokenToUser(
      withdraw.wallet,
      withdraw.finalUserAmount
    );

    withdraw.approved = true;
    withdraw.approvedAt = new Date();
    withdraw.txHash = receipt.transactionHash;
    await withdraw.save();

    res.status(200).json({
      message: "Approved and tokens sent",
      tx: receipt.transactionHash,
    });
  } catch (err) {
    console.error("Web3 transfer failed:", err);
    res
      .status(500)
      .json({ error: "Token transfer failed", details: err.message });
  }
};

exports.getAdminWalletBalances = async (req, res) => {
  try {
    const balances = await getAdminBalances();
    res.status(200).json({
      wallet: process.env.ADMIN_WALLET,
      ...balances,
    });
  } catch (err) {
    console.error("Balance fetch error:", err);
    res.status(500).json({ error: "Failed to fetch balances" });
  }
};

// Update daily rewards array
exports.updateDailyRewards = async (req, res) => {
  const { rewards, enabled } = req.body;

  if (!Array.isArray(rewards) || rewards.length !== 7) {
    return res
      .status(400)
      .json({ error: "Rewards must be an array of 7 values." });
  }

  const settings = await Settings.findOneAndUpdate(
    {},
    {
      $set: {
        "dailyRewards.rewards": rewards,
        "dailyRewards.enabled": enabled !== undefined ? enabled : true,
      },
    },
    { new: true, upsert: true }
  );

  res.status(200).json({
    message: "Daily rewards updated successfully.",
    dailyRewards: settings.dailyRewards,
  });
};

// Update milestone earnings
exports.updateEarningMilestones = async (req, res) => {
  const { milestones } = req.body;

  if (
    !Array.isArray(milestones) ||
    milestones.some(
      (m) => typeof m.taps !== "number" || typeof m.reward !== "number"
    )
  ) {
    return res.status(400).json({
      error: "Milestones must be an array of {taps, reward} objects.",
    });
  }

  const settings = await Settings.findOneAndUpdate(
    {},
    {
      $set: { earningMilestones: milestones },
    },
    { new: true, upsert: true }
  );

  res.status(200).json({
    message: "Earning milestones updated successfully.",
    earningMilestones: settings.earningMilestones,
  });
};

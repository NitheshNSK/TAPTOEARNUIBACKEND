const User = require("../models/User");
const WithdrawalHistory = require("../models/WithdrawalHistory");
const { calculateWithdrawalFees } = require("../utils/withdrawUtils");
const { getSettings } = require("../services/settingsService");

const jwt = require("jsonwebtoken");
const { decrypt } = require("../utils/crypto");
exports.getWithdrawStatus = async (req, res) => {
  const user = req.user;

  const now = new Date();
  const last = user.lastWithdrawal || new Date(0);
  const nextAllowed = new Date(last.getTime() + 7 * 24 * 60 * 60 * 1000);
  const canWithdraw = now >= nextAllowed;

  res.status(200).json({
    rewardBalance: user.rewardBalance,
    canWithdraw,
    nextEligibleAt: nextAllowed,
  });
};

exports.postWithdraw = async (req, res) => {
  try {
    const user = req.user;
    const { amount } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Valid withdrawal amount is required" });
    }

    const settings = await getSettings();
    const now = new Date();

    // Enforce 7-day cooldown
    const last = user.lastWithdrawal || new Date(0);
    const nextAllowed = new Date(last.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (now < nextAllowed) {
      return res.status(403).json({
        error: "Withdrawal not allowed yet.",
        nextEligibleAt: nextAllowed,
      });
    }

    // Enforce limits
    if (amount < settings.min) {
      return res
        .status(400)
        .json({ error: `Minimum withdrawal is ${settings.min} $DRISHTI` });
    }

    if (amount > settings.max) {
      return res
        .status(400)
        .json({ error: `Maximum withdrawal is ${settings.max} $DRISHTI` });
    }

    if (amount > user.rewardBalance) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Fee breakdown
    const totalFee = parseFloat(
      ((amount * settings.feePercent) / 100).toFixed(2)
    );
    const charityFee = parseFloat(
      ((amount * settings.charity) / 100).toFixed(2)
    );
    const liquidityFee = parseFloat(((amount * settings.lp) / 100).toFixed(2));
    const platformFee = parseFloat(
      ((amount * settings.platform) / 100).toFixed(2)
    );
    const finalUserAmount = parseFloat((amount - totalFee).toFixed(2));

    // Update user
    user.rewardBalance -= amount;
    user.lastWithdrawal = now;
    await user.save();

    // Save withdrawal record
    await WithdrawalHistory.create({
      wallet: user.wallet,
      withdrawalRequest: amount,
      charityFee,
      liquidityFee,
      platformFee,
      finalUserAmount,
      timestamp: now,
      approved: false, // 🔁 Not yet processed
      approvedAt: null,
    });

    return res.status(200).json({
      message: "Withdrawal processed successfully.",
      finalUserAmount,
      breakdown: {
        requested: amount,
        totalFee,
        feePercent: settings.feePercent,
        charityFee,
        liquidityFee,
        platformFee,
      },
      nextEligibleAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return res
      .status(500)
      .json({ error: "Withdrawal failed. Please try again later." });
  }
};

exports.getWithdrawHistory = async (req, res) => {
  const user = req.user;
  const history = await WithdrawalHistory.find({ wallet: user.wallet }).sort({
    timestamp: -1,
  });

  res.status(200).json({
    history: history.map((entry) => ({
      ...entry._doc,
      status: entry.approved ? "approved" : "pending",
    })),
  });
};

exports.getUserProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const wallet = decrypt(decoded.data); // your encrypted wallet logic

    const user = await User.findOne({ wallet: wallet.toLowerCase() }).select(
      "-__v -createdAt -updatedAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Fetch profile error:", err.message);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

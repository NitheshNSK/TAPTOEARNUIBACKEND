const Settings = require("../models/Settings");
const User = require("../models/User");
const UserDailyReward = require("../models/UserDailyReward");
const EarningMilestone = require("../models/EarningMilestone");
const LevelConfig = require("../models/LevelConfig");
const { getSettings } = require("../services/settingsService");
const Referral = require("../models/Referral");
// DAILY REWARDS
exports.getLevelConfigs = async (req, res) => {
  try {
    const levels = await LevelConfig.find().sort({ level: 1 });

    res.status(200).json({
      success: true,
      levels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch level configurations",
      error: error.message,
    });
  }
};
exports.getDailyRewards = async (req, res) => {
  const user = req.user;
  const settings = await getSettings();
  const today = new Date();
  const dayIndex = today.getDay(); // 0 (Sunday) - 6 (Saturday)

  const rewardConfig = settings.dailyRewards.rewards || [];
  const userRewards = await UserDailyReward.find({ wallet: user.wallet });

  // Build a complete 0–6 day status array
  const fullWeek = Array.from({ length: 7 }).map((_, i) => {
    const rewardAmount = rewardConfig[i] || 0;
    const match = userRewards.find((r) => r.day === i);

    return {
      day: i,
      isToday: i === dayIndex,
      rewardAmount,
      claimed: !!(match && match.claimed),
      claimedAt: match?.claimedAt || null,
    };
  });

  res.status(200).json({ today: dayIndex, days: fullWeek });
};

exports.claimDailyReward = async (req, res) => {
  const user = req.user;
  const settings = await getSettings();
  const today = new Date();
  const day = today.getDay();

  if (!settings.dailyRewards.enabled) {
    return res.status(403).json({ error: "Daily rewards are disabled." });
  }

  const rewardAmount = settings.dailyRewards.rewards[day] || 0;
  if (rewardAmount <= 0) {
    return res.status(400).json({ error: "No reward set for today." });
  }

  const existing = await UserDailyReward.findOne({ wallet: user.wallet, day });

  if (existing?.claimed) {
    return res.status(400).json({ error: "Already claimed." });
  }

  const entry =
    existing ||
    new UserDailyReward({
      wallet: user.wallet,
      day,
      claimed: false,
      expired: false,
      date: today,
    });

  entry.claimed = true;
  entry.claimedAt = today;
  await entry.save();

  user.rewardBalance += rewardAmount;
  await user.save();

  res.status(200).json({ message: "Reward claimed.", rewardAmount });
};

// EARNING MILESTONES

exports.getEarningMilestones = async (req, res) => {
  const user = req.user;
  const settings = await getSettings();

  // Get all claimed milestone entries by this user
  const claimedMilestones = await EarningMilestone.find({
    wallet: user.wallet,
  });

  // Normalize claimed milestone taps
  const claimedSet = new Set(
    claimedMilestones.map((entry) => Number(entry.milestone))
  );

  // Prepare milestone list with claim status
  const result = settings.earningMilestones.map((m) => ({
    milestone: m.taps,
    reward: m.reward,
    claimed: claimedSet.has(Number(m.taps)),
  }));

  res.status(200).json({ milestones: result });
};

exports.claimEarningMilestone = async (req, res) => {
  const user = req.user;
  const { milestone } = req.body;

  const settings = await getSettings();
  const rewardDef = settings.earningMilestones.find(
    (m) => m.taps === milestone
  );
  if (!rewardDef) {
    return res.status(404).json({ error: "Invalid milestone." });
  }

  const already = await EarningMilestone.findOne({
    wallet: user.wallet,
    milestone,
  });
  if (already) {
    return res.status(400).json({ error: "Already claimed." });
  }

  if (user.totalTaps < milestone) {
    return res.status(400).json({ error: "Milestone not reached yet." });
  }

  await EarningMilestone.create({
    wallet: user.wallet,
    milestone,
    reward: rewardDef.reward,
    claimed: true,
    claimedAt: new Date(),
  });

  user.rewardBalance += rewardDef.reward;
  await user.save();

  res
    .status(200)
    .json({ message: "Milestone reward claimed.", reward: rewardDef.reward });
};

exports.getReferralRewards = async (req, res) => {
  try {
    const wallet = req.user.wallet.toLowerCase();

    // Fetch user's referral code
    const user = await User.findOne({ wallet });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Get successful referrals
    const referrals = await Referral.find({
      referrerWallet: wallet,
      referralBonusGiven: true,
    });

    const totalReferred = referrals.length;
    const totalBonus = totalReferred * 1; // Example: 1 $DRISHTI per referral

    res.json({
      success: true,
      referralCode: user.referralCode || null,
      totalReferred,
      totalBonus,
      details: referrals.map((r) => ({
        referredWallet: r.referredWallet,
        referralTimestamp: r.referralTimestamp,
      })),
    });
  } catch (err) {
    console.error("Referral fetch error:", err);
    res.status(500).json({ error: "Failed to fetch referral rewards." });
  }
};

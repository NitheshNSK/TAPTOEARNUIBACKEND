const jwt = require("jsonwebtoken");
const { encrypt } = require("../utils/crypto");
const { generateReferralCode } = require("../utils/referralUtils");
const User = require("../models/User");
const Referral = require("../models/Referral");
const Settings = require("../models/Settings");

exports.metamaskLogin = async (req, res) => {
  const { wallet, referralCode, deviceHash } = req.body;

  if (!wallet)
    return res.status(400).json({ error: "Wallet address is required" });

  const walletLower = wallet.toLowerCase();

  let user = await User.findOne({ wallet: walletLower });

  if (!user) {
    // Step 1: Generate unique referralCode
    let uniqueCode;
    while (true) {
      uniqueCode = generateReferralCode();
      const exists = await User.findOne({ referralCode: uniqueCode });
      if (!exists) break;
    }

    // Step 2: Handle referral (if code provided)
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({
        referralCode: referralCode.toUpperCase(),
      });
      const isSelfReferral = referrer?.wallet === walletLower;
      const duplicateDevice = deviceHash
        ? await Referral.findOne({ deviceHash })
        : null;

      if (referrer && !isSelfReferral && !duplicateDevice) {
        referredBy = referralCode.toUpperCase();

        await Referral.create({
          referrerWallet: referrer.wallet,
          referredWallet: walletLower,
          deviceHash: deviceHash || null,
        });
      }
    }

    // Step 3: Create user
    user = await User.create({
      wallet: walletLower,
      referralCode: uniqueCode,
      referredBy,
    });
  }

  // Step 4: Generate JWT token
  const encryptedWallet = encrypt(wallet);
  const token = jwt.sign({ data: encryptedWallet }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.status(200).json({
    token,
    user: {
      wallet: user.wallet,
      level: user.level,
      rewardBalance: user.rewardBalance,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
    },
  });
};

exports.getWithdrawLimits = async (req, res) => {
  try {
    const settings = await Settings.findOne().sort({ updatedAt: -1 });

    if (!settings) {
      return res.status(404).json({ error: "Settings not found" });
    }

    res.json({
      min: settings.min,
      max: settings.max,
      fee: settings.feePercent,
    });
  } catch (error) {
    console.error("Error fetching withdraw limits:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

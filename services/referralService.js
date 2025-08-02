const Referral = require("../models/Referral");
const User = require("../models/User");
const { getSettings } = require("./settingsService");
async function handleReferralProgress(user) {
  const referral = await Referral.findOne({ referredWallet: user.wallet });
  if (!referral || referral.referralBonusGiven) return;
 
  referral.referralTapsCompleted += 1;
  const settings = await getSettings();
  if (referral.deviceHash && referral.referralTapsCompleted >= 100) {
    const referrer = await User.findOne({ wallet: referral.referrerWallet });
    if (referrer) {
      referrer.rewardBalance += settings.rewardAmount;
      user.rewardBalance += settings.signupBonus;

      referral.referralBonusGiven = true;
      referral.signupBonusGiven = true;

      await referrer.save();
    }
  }

  await referral.save();
  await user.save();
}

module.exports = { handleReferralProgress };

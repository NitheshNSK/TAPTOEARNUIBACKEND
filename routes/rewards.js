const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const rewardController = require("../controllers/rewardController");

// Daily rewards
router.get("/daily", auth, rewardController.getDailyRewards);
router.post("/daily/claim", auth, rewardController.claimDailyReward);
router.get("/levels", auth, rewardController.getLevelConfigs);
// Earnings
router.get("/earnings", auth, rewardController.getEarningMilestones);
router.post("/earnings/claim", auth, rewardController.claimEarningMilestone);
router.get("/referral", auth, rewardController.getReferralRewards);
module.exports = router;

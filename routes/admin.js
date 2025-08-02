const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  approveWithdrawal,
  updateDailyRewards,
  updateEarningMilestones,
  getAdminWalletBalances,
} = require("../controllers/adminController");
const router = express.Router();

router.post("/withdrawals/:id/approve", authMiddleware, approveWithdrawal);
router.post("/rewards/daily/update", authMiddleware, updateDailyRewards);
router.post(
  "/rewards/earnings/update",
  authMiddleware,
  updateEarningMilestones
);
router.get("/walletbalance", authMiddleware, getAdminWalletBalances);

module.exports = router;

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const walletController = require("../controllers/walletController");

router.get("/status", authMiddleware, walletController.getWithdrawStatus);
router.post("/withdraw", authMiddleware, walletController.postWithdraw);
router.get("/history", authMiddleware, walletController.getWithdrawHistory);
router.get("/profile",authMiddleware, walletController.getUserProfile);
module.exports = router;

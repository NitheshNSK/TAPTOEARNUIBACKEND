const express = require("express");
const router = express.Router();
const { metamaskLogin, getWithdrawLimits } = require("../controllers/authController");

router.post("/login", metamaskLogin);
router.get("/withdraw-limits", getWithdrawLimits);
module.exports = router;

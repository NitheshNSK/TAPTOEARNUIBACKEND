const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { decrypt } = require("../utils/crypto");
const User = require("../models/User");
const { getLevelDataFromDB } = require("../utils/levelUtils");
const { handleReferralProgress } = require("../services/referralService");
const { getSettings } = require("../services/settingsService");
const dotenv = require("dotenv");
dotenv.config();
let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // STEP 1: Authenticate user on connect_user
    socket.on("connect_user", async () => {
      console.log("User connected:", socket.id);
    });

    // STEP 2: Tap event handler
    socket.on("tap", async ({ token }) => {
      try {
        if (!token) return socket.emit("error", { message: "Token required" });
        const settings = await getSettings();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const wallet = decrypt(decoded.data);

        let user = await User.findOne({ wallet: wallet.toLowerCase() });
        if (!user) return socket.emit("error", { message: "User not found" });

        // ✅ Check if 24h passed since last reset
        const now = new Date();
        const nextResetTime = new Date(
          user.lastTapReset.getTime() + 24 * 60 * 60 * 1000
        );

        if (now >= nextResetTime) {
          user.dailyTapsLeft = settings.dailyLimit;
          user.lastTapReset = now;
        }

        if (user.dailyTapsLeft <= 0) {
          return socket.emit("limit_reached", {
            message: "You’ve reached your daily tap limit.",
            nextTapAvailableAt: nextResetTime,
          });
        }

        // ➕ Tap logic
        const baseReward = settings.baseReward;

        user.totalTaps += 1;
        user.dailyTapsLeft -= 1;

        const { level, rewardMultiplier } = await getLevelDataFromDB(
          user.totalTaps
        );
        const reward = parseFloat((baseReward * rewardMultiplier).toFixed(6));

        const levelUp = level > user.level;
        user.level = level;
        user.rewardBalance += reward;

        // 🎁 Referral reward logic
        await handleReferralProgress(user);

        await user.save();

        socket.emit("update_stats", {
          reward,
          level,
          totalTaps: user.totalTaps,
          rewardBalance: user.rewardBalance,
          dailyTapsLeft: user.dailyTapsLeft,
          nextReset: new Date(
            user.lastTapReset.getTime() + 24 * 60 * 60 * 1000
          ),
        });

        if (levelUp) {
          socket.emit("level_up", { newLevel: level });
        }
      } catch (err) {
        console.error("Tap error:", err);
        socket.emit("error", { message: "Tap failed" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}

module.exports = { initSocket };

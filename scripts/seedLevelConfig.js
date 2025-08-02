const mongoose = require("mongoose");
const dotenv = require("dotenv");
const LevelConfig = require("../models/LevelConfig");

dotenv.config();

const levelTable = [
  { level: 1, tapsRequired: 0, rewardMultiplier: 1.0 },
  { level: 2, tapsRequired: 100, rewardMultiplier: 1.1 },
  { level: 3, tapsRequired: 250, rewardMultiplier: 1.2 },
  { level: 4, tapsRequired: 450, rewardMultiplier: 1.3 },
  { level: 5, tapsRequired: 700, rewardMultiplier: 1.4 },
  { level: 6, tapsRequired: 1000, rewardMultiplier: 1.5 },
  { level: 7, tapsRequired: 1350, rewardMultiplier: 1.6 },
  { level: 8, tapsRequired: 1750, rewardMultiplier: 1.7 },
  { level: 9, tapsRequired: 2200, rewardMultiplier: 1.8 },
  { level: 10, tapsRequired: 2700, rewardMultiplier: 1.9 },
  { level: 50, tapsRequired: 61000, rewardMultiplier: 5.0 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await LevelConfig.deleteMany();
    await LevelConfig.insertMany(levelTable);
    console.log("LevelConfig seeded");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();

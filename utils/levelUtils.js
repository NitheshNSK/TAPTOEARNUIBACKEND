const LevelConfig = require("../models/LevelConfig");

async function getLevelDataFromDB(totalTaps) {
  const levels = await LevelConfig.find().sort({ tapsRequired: 1 });

  let level = 1;
  let rewardMultiplier = 1.0;

  for (let l of levels) {
    if (totalTaps >= l.tapsRequired) {
      level = l.level;
      rewardMultiplier = l.rewardMultiplier;
    } else {
      break;
    }
  }

  return { level, rewardMultiplier };
}

module.exports = { getLevelDataFromDB };

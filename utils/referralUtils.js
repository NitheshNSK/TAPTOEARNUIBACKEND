const crypto = require("crypto");

function generateReferralCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randIndex = crypto.randomInt(0, chars.length);
    code += chars[randIndex];
  }
  return code;
}

module.exports = { generateReferralCode };

const jwt = require("jsonwebtoken");
const { decrypt } = require("../utils/crypto");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const decryptedWallet = decrypt(decoded.data);

    const user = await User.findOne({ wallet: decryptedWallet.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Add user object to request
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;

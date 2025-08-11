const crypto = require("crypto");
require("dotenv").config();

const RAW_SECRET = (process.env.ENCRYPTION_KEY || "fallback-secret").trim();
// Derive an exact 32‑byte key for aes-256-*
const KEY = crypto.scryptSync(RAW_SECRET, "static-salt", 32); // 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(payload) {
  const [ivHex, dataHex] = payload.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

module.exports = { encrypt, decrypt };

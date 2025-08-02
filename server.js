const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");
const settingsRoutes = require("./routes/settings");
const rewardRoutes = require("./routes/rewards");
const { initSocket } = require("./sockets/socketHandler");
const adminRoutes = require("./routes/admin");
dotenv.config();

const app = express();
const server = http.createServer(app);
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Sample Route
app.get("/", (req, res) => {
  res.send("Tap to Earn Backend Running");
});

app.use("/auth", authRoutes);

app.use("/wallet", walletRoutes);

app.use("/settings", settingsRoutes);

app.use("/rewards", rewardRoutes);


app.use("/admin", adminRoutes);
// MongoDB Connection
const connectDB = require("./config/db");
connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

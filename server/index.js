require("dotenv").config();
const express = require("express");
const path = require("path");
const messagingRoutes = require("./routes/messaging");
const voiceRoutes = require("./routes/voice");
const numbersRoutes = require("./routes/numbers");

const app = express();
app.use(express.json({ limit: "1mb" }));

// API Routes
app.use("/webhooks/telnyx/messaging", messagingRoutes);
app.use("/webhooks/telnyx/voice", voiceRoutes);
app.use("/api/numbers", numbersRoutes);

// Serve static frontend files from Expo export (dist)
app.use(express.static(path.join(__dirname, "../dist")));

// Fallback to index.html for Expo Router web navigation
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`6ix server listening on port ${PORT}`);
});

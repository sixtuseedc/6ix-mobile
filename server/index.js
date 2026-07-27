// server/index.js
// Minimal Express server deployed to Render. Telnyx is configured to POST
// its webhook events here. This process writes inbound events into
// Supabase using the service role key, which the app never has access to.

require("dotenv").config();
const express = require("express");
const messagingRoutes = require("./routes/messaging");
const voiceRoutes = require("./routes/voice");

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.status(200).send("6ix webhook receiver is running.");
});

app.use("/webhooks/telnyx/messaging", messagingRoutes);
app.use("/webhooks/telnyx/voice", voiceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`6ix webhook receiver listening on port ${PORT}`);
});

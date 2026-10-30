// Standalone server for the UniPlug assistant (Render service: uniplug-assistant).
//   Build command: npm install
//   Start command: node server.js
try {
  require("dotenv").config(); // only matters on your own computer
} catch {}

const express = require("express");
const app = express();

app.set("trust proxy", 1); // Render sits behind a proxy

app.get("/", (req, res) => res.send("UniPlug assistant is running"));
app.get("/health", (req, res) => res.send("ok")); // set this as Render's Health Check Path

app.use("/api/assistant", require("./assistant.routes"));

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Assistant listening on port ${port}`));

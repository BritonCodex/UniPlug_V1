const express = require("express");

const app = express();
app.set("trust proxy", 1); // Render sits behind a proxy; needed for rate limiting

app.get("/", (req, res) => res.send("UniPlug gateway OK")); // health check + warm-up target
app.use("/api/assistant", require("./assistant.routes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gateway listening on ${PORT}`));

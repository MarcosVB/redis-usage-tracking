const express = require("express");
const { createClient } = require("redis");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const redisClient = createClient({
  url: "redis://localhost:6379",
});

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  await redisClient.connect();
})();

// Route to render logging form
app.get("/log", (req, res) => {
  res.render("log");
});

// Endpoint to log usage data
app.post("/log-usage", async (req, res) => {
  const { userId, action } = req.body;
  await redisClient.xAdd("usage-stream", "*", {
    userId,
    action,
    timestamp: Date.now().toString(),
  });
  res.redirect("/");
});

// Endpoint to get usage data
app.get("/usage-data", async (req, res) => {
  try {
    const result = await redisClient.xRange("usage-stream", "-", "+");
    res.json(result);
  } catch (error) {
    console.error("Error retrieving usage data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to clear usage data
app.post("/clear-data", async (req, res) => {
  try {
    await redisClient.del("usage-stream");
    res.sendStatus(200);
  } catch (error) {
    console.error("Error clearing data:", error);
    res.sendStatus(500);
  }
});

// Serve the frontend
app.get("/", (req, res) => {
  res.render("index");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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

app.get("/log", (req, res) => {
  res.render("log");
});

app.post("/log-usage", async (req, res) => {
  const { userId, action } = req.body;
  await redisClient.xAdd(action, "*", {
    userId,
    action,
    timestamp: Date.now().toString(),
  });
  res.redirect("/");
});

app.get("/usage-data", async (req, res) => {
  try {
    const { action } = req.query;

    if (action) {
      const results = await redisClient.xRange(action, "-", "+");
      res.json(results);
      return;
    }

    // Fetch all streams
    const keys = await redisClient.keys("*");
    const allStreamResults = await Promise.all(
      keys.map((key) => redisClient.xRange(key, "-", "+"))
    );
    const allResults = keys.map((key, index) => ({
      key,
      streamResults: allStreamResults[index],
    }));

    res.json(allResults);
  } catch (error) {
    console.error("Error retrieving usage data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/clear-data", async (req, res) => {
  try {
    const keys = await redisClient.keys("*");
    await Promise.all(keys.map((key) => redisClient.del(key)));
    res.sendStatus(200);
  } catch (error) {
    console.error("Error clearing data:", error);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.render("index");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

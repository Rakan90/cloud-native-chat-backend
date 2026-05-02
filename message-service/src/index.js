const express = require("express");
const dotenv = require("dotenv");
const messageRoutes = require("./routes/messages");

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "Message Service is running" });
});

app.use("/messages", messageRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Message Service running on port ${PORT}`);
});
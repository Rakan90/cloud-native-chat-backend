const express = require("express");
const dotenv = require("dotenv");
const messageRoutes = require("./routes/messages");
const { ensureSchema } = require("./db");

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "Message Service is running" });
});

app.use("/messages", messageRoutes);

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, async () => {
    console.log(`Message Service running on port ${PORT}`);
    try {
        await ensureSchema();
        console.log("Message Service schema ready.");
    } catch (err) {
        console.error("Schema bootstrap failed:", err.message);
    }
});

const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down Message Service...`);
    server.close(() => {
        console.log("Message Service shut down gracefully.");
        process.exit(0);
    });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
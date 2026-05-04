const express = require("express");
const dotenv = require("dotenv");
const messageRoutes = require("./routes/messages");
const pool = require("./db");

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
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id INTEGER NOT NULL,
                receiver_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
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
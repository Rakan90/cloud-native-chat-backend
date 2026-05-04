const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/users");
const pool = require("./db");

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "User Service is running" });
});

app.use("/users", userRoutes);

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, async () => {
    console.log(`User Service running on port ${PORT}`);
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("User Service schema ready.");
    } catch (err) {
        console.error("Schema bootstrap failed:", err.message);
    }
});

const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down User Service...`);
    server.close(() => {
        console.log("User Service shut down gracefully.");
        process.exit(0);
    });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
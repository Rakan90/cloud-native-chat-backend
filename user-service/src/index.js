const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/users");
const { ensureSchema } = require("./db");

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
        await ensureSchema();
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
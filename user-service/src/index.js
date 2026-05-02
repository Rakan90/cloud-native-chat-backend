const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/users");

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "User Service is running" });
});

app.use("/users", userRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down User Service...");
    server.close(() => {
        console.log("User Service shut down gracefully.");
        process.exit(0);
    });
});
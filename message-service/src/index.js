const express = require("express");
const dotenv = require("dotenv");
const messageRoutes = require("./routes/messages");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
    res.json({ status: "Message Service is running" });
});

app.use("/messages", messageRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Message Service running on port ${PORT}`);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down Message Service...");
    server.close(() => {
        console.log("Message Service shut down gracefully.");
        process.exit(0);
    });
});
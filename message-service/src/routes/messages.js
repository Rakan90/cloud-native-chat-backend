const express = require("express");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { sender_id, receiver_id, content } = req.body;

        const result = await pool.query(
            "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *",
            [sender_id, receiver_id, content]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Failed to send message" });
    }
});

router.get("/:user1/:user2", async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        const result = await pool.query(
            `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
            [user1, user2]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to get messages" });
    }
});

module.exports = router;
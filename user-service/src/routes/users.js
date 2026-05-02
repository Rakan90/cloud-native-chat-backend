const express = require("express");

const router = express.Router();

router.post("/register", (req, res) => {
    res.json({ message: "Register endpoint working" });
});

router.post("/login", (req, res) => {
    res.json({ message: "Login endpoint working" });
});

router.get("/:id", (req, res) => {
    res.json({ message: `Get user ${req.params.id}` });
});

module.exports = router;
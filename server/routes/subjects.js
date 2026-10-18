const express = require("express");
const Subject = require("../models/Subject");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
    try {
        const { name, weeklyGoalHours } = req.body;

        if (typeof name !== "string" || !name.trim() || name.trim().length > 50) {
            return res.status(400).json({ error: "invalid name" });
        }
        if (!Number.isInteger(weeklyGoalHours) || weeklyGoalHours < 1 || weeklyGoalHours > 40) {
            return res.status(400).json({ error: "invalid hours" });
        }

        const duplicate = await Subject.findOne({ owner: req.userId, name: name.trim() })
            .collation({ locale: "en", strength: 2 });
        if (duplicate) {
            return res.status(409).json({ error: "You already have this subject" });
        }

        const newSubject = await Subject.create({
            name,
            weeklyGoalHours,
            owner: req.userId,
        });
        return res.status(201).json(newSubject);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "something went wrong" });
    }
});

router.get("/", requireAuth, async (req, res) => {
    try {
        const subjects = await Subject.find({ owner: req.userId }).sort({ createdAt: -1 });
        res.json(subjects);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "something went wrong" });
    }
});

module.exports = router;
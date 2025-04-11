const express = require("express");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, async (req, res) => {
    const { amount, type, category, description, date } = req.body;
    try {
        const transaction = new Transaction({
            userId: req.userId,
            amount,
            type,
            category,
            description,
            date,
        });
        await transaction.save();
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/", auth, async (req, res) => {
    try {
        const { category, startDate, endDate } = req.query;
        const query = { userId: req.userId };
        if (category) query.category = category;
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
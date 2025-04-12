const express = require("express");
const { body, validationResult } = require("express-validator");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");
const router = express.Router();

router.post(
    "/",
    [
        auth,
        body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be positive"),
        body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense"),
        body("category").notEmpty().withMessage("Category is required"),
        body("date").isISO8601().withMessage("Invalid date format"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
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
    }
);

// ... (keep GET, PUT, DELETE routes from above)

module.exports = router;
router.get("/summary", auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.userId });
        const income = transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);
        res.json({ income, expenses, balance: income - expenses });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});






const User = require("../models/User");



router.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.put(
    "/profile",
    [
        auth,
        body("name").notEmpty().withMessage("Name is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user = await User.findById(req.userId);
            if (!user) return res.status(404).json({ message: "User not found" });
            user.name = req.body.name;
            await user.save();
            res.json({ name: user.name });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;
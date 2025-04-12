const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const router = express.Router();

router.post(
    "/signup",
    [
        body("email").isEmail().withMessage("Invalid email"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
        body("name").notEmpty().withMessage("Name is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, name } = req.body;
        try {
            let user = await User.findOne({ email });
            if (user) return res.status(400).json({ message: "User already exists" });
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = new User({ email, password: hashedPassword, name });
            await user.save();
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.json({ token });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Invalid email"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) return res.status(400).json({ message: "Invalid credentials" });
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.json({ token });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;
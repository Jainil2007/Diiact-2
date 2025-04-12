const express = require("express");
const { body, validationResult } = require("express-validator");
const Category = require("../models/Category"); // Import, not redefine
const auth = require("../middleware/auth");
const router = express.Router();

router.post(
    "/",
    [
        auth,
        body("name").notEmpty().withMessage("Category name is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const category = new Category({
                userId: req.userId,
                name: req.body.name,
            });
            await category.save();
            res.json(category);
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.get("/", auth, async (req, res) => {
    try {
        const categories = await Category.find({ userId: req.userId });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category || category.userId.toString() !== req.userId) {
            return res.status(404).json({ message: "Category not found" });
        }
        await Category.deleteOne({ _id: req.params.id });
        res.json({ message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
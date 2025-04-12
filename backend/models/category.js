const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
});

// Check if model is already registered
module.exports = mongoose.models.Category || mongoose.model("Category", categorySchema);
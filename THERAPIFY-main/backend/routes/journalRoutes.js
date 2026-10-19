
const express = require("express");
const Journal = require("../models/Journal");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Save a journal entry
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, body, mood, tag } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({
        message: "Journal content is required",
      });
    }

    const entry = await Journal.create({
      user: req.user.userId,
      title: title?.trim() || "Untitled entry",
      body: body.trim(),
      mood: mood || "Not specified",
      tag: tag || "Personal",
    });

    res.status(201).json({
      message: "Journal entry saved successfully",
      entry,
    });
  } catch (error) {
    console.error("Save journal error:", error.message);
    res.status(500).json({
      message: "Could not save journal entry",
    });
  }
});

// Get the signed-in user's journal entries
router.get("/", authMiddleware, async (req, res) => {
  try {
    const entries = await Journal.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({ entries });
  } catch (error) {
    console.error("Fetch journal error:", error.message);
    res.status(500).json({
      message: "Could not load journal entries",
    });
  }
});
// Update a journal entry
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, body, mood, tag } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({
        message: "Journal content is required",
      });
    }

    const entry = await Journal.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId,
      },
      {
        title: title?.trim() || "Untitled entry",
        body: body.trim(),
        mood: mood || "Not specified",
        tag: tag || "Personal",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!entry) {
      return res.status(404).json({
        message: "Journal entry not found",
      });
    }

    res.status(200).json({
      message: "Journal entry updated successfully",
      entry,
    });
  } catch (error) {
    console.error("Update journal error:", error.message);
    res.status(500).json({
      message: "Could not update journal entry",
    });
  }
});

// Delete a journal entry
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Journal entry not found",
      });
    }

    res.status(200).json({
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete journal error:", error.message);
    res.status(500).json({
      message: "Could not delete journal entry",
    });
  }
});
module.exports = router;

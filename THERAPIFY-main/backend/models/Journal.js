
const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      default: "Untitled entry",
      maxlength: 200,
    },

    body: {
      type: String,
      required: true,
      trim: true,
    },

    mood: {
      type: String,
      default: "Not specified",
    },

    tag: {
      type: String,
      default: "Personal",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Journal", journalSchema);

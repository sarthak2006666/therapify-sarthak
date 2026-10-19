const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  shortDescription: { type: String, required: true, trim: true, maxlength: 300 },
  description: { type: String, required: true },
  coverImage: { type: String, default: "" },
  category: { type: String, required: true, enum: ["Mindfulness", "Meditation", "Stress Management", "Anxiety Support", "Emotional Wellness", "Self-Care", "Yoga", "Expert Workshops"] },
  tags: { type: [String], default: [] },
  outcomes: { type: [String], default: [] },
  agenda: { type: [{ time: String, title: String, description: String }], default: [] },
  host: { name: { type: String, required: true }, bio: { type: String, default: "" }, credentials: { type: String, default: "" }, image: { type: String, default: "" } },
  startsAt: { type: Date, required: true, index: true },
  endsAt: { type: Date, required: true },
  timezone: { type: String, default: "Asia/Kolkata" },
  format: { type: String, enum: ["Online", "In-person"], required: true },
  venue: { type: String, default: "" },
  meetingUrl: { type: String, default: "" },
  pricePaise: { type: Number, min: 0, default: 0, required: true },
  currency: { type: String, default: "INR", enum: ["INR"] },
  feeBps: { type: Number, min: 0, default: 0 },
  capacity: { type: Number, min: 1, required: true },
  enrolledCount: { type: Number, min: 0, default: 0 },
  requirements: { type: [String], default: [] },
  cancellationPolicy: { type: String, default: "Contact the host if your plans change. Refunds for paid events are handled according to the event policy." },
  faqs: { type: [{ question: String, answer: String }], default: [] },
  published: { type: Boolean, default: false, index: true },
  sampleContent: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

eventSchema.index({ published: 1, startsAt: 1, category: 1 });
module.exports = mongoose.model("Event", eventSchema);

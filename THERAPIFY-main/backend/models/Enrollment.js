const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  reference: { type: String, required: true, unique: true, index: true },
  amountPaise: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "INR" },
  paymentGateway: { type: String, enum: ["none", "razorpay"], default: "none" },
  gatewayOrderId: { type: String, default: "" },
  gatewayPaymentId: { type: String, default: "" },
  paymentStatus: { type: String, enum: ["not_required", "pending", "paid", "failed", "refund_requested", "refunded", "expired"], default: "not_required" },
  status: { type: String, enum: ["confirmed", "pending", "cancelled", "completed", "expired"], default: "confirmed" },
  holdExpiresAt: { type: Date, default: null },
  enrolledAt: { type: Date, default: Date.now },
  cancelledAt: { type: Date, default: null },
  refundNote: { type: String, default: "" },
}, { timestamps: true });

enrollmentSchema.index({ user: 1, event: 1 }, { unique: true });
module.exports = mongoose.model("Enrollment", enrollmentSchema);

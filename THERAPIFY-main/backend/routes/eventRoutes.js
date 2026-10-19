const express = require("express");
const crypto = require("crypto");
const Event = require("../models/Event");
const Enrollment = require("../models/Enrollment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const categories = ["Mindfulness", "Meditation", "Stress Management", "Anxiety Support", "Emotional Wellness", "Self-Care", "Yoga", "Expert Workshops"];
const sampleEvents = [
  ["mindfulness-meditation-workshop", "Mindfulness & Meditation Workshop", "Mindfulness", "A gentle introduction to mindful attention and simple meditation practices for everyday life.", "Explore a few approachable practices, notice thoughts without judgement, and create a short routine you can adapt at home.", "Dr. Mira Kapoor", "Clinical psychologist and mindfulness facilitator", 12, 49900, "Online"],
  ["managing-stress-anxiety", "Managing Stress and Anxiety", "Stress Management", "Understand your stress signals and build a personal toolkit for challenging moments.", "A supportive, educational workshop with practical reflection and grounding exercises. This is not a substitute for individual care.", "Aarav Mehta", "Counselling psychologist and wellbeing educator", 16, 0, "Online"],
  ["emotional-resilience", "Building Emotional Resilience", "Emotional Wellness", "Explore small, compassionate ways to meet difficult feelings and recover at your own pace.", "Learn about emotional awareness, values-led responses, and how to identify sources of support.", "Nisha Rao", "Psychotherapist and group facilitator", 20, 39900, "In-person"],
  ["sleep-guided-relaxation", "Sleep Better: Guided Relaxation", "Meditation", "Wind down with an optional guided relaxation and simple evening reflection.", "Try a body scan, discuss sleep-friendly routines, and take home a short wind-down guide.", "Ishita Sen", "Sleep wellness coach", 14, 19900, "Online"],
  ["journaling-mental-clarity", "Journaling for Mental Clarity", "Self-Care", "Use simple writing prompts to make space for your thoughts and intentions.", "A beginner-friendly session with guided prompts and time to write privately. Sharing is always optional.", "Rohan Das", "Expressive writing facilitator", 18, 0, "Online"],
  ["yoga-mind-body", "Yoga for Mind and Body", "Yoga", "A beginner-friendly movement and breath session with options to adapt or pause.", "Bring a mat if you have one. Movements can be done seated; please work within your comfort.", "Ananya Iyer", "Yoga instructor and wellbeing facilitator", 12, 29900, "In-person"],
  ["understanding-emotions", "Understanding Your Emotions", "Anxiety Support", "A warm, practical conversation about naming emotions and responding with curiosity.", "Explore the role of emotions, practice a short check-in, and identify what support might help.", "Dr. Kabir Shah", "Counselling psychologist", 24, 0, "Online"],
  ["self-care-sunday", "Self-Care Sunday: A Wellness Session", "Expert Workshops", "Make a little room for rest, reflection, and a self-care plan that fits real life.", "A calm mix of reflection, gentle stretching, and planning one kind action for the week ahead.", "Leela Menon", "Integrative wellness facilitator", 20, 24900, "Online"],
];

async function ensureSamples() {
  const now = Date.now();
  await Promise.all(sampleEvents.map(([slug, title, category, shortDescription, description, hostName, credentials, daysAhead, pricePaise, format], index) => {
    const startsAt = new Date(now + daysAhead * 86400000);
    startsAt.setHours(10 + (index % 6), 0, 0, 0);
    const endsAt = new Date(startsAt.getTime() + (index % 2 ? 60 : 90) * 60000);
    return Event.updateOne({ slug }, { $setOnInsert: {
      slug, title, category, shortDescription, description, host: { name: hostName, credentials, bio: `${hostName} creates welcoming, practical sessions for people exploring everyday wellbeing.` }, startsAt, endsAt, format,
      venue: format === "Online" ? "Online · joining details shared after enrollment" : "Bandra Community Studio, Mumbai", pricePaise, capacity: 30 + index * 4, enrolledCount: 0,
      outcomes: ["Explore a practical wellbeing exercise", "Reflect at your own pace", "Take away a few ideas to try"],
      agenda: [{ time: "00:00", title: "Welcome and settling in", description: "Arrive, get comfortable, and review how the session works." }, { time: "00:15", title: "Guided session", description: "Explore the topic with optional activities and reflection." }, { time: "01:05", title: "Wrap-up and questions", description: "Close with takeaways and optional questions." }],
      requirements: ["A quiet, comfortable place", "Notebook and pen optional"], faqs: [{ question: "Do I have to share personal details?", answer: "No. Participation and sharing are optional." }, { question: "Is this therapy?", answer: "No. These community sessions provide general wellbeing education, not individual treatment." }],
      published: true, sampleContent: true,
    } }, { upsert: true });
  }));
}

function credentialsConfigured() { return Boolean(process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") && process.env.RAZORPAY_KEY_SECRET); }
function createReference() { return `TH-${crypto.randomBytes(6).toString("hex").toUpperCase()}`; }
async function razorpay(path, method, body) {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method, headers: { Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.description || "Payment provider request failed");
  return data;
}
async function expirePending() {
  const expired = await Enrollment.find({ status: "pending", holdExpiresAt: { $lte: new Date() } }).select("event").lean();
  if (!expired.length) return;
  const ids = await Enrollment.updateMany({ status: "pending", holdExpiresAt: { $lte: new Date() } }, { $set: { status: "expired", paymentStatus: "expired" } });
  if (ids.modifiedCount) {
    const counts = new Map();
    expired.forEach(({ event }) => counts.set(String(event), (counts.get(String(event)) || 0) + 1));
    await Promise.all([...counts].map(([eventId, count]) => Event.updateOne({ _id: eventId }, { $inc: { enrolledCount: -count } })));
  }
}

router.get("/", async (req, res) => {
  try {
    await ensureSamples(); await expirePending();
    const { q = "", category, format, sort = "upcoming", page = "1", limit = "12" } = req.query;
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(24, Math.max(1, Number.parseInt(limit, 10) || 12));
    const filter = { published: true, startsAt: { $gt: new Date() } };
    if (categories.includes(category)) filter.category = category;
    if (["Online", "In-person"].includes(format)) filter.format = format;
    if (String(q).trim()) filter.$or = ["title", "category", "shortDescription", "host.name", "tags"].map((field) => ({ [field]: { $regex: String(q).trim().slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }));
    const ordering = sort === "popular" ? { enrolledCount: -1, startsAt: 1 } : sort === "price" ? { pricePaise: 1, startsAt: 1 } : { startsAt: 1 };
    const [events, total] = await Promise.all([Event.find(filter).sort(ordering).skip((pageNumber - 1) * pageSize).limit(pageSize).lean(), Event.countDocuments(filter)]);
    res.json({ events: events.map((event) => ({ ...event, availableSeats: Math.max(0, event.capacity - event.enrolledCount) })), page: pageNumber, pages: Math.ceil(total / pageSize), total });
  } catch (error) { res.status(500).json({ message: "Could not load events" }); }
});

router.get("/mine", authMiddleware, async (req, res) => {
  try {
    await expirePending();
    const enrollments = await Enrollment.find({ user: req.user.userId }).sort({ createdAt: -1 }).populate("event").lean();
    res.json({ enrollments: enrollments.filter((item) => item.event) });
  } catch (error) { res.status(500).json({ message: "Could not load your events" }); }
});

router.get("/:slug", async (req, res) => {
  try {
    await ensureSamples();
    const event = await Event.findOne({ slug: req.params.slug, published: true }).lean();
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ event: { ...event, availableSeats: Math.max(0, event.capacity - event.enrolledCount) } });
  } catch (error) { res.status(500).json({ message: "Could not load event details" }); }
});

router.post("/:id/enroll", authMiddleware, async (req, res) => {
  let reservedEvent;
  try {
    await ensureSamples(); await expirePending();
    const event = await Event.findOne({ _id: req.params.id, published: true, startsAt: { $gt: new Date() } });
    if (!event) return res.status(404).json({ message: "This event is unavailable or has already started" });
    let existing = await Enrollment.findOne({ user: req.user.userId, event: event._id });
    if (existing?.status === "confirmed") return res.status(409).json({ message: "You are already enrolled", enrollment: existing });
    // expirePending() has already released expired holds; any remaining pending
    // record still owns an active reservation and must block another attempt.
    if (existing?.status === "pending") return res.status(409).json({ message: "You already have a pending checkout for this event", enrollment: existing });
    if (event.pricePaise > 0 && !credentialsConfigured()) return res.status(503).json({ message: "Paid checkout is not configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the backend." });
    const reservation = await Event.findOneAndUpdate({ _id: event._id, published: true, startsAt: { $gt: new Date() }, $expr: { $lt: ["$enrolledCount", "$capacity"] } }, { $inc: { enrolledCount: 1 } }, { new: true });
    if (!reservation) return res.status(409).json({ message: "This event is full" });
    reservedEvent = event._id;
    const amount = Math.round(event.pricePaise * (1 + event.feeBps / 10000));
    const enrollment = existing || new Enrollment({ user: req.user.userId, event: event._id, reference: createReference() });
    enrollment.amountPaise = amount; enrollment.currency = event.currency; enrollment.status = event.pricePaise === 0 ? "confirmed" : "pending";
    enrollment.paymentStatus = event.pricePaise === 0 ? "not_required" : "pending";
    enrollment.paymentGateway = event.pricePaise === 0 ? "none" : "razorpay";
    enrollment.holdExpiresAt = event.pricePaise === 0 ? null : new Date(Date.now() + 15 * 60 * 1000);
    enrollment.cancelledAt = null;
    if (event.pricePaise > 0) {
      const order = await razorpay("/orders", "POST", { amount, currency: event.currency, receipt: enrollment.reference, notes: { eventId: String(event._id), enrollment: enrollment.reference } });
      enrollment.gatewayOrderId = order.id;
    }
    await enrollment.save();
    reservedEvent = null;
    res.status(event.pricePaise === 0 ? 201 : 200).json({ message: event.pricePaise === 0 ? "Enrollment confirmed" : "Checkout ready", enrollment, ...(event.pricePaise > 0 ? { checkout: { keyId: process.env.RAZORPAY_KEY_ID, orderId: enrollment.gatewayOrderId, amount, currency: enrollment.currency } } : {}) });
  } catch (error) {
    if (reservedEvent) await Event.updateOne({ _id: reservedEvent }, { $inc: { enrolledCount: -1 } });
    if (error.code === 11000) return res.status(409).json({ message: "You are already enrolled in this event" });
    res.status(502).json({ message: error.message || "Could not start enrollment" });
  }
});

router.post("/:id/verify-payment", authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    if (![orderId, paymentId, signature].every((item) => typeof item === "string" && item.length < 256)) return res.status(400).json({ message: "Payment verification details are required" });
    const enrollment = await Enrollment.findOne({ event: req.params.id, user: req.user.userId, gatewayOrderId: orderId, status: "pending" });
    if (!enrollment || enrollment.holdExpiresAt <= new Date()) return res.status(404).json({ message: "Pending enrollment was not found or has expired" });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest();
    const provided = Buffer.from(signature, "hex");
    if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) return res.status(400).json({ message: "Payment signature could not be verified" });
    const payment = await razorpay(`/payments/${encodeURIComponent(paymentId)}`, "GET");
    if (payment.order_id !== orderId || payment.amount !== enrollment.amountPaise || payment.currency !== enrollment.currency) return res.status(400).json({ message: "Payment details do not match this enrollment" });
    if (payment.status === "authorized") await razorpay(`/payments/${encodeURIComponent(paymentId)}/capture`, "POST", { amount: enrollment.amountPaise, currency: enrollment.currency });
    const verified = await razorpay(`/payments/${encodeURIComponent(paymentId)}`, "GET");
    if (verified.status !== "captured") return res.status(402).json({ message: "Payment has not been captured. Your enrollment remains pending." });
    const confirmed = await Enrollment.findOneAndUpdate(
      { _id: enrollment._id, status: "pending", paymentStatus: "pending", holdExpiresAt: { $gt: new Date() } },
      { $set: { gatewayPaymentId: paymentId, paymentStatus: "paid", status: "confirmed", holdExpiresAt: null } },
      { new: true }
    );
    if (!confirmed) {
      await Enrollment.updateOne({ _id: enrollment._id, paymentStatus: { $ne: "paid" } }, { $set: { gatewayPaymentId: paymentId, paymentStatus: "refund_requested", refundNote: "Payment captured after enrollment was cancelled or expired; manual refund follow-up required." } });
      return res.status(409).json({ message: "Payment was captured after this seat reservation ended. Please contact support to arrange a refund." });
    }
    res.json({ message: "Payment verified and enrollment confirmed", enrollment: confirmed });
  } catch (error) { res.status(502).json({ message: "Could not verify payment with the payment provider" }); }
});

router.post("/enrollment/:enrollmentId/cancel", authMiddleware, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ _id: req.params.enrollmentId, user: req.user.userId });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
    if (enrollment.paymentStatus === "refund_requested") return res.status(409).json({ message: "A refund request is already recorded for this enrollment." });
    if (enrollment.paymentStatus === "paid") {
      const refund = await Enrollment.findOneAndUpdate({ _id: enrollment._id, user: req.user.userId, status: "confirmed", paymentStatus: "paid" }, { $set: { paymentStatus: "refund_requested", refundNote: "Refund request submitted by attendee" } }, { new: true });
      return refund ? res.json({ message: "Refund request recorded. Please contact the event host to complete it.", enrollment: refund }) : res.status(409).json({ message: "Enrollment status changed. Refresh and try again." });
    }
    const cancelled = await Enrollment.findOneAndUpdate({ _id: enrollment._id, user: req.user.userId, status: { $in: ["confirmed", "pending"] }, paymentStatus: { $ne: "paid" } }, { $set: { status: "cancelled", cancelledAt: new Date(), paymentStatus: enrollment.paymentStatus === "pending" ? "failed" : enrollment.paymentStatus } }, { new: true });
    if (!cancelled) return res.status(409).json({ message: "Enrollment status changed. Refresh and try again." });
    await Event.updateOne({ _id: cancelled.event, enrolledCount: { $gt: 0 } }, { $inc: { enrolledCount: -1 } });
    res.json({ message: "Enrollment cancelled", enrollment: cancelled });
  } catch (error) { res.status(500).json({ message: "Could not cancel enrollment" }); }
});

router.post("/", authMiddleware, async (req, res) => {
  if (!["admin", "therapist"].includes(req.user.role)) return res.status(403).json({ message: "Only event hosts can create events" });
  const input = req.body || {};
  if (typeof input.title !== "string" || !input.title.trim() || typeof input.shortDescription !== "string" || !categories.includes(input.category) || !Number.isInteger(input.pricePaise) || input.pricePaise < 0 || input.pricePaise > 100000000 || (input.feeBps !== undefined && (!Number.isInteger(input.feeBps) || input.feeBps < 0 || input.feeBps > 10000)) || !Number.isInteger(input.capacity) || input.capacity < 1 || !Number.isFinite(Date.parse(input.startsAt)) || !Number.isFinite(Date.parse(input.endsAt)) || Date.parse(input.endsAt) <= Date.parse(input.startsAt) || !["Online", "In-person"].includes(input.format)) return res.status(400).json({ message: "Please provide valid event details" });
  try {
    const slug = (input.slug || input.title).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const event = await Event.create({ ...input, title: input.title.trim(), slug, createdBy: req.user.userId, published: false, enrolledCount: 0, pricePaise: Math.round(input.pricePaise) });
    res.status(201).json({ event });
  } catch (error) { res.status(error.code === 11000 ? 409 : 400).json({ message: "Could not create event. Check its slug and details." }); }
});

router.patch("/:id/manage", authMiddleware, async (req, res) => {
  if (!["admin", "therapist"].includes(req.user.role)) return res.status(403).json({ message: "Only event hosts can manage events" });
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (req.user.role !== "admin" && String(event.createdBy) !== req.user.userId) return res.status(403).json({ message: "You can only manage events you created" });
    const editable = ["title", "shortDescription", "description", "coverImage", "category", "tags", "outcomes", "agenda", "host", "startsAt", "endsAt", "timezone", "format", "venue", "meetingUrl", "pricePaise", "feeBps", "capacity", "requirements", "cancellationPolicy", "faqs", "published"];
    for (const key of editable) if (req.body[key] !== undefined) event[key] = req.body[key];
    if (event.capacity < event.enrolledCount) return res.status(409).json({ message: "Capacity cannot be lower than current enrollments" });
    if (event.pricePaise < 0 || event.pricePaise > 100000000 || !Number.isInteger(event.pricePaise) || event.feeBps < 0 || event.feeBps > 10000 || !Number.isInteger(event.feeBps) || !Number.isInteger(event.capacity) || event.capacity < 1 || event.endsAt <= event.startsAt || (event.published && event.startsAt <= new Date()) || !categories.includes(event.category)) return res.status(400).json({ message: "Event details are invalid" });
    await event.save();
    res.json({ event });
  } catch (error) { res.status(400).json({ message: "Could not update event" }); }
});

router.get("/:id/attendees", authMiddleware, async (req, res) => {
  if (!["admin", "therapist"].includes(req.user.role)) return res.status(403).json({ message: "Only event hosts can view attendee lists" });
  try {
    const event = await Event.findById(req.params.id).select("createdBy");
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (req.user.role !== "admin" && String(event.createdBy) !== req.user.userId) return res.status(403).json({ message: "You can only view attendees for events you created" });
    const attendees = await Enrollment.find({ event: req.params.id }).populate("user", "name email").select("reference status paymentStatus amountPaise enrolledAt user").lean();
    res.json({ attendees });
  } catch (error) { res.status(500).json({ message: "Could not load attendee list" }); }
});

module.exports = router;

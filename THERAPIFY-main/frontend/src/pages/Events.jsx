import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Activity, ArrowDownWideNarrow, ArrowRight, CalendarDays, CheckCircle2, Clock3, Copy, ExternalLink, Heart, MapPin, Search, ShieldCheck, Sparkles, Users, Video, Wind, X } from "lucide-react";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/events`;
const categories = ["All Events", "Mindfulness", "Meditation", "Stress Management", "Anxiety Support", "Emotional Wellness", "Self-Care", "Yoga", "Expert Workshops"];
const art = ["from-[#ded6f5] via-[#e8e2f8] to-[#f5f1ff]", "from-[#d9eafa] via-[#e7f1fb] to-[#f4f9fd]", "from-[#e4e9d8] via-[#eff1e8] to-[#f9f8f1]", "from-[#f1dfd6] via-[#f7ebe5] to-[#fcf6f1]", "from-[#dcece8] via-[#e8f3f0] to-[#f6faf8]", "from-[#e6e0f2] via-[#f0edf7] to-[#faf9fc]"];
const illustrations = [Sparkles, Wind, Heart, Activity, CalendarDays, Users];
const formatPrice = (paise) => paise === 0 ? "Free" : `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const dateTime = (value, options = {}) => new Date(value).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", ...options });
const dateOnly = (value) => new Date(value).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "long", year: "numeric" });

function EventArt({ index, className = "" }) {
  const Icon = illustrations[index % illustrations.length];
  return <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${art[index % art.length]} ${className}`}><span className="absolute -right-7 -top-12 h-40 w-40 rounded-full border border-white/70"/><span className="absolute -bottom-14 -left-8 h-36 w-36 rounded-full border border-white/70"/><span className="relative flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/80 bg-white/60 text-[#6b688b] shadow-sm backdrop-blur-sm"><Icon size={29} strokeWidth={1.7}/></span></div>;
}

function Modal({ title, onClose, children, wide = false }) {
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#252739]/35 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" aria-label={title} className={`max-h-[92vh] w-full overflow-y-auto rounded-3xl border border-white/70 bg-[#fffdfa] shadow-2xl ${wide ? "max-w-3xl" : "max-w-md"}`}><div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eeebf2] bg-[#fffdfa]/95 px-5 py-4 backdrop-blur sm:px-7"><h2 className="font-display text-xl font-medium text-[#383743]">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-full p-2 text-[#6d6b76] transition hover:bg-[#f1eef5]"><X size={18}/></button></div><div className="p-5 sm:p-7">{children}</div></div></div>;
}

function makeCalendarFile(enrollment) {
  const event = enrollment.event;
  const toStamp = (value) => new Date(value).toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
  const escapeText = (text) => String(text || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Therapify//Events//EN", "BEGIN:VEVENT", `UID:${enrollment.reference}@therapify`, `DTSTAMP:${toStamp(new Date())}`, `DTSTART:${toStamp(event.startsAt)}`, `DTEND:${toStamp(event.endsAt)}`, `SUMMARY:${escapeText(event.title)}`, `DESCRIPTION:${escapeText(event.shortDescription)}`, `LOCATION:${escapeText(event.venue)}`, "END:VEVENT", "END:VCALENDAR"];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${event.slug}.ics`; anchor.click(); URL.revokeObjectURL(url);
}

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [events, setEvents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Events");
  const [format, setFormat] = useState("All formats");
  const [sort, setSort] = useState("upcoming");
  const [tab, setTab] = useState(() => searchParams.get("tab") === "mine" && Boolean(token) ? "mine" : "discover");
  const [loading, setLoading] = useState(true);
  const [myLoading, setMyLoading] = useState(Boolean(token));
  const [enrollmentError, setEnrollmentError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true); setError("");
    const query = new URLSearchParams({ q: search, sort, page: "1", limit: "24" });
    if (category !== "All Events") query.set("category", category);
    if (format !== "All formats") query.set("format", format);
    try {
      const response = await fetch(`${API}?${query}`); const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load events.");
      setEvents(data.events || []);
    } catch (requestError) { setError(requestError instanceof TypeError ? "We couldn't connect to the events service. Check that the backend is running." : requestError.message); }
    finally { setLoading(false); }
  }, [search, category, format, sort]);

  const loadMine = useCallback(async () => {
    if (!token) { setEnrollments([]); setMyLoading(false); return; }
    setMyLoading(true);
    setEnrollmentError("");
    try {
      const response = await fetch(`${API}/mine`, { headers: { Authorization: `Bearer ${token}` } }); const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load your events.");
      setEnrollments(data.enrollments || []);
    } catch (requestError) { setEnrollmentError(requestError instanceof TypeError ? "We couldn't connect to your enrollment details. Please retry." : requestError.message); }
    finally { setMyLoading(false); }
  }, [token]);

  useEffect(() => { const timer = setTimeout(loadEvents, 180); return () => clearTimeout(timer); }, [loadEvents]);
  useEffect(() => { loadMine(); }, [loadMine]);
  useEffect(() => { if (searchParams.get("tab") === "mine" && token) setTab("mine"); }, [searchParams, token]);
  useEffect(() => {
    const slug = searchParams.get("event");
    if (!slug) return;
    fetch(`${API}/${encodeURIComponent(slug)}`).then((response) => response.json()).then((data) => { if (data.event) setSelected(data.event); }).catch(() => {});
  }, [searchParams]);

  const visibleEnrollments = useMemo(() => enrollments.slice().sort((a, b) => new Date(a.event.startsAt) - new Date(b.event.startsAt)), [enrollments]);
  const enrollmentStatusByEventId = useMemo(() => {
    const statuses = new Map();
    enrollments.forEach((enrollment) => {
      const eventId = enrollment.event?._id;
      if (!eventId) return;
      if (enrollment.paymentStatus === "refund_requested") statuses.set(String(eventId), "refund_requested");
      else if (enrollment.status === "confirmed" && ["paid", "not_required"].includes(enrollment.paymentStatus)) statuses.set(String(eventId), "confirmed");
      else if (["confirmed", "pending"].includes(enrollment.status)) statuses.set(String(eventId), enrollment.paymentStatus === "failed" ? "failed" : "pending");
    });
    return statuses;
  }, [enrollments]);
  const openEnrollment = () => { setTab("mine"); setSelected(null); setConfirmation(null); setSearchParams({ tab: "mine" }); loadMine(); };
  const syncEnrollment = (enrollment, event) => {
    if (!enrollment) return;
    const saved = { ...enrollment, event };
    setEnrollments((current) => [saved, ...current.filter((item) => String(item.event?._id || item.event) !== String(event._id))]);
  };
  const openDetails = async (event) => {
    setSelected(event); setNotice("");
    try { const response = await fetch(`${API}/${encodeURIComponent(event.slug)}`); const data = await response.json(); if (response.ok) setSelected(data.event); }
    catch { /* Keep the already loaded event card details available. */ }
  };

  const startEnrollment = (event) => {
    if (!token) { navigate("/signin", { state: { from: `/events?event=${encodeURIComponent(event.slug)}` } }); return; }
    setConfirmation(event);
  };

  const enroll = async (event) => {
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${API}/${event._id}/enroll`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Enrollment could not be started.");
      syncEnrollment(data.enrollment, event);
      if (event.pricePaise > 0) {
        const loadCheckout = () => new Promise((resolve, reject) => {
          if (window.Razorpay) return resolve();
          const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.onload = resolve; script.onerror = () => reject(new Error("Could not load secure checkout. Your enrollment remains pending.")); document.body.appendChild(script);
        });
        await loadCheckout();
        const checkout = new window.Razorpay({ key: data.checkout.keyId, order_id: data.checkout.orderId, amount: data.checkout.amount, currency: data.checkout.currency, name: "Therapify", description: event.title, handler: async (payment) => {
          try {
            const verify = await fetch(`${API}/${event._id}/verify-payment`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payment) });
            const verified = await verify.json(); if (!verify.ok) throw new Error(verified.message || "Payment verification did not complete.");
            syncEnrollment(verified.enrollment, event); setNotice("Payment verified. Your place is confirmed."); setConfirmation(null); setSelected(null);
          } catch (verifyError) { setError(verifyError.message); }
        }, modal: { ondismiss: () => { setNotice("Checkout closed. Your seat is held briefly while this payment is pending."); } }, theme: { color: "#72689a" } });
        checkout.open(); setConfirmation(null);
      } else {
        setNotice("You’re enrolled. We’ve saved your place."); setConfirmation(null); setSelected(null);
      }
    } catch (requestError) { setError(requestError.message); if (requestError.message.includes("already enrolled") || requestError.message.includes("pending checkout")) loadMine(); }
    finally { setSaving(false); }
  };

  const cancelEnrollment = async (enrollment) => {
    if (!window.confirm(enrollment.paymentStatus === "paid" ? "Submit a refund request for this paid enrollment?" : "Cancel this enrollment?")) return;
    try {
      const response = await fetch(`${API}/enrollment/${enrollment._id}/cancel`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update enrollment.");
      setNotice(data.message); loadMine(); loadEvents();
    } catch (requestError) { setError(requestError.message); }
  };

  const shareEvent = async (event) => {
    const url = `${window.location.origin}/events?event=${encodeURIComponent(event.slug)}`;
    try { await navigator.clipboard.writeText(url); setNotice("Event link copied."); }
    catch { setNotice(url); }
  };

  const enrollmentLabel = (status) => ({ confirmed: "✓ Enrolled", pending: "Payment pending", failed: "Payment failed", refund_requested: "Refund requested" })[status] || "";
  const enrollmentActionLabel = (event, status) => {
    if (status === "confirmed") return "Already Enrolled";
    if (status) return "View Enrollment";
    if (token && myLoading) return "Checking…";
    if (token && enrollmentError) return "Status unavailable";
    return event.availableSeats > 0 ? "Enroll Now" : "Full";
  };
  const enrollmentUnavailable = Boolean(token) && (myLoading || Boolean(enrollmentError));
  const selectedEnrollmentStatus = selected ? enrollmentStatusByEventId.get(String(selected._id)) : undefined;

  return <main className="min-h-screen bg-[#f7f6fb] px-4 pb-20 pt-24 text-[#393844] sm:px-6">
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 overflow-hidden rounded-[30px] border border-white/80 bg-gradient-to-br from-[#eeebf8] via-[#f4f5fb] to-[#e9f1f8] px-6 py-8 sm:px-10 sm:py-10">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/65 px-3 py-1.5 text-xs font-medium text-[#777091]"><Sparkles size={13}/> Make space for your wellbeing</span><h1 className="mt-5 font-display text-4xl font-medium tracking-tight sm:text-5xl">Discover Events</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#6f6c7d] sm:text-base">Take a step towards a healthier, happier you. Find welcoming sessions to learn, pause, and connect.</p></div><div className="flex w-fit gap-2 rounded-2xl border border-white/80 bg-white/55 p-1.5"><button type="button" onClick={() => { setTab("discover"); setSearchParams({}); }} className={`rounded-xl px-4 py-2.5 text-sm font-medium ${tab === "discover" ? "bg-white text-[#514c6b] shadow-sm" : "text-[#777485]"}`}>Discover</button><button type="button" onClick={() => { if (!token) navigate("/signin", { state: { from: "/events?tab=mine" } }); else { setTab("mine"); setSearchParams({ tab: "mine" }); loadMine(); } }} className={`rounded-xl px-4 py-2.5 text-sm font-medium ${tab === "mine" ? "bg-white text-[#514c6b] shadow-sm" : "text-[#777485]"}`}>My Events</button></div></div>
      </div>

      {notice && <div role="status" className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-[#cedfcf] bg-[#f0f8f0] px-4 py-3 text-sm text-[#426147]"><span className="flex items-center gap-2"><CheckCircle2 size={17}/>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={16}/></button></div>}
      {error && <div role="alert" className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-[#eed3d1] bg-[#fff5f4] px-4 py-3 text-sm text-[#914f4b]"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={16}/></button></div>}
      {token && enrollmentError && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#eed3d1] bg-[#fff8f7] px-4 py-3 text-sm text-[#875c58]"><span>{enrollmentError} Enrollment buttons are disabled until status can be checked.</span><button type="button" onClick={loadMine} className="rounded-full border border-[#e7d2d0] bg-white px-3.5 py-2 text-xs font-medium">Retry</button></div>}

      {tab === "discover" ? <>
        <div className="mb-6 rounded-2xl border border-[#ebe8f0] bg-white p-4 shadow-[0_4px_20px_rgba(55,53,70,0.035)] sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row"><label className="relative min-w-0 flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9591a2]"/><span className="sr-only">Search events by title, topic, or host</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events, topics, or hosts" className="w-full rounded-xl border border-[#e9e7ed] bg-[#fcfbfd] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#a39abf] focus:ring-2 focus:ring-[#a39abf]/15"/></label><div className="flex flex-wrap gap-2"><label className="flex items-center gap-2 rounded-xl border border-[#e9e7ed] px-3 text-xs text-[#797684]"><span className="sr-only">Event format</span><Video size={15}/><select aria-label="Event format" value={format} onChange={(event) => setFormat(event.target.value)} className="bg-transparent py-3 text-sm text-[#504e59] outline-none"><option>All formats</option><option>Online</option><option>In-person</option></select></label><label className="flex items-center gap-2 rounded-xl border border-[#e9e7ed] px-3 text-xs text-[#797684]"><ArrowDownWideNarrow size={15}/><select aria-label="Sort events" value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent py-3 text-sm text-[#504e59] outline-none"><option value="upcoming">Upcoming</option><option value="popular">Most Popular</option><option value="price">Price: Low to High</option></select></label></div></div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Event categories">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition ${category === item ? "border-[#77709c] bg-[#77709c] text-white" : "border-[#e9e7ed] bg-white text-[#716f7a] hover:border-[#b9b3ce] hover:bg-[#faf9fc]"}`}>{item}</button>)}</div>
        </div>

        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{category === "All Events" ? "Upcoming sessions" : category}</h2><p className="text-xs text-[#83808d]">Event times shown in your local timezone</p></div>
        {loading ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[1,2,3,4,5,6].map((item) => <div key={item} className="h-[390px] animate-pulse rounded-2xl border border-[#ebe8f0] bg-white"><div className="h-44 rounded-t-2xl bg-[#efedf4]"/><div className="space-y-3 p-5"><div className="h-4 w-2/3 rounded bg-[#efedf4]"/><div className="h-3 rounded bg-[#f3f2f6]"/><div className="h-3 w-4/5 rounded bg-[#f3f2f6]"/></div></div>)}</div> : events.length === 0 ? <div className="rounded-3xl border border-dashed border-[#dcd8e6] bg-white px-6 py-16 text-center"><CalendarDays size={30} className="mx-auto text-[#9690ad]"/><h3 className="mt-4 font-display text-xl">No matching events yet</h3><p className="mt-2 text-sm text-[#7c7986]">Try another search or category to see what’s coming up.</p><button type="button" onClick={() => { setSearch(""); setCategory("All Events"); setFormat("All formats"); }} className="mt-4 text-sm font-medium text-[#6f6792] underline">Clear filters</button></div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{events.map((event, index) => {
          const enrollmentStatus = enrollmentStatusByEventId.get(String(event._id));
          const statusLoading = Boolean(token) && myLoading;
          const statusUnavailable = Boolean(token) && Boolean(enrollmentError);
          const alreadyConfirmed = enrollmentStatus === "confirmed";
          return <article key={event._id} className="group overflow-hidden rounded-2xl border border-[#eae7ef] bg-white shadow-[0_6px_26px_rgba(55,53,70,0.045)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_13px_34px_rgba(55,53,70,0.10)]"><div className="relative"><EventArt index={index} className="h-44"/><div className="absolute left-4 top-4 flex flex-wrap gap-2"><span className="rounded-full border border-white/80 bg-white/85 px-3 py-1 text-[11px] font-medium text-[#615d72] backdrop-blur">{event.category}</span>{enrollmentStatus && <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${enrollmentStatus === "confirmed" ? "bg-[#e3f2e5] text-[#32653b]" : "bg-[#fff2d9] text-[#805d1d]"}`}>{enrollmentLabel(enrollmentStatus)}</span>}{event.sampleContent && <span className="rounded-full bg-[#625b7c]/90 px-3 py-1 text-[10px] font-medium text-white">Sample event</span>}</div><span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#474652] shadow-sm">{event.pricePaise === 0 ? "Free" : formatPrice(event.pricePaise)}</span></div><div className="p-5"><div className="flex items-center gap-2 text-xs text-[#807d89]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0edf7] text-[10px] font-semibold text-[#777091]">{event.host?.name?.split(/\s+/).map((part) => part[0]).slice(0,2).join("")}</span><span>{event.host?.name}</span><span aria-hidden="true">·</span><span>{event.host?.credentials?.split(" and ")[0]}</span></div><h3 className="mt-3 line-clamp-2 font-display text-xl font-medium leading-7 text-[#3f3d49]">{event.title}</h3><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#777582]">{event.shortDescription}</p><div className="mt-4 space-y-2 text-xs text-[#777582]"><p className="flex items-center gap-2"><CalendarDays size={14} className="shrink-0 text-[#8e87a9]"/>{dateTime(event.startsAt)}</p><p className="flex items-center gap-2"><Clock3 size={14} className="shrink-0 text-[#8e87a9]"/>{Math.round((new Date(event.endsAt)-new Date(event.startsAt))/60000)} min <span>·</span><span className="flex items-center gap-1">{event.format === "Online" ? <Video size={13}/> : <MapPin size={13}/>} {event.format}</span></p></div><div className="mt-4 flex items-center justify-between border-t border-[#f0eef3] pt-4 text-xs"><span className="flex items-center gap-1.5 text-[#777582]"><Users size={14}/>{event.enrolledCount} enrolled{event.availableSeats <= 5 && event.availableSeats > 0 ? ` · ${event.availableSeats} seats left` : ""}</span><span className="text-[#918d9b]">{event.capacity} places</span></div><div className="mt-4 grid grid-cols-[1fr_auto] gap-2"><button type="button" onClick={() => openDetails(event)} className="rounded-full border border-[#ddd9e7] px-4 py-2.5 text-sm font-medium text-[#5d5874] transition hover:bg-[#f8f7fb]">View Details</button><button type="button" disabled={saving || statusLoading || statusUnavailable || alreadyConfirmed || (!enrollmentStatus && event.availableSeats <= 0)} onClick={() => enrollmentStatus ? openEnrollment() : startEnrollment(event)} className="rounded-full bg-[#716a91] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#625c80] disabled:cursor-not-allowed disabled:opacity-45">{enrollmentActionLabel(event, enrollmentStatus)}</button></div></div></article>;
        })}</div>}
        <p className="mt-8 text-center text-xs text-[#888591]">Sessions offer general wellbeing education and are not a substitute for professional care. Sample events are clearly marked.</p>
      </> : <section><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold">My Events</h2><p className="mt-1 text-sm text-[#7e7b88]">Your enrollments and event details in one place.</p></div><button type="button" onClick={loadMine} className="rounded-full border border-[#dedbe6] bg-white px-4 py-2 text-sm">Refresh</button></div>
        {myLoading ? <div className="space-y-3">{[1,2].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-white"/>)}</div> : visibleEnrollments.length === 0 ? <div className="rounded-3xl border border-dashed border-[#dcd8e6] bg-white px-6 py-16 text-center"><CalendarDays size={30} className="mx-auto text-[#9690ad]"/><h3 className="mt-4 font-display text-xl">Your next event starts here</h3><p className="mt-2 text-sm text-[#7c7986]">When you enroll, your sessions and tickets will appear here.</p><button onClick={() => { setTab("discover"); setSearchParams({}); }} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#6f6792]">Browse events <ArrowRight size={15}/></button></div> : <div className="space-y-4">{visibleEnrollments.map((enrollment, index) => {
          const event = enrollment.event; const past = new Date(event.endsAt) < new Date(); const confirmed = enrollment.status === "confirmed";
          return <article key={enrollment._id} className="grid overflow-hidden rounded-2xl border border-[#eae7ef] bg-white md:grid-cols-[190px_1fr]">{<EventArt index={index} className="h-36 md:h-full"/>}<div className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded-full bg-[#f0edf7] px-3 py-1 text-[11px] font-medium text-[#696382]">{past ? "Completed" : enrollment.status === "pending" ? "Payment pending" : enrollment.status}</span><h3 className="mt-2 font-display text-xl font-medium">{event.title}</h3><p className="mt-1 text-sm text-[#777582]">Hosted by {event.host?.name} · {dateTime(event.startsAt)}</p></div><div className="text-right"><p className="text-sm font-semibold">{formatPrice(enrollment.amountPaise)}</p><p className="mt-1 text-xs text-[#86838e]">{enrollment.paymentStatus.replaceAll("_", " ")}</p></div></div><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-lg bg-[#f8f7fb] px-3 py-2 text-xs text-[#706d7a]">Ticket {enrollment.reference}</span>{confirmed && <button onClick={() => setConfirmation({ ticket: enrollment })} className="rounded-full bg-[#716a91] px-4 py-2 text-xs font-medium text-white">View Ticket</button>}{confirmed && <button onClick={() => makeCalendarFile(enrollment)} className="rounded-full border border-[#dedbe6] px-4 py-2 text-xs font-medium">Add to calendar</button>}{confirmed && !past && event.format === "Online" && event.meetingUrl && <a href={event.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-[#dedbe6] px-4 py-2 text-xs font-medium">Join event <ExternalLink size={12}/></a>}{(confirmed || enrollment.status === "pending") && enrollment.paymentStatus !== "refund_requested" && <button onClick={() => cancelEnrollment(enrollment)} className="rounded-full border border-[#e9d8d7] px-4 py-2 text-xs font-medium text-[#935e5b]">{enrollment.paymentStatus === "paid" ? "Request refund" : "Cancel"}</button>}{enrollment.paymentStatus === "refund_requested" && <span className="rounded-full border border-[#e9d8d7] px-4 py-2 text-xs font-medium text-[#935e5b]">Refund requested</span>}</div></div></article>;
        })}</div>}
      </section>}
    </div>

    {selected && <Modal title={selected.title} onClose={() => setSelected(null)} wide><div className="grid gap-7 md:grid-cols-[1fr_250px]"><div><div className="mb-5 flex flex-wrap gap-2"><span className="rounded-full bg-[#f0edf7] px-3 py-1 text-xs font-medium text-[#696382]">{selected.category}</span><span className="rounded-full bg-[#eff5f6] px-3 py-1 text-xs font-medium text-[#5e7a7e]">{selected.format}</span>{selected.sampleContent && <span className="rounded-full bg-[#f4f1e9] px-3 py-1 text-xs font-medium text-[#877951]">Sample event</span>}</div><p className="text-sm leading-6 text-[#706e7b]">{selected.description}</p><h3 className="mt-6 font-semibold">What you’ll explore</h3><ul className="mt-3 space-y-2">{(selected.outcomes || []).map((item) => <li key={item} className="flex gap-2 text-sm text-[#74717f]"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#7e8c7a]"/>{item}</li>)}</ul><h3 className="mt-6 font-semibold">Session agenda</h3><div className="mt-3 space-y-3">{(selected.agenda || []).map((item) => <div key={item.time + item.title} className="flex gap-3"><span className="w-12 shrink-0 text-xs font-medium text-[#89859a]">{item.time}</span><div><p className="text-sm font-medium">{item.title}</p><p className="mt-0.5 text-xs leading-5 text-[#807d89]">{item.description}</p></div></div>)}</div><h3 className="mt-6 font-semibold">Your host</h3><div className="mt-3 flex gap-3 rounded-xl bg-[#f8f7fb] p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9e4f2] text-sm font-semibold text-[#716a91]">{selected.host?.name?.split(/\s+/).map((part) => part[0]).slice(0,2).join("")}</span><div><p className="text-sm font-medium">{selected.host?.name}</p><p className="text-xs text-[#7d7988]">{selected.host?.credentials}</p><p className="mt-2 text-xs leading-5 text-[#777482]">{selected.host?.bio}</p></div></div><h3 className="mt-6 font-semibold">Good to know</h3><ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[#777482]">{(selected.requirements || []).map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-5 text-xs leading-5 text-[#85828e]">{selected.cancellationPolicy}</p><div className="mt-6"><h3 className="font-semibold">Frequently asked</h3>{(selected.faqs || []).map((faq) => <details key={faq.question} className="border-b border-[#efedf2] py-3"><summary className="cursor-pointer text-sm font-medium">{faq.question}</summary><p className="pt-2 text-xs leading-5 text-[#777482]">{faq.answer}</p></details>)}</div></div><aside className="h-fit rounded-2xl bg-[#f7f5fb] p-5"><p className="text-xs font-semibold uppercase tracking-wider text-[#88839a]">Event details</p><p className="mt-4 flex gap-2 text-sm"><CalendarDays size={16} className="shrink-0 text-[#817a9d]"/>{dateOnly(selected.startsAt)}</p><p className="mt-2 flex gap-2 text-sm"><Clock3 size={16} className="shrink-0 text-[#817a9d]"/>{dateTime(selected.startsAt, { weekday: undefined, day: undefined, month: undefined })} · {Math.round((new Date(selected.endsAt)-new Date(selected.startsAt))/60000)} min</p><p className="mt-2 flex gap-2 text-sm"><MapPin size={16} className="shrink-0 text-[#817a9d]"/>{selected.venue}</p><p className="mt-4 text-2xl font-semibold">{formatPrice(selected.pricePaise)}</p><p className="mt-1 text-xs text-[#817d8b]">{selected.availableSeats} of {selected.capacity} places currently open</p>{selectedEnrollmentStatus && <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${selectedEnrollmentStatus === "confirmed" ? "bg-[#e3f2e5] text-[#32653b]" : "bg-[#fff2d9] text-[#805d1d]"}`}>{enrollmentLabel(selectedEnrollmentStatus)}</span>}{enrollmentError && <p role="alert" className="mt-3 text-xs text-[#934c49]">{enrollmentError}</p>}{error && <p role="alert" className="mt-3 text-xs text-[#934c49]">{error}</p>}<button disabled={saving || enrollmentUnavailable || selectedEnrollmentStatus === "confirmed" || (!selectedEnrollmentStatus && selected.availableSeats <= 0)} onClick={() => selectedEnrollmentStatus ? openEnrollment() : startEnrollment(selected)} className="mt-5 w-full rounded-full bg-[#716a91] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#625c80] disabled:opacity-50">{enrollmentActionLabel(selected, selectedEnrollmentStatus)}</button><button onClick={() => shareEvent(selected)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#dedbe6] px-4 py-2.5 text-sm"><Copy size={14}/> Share event</button><p className="mt-4 flex items-start gap-2 text-[11px] leading-4 text-[#898591]"><ShieldCheck size={14} className="mt-0.5 shrink-0"/>Your place is confirmed after the enrollment or payment is verified.</p></aside></div></Modal>}

    {confirmation && confirmation.ticket && <Modal title="Your event ticket" onClose={() => setConfirmation(null)}><div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efedf6] text-[#716a91]"><CheckCircle2 size={26}/></div><p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#89859a]">Confirmed enrollment</p><h3 className="mt-2 font-display text-2xl">{confirmation.ticket.event.title}</h3><p className="mt-2 text-sm text-[#777482]">{dateTime(confirmation.ticket.event.startsAt)}</p><div className="mt-5 rounded-xl border border-dashed border-[#cfcbdc] bg-[#faf9fc] p-4"><p className="text-xs text-[#878392]">Ticket reference</p><p className="mt-1 font-mono text-lg font-semibold tracking-widest">{confirmation.ticket.reference}</p></div><button onClick={() => makeCalendarFile(confirmation.ticket)} className="mt-5 w-full rounded-full bg-[#716a91] py-3 text-sm font-medium text-white">Add to calendar</button></div></Modal>}
    {confirmation && !confirmation.ticket && <Modal title={confirmation.pricePaise === 0 ? "Confirm your place" : "Secure checkout"} onClose={() => { setConfirmation(null); setError(""); }}><p className="text-sm leading-6 text-[#777482]">{confirmation.pricePaise === 0 ? "This is a free session. Confirm to reserve a place using your signed-in account." : "Your payment will be processed securely by Razorpay. Therapify never receives or stores your card details."}</p><div className="mt-5 rounded-xl bg-[#f7f5fb] p-4"><p className="font-medium">{confirmation.title}</p><p className="mt-1 text-xs text-[#777482]">{dateTime(confirmation.startsAt)}</p><div className="mt-4 flex justify-between border-t border-[#e8e4ef] pt-3 text-sm"><span>Ticket price</span><strong>{formatPrice(confirmation.pricePaise)}</strong></div>{confirmation.pricePaise > 0 && confirmation.feeBps > 0 && <div className="mt-2 flex justify-between text-xs text-[#797583]"><span>Service fee</span><span>{formatPrice(Math.round(confirmation.pricePaise * confirmation.feeBps / 10000))}</span></div>}{confirmation.pricePaise > 0 && <div className="mt-3 flex justify-between border-t border-[#e8e4ef] pt-3 text-sm"><span>Total payable</span><strong>{formatPrice(Math.round(confirmation.pricePaise * (1 + (confirmation.feeBps || 0) / 10000)))}</strong></div>}</div>{error && <p role="alert" className="mt-4 rounded-xl bg-[#fff3f2] p-3 text-sm text-[#934c49]">{error}</p>}<button disabled={saving} onClick={() => enroll(confirmation)} className="mt-5 w-full rounded-full bg-[#716a91] py-3 text-sm font-medium text-white disabled:opacity-50">{saving ? "Processing…" : confirmation.pricePaise === 0 ? "Confirm free enrollment" : "Continue to payment"}</button>{confirmation.pricePaise > 0 && <p className="mt-3 text-center text-xs text-[#888591]">Paid checkout requires Razorpay test keys in the backend environment.</p>}</Modal>}
  </main>;
}

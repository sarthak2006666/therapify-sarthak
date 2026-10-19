import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router";
import { ArrowRight, BookOpen, CalendarDays, Check, Heart, MapPin, MessageCircle, NotebookPen, RefreshCw, Sparkles, Video, Wind } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const moods = [
  { score: 1, label: "Very low", face: "☹" },
  { score: 2, label: "Low", face: "🙁" },
  { score: 3, label: "Okay", face: "😐" },
  { score: 4, label: "Good", face: "🙂" },
  { score: 5, label: "Great", face: "😊" },
];
const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const displayDate = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function Card({ className = "", children, id }) {
  return <section id={id} className={`rounded-2xl border border-[#e8e9e2] bg-white p-5 shadow-[0_5px_24px_rgba(44,59,43,0.045)] sm:p-6 ${className}`}>{children}</section>;
}

export default function Dashboard() {
  const token = localStorage.getItem("token");
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });
  const [moodEntries, setMoodEntries] = useState([]);
  const [journals, setJournals] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const today = localDate(new Date());

  useEffect(() => {
    if (!token) return;
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/api/moods?from=${localDate(start)}&to=${localDate(end)}`, { headers }),
      fetch(`${API}/api/journals`, { headers }),
    ]).then(async ([moodResponse, journalResponse]) => {
      const [moodData, journalData] = await Promise.all([moodResponse.json(), journalResponse.json()]);
      if (!moodResponse.ok) throw new Error(moodData.message || "Could not load your mood history.");
      if (!journalResponse.ok) throw new Error(journalData.message || "Could not load your journal.");
      const entries = moodData.entries || [];
      setMoodEntries(entries);
      setJournals((journalData.entries || []).slice(0, 3));
      const todayEntry = entries.find((entry) => entry.dateStr === today);
      if (todayEntry) { setSelectedMood(todayEntry.mood); setNote(todayEntry.note || ""); }
    }).catch((err) => {
      setError(err instanceof TypeError ? "We couldn't connect to Therapify. Check that the server is running and try again." : err.message);
    }).finally(() => setLoading(false));
  }, [token, today]);

  const loadEnrolledEvents = useCallback(async () => {
    if (!token) return;
    setEventsLoading(true);
    setEventsError("");
    try {
      const response = await fetch(`${API}/api/events/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load your enrolled events.");
      setEnrolledEvents(Array.isArray(data.enrollments) ? data.enrollments : []);
    } catch (err) {
      setEventsError(err instanceof TypeError ? "We couldn't connect to your events. Please try again." : err.message);
    } finally {
      setEventsLoading(false);
    }
  }, [token]);

  useEffect(() => { loadEnrolledEvents(); }, [loadEnrolledEvents]);

  const todayEntry = moodEntries.find((entry) => entry.dateStr === today);
  const chartData = useMemo(() => {
    const byDate = new Map(moodEntries.map((entry) => [entry.dateStr, entry.mood]));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(); date.setDate(date.getDate() - (6 - index));
      return { day: date.toLocaleDateString("en", { weekday: "short" }), mood: byDate.get(localDate(date)) ?? null, date: localDate(date) };
    });
  }, [moodEntries]);
  const orderedEnrollments = useMemo(() => enrolledEvents.slice().sort((left, right) => {
    const leftUpcoming = left.status === "confirmed" && new Date(left.event?.startsAt) > new Date();
    const rightUpcoming = right.status === "confirmed" && new Date(right.event?.startsAt) > new Date();
    return Number(rightUpcoming) - Number(leftUpcoming) || new Date(left.event?.startsAt) - new Date(right.event?.startsAt);
  }), [enrolledEvents]);

  async function saveMood() {
    if (!selectedMood) { setError("Choose a mood before saving your check-in."); return; }
    setSaving(true); setError(""); setSuccess("");
    const mood = moods.find((item) => item.score === selectedMood);
    try {
      const response = await fetch(`${API}/api/moods`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mood: selectedMood, moodLabel: mood.label, emoji: mood.face, note, dateStr: today, emotions: todayEntry?.emotions || [] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Your check-in could not be saved.");
      setMoodEntries((previous) => [data.entry, ...previous.filter((entry) => entry.dateStr !== today)]);
      setSuccess("Your check-in is saved. Thank you for taking a moment for yourself.");
    } catch (err) { setError(err instanceof TypeError ? "We couldn't connect to the server. Your check-in was not saved." : err.message); }
    finally { setSaving(false); }
  }

  if (!token) return <Navigate to="/signin" replace />;
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const suggestedActivity = selectedMood && selectedMood <= 2 ? "ground" : selectedMood === 3 ? "movement" : "gratitude";

  return <main className="min-h-screen bg-[#f7f7f2] px-4 pb-16 pt-24 text-[#303a33] sm:px-6">
    <div className="mx-auto max-w-6xl">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="mb-2 text-sm font-medium text-[#71806f]">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          <h1 className="font-display text-3xl font-medium sm:text-4xl">Welcome{firstName ? `, ${firstName}` : " back"}</h1>
          <p className="mt-2 text-sm text-[#68736a]">Take a moment for yourself today. There’s no right way to feel.</p>
        </div>
        <Link to="/journal?new=1" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#496b52] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#3d5d46]"><NotebookPen size={16}/> Write a reflection</Link>
      </header>

      {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card id="check-in">
          <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#71806f]">A gentle check-in</p><h2 className="mt-2 text-xl font-semibold">How are you feeling today?</h2><p className="mt-1 text-sm text-[#788078]">Choose what feels closest. You can change it later.</p></div><span className="rounded-xl bg-[#eff3ec] p-3 text-[#55725b]"><Heart size={20}/></span></div>
          {loading ? <div className="mt-7 h-24 animate-pulse rounded-xl bg-[#f2f3ee]" aria-label="Loading mood check-in"/> : <>
            <div className="mt-6 grid grid-cols-5 gap-2" role="group" aria-label="Select today's mood">
              {moods.map((mood) => <button key={mood.score} type="button" onClick={() => { setSelectedMood(mood.score); setSuccess(""); }} aria-pressed={selectedMood === mood.score} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496b52] ${selectedMood === mood.score ? "border-[#719075] bg-[#edf3eb] text-[#34553b]" : "border-[#e8e9e2] bg-white text-[#68736a] hover:bg-[#f6f8f3]"}`}><span className="text-2xl" aria-hidden="true">{mood.face}</span>{mood.label}</button>)}
            </div>
            <label className="mt-5 block text-sm font-medium" htmlFor="mood-note">Anything you’d like to note? <span className="font-normal text-[#879087]">(optional)</span></label>
            <textarea id="mood-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} rows={2} placeholder="A word or two about how you feel…" className="mt-2 w-full resize-y rounded-xl border border-[#e8e9e2] bg-[#fdfdfa] p-3 text-sm outline-none focus:border-[#86a18a] focus:ring-2 focus:ring-[#86a18a]/20"/>
            <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" disabled={saving || !selectedMood} onClick={saveMood} className="inline-flex items-center gap-2 rounded-full bg-[#496b52] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#3d5d46] disabled:cursor-not-allowed disabled:opacity-50">{todayEntry ? "Update check-in" : "Save check-in"}<ArrowRight size={15}/></button>
              {todayEntry && <span className="text-xs text-[#71806f]">Today’s check-in: {moods.find((mood) => mood.score === todayEntry.mood)?.label || todayEntry.moodLabel}</span>}</div>
            {success && <p role="status" className="mt-3 flex items-center gap-2 text-sm text-[#416a49]"><Check size={16}/>{success}</p>}
          </>}
        </Card>

        <Card className="bg-[#edf1e9]"><div className="flex items-center gap-2 text-[#61765f]"><Sparkles size={17}/><p className="text-xs font-semibold uppercase tracking-[.12em]">A little care for today</p></div>
          <h2 className="mt-4 font-display text-2xl">Make room for a small pause.</h2><p className="mt-2 text-sm leading-6 text-[#647067]">{selectedMood && selectedMood <= 2 ? "Try a grounding exercise and gently notice what’s around you." : selectedMood === 3 ? "A few minutes of gentle movement might make a nice pause in your day." : "Take a moment to notice one small thing you appreciate today."}</p>
          <Link to={`/wellness?activity=${suggestedActivity}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[#496b52] shadow-sm hover:bg-[#f8faf6]">Explore an activity <ArrowRight size={15}/></Link>
          <p className="mt-3 text-xs text-[#788078]">A gentle suggestion, not a treatment or a promise.</p>
        </Card>

        <Card><div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#71806f]">Your recent check-ins</p><h2 className="mt-1 text-lg font-semibold">Past seven days</h2></div><Link to="/mood" className="text-sm font-medium text-[#496b52] hover:underline">Mood history</Link></div>
          {loading ? <div className="h-48 animate-pulse rounded-xl bg-[#f2f3ee]" aria-label="Loading mood history"/> : chartData.every((item) => item.mood === null) ? <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-[#f8f9f5] text-center"><Heart size={22} className="text-[#91a38f]"/><p className="mt-3 text-sm font-medium">Your week starts whenever you do.</p><p className="mt-1 text-xs text-[#7d877e]">Check in to see your mood history here.</p></div> : <div className="h-52" aria-label="Mood scores from the past seven days"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}><CartesianGrid stroke="#e9ece5" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="day" tick={{ fill: "#778178", fontSize: 12 }} axisLine={false} tickLine={false}/><YAxis domain={[1,5]} ticks={[1,2,3,4,5]} tick={{ fill: "#778178", fontSize: 11 }} axisLine={false} tickLine={false}/><Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ""} formatter={(value) => [moods.find((mood) => mood.score === value)?.label || value, "Mood"]} contentStyle={{ borderRadius: 12, borderColor: "#e8e9e2", fontSize: 12 }}/><Line type="monotone" dataKey="mood" stroke="#66866b" strokeWidth={2.5} connectNulls={false} dot={{ r: 4, fill: "#66866b", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }}/></LineChart></ResponsiveContainer></div>}
          <p className="mt-2 text-xs text-[#879087]">Mood scale: 1 very low · 5 great. Based only on your saved check-ins.</p>
        </Card>

        <Card><div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#71806f]">A space for your thoughts</p><h2 className="mt-1 text-lg font-semibold">Recent journal entries</h2></div><Link to="/journal" className="text-sm font-medium text-[#496b52] hover:underline">View journal</Link></div>
          {loading ? <div className="space-y-3"><div className="h-16 animate-pulse rounded-xl bg-[#f2f3ee]"/><div className="h-16 animate-pulse rounded-xl bg-[#f2f3ee]"/></div> : journals.length === 0 ? <div className="rounded-xl bg-[#f8f9f5] px-4 py-6 text-center"><BookOpen size={22} className="mx-auto text-[#91a38f]"/><p className="mt-2 text-sm font-medium">Your journal is ready when you are.</p><p className="mt-1 text-xs text-[#7d877e]">Start with a few words about today.</p><Link to="/journal?new=1" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#496b52]">Write your first entry <ArrowRight size={14}/></Link></div> : <div className="space-y-2">{journals.map((entry) => <Link key={entry._id} to={`/journal?entry=${encodeURIComponent(entry._id)}`} className="block rounded-xl border border-[#eff0eb] px-4 py-3 transition hover:bg-[#f8f9f5]"><div className="flex items-center justify-between gap-2"><h3 className="truncate text-sm font-medium">{entry.title || "Untitled entry"}</h3><span className="shrink-0 text-xs text-[#879087]">{displayDate(entry.createdAt)}</span></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#788078]">{entry.body}</p></Link>)}</div>}
        </Card>
      </div>

      <Card className="mt-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">My Enrolled Events</h2>
            <p className="mt-1 text-sm text-[#788078]">Keep track of the wellness events you have joined.</p>
          </div>
          {!eventsLoading && enrolledEvents.length > 3 && <Link to="/events?tab=mine" className="text-sm font-medium text-[#496b52] hover:underline">View all enrolled events <ArrowRight size={14} className="inline"/></Link>}
        </div>

        {eventsLoading ? <div className="space-y-2" role="status" aria-label="Loading enrolled events">
          {[1, 2].map((item) => <div key={item} className="h-[58px] animate-pulse rounded-xl bg-[#f4f5f1]"/>)}
          <span className="sr-only">Loading your enrolled events…</span>
        </div> : eventsError ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f8f9f5] px-4 py-3">
          <p role="alert" className="text-sm text-[#72796f]">{eventsError}</p>
          <button type="button" onClick={loadEnrolledEvents} className="inline-flex items-center gap-2 rounded-full border border-[#dce4d9] bg-white px-3.5 py-2 text-xs font-medium text-[#496b52] hover:bg-[#f8faf6]"><RefreshCw size={13}/> Retry</button>
        </div> : orderedEnrollments.length === 0 ? <div className="rounded-xl bg-[#f8f9f5] px-4 py-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <p className="max-w-2xl text-sm leading-6 text-[#68736a]">You haven't joined any events yet. Explore our wellness events and find something that's right for you.</p>
          <Link to="/events" className="mt-3 inline-flex shrink-0 items-center gap-2 rounded-full bg-[#496b52] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#3d5d46] sm:mt-0">Explore Events <ArrowRight size={14}/></Link>
        </div> : <div className="divide-y divide-[#eff0eb]">
          {orderedEnrollments.slice(0, 3).map((enrollment) => {
            const event = enrollment.event;
            if (!event) return null;
            const when = new Date(event.startsAt).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
            return <div key={enrollment._id} className="flex flex-col gap-3 py-3 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-[#3b453d]">{event.title}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7c857c]">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays size={13}/>{when}</span>
                  <span className="inline-flex items-center gap-1.5">{event.format === "Online" ? <Video size={13}/> : <MapPin size={13}/>} {event.format}</span>
                  {enrollment.status && <span className="rounded-full bg-[#eff3ec] px-2.5 py-1 text-[11px] capitalize text-[#55725b]">{enrollment.status.replaceAll("_", " ")}</span>}
                </div>
              </div>
              <Link to={`/events?event=${encodeURIComponent(event.slug)}`} className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-[#e2e7de] px-3.5 py-2 text-xs font-medium text-[#496b52] transition hover:bg-[#f8faf6]">View Event <ArrowRight size={13}/></Link>
            </div>;
          })}
        </div>}
      </Card>

      <section className="mt-5"><p className="mb-3 text-xs font-semibold uppercase tracking-[.15em] text-[#71806f]">A few ways to begin</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{[
        { label: "Chat with AI", to: "/chat", icon: MessageCircle }, { label: "Write in Journal", to: "/journal?new=1", icon: BookOpen }, { label: "Check Your Mood", to: "/mood", icon: Heart }, { label: "Try an Activity", to: "/wellness", icon: Wind }, { label: "Explore All Events", to: "/events", icon: CalendarDays },
      ].map(({ label, to, icon: Icon }) => <Link key={label} to={to} className="flex min-h-[60px] items-center gap-3 rounded-xl border border-[#e8e9e2] bg-white p-4 text-sm font-medium transition hover:border-[#b8c8b7] hover:bg-[#f8f9f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496b52]"><span className="shrink-0 rounded-lg bg-[#edf3eb] p-2 text-[#55725b]"><Icon size={17}/></span><span>{label}</span></Link>)}</div></section>
    </div>
  </main>;
}

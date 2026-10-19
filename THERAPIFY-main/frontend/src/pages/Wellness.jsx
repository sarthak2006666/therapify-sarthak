import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Wind, Moon, Heart, Sparkles, Sun, Leaf, ArrowRight, X, Search, Play, Pause, RotateCcw } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const activities = [
  { id: "breath", icon: Wind, title: "Guided Breathing", category: "Breathing", duration: "2–5 min", description: "Follow a gentle breathing rhythm at your own pace.", steps: ["Sit comfortably and relax your shoulders.", "Follow the expanding and contracting circle.", "Breathe naturally; stop if you feel uncomfortable."] },
  { id: "box", icon: Wind, title: "Box Breathing", category: "Breathing", duration: "4 min", description: "An optional structured breathing practice.", steps: ["Breathe in gently for four counts.", "Pause briefly if comfortable.", "Breathe out gently for four counts.", "Repeat only while comfortable; skip holds if preferred."] },
  { id: "sleep", icon: Moon, title: "Sleep Ritual", category: "Sleep", duration: "10 min", description: "A quiet routine to help you wind down.", steps: ["Dim the lights.", "Put your phone aside if possible.", "Relax your shoulders and jaw.", "Notice a calm, comfortable place."] },
  { id: "scan", icon: Heart, title: "Body Scan", category: "Grounding", duration: "7 min", description: "Notice body sensations without judging them.", steps: ["Sit or lie comfortably.", "Notice your feet and legs.", "Move attention gently through the rest of your body.", "Return attention to your surroundings."] },
  { id: "gratitude", icon: Sparkles, title: "Gratitude Pause", category: "Mindfulness", duration: "3 min", description: "Notice a few things you appreciate, without forcing positivity.", steps: ["Find a quiet moment.", "Think of one to three things you appreciate.", "Write them down if you like."] },
  { id: "morning", icon: Sun, title: "Morning Intention", category: "Mindfulness", duration: "5 min", description: "Choose a small intention for your day.", steps: ["Ask what would help today.", "Pick a simple intention.", "Think of one achievable action."] },
  { id: "ground", icon: Leaf, title: "5-4-3-2-1 Grounding", category: "Grounding", duration: "3 min", description: "Use your senses to notice the present moment.", steps: ["Notice five things you see.", "Notice four things you feel.", "Notice three things you hear.", "Notice two things you smell.", "Notice one thing you taste, if available."] },
  { id: "movement", icon: Sun, title: "Gentle Movement Break", category: "Movement", duration: "5 min", description: "Take a comfortable movement break.", steps: ["Stand or sit comfortably.", "Stretch your arms gently.", "Move around at an easy pace.", "Rest whenever you need to."] },
];
const categories = ["All", "Breathing", "Mindfulness", "Sleep", "Grounding", "Movement"];
const recommendations = {
  1: ["ground", "scan", "breath"], 2: ["breath", "ground", "sleep"],
  3: ["morning", "scan", "movement"], 4: ["gratitude", "movement", "morning"],
  5: ["gratitude", "morning", "movement"],
};

function BreathingTimer({ onClose }) {
  const [minutes, setMinutes] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const total = minutes * 60;
  const cycle = elapsed % 10;
  const inhale = cycle < 4;
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setElapsed((v) => Math.min(v + 1, total)), 1000);
    return () => window.clearInterval(timer);
  }, [running, total]);
  useEffect(() => { if (elapsed >= total) { setRunning(false); setFinished(true); } }, [elapsed, total]);
  return (
    <div className="space-y-5 text-center">
      <p className="text-sm text-muted-foreground">Breathe gently. You can pause or stop at any time.</p>
      <div className="flex justify-center gap-2">
        {[2,3,5].map((m) => <button key={m} disabled={running} onClick={() => { setMinutes(m); setElapsed(0); setFinished(false); }} className={`px-4 py-2 rounded-full text-xs border ${minutes === m ? "bg-primary text-primary-foreground" : "border-border"}`}>{m} min</button>)}
      </div>
      <div className="h-56 flex items-center justify-center" aria-live="polite">
        <div className={`rounded-full bg-primary/15 border-4 border-primary/30 flex items-center justify-center transition-all duration-1000 ease-in-out ${running && inhale ? "w-48 h-48" : "w-36 h-36"}`}>
          <div className="text-center"><p className="font-display text-xl">{elapsed >= total ? "Complete" : running ? inhale ? "Breathe in" : "Breathe out" : "Ready"}</p><p className="text-xs text-muted-foreground mt-2">{Math.floor((total-elapsed)/60)}:{String((total-elapsed)%60).padStart(2,"0")}</p></div>
        </div>
      </div>
      <div className="flex gap-2 justify-center">
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm flex items-center gap-2" onClick={() => { if (elapsed >= total) { setElapsed(0); setFinished(false); } setRunning(!running); }}>{running ? <Pause size={16}/> : <Play size={16}/>} {running ? "Pause" : elapsed >= total ? "Start again" : "Start / Resume"}</button>
        <button className="border border-border px-4 py-3 rounded-full text-sm flex items-center gap-2" onClick={() => { setRunning(false); setElapsed(0); setFinished(false); }}><RotateCcw size={15}/> Reset</button>
      </div>
      <button onClick={onClose} className="text-sm text-muted-foreground underline">Close exercise</button>
    </div>
  );
}

export default function Wellness() {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);
  const [optIn, setOptIn] = useState(false);
  const [mood, setMood] = useState(null);
  const [moodError, setMoodError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const activityId = searchParams.get("activity");
    if (activityId) setActive(activities.find((activity) => activity.id === activityId) || null);
  }, [searchParams]);
  useEffect(() => {
    if (!optIn) { setMood(null); setMoodError(""); return; }
    const token = localStorage.getItem("token");
    if (!token) { setMoodError("Sign in to get mood-based suggestions."); return; }
    const controller = new AbortController();
    setLoading(true); setMoodError("");
    fetch(`${API}/api/moods`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then(async (r) => { if (!r.ok) throw new Error(`Mood API returned ${r.status}`); return r.json(); })
      .then((data) => { const entries = Array.isArray(data) ? data : data.entries || []; const latest = [...entries].sort((a,b) => String(b.dateStr || b.createdAt || "").localeCompare(String(a.dateStr || a.createdAt || "")))[0]; setMood(latest?.mood ?? null); })
    .catch((err) => {
      if (err.name !== "AbortError") {
        console.error("Wellness mood fetch error:", err);
        setMoodError(
          err instanceof TypeError
            ? "Cannot connect to the backend at " + API
            : err.message
        );
      }
    })      
    .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [optIn]);
  const filtered = useMemo(() => activities.filter((a) => (category === "All" || a.category === category) && `${a.title} ${a.description}`.toLowerCase().includes(search.toLowerCase())), [category, search]);
  const suggested = recommendations[Number(mood)]?.map((id) => activities.find((a) => a.id === id)).filter(Boolean) || [];
  return (
    <>
    <div className="min-h-screen pt-24 pb-16 px-6"><div className="max-w-4xl mx-auto">
      <header className="mb-9"><span className="text-xs font-medium text-primary uppercase tracking-widest">Wellness library</span><h1 className="font-display text-4xl font-medium text-foreground mt-2 mb-2">Small practices,<br/><em className="font-normal">meaningful change.</em></h1><p className="text-muted-foreground max-w-lg">Explore simple, optional activities at your own pace.</p></header>
      <section className="bg-card border border-border rounded-2xl p-6 mb-8"><div className="flex items-start justify-between gap-4"><div><div className="flex gap-2 items-center text-primary"><Sparkles size={18}/><h2 className="font-medium">Recommended for you</h2></div><p className="text-sm text-muted-foreground mt-2">Use your latest mood entry to discover optional activities. Your journal is not accessed.</p></div></div>
        <label className="flex items-center gap-2 mt-4 text-sm"><input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="accent-primary"/> Use my latest mood for suggestions</label>
        {loading && <p className="text-sm mt-3">Loading suggestions…</p>}{moodError && <p className="text-sm text-destructive mt-3">{moodError}</p>}
        {optIn && !loading && !moodError && (suggested.length ? <div className="mt-4 grid sm:grid-cols-3 gap-3">{suggested.map((a) => <button key={a.id} onClick={() => setActive(a)} className="text-left rounded-xl bg-secondary/60 p-4 hover:bg-secondary"><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-muted-foreground mt-1">{a.duration}</p></button>)}</div> : <p className="text-sm text-muted-foreground mt-3">No mood entries yet. <Link to="/mood" className="text-primary underline">Log your mood</Link> or browse all activities below.</p>)}
        <p className="text-xs text-muted-foreground mt-3">Suggestions are based on simple mood categories, not AI diagnosis or medical advice.</p>
      </section>
      <div className="relative mb-5"><Search className="absolute left-4 top-3 w-4 h-4 text-muted-foreground"/><input aria-label="Search wellness activities" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search activities…" className="w-full bg-card border border-border rounded-full pl-11 pr-4 py-2.5 text-sm outline-none focus:border-primary"/></div>
      <div className="flex gap-2 flex-wrap mb-8">{categories.map((c) => <button key={c} onClick={() => setCategory(c)} className={`text-sm px-4 py-1.5 rounded-full border transition-all ${category === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary/40"}`}>{c}</button>)}</div>
      <div className="grid md:grid-cols-2 gap-5">{filtered.map((a) => { const Icon = a.icon; return <button key={a.id} onClick={() => setActive(a)} className="text-left bg-card rounded-2xl p-6 border border-border hover:shadow-md hover:-translate-y-0.5 transition-all group"><div className="flex gap-4"><div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-primary"/></div><div><div className="flex items-center justify-between gap-4 mb-1"><h3 className="text-sm font-medium">{a.title}</h3><span className="text-xs text-muted-foreground whitespace-nowrap">{a.duration}</span></div><span className="text-xs px-2 py-0.5 bg-secondary rounded-full">{a.category}</span><p className="text-xs text-muted-foreground leading-relaxed mt-2">{a.description}</p></div></div><div className="flex gap-1 items-center mt-4 text-xs text-primary">Begin exercise <ArrowRight size={13}/></div></button>; })}</div>
      {!filtered.length && <p className="text-center text-muted-foreground py-10">No matching activities found.</p>}
      <p className="mt-10 text-sm text-muted-foreground">Wellness activities support everyday wellbeing and do not replace professional care.</p>
    </div></div>
    {active && <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setActive(null); }}><div role="dialog" aria-modal="true" aria-label={active.title} className="bg-card rounded-3xl p-7 max-w-md w-full max-h-[90vh] overflow-y-auto border border-border shadow-xl"><div className="flex justify-between items-center mb-5"><div><h2 className="font-display text-xl">{active.title}</h2><p className="text-xs text-muted-foreground">{active.duration} · {active.category}</p></div><button aria-label="Close" onClick={() => setActive(null)}><X className="w-5 h-5"/></button></div>{active.id === "breath" ? <BreathingTimer onClose={() => setActive(null)}/> : <><p className="text-sm text-muted-foreground mb-5">{active.description}</p><ol className="space-y-3 mb-6">{active.steps.map((s,i) => <li key={i} className="text-sm flex gap-3"><span className="text-primary font-medium">{i+1}.</span>{s}</li>)}</ol><button onClick={() => setActive(null)} className="w-full bg-primary text-primary-foreground py-3 rounded-full text-sm font-medium">Done</button></>}</div></div>}
    </>
  );
}

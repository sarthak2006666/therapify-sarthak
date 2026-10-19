import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import {
  MessageCircle, TrendingUp, BookOpen, Sparkles, ChevronRight,
  Star, ArrowRight, Shield, Moon, Sun, Wind, Heart, CheckCircle
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const API_URL = "http://localhost:5000/api/moods";

const moodsList = [
  { emoji: "😔", label: "Low", value: 1 },
  { emoji: "😐", label: "Okay", value: 2 },
  { emoji: "🙂", label: "Good", value: 3 },
  { emoji: "😊", label: "Great", value: 4 },
  { emoji: "😄", label: "Excellent", value: 5 }
];

const features = [
  {
    icon: MessageCircle,
    title: "AI Companion Chat",
    description: "Reflect and process feelings anytime with a compassionate AI trained in evidence-based therapeutic approaches. Available 24/7, no wait time.",
    color: "bg-accent/20 text-accent-foreground",
    to: "/chat"
  },
  {
    icon: TrendingUp,
    title: "Mood Tracking",
    description: "Log how you feel each day and discover patterns over time. Gentle weekly check-ins help you stay aware of your emotional landscape.",
    color: "bg-primary/15 text-primary",
    to: "/mood"
  },
  {
    icon: BookOpen,
    title: "Private Journal",
    description: "A safe, encrypted space to write freely. AI-generated reflections surface insights without being intrusive — collapsible, never automatic.",
    color: "bg-secondary text-secondary-foreground",
    to: "/journal"
  },
  {
    icon: Sparkles,
    title: "Wellness Exercises",
    description: "Breathing practices, grounding exercises, and mindfulness cards curated to your current mood and goals.",
    color: "bg-destructive/15 text-destructive",
    to: "/wellness"
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Thoughtfully designed crisis pathways that feel like care, not a warning label. Your wellbeing is always the priority.",
    color: "bg-primary/10 text-primary",
    to: "/crisis"
  }
];

const steps = [
  {
    number: "01",
    title: "Tell us about yourself",
    body: "A brief, gentle onboarding helps Therapify understand your goals — whether that's managing stress, processing grief, or simply having a space to think out loud."
  },
  {
    number: "02",
    title: "Start at your pace",
    body: "Chat with the AI, log a mood, or write a journal entry. There's no right way to begin. The app adapts to how you show up each day."
  },
  {
    number: "03",
    title: "Build self-awareness",
    body: "Over time, your mood trends and journal patterns reveal what helps and what doesn't. You grow at your own rhythm, with gentle guidance."
  }
];

const testimonials = [
  {
    name: "Amara O.",
    role: "Graduate student",
    text: "I was skeptical about AI therapy, but the chat actually helps me untangle my thoughts before I spiral. It's like having a patient, non-judgmental sounding board at 2am.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&auto=format"
  },
  {
    name: "Marcus T.",
    role: "Software engineer",
    text: "The mood tracking finally made me realize my anxiety peaks on Sundays. Seeing the pattern changed how I prepare for the week. Simple but powerful.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format"
  },
  {
    name: "Priya S.",
    role: "Working parent",
    text: "The journal reflection feature is beautiful — it gently surfaces connections I hadn't noticed. Never feels clinical. More like a thoughtful friend reading back what you wrote.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format"
  }
];

// Helper to get local date string YYYY-MM-DD
const getLocalDateStr = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [todayEntry, setTodayEntry] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("token");

  // Load User, User Count & Mood Entries
  useEffect(() => {
    // Fetch registered user count from backend
    fetch("http://localhost:5000/api/auth/count")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === "number") {
          setUserCount(data.count);
        }
      })
      .catch((err) => console.error("Fetch user count error:", err));

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("User parse error:", e);
      }
    } else {
      setUser(null);
    }

    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      setEntries([]);
      setTodayEntry(null);
      setSelectedMood(null);
      return;
    }

    const fetchMoodEntries = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          const fetched = data.entries || [];
          setEntries(fetched);

          const todayStr = getLocalDateStr();
          const existingToday = fetched.find((e) => e.dateStr === todayStr);
          if (existingToday) {
            setTodayEntry(existingToday);
            setSelectedMood(existingToday.mood);
          }
        }
      } catch (err) {
        console.error("Home mood fetch error:", err);
      }
    };

    fetchMoodEntries();
  }, []);

  // Calculate dynamic date string (e.g. Saturday, October 10)
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Time-based greeting calculation
  const { greetingText, TimeIcon } = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = "Good morning";
    let Icon = Sun;

    if (hour >= 12 && hour < 17) {
      timeGreeting = "Good afternoon";
      Icon = Sun;
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = "Good evening";
      Icon = Moon;
    } else if (hour >= 21 || hour < 5) {
      timeGreeting = "Good night";
      Icon = Moon;
    }

    const firstName = user?.name ? user.name.trim().split(" ")[0] : "";
    const greeting = firstName ? `${timeGreeting}, ${firstName}` : timeGreeting;

    return { greetingText: greeting, TimeIcon: Icon };
  }, [user]);

  // Handle mood selection from homepage preview card
  const handleSelectMood = async (moodValue) => {
    if (!token) {
      setError("Please sign in to log your mood.");
      return;
    }

    setSelectedMood(moodValue);
    setSaving(true);
    setError("");
    setSuccessMsg("");

    const moodObj = moodsList.find((m) => m.value === moodValue);
    const payload = {
      mood: moodValue,
      moodLabel: moodObj?.label || "",
      emoji: moodObj?.emoji || "",
      emotions: todayEntry?.emotions || [],
      note: todayEntry?.note || "",
      dateStr: getLocalDateStr(),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save mood.");
      }

      const savedEntry = data.entry;
      setTodayEntry(savedEntry);
      setEntries((prev) => {
        const filtered = prev.filter((e) => e.dateStr !== savedEntry.dateStr);
        return [savedEntry, ...filtered];
      });
      setSuccessMsg("Mood logged!");
    } catch (err) {
      console.error("Save mood home error:", err);
      setError(err.message || "Could not save mood.");
    } finally {
      setSaving(false);
    }
  };

  // 1. Weekly Trends (Mon - Sun of current week)
  const weekData = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const entriesMap = new Map();
    entries.forEach((e) => {
      if (e.dateStr) entriesMap.set(e.dateStr, e);
    });

    return dayNames.map((dayName, idx) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx);
      const dateStr = getLocalDateStr(d);
      const entry = entriesMap.get(dateStr);
      return {
        day: dayName,
        mood: entry ? entry.mood : null,
        dateStr,
      };
    });
  }, [entries]);

  const hasWeekData = useMemo(() => {
    return weekData.some((d) => d.mood !== null);
  }, [weekData]);

  const weekAvg = useMemo(() => {
    const validScores = weekData.filter((d) => d.mood !== null).map((d) => d.mood);
    if (validScores.length === 0) return null;
    return validScores.reduce((a, b) => a + b, 0) / validScores.length;
  }, [weekData]);

  // Dynamic Insight Message based on saved history
  const insightMessage = useMemo(() => {
    if (!token) {
      return "Sign in to log your mood and see personalized wellness insights.";
    }
    if (entries.length === 0) {
      return "Log your first mood to start seeing your weekly trends and insights.";
    }

    const validScores = weekData.filter((d) => d.mood !== null).map((d) => d.mood);
    if (validScores.length === 0) {
      return "Log your mood today to update your weekly trends and insights.";
    }

    if (validScores.length === 1) {
      return "Thanks for checking in today! Consistency builds a deeper picture over time.";
    }

    const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    const first = validScores[0];
    const last = validScores[validScores.length - 1];

    if (avg >= 4) {
      return "I noticed your mood has been elevated recently. Exploring what supports your positive energy can help sustain it.";
    } else if (avg <= 2) {
      return "It looks like things have been a bit heavy lately. Remember to take gentle care of yourself today.";
    } else if (last > first) {
      return "Your mood has been trending upward this week. It's wonderful to notice these positive shifts!";
    } else if (last < first) {
      return "Your mood had a slight dip recently. Be kind to yourself as you navigate your week.";
    } else {
      return "Your mood has been steady and balanced recently. Consistency is a great foundation for well-being.";
    }
  }, [token, entries, weekData]);

  // Streak & Trend calculations for summary card
  const streak = useMemo(() => {
    if (!entries.length) return 0;
    const dateSet = new Set(entries.map((e) => e.dateStr));
    let count = 0;
    let checkDate = new Date();
    let checkStr = getLocalDateStr(checkDate);

    if (!dateSet.has(checkStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = getLocalDateStr(checkDate);
    }

    while (dateSet.has(checkStr)) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = getLocalDateStr(checkDate);
    }
    return count;
  }, [entries]);

  const trendPercent = useMemo(() => {
    if (weekAvg === null) return "--";

    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToPrevMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek) - 7;
    const prevMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToPrevMonday);

    const prevWeekSet = new Set();
    for (let i = 0; i < 7; i++) {
      const d = new Date(prevMonday.getFullYear(), prevMonday.getMonth(), prevMonday.getDate() + i);
      prevWeekSet.add(getLocalDateStr(d));
    }

    const prevScores = entries
      .filter((e) => prevWeekSet.has(e.dateStr) && typeof e.mood === "number")
      .map((e) => e.mood);

    if (prevScores.length === 0) return "--";

    const prevAvg = prevScores.reduce((a, b) => a + b, 0) / prevScores.length;
    const diff = ((weekAvg - prevAvg) / prevAvg) * 100;

    if (diff > 0) return `↑ ${Math.round(diff)}%`;
    if (diff < 0) return `↓ ${Math.abs(Math.round(diff))}%`;
    return "0%";
  }, [entries, weekAvg]);

  const displayAvgText = weekAvg !== null ? `${weekAvg.toFixed(1)} / 5` : "N/A";

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3 h-3" /> AI-powered mental wellness
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-medium text-foreground leading-[1.1] mb-6">
              A quieter mind<br />
              <em className="font-normal text-primary">starts here.</em>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
              Therapify combines compassionate AI support, mood tracking, and guided wellness tools in one calm, private space — so care is always within reach.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-medium hover:bg-primary/90 transition-all hover:-translate-y-px"
              >
                {user ? "Go to Dashboard" : "Begin your journey"} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/chat"
                className="flex items-center justify-center gap-2 text-foreground px-7 py-3.5 rounded-full font-medium border border-border hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <MessageCircle className="w-4 h-4" /> Try AI chat free
              </Link>
            </div>
            
          </div>

          {/* Dynamic Hero Mood Preview Card */}
          <div className="relative">
            <div className="bg-card rounded-3xl p-6 shadow-xl border border-border">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{formattedDate}</p>
                  <h3 className="font-display text-lg font-medium text-foreground">{greetingText}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">How are you feeling today?</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <TimeIcon className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Mood Emojis Selection */}
              <div className="flex gap-2 mb-5">
                {moodsList.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => handleSelectMood(m.value)}
                    disabled={saving}
                    className={`flex-1 py-2 rounded-xl text-xl transition-all ${
                      selectedMood === m.value
                        ? "bg-primary/20 ring-2 ring-primary/40 scale-110"
                        : "bg-secondary hover:bg-muted"
                    }`}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>

              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
              {successMsg && <p className="text-xs text-emerald-600 mb-3">{successMsg}</p>}

              {/* Weekly Mood Chart */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">This week's mood</p>
                {hasWeekData ? (
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart id="hero-chart" data={weekData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,80,65,0.08)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#7A7570" }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[1, 5]} />
                      <Tooltip
                        formatter={(value) => [`Score: ${value}/5`, "Mood"]}
                        contentStyle={{ background: "#FDFAF5", border: "1px solid rgba(90,80,65,0.12)", borderRadius: 8, fontSize: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="#5B8A87"
                        strokeWidth={2.5}
                        connectNulls={true}
                        dot={{ fill: "#5B8A87", strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="py-5 text-center bg-secondary/30 rounded-xl border border-dashed border-border">
                    <p className="text-xs text-muted-foreground">
                      Log your first mood to start seeing your weekly trends
                    </p>
                  </div>
                )}
              </div>

              {/* Personalized Insight */}
              <div className="flex gap-3 p-3 bg-accent/15 rounded-2xl">
                <div className="w-7 h-7 rounded-full bg-accent/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-accent-foreground" />
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {insightMessage}
                </p>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl px-4 py-3 shadow-lg border border-border flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-foreground">
                {userCount > 0
                  ? `${userCount.toLocaleString()} ${userCount === 1 ? "person" : "people"} supported today`
                  : "People supported today"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">What we offer</span>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mt-3 mb-4">
              Everything you need,<br />
              <em className="font-normal">nothing you don't.</em>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Thoughtfully designed tools that meet you where you are — not where someone else thinks you should be.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.title}
                  to={f.to}
                  className="bg-card rounded-2xl p-6 border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group block"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ChevronRight className="w-3 h-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how" className="py-24 px-6 bg-secondary/40">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-medium text-primary uppercase tracking-widest">The journey</span>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mt-3 mb-6">
              Built around<br />
              <em className="font-normal text-primary">your rhythm.</em>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10">
              No pressure, no prescriptions. Therapify meets you with calm consistency — not clinical checklists.
            </p>
            <Link
              to={user ? "/chat" : "/register"}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
            >
              {user ? "Continue your session" : "Start your first session"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-5 p-5 bg-card rounded-2xl border border-border hover:shadow-sm transition-shadow">
                <span className="font-display text-3xl font-medium text-primary/30 shrink-0 leading-none pt-0.5">
                  {step.number}
                </span>
                <div>
                  <h4 className="font-medium text-foreground mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Mood Preview Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div className="bg-card rounded-3xl p-7 shadow-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-medium text-foreground">Mood Insights</h3>
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">This week</span>
            </div>
            {hasWeekData ? (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart id="dashboard-chart" data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,80,65,0.08)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#7A7570" }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[1, 5]} />
                  <Tooltip
                    formatter={(value) => [`Score: ${value}/5`, "Mood"]}
                    contentStyle={{ background: "#FDFAF5", border: "1px solid rgba(90,80,65,0.12)", borderRadius: 10, fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#5B8A87"
                    strokeWidth={2.5}
                    connectNulls={true}
                    dot={{ fill: "#5B8A87", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#B5A8D9" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-10 text-center bg-secondary/30 rounded-xl border border-dashed border-border mb-6">
                <p className="text-xs text-muted-foreground">
                  Log your first mood to see your weekly trends
                </p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { label: "Avg mood", value: displayAvgText },
                { label: "Streak", value: `${streak} ${streak === 1 ? "day" : "days"}` },
                { label: "Trend", value: trendPercent },
              ].map((s) => (
                <div key={s.label} className="bg-secondary/60 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-sm font-medium text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-primary uppercase tracking-widest">Mood tracking</span>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mt-3 mb-5">
              Patterns reveal<br />
              <em className="font-normal">what words can't.</em>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The simple act of logging how you feel — 10 seconds a day — builds a picture that helps you understand your own emotional weather.
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {[
                "Daily mood + emotion + intensity check-ins",
                "Weekly and monthly trend visualisations",
                "AI-identified patterns shared gently, never forced"
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <Link
              to="/mood"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
            >
              Start tracking <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* AI Companion Section */}
      <section className="py-24 px-6 bg-secondary/40">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-xs font-medium text-accent-foreground uppercase tracking-widest">AI companion</span>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mt-3 mb-5">
              A conversation<br />
              <em className="font-normal" style={{ color: "#B5A8D9" }}>that remembers you.</em>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Not a chatbot. An AI companion grounded in cognitive behavioural and mindfulness approaches — one that tracks your story, notices your growth, and asks the right questions.
            </p>
            <div className="flex items-center gap-2 p-4 bg-accent/15 rounded-2xl border border-accent/20 mb-6">
              <Shield className="w-4 h-4 text-accent-foreground shrink-0" />
              <p className="text-xs text-foreground/70 leading-relaxed">
                All conversations are end-to-end encrypted. Crisis pathways are built in and designed with care.
              </p>
            </div>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
            >
              Open AI chat <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-card rounded-3xl p-6 shadow-lg border border-border">
            <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
              <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Therapify AI</p>
                <p className="text-xs text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" /> Active
                </p>
              </div>
            </div>
            {[
              { role: "ai", text: "Hey, welcome back. How did the presentation go today?" },
              { role: "user", text: "Better than expected honestly. I was really nervous but it went well." },
              { role: "ai", text: "That's wonderful to hear. What do you think helped you get through the nerves?" },
              { role: "user", text: "The breathing exercise from yesterday actually helped a lot." },
              { role: "ai", text: "I love that you used it — and it worked. That's worth remembering." }
            ].map((msg, i) => (
              <div key={i} className={`flex mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] text-sm leading-relaxed px-4 py-2.5 rounded-2xl ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-accent/20 text-foreground rounded-bl-sm"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wellness Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-xs font-medium text-primary uppercase tracking-widest">Wellness</span>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mt-3 mb-5">
              Small practices,<br />
              <em className="font-normal">meaningful change.</em>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Guided exercises drawn from mindfulness, somatic awareness, and CBT — delivered as gentle cards, never as homework.
            </p>
            <Link
              to="/wellness"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary border border-primary/30 px-5 py-2.5 rounded-full hover:bg-primary/5 transition-colors"
            >
              Explore wellness library <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { icon: Wind, title: "Box Breathing", duration: "4 min", tag: "Anxiety" },
              { icon: Moon, title: "Sleep Ritual", duration: "10 min", tag: "Rest" },
              { icon: Heart, title: "Body Scan", duration: "7 min", tag: "Grounding" }
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to="/wellness"
                  className="flex items-center gap-4 bg-card p-5 rounded-2xl border border-border hover:shadow-sm hover:-translate-x-0.5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground">{card.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.duration} · {card.tag}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials / Stories */}
      <section id="stories" className="py-24 px-6 bg-secondary/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">Stories</span>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mt-3">
              People who found <em className="font-normal">their footing.</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <blockquote className="text-sm text-foreground leading-[1.7] flex-1 mb-6">
                  "{t.text}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-primary rounded-3xl px-10 py-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-black/5 blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="text-primary-foreground/70 text-xs font-medium uppercase tracking-widest">Get started</span>
              <h2 className="font-display text-4xl md:text-5xl font-medium text-primary-foreground mt-4 mb-4 leading-snug">
                You deserve a<br />
                <em className="font-normal">calmer mind.</em>
              </h2>
              <p className="text-primary-foreground/75 leading-relaxed mb-8 max-w-md mx-auto">
                Join thousands who've found a gentler path to self-understanding. Start free — no credit card, no pressure.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to={user ? "/dashboard" : "/register"} className="bg-card text-primary px-8 py-3.5 rounded-full font-medium text-sm hover:bg-card/90 transition-all">
                  {user ? "Open Dashboard" : "Create free account"}
                </Link>
                <Link to="/about" className="border border-primary-foreground/30 text-primary-foreground px-8 py-3.5 rounded-full font-medium text-sm hover:bg-white/10 transition-all">
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

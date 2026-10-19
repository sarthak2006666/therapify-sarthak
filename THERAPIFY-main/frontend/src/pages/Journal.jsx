
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { BookOpen, Plus, ChevronRight, Lock, Pencil, Trash2 } from "lucide-react";

const API_URL = "http://localhost:5000/api/journals";

export default function Journal() {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState("list");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };

  useEffect(() => {
    const loadEntries = async () => {
      const savedToken = localStorage.getItem("token");

      if (!savedToken) {
        setError("Please sign in to access your journal.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: "Bearer " + savedToken,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load entries.");
        }

        setEntries(data.entries || []);
      } catch (err) {
        setError(err.message || "Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  const startNewEntry = () => {
    setSelectedEntry(null);
    setTitle("");
    setBody("");
    setEditing(false);
    setError("");
    setView("editor");
  };

  const openEntry = (entry) => {
    setSelectedEntry(entry);
    setTitle(entry.title || "");
    setBody(entry.body || "");
    setEditing(false);
    setError("");
    setView("detail");
  };

  useEffect(() => {
    if (loading) return;
    const entryId = searchParams.get("entry");
    if (entryId) {
      const entry = entries.find((item) => item._id === entryId);
      if (entry) openEntry(entry);
    } else if (searchParams.get("new") === "1") {
      startNewEntry();
    }
  }, [loading, entries, searchParams]);

  const handleSave = async () => {
    if (!body.trim()) {
      setError("Please write something before saving.");
      return;
    }

    if (!token) {
      setError("Please sign in again.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const isEditing = Boolean(selectedEntry);
      const url = isEditing
        ? `${API_URL}/${selectedEntry._id}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          title: title.trim() || "Untitled entry",
          body: body.trim(),
          mood: selectedEntry?.mood || "Not specified",
          tag: selectedEntry?.tag || "Personal",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save the entry.");
      }

      if (isEditing) {
        setEntries((previous) =>
          previous.map((entry) =>
            entry._id === data.entry._id ? data.entry : entry
          )
        );
        setSelectedEntry(data.entry);
        setEditing(false);
        setView("detail");
      } else {
        setEntries((previous) => [data.entry, ...previous]);
        setSelectedEntry(data.entry);
        setView("detail");
      }
    } catch (err) {
      setError(err.message || "Could not save the entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this journal entry?"
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${selectedEntry._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete the entry.");
      }

      setEntries((previous) =>
        previous.filter((entry) => entry._id !== selectedEntry._id)
      );

      setSelectedEntry(null);
      setView("list");
    } catch (err) {
      setError(err.message || "Could not delete the entry.");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        {view === "list" && (
          <>
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="text-xs font-medium text-primary uppercase tracking-widest">
                  Your journal
                </span>
                <h1 className="font-display text-4xl font-medium text-foreground mt-2">
                  A private space
                  <br />
                  <em className="font-normal">just for you.</em>
                </h1>
              </div>

              <button
                onClick={startNewEntry}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                New entry
              </button>
            </div>

            <div className="flex items-center gap-2 p-3.5 bg-muted/60 rounded-2xl mb-8 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              Your entries are stored in your account and protected by
              authentication. They are not end-to-end encrypted.
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-5">{error}</p>
            )}

            {loading ? (
              <p className="text-sm text-muted-foreground">
                Loading your journal...
              </p>
            ) : entries.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <BookOpen className="w-10 h-10 text-primary mx-auto mb-4" />
                <h2 className="text-lg font-medium text-foreground mb-2">
                  Your journal starts here
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Write down your thoughts and reflect on your day.
                </p>
                <button
                  onClick={startNewEntry}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm"
                >
                  Write your first entry
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {entries.map((entry) => (
                  <button
                    key={entry._id}
                    onClick={() => openEntry(entry)}
                    className="text-left w-full bg-card rounded-2xl p-6 border border-border hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">📝</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground">
                          {entry.tag || "Personal"}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>

                    <h3 className="text-sm font-medium text-foreground mb-1">
                      {entry.title || "Untitled entry"}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-wrap">
                      {entry.body}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {view === "detail" && selectedEntry && (
          <>
            <div className="flex items-center justify-between gap-3 mb-8">
              <button
                onClick={() => {
                  setView("list");
                  setError("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to journal
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(true);
                    setTitle(selectedEntry.title || "");
                    setBody(selectedEntry.body || "");
                    setError("");
                    setView("editor");
                  }}
                  className="flex items-center gap-2 border border-border px-4 py-2 rounded-full text-sm hover:bg-secondary/60"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-full text-sm hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              {formatDate(selectedEntry.createdAt)} · {selectedEntry.tag || "Personal"}
            </p>

            <h1 className="font-display text-3xl font-medium text-foreground mb-6">
              {selectedEntry.title || "Untitled entry"}
            </h1>

            <p className="text-sm text-foreground leading-8 whitespace-pre-wrap break-words">
              {selectedEntry.body}
            </p>

            {error && (
              <p className="text-sm text-red-500 mt-5">{error}</p>
            )}
          </>
        )}

        {view === "editor" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => {
                  setError("");
                  setView(selectedEntry ? "detail" : "list");
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Cancel
              </button>

              <span className="text-xs text-muted-foreground">
                {editing ? "Edit journal entry" : "New journal entry"}
              </span>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this entry a title…"
              maxLength={200}
              className="w-full font-display text-2xl font-medium bg-transparent outline-none text-foreground placeholder:text-muted-foreground mb-4 border-b border-border pb-4"
            />

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's on your mind? Write freely — this is just for you…"
              rows={14}
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm leading-[1.75] resize-none mb-6"
            />

            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {body.length} characters
              </p>

              <button
                onClick={handleSave}
                disabled={!body.trim() || saving}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-40"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save changes"
                    : "Save entry"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

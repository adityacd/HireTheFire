import { useState, useEffect } from "react";
import { Flame, FileText, X, Save, Loader2 } from "lucide-react";
import { getResume, updateResume } from "../api/client";

const FONT_SIZES = [
  { label: "A−", value: 14, title: "Small" },
  { label: "A",  value: 16, title: "Medium" },
  { label: "A+", value: 18, title: "Large"  },
];

function useFontSize() {
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem("htf-font-size");
    return saved ? parseInt(saved, 10) : 16;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${size}px`;
    localStorage.setItem("htf-font-size", size);
  }, [size]);

  return [size, setSize];
}

export default function Header({ jobCount }) {
  const [showResume, setShowResume] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [fontSize, setFontSize] = useFontSize();

  const openResume = async () => {
    const content = await getResume();
    setResumeText(content);
    setShowResume(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateResume(resumeText);
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch {
      setSaveMsg("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(8,12,16,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,255,170,0.08)",
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flame-icon"><Flame size={24} /></span>
            <span className="flame-text font-display font-black text-lg tracking-widest select-none uppercase">
              HireTheFire
            </span>
            {jobCount > 0 && (
              <span
                className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{ background: "rgba(0,255,170,0.08)", color: "#00ffaa", border: "1px solid rgba(0,255,170,0.2)" }}
              >
                {jobCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Font size control */}
            <div className="flex items-center rounded-lg overflow-hidden"
              style={{ border: "1px solid rgba(0,255,170,0.12)" }}>
              {FONT_SIZES.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => setFontSize(opt.value)}
                  title={opt.title}
                  className="px-2.5 py-1.5 text-xs font-semibold transition-all duration-150"
                  style={{
                    background: fontSize === opt.value ? "rgba(0,255,170,0.15)" : "transparent",
                    color: fontSize === opt.value ? "#00ffaa" : "#334155",
                    borderRight: i < FONT_SIZES.length - 1 ? "1px solid rgba(0,255,170,0.08)" : "none",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={openResume}
              className="flex items-center gap-1.5 text-sm transition-colors px-3 py-1.5 rounded-lg"
              style={{ color: "#475569" }}
              onMouseEnter={e => e.currentTarget.style.color = "#00ffaa"}
              onMouseLeave={e => e.currentTarget.style.color = "#475569"}
            >
              <FileText size={15} />
              My Resume
            </button>
          </div>
        </div>
      </header>

      {showResume && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
        >
          <div className="glass gradient-border rounded-2xl w-full max-w-2xl flex flex-col max-h-[88vh] shadow-glass">
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(0,255,170,0.08)" }}>
              <h2 className="font-display font-semibold text-white tracking-wide">My Resume</h2>
              <button
                onClick={() => setShowResume(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "#475569" }}
                onMouseEnter={e => e.currentTarget.style.color = "#00ffaa"}
                onMouseLeave={e => e.currentTarget.style.color = "#475569"}
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="flex-1 px-6 py-4 font-mono text-sm resize-none focus:outline-none overflow-y-auto bg-transparent placeholder-slate-700"
              style={{ color: "#94a3b8" }}
              placeholder="Paste your resume here…"
              rows={20}
            />
            <div className="flex items-center justify-between px-6 py-3"
              style={{ borderTop: "1px solid rgba(0,255,170,0.08)" }}>
              <p className="text-xs" style={{ color: "#334155" }}>
                Stored in{" "}
                <code className="px-1.5 py-0.5 rounded" style={{ color: "#475569", background: "rgba(0,255,170,0.05)" }}>
                  backend/resume.txt
                </code>
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(135deg, #00ffaa, #007a52)", color: "#080c10" }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saveMsg || "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

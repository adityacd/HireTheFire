import { useState } from "react";
import { Flame, FileText, X, Save, Loader2 } from "lucide-react";
import { getResume, updateResume } from "../api/client";

export default function Header({ jobCount }) {
  const [showResume, setShowResume] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

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
        className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: "rgba(7,9,15,0.85)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flame-icon">
              <Flame size={26} />
            </span>
            <span className="flame-text font-black text-xl tracking-tight select-none">
              HireTheFire
            </span>
            {jobCount > 0 && (
              <span
                className="ml-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.2)",
                  color: "#818cf8",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                {jobCount} jobs
              </span>
            )}
          </div>

          <button
            onClick={openResume}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <FileText size={15} />
            My Resume
          </button>
        </div>
      </header>

      {showResume && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div className="glass gradient-border rounded-2xl w-full max-w-2xl flex flex-col max-h-[88vh] shadow-glass">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="font-semibold text-white">My Resume</h2>
              <button
                onClick={() => setShowResume(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="flex-1 px-6 py-4 font-mono text-sm resize-none focus:outline-none overflow-y-auto bg-transparent text-slate-300 placeholder-slate-600"
              placeholder="Paste your resume here…"
              rows={20}
            />
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/5">
              <p className="text-xs text-slate-600">
                Stored in{" "}
                <code className="text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                  backend/resume.txt
                </code>
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:shadow-btn-glow"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
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

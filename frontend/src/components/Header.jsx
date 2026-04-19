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
      <header className="bg-black border-b border-dark-border sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Animated fire icon */}
            <span className="fire-icon">
              <Flame size={24} />
            </span>
            <span className="font-bold text-xl tracking-tight text-white">
              Hire<span className="text-neon">The</span>Fire
            </span>
            {jobCount > 0 && (
              <span className="ml-2 border border-neon text-neon text-xs font-medium px-2 py-0.5 rounded-full shadow-neon-sm">
                {jobCount} jobs
              </span>
            )}
          </div>
          <button
            onClick={openResume}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-neon transition px-3 py-1.5 rounded-lg hover:bg-dark-card border border-transparent hover:border-neon/30"
          >
            <FileText size={16} />
            My Resume
          </button>
        </div>
      </header>

      {/* Resume modal */}
      {showResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-dark-card rounded-2xl border border-neon/40 shadow-neon w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-dark-border">
              <h2 className="font-semibold text-lg text-neon">My Resume</h2>
              <button
                onClick={() => setShowResume(false)}
                className="p-1 rounded-full hover:bg-dark-border text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="flex-1 p-5 font-mono text-sm resize-none focus:outline-none overflow-y-auto bg-transparent text-gray-200 placeholder-gray-600"
              placeholder="Paste your resume here…"
              rows={20}
            />
            <div className="flex items-center justify-between p-4 border-t border-dark-border">
              <p className="text-xs text-gray-600">
                Saved to <code className="bg-dark-border px-1 rounded text-gray-400">backend/resume.txt</code>
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon text-black text-sm font-bold hover:bg-neon-dim disabled:opacity-60 transition shadow-neon-sm"
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

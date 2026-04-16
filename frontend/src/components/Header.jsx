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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={22} className="text-indigo-600" />
            <span className="font-bold text-lg tracking-tight">HireTheFire</span>
            {jobCount > 0 && (
              <span className="ml-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {jobCount} jobs
              </span>
            )}
          </div>
          <button
            onClick={openResume}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <FileText size={16} />
            My Resume
          </button>
        </div>
      </header>

      {/* Resume modal */}
      {showResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-lg">My Resume</h2>
              <button
                onClick={() => setShowResume(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="flex-1 p-5 font-mono text-sm resize-none focus:outline-none overflow-y-auto"
              placeholder="Paste your resume here…"
              rows={20}
            />
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-xs text-gray-500">
                Saved to <code className="bg-gray-100 px-1 rounded">backend/resume.txt</code>
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition"
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

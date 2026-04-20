import { useState, useEffect } from "react";
import { X, Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { getCoverLetter, generateCoverLetter } from "../api/client";

export default function CoverLetterModal({ job, onClose }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCoverLetter(job.id)
      .then((cl) => setContent(cl.content))
      .catch(() => {});
  }, [job.id]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const cl = await generateCoverLetter(job.id);
      setContent(cl.content);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to generate cover letter.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
    >
      <div className="glass gradient-border rounded-2xl w-full max-w-2xl flex flex-col max-h-[88vh] shadow-glass">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="font-semibold text-white">Cover Letter</h2>
            <p className="text-xs text-slate-500 mt-0.5">{job.title} — {job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {content ? (
            <pre className="whitespace-pre-wrap text-sm font-sans text-slate-300 leading-relaxed">
              {content}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-600 gap-2 text-sm">
              <p>No cover letter yet — click Generate to create one.</p>
            </div>
          )}
          {error && (
            <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/5">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:shadow-btn-glow hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {content ? "Regenerate" : "Generate"}
          </button>
          {content && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-400 border border-white/8 hover:border-white/15 hover:text-white transition-all"
            >
              {copied ? <Check size={15} className="text-indigo-400" /> : <Copy size={15} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-dark-card rounded-2xl border border-neon/40 shadow-neon w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-dark-border">
          <div>
            <h2 className="font-semibold text-lg text-neon">Cover Letter</h2>
            <p className="text-sm text-gray-500">
              {job.title} — {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-dark-border text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {content ? (
            <pre className="whitespace-pre-wrap text-sm font-sans text-gray-200 leading-relaxed">
              {content}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-600 gap-2">
              <p>No cover letter generated yet.</p>
            </div>
          )}
          {error && (
            <p className="mt-3 text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg p-3">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-dark-border gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon text-black text-sm font-bold hover:bg-neon-dim disabled:opacity-60 transition shadow-neon-sm"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {content ? "Regenerate" : "Generate"}
          </button>
          {content && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dark-border text-gray-400 text-sm font-medium hover:border-neon/40 hover:text-neon transition"
            >
              {copied ? <Check size={16} className="text-neon" /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

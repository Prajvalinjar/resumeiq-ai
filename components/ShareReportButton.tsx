"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, Copy, CheckCircle2, Calendar, Link, Loader2 } from "lucide-react";

interface Props {
  reportId: string;
}

export default function ShareReportButton({ reportId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [expiryDays, setExpiryDays] = useState(7);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateLink = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          expiresInDays: expiryDays,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate share link");
      }

      const data = await response.json();
      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      setShareUrl(fullUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate share link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 text-sm shadow-md whitespace-nowrap"
      >
        <Share2 className="w-4 h-4" />
        Share Report
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0b1120] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Share Report</h3>
                  <p className="text-xs text-slate-400">Generate a secure read-only link</p>
                </div>
              </div>

              {!shareUrl ? (
                <>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      <Calendar className="w-3 h-3 inline mr-1" /> Link Expiry
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[7, 14, 30].map((days) => (
                        <button
                          key={days}
                          onClick={() => setExpiryDays(days)}
                          className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                            expiryDays === days
                              ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                              : "border-white/[0.06] bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]"
                          }`}
                        >
                          {days} days
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleGenerateLink}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Link className="w-4 h-4" />
                    )}
                    {loading ? "Generating..." : "Generate Link"}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-950/40 border border-white/[0.06] rounded-xl p-4">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Share URL</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 bg-transparent text-xs text-cyan-400 outline-none truncate"
                      />
                      <button
                        onClick={handleCopy}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          copied
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-slate-500">
                      This link expires in <span className="text-slate-300 font-semibold">{expiryDays} days</span>
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">Anyone with the link can view this report (read-only)</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

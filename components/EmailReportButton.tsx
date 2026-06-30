"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { AnalysisResult } from "@/types/analysis";

interface Props {
  analysis: AnalysisResult;
}

export default function EmailReportButton({ analysis }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisResult: analysis,
          recipientEmail: email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send email");
      }

      setSent(true);
      setTimeout(() => {
        setIsOpen(false);
        setSent(false);
        setEmail("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to send email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 font-bold hover:bg-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2 text-sm shadow-md whitespace-nowrap"
      >
        <Mail className="w-4 h-4" />
        Email Report
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

              {sent ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Email Sent!</h3>
                  <p className="text-sm text-slate-400 mt-2">Your report has been emailed successfully.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Email Report</h3>
                      <p className="text-xs text-slate-400">Send your ATS analysis report via email</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-white/[0.06] rounded-xl p-4 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Report</span>
                      <span className="text-white font-semibold">{analysis.targetRole}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-slate-400">ATS Score</span>
                      <span className="text-cyan-400 font-bold">{analysis.atsScore}%</span>
                    </div>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-slate-400">File</span>
                      <span className="text-slate-300 truncate max-w-[200px]">{analysis.fileName}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your-email@example.com"
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {sending ? "Sending..." : "Send Report"}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

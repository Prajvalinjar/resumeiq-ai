"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitCompareArrows, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function ComparePage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [selected1, setSelected1] = useState("");
  const [selected2, setSelected2] = useState("");
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("analyses")
          .select("id, file_name, ats_score, target_role, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        setAnalyses(data || []);
        return;
      }
    }

    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("resumeiq_history");
      if (raw) {
        setAnalyses(JSON.parse(raw).map((a: any) => ({
          id: a.id, file_name: a.fileName, ats_score: a.atsScore,
          target_role: a.targetRole, created_at: a.createdAt,
        })));
      }
    }
  };

  const handleCompare = async () => {
    if (!selected1 || !selected2) {
      setError("Please select two resumes to compare.");
      return;
    }
    if (selected1 === selected2) {
      setError("Please select two different resumes.");
      return;
    }

    setLoading(true);
    setError("");
    setComparison(null);

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId1: selected1, analysisId2: selected2 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to compare");
      }

      const result = await response.json();
      setComparison(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-transparent pt-24 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] -z-10 animate-orb-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-[#8b5cf6]/5 rounded-full blur-[130px] -z-10 animate-orb-2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 font-extrabold rounded-full uppercase tracking-wider">
                <GitCompareArrows className="w-3 h-3 inline mr-1" /> Compare
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Resume Version Comparison</h1>
            <p className="text-slate-400 text-sm mt-1">Compare two resume versions side-by-side</p>
          </motion.div>

          {/* Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Resume Version 1 (Earlier)</label>
                <select
                  value={selected1}
                  onChange={(e) => setSelected1(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Select resume...</option>
                  {analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.file_name} — {a.ats_score}% ({new Date(a.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Resume Version 2 (Later)</label>
                <select
                  value={selected2}
                  onChange={(e) => setSelected2(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Select resume...</option>
                  {analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.file_name} — {a.ats_score}% ({new Date(a.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={handleCompare}
              disabled={loading || !selected1 || !selected2}
              className="mt-4 w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
              ) : (
                <GitCompareArrows className="w-5 h-5" />
              )}
              {loading ? "Comparing..." : "Compare Resumes"}
            </button>
          </motion.div>

          {/* Results */}
          {comparison && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Score Comparison Header */}
              <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Version 1</p>
                    <p className="text-xs text-slate-500 truncate mb-2">{comparison.resume1.fileName}</p>
                    <span className="text-5xl font-extrabold text-red-400">{comparison.resume1.atsScore}%</span>
                  </div>

                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 ${
                      comparison.scoreDifference > 0 ? "bg-emerald-500/10 border-emerald-500/30" :
                      comparison.scoreDifference < 0 ? "bg-red-500/10 border-red-500/30" :
                      "bg-slate-500/10 border-slate-500/30"
                    }`}>
                      {comparison.scoreDifference > 0 ? (
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                      ) : comparison.scoreDifference < 0 ? (
                        <TrendingDown className="w-8 h-8 text-red-400" />
                      ) : (
                        <Minus className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <p className={`text-2xl font-extrabold mt-2 ${
                      comparison.scoreDifference > 0 ? "text-emerald-400" :
                      comparison.scoreDifference < 0 ? "text-red-400" : "text-slate-400"
                    }`}>
                      {comparison.scoreDifference > 0 ? "+" : ""}{comparison.scoreDifference}%
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">
                      {comparison.improvementPercentage > 0 ? `${comparison.improvementPercentage}% improvement` : "Score Change"}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Version 2</p>
                    <p className="text-xs text-slate-500 truncate mb-2">{comparison.resume2.fileName}</p>
                    <span className="text-5xl font-extrabold text-emerald-400">{comparison.resume2.atsScore}%</span>
                  </div>
                </div>
              </div>

              {/* Side-by-side Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* New Skills Added */}
                <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> New Skills Added
                  </h3>
                  {comparison.newSkillsAdded.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {comparison.newSkillsAdded.map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-xs font-bold">
                          + {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No new skills added between versions.</p>
                  )}
                </div>

                {/* Missing Keywords Fixed */}
                <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Missing Keywords Fixed
                  </h3>
                  {comparison.missingKeywordsFixed.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {comparison.missingKeywordsFixed.map((kw: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 text-xs font-bold">
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No previously missing keywords were fixed.</p>
                  )}
                </div>

                {/* Remaining Gaps */}
                <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl md:col-span-2">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-400" /> Remaining Gaps (Version 2)
                  </h3>
                  {comparison.remainingGaps.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {comparison.remainingGaps.map((gap: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15 text-xs font-bold">
                          ⚠ {gap}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-400 font-semibold">🎉 No remaining gaps! Perfect match!</p>
                  )}
                </div>
              </div>

              {/* Side-by-side Strengths/Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                {[comparison.resume1, comparison.resume2].map((resume, idx) => (
                  <div key={idx} className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-sm font-extrabold text-white mb-4">Version {idx + 1}: {resume.fileName}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest mb-2">Strengths</p>
                        <ul className="space-y-1">
                          {(resume.strengths || []).slice(0, 3).map((s: string, i: number) => (
                            <li key={i} className="text-xs text-slate-300 flex gap-2">
                              <span className="text-emerald-400">✓</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-2">Weaknesses</p>
                        <ul className="space-y-1">
                          {(resume.weaknesses || []).slice(0, 3).map((w: string, i: number) => (
                            <li key={i} className="text-xs text-slate-300 flex gap-2">
                              <span className="text-amber-400">⚠</span> {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

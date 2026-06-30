"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Sparkles, CheckCircle2, XCircle, AlertCircle, Loader2, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function JobMatchPage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
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

  const handleMatch = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: selectedAnalysis || null,
          jobDescription,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze");
      }

      setResult(await response.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (pct: number) =>
    pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400";

  const getMatchBg = (pct: number) =>
    pct >= 80 ? "from-emerald-500/10 to-teal-500/10" : pct >= 60 ? "from-amber-500/10 to-orange-500/10" : "from-red-500/10 to-rose-500/10";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-transparent pt-24 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] -z-10 animate-orb-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-[#8b5cf6]/5 rounded-full blur-[130px] -z-10 animate-orb-2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold rounded-full uppercase tracking-wider">
                <Target className="w-3 h-3 inline mr-1" /> Job Match
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Job Description Matching</h1>
            <p className="text-slate-400 text-sm mt-1">Paste a job description to see how your resume matches</p>
          </motion.div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl space-y-4"
          >
            {analyses.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  <FileText className="w-3 h-3 inline mr-1" /> Select Resume (Optional)
                </label>
                <select
                  value={selectedAnalysis}
                  onChange={(e) => setSelectedAnalysis(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Use latest resume analysis</option>
                  {analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.file_name} — {a.ats_score}% ({a.target_role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={8}
                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={handleMatch}
              disabled={loading || !jobDescription.trim()}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
              {loading ? "Analyzing Match..." : "Analyze Match"}
            </button>
          </motion.div>

          {/* Results */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Match Score */}
              <div className={`bg-gradient-to-br ${getMatchBg(result.matchPercentage)} backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl text-center`}>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">Match Percentage</p>
                <span className={`text-7xl font-extrabold ${getMatchColor(result.matchPercentage)} drop-shadow-[0_0_20px_currentColor]`}>
                  {result.matchPercentage}%
                </span>
                <p className="text-sm text-slate-400 mt-4">
                  {result.matchPercentage >= 80 ? "🔥 Excellent match! Your resume aligns well." :
                   result.matchPercentage >= 60 ? "📈 Moderate match. Some optimizations needed." :
                   "⚡ Significant gaps. Major revisions recommended."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Keyword Matches */}
                <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Keyword Match
                  </h3>
                  <div className="space-y-2">
                    {(result.keywordMatches || []).map((km: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-xs text-slate-300 font-semibold">{km.keyword}</span>
                        {km.found ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-red-400" /> Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(result.missingSkills || []).map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/15 text-xs font-bold">
                        + {skill}
                      </span>
                    ))}
                    {(result.missingSkills || []).length === 0 && (
                      <p className="text-xs text-emerald-400 font-semibold">✓ All required skills present!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Recommendations
                </h3>
                <ul className="space-y-3">
                  {(result.recommendations || []).map((rec: string, idx: number) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-300 flex gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

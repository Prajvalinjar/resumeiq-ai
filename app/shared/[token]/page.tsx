"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  FileText, Award, AlertTriangle, Compass, Terminal, Clock, ShieldAlert
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/share?token=${token}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load shared report");
        }
        const data = await response.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [token]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-12 text-center max-w-md">
            <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Report Not Available</h1>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const analysis = report?.analysis;
  const data = analysis?.data || {};

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-transparent pt-24 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] -z-10 animate-orb-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-[#8b5cf6]/5 rounded-full blur-[130px] -z-10 animate-orb-2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold rounded-full uppercase tracking-wider">
                🔗 Shared Report • Read Only
              </span>
              {report.expiresAt && (
                <span className="text-[10px] px-3 py-1 bg-slate-500/10 border border-slate-500/20 text-slate-400 font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Expires {new Date(report.expiresAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{analysis.targetRole}</h1>
            <p className="text-slate-400 text-sm mt-1">{analysis.fileName}</p>
          </motion.div>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl text-center"
          >
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">ATS Match Score</p>
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="stroke-white/[0.04]" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50" cy="50" r="40"
                  className="stroke-cyan-400"
                  strokeWidth="8" fill="transparent"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * analysis.atsScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-white">{analysis.atsScore}%</span>
                <span className={`text-[10px] font-extrabold mt-1.5 uppercase tracking-wider ${
                  analysis.atsScore >= 80 ? "text-emerald-400" : analysis.atsScore >= 60 ? "text-amber-400" : "text-red-400"
                }`}>
                  {analysis.atsScore >= 80 ? "Optimized" : analysis.atsScore >= 60 ? "Average" : "Needs Review"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Details Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" /> Strengths
              </h3>
              <ul className="space-y-2">
                {(data.strengths || []).map((s: string, i: number) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Weaknesses
              </h3>
              <ul className="space-y-2">
                {(data.weaknesses || []).map((w: string, i: number) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-2">
                    <span className="text-amber-400 font-bold shrink-0">⚠</span> {w}
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Skills */}
            <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" /> Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(data.missingSkills || []).map((s: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/15 text-xs font-bold">
                    + {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" /> Suggestions
              </h3>
              <ul className="space-y-2">
                {(data.suggestions || []).map((s: string, i: number) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

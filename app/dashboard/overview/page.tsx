"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, TrendingUp, Award, RefreshCw, Calendar, Download,
  BarChart3, Clock, ChevronRight, Sparkles, Activity, Target
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AnalysisResult } from "@/types/analysis";
import { DashboardStats } from "@/types/reports";

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalResumesAnalyzed: 0,
    averageAtsScore: 0,
    highestAtsScore: 0,
    resumesImproved: 0,
    lastAnalysisDate: null,
    totalReportsDownloaded: 0,
  });
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; isGuest: boolean } | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      if (!isSupabaseConfigured || !supabase) {
        // Fallback: load from localStorage
        loadFromLocalStorage();
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        loadFromLocalStorage();
        setLoading(false);
        return;
      }

      setUser({ email: session.user.email || "", isGuest: false });

      try {
        // Fetch analyses
        const { data: analyses } = await supabase
          .from("analyses")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        const allAnalyses = analyses || [];
        const scores = allAnalyses.map((a: any) => a.ats_score);

        // Calculate improved count — any resume with score > 70
        const improvedCount = scores.filter((s: number) => s >= 70).length;

        // Fetch download count from resume_reports
        const { data: reports } = await supabase
          .from("resume_reports")
          .select("download_count")
          .eq("user_id", session.user.id);

        const totalDownloads = (reports || []).reduce((sum: number, r: any) => sum + (r.download_count || 0), 0);

        setStats({
          totalResumesAnalyzed: allAnalyses.length,
          averageAtsScore: scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0,
          highestAtsScore: scores.length > 0 ? Math.max(...scores) : 0,
          resumesImproved: improvedCount,
          lastAnalysisDate: allAnalyses.length > 0 ? allAnalyses[0].created_at : null,
          totalReportsDownloaded: totalDownloads,
        });

        // Recent analyses (latest 5)
        setRecentAnalyses(allAnalyses.slice(0, 5).map((a: any) => ({
          id: a.id,
          fileName: a.file_name,
          targetRole: a.target_role,
          atsScore: a.ats_score,
          createdAt: a.created_at,
          data: a.data,
        })));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }

      setLoading(false);
    };

    loadDashboard();
  }, []);

  const loadFromLocalStorage = () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("resumeiq_user");
    setUser(stored ? JSON.parse(stored) : { email: "guest@resumeiq.ai", isGuest: true });

    const historyRaw = localStorage.getItem("resumeiq_history");
    const history: AnalysisResult[] = historyRaw ? JSON.parse(historyRaw) : [];
    const scores = history.map((h) => h.atsScore);

    setStats({
      totalResumesAnalyzed: history.length,
      averageAtsScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      highestAtsScore: scores.length > 0 ? Math.max(...scores) : 0,
      resumesImproved: scores.filter((s) => s >= 70).length,
      lastAnalysisDate: history.length > 0 ? history[0].createdAt : null,
      totalReportsDownloaded: 0,
    });

    setRecentAnalyses(history.slice(0, 5).map((h) => ({
      id: h.id,
      fileName: h.fileName,
      targetRole: h.targetRole,
      atsScore: h.atsScore,
      createdAt: h.createdAt,
    })));
  };

  const statCards = [
    { label: "Total Resumes Analyzed", value: stats.totalResumesAnalyzed, icon: FileText, color: "cyan", gradient: "from-cyan-500/10 to-blue-500/10", borderColor: "border-cyan-500/20" },
    { label: "Average ATS Score", value: `${stats.averageAtsScore}%`, icon: BarChart3, color: "purple", gradient: "from-purple-500/10 to-violet-500/10", borderColor: "border-purple-500/20" },
    { label: "Highest ATS Score", value: `${stats.highestAtsScore}%`, icon: Award, color: "emerald", gradient: "from-emerald-500/10 to-teal-500/10", borderColor: "border-emerald-500/20" },
    { label: "Resumes Improved", value: stats.resumesImproved, icon: TrendingUp, color: "amber", gradient: "from-amber-500/10 to-orange-500/10", borderColor: "border-amber-500/20" },
    { label: "Last Analysis Date", value: stats.lastAnalysisDate ? new Date(stats.lastAnalysisDate).toLocaleDateString() : "N/A", icon: Calendar, color: "rose", gradient: "from-rose-500/10 to-pink-500/10", borderColor: "border-rose-500/20" },
    { label: "Reports Downloaded", value: stats.totalReportsDownloaded, icon: Download, color: "indigo", gradient: "from-indigo-500/10 to-blue-500/10", borderColor: "border-indigo-500/20" },
  ];

  const colorMap: Record<string, string> = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
    indigo: "text-indigo-400",
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-transparent pt-24 pb-12 px-6 relative overflow-hidden">
        {/* Background Ambient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] -z-10 animate-orb-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-[#8b5cf6]/5 rounded-full blur-[130px] -z-10 animate-orb-2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-extrabold rounded-full uppercase tracking-wider">
                  <Activity className="w-3 h-3 inline mr-1" /> Dashboard
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.isGuest ? "Guest" : user?.email.split("@")[0]}!
              </h1>
              <p className="text-slate-400 text-sm mt-1">Your resume analytics at a glance</p>
            </div>

            <Link
              href="/analyze"
              className="px-5 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl font-bold shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:scale-[1.01] transition flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" /> Analyze Resume
            </Link>
          </motion.div>

          {/* Stats Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((card, idx) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`bg-gradient-to-br ${card.gradient} backdrop-blur-xl border ${card.borderColor} rounded-2xl p-6 shadow-2xl glass-panel-hover`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center ${colorMap[card.color]}`}>
                        <card.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{card.label}</p>
                    <p className={`text-3xl font-extrabold mt-2 ${colorMap[card.color]} drop-shadow-[0_0_8px_currentColor]`}>
                      {card.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Grid: Recent Activity + Latest Reports + Performance Insights */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
                >
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-cyan-400" /> Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentAnalyses.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-4 text-center">No activity yet. Analyze your first resume!</p>
                    ) : (
                      recentAnalyses.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{item.fileName}</p>
                            <p className="text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            item.atsScore >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                            item.atsScore >= 60 ? "bg-amber-500/10 text-amber-400" :
                            "bg-red-500/10 text-red-400"
                          }`}>
                            {item.atsScore}%
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>

                {/* Latest Reports */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
                >
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-purple-400" /> Latest Reports
                  </h3>
                  <div className="space-y-3">
                    {recentAnalyses.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-4 text-center">No reports yet.</p>
                    ) : (
                      recentAnalyses.slice(0, 4).map((item, idx) => (
                        <Link
                          key={idx}
                          href={`/dashboard?analysisId=${item.id}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-purple-500/30 hover:bg-purple-500/[0.03] transition group"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{item.targetRole}</p>
                            <p className="text-[10px] text-slate-500 truncate">{item.fileName}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition shrink-0" />
                        </Link>
                      ))
                    )}
                  </div>

                  {recentAnalyses.length > 0 && (
                    <Link
                      href="/history"
                      className="mt-4 block text-center text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
                    >
                      View All History →
                    </Link>
                  )}
                </motion.div>

                {/* Performance Insights */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
                >
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Performance Insights
                  </h3>

                  {stats.totalResumesAnalyzed === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">Analyze resumes to see insights.</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Insight 1: Score Distribution */}
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest mb-1">Score Trend</p>
                        <p className="text-xs text-slate-300">
                          {stats.averageAtsScore >= 75
                            ? "🔥 Your average score is above 75%. You're doing great!"
                            : stats.averageAtsScore >= 50
                            ? "📈 Your average is moderate. Keep improving with targeted keywords."
                            : "⚡ There's significant room for improvement. Focus on missing skills."}
                        </p>
                      </div>

                      {/* Insight 2: Improvement Rate */}
                      <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                        <p className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest mb-1">Improvement Rate</p>
                        <p className="text-xs text-slate-300">
                          {stats.resumesImproved > 0
                            ? `${Math.round((stats.resumesImproved / stats.totalResumesAnalyzed) * 100)}% of your resumes score above 70%.`
                            : "No resumes have reached the 70% optimization threshold yet."}
                        </p>
                      </div>

                      {/* Insight 3: Consistency */}
                      <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                        <p className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest mb-1">Recommendation</p>
                        <p className="text-xs text-slate-300">
                          {stats.highestAtsScore - stats.averageAtsScore > 20
                            ? "There's a big gap between your best and average scores. Apply your best resume's strategy to all versions."
                            : "Your scores are consistent. Try the Job Match feature to optimize for specific roles."}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                {[
                  { href: "/analyze", label: "Analyze Resume", icon: Sparkles, color: "text-cyan-400" },
                  { href: "/history", label: "View History", icon: Clock, color: "text-purple-400" },
                  { href: "/dashboard/analytics", label: "ATS Trends", icon: BarChart3, color: "text-emerald-400" },
                  { href: "/job-match", label: "Job Match", icon: Target, color: "text-amber-400" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 p-4 bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl hover:border-white/[0.15] hover:bg-white/[0.03] transition group"
                  >
                    <link.icon className={`w-5 h-5 ${link.color}`} />
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition">{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 ml-auto transition" />
                  </Link>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Calendar, Target, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from "recharts";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [improvementData, setImprovementData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    let allAnalyses: any[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("analyses")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: true });

        allAnalyses = data || [];
      }
    }

    if (allAnalyses.length === 0 && typeof window !== "undefined") {
      const raw = localStorage.getItem("resumeiq_history");
      if (raw) {
        allAnalyses = JSON.parse(raw).map((a: any) => ({
          ats_score: a.atsScore,
          created_at: a.createdAt,
          target_role: a.targetRole,
          data: a,
        }));
      }
    }

    // 1. ATS Score Trend Over Time
    const trend = allAnalyses.map((a: any, idx: number) => ({
      name: `#${idx + 1}`,
      score: a.ats_score,
      date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));
    setTrendData(trend);

    // 2. Average Score Per Month
    const monthMap: Record<string, { total: number; count: number }> = {};
    allAnalyses.forEach((a: any) => {
      const month = new Date(a.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" });
      if (!monthMap[month]) monthMap[month] = { total: 0, count: 0 };
      monthMap[month].total += a.ats_score;
      monthMap[month].count += 1;
    });
    setMonthlyData(
      Object.entries(monthMap).map(([month, data]) => ({
        month,
        average: Math.round(data.total / data.count),
        count: data.count,
      }))
    );

    // 3. Most Frequent Resume Skills (from missing skills across all analyses)
    const skillCount: Record<string, number> = {};
    allAnalyses.forEach((a: any) => {
      const data = a.data as any;
      [...(data?.missingSkills || []), ...(data?.missingKeywords || [])].forEach((s: string) => {
        skillCount[s] = (skillCount[s] || 0) + 1;
      });
    });
    setSkillsData(
      Object.entries(skillCount)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    );

    // 4. Improvement Progress
    if (allAnalyses.length >= 2) {
      const pairs = [];
      for (let i = 1; i < allAnalyses.length; i++) {
        pairs.push({
          name: `v${i} → v${i + 1}`,
          before: allAnalyses[i - 1].ats_score,
          after: allAnalyses[i].ats_score,
          change: allAnalyses[i].ats_score - allAnalyses[i - 1].ats_score,
        });
      }
      setImprovementData(pairs.slice(-6));
    }

    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#0b1120] border border-white/10 rounded-xl p-3 shadow-2xl">
        <p className="text-xs font-bold text-white mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}%</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-transparent pt-24 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] -z-10 animate-orb-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-[#8b5cf6]/5 rounded-full blur-[130px] -z-10 animate-orb-2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold rounded-full uppercase tracking-wider">
                <BarChart3 className="w-3 h-3 inline mr-1" /> Analytics
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">ATS Score Trends</h1>
            <p className="text-slate-400 text-sm mt-1">Track your resume improvement progress over time</p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
            </div>
          ) : trendData.length === 0 ? (
            <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-12 text-center">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Analyze at least one resume to see your trends.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Chart 1: ATS Score Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
              >
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-6">
                  <TrendingUp className="w-4 h-4 text-cyan-400" /> ATS Score Trend Over Time
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="score" stroke="#06b6d4" fill="url(#scoreGradient)" strokeWidth={3} name="ATS Score" dot={{ fill: "#06b6d4", r: 5, strokeWidth: 2, stroke: "#020617" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Chart 2: Average Score Per Month */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
              >
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-6">
                  <Calendar className="w-4 h-4 text-purple-400" /> Average Score Per Month
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="average" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Chart 3: Most Frequent Missing Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
              >
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-6">
                  <Target className="w-4 h-4 text-amber-400" /> Most Frequent Missing Skills
                </h3>
                {skillsData.length > 0 ? (
                  <div className="space-y-3">
                    {skillsData.map((item, idx) => {
                      const maxCount = skillsData[0]?.count || 1;
                      const width = Math.max(10, (item.count / maxCount) * 100);
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-xs text-slate-300 w-28 truncate font-semibold">{item.skill}</span>
                          <div className="flex-1 h-6 bg-white/[0.02] rounded-lg overflow-hidden border border-white/[0.04]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${width}%` }}
                              transition={{ delay: idx * 0.08, duration: 0.6 }}
                              className="h-full bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-lg flex items-center justify-end pr-2"
                            >
                              <span className="text-[10px] font-bold text-amber-400">{item.count}</span>
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-4">No skill data available yet.</p>
                )}
              </motion.div>

              {/* Chart 4: Improvement Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
              >
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-6">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Resume Improvement Progress
                </h3>
                {improvementData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={improvementData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="before" fill="#f87171" radius={[4, 4, 0, 0]} name="Before" />
                      <Bar dataKey="after" fill="#34d399" radius={[4, 4, 0, 0]} name="After" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-4">
                    📈 Analyze at least 2 resumes to track improvement progress.
                  </p>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

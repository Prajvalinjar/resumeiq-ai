"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, Users, FileText, Download, BarChart3, Activity, TrendingUp, Target
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from "recharts";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load admin stats");
        }
        setStats(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#0b1120] border border-white/10 rounded-xl p-3 shadow-2xl">
        <p className="text-xs font-bold text-white mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

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
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const metricCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-cyan-400", bg: "from-cyan-500/10 to-blue-500/10", border: "border-cyan-500/20" },
    { label: "Total Reports", value: stats.totalReports, icon: FileText, color: "text-purple-400", bg: "from-purple-500/10 to-violet-500/10", border: "border-purple-500/20" },
    { label: "Total Downloads", value: stats.totalDownloads, icon: Download, color: "text-emerald-400", bg: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-500/20" },
    { label: "Avg ATS Score", value: `${stats.averageAtsScore}%`, icon: BarChart3, color: "text-amber-400", bg: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/20" },
    { label: "Active Users (30d)", value: stats.dailyActiveUsers, icon: Activity, color: "text-rose-400", bg: "from-rose-500/10 to-pink-500/10", border: "border-rose-500/20" },
  ];

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
              <span className="text-[10px] px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 font-extrabold rounded-full uppercase tracking-wider">
                <Shield className="w-3 h-3 inline mr-1" /> Admin
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Analytics Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Platform-wide metrics and analytics</p>
          </motion.div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {metricCards.map((card, idx) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`bg-gradient-to-br ${card.bg} backdrop-blur-xl border ${card.border} rounded-2xl p-5 shadow-2xl`}
              >
                <card.icon className={`w-6 h-6 ${card.color} mb-3`} />
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{card.label}</p>
                <p className={`text-2xl font-extrabold mt-1 ${card.color}`}>{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* User Growth */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> User Growth (30 days)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats.userGrowth || []}>
                  <defs>
                    <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#06b6d4" fill="url(#userGrowthGrad)" strokeWidth={2} name="Users" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Reports Generated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-6">
                <BarChart3 className="w-4 h-4 text-purple-400" /> Reports Generated (30 days)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.reportsPerDay || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Reports" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Top Job Roles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-amber-400" /> Top Job Roles
              </h3>
              <div className="space-y-3">
                {(stats.topJobRoles || []).slice(0, 8).map((item: any, idx: number) => {
                  const maxCount = stats.topJobRoles[0]?.count || 1;
                  const width = Math.max(10, (item.count / maxCount) * 100);
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs text-slate-300 w-36 truncate font-semibold">{item.role}</span>
                      <div className="flex-1 h-5 bg-white/[0.02] rounded-lg overflow-hidden border border-white/[0.04]">
                        <div className="h-full bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-lg flex items-center justify-end pr-2" style={{ width: `${width}%` }}>
                          <span className="text-[10px] font-bold text-amber-400">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Most Common Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-emerald-400" /> Most Common Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(stats.topSkills || []).slice(0, 15).map((item: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-xs font-bold"
                  >
                    {item.skill} ({item.count})
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

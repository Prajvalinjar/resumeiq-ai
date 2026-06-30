"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, SortDesc, FileText, Calendar, Download,
  Trash2, Eye, ChevronLeft, ChevronRight, Loader2, AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AnalysisResult } from "@/types/analysis";
import ReportDownloadButton from "@/components/ReportDownloadButton";
import Link from "next/link";

const SCORE_RANGES = [
  { label: "All Scores", min: 0, max: 100 },
  { label: "0 - 50", min: 0, max: 50 },
  { label: "50 - 70", min: 50, max: 70 },
  { label: "70 - 85", min: 70, max: 85 },
  { label: "85 - 100", min: 85, max: 100 },
];

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"date_desc" | "date_asc" | "score_desc" | "score_asc">("date_desc");
  const [scoreRange, setScoreRange] = useState({ min: 0, max: 100 });
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("analyses")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        setAnalyses((data || []).map((a: any) => ({
          id: a.id,
          fileName: a.file_name,
          fileSize: a.file_size,
          targetRole: a.target_role,
          atsScore: a.ats_score,
          recruiterReadiness: a.recruiter_readiness,
          createdAt: a.created_at,
          data: a.data,
          ...(a.data as any),
        })));
        setLoading(false);
        return;
      }
    }

    // Fallback to localStorage
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("resumeiq_history");
      setAnalyses(raw ? JSON.parse(raw) : []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);

    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from("analyses").delete().eq("id", id).eq("user_id", session.user.id);
        // Also delete from resume_reports if exists
        await supabase.from("resume_reports").delete().eq("user_id", session.user.id);
      }
    }

    // Also remove from localStorage
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("resumeiq_history");
      if (raw) {
        const updated = JSON.parse(raw).filter((a: any) => a.id !== id);
        localStorage.setItem("resumeiq_history", JSON.stringify(updated));
      }
    }

    setAnalyses(prev => prev.filter(a => a.id !== id));
    setDeleting(null);
  };

  // Filter, search, sort
  const filtered = analyses
    .filter(a => {
      const matchesSearch = a.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            a.targetRole?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesScore = a.atsScore >= scoreRange.min && a.atsScore <= scoreRange.max;
      return matchesSearch && matchesScore;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "date_asc": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "score_desc": return b.atsScore - a.atsScore;
        case "score_asc": return a.atsScore - b.atsScore;
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortOrder, scoreRange]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-transparent pt-24 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] -z-10 animate-orb-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-[#8b5cf6]/5 rounded-full blur-[130px] -z-10 animate-orb-2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Resume History</h1>
            <p className="text-slate-400 text-sm mt-1">View, search, and manage all your analyzed resumes</p>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by file name or job role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Score Range Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={`${scoreRange.min}-${scoreRange.max}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split("-").map(Number);
                    setScoreRange({ min, max });
                  }}
                  className="bg-slate-950/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-cyan-500/50 min-w-[150px]"
                >
                  {SCORE_RANGES.map((r) => (
                    <option key={r.label} value={`${r.min}-${r.max}`}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="relative">
                <SortDesc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={sortOrder}
                  onChange={(e: any) => setSortOrder(e.target.value)}
                  className="bg-slate-950/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-cyan-500/50 min-w-[160px]"
                >
                  <option value="date_desc">Latest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="score_desc">Highest Score</option>
                  <option value="score_asc">Lowest Score</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</span>
            <span>Page {currentPage} of {Math.max(totalPages, 1)}</span>
          </div>

          {/* History Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">No resumes found matching your criteria.</p>
              <Link href="/analyze" className="text-cyan-400 text-sm hover:underline mt-2 inline-block">
                Analyze your first resume →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {paginated.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl hover:border-white/[0.12] transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* File Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                          <FileText className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">{item.fileName}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-slate-400 font-semibold">{item.targetRole}</span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ATS Score */}
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-extrabold ${
                          item.atsScore >= 80 ? "text-emerald-400" :
                          item.atsScore >= 60 ? "text-amber-400" :
                          "text-red-400"
                        }`}>
                          {item.atsScore}%
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                          item.atsScore >= 80 ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" :
                          item.atsScore >= 60 ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" :
                          "bg-red-500/10 border border-red-500/20 text-red-400"
                        }`}>
                          {item.atsScore >= 80 ? "Optimized" : item.atsScore >= 60 ? "Average" : "Low"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard?analysisId=${item.id}`}
                          className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.06] transition text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>

                        <ReportDownloadButton analysis={item} />

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          className="p-2 rounded-xl border border-white/10 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition disabled:opacity-50"
                          title="Delete Report"
                        >
                          {deleting === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Suggestions */}
                    {expandedId === item.id && item.suggestions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-4 pt-4 border-t border-white/[0.06]"
                      >
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Suggestions</p>
                        <ul className="space-y-2">
                          {(item.suggestions || []).slice(0, 3).map((s: string, i: number) => (
                            <li key={i} className="text-xs text-slate-300 flex gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="mt-3 text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold transition"
                    >
                      {expandedId === item.id ? "Hide Details" : "Show Suggestions"}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 pt-4"
            >
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((page, idx, arr) => (
                  <span key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="text-slate-600 px-1">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                        page === currentPage
                          ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400"
                          : "border border-white/10 text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Trash2, Sparkles, FileText, CheckCircle2,
  AlertTriangle, ArrowLeft, RefreshCw, MessageSquare,
  Award, Compass, Terminal, ShieldAlert
} from "lucide-react";
import { extractTextFromPDF } from "@/lib/pdf";
import { AnalysisResult } from "@/types/analysis";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";
import ReportDownloadButton from "@/components/ReportDownloadButton";

const ROLES = [
  "Data Analyst",
  "Data Scientist",
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer"
];

const STAGES = [
  "Extracting resume text from PDF document...",
  "Analyzing formatting structures and page layouts...",
  "Evaluating resume against ATS scanner constraints...",
  "Correlating skills with target role requirements...",
  "Generating custom bullet rewrites and final score..."
];


export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth and Credit State
  const [user, setUser] = useState<{ email: string; isGuest: boolean } | null>(null);
  const [credits, setCredits] = useState(2);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");


  // Load user data and config status on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({ email: session.user.email || "", isGuest: false });
          const { data: profile } = await supabase
            .from("profiles")
            .select("credits")
            .eq("id", session.user.id)
            .single();
          if (profile) {
            setCredits(profile.credits);
          }
          return;
        }
      }

      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("resumeiq_user");
        const storedCredits = localStorage.getItem("resumeiq_credits");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser({ email: "guest@resumeiq.ai", isGuest: true });
        }
        setCredits(storedCredits ? parseInt(storedCredits) : 2);
      }
    };

    fetchUser();
  }, []);

  // Load sample analysis if requested in URL query
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("sample") === "true") {
        const sampleResult: AnalysisResult = {
          id: "sample-analysis-id",
          fileName: "sample_software_engineer_resume.pdf",
          fileSize: 124500,
          targetRole: "Software Engineer",
          atsScore: 84,
          recruiterReadiness: 89,
          strengths: [
            "Strong technical stack listing modern languages (TypeScript, React, Node.js, Python).",
            "Dedicated Projects section demonstrating practical web application development and scalability.",
            "Education and certifications sections are clearly formatted and easy to parse."
          ],
          weaknesses: [
            "Lack of quantifiable results/metrics in career history bullet points (needs more percentages/numbers).",
            "Missing critical containerization and orchestration keywords (Docker, Kubernetes).",
            "Formatting uses multiple columns which can occasionally get garbled by older ATS scanners."
          ],
          missingKeywords: [
            "Docker",
            "Kubernetes",
            "CI/CD Pipelines",
            "Redis Caching",
            "System Design"
          ],
          missingSkills: [
            "Docker",
            "Kubernetes",
            "CI/CD",
            "Redis",
            "PostgreSQL optimization",
            "Jest Unit Testing"
          ],
          formattingIssues: [
            "Multi-column styling may confuse older ATS parsers."
          ],
          suggestions: [
            "Quantify resume statements. (e.g. change 'built page' to 'built responsive frontend page improving user retention by 15%').",
            "Add cloud and caching technologies (AWS, Redis) in a dedicated technical skills section.",
            "Convert double-column layout to a clean single-column structure for maximum compatibility."
          ],
          improvedBullets: [
            {
              original: "Worked on database tasks and wrote backend code.",
              improved: "Designed and optimized PostgreSQL database query indexes, reducing query response times by 32% for high-throughput APIs.",
              explanation: "Uses strong action verb 'Designed and optimized' instead of generic 'Worked', specifies tech (PostgreSQL), and quantifies impact with a metric."
            },
            {
              original: "Responsible for building the frontend using React.",
              improved: "Architected and built interactive dashboard features using React and TypeScript, improving core web vitals by 28%.",
              explanation: "Strong verbs, specifies TypeScript addition, and links front-end work to a measurable metric (core web vitals)."
            }
          ],
          createdAt: new Date().toISOString()
        };
        setResult(sampleResult);

        // Clean up URL query parameters so page refresh doesn't force sample again
        const newUrl = window.location.pathname;
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, []);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are supported for resume analysis.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleDeleteFile = () => {
    setFile(null);
    setTargetRole("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Run multi-stage loading and call analysis API
  const handleAnalyze = async () => {
    if (!file || !targetRole) return;

    // Check credits before proceeding (only for guest users — logged-in users always pass)
    const isGuest = !user || user.isGuest;
    if (isGuest && credits <= 0) {
      setError("You have 0 credits remaining. Please log in or register a free account to get unlimited access.");
      setAuthModalTab("signup");
      setIsAuthModalOpen(true);
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setCurrentStage(0);

    // Set up stage timer animation
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        clearInterval(stageInterval);
        return prev;
      });
    }, 1200);

    try {
      // 1. Extract text from PDF
      const extractedText = await extractTextFromPDF(file);

      // 2. Call API route handler
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extractedText,
          targetRole,
          fileName: file.name,
          fileSize: file.size
        })
      });

      if (!response.ok) {
        throw new Error("Failed to process resume analysis");
      }

      const data: AnalysisResult = await response.json();

      // Wait for stages to complete visually before showing results
      setTimeout(async () => {
        clearInterval(stageInterval);
        setResult(data);
        setIsAnalyzing(false);

        // 3. Update local state
        if (isSupabaseConfigured && supabase && user && !user.isGuest) {
          // Data is already saved to the database securely via the API route
          if (credits < 999) {
            setCredits((prev) => Math.max(0, prev - 1));
          }
        } else {
          // Fallback Local Storage Mode
          if (typeof window !== "undefined") {
            const currentHistory = JSON.parse(localStorage.getItem("resumeiq_history") || "[]");
            localStorage.setItem("resumeiq_history", JSON.stringify([data, ...currentHistory]));

            const nextCredits = Math.max(0, credits - 1);
            localStorage.setItem("resumeiq_credits", nextCredits.toString());
            setCredits(nextCredits);

            // Dispatch storage event to alert Navbar/Dashboard immediately
            window.dispatchEvent(new Event("storage"));
          }
        }
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
      setIsAnalyzing(false);
      clearInterval(stageInterval);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-transparent py-16 px-6 relative overflow-hidden">
        
        {/* Background Ambient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] -z-10 animate-orb-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[130px] -z-10 animate-orb-2" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />

        <div className="max-w-7xl mx-auto relative z-10">

          <AnimatePresence mode="wait">

            {/* Step 1: Upload and Configure */}
            {!isAnalyzing && !result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-3xl mx-auto"
              >
                <div className="text-center mb-10 space-y-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#6366f1]/10 text-cyan-400 text-xs font-semibold border border-[#6366f1]/20">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-400" /> RESUME SCRUBBER
                  </span>
                  <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
                    Optimize Your Resume
                  </h1>
                  <p className="text-slate-400 text-base max-w-xl mx-auto">
                    Upload your PDF and select a target role. We will test it against ATS parsers and suggest structural rewrites.
                  </p>
                </div>

                <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl glow-border">
                  
                  {/* Drag and drop card */}
                  {!file ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
                        isDragOver
                          ? "border-[#6366f1] bg-[#6366f1]/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                          : "border-white/10 hover:border-indigo-500/50 bg-white/[0.01]"
                      }`}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                        <Upload className="w-8 h-8 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        Drag and drop your PDF resume
                      </h3>
                      <p className="text-xs text-slate-400 mt-2">
                        or click to browse local files (PDF only, max 5MB)
                      </p>
                    </div>
                  ) : (
                    // Uploaded File Info
                    <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-6 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 break-all text-sm">{file.name}</h4>
                          <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDeleteFile}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  )}

                  {/* Target Role selection */}
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 pt-6 border-t border-white/[0.06]"
                    >
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">
                        Target Role
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {ROLES.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setTargetRole(role)}
                            className={`p-3 text-[11px] font-bold rounded-xl border text-center transition-all duration-200 ${
                              targetRole === role
                                ? "border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                                : "border-white/[0.06] bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]"
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <div className="mt-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {file && targetRole && (
                    <button
                      onClick={handleAnalyze}
                      className="mt-8 w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:scale-[1.01] transition duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                      <Sparkles className="w-5 h-5" /> Analyze Resume Free
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Analyzing State */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto text-center py-12"
              >
                <div className="relative w-28 h-28 mx-auto mb-8 bg-[#0b1120]/40 rounded-full flex items-center justify-center border border-white/5 shadow-2xl">
                  {/* Glowing spinner */}
                  <div className="absolute inset-0 rounded-full border-4 border-white/[0.02]" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-[#6366f1] border-b-transparent border-l-transparent"
                  />
                  <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center shadow-inner">
                    <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Analyzing Resume</h2>
                <p className="text-slate-400 text-sm">Please wait while the AI parses your experiences.</p>

                {/* Progress Stages List */}
                <div className="mt-8 space-y-3.5 text-left bg-slate-950/40 border border-white/[0.08] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="scanner-line"></div>
                  {STAGES.map((stage, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm relative z-10">
                      {idx < currentStage ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : idx === currentStage ? (
                        <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/10 shrink-0" />
                      )}
                      <span className={`${
                        idx < currentStage
                          ? "text-slate-500 line-through"
                          : idx === currentStage
                            ? "text-white font-bold"
                            : "text-slate-500"
                      }`}>
                        {stage}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Analysis Results Report */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Report Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl glow-border">
                  <div>
                    <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 py-1.5 px-4 rounded-full">
                      Analysis Report
                    </span>
                    <h1 className="text-2xl font-extrabold text-white mt-3 flex items-center gap-2">
                      {result.targetRole} <span className="text-slate-400 font-medium text-lg">| {result.fileName}</span>
                    </h1>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <ReportDownloadButton analysis={result} />
                    <button
                      onClick={() => setResult(null)}
                      className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-slate-300 font-semibold hover:bg-white/[0.06] hover:text-white transition flex items-center gap-2 text-sm shadow-md"
                    >
                      <ArrowLeft className="w-4 h-4" /> Analyze Another
                    </button>

                    <button
                      onClick={() => window.location.href = `/dashboard?analysisId=${result.id}`}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold hover:shadow-[0_0_15px_rgba(99,102,241,0.35)] shadow-md flex items-center gap-2 text-sm transition"
                    >
                      <MessageSquare className="w-4 h-4" /> Chat With Career Coach
                    </button>
                  </div>
                </div>

                {/* Grid dashboard */}
                <div className="grid lg:grid-cols-3 gap-8">

                  {/* Left Column - Scores & Overview */}
                  <div className="space-y-8">
                    {/* ATS Score card */}
                    <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full -z-10 animate-pulse" />
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">ATS Match Score</h3>

                      <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                        {/* Circular progress bar SVG */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" className="stroke-white/[0.04]" strokeWidth="8" fill="transparent" />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            className="stroke-cyan-400"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={251.2}
                            initial={{ strokeDashoffset: 251.2 }}
                            animate={{ strokeDashoffset: 251.2 - (251.2 * result.atsScore) / 100 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-4xl font-extrabold text-white">{result.atsScore}%</span>
                          <span className={`text-[10px] font-extrabold mt-1.5 uppercase tracking-wider ${
                            result.atsScore >= 80
                              ? "text-emerald-400"
                              : result.atsScore >= 60
                                ? "text-amber-400"
                                : "text-red-400"
                          }`}>
                            {result.atsScore >= 80 ? "Optimized" : result.atsScore >= 60 ? "Average Match" : "Needs Review"}
                          </span>
                        </div>
                      </div>

                      {/* Recruiter readiness score */}
                      <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-between items-center text-left">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recruiter Readiness</p>
                          <p className="text-xs text-slate-500 mt-0.5">Based on content layout & verbs</p>
                        </div>
                        <span className="text-2xl font-extrabold text-[#8b5cf6] drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">{result.recruiterReadiness}%</span>
                      </div>
                    </div>

                    {/* Strengths Card */}
                    <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
                      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-400" /> Resume Strengths
                      </h3>
                      <ul className="space-y-3">
                        {result.strengths.map((str, idx) => (
                          <li key={idx} className="flex gap-3 text-xs sm:text-sm text-slate-300">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{str}</span>
                          </li>
                        ))}
                        {result.strengths.length === 0 && (
                          <p className="text-slate-500 text-xs italic">No significant strengths detected.</p>
                        )}
                      </ul>
                    </div>

                    {/* Weaknesses Card */}
                    <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
                      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" /> Resume Weaknesses
                      </h3>
                      <ul className="space-y-3">
                        {result.weaknesses.map((weak, idx) => (
                          <li key={idx} className="flex gap-3 text-xs sm:text-sm text-slate-300">
                            <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                            <span>{weak}</span>
                          </li>
                        ))}
                        {result.weaknesses.length === 0 && (
                          <p className="text-slate-500 text-xs italic">No significant weaknesses detected.</p>
                        )}
                      </ul>
                    </div>

                  </div>

                  {/* Right Column - Analysis breakdowns */}
                  <div className="lg:col-span-2 space-y-8">

                    {/* Missing Skills & Keywords */}
                    <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
                      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Compass className="w-5 h-5 text-cyan-400" /> Keyword & Skill Gap Analysis
                      </h3>

                      <div className="space-y-6">
                        {/* Missing Skills */}
                        <div>
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Missing Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {result.missingSkills.map((skill, idx) => (
                              <span key={idx} className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/15 text-xs font-semibold">
                                + {skill}
                              </span>
                            ))}
                            {result.missingSkills.length === 0 && (
                              <span className="text-xs text-slate-500 italic">No missing skills detected! Excellent match.</span>
                            )}
                          </div>
                        </div>

                        {/* Missing Keywords */}
                        <div>
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Missing ATS Keywords</p>
                          <div className="flex flex-wrap gap-2">
                            {result.missingKeywords.map((kw, idx) => (
                              <span key={idx} className="px-3 py-1.5 rounded-xl bg-white/[0.02] text-slate-300 text-xs font-semibold border border-white/[0.06] hover:bg-white/[0.05]">
                                {kw}
                              </span>
                            ))}
                            {result.missingKeywords.length === 0 && (
                              <span className="text-xs text-slate-500 italic">No missing keywords detected.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions list */}
                    <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
                      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#8b5cf6]" /> AI Suggestions
                      </h3>
                      <ul className="space-y-3.5">
                        {result.suggestions.map((sug, idx) => (
                          <li key={idx} className="text-xs sm:text-sm text-slate-300 flex gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-[#8b5cf6] shrink-0 mt-1.5" />
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bullet Rewrite Suggestions */}
                    <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
                      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-cyan-400" /> AI Bullet Point Optimizer
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                        Replace generic bullet descriptions with quantified, high-impact statements tailored for {result.targetRole}.
                      </p>

                      <div className="space-y-6">
                        {result.improvedBullets.map((bullet, idx) => (
                          <div key={idx} className="border border-white/[0.06] bg-slate-950/40 rounded-2xl p-5 space-y-4 shadow-inner">
                            <div>
                              <p className="text-[10px] font-extrabold text-red-400 uppercase tracking-widest">Original bullet point</p>
                              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 italic">"{bullet.original}"</p>
                            </div>
                            
                            <div className="bg-emerald-500/5 border-l-4 border-emerald-500 p-3.5 rounded-r-xl">
                              <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">ResumeIQ Optimized Rewrite</p>
                              <p className="text-xs sm:text-sm text-white mt-1.5 font-bold">"{bullet.improved}"</p>
                            </div>

                            <div>
                              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Why this works</p>
                              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{bullet.explanation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
}
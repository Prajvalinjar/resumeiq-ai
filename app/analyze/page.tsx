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

  // Load user data on mount
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

    // Check credits before proceeding (only for limited guests/mock users)
    const isLimited = !user || user.isGuest || credits <= 0;
    if (isLimited && credits <= 0) {
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

        // 3. Save to database / local storage
        if (isSupabaseConfigured && supabase && user && !user.isGuest) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Save analysis record to DB
            await supabase.from("analyses").insert({
              id: data.id,
              user_id: session.user.id,
              file_name: file.name,
              file_size: file.size,
              target_role: targetRole,
              ats_score: data.atsScore,
              recruiter_readiness: data.recruiterReadiness,
              data: data
            });

            // If credits is limited, deduct 1. If not (e.g. simulated pro), keep it.
            if (credits < 999) {
              const nextCredits = Math.max(0, credits - 1);
              await supabase
                .from("profiles")
                .update({ credits: nextCredits })
                .eq("id", session.user.id);
              setCredits(nextCredits);
            }
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

      <main className="min-h-screen bg-slate-50/50 py-16 px-6">
        <div className="max-w-7xl mx-auto">

          <AnimatePresence mode="wait">

            {/* Step 1: Upload and Configure */}
            {!isAnalyzing && !result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-3xl mx-auto"
              >
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
                    Optimize Your Resume
                  </h1>
                  <p className="mt-3 text-slate-600 text-lg">
                    Upload your PDF and select a target role. We will test it against ATS parsers and suggest structural rewrites.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
                  {/* Drag and drop card */}
                  {!file ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragOver
                          ? "border-blue-500 bg-blue-50/40"
                          : "border-slate-300 hover:border-blue-400 bg-slate-50/30"
                        }`}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="w-16 h-16 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">
                        Drag and drop your PDF resume
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        or click to browse local files (PDF only, max 5MB)
                      </p>
                    </div>
                  ) : (
                    // Uploaded File Info
                    <div className="border border-green-200 bg-green-50/40 rounded-2xl p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 break-all">{file.name}</h4>
                          <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDeleteFile}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Target Role selection */}
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 pt-6 border-t border-slate-100"
                    >
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Target Role
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {ROLES.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setTargetRole(role)}
                            className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all duration-200 ${targetRole === role
                                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {file && targetRole && (
                    <button
                      onClick={handleAnalyze}
                      className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 flex items-center justify-center gap-2"
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
                <div className="relative w-28 h-28 mx-auto mb-8">
                  {/* Glowing spinner */}
                  <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-purple-600 border-b-transparent border-l-transparent"
                  />
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Resume</h2>
                <p className="text-slate-500 text-sm">Please wait while the AI parses your experiences.</p>

                {/* Progress Stages List */}
                <div className="mt-8 space-y-3.5 text-left bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
                  {STAGES.map((stage, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      {idx < currentStage ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : idx === currentStage ? (
                        <RefreshCw className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />
                      )}
                      <span className={`${idx < currentStage
                          ? "text-slate-500 line-through"
                          : idx === currentStage
                            ? "text-slate-800 font-semibold"
                            : "text-slate-400"
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 py-1 px-3 rounded-full">
                      Analysis Report
                    </span>
                    <h1 className="text-2xl font-extrabold text-slate-900 mt-2 flex items-center gap-2">
                      {result.targetRole} <span className="text-slate-400 font-medium text-lg">| {result.fileName}</span>
                    </h1>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setResult(null)}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition flex items-center gap-2 text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" /> Analyze Another
                    </button>

                    <button
                      onClick={() => window.location.href = `/dashboard?analysisId=${result.id}`}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:opacity-95 shadow-md flex items-center gap-2 text-sm"
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
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10" />
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">ATS Match Score</h3>

                      <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                        {/* Circular progress bar SVG */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" className="stroke-slate-100" strokeWidth="8" fill="transparent" />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            className="stroke-blue-600"
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
                          <span className="text-4xl font-extrabold text-slate-900">{result.atsScore}%</span>
                          <span className={`text-xs font-bold mt-1 uppercase ${result.atsScore >= 80
                              ? "text-green-600"
                              : result.atsScore >= 60
                                ? "text-amber-500"
                                : "text-red-500"
                            }`}>
                            {result.atsScore >= 80 ? "Optimized" : result.atsScore >= 60 ? "Average Match" : "Needs Review"}
                          </span>
                        </div>
                      </div>

                      {/* Recruiter readiness score */}
                      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-left">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase">Recruiter Readiness</p>
                          <p className="text-sm font-semibold text-slate-700 mt-1">Based on content layout & verbs</p>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">{result.recruiterReadiness}%</span>
                      </div>
                    </div>

                    {/* Strengths Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-600" /> Resume Strengths
                      </h3>
                      <ul className="space-y-3">
                        {result.strengths.map((str, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-slate-700">
                            <span className="text-emerald-500 font-bold shrink-0">✓</span>
                            <span>{str}</span>
                          </li>
                        ))}
                        {result.strengths.length === 0 && (
                          <p className="text-slate-400 text-sm italic">No significant strengths detected.</p>
                        )}
                      </ul>
                    </div>

                    {/* Weaknesses Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" /> Resume Weaknesses
                      </h3>
                      <ul className="space-y-3">
                        {result.weaknesses.map((weak, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-slate-700">
                            <span className="text-amber-500 font-bold shrink-0">⚠️</span>
                            <span>{weak}</span>
                          </li>
                        ))}
                        {result.weaknesses.length === 0 && (
                          <p className="text-slate-400 text-sm italic">No significant weaknesses detected.</p>
                        )}
                      </ul>
                    </div>

                  </div>

                  {/* Right Column - Analysis breakdowns */}
                  <div className="lg:col-span-2 space-y-8">

                    {/* Missing Skills & Keywords */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Compass className="w-5 h-5 text-blue-600" /> Keyword & Skill Gap Analysis
                      </h3>

                      <div className="space-y-6">
                        {/* Missing Skills */}
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-3">Missing Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {result.missingSkills.map((skill, idx) => (
                              <span key={idx} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-100 text-xs font-semibold">
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
                          <p className="text-xs font-bold text-slate-400 uppercase mb-3">Missing ATS Keywords</p>
                          <div className="flex flex-wrap gap-2">
                            {result.missingKeywords.map((kw, idx) => (
                              <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
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
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" /> AI Suggestions
                      </h3>
                      <ul className="space-y-3.5">
                        {result.suggestions.map((sug, idx) => (
                          <li key={idx} className="text-sm text-slate-700 flex gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bullet Rewrite Suggestions */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-blue-600" /> AI Bullet Point Optimizer
                      </h3>
                      <p className="text-sm text-slate-500 mb-6">
                        Replace generic bullet descriptions with quantified, high-impact statements tailored for {result.targetRole}.
                      </p>

                      <div className="space-y-6">
                        {result.improvedBullets.map((bullet, idx) => (
                          <div key={idx} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                            <div>
                              <p className="text-xs font-bold text-red-500 uppercase">Original bullet point</p>
                              <p className="text-sm text-slate-600 mt-1 italic font-medium">"{bullet.original}"</p>
                            </div>

                            <div className="bg-blue-50/40 border-l-4 border-blue-600 p-3 rounded-r-xl">
                              <p className="text-xs font-bold text-blue-700 uppercase">ResumeIQ Optimized Rewrite</p>
                              <p className="text-sm text-slate-900 mt-1 font-semibold">"{bullet.improved}"</p>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase">Why this works</p>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{bullet.explanation}</p>
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
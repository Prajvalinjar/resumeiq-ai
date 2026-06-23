"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, Sparkles, TrendingUp, User, MessageSquare, 
  Send, Calendar, ChevronRight, LogOut, LogIn, 
  Award, AlertCircle, Compass, FileText, CheckCircle2 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AnalysisResult, ChatMessage } from "@/types/analysis";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";

// Default dummy history to show when user first loads, in case their local history is empty
const DUMMY_HISTORY: AnalysisResult[] = [
  {
    id: "anl-dummy1",
    fileName: "John_Doe_Developer_Resume.pdf",
    fileSize: 85240,
    targetRole: "Software Engineer",
    atsScore: 86,
    recruiterReadiness: 82,
    strengths: ["Excellent project description matching React stack", "Clear contact section and links", "Clean typography"],
    weaknesses: ["Missing SQL database keywords", "Bullet points lack measurable metrics"],
    missingKeywords: ["PostgreSQL", "Docker", "CI/CD"],
    missingSkills: ["Docker", "Kubernetes", "PostgreSQL"],
    formattingIssues: [],
    suggestions: ["Add PostgreSQL and Docker to technical skills", "Quantify app performance by adding query latency details"],
    improvedBullets: [
      {
        original: "Responsible for writing clean code in a React app.",
        improved: "Engineered responsive dashboard using React and TypeScript, increasing page speed by 28% using bundle-splitting.",
        explanation: "Quantified results and highlighted tools."
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString() // 3 days ago
  },
  {
    id: "anl-dummy2",
    fileName: "John_Doe_Developer_Resume_V1.pdf",
    fileSize: 84100,
    targetRole: "Software Engineer",
    atsScore: 68,
    recruiterReadiness: 62,
    strengths: ["Clean section headers", "Education details clearly written"],
    weaknesses: ["Missing important keywords", "Bullets are too generic"],
    missingKeywords: ["TypeScript", "Next.js", "Redis"],
    missingSkills: ["TypeScript", "Next.js"],
    formattingIssues: ["Multi-column layout might confuse older scanners"],
    suggestions: ["Convert to single-column layout", "Integrate TypeScript to skills list"],
    improvedBullets: [],
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString() // 7 days ago
  },
  {
    id: "anl-dummy3",
    fileName: "John_Doe_Old_Resume.pdf",
    fileSize: 76000,
    targetRole: "Software Engineer",
    atsScore: 42,
    recruiterReadiness: 38,
    strengths: ["Lists graduation details"],
    weaknesses: ["Missing action verbs", "No metrics", "Missing modern libraries"],
    missingKeywords: ["React", "Git", "REST APIs"],
    missingSkills: ["React", "CSS Grid", "Git"],
    formattingIssues: ["Missing Projects section"],
    suggestions: ["Add a dedicated Projects section", "Rewrite experience starting with active action verbs"],
    improvedBullets: [],
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString() // 12 days ago
  }
];

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const initialAnalysisId = searchParams.get("analysisId");

  // State
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  
  // Auth state
  const [user, setUser] = useState<{ email: string; isGuest: boolean } | null>(null);
  const [credits, setCredits] = useState(2);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize data (Auth, Credits, and Analysis History)
  useEffect(() => {
    const initializeDashboard = async () => {
      let activeUser = null;
      let activeCredits = 2;
      let activeUserId: string | null = null;

      // 1. Resolve Auth state and Credits
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          activeUserId = session.user.id;
          activeUser = { email: session.user.email || "", isGuest: false };
          
          // Fetch real profile database credits
          const { data: profile } = await supabase
            .from("profiles")
            .select("credits")
            .eq("id", session.user.id)
            .single();
            
          if (profile) {
            activeCredits = profile.credits;
          }
        }
      }

      if (!activeUser && typeof window !== "undefined") {
        const storedUser = localStorage.getItem("resumeiq_user");
        if (storedUser) {
          activeUser = JSON.parse(storedUser);
          const storedCredits = localStorage.getItem("resumeiq_credits");
          activeCredits = storedCredits ? parseInt(storedCredits) : 2;
        } else {
          activeUser = { email: "guest@resumeiq.ai", isGuest: true };
          activeCredits = 2;
        }
      }

      setUser(activeUser);
      setCredits(activeCredits);

      // 2. Fetch Analysis History
      let localHistory: AnalysisResult[] = [];
      if (activeUserId && isSupabaseConfigured && supabase) {
        try {
          const { data: dbAnalyses } = await supabase
            .from("analyses")
            .select("*")
            .eq("user_id", activeUserId)
            .order("created_at", { ascending: false });

          if (dbAnalyses && dbAnalyses.length > 0) {
            localHistory = dbAnalyses.map((rec: any) => ({
              ...(rec.data as AnalysisResult),
              id: rec.id,
              createdAt: rec.created_at || new Date().toISOString()
            }));
          }
        } catch (dbErr) {
          console.error("Failed to load history from Supabase:", dbErr);
        }
      }

      // If no DB history or fallback active, read local storage
      if (localHistory.length === 0 && typeof window !== "undefined") {
        const localHistoryRaw = localStorage.getItem("resumeiq_history");
        if (localHistoryRaw) {
          localHistory = JSON.parse(localHistoryRaw);
        }
      }

      // Combine with dummy history to ensure dashboard looks populated
      const combinedHistory = [...localHistory, ...DUMMY_HISTORY];
      setHistory(combinedHistory);

      // Select active analysis
      if (initialAnalysisId) {
        const matching = combinedHistory.find(item => item.id === initialAnalysisId);
        if (matching) setSelectedAnalysis(matching);
        else setSelectedAnalysis(combinedHistory[0] || null);
      } else {
        setSelectedAnalysis(combinedHistory[0] || null);
      }
    };

    initializeDashboard();

    // Listen to local storage updates (fallback login/logout sync)
    const handleStorageChange = () => {
      initializeDashboard();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [initialAnalysisId]);

  // Load chat session when selected analysis changes
  useEffect(() => {
    if (!selectedAnalysis) return;
    
    const loadChatHistory = async () => {
      // 1. Try to load from Supabase if real user is active
      if (isSupabaseConfigured && supabase && user && !user.isGuest) {
        try {
          const { data: dbMessages } = await supabase
            .from("chat_messages")
            .select("id, role, content, created_at")
            .eq("analysis_id", selectedAnalysis.id)
            .order("created_at", { ascending: true });

          if (dbMessages && dbMessages.length > 0) {
            setChatMessages(
              dbMessages.map((msg: any) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                createdAt: msg.created_at
              }))
            );
            return;
          }
        } catch (dbErr) {
          console.error("Failed to load chat history from Supabase:", dbErr);
        }
      }

      // 2. Local fallback
      if (typeof window !== "undefined") {
        const storedChatRaw = localStorage.getItem(`resumeiq_chat_${selectedAnalysis.id}`);
        if (storedChatRaw) {
          setChatMessages(JSON.parse(storedChatRaw));
        } else {
          // Initial coach message
          const welcome: ChatMessage = {
            id: "welcome",
            role: "assistant",
            content: `Hi there! I've reviewed your resume analysis for **${selectedAnalysis.targetRole}** (ATS Score: ${selectedAnalysis.atsScore}%).\n\nWhat would you like to improve first? I can help you write better bullet points, suggest keywords to insert, or brainstorm projects.`,
            createdAt: new Date().toISOString()
          };
          setChatMessages([welcome]);
          
          // Write default welcome to Supabase to establish record
          if (isSupabaseConfigured && supabase && user && !user.isGuest) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              await supabase.from("chat_messages").insert({
                id: "welcome",
                analysis_id: selectedAnalysis.id,
                user_id: session.user.id,
                role: "assistant",
                content: welcome.content,
                created_at: welcome.createdAt
              });
            }
          }
        }
      }
    };

    loadChatHistory();
  }, [selectedAnalysis, user]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isCoachTyping]);

  // Send chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedAnalysis || isCoachTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Math.random().toString(36).substr(2, 9)}`,
      role: "user",
      content: newMessage,
      createdAt: new Date().toISOString()
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setNewMessage("");
    setIsCoachTyping(true);

    // Local Storage Save
    if (typeof window !== "undefined") {
      localStorage.setItem(`resumeiq_chat_${selectedAnalysis.id}`, JSON.stringify(updatedMessages));
    }

    // Supabase Save (User Message)
    let authUserUuid: string | null = null;
    if (isSupabaseConfigured && supabase && user && !user.isGuest) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        authUserUuid = session.user.id;
        await supabase.from("chat_messages").insert({
          id: userMsg.id,
          analysis_id: selectedAnalysis.id,
          user_id: authUserUuid,
          role: "user",
          content: userMsg.content,
          created_at: userMsg.createdAt
        });
      }
    }

    try {
      // Call Gemini Coach API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          newMessage: userMsg.content,
          analysisResult: selectedAnalysis
        })
      });

      if (!response.ok) throw new Error("Failed to get chat response");

      const data = await response.json();
      
      const coachMsg: ChatMessage = {
        id: `msg-${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, coachMsg];
      setChatMessages(finalMessages);
      
      if (typeof window !== "undefined") {
        localStorage.setItem(`resumeiq_chat_${selectedAnalysis.id}`, JSON.stringify(finalMessages));
      }

      // Supabase Save (Coach Response)
      if (authUserUuid && isSupabaseConfigured && supabase) {
        await supabase.from("chat_messages").insert({
          id: coachMsg.id,
          analysis_id: selectedAnalysis.id,
          user_id: authUserUuid,
          role: "assistant",
          content: coachMsg.content,
          created_at: coachMsg.createdAt
        });
      }
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `msg-err`,
        role: "assistant",
        content: "Sorry, I lost connection to the server. Please check your credentials or try asking a simpler question.",
        createdAt: new Date().toISOString()
      };
      setChatMessages([...updatedMessages, errMsg]);
    } finally {
      setIsCoachTyping(false);
    }
  };

  // Auth Modal Triggers
  const handleLogIn = () => {
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
  };

  const handleLogOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser({ email: "guest@resumeiq.ai", isGuest: true });
    setCredits(2);
    if (typeof window !== "undefined") {
      localStorage.removeItem("resumeiq_user");
      localStorage.setItem("resumeiq_credits", "2");
      // Trigger update
      window.dispatchEvent(new Event("storage"));
    }
  };

  // Prepare points for ATS progression SVG graph
  const renderATSChart = () => {
    if (history.length === 0) return null;
    
    // Sort chronological: oldest first, maximum 5 items
    const chartData = [...history]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-5);

    if (chartData.length < 2) {
      return (
        <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
          📈 Graph requires at least 2 analyses to track progression.
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const padding = 35;
    
    const points = chartData.map((item, idx) => {
      const x = padding + (idx * (width - padding * 2)) / (chartData.length - 1);
      const y = height - padding - (item.atsScore * (height - padding * 2)) / 100;
      return { x, y, score: item.atsScore, role: item.targetRole, date: new Date(item.createdAt).toLocaleDateString() };
    });

    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");

    // Fill path points (closed loop)
    const fillPoints = `${padding},${height - padding} ${polylinePoints} ${width - padding},${height - padding}`;

    return (
      <div className="relative">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1.5" />

          {/* Fill under line */}
          <polygon points={fillPoints} fill="url(#chartGradient)" />

          {/* Line */}
          <polyline
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3.5"
            points={polylinePoints}
            strokeLinecap="round"
            className="stroke-blue-600"
          />

          {/* Interactive Dots */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="6"
                className="fill-blue-600 stroke-white cursor-pointer"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                className="fill-slate-700"
              >
                {p.score}%
              </text>
              <text
                x={p.x}
                y={height - 12}
                textAnchor="middle"
                fontSize="9"
                fontWeight="500"
                className="fill-slate-400"
              >
                {idx + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50/50 py-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Welcome back, {user?.isGuest ? "Guest User" : user?.email.split("@")[0]}!
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user?.isGuest ? (
                    <span className="text-amber-600 font-semibold flex items-center gap-1">
                      ⚠️ Limited Account • Credits: {credits}/2 remaining
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      ✓ Pro Account • Unlimited Analyses
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {user?.isGuest ? (
                <button
                  onClick={handleLogIn}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow hover:shadow-md hover:scale-[1.02] transition flex items-center gap-2 text-sm"
                >
                  <LogIn className="w-4 h-4" /> Sign In / Sign Up
                </button>
              ) : (
                <button
                  onClick={handleLogOut}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold transition flex items-center gap-2 text-sm"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              )}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-4 gap-8">
            
            {/* Column 1: History Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[650px] overflow-hidden">
                <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-4 mb-4">
                  <History className="w-5 h-5 text-slate-600" />
                  <span>Resume History</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedAnalysis(item)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedAnalysis?.id === item.id
                          ? "border-blue-500 bg-blue-50/40 shadow-sm"
                          : "border-slate-100 bg-white hover:border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-slate-800 text-sm truncate w-[70%]">
                          {item.targetRole}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                          item.atsScore >= 80 
                            ? "bg-green-50 text-green-700" 
                            : item.atsScore >= 60 
                              ? "bg-amber-50 text-amber-600" 
                              : "bg-red-50 text-red-500"
                        }`}>
                          {item.atsScore}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 truncate">{item.fileName}</p>
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                  
                  {history.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      No analyses found.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columns 2-3: Analysis Detail Dashboard */}
            <div className="lg:col-span-2 space-y-6">
              {selectedAnalysis ? (
                <>
                  {/* Performance charts */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span>ATS Improvement Tracking</span>
                    </div>
                    {renderATSChart()}
                  </div>

                  {/* Selected Item Breakdown details */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{selectedAnalysis.targetRole}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{selectedAnalysis.fileName}</p>
                      </div>
                      <span className="text-4xl font-extrabold text-blue-600">{selectedAnalysis.atsScore}%</span>
                    </div>

                    {/* Skill Gap Analysis list */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-purple-600" /> Missing Skills (Gap)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnalysis.missingSkills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-100 text-xs font-semibold">
                            + {skill}
                          </span>
                        ))}
                        {selectedAnalysis.missingSkills.length === 0 && (
                          <span className="text-xs text-slate-400 italic">No missing skills. Perfect match!</span>
                        )}
                      </div>
                    </div>

                    {/* Strengths & Weaknesses quick preview */}
                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl">
                        <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2">Strengths</h4>
                        <ul className="space-y-1.5">
                          {selectedAnalysis.strengths.slice(0, 3).map((str, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex gap-1">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span className="truncate">{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-2xl">
                        <h4 className="text-xs font-bold text-amber-800 uppercase mb-2">Weaknesses</h4>
                        <ul className="space-y-1.5">
                          {selectedAnalysis.weaknesses.slice(0, 3).map((weak, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex gap-1">
                              <span className="text-amber-500 font-bold">⚠️</span>
                              <span className="truncate">{weak}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bullet rewrites */}
                    {selectedAnalysis.improvedBullets && selectedAnalysis.improvedBullets.length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-blue-600" /> Suggested Rewrite Preview
                        </h4>
                        <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40">
                          <p className="text-[10px] font-bold text-red-500 uppercase">Original</p>
                          <p className="text-xs text-slate-500 mt-0.5 italic">"{selectedAnalysis.improvedBullets[0].original}"</p>
                          
                          <p className="text-[10px] font-bold text-blue-600 uppercase mt-3">Optimized</p>
                          <p className="text-xs text-slate-900 mt-0.5 font-bold">"{selectedAnalysis.improvedBullets[0].improved}"</p>
                        </div>
                      </div>
                    )}

                  </div>
                </>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                  Select a resume from history to view details.
                </div>
              )}
            </div>

            {/* Column 4: AI Career Coach Chat Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col h-[650px] overflow-hidden">
                {/* Coach Header */}
                <div className="bg-slate-900 text-white p-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">AI Career Coach</h3>
                    <p className="text-[10px] text-blue-400">Interactive guidance</p>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 max-w-[90%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
                        msg.role === "user"
                          ? "bg-blue-600 border-blue-600 text-white rounded-tr-none"
                          : "bg-white border-slate-200 text-slate-800 rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  
                  {isCoachTyping && (
                    <div className="flex gap-2 max-w-[90%]">
                      <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Presets / Action Tips inside chat */}
                {selectedAnalysis && (
                  <div className="border-t border-slate-100 p-2 bg-white grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setNewMessage("Suggest project ideas to fix my missing skills.");
                      }}
                      className="text-[10px] border border-slate-200 hover:bg-slate-50 text-slate-600 p-2 rounded-xl text-left truncate font-semibold"
                    >
                      💡 Suggest project ideas
                    </button>
                    <button
                      onClick={() => {
                        setNewMessage("How can I improve my ATS score?");
                      }}
                      className="text-[10px] border border-slate-200 hover:bg-slate-50 text-slate-600 p-2 rounded-xl text-left truncate font-semibold"
                    >
                      📈 Boost ATS score
                    </button>
                  </div>
                )}

                {/* Input box */}
                <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedAnalysis ? "Ask the coach..." : "Select a resume first..."}
                    disabled={!selectedAnalysis || isCoachTyping}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={!selectedAnalysis || isCoachTyping}
                    className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 p-2.5 rounded-xl transition shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

          </div>

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

import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}

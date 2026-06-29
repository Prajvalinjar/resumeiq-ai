"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, Sparkles, TrendingUp, User, MessageSquare, 
  Send, Calendar, ChevronRight, LogOut, LogIn, 
  Award, AlertCircle, Compass, FileText, CheckCircle2,
  Search, Filter, SortDesc, Download
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AnalysisResult, ChatMessage } from "@/types/analysis";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";
import ReportDownloadButton from "@/components/ReportDownloadButton";

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
  
  // History Management State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [sortOrder, setSortOrder] = useState<"date_desc" | "date_asc" | "score_desc" | "score_asc">("date_desc");

  // Computed filtered & sorted history
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.targetRole.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "All" || item.targetRole === filterRole;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    switch (sortOrder) {
      case "date_asc": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "score_desc": return b.atsScore - a.atsScore;
      case "score_asc": return a.atsScore - b.atsScore;
      case "date_desc":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const uniqueRoles = ["All", ...Array.from(new Set(history.map(item => item.targetRole)))];
  
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

    // Supabase Save (User Message) - Now handled by secure server API
    let authUserUuid: string | null = null;
    if (isSupabaseConfigured && supabase && user && !user.isGuest) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        authUserUuid = session.user.id;
      }
    }

    try {
      // Call Coach API
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

      // Supabase Save (Coach Response) - Now handled securely by server API
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
        <div className="h-32 flex items-center justify-center text-slate-500 text-xs">
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
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

          {/* Fill under line */}
          <polygon points={fillPoints} fill="url(#chartGradient)" />

          {/* Line */}
          <polyline
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            points={polylinePoints}
            strokeLinecap="round"
            className="stroke-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]"
          />

          {/* Interactive Dots */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                className="fill-cyan-400 stroke-slate-950 cursor-pointer hover:scale-125 transition-transform"
                strokeWidth="2.5"
              />
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                className="fill-white"
              >
                {p.score}%
              </text>
              <text
                x={p.x}
                y={height - 12}
                textAnchor="middle"
                fontSize="8"
                fontWeight="600"
                className="fill-slate-500"
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

      <main className="min-h-screen bg-transparent pt-24 pb-12 px-6 relative overflow-hidden">
        
        {/* Background Ambient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] -z-10 animate-orb-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-[#8b5cf6]/5 rounded-full blur-[130px] -z-10 animate-orb-2" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl glow-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/[0.04] rounded-2xl flex items-center justify-center text-cyan-400 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <User className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Welcome back, {user?.isGuest ? "Guest User" : user?.email.split("@")[0]}!
                </h1>
                <div className="mt-1 flex items-center">
                  {user?.isGuest ? (
                    <span className="text-[10px] px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold rounded-full uppercase tracking-wider">
                      ⚠️ Limited Account • Credits: {credits}/2 remaining
                    </span>
                  ) : (
                    <span className="text-[10px] px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold rounded-full uppercase tracking-wider">
                      ✓ Pro Account • Unlimited Analyses
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {user?.isGuest ? (
                <button
                  onClick={handleLogIn}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl font-bold shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:scale-[1.01] transition flex items-center gap-2 text-xs"
                >
                  <LogIn className="w-4 h-4" /> Sign In / Sign Up
                </button>
              ) : (
                <button
                  onClick={handleLogOut}
                  className="px-5 py-2.5 border border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.06] hover:text-white rounded-xl font-bold transition flex items-center gap-2 text-xs"
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
              <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col h-[650px] overflow-hidden">
                <div className="flex items-center justify-between gap-2 text-white font-extrabold border-b border-white/[0.06] pb-4 mb-4 text-sm tracking-wide">
                  <div className="flex items-center gap-2">
                    <History className="w-4.5 h-4.5 text-slate-400" />
                    <span>Resume History</span>
                  </div>
                  <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full">{filteredHistory.length}</span>
                </div>

                <div className="space-y-3 mb-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search by role or file..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  
                  {/* Filter & Sort */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-[10px] text-white appearance-none focus:outline-none focus:border-cyan-500/50"
                      >
                        {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <SortDesc className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={sortOrder}
                        onChange={(e: any) => setSortOrder(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-[10px] text-white appearance-none focus:outline-none focus:border-cyan-500/50"
                      >
                        <option value="date_desc">Newest First</option>
                        <option value="date_asc">Oldest First</option>
                        <option value="score_desc">Highest Score</option>
                        <option value="score_asc">Lowest Score</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {filteredHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedAnalysis(item)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedAnalysis?.id === item.id
                          ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                          : "border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-white text-xs truncate w-[70%]">
                          {item.targetRole}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0 ${
                          item.atsScore >= 80 
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                            : item.atsScore >= 60 
                              ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" 
                              : "bg-red-500/10 border border-red-500/20 text-red-400"
                        }`}>
                          {item.atsScore}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">{item.fileName}</p>
                      <p className="text-[9px] text-slate-500 mt-2.5 flex items-center gap-1 font-semibold">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                  
                  {filteredHistory.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-xs italic">
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
                  <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center gap-2 text-white font-extrabold mb-4 text-sm tracking-wide">
                      <TrendingUp className="w-4.5 h-4.5 text-cyan-400" />
                      <span>ATS Improvement Tracking</span>
                    </div>
                    {renderATSChart()}
                  </div>

                  {/* Selected Item Breakdown details */}
                  <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl space-y-6">
                    <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">{selectedAnalysis.targetRole}</h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">{selectedAnalysis.fileName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className="text-4xl font-extrabold text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">{selectedAnalysis.atsScore}%</span>
                        <ReportDownloadButton analysis={selectedAnalysis} />
                      </div>
                    </div>

                    {/* Skill Gap Analysis list */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5 uppercase tracking-widest">
                        <Compass className="w-4 h-4 text-purple-400" /> Missing Skills (Gap)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnalysis.missingSkills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/15 text-xs font-bold">
                            + {skill}
                          </span>
                        ))}
                        {selectedAnalysis.missingSkills.length === 0 && (
                          <span className="text-xs text-slate-500 italic">No missing skills. Perfect match!</span>
                        )}
                      </div>
                    </div>

                    {/* Strengths & Weaknesses quick preview */}
                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                        <h4 className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest mb-3">Strengths</h4>
                        <ul className="space-y-2">
                          {selectedAnalysis.strengths.slice(0, 3).map((str, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span className="truncate">{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                        <h4 className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-3">Weaknesses</h4>
                        <ul className="space-y-2">
                          {selectedAnalysis.weaknesses.slice(0, 3).map((weak, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex gap-2">
                              <span className="text-amber-400 font-bold">⚠️</span>
                              <span className="truncate">{weak}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bullet rewrites */}
                    {selectedAnalysis.improvedBullets && selectedAnalysis.improvedBullets.length > 0 && (
                      <div className="pt-4 border-t border-white/[0.06]">
                        <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5 uppercase tracking-widest">
                          <Award className="w-4 h-4 text-cyan-400" /> Suggested Rewrite Preview
                        </h4>
                        <div className="border border-white/[0.06] rounded-2xl p-4 bg-slate-950/40">
                          <p className="text-[9px] font-extrabold text-red-400 uppercase tracking-widest">Original</p>
                          <p className="text-xs text-slate-400 mt-1 italic">"{selectedAnalysis.improvedBullets[0].original}"</p>
                          
                          <p className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest mt-3.5">Optimized</p>
                          <p className="text-xs text-white mt-1 font-bold">"{selectedAnalysis.improvedBullets[0].improved}"</p>
                        </div>
                      </div>
                    )}

                  </div>
                </>
              ) : (
                <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-12 text-center text-slate-500 italic text-sm">
                  Select a resume from history to view details.
                </div>
              )}
            </div>

            {/* Column 4: AI Career Coach Chat Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#0b1120]/30 backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-2xl flex flex-col h-[650px] overflow-hidden glow-border">
                {/* Coach Header */}
                <div className="bg-slate-950/80 border-b border-white/[0.06] text-white p-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.25)]">
                      <Sparkles className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs">AI Career Coach</h3>
                      <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">Interactive guidance</p>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/20">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 max-w-[90%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      <div className={`p-3 rounded-2xl text-[11px] leading-relaxed whitespace-pre-line border shadow-md ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] border-[#6366f1]/20 text-white rounded-tr-none"
                          : "bg-white/[0.03] border-white/[0.06] text-slate-300 rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  
                  {isCoachTyping && (
                    <div className="flex gap-2 max-w-[90%]">
                      <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-2xl rounded-tl-none shadow-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Presets / Action Tips inside chat */}
                {selectedAnalysis && (
                  <div className="border-t border-white/[0.06] p-2 bg-slate-950/40 grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setNewMessage("Suggest project ideas to fix my missing skills.");
                      }}
                      className="text-[10px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 p-2 rounded-xl text-left truncate font-semibold"
                    >
                      💡 Suggest project ideas
                    </button>
                    <button
                      onClick={() => {
                        setNewMessage("How can I improve my ATS score?");
                      }}
                      className="text-[10px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 p-2 rounded-xl text-left truncate font-semibold"
                    >
                      📈 Boost ATS score
                    </button>
                  </div>
                )}

                {/* Input box */}
                <form onSubmit={handleSendMessage} className="border-t border-white/[0.06] p-4 bg-slate-950/40 flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedAnalysis ? "Ask the coach..." : "Select a resume first..."}
                    disabled={!selectedAnalysis || isCoachTyping}
                    className="flex-1 bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-slate-950/40 text-white placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={!selectedAnalysis || isCoachTyping}
                    className="bg-[#6366f1] text-white hover:bg-[#8b5cf6] disabled:bg-slate-800 disabled:text-slate-600 p-2.5 rounded-xl transition shrink-0"
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
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}

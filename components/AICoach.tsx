"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Sparkles, User, CheckCircle2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PRESETS = [
  {
    question: "How can I improve my Software Engineer resume?",
    answer: "To improve a **Software Engineer** resume, focus on:\n\n1. **Lead with tech stack**: List your languages/frameworks clearly under a 'Skills' section.\n2. **Quantify impact**: Instead of *'wrote backend APIs'*, use *'Designed REST APIs serving 50k+ daily users, reducing query latency by 18% using Redis caching'*. \n3. **Projects section**: List 2-3 github repos demonstrating clean code, CI/CD, or automated testing."
  },
  {
    question: "What skills do I need for a Data Analyst role?",
    answer: "The most sought-after skills for a **Data Analyst** are:\n\n* **SQL**: Subqueries, JOINs, Window Functions, and CTEs.\n* **Python/R**: Pandas, NumPy, or tidyverse for data cleaning.\n* **BI Tools**: Power BI or Tableau for interactive dashboards.\n* **Statistics**: A/B testing, regression analysis, and hypothesis testing."
  },
  {
    question: "Suggest a project to boost my ATS score.",
    answer: "A great project is an **Automated Data Pipeline**:\n\n* **Stack**: Python, SQLite, GitHub Actions.\n* **Resume Bullet**: *'Built ETL pipeline to fetch daily jobs data, parsing 1,000+ entries/day; reduced analysis latency by 40% with clean relational schemas.'*"
  }
];

export default function AICoach() {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your AI Career Coach. Click one of the questions below, and I'll show you how we optimize your resume!"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSelectPreset = (idx: number) => {
    if (isTyping) return;
    setActiveTab(idx);
    
    // Add user message
    const newMsgs = [...messages, { role: "user" as const, content: PRESETS[idx].question }];
    setMessages(newMsgs);
    setIsTyping(true);

    // Simulate typing
    setTimeout(() => {
      setMessages([...newMsgs, { role: "assistant" as const, content: PRESETS[idx].answer }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I am your AI Career Coach. Click one of the questions below, and I'll show you how we optimize your resume!"
      }
    ]);
    setActiveTab(null);
    setIsTyping(false);
  };

  return (
    <section className="bg-transparent px-6 py-24 border-b border-white/[0.04] overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
        
        {/* Left: Content */}
        <div className="lg:col-span-6 space-y-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 text-cyan-400 text-xs font-semibold border border-blue-500/20">
            💬 AI COACH PREVIEW
          </span>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
            An AI Career Coach <br />in Your Corner
          </h2>
          
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            ResumeIQ is more than a scanner. Once your resume is analyzed, chat with our career coach to rewrite bullet points, ask for project ideas, and tailor your experience to target roles.
          </p>

          {/* Bullet Benefits */}
          <div className="mt-8 space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">✓</span>
              <span className="text-slate-300 font-semibold text-sm">Get customized suggestions for projects to build.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">✓</span>
              <span className="text-slate-300 font-semibold text-sm">Rewrite specific dry sentences into high-impact bullets.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">✓</span>
              <span className="text-slate-300 font-semibold text-sm">Ask questions tailored specifically to your target roles.</span>
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button 
              onClick={handleReset}
              className="text-xs font-bold text-slate-400 hover:text-white underline transition duration-200"
            >
              Reset Conversation
            </button>
          </div>
        </div>

        {/* Right: Interactive Widget */}
        <div className="lg:col-span-6 relative w-full flex justify-center lg:justify-end">
          <div className="absolute top-10 -right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-[100px] -z-10" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-[100px] -z-10" />

          {/* Chat Window */}
          <div className="bg-[#0b1120]/45 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl flex flex-col h-[500px] overflow-hidden w-full max-w-[460px] glow-border">
            {/* Chat header */}
            <div className="bg-slate-950/80 border-b border-white/[0.06] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-white">ResumeIQ Coach</h3>
                  <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.6)]" /> Online
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/20">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${msg.role === "user" ? "bg-[#6366f1] text-white" : "bg-white/[0.08] text-white border border-white/10"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : "IQ"}
                    </div>
                    {/* Bubble */}
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line border shadow-md ${msg.role === "user" ? "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] border-[#6366f1]/20 text-white rounded-tr-none" : "bg-white/[0.03] border-white/[0.06] text-slate-300 rounded-tl-none"}`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full shrink-0 bg-white/[0.08] text-white border border-white/10 flex items-center justify-center text-xs">
                    IQ
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] p-4 rounded-2xl rounded-tl-none shadow-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Presets and Input */}
            <div className="border-t border-white/[0.06] p-4 bg-slate-950/40">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Ask a Question:</p>
              
              <div className="flex flex-col gap-2 mb-4">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(idx)}
                    disabled={isTyping}
                    className={`text-[11px] px-3.5 py-2.5 rounded-xl text-left border transition-all duration-200 font-semibold leading-normal ${
                      activeTab === idx 
                        ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-400" 
                        : "bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]"
                    }`}
                  >
                    {preset.question}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 border border-white/[0.06] rounded-xl px-3 py-2.5 bg-white/[0.02]">
                <input
                  type="text"
                  placeholder="Select a question above..."
                  disabled
                  className="flex-1 bg-transparent border-none text-xs outline-none text-slate-500"
                />
                <button disabled className="text-slate-600 p-1">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

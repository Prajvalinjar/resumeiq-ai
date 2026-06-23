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
    <section className="bg-slate-50 px-6 py-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Content */}
        <div>
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            💬 AI COACH PREVIEW
          </span>
          
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            An AI Career Coach in Your Corner
          </h2>
          
          <p className="mt-6 text-lg text-slate-600">
            ResumeIQ is more than a scanner. Once your resume is analyzed, chat with our career coach to rewrite bullet points, ask for project ideas, and tailor your experience to target roles.
          </p>

          {/* Bullet Benefits */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-slate-700 font-medium">Get customized suggestions for projects to build.</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-slate-700 font-medium">Rewrite specific dry sentences into high-impact bullets.</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-slate-700 font-medium">Ask questions tailored specifically to your target roles.</span>
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button 
              onClick={handleReset}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 underline transition duration-200"
            >
              Reset Conversation
            </button>
          </div>
        </div>

        {/* Right: Interactive Widget */}
        <div className="relative">
          <div className="absolute top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-40 -z-10" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-40 -z-10" />

          {/* Chat Window */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col h-[500px] overflow-hidden">
            {/* Chat header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">ResumeIQ Coach</h3>
                  <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" /> Online
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
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
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-800"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : "IQ"}
                    </div>
                    {/* Bubble */}
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm border ${msg.role === "user" ? "bg-blue-600 border-blue-600 text-white rounded-tr-none" : "bg-white border-slate-200 text-slate-800 rounded-tl-none"}`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full shrink-0 bg-slate-200 text-slate-800 flex items-center justify-center text-xs">
                    IQ
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Presets and Input */}
            <div className="border-t border-slate-200 p-4 bg-white">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ask a Question:</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(idx)}
                    disabled={isTyping}
                    className={`text-xs px-3 py-2 rounded-xl text-left border transition-all duration-200 font-medium ${
                      activeTab === idx 
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold" 
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {preset.question}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                <input
                  type="text"
                  placeholder="Click a suggestion above..."
                  disabled
                  className="flex-1 bg-transparent border-none text-sm outline-none text-slate-400"
                />
                <button disabled className="text-slate-300 p-1">
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

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Bot, User, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const QUICK_ACTIONS = [
  "How can I improve my resume?",
  "Why is my ATS score low?",
  "Which skills should I add?",
  "How can I match this job description?",
  "Suggest project ideas for my portfolio",
  "Help me rewrite my bullet points",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Welcome message
  useEffect(() => {
    const welcome: Message = {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your **ResumeIQ AI Assistant** 🤖\n\nI have access to your resume analysis history and can help you:\n\n• **Improve your resume** — Personalized tips\n• **Understand ATS scores** — What's affecting them\n• **Add missing skills** — What to include\n• **Match job descriptions** — Optimize for roles\n\nWhat would you like help with?",
      createdAt: new Date().toISOString(),
    };
    setMessages([welcome]);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.filter(m => m.id !== "welcome"),
          newMessage: text,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      const assistantMsg: Message = {
        id: `msg-${Date.now()}-reply`,
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages([...updatedMessages, assistantMsg]);
    } catch {
      setMessages([...updatedMessages, {
        id: `msg-err`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-transparent pt-20 pb-0 relative overflow-hidden flex flex-col">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] -z-10 animate-orb-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-[#8b5cf6]/5 rounded-full blur-[130px] -z-10 animate-orb-2" />

        <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 px-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">AI Resume Assistant</h1>
                <p className="text-[10px] text-cyan-400 font-semibold">Uses your report history for personalized advice</p>
              </div>
            </div>
          </motion.div>

          {/* Chat Container */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-0">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-cyan-500/10 border border-cyan-500/20"
                    : "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]"
                }`}>
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line border ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] border-[#6366f1]/20 text-white rounded-tr-none"
                    : "bg-[#0b1120]/50 border-white/[0.06] text-slate-300 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#0b1120]/50 border border-white/[0.06] p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  <span className="text-xs text-slate-500">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="py-3 border-t border-white/[0.06]">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  disabled={isTyping}
                  className="px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-[10px] text-slate-300 font-semibold whitespace-nowrap transition disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="pb-6 flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your resume..."
              disabled={isTyping}
              className="flex-1 bg-[#0b1120]/50 border border-white/[0.08] focus:border-cyan-500/50 rounded-xl px-4 py-3.5 text-sm outline-none text-white placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white p-3.5 rounded-xl hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

const rows = [
  {
    feature: "Turnaround Time",
    traditional: "2 to 5 Business Days",
    resumeiq: "Instant (under 10 seconds)",
    isBetter: true
  },
  {
    feature: "Average Cost",
    traditional: "$150 - $300 per review",
    resumeiq: "Free (2/day) or Unlimited Pro",
    isBetter: true
  },
  {
    feature: "ATS Compliance Scan",
    traditional: "Manual guessing by reviewer",
    resumeiq: "Direct algorithmic keyword & formatting match",
    isBetter: true
  },
  {
    feature: "Interactive Re-writes",
    traditional: "Static feedback PDF, no follow-ups",
    resumeiq: "AI Career Coach chat to rewrite specific bullets",
    isBetter: true
  },
  {
    feature: "Skill Gap Verification",
    traditional: "General resume tips",
    resumeiq: "Role-specific comparison (Data Analyst, SWE, etc.)",
    isBetter: true
  },
  {
    feature: "Availability",
    traditional: "Business hours only",
    resumeiq: "24/7/365 instant access",
    isBetter: true
  }
];

export default function Comparison() {
  return (
    <section className="bg-transparent px-6 py-24 border-b border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#8b5cf6]/10 text-violet-400 text-xs font-semibold border border-violet-500/20">
            ⚖️ THE ADVANTAGE
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Traditional Review vs. ResumeIQ AI
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Compare how we stack up against traditional manual resume writers and general career platforms.
          </p>
        </div>

        {/* Comparison Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-x-auto rounded-3xl border border-white/[0.08] shadow-2xl bg-slate-950/20 backdrop-blur-xl"
        >
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.08]">
                <th className="p-6 text-white font-bold text-base w-1/3">Feature</th>
                <th className="p-6 text-slate-400 font-semibold text-sm">Traditional Review</th>
                <th className="p-6 text-cyan-400 font-bold text-base bg-cyan-400/[0.02] border-l border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> ResumeIQ AI
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr 
                  key={idx} 
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.01] transition-colors"
                >
                  <td className="p-6 text-slate-200 font-medium text-sm">{row.feature}</td>
                  
                  {/* Traditional column */}
                  <td className="p-6 text-slate-400 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </span>
                      <span>{row.traditional}</span>
                    </div>
                  </td>
                  
                  {/* ResumeIQ AI column */}
                  <td className="p-6 text-white text-sm bg-cyan-400/[0.01] border-l border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-semibold text-slate-200">{row.resumeiq}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}

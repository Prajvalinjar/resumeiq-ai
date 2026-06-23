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
    <section className="bg-white px-6 py-24 border-b border-slate-200">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
            ⚖️ THE ADVANTAGE
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Traditional Review vs. ResumeIQ AI
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Compare how we stack up against traditional manual resume writers and general career platforms.
          </p>
        </div>

        {/* Comparison Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-x-auto rounded-3xl border border-slate-200 shadow-xl"
        >
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-6 text-slate-900 font-semibold text-lg w-1/3">Feature</th>
                <th className="p-6 text-slate-500 font-semibold text-lg">Traditional Review</th>
                <th className="p-6 text-blue-700 font-semibold text-lg bg-blue-50/50 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" /> ResumeIQ AI
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors`}
                >
                  <td className="p-6 text-slate-800 font-medium">{row.feature}</td>
                  
                  {/* Traditional column */}
                  <td className="p-6 text-slate-600 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <X className="w-4 h-4" />
                    </span>
                    <span>{row.traditional}</span>
                  </td>
                  
                  {/* ResumeIQ AI column */}
                  <td className="p-6 text-slate-900 font-medium bg-blue-50/30">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </span>
                      <span>{row.resumeiq}</span>
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

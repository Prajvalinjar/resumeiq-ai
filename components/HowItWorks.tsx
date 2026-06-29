"use client";

import { motion } from "framer-motion";
import { UploadCloud, Cpu, Lightbulb, Briefcase } from "lucide-react";

const steps = [
  {
    icon: UploadCloud,
    title: "1. Upload Resume",
    description: "Drag and drop your PDF resume. Our secure parser extracts your text in seconds.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50/50"
  },
  {
    icon: Cpu,
    title: "2. AI Reviews Resume",
    description: "Gemini AI scans your content against real-world recruiter rubrics and role keywords.",
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50/50"
  },
  {
    icon: Lightbulb,
    title: "3. Get Suggestions",
    description: "Receive an ATS score, missing skills list, and specific rewritten bullet points.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50/50"
  },
  {
    icon: Briefcase,
    title: "4. Apply With Confidence",
    description: "Export your polished resume and land more interviews without fear of automated rejection.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50/50"
  }
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-transparent px-6 py-24 border-t border-b border-white/[0.04]">

      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-[140px] -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 text-cyan-400 text-xs font-semibold border border-blue-500/20">
            🚀 WORKFLOW
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            How ResumeIQ AI Works
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Four simple steps to optimize your resume for applicant tracking systems and human recruiters.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">

          {/* Connector line for large screens */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-[1px] bg-white/[0.06] -translate-y-12 -z-10" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -8 }}
                className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 shadow-2xl hover:border-indigo-500/35 hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col items-center text-center relative"
              >
                {/* Step indicator */}
                <span className="absolute top-4 right-4 text-xs font-extrabold text-slate-500">
                  0{idx + 1}
                </span>

                {/* Icon Container */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} p-4 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,255,255,0.08)] mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-white mb-3">
                  {step.title.replace(/^\d+\.\s+/, "")}
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-transparent px-6 py-32 text-center border-t border-white/[0.04]">
      
      {/* Decorative colored blobs for dark mode feel */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[110px] -z-10 animate-orb-1" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[110px] -z-10 animate-orb-2" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />

      <div className="relative max-w-4xl mx-auto flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Sparkle badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-cyan-400 font-semibold text-xs border border-white/10 shadow-[0_0_15px_rgba(6,182,212,0.08)]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Ready to upgrade?
          </span>

          <h2 className="mt-8 text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl">
            Your Dream Job Starts With A Better Resume.
          </h2>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
            Stop sending resumes into the black hole. Uncover missing skills and optimize for ATS scanners in 10 seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/analyze"
              className="inline-flex justify-center items-center px-8 py-4 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-[1.03] transition duration-300 gap-2"
            >
              Analyze Resume Free <ArrowRight className="w-5 h-5" />
            </Link>

            <button 
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              className="inline-flex justify-center items-center px-8 py-4 rounded-xl border border-white/10 bg-white/[0.02] text-slate-300 font-semibold hover:bg-white/[0.06] hover:text-white transition duration-300"
            >
              View Dashboard
            </button>
          </div>

          <p className="mt-8 text-xs text-slate-500 font-medium">
            No credit card required • 2 free analyses daily • Upgrade anytime
          </p>
        </motion.div>

      </div>
    </section>
  );
}

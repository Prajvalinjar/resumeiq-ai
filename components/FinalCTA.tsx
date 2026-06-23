"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-slate-900 px-6 py-24 text-center border-t border-slate-800">
      
      {/* Decorative colored blobs for dark mode feel */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/20 rounded-full blur-[100px] -z-10" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Sparkle badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950 text-blue-400 font-semibold text-sm border border-blue-800/40">
            <Sparkles className="w-4 h-4" /> Ready to upgrade?
          </span>

          <h2 className="mt-8 text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl">
            Your Dream Job Starts With A Better Resume.
          </h2>

          <p className="mt-6 text-lg text-slate-300 max-w-xl">
            Stop sending resumes into the black hole. Uncover missing skills and optimize for ATS scanners in 10 seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/analyze"
              className="inline-flex justify-center items-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 gap-2"
            >
              Analyze Resume Free <ArrowRight className="w-5 h-5" />
            </Link>

            <button 
              onClick={() => {
                // Navigate to dashboard or show info
                window.location.href = "/dashboard";
              }}
              className="inline-flex justify-center items-center px-8 py-4 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold hover:text-white transition duration-300"
            >
              View Dashboard
            </button>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            No credit card required • 2 free analyses daily • Upgrade anytime
          </p>
        </motion.div>

      </div>
    </section>
  );
}

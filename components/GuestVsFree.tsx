"use client";

import { motion } from "framer-motion";
import { Check, X, ShieldAlert, Sparkles, LogIn } from "lucide-react";
import Link from "next/link";

export default function GuestVsFree() {
  return (
    <section className="bg-transparent px-6 py-24 border-b border-white/[0.04]">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            🎁 TIER COMPARISON
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Guest vs. Free Account
          </h2>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Start completely anonymous to test it out, or register a free account in 2 seconds to unlock unlimited reviews and our career coach.
          </p>
        </div>

        {/* Cards Wrapper */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">

          {/* Guest Tier */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border border-white/[0.06] rounded-3xl p-8 flex flex-col justify-between hover:shadow-2xl transition bg-white/[0.01] backdrop-blur-xl"
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Guest Tier</h3>
                <span className="text-[10px] px-2.5 py-1 bg-white/[0.06] text-slate-300 font-semibold rounded-full uppercase tracking-wider border border-white/5">Anonymous</span>
              </div>
              <p className="text-slate-400 mt-2 text-sm">Perfect for a quick test run.</p>

              <div className="mt-8 text-4xl font-extrabold text-white">$0 <span className="text-sm font-medium text-slate-500">/ forever</span></div>

              {/* Feature List */}
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>2 resume reviews per day</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full ATS Score report (0-100)</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Basic suggestion list</span>
                </li>
                <li className="flex items-center gap-3 text-slate-500 text-sm line-through">
                  <X className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Unlimited analyses</span>
                </li>
                <li className="flex items-center gap-3 text-slate-500 text-sm line-through">
                  <X className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Interactive AI Career Coach</span>
                </li>
                <li className="flex items-center gap-3 text-slate-500 text-sm line-through">
                  <X className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Resume and chat history tracking</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href="/analyze"
                className="w-full inline-flex justify-center items-center py-3.5 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl font-bold transition text-sm border border-white/10 shadow-sm"
              >
                Analyze as Guest
              </Link>
            </div>
          </motion.div>

          {/* Free Account Tier */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative border-2 border-[#6366f1]/35 rounded-3xl p-8 flex flex-col justify-between hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition bg-[#0b1120]/30 backdrop-blur-xl"
          >
            {/* Pop badge */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-extrabold text-[10px] uppercase tracking-widest py-1.5 px-4 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Recommended
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Free Account</h3>
                <span className="text-[10px] px-2.5 py-1 bg-indigo-500/10 text-indigo-400 font-bold rounded-full uppercase tracking-wider border border-indigo-500/20">Registered</span>
              </div>
              <p className="text-slate-400 mt-2 text-sm">For comprehensive job seekers.</p>

              <div className="mt-8 text-4xl font-extrabold text-white">$0 <span className="text-sm font-medium text-slate-500">/ forever</span></div>

              {/* Feature List */}
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited resume reviews</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full ATS Score report (0-100)</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Deep AI suggestion list & rewrites</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive AI Career Coach</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive Dashboard and history</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Skill gap comparison matrices</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => {
                  const loginBtn = document.querySelector("button[class*='bg-gradient-to-r']");
                  if (loginBtn) (loginBtn as HTMLElement).click();
                }}
                className="w-full inline-flex justify-center items-center py-3.5 px-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl font-bold shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition duration-200 text-sm"
              >
                <LogIn className="w-4 h-4 mr-2" /> Sign Up Free Now
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

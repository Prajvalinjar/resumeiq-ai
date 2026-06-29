"use client";

import Link from "next/link";
import { Sparkles, Play, Flame, Compass, Brain } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-transparent px-6 py-20 lg:py-32">

      {/* 3D Perspective Digital Grid */}
      <div className="absolute inset-0 perspective-grid -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 digital-grid w-full h-[150%]" />
      </div>

      {/* AI Energy Core + Concentric Rotating Tech Rings behind title */}
      <div className="absolute top-1/2 left-[15%] lg:left-[25%] -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] pointer-events-none -z-10 opacity-30 select-none hidden md:block">
        {/* Core glow */}
        <div className="absolute inset-[30%] bg-gradient-to-r from-cyan-400 via-indigo-600 to-purple-600 rounded-full blur-[55px] animate-pulse" />
        
        {/* Concentric rings */}
        <div className="absolute inset-[22%] border border-cyan-400/20 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.15)] animate-pulse" />
        <div className="absolute inset-[14%] border-2 border-dashed border-indigo-500/15 rounded-full animate-rotate-clockwise" />
        <div className="absolute inset-[6%] border border-purple-500/10 rounded-full animate-rotate-counter">
          <div className="w-[98%] h-[98%] rounded-full border border-dashed border-cyan-400/5 rotate-45" />
        </div>
        <div className="absolute inset-0 border border-white/5 rounded-full" />
        <div className="absolute inset-[-8%] border border-white/[0.02] rounded-full" />
        
        {/* Holographic Scanlines */}
        <div className="absolute inset-[-8%] bg-[linear-gradient(to_bottom,transparent_50%,rgba(6,182,212,0.05)_50%)] bg-[size:100%_4px] rounded-full overflow-hidden" />
      </div>

      {/* Subtle Background Glows to overlay on base space bg */}
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[120px] animate-orb-1 -z-10" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[135px] -z-10" />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center w-full">

        {/* Left Column (Content) */}
        <div className="lg:col-span-7 text-left space-y-8">

          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
              Next-Gen AI Resume Optimizer
            </span>
          </div>

          {/* Premium Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white tracking-tight">
            Land More Interviews <br />
            With{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              AI Insights
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
            Instantly review your resume against ATS scanner filters, discover hidden skill gaps, and rewrite lacklustre bullet points using our state-of-the-art AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/analyze"
              className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-[1.03] transition duration-300"
            >
              <Sparkles className="w-5 h-5 text-white" /> Analyze Resume Free
            </Link>

            <Link
              href="/analyze?sample=true"
              className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl border border-white/10 bg-white/[0.03] text-slate-200 font-semibold hover:bg-white/[0.08] hover:text-white transition duration-300"
            >
              <Play className="w-4 h-4 text-slate-300 fill-slate-300" /> See Sample Analysis
            </Link>
          </div>

          {/* Trust Metric */}
          <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm font-medium pt-2">
            <span className="text-[#8b5cf6]">★</span>
            <span className="text-[#8b5cf6]">★</span>
            <span className="text-[#8b5cf6]">★</span>
            <span className="text-[#8b5cf6]">★</span>
            <span className="text-[#8b5cf6]">★</span>
            <span className="text-slate-400">Preferred by top tech candidates • 2 free scans daily</span>
          </div>

        </div>

        {/* Right Column (Live Mockup Panel) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">

          <div className="w-full max-w-[420px] bg-slate-950/40 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden glow-border">
            
            {/* Top Right Ambient Orb */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-full -z-10" />

            {/* Score & Badge Row */}
            <div className="flex justify-between items-center pb-6 border-b border-white/[0.06]">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  ATS Score Analysis
                </p>
                <h2 className="mt-1 text-5xl font-extrabold text-white flex items-baseline gap-1">
                  86<span className="text-lg font-bold text-cyan-400">%</span>
                </h2>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide">
                Strong Match
              </span>
            </div>

            {/* Progress Bar Area */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium">Optimization Score</span>
                <span className="font-bold text-slate-200">86%</span>
              </div>
              <div className="w-full h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-cyan-400 to-[#6366f1] shadow-[0_0_10px_rgba(6,182,212,0.3)]"></div>
              </div>
            </div>

            {/* AI Insights Matrix */}
            <div className="mt-8 space-y-4">
              
              {/* Row 1 */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-xs text-slate-400 flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  AI Suggestions
                </span>
                <span className="text-xs font-bold text-white">5 Critical</span>
              </div>

              {/* Row 2 */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-xs text-slate-400 flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-red-400" />
                  Missing Skills
                </span>
                <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/15 px-2 py-0.5 rounded">
                  SQL, Docker
                </span>
              </div>

              {/* Row 3 */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-xs text-slate-400 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Resume Strength
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded">
                  Competitive
                </span>
              </div>

            </div>

            {/* Live Advice Prompt */}
            <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex gap-3">
              <span className="text-base mt-0.5">💡</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Add quantifiable metrics (e.g. percentages, values) to increase your ATS rating above 90%.
              </p>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
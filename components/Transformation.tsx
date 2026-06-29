export default function Transformation() {
  return (
    <section className="relative bg-transparent px-6 py-24 overflow-hidden border-t border-white/[0.04]">

      {/* Grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />

      <div className="relative max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-6">

          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 text-cyan-400 text-xs font-semibold border border-blue-500/20">
            ✨ SEE THE DIFFERENCE
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Turn Rejections Into Interviews
          </h2>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            See how ResumeIQ AI transforms ordinary resumes into recruiter-ready applications that clear ATS hurdles.
          </p>

        </div>

        {/* Transformation Cards */}
        <div className="mt-16 grid lg:grid-cols-12 gap-8 items-center">

          {/* BEFORE */}
          <div className="lg:col-span-5 bg-[#0b1120]/30 backdrop-blur-md border border-red-500/15 rounded-3xl p-8 shadow-2xl hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] transition duration-300 space-y-6">

            <div className="flex justify-between items-center">

              <span className="px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-wide">
                BEFORE
              </span>

              <span className="text-3xl font-extrabold text-red-400">
                42%
              </span>

            </div>

            {/* Resume Preview */}
            <div className="bg-slate-950/40 rounded-2xl border border-white/[0.06] p-5">

              <div className="space-y-3.5">

                <div className="h-2.5 bg-slate-700 rounded w-3/4"></div>

                <div className="h-2 bg-slate-800 rounded w-full"></div>

                <div className="h-2 bg-slate-800 rounded w-5/6"></div>

                <div className="h-2 bg-slate-800 rounded w-2/3"></div>

              </div>

            </div>

            <div className="space-y-4 pt-2">

              <div className="flex gap-3 text-sm text-slate-300">
                <span className="text-red-400 font-bold">❌</span>
                Weak bullet points lacking metrics
              </div>

              <div className="flex gap-3 text-sm text-slate-300">
                <span className="text-red-400 font-bold">❌</span>
                Missing critical SQL and cloud keywords
              </div>

              <div className="flex gap-3 text-sm text-slate-300">
                <span className="text-red-400 font-bold">❌</span>
                Generic, copy-pasted role summaries
              </div>

            </div>

          </div>

          {/* CENTER - Powered by AI */}
          <div className="lg:col-span-2 text-center flex flex-col items-center justify-center space-y-4 py-8 lg:py-0">

            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] text-white text-2xl font-bold animate-pulse">
              ➜
            </div>

            <div>
              <p className="font-bold text-slate-200 text-sm">
                Powered by AI
              </p>

              <p className="mt-1 text-slate-400 text-xs max-w-[150px] mx-auto leading-relaxed">
                ResumeIQ rebuilds and upgrades your content.
              </p>
            </div>

          </div>

          {/* AFTER */}
          <div className="lg:col-span-5 bg-[#0b1120]/30 backdrop-blur-md border border-emerald-500/15 rounded-3xl p-8 shadow-2xl hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition duration-300 space-y-6">

            <div className="flex justify-between items-center">

              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide">
                AFTER
              </span>

              <span className="text-3xl font-extrabold text-emerald-400">
                86%
              </span>

            </div>

            {/* Resume Preview */}
            <div className="bg-slate-950/40 rounded-2xl border border-white/[0.06] p-5">

              <div className="space-y-3.5">

                <div className="h-2.5 bg-cyan-400 rounded w-3/4 shadow-[0_0_8px_rgba(6,182,212,0.4)]"></div>

                <div className="h-2 bg-[#6366f1] rounded w-full"></div>

                <div className="h-2 bg-slate-700 rounded w-5/6"></div>

                <div className="h-2 bg-slate-700 rounded w-2/3"></div>

              </div>

            </div>

            <div className="space-y-4 pt-2">

              <div className="flex gap-3 text-sm text-slate-300">
                <span className="text-emerald-400 font-bold">✅</span>
                Quantified, high-impact achievements
              </div>

              <div className="flex gap-3 text-sm text-slate-300">
                <span className="text-emerald-400 font-bold">✅</span>
                Fully optimized technical keywords
              </div>

              <div className="flex gap-3 text-sm text-slate-300">
                <span className="text-emerald-400 font-bold">✅</span>
                Structured for standard ATS parsers
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
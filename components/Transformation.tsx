export default function Transformation() {
  return (
    <section className="relative bg-white px-6 py-24 overflow-hidden">

      {/* Dotted Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">

          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            ✨ SEE THE DIFFERENCE
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-slate-900">
            Turn Rejections Into Interviews
          </h2>

          <p className="mt-6 text-lg text-slate-600">
            See how ResumeIQ AI transforms ordinary resumes into
            recruiter-ready applications that stand out.
          </p>

        </div>

        {/* Transformation Cards */}
        <div className="mt-16 grid lg:grid-cols-3 gap-8 items-center">

          {/* BEFORE */}
          <div className="bg-red-50 border border-red-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition duration-300">

            <div className="flex justify-between items-center mb-6">

              <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-semibold">
                BEFORE
              </span>

              <span className="text-3xl font-bold text-red-500">
                42%
              </span>

            </div>

            {/* Resume Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8">

              <div className="space-y-3">

                <div className="h-3 bg-slate-300 rounded w-3/4"></div>

                <div className="h-3 bg-slate-200 rounded w-full"></div>

                <div className="h-3 bg-slate-200 rounded w-5/6"></div>

                <div className="h-3 bg-slate-200 rounded w-2/3"></div>

              </div>

            </div>

            <div className="space-y-4">

              <div className="flex gap-3 text-slate-700">
                <span className="text-red-500">❌</span>
                Weak bullet points
              </div>

              <div className="flex gap-3 text-slate-700">
                <span className="text-red-500">❌</span>
                Missing SQL keywords
              </div>

              <div className="flex gap-3 text-slate-700">
                <span className="text-red-500">❌</span>
                Generic descriptions
              </div>

            </div>

          </div>

          {/* CENTER */}
          <div className="text-center">

            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl">

              <span className="text-white text-4xl">
                ➜
              </span>

            </div>

            <p className="mt-6 font-semibold text-slate-700">
              Powered by AI
            </p>

            <p className="mt-2 text-slate-500 text-sm">
              ResumeIQ analyzes and improves your resume instantly.
            </p>

          </div>

          {/* AFTER */}
          <div className="bg-green-50 border border-green-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition duration-300">

            <div className="flex justify-between items-center mb-6">

              <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-semibold">
                AFTER
              </span>

              <span className="text-3xl font-bold text-green-600">
                86%
              </span>

            </div>

            {/* Resume Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8">

              <div className="space-y-3">

                <div className="h-3 bg-blue-400 rounded w-3/4"></div>

                <div className="h-3 bg-slate-300 rounded w-full"></div>

                <div className="h-3 bg-slate-300 rounded w-5/6"></div>

                <div className="h-3 bg-slate-300 rounded w-2/3"></div>

              </div>

            </div>

            <div className="space-y-4">

              <div className="flex gap-3 text-slate-700">
                <span className="text-green-600">✅</span>
                Quantified achievements
              </div>

              <div className="flex gap-3 text-slate-700">
                <span className="text-green-600">✅</span>
                ATS optimization
              </div>

              <div className="flex gap-3 text-slate-700">
                <span className="text-green-600">✅</span>
                Recruiter-ready resume
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
export default function ResultsPreview() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* Left Side */}
        <div>

          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            📊 Resume Analysis Preview
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            See Exactly What Recruiters See
          </h2>

          <p className="mt-6 text-lg text-slate-600">
            ResumeIQ AI gives you actionable insights before your resume
            reaches recruiters. Improve ATS scores, identify missing skills,
            and strengthen your applications with AI guidance.
          </p>

          <div className="mt-8 space-y-4">

            <div className="flex items-start gap-3">
              <div className="text-green-600 text-xl">✓</div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Identify Strengths
                </h3>

                <p className="text-slate-600">
                  Discover what already works well.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-yellow-500 text-xl">⚠</div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Improve Weak Areas
                </h3>

                <p className="text-slate-600">
                  Get suggestions recruiters expect.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-xl">🎯</div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Match Job Requirements
                </h3>

                <p className="text-slate-600">
                  Find missing skills before applying.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side Dashboard */}
        <div className="relative">

          <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50"></div>

          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-50"></div>

          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl p-8">

            {/* ATS Score */}
            <div className="flex justify-between items-center">

              <div>
                <p className="text-sm text-slate-500 font-medium">
                  ATS SCORE
                </p>

                <h3 className="text-5xl font-bold text-blue-600 mt-2">
                  86%
                </h3>
              </div>

              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                Strong Match
              </span>

            </div>

            {/* Strengths */}
            <div className="mt-8">

              <h4 className="font-semibold text-slate-900 mb-3">
                Strengths
              </h4>

              <div className="space-y-2">

                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600">✓</span>
                  Strong Projects
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600">✓</span>
                  Clean Formatting
                </div>

              </div>

            </div>

            {/* Suggestions */}
            <div className="mt-8">

              <h4 className="font-semibold text-slate-900 mb-3">
                Suggestions
              </h4>

              <div className="space-y-2">

                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-yellow-500">⚠</span>
                  Add SQL keywords
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-yellow-500">⚠</span>
                  Quantify achievements
                </div>

              </div>

            </div>

            {/* Missing Skills */}
            <div className="mt-8">

              <h4 className="font-semibold text-slate-900 mb-4">
                Missing Skills
              </h4>

              <div className="flex flex-wrap gap-3">

                <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                  Python
                </span>

                <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                  Power BI
                </span>

                <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                  Excel
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
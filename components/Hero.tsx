"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-24">

      {/* Background Blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30"></div>

      <div className="absolute top-20 -right-20 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-30"></div>

      {/* Dotted Pattern */}
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

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">

        {/* Left Side */}
        <div>

          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
            ✨ AI-Powered Resume Reviews
          </span>

          {/* Heading */}
          <h1 className="mt-8 text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
            Land More Interviews With{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Insights
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg text-slate-600 max-w-2xl">
            Analyze your resume, improve ATS scores, discover missing skills,
            and receive personalized AI-powered career guidance to increase
            your chances of getting shortlisted.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">

            <Link
              href="/analyze"
              className="inline-flex justify-center items-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition duration-300"
            >
              ✨ Analyze Resume Free
            </Link>

            <Link
              href="/analyze?sample=true"
              className="inline-flex justify-center items-center px-8 py-4 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition duration-300"
            >
              ▶ See Sample Analysis
            </Link>

          </div>

          {/* Trust Indicator */}
          <p className="mt-6 text-sm text-slate-500">
            ⭐ Trusted by students • 2 free reviews daily
          </p>

        </div>

        {/* Right Side */}
        <div className="flex justify-center">

          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 w-full max-w-md">

            {/* Top */}
            <div className="flex justify-between items-center">

              <div>
                <p className="text-sm text-slate-500 font-medium">
                  ATS SCORE
                </p>

                <h2 className="mt-2 text-5xl font-bold text-blue-600">
                  86%
                </h2>
              </div>

              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                Strong Match
              </span>

            </div>

            {/* Progress */}
            <div className="mt-8">

              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Optimization Score</span>

                <span>86%</span>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

                <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>

              </div>

            </div>

            {/* Insights */}
            <div className="mt-8 space-y-5">

              <div className="flex justify-between items-center">

                <span className="text-slate-600">
                  📌 Suggestions
                </span>

                <span className="font-semibold text-slate-900">
                  5
                </span>

              </div>

              <div className="flex justify-between items-center">

                <span className="text-slate-600">
                  ⚠ Missing Skills
                </span>

                <span className="font-semibold text-red-500">
                  SQL
                </span>

              </div>

              <div className="flex justify-between items-center">

                <span className="text-slate-600">
                  💪 Resume Strength
                </span>

                <span className="font-semibold text-green-600">
                  Strong
                </span>

              </div>

            </div>

            {/* Bottom Tip */}
            <div className="mt-8 p-4 rounded-2xl bg-blue-50 border border-blue-100">

              <p className="text-sm text-slate-700">
                💡 Add more measurable achievements to increase your ATS score.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
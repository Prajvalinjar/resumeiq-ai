import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">

      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="grid md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>

            <div className="flex items-center gap-3 mb-4">

              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                R
              </div>

              <div>
                <h3 className="font-bold text-white text-lg">
                  ResumeIQ AI
                </h3>

                <p className="text-sm text-slate-400">
                  AI Resume Analyzer
                </p>
              </div>

            </div>

            <p className="text-slate-400 text-sm leading-relaxed">
              Helping students and professionals improve resumes,
              beat ATS systems, and land more interviews using AI.
            </p>

          </div>

          {/* Product */}
          <div>

            <h4 className="text-white font-semibold mb-4">
              Product
            </h4>

            <ul className="space-y-3 text-sm">

              <li>
                <Link href="/analyze" className="hover:text-white transition">
                  Resume Analysis
                </Link>
              </li>

              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>
              </li>

              <li>
                <span className="hover:text-white transition cursor-pointer">
                  ATS Score
                </span>
              </li>

            </ul>

          </div>

          {/* Resources */}
          <div>

            <h4 className="text-white font-semibold mb-4">
              Resources
            </h4>

            <ul className="space-y-3 text-sm">

              <li>
                <span className="hover:text-white transition cursor-pointer">
                  Career Tips
                </span>
              </li>

              <li>
                <span className="hover:text-white transition cursor-pointer">
                  Resume Guide
                </span>
              </li>

              <li>
                <span className="hover:text-white transition cursor-pointer">
                  Interview Prep
                </span>
              </li>

            </ul>

          </div>

          {/* Contact */}
          <div>

            <h4 className="text-white font-semibold mb-4">
              Connect
            </h4>

            <ul className="space-y-3 text-sm">

              <li className="hover:text-white transition cursor-pointer">
                LinkedIn
              </li>

              <li className="hover:text-white transition cursor-pointer">
                GitHub
              </li>

              <li className="hover:text-white transition cursor-pointer">
                Support
              </li>

            </ul>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-sm text-slate-500">
            © 2026 ResumeIQ AI. All rights reserved.
          </p>

          <p className="text-sm text-slate-500">
            Built using Next.js, Tailwind, Supabase & Gemini AI
          </p>

        </div>

      </div>

    </footer>
  );
}
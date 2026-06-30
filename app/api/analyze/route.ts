import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/gemini";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, targetRole, fileName, fileSize } = body;

    if (!text || !targetRole) {
      return NextResponse.json(
        { error: "Missing required fields: text and targetRole" },
        { status: 400 }
      );
    }

    const result = await analyzeResume(text, targetRole, fileName || "resume.pdf", fileSize || 0);

    // Save to database if user is authenticated
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Decrement credits if limited
        const { data: profile } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", user.id)
          .single();

        if (profile && profile.credits > 0 && profile.credits < 999) {
          await supabase
            .from("profiles")
            .update({ credits: profile.credits - 1 })
            .eq("id", user.id);
        }

        // Insert analysis
        console.log("Attempting to save analysis to DB for user:", user.id);
        const { error: dbError } = await supabase.from("analyses").insert({
          id: result.id,
          user_id: user.id,
          file_name: result.fileName,
          file_size: result.fileSize,
          target_role: result.targetRole,
          ats_score: result.atsScore,
          recruiter_readiness: result.recruiterReadiness,
          data: result
        });
        
        if (dbError) {
          console.error("❌ Database insert error:", dbError);
        } else {
          console.log("✅ Analysis successfully saved to DB!");
        }

        // Also save to resume_reports table (Phase 3)
        const { error: reportError } = await supabase.from("resume_reports").insert({
          user_id: user.id,
          file_name: result.fileName,
          resume_text: body.text?.substring(0, 10000) || null,
          ats_score: result.atsScore,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          missing_keywords: [...(result.missingKeywords || []), ...(result.missingSkills || [])],
          suggestions: result.suggestions,
          job_role: result.targetRole,
          download_count: 0,
        });

        if (reportError) {
          console.error("❌ Resume report insert error:", reportError);
        } else {
          console.log("✅ Resume report saved to resume_reports!");
        }
      } else {
        console.warn("⚠️ No authenticated user found during analysis save.");
      }
    } else {
      console.warn("⚠️ Supabase client could not be initialized.");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/analyze error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze resume" },
      { status: 500 }
    );
  }
}

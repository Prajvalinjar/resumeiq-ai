import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { analyzeJobMatch } from "@/lib/gemini";

// POST /api/job-match — Match a resume against a job description
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysisId, jobDescription } = body;

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    let analysisData: any = null;

    // If analysisId provided, fetch from DB
    if (analysisId && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data: analysis } = await supabase
        .from("analyses")
        .select("*")
        .eq("id", analysisId)
        .eq("user_id", user.id)
        .single();

      if (analysis) {
        analysisData = analysis.data;
      }
    }

    // If we also have resume text in the body
    if (body.resumeText) {
      analysisData = { ...analysisData, resumeText: body.resumeText };
    }

    const result = await analyzeJobMatch(jobDescription, analysisData);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/job-match error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to match job description" },
      { status: 500 }
    );
  }
}

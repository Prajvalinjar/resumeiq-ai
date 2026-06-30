import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

// POST /api/compare — Compare two resume analyses
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysisId1, analysisId2 } = body;

    if (!analysisId1 || !analysisId2) {
      return NextResponse.json(
        { error: "Two analysis IDs are required for comparison" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch both analyses (RLS ensures ownership)
    const { data: analysis1 } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId1)
      .eq("user_id", user.id)
      .single();

    const { data: analysis2 } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId2)
      .eq("user_id", user.id)
      .single();

    if (!analysis1 || !analysis2) {
      return NextResponse.json({ error: "One or both analyses not found" }, { status: 404 });
    }

    const data1 = analysis1.data as any;
    const data2 = analysis2.data as any;

    // Compute comparison
    const skills1 = new Set([...(data1.missingSkills || [])]);
    const skills2 = new Set([...(data2.missingSkills || [])]);
    const keywords1 = new Set([...(data1.missingKeywords || [])]);
    const keywords2 = new Set([...(data2.missingKeywords || [])]);

    // Skills that were missing in resume1 but are no longer missing in resume2
    const newSkillsAdded = [...skills1].filter(s => !skills2.has(s));
    const missingKeywordsFixed = [...keywords1].filter(k => !keywords2.has(k));
    const remainingGaps = [...skills2];

    const scoreDiff = data2.atsScore - data1.atsScore;
    const improvementPct = data1.atsScore > 0
      ? Math.round((scoreDiff / data1.atsScore) * 100)
      : 0;

    const result = {
      resume1: {
        id: analysis1.id,
        fileName: analysis1.file_name,
        atsScore: data1.atsScore || analysis1.ats_score,
        skills: data1.missingSkills || [],
        keywords: data1.missingKeywords || [],
        strengths: data1.strengths || [],
        weaknesses: data1.weaknesses || [],
        suggestions: data1.suggestions || [],
        createdAt: analysis1.created_at,
      },
      resume2: {
        id: analysis2.id,
        fileName: analysis2.file_name,
        atsScore: data2.atsScore || analysis2.ats_score,
        skills: data2.missingSkills || [],
        keywords: data2.missingKeywords || [],
        strengths: data2.strengths || [],
        weaknesses: data2.weaknesses || [],
        suggestions: data2.suggestions || [],
        createdAt: analysis2.created_at,
      },
      scoreDifference: scoreDiff,
      improvementPercentage: improvementPct,
      newSkillsAdded,
      missingKeywordsFixed,
      remainingGaps,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/compare error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to compare resumes" },
      { status: 500 }
    );
  }
}

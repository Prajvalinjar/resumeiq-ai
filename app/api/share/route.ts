import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

// POST /api/share — Create a shareable link
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, expiresInDays } = body;

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the analysis
    const { data: analysis } = await supabase
      .from("analyses")
      .select("id")
      .eq("id", reportId)
      .eq("user_id", user.id)
      .single();

    if (!analysis) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Generate unique token
    const token = generateToken();

    // Calculate expiry
    let expiresAt: string | null = null;
    if (expiresInDays && expiresInDays > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + expiresInDays);
      expiresAt = expiry.toISOString();
    }

    const { data: shared, error } = await supabase
      .from("shared_reports")
      .insert({
        report_id: reportId,
        user_id: user.id,
        share_token: token,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create share link:", error);
      return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
    }

    return NextResponse.json({
      token: shared.share_token,
      expiresAt: shared.expires_at,
      shareUrl: `/shared/${shared.share_token}`,
    });
  } catch (error: any) {
    console.error("API /api/share error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create share link" },
      { status: 500 }
    );
  }
}

// GET /api/share?token=xxx — Fetch shared report
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Look up the share record
    const { data: shared, error } = await supabase
      .from("shared_reports")
      .select("*")
      .eq("share_token", token)
      .single();

    if (error || !shared) {
      return NextResponse.json({ error: "Shared link not found" }, { status: 404 });
    }

    // Check expiry
    if (shared.expires_at && new Date(shared.expires_at) < new Date()) {
      return NextResponse.json({ error: "This shared link has expired" }, { status: 410 });
    }

    // Fetch the analysis data — use service role or public access
    // Since the analyses table has RLS, we need the owner's context
    // We'll query the analysis using a direct lookup
    const { data: analysis } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", shared.report_id)
      .single();

    if (!analysis) {
      return NextResponse.json({ error: "Report data not found" }, { status: 404 });
    }

    return NextResponse.json({
      analysis: {
        id: analysis.id,
        fileName: analysis.file_name,
        targetRole: analysis.target_role,
        atsScore: analysis.ats_score,
        data: analysis.data,
        createdAt: analysis.created_at,
      },
      expiresAt: shared.expires_at,
    });
  } catch (error: any) {
    console.error("API /api/share GET error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch shared report" },
      { status: 500 }
    );
  }
}

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

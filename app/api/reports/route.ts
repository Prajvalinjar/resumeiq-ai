import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

// GET /api/reports — Fetch user's reports with filters
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const jobRole = searchParams.get("jobRole") || "";
    const scoreMin = parseInt(searchParams.get("scoreMin") || "0");
    const scoreMax = parseInt(searchParams.get("scoreMax") || "100");
    const sort = searchParams.get("sort") || "date_desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("resume_reports")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .gte("ats_score", scoreMin)
      .lte("ats_score", scoreMax);

    if (search) {
      query = query.or(`file_name.ilike.%${search}%,job_role.ilike.%${search}%`);
    }

    if (jobRole) {
      query = query.eq("job_role", jobRole);
    }

    // Sort
    switch (sort) {
      case "date_asc":
        query = query.order("created_at", { ascending: true });
        break;
      case "score_desc":
        query = query.order("ats_score", { ascending: false });
        break;
      case "score_asc":
        query = query.order("ats_score", { ascending: true });
        break;
      case "date_desc":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: reports, error, count } = await query;

    if (error) {
      console.error("Failed to fetch reports:", error);
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }

    return NextResponse.json({
      reports: reports || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    console.error("API /api/reports error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

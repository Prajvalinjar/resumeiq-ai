import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

// GET /api/admin/stats — Admin analytics data
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Fetch admin stats — these queries work within the admin's session
    // For cross-user data, we use the service role key if available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    let adminClient = supabase;

    // If service role key is available, create an admin client that bypasses RLS
    if (serviceRoleKey && supabaseUrl) {
      const { createClient } = await import("@supabase/supabase-js");
      adminClient = createClient(supabaseUrl, serviceRoleKey);
    }

    // Total Users
    const { count: totalUsers } = await adminClient
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Total Reports (analyses)
    const { count: totalReports } = await adminClient
      .from("analyses")
      .select("*", { count: "exact", head: true });

    // Total Downloads
    const { data: downloadData } = await adminClient
      .from("resume_reports")
      .select("download_count");
    const totalDownloads = (downloadData || []).reduce((sum: number, r: any) => sum + (r.download_count || 0), 0);

    // Average ATS Score
    const { data: scoreData } = await adminClient
      .from("analyses")
      .select("ats_score");
    const scores = (scoreData || []).map((s: any) => s.ats_score);
    const averageAtsScore = scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0;

    // Top Job Roles
    const { data: roleData } = await adminClient
      .from("analyses")
      .select("target_role");
    const roleCounts: Record<string, number> = {};
    (roleData || []).forEach((r: any) => {
      roleCounts[r.target_role] = (roleCounts[r.target_role] || 0) + 1;
    });
    const topJobRoles = Object.entries(roleCounts)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // User Growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: recentUsers } = await adminClient
      .from("profiles")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    const userGrowth = aggregateByDate(recentUsers || [], "created_at");

    // Reports per day (last 30 days)
    const { data: recentReports } = await adminClient
      .from("analyses")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    const reportsPerDay = aggregateByDate(recentReports || [], "created_at");

    // Most common skills (from missing_keywords in analyses data)
    const { data: allAnalyses } = await adminClient
      .from("analyses")
      .select("data")
      .limit(200);
    
    const skillCounts: Record<string, number> = {};
    (allAnalyses || []).forEach((a: any) => {
      const data = a.data as any;
      [...(data?.missingSkills || []), ...(data?.missingKeywords || [])].forEach((skill: string) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalReports: totalReports || 0,
      totalDownloads,
      averageAtsScore,
      dailyActiveUsers: (recentUsers || []).length,
      topSkills,
      topJobRoles,
      userGrowth,
      reportsPerDay,
      downloadsPerDay: [],
    });
  } catch (error: any) {
    console.error("API /api/admin/stats error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}

function aggregateByDate(items: any[], dateField: string): { date: string; count: number }[] {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    const date = new Date(item[dateField]).toISOString().split("T")[0];
    counts[date] = (counts[date] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

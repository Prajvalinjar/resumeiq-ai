import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

// POST /api/email-report — Email a PDF report to the user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysisResult, recipientEmail } = body;

    if (!analysisResult || !recipientEmail) {
      return NextResponse.json(
        { error: "Missing required fields: analysisResult and recipientEmail" },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Email service not configured. Add RESEND_API_KEY to your .env.local" },
        { status: 503 }
      );
    }

    // Import Resend dynamically
    const { Resend } = await import("resend");
    const resend = new Resend(resendApiKey);

    // Generate beautiful HTML email
    const emailHtml = generateEmailHtml(analysisResult);

    const { data, error } = await resend.emails.send({
      from: "ResumeIQ AI <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `ResumeIQ Report — ${analysisResult.targetRole} (ATS Score: ${analysisResult.atsScore}%)`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (error: any) {
    console.error("API /api/email-report error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send email report" },
      { status: 500 }
    );
  }
}

function generateEmailHtml(analysis: any): string {
  const scoreColor = analysis.atsScore >= 80 ? "#34d399" : analysis.atsScore >= 60 ? "#fbbf24" : "#f87171";
  const scoreLabel = analysis.atsScore >= 80 ? "Optimized" : analysis.atsScore >= 60 ? "Average Match" : "Needs Review";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; padding: 40px 24px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #22d3ee; font-size: 28px; margin: 0; letter-spacing: -0.5px;">ResumeIQ AI</h1>
      <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">Resume Analysis Report</p>
    </div>

    <!-- Score Card -->
    <div style="background: linear-gradient(135deg, #0f172a, #1e1b4b); border: 1px solid #334155; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
      <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">ATS Match Score</p>
      <h2 style="color: ${scoreColor}; font-size: 56px; margin: 0; font-weight: 800;">${analysis.atsScore}%</h2>
      <p style="color: ${scoreColor}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; font-weight: 700;">${scoreLabel}</p>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #334155;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Target Role: <strong style="color: #e2e8f0;">${analysis.targetRole}</strong></p>
        <p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0;">File: <strong style="color: #e2e8f0;">${analysis.fileName}</strong></p>
      </div>
    </div>

    <!-- Strengths -->
    <div style="background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 16px;">
      <h3 style="color: #34d399; font-size: 14px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">✓ Strengths</h3>
      ${(analysis.strengths || []).map((s: string) => `<p style="color: #cbd5e1; font-size: 14px; margin: 0 0 8px; padding-left: 16px;">• ${s}</p>`).join("")}
    </div>

    <!-- Weaknesses -->
    <div style="background: #0f172a; border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 16px;">
      <h3 style="color: #fbbf24; font-size: 14px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">⚠ Areas for Improvement</h3>
      ${(analysis.weaknesses || []).map((w: string) => `<p style="color: #cbd5e1; font-size: 14px; margin: 0 0 8px; padding-left: 16px;">• ${w}</p>`).join("")}
    </div>

    <!-- Missing Keywords -->
    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
      <h3 style="color: #a78bfa; font-size: 14px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">Missing Keywords</h3>
      <div>
        ${(analysis.missingKeywords || []).map((k: string) => `<span style="display: inline-block; background: #1e1b4b; color: #a78bfa; padding: 6px 14px; border-radius: 20px; font-size: 12px; margin: 0 6px 6px 0; border: 1px solid #2e1065;">${k}</span>`).join("")}
      </div>
    </div>

    <!-- Suggestions -->
    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
      <h3 style="color: #22d3ee; font-size: 14px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">AI Suggestions</h3>
      ${(analysis.suggestions || []).map((s: string, i: number) => `<p style="color: #cbd5e1; font-size: 14px; margin: 0 0 12px; padding-left: 16px;">${i + 1}. ${s}</p>`).join("")}
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #1e293b;">
      <p style="color: #475569; font-size: 12px; margin: 0;">Powered by ResumeIQ AI — Premium AI Resume Optimizer</p>
      <p style="color: #334155; font-size: 11px; margin-top: 8px;">This report was generated automatically. Do not reply to this email.</p>
    </div>

  </div>
</body>
</html>`;
}

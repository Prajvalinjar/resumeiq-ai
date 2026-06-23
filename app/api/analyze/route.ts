import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/gemini";

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

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/analyze error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze resume" },
      { status: 500 }
    );
  }
}

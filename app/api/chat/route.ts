import { NextRequest, NextResponse } from "next/server";
import { chatWithCoach } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, newMessage, analysisResult } = body;

    if (!newMessage || !analysisResult) {
      return NextResponse.json(
        { error: "Missing required fields: newMessage and analysisResult" },
        { status: 400 }
      );
    }

    const reply = await chatWithCoach(messages || [], newMessage, analysisResult);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("API /api/chat error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process chat" },
      { status: 500 }
    );
  }
}

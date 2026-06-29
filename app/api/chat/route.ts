import { NextRequest, NextResponse } from "next/server";
import { chatWithCoach } from "@/lib/gemini";
import { createSupabaseServerClient } from "@/lib/supabase";

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

    // Verify ownership of the analysis
    const supabase = await createSupabaseServerClient();
    let isOwner = false;
    let authUserId = null;

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        authUserId = user.id;
        const { data: analysis } = await supabase
          .from("analyses")
          .select("id")
          .eq("id", analysisResult.id)
          .eq("user_id", user.id)
          .single();
        
        if (analysis) {
          isOwner = true;
        }
      }
    }

    const reply = await chatWithCoach(messages || [], newMessage, analysisResult);

    // Save chat messages to database if authenticated owner
    if (supabase && isOwner && authUserId) {
      const userMsgId = `msg-${Math.random().toString(36).substr(2, 9)}`;
      const coachMsgId = `msg-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await supabase.from("chat_messages").insert([
        {
          id: userMsgId,
          analysis_id: analysisResult.id,
          user_id: authUserId,
          role: "user",
          content: newMessage,
          created_at: now
        },
        {
          id: coachMsgId,
          analysis_id: analysisResult.id,
          user_id: authUserId,
          role: "assistant",
          content: reply,
          created_at: new Date(new Date(now).getTime() + 1000).toISOString()
        }
      ]);
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("API /api/chat error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process chat" },
      { status: 500 }
    );
  }
}

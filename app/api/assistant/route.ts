import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { chatWithAssistant } from "@/lib/gemini";

// POST /api/assistant — AI Resume Assistant chat
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, newMessage } = body;

    if (!newMessage) {
      return NextResponse.json(
        { error: "Missing required field: newMessage" },
        { status: 400 }
      );
    }

    // Load user's reports as context
    let reportsContext: any[] = [];
    const supabase = await createSupabaseServerClient();
    
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: analyses } = await supabase
          .from("analyses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (analyses) {
          reportsContext = analyses.map((a: any) => ({
            fileName: a.file_name,
            targetRole: a.target_role,
            atsScore: a.ats_score,
            data: a.data,
            createdAt: a.created_at,
          }));
        }
      }
    }

    const reply = await chatWithAssistant(messages || [], newMessage, reportsContext);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("API /api/assistant error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process assistant message" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { audioUrl } = await request.json();

    if (!audioUrl) {
      return NextResponse.json({ error: "Missing audioUrl" }, { status: 400 });
    }

    // Fetch audio file headers to get content-length and content-type
    const response = await fetch(audioUrl, { method: "HEAD" });
    
    if (!response.ok) {
      return NextResponse.json({ error: "Cannot fetch audio file" }, { status: 400 });
    }

    const contentType = response.headers.get("content-type");
    
    // Check if it's an audio file
    if (!contentType?.startsWith("audio/")) {
      return NextResponse.json({ error: "URL is not an audio file" }, { status: 400 });
    }

    // Note: Getting exact duration from server-side is complex
    // We'll return a message to use client-side detection instead
    return NextResponse.json({ 
      success: true,
      message: "Audio file is valid. Please use client-side detection for duration.",
      contentType 
    });

  } catch (error) {
    console.error("Error checking audio:", error);
    return NextResponse.json({ error: "Failed to check audio file" }, { status: 500 });
  }
}

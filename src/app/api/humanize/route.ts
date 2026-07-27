import { NextRequest, NextResponse } from "next/server";
 
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PRIMARY_MODEL = "llama-3.1-8b-instant";
const FALLBACK_MODEL = "gemma2-9b-it";
 
const TONE_INSTRUCTIONS: Record<string, string> = {
  Natural:
    "Rewrite the following AI-generated text to sound completely natural and human-like, as if written by a real person. Vary sentence structure, use contractions, and add subtle imperfections. Return only the rewritten text, no explanations.",
  Professional:
    "Rewrite the following AI-generated text in a polished, professional tone suitable for business communication. Use clear, confident language and a formal yet approachable style. Return only the rewritten text, no explanations.",
  Conversational:
    "Rewrite the following AI-generated text in a casual, conversational tone as if chatting with a friend. Use everyday language, contractions, and a relaxed flow. Return only the rewritten text, no explanations.",
  Simple:
    "Rewrite the following AI-generated text in simple, easy-to-understand language. Use short sentences, common words, and clear structure. Return only the rewritten text, no explanations.",
  Creative:
    "Rewrite the following AI-generated text with creative flair and engaging, vivid language. Add personality, varied vocabulary, and a unique voice. Return only the rewritten text, no explanations.",
};
 
function cleanOutput(output: string, original: string): string {
  let cleaned = output.trim();
 
  if (!cleaned || cleaned === original) {
    return "";
  }
 
  const quoteWrapped = cleaned.match(/^["']([\s\S]+)["']$/);
  if (quoteWrapped) {
    cleaned = quoteWrapped[1].trim();
  }
 
  return cleaned;
}
 
async function callGroq(
  model: string,
  text: string,
  tone: string,
  apiKey: string
): Promise<string | null> {
  const instruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS["Natural"];
 
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a text humanizer. Rewrite the given AI-generated text in the requested tone. Return only the rewritten text with no additional commentary, no quotes, and no markdown.",
        },
        {
          role: "user",
          content: `${instruction}\n\nText: "${text}"`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    }),
  });
 
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("Invalid API key. Check your API_KEY environment variable.");
    }
    if (res.status === 429) {
      throw new Error("Rate limit reached. Please wait a moment and try again.");
    }
    throw new Error(`API returned status ${res.status}. Please try again.`);
  }
 
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return content || null;
}
 
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Server misconfiguration. The API_KEY environment variable is not set.",
        },
        { status: 500 }
      );
    }
 
    const body = await request.json().catch(() => null);
    if (!body || typeof body.text !== "string" || !body.text.trim()) {
      return NextResponse.json(
        { error: "Please provide text to humanize." },
        { status: 400 }
      );
    }
 
    const text = body.text.trim();
    const tone = typeof body.tone === "string" ? body.tone : "Natural";
 
    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Text is too long. Please limit to 5,000 characters." },
        { status: 400 }
      );
    }
 
    let rawOutput: string | null = null;
    let usedFallback = false;
 
    try {
      rawOutput = await callGroq(PRIMARY_MODEL, text, tone, apiKey);
    } catch (primaryErr) {
      if (
        primaryErr instanceof Error &&
        (primaryErr.message.includes("429") || primaryErr.message.includes("503"))
      ) {
        try {
          rawOutput = await callGroq(FALLBACK_MODEL, text, tone, apiKey);
          usedFallback = true;
        } catch {
          throw primaryErr;
        }
      } else {
        throw primaryErr;
      }
    }
 
    if (!rawOutput) {
      return NextResponse.json(
        { error: "Failed to generate. Try again." },
        { status: 500 }
      );
    }
 
    const cleaned = cleanOutput(rawOutput, text);
 
    if (!cleaned) {
      return NextResponse.json(
        { error: "Failed to generate. Try again." },
        { status: 500 }
      );
    }
 
    return NextResponse.json({
      humanized: cleaned,
      model: usedFallback ? FALLBACK_MODEL : PRIMARY_MODEL,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
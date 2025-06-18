import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY_FREE,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(request: Request) {
  try {
    const { prompt, model } = await request.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        { error: "Prompt invalide ou vide." },
        { status: 400 }
      );
    }
    if (!model || typeof model !== "string") {
      return NextResponse.json(
        { error: "Modèle invalide." },
        { status: 400 }
      );
    }

    const stream = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150, // Augmenté pour des réponses plus complètes
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Erreur API OpenRouter:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
    });
    const status = error.status || 500;
    const message =
      status === 429
        ? "Limite de requêtes dépassée. Essayez un autre modèle ou attendez."
        : status === 401
        ? "Clé API invalide. Vérifiez votre clé OpenRouter."
        : `Erreur serveur: ${error.message}`;
    return NextResponse.json({ error: message }, { status });
  }
}
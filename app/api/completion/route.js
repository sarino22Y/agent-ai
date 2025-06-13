import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY_FREE,
  baseURL: "https://openrouter.ai/api/v1",
});

const cache = new Map();

export async function POST(request) {
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

    // Vérifier le cache
    // if (cache.has(prompt)) {
    //   return NextResponse.json({ response: cache.get(prompt) });
    // }

    // Si ce n'est pas des réponses progressives
    // const completion = await openai.chat.completions.create({
    //   // model: "openai/gpt-4-32k", // Mythomax
    //   model: "meta-llama/llama-3.3-8b-instruct:free", // Meta: Llama 3.3 8B Instruct (free)
    //   //   model: "mistralai/devstral-small:free", // Mistral: Devstral Small (free)
    //   messages: [{ role: "user", content: prompt }],
    //   max_tokens: 50,
    //   stream: false,
    // });

    // return NextResponse.json({
    //   response: completion.choices[0].message.content,
    // });

    // afficher les réponses progressivement (avec le stream : true)
    const stream = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ text })}\n\n`
                )
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
  } catch (error) {
    console.error("Erreur API OpenRouter:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
    });
    if (error.status === 429) {
      return NextResponse.json(
        {
          error:
            "Limite de requêtes dépassée. Essayez un modèle gratuit ou attendez demain.",
        },
        { status: 429 }
      );
    }
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Clé API invalide. Vérifiez votre clé OpenRouter." },
        { status: 401 }
      );
    }
    if (error.status === 400) {
      return NextResponse.json(
        { error: "Requête invalide. Vérifiez le modèle ou les paramètres." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Erreur serveur: ${error.message}` },
      { status: 500 }
    );
  }
}

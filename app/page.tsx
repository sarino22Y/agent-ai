"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface Message {
  prompt: string;
  response: string;
  model: string;
}
export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("meta-llama/llama-3.3-8b-instruct:free");
  const [history, setHistory] = useState<Message[]>([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setResponse("Veuillez entrer un prompt valide.");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model }),
      });

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("Flux de réponse non disponible.");
      }

      let accumulatedResponse = "";
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setHistory((prev) => [
            ...prev,
            { prompt, response: accumulatedResponse, model },
          ]);
          setLoading(false);
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.replace(/^data: /, "");
            if (data === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              accumulatedResponse += parsed.text || "";
              setResponse(accumulatedResponse);
              // await new Promise((resolve) => setTimeout(resolve, 50)); // Délai pour effet typewriter
            } catch (error) {
              console.log("Erreur de parsing : ", error);
            }
          }
        }
      }
    } catch (error) {
      setResponse("Erreur lors de la récupération de la réponse.");
      console.log("Erreur : ", error);
      setLoading(false);
    }
  };

  // Effet typewriter pour la réponse courante
  useEffect(() => {
    if (response && loading) {
      let index = 0;
      const fullResponse = response;
      setResponse(""); // Réinitialiser pour l'effet typewriter
      const timer = setInterval(() => {
        setResponse((prev) => prev + fullResponse[index]);
        index++;
        if (index >= fullResponse.length) {
          clearInterval(timer);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [response, loading]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h1 className="text-2xl">Application IA avec Next.js</h1>

      {/* Sélection du modèle */}
      <Card className="my-8">
        <CardContent>
          <label htmlFor="model">Choisir un modèle : </label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un modèle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meta-llama/llama-3.3-8b-instruct:free">
                LLaMA 3.3 8B (Gratuit)
              </SelectItem>
              <SelectItem value="mistralai/devstral-small:free">
                Devstral Small (Gratuit)
              </SelectItem>
              <SelectItem value="openai/gpt-4-32k">openai gpt-4-32k</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Entrez votre prompt ici..."
          style={{ width: "100%", height: "100px", marginBottom: "10px" }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Chargement..." : "Envoyer"}
        </button>
      </form>

      {/* Réponse courante */}
      {response && (
        <div style={{ marginTop: "20px" }}>
          <h2>Réponse ({model}) :</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{response}</p>
        </div>
      )}

      {/* Historique des conversations */}
      {history.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Historique des conversations :</h2>
          {history.map((msg, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <p>
                <strong>Prompt ({msg.model}) :</strong> {msg.prompt}
              </p>
              <p>
                <strong>Réponse :</strong> {msg.response}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

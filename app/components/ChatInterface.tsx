"use client";

import { useState, useMemo } from "react";
import { Message, TaskType, MODELS, TASKS } from "../types";
import { MessageList } from "./MessageList";
import { ErrorMessage } from "./ErrorMessage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ChatInterface() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(MODELS[0].value);
  const [task, setTask] = useState<TaskType>("explain");
  const [error, setError] = useState("");

  // Cache des réponses pour éviter les requêtes redondantes
  const cache = useMemo(() => new Map<string, string>(), []);

  const formatPrompt = (input: string, task: TaskType): string => {
    switch (task) {
      case "explain":
        return `Explique "${input}" en une phrase simple.`;
      case "translate":
        return `Traduisez "${input}".`;
      case "code":
        return `Générez une fonction JavaScript pour : ${input}, avec des commentaires.`;
      case "summarize":
        return `Résumez ce texte en une phrase : "${input}".`;
      default:
        return input;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Veuillez entrer un prompt valide.");
      return;
    }

    const formattedPrompt = formatPrompt(prompt, task);
    const cacheKey = `${model}:${task}:${formattedPrompt}`;

    // Vérifier le cache
    if (cache.has(cacheKey)) {
      setResponse(cache.get(cacheKey)!);
      setHistory((prev) => [
        ...prev,
        {
          prompt: formattedPrompt,
          response: cache.get(cacheKey)!,
          model,
          task,
        },
      ]);
      setPrompt("");
      setError("");
      return;
    }

    setLoading(true);
    setResponse("");
    setError("");

    try {
      const res = await fetch("/api/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: formattedPrompt, model }),
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
          cache.set(cacheKey, accumulatedResponse);
          setHistory((prev) => [
            ...prev,
            {
              prompt: formattedPrompt,
              response: accumulatedResponse,
              model,
              task,
            },
          ]);
          setLoading(false);
          setPrompt("");
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
            } catch (error) {
              console.error("Erreur de parsing:", error);
            }
          }
        }
      }
    } catch (error: any) {
      setError(
        error.status === 429
          ? "Limite de requêtes dépassée. Essayez un autre modèle ou attendez."
          : `Erreur: ${error.message}`
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <progress className="progress w-full text-amber-50"></progress>
      <h1 className="text-2xl font-bold">Application IA avec Next.js</h1>
      <div className="divider divider-primary"></div>

      {/* Sélection du cas d'usage */}
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(TASKS).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setTask(key as TaskType)}
            className={`px-4 py-2 rounded ${
              task === key ? "btn btn-primary btn-dash" : "btn btn-dash"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sélection du modèle */}
      <div className="mb-4">
        <label htmlFor="model">Modèle : </label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un modèle" />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Entrez votre ${TASKS[
            task
          ].description.toLowerCase()}...`}
          className="w-full p-3 border rounded resize-y mb-4"
          rows={4}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Chargement..." : "Envoyer"}
        </button>
      </form>

      {/* Réponse courante */}
      <ErrorMessage message={error} />
      {response && (
        // <div className="mt-6">
        //   <h2 className="text-lg font-semibold mb-2">
        //     Réponse ({TASKS[task].label} -{" "}
        //     {MODELS.find((m) => m.value === model)?.label}) :
        //   </h2>
        //   <p className="p-4 border rounded whitespace-pre-wrap">
        //     {response}
        //   </p>
        // </div>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">
            Réponse ({TASKS[task].label} -{" "}
            {MODELS.find((m) => m.value === model)?.label}) :
          </h2>
          <p className="chat-bubble chat-bubble-secondary">{response}</p>
        </div>
      )}

      {/* Historique */}
      <MessageList messages={history} />
    </div>
  );
}

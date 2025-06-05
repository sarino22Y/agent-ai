"use client"

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/completion", {
        method : "POST",
        headers : {"Content-Type" : "application/json"},
        body : JSON.stringify({ prompt })
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse("Erreur lors de la récupération de la réponse.");
      console.log("Erreur : ", error);
      
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Application IA avec Next.js</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Entrez votre prompt ici..."
          style={{ width: "100%", height: "100px", marginBottom: "10px" }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Chargement..." : "Envoyer"}
        </button>
      </form>
      {response && (
        <div style={{ marginTop: "20px" }}>
          <h2>Réponse :</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

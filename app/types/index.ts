export interface Message {
  prompt: string;
  response: string;
  model: string;
  task: TaskType;
}

export type TaskType = "explain" | "translate" | "code" | "summarize";

export interface ModelOption {
  value: string;
  label: string;
}

export const TASKS: Record<TaskType, { label: string; description: string }> = {
  explain: {
    label: "Expliquer",
    description: "Obtenez une explication claire et concise.",
  },
  translate: {
    label: "Traduire",
    description: "Traduisez du texte dans une autre langue.",
  },
  code: {
    label: "Générer du code",
    description: "Créez du code dans le langage de votre choix.",
  },
  summarize: {
    label: "Résumer",
    description: "Obtenez un résumé concis d’un texte.",
  },
};

export const MODELS: ModelOption[] = [
  { value: "meta-llama/llama-3.3-8b-instruct:free", label: "LLaMA 3.3 8B (Gratuit)" },
  { value: "mistralai/devstral-small:free", label: "Devstral Small (Gratuit)" },
];
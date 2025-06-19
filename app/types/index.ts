
/**
 * Interface pour le message de l'utilisateur et la réponse du modèle.
 * @property {string} prompt - Le texte de la requête de l'utilisateur.
 */
export interface Message {
  prompt: string;
  response: string;
  model: string;
  task: TaskType;
}

/**
 * Interface pour les paramètres de la requête.
 * @property {string} prompt - Le texte de la requête de l'utilisateur.
 * @property {string} model - Le modèle à utiliser pour la requête.
 * @property {TaskType} task - Le type de tâche à effectuer.
 */
export type TaskType = "explain" | "translate" | "code" | "summarize";

/**
 * Interface pour les options de modèle.
 * @property {string} value - La valeur du modèle.
 * @property {string} label - L'étiquette du modèle.
 */
export interface ModelOption {
  value: string;
  label: string;
}

/**
 * Interface pour les paramètres de la requête.
 * @property {string} prompt - Le texte de la requête de l'utilisateur.
 * @property {string} model - Le modèle à utiliser pour la requête.
 * @property {TaskType} task - Le type de tâche à effectuer.
 */
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

/**
 * Liste des modèles disponibles.
 * Chaque modèle a une valeur et une étiquette.
 */
export const MODELS: ModelOption[] = [
  { value: "meta-llama/llama-3.3-8b-instruct:free", label: "LLaMA 3.3 8B (Gratuit)" },
  { value: "mistralai/devstral-small:free", label: "Devstral Small (Gratuit)" },
];
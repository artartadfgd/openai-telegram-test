import OpenAI from "openai";
import type { VolleyballDoc } from "@/lib/volleyball";
import type { Locale } from "@/lib/i18n/dictionary";

export type { VolleyballDoc as TrainingDoc } from "@/lib/volleyball";

const LANGUAGE_NAME: Record<Locale, string> = {
  pt: "português do Brasil",
  en: "English",
  es: "español",
  fr: "français",
  it: "italiano",
  de: "Deutsch",
};

let client: OpenAI | null = null;
function getClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("no_credits");
    client = new OpenAI({ apiKey });
  }
  return client;
}

const diagramSchema = {
  type: "object",
  additionalProperties: false,
  required: ["players", "arrows", "cones", "balls"],
  properties: {
    players: {
      type: "array",
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["x", "y", "team", "number", "libero"],
        properties: {
          x: { type: "number", description: "0-100, percentage across court width (sideline to sideline)" },
          y: { type: "number", description: "0-100, percentage along court length; 50 is the net, 0-50 is side B, 50-100 is side A" },
          team: { type: "string", enum: ["A", "B", "N"] },
          number: { type: "integer" },
          libero: { type: "boolean" },
        },
      },
    },
    arrows: {
      type: "array",
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["from", "to", "type", "order"],
        properties: {
          from: {
            type: "object",
            additionalProperties: false,
            required: ["x", "y"],
            properties: { x: { type: "number" }, y: { type: "number" } },
          },
          to: {
            type: "object",
            additionalProperties: false,
            required: ["x", "y"],
            properties: { x: { type: "number" }, y: { type: "number" } },
          },
          type: { type: "string", enum: ["serve", "set", "spike", "block", "dig", "move"] },
          order: { type: "integer" },
        },
      },
    },
    cones: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["x", "y"],
        properties: { x: { type: "number" }, y: { type: "number" } },
      },
    },
    balls: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["x", "y"],
        properties: { x: { type: "number" }, y: { type: "number" } },
      },
    },
  },
} as const;

const blockSchema = {
  type: "object",
  additionalProperties: false,
  required: ["order", "title", "durationMin", "description", "coachingPoints", "technicalActions", "tacticalPrinciple", "diagram"],
  properties: {
    order: { type: "integer" },
    title: { type: "string" },
    durationMin: { type: "integer" },
    description: { type: "string" },
    coachingPoints: { type: "array", items: { type: "string" }, maxItems: 6 },
    technicalActions: {
      type: "object",
      additionalProperties: false,
      required: ["offensive", "defensive"],
      properties: {
        offensive: { type: "array", items: { type: "string" }, maxItems: 5 },
        defensive: { type: "array", items: { type: "string" }, maxItems: 5 },
      },
    },
    tacticalPrinciple: { type: "string" },
    diagram: diagramSchema,
  },
};

const trainingDocSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "objective",
    "category",
    "courtSetup",
    "totalDurationMin",
    "playersCount",
    "intensity",
    "materials",
    "blocks",
    "progressions",
    "regressions",
    "socioAffective",
    "notes",
  ],
  properties: {
    title: { type: "string" },
    objective: { type: "string" },
    category: { type: "string" },
    courtSetup: { type: "string", description: "e.g. quadra completa, meia quadra, zona de ataque, quadra reduzida" },
    totalDurationMin: { type: "integer" },
    playersCount: { type: "integer" },
    intensity: { type: "integer", minimum: 1, maximum: 3 },
    materials: { type: "array", items: { type: "string" }, maxItems: 10 },
    blocks: { type: "array", items: blockSchema, minItems: 3, maxItems: 6 },
    progressions: { type: "array", items: { type: "string" }, maxItems: 4 },
    regressions: { type: "array", items: { type: "string" }, maxItems: 4 },
    socioAffective: { type: "string" },
    notes: { type: "string" },
  },
};

function buildSystemPrompt(locale: Locale) {
  return `Você é o CoachAI, um assistente especializado em planejamento de treinos de voleibol para treinadores.
Ao receber um pedido de treino, responda SEMPRE com um documento de treino estruturado e completo.
Regras importantes para os diagramas de quadra:
- Coordenadas x,y são porcentagens de 0 a 100 dentro da quadra (x = largura, lateral a lateral; y = comprimento, onde y=50 é a rede, y=0-50 é o lado B e y=50-100 é o lado A).
- Use "team":"A" para o time/grupo que executa o exercício, "B" para o lado adversário/oposto da rede, "N" para neutros (ex: levantador de apoio, alvo).
- Sempre posicione jogadores de forma realista respeitando as posições de rotação do voleibol (1 a 6) quando fizer sentido.
- O tipo de quadra (courtSetup) deve descrever algo como "quadra completa", "meia quadra", "zona de ataque" ou "quadra reduzida" (traduzido para o idioma de resposta) — escolha o que fizer mais sentido pro exercício.
- Tipos de seta (enum fixo, não traduzir): "serve" (saque), "set" (levantamento), "spike" (ataque/cortada), "block" (bloqueio), "dig" (defesa/manchete), "move" (deslocamento).
- Cada bloco deve ter uma duração coerente que some (aproximadamente) o total do treino.
- coachingPoints, technicalActions e tacticalPrinciple devem ser específicos e acionáveis, nunca genéricos, sempre no contexto de voleibol (recepção, levantamento, ataque, bloqueio, saque, defesa, rodízio, sistema tático).
Seja didático, prático e direto, como um treinador experiente de voleibol escrevendo para outro treinador.

IMPORTANTE: Escreva TODO o texto do documento (title, objective, category, courtSetup, materials, e dentro de cada bloco: title, description, coachingPoints, technicalActions, tacticalPrinciple, além de progressions, regressions, socioAffective, notes) em ${LANGUAGE_NAME[locale]}. Apenas os valores de "team" e "type" dos diagramas devem permanecer nos códigos fixos em inglês definidos no schema.`;
}

export async function generateTrainingDoc(userPrompt: string, locale: Locale = "pt"): Promise<VolleyballDoc> {
  const openai = getClient();
  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt(locale) },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "training_doc", schema: trainingDocSchema, strict: true },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/rate.?limit/i.test(message)) throw new Error("rate_limited");
    if (/quota|billing|insufficient/i.test(message)) throw new Error("no_credits");
    throw new Error("ai_error");
  }

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("ai_error");
  try {
    return JSON.parse(content) as VolleyballDoc;
  } catch {
    throw new Error("ai_error");
  }
}

export async function chatReply(history: { role: "user" | "assistant"; content: string }[], locale: Locale = "pt"): Promise<string> {
  const openai = getClient();
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é o CoachAI, assistente de treinadores de voleibol. Converse de forma curta, prática e amigável. Responda SEMPRE em ${LANGUAGE_NAME[locale]}, independentemente do idioma usado pelo usuário. Se o usuário pedir um treino/sessão de treino específica, responda apenas confirmando que vai montar o plano (o sistema cuidará de gerar o documento estruturado separadamente).`,
        },
        ...history,
      ],
      max_tokens: 400,
    });
    return completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/rate.?limit/i.test(message)) throw new Error("rate_limited");
    if (/quota|billing|insufficient/i.test(message)) throw new Error("no_credits");
    throw new Error("ai_error");
  }
}

export function looksLikeTrainingRequest(text: string) {
  const t = text.toLowerCase();
  return /treino|sess[aã]o|exerc[ií]cio|aquecimento|treinamento|training|session|exercise|warm-?up|entrenamiento|ejercicio|calentamiento|entra[iî]nement|s[eé]ance|exercice|[ée]chauffement|allenamento|riscaldamento|übung|einheit|aufwärmen/.test(
    t
  );
}

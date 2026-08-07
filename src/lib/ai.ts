import OpenAI from "openai";

let client: OpenAI | null = null;
function getClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("no_credits");
    client = new OpenAI({ apiKey });
  }
  return client;
}

export type PitchPlayer = { x: number; y: number; team: "A" | "B" | "N"; number: number; gk: boolean };
export type PitchArrow = { from: { x: number; y: number }; to: { x: number; y: number }; type: "pass" | "run" | "dribble"; order: number };
export type PitchPoint = { x: number; y: number };

export type TrainingDiagram = {
  pitchType: "full" | "half" | "reduced" | "square";
  players: PitchPlayer[];
  arrows: PitchArrow[];
  cones: PitchPoint[];
  balls: PitchPoint[];
};

export type TrainingBlock = {
  order: number;
  title: string;
  durationMin: number;
  description: string;
  coachingPoints: string[];
  technicalActions: { offensive: string[]; defensive: string[] };
  tacticalPrinciple: string;
  diagram: TrainingDiagram;
};

export type TrainingDoc = {
  title: string;
  objective: string;
  category: string;
  field: string;
  totalDurationMin: number;
  playersCount: number;
  intensity: number;
  materials: string[];
  blocks: TrainingBlock[];
  progressions: string[];
  regressions: string[];
  socioAffective: string;
  notes: string;
};

const diagramSchema = {
  type: "object",
  additionalProperties: false,
  required: ["pitchType", "players", "arrows", "cones", "balls"],
  properties: {
    pitchType: { type: "string", enum: ["full", "half", "reduced", "square"] },
    players: {
      type: "array",
      maxItems: 24,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["x", "y", "team", "number", "gk"],
        properties: {
          x: { type: "number", description: "0-100, percentage across pitch width" },
          y: { type: "number", description: "0-100, percentage down pitch height" },
          team: { type: "string", enum: ["A", "B", "N"] },
          number: { type: "integer" },
          gk: { type: "boolean" },
        },
      },
    },
    arrows: {
      type: "array",
      maxItems: 12,
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
          type: { type: "string", enum: ["pass", "run", "dribble"] },
          order: { type: "integer" },
        },
      },
    },
    cones: {
      type: "array",
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["x", "y"],
        properties: { x: { type: "number" }, y: { type: "number" } },
      },
    },
    balls: {
      type: "array",
      maxItems: 6,
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
    "field",
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
    field: { type: "string" },
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

const SYSTEM_PROMPT = `Você é o CoachAI, um assistente especializado em planejamento de treinos de futebol/futsal para treinadores.
Ao receber um pedido de treino, responda SEMPRE com um documento de treino estruturado e completo em português do Brasil.
Regras importantes para os diagramas táticos:
- Coordenadas x,y são porcentagens de 0 a 100 dentro do campo (x = largura, y = altura).
- Use "team":"A" para o time que executa o exercício, "B" para adversários/oposição, "N" para neutros.
- Sempre inclua pelo menos os jogadores relevantes ao exercício do bloco (não deixe arrays vazios sem necessidade).
- pitchType: "reduced" para exercícios em espaço reduzido, "half" para meio campo, "full" para campo inteiro, "square" para rondos/posse em grade.
- Cada bloco deve ter uma duração coerente que some (aproximadamente) o total do treino.
- coachingPoints, technicalActions e tacticalPrinciple devem ser específicos e acionáveis, nunca genéricos.
Seja didático, prático e direto, como um treinador experiente escrevendo para outro treinador.`;

export async function generateTrainingDoc(userPrompt: string): Promise<TrainingDoc> {
  const openai = getClient();
  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
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
    return JSON.parse(content) as TrainingDoc;
  } catch {
    throw new Error("ai_error");
  }
}

export async function chatReply(history: { role: "user" | "assistant"; content: string }[]): Promise<string> {
  const openai = getClient();
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é o CoachAI, assistente de treinadores de futebol. Converse de forma curta, prática e amigável em português do Brasil. Se o usuário pedir um treino/sessão de treino específica, responda apenas confirmando que vai montar o plano (o sistema cuidará de gerar o documento estruturado separadamente).",
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
  return /treino|sess[aã]o|exerc[ií]cio|aquecimento|treinamento/.test(t);
}

export type CourtPlayer = { x: number; y: number; team: "A" | "B" | "N"; number: number; libero?: boolean };
export type CourtPoint = { x: number; y: number };
export type CourtArrow = {
  from: CourtPoint;
  to: CourtPoint;
  type: "serve" | "set" | "spike" | "block" | "dig" | "move";
  order: number;
};

export type CourtDiagram = {
  players: CourtPlayer[];
  arrows: CourtArrow[];
  balls: CourtPoint[];
  cones: CourtPoint[];
};

export type VolleyballBlock = {
  order: number;
  title: string;
  durationMin: number;
  description: string;
  coachingPoints: string[];
  technicalActions: { offensive: string[]; defensive: string[] };
  tacticalPrinciple: string;
  diagram: CourtDiagram;
};

export type VolleyballDoc = {
  title: string;
  objective: string;
  category: string;
  courtSetup: string;
  totalDurationMin: number;
  playersCount: number;
  intensity: number;
  materials: string[];
  blocks: VolleyballBlock[];
  progressions: string[];
  regressions: string[];
  socioAffective: string;
  notes: string;
};

export type CuratedBlock = VolleyballBlock & {
  variants?: { harder?: string; easier?: string };
};

export type SkillType =
  | "serve"
  | "pass"
  | "set"
  | "attack"
  | "block"
  | "defense"
  | "libero"
  | "rotation"
  | "coverage"
  | "transition"
  | "communication"
  | "smallSided"
  | "conditioning"
  | "pressure";

export type CuratedTemplate = {
  slug: string;
  skillType: SkillType;
  category: string;
  hook: string;
  title: string;
  subtitle: string;
  objective: string;
  courtSetup: string;
  totalDurationMin: number;
  playersCount: number;
  intensity: number;
  materials: string[];
  coverFrom: string;
  coverTo: string;
  blocks: CuratedBlock[];
};

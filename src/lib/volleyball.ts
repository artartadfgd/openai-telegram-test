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

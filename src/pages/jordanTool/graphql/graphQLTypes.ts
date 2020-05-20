export interface Factors {
  industryCode: string;
  rcaJordan: number | null;
  rcaPeers: number | null;
  waterIntensity: number | null;
  electricityIntensity: number | null;
  availabilityInputs: number | null;
  femaleEmployment: number | null;
  highSkillEmployment: number | null;
  fdiWorld: number | null;
  fdiRegion: number | null;
  exportPropensity: number | null;
  viability: number | null;
  attractiveness: number | null;
  viabilityMedian: number | null;
  attractivenessMedian: number | null;
  category: string | null;
  rca: number | null;
  id: string;
}

export interface FactorsEdge {
  node: Factors | null;
}

export interface FactorsConnection {
  edges: (FactorsEdge | null)[];
}

export interface JordanIndustry {
  industryCode: string;
  title: string | null;
  theme: string | null;
  subtheme: string | null;
  description: string | null;
  keywords: string | null;
  factors: FactorsConnection;
}
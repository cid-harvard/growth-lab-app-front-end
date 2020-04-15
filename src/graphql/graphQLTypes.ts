export enum NACELevel {
  section = 'section', // highest tier
  division = 'division', // middle tier
  group = 'group', // lowest tier
}

export interface NACEIndustry {
  id: string;
  naceId: string | null;
  level: NACELevel | null;
  code: string | null;
  name: string | null;
  parentId: string | null;
}

export interface NACEIndustryEdge {
  node: NACEIndustry | null;
}

export interface NACEIndustryConnection {
  edges: (NACEIndustryEdge | null)[];
}

export interface Factors {
  naceId: string | null;
  rca: string | null;
  vRca: string | null;
  vDist: string | null;
  vFdipeers: string | null;
  vContracts: string | null;
  vElect: string | null;
  avgViability: string | null;
  aYouth: string | null;
  aWage: string | null;
  aFdiworld: string | null;
  aExport: string | null;
  avgAttractiveness: string | null;
  id: string;
}

export interface FactorsEdge {
  node: Factors | null;
}

export interface FactorsConnection {
  edges: (FactorsEdge | null)[];
}
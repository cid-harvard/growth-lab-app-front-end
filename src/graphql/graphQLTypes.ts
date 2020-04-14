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
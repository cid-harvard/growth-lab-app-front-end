export interface NACEIndustry {
  id: string;
  naceId: string | null;
  level: string | null;
  code: string | null;
  name: string | null;
  parentId: string | null;
}

export interface NACEIndustryEdge {
  node: NACEIndustry | null;
}

export interface NACEIndustryConnection {
  edges: Array<NACEIndustryEdge | null>;
}
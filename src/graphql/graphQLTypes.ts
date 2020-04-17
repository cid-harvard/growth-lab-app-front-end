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

export enum RCADirection {
  LessThanOne = '< 1',
  GreaterThanOrEqualToOne = '>= 1',
}

export interface Factors {
  naceId: string | null;
  rca: RCADirection | null;
  vRca: number | null;
  vDist: number | null;
  vFdipeers: number | null;
  vContracts: number | null;
  vElect: number | null;
  avgViability: number | null;
  aYouth: number | null;
  aWage: number | null;
  aFdiworld: number | null;
  aExport: number | null;
  avgAttractiveness: number | null;
  id: string;
}

export interface FactorsEdge {
  node: Factors | null;
}

export interface FactorsConnection {
  edges: (FactorsEdge | null)[];
}

export enum SectionEnum {
  Overview = 'Overview',
  ViabilityFactors = 'Viability Factors',
  AttractivenessFactors = 'Attractiveness Factors',
  IndustryPotential = 'Industry Potential',
  IndustryNow = 'Industry Now',
}

export enum SubSectionEnum {
  Overview = 'Overview',
  RCAInAlbania = 'RCA in Albania',
  LowDistanceToIndustry = 'Low Distance to Industry',
  HighFDIToPeerCountries = 'High FDI to Peer Countries',
  LowContractIntensity = 'Low Contract Intensity',
  HighElectricityIntensity = 'High Electricity Intensity',
  HighRelativeWages = 'High Relative Wages',
  HighYouthEmployment = 'High Youth Employment',
  HighGlobalFDIFlows = 'High Global FDI Flows',
  HighExportPropensity = 'High Export Propensity',
  PlaceholderFor5thFactor = 'Placeholder for 5th Factor',
  IndustryPotential = 'Industry Potential',
  IndustryNow = 'Industry Now',
}

export interface Script {
  section: SectionEnum;
  subsection: SubSectionEnum;
  text: string | null;
  id: string;
}

export interface ScriptsEdge {
  node: Script | null;
}

export interface ScriptsConnection {
  edges: (ScriptsEdge | null)[];
}
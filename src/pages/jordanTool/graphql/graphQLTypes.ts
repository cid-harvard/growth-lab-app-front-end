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

export interface TopFDI {
  rank: string;
  company: string | null;
  sourceCountry: string | null;
  capitalInvestment: number | null;
}

export interface TopFDIEdge {
  node: TopFDI | null;
}

export interface TopFDIConnection {
  edges: (TopFDIEdge | null)[];
}

export interface Nationality {
  nationality: string;
  men: string | null;
  women: string | null;
  meanwage: string | null;
  medianwage: string | null;
}

export interface NationalityEdge {
  node: Nationality | null;
}

export interface NationalityConnection {
  edges: (NationalityEdge | null)[];
}

export interface Schooling {
  schooling: string;
  men: string | null;
  women: string | null;
}

export interface SchoolingEdge {
  node: Schooling | null;
}

export interface SchoolingConnection {
  edges: (SchoolingEdge | null)[];
}

export interface Occupation {
  occupation: string;
  men: string | null;
  women: string | null;
}

export interface OccupationEdge {
  node: Occupation | null;
}

export interface OccupationConnection {
  edges: (OccupationEdge | null)[];
}

export interface MapLocation {
  govCode: string;
  governorate: string | null;
  shareState: string | null;
  shareCountry: string | null;
}

export interface MapLocationEdge {
  node: MapLocation | null;
}

export interface MapLocationConnection {
  edges: (MapLocationEdge | null)[];
}

export enum WageHistogramFacet {
  Industry = 'Industry',
  Country = 'Country',
}

export interface WageHistogram {
  facet: WageHistogramFacet;
  range0100: number | null;
  range100200: number | null;
  range200300: number | null;
  range300400: number | null;
  range400500: number | null;
  range500600: number | null;
  range600Plus: number | null;
}

export interface WageHistogramEdge {
  node: WageHistogram | null;
}

export interface WageHistogramConnection {
  edges: (WageHistogramEdge | null)[];
}

export enum OverTimeVisualization {
  FDIBarChart = 'fdi_bar_chart',
  Histogram = 'histogram',
}

export enum OverTimeTarget {
  Global = '1',
  Mena = '2',
}

export interface OverTimeHistogram {
  visualization: OverTimeVisualization;
  variable: OverTimeTarget;
  years20042006: number | null;
  years20072009: number | null;
  years20102012: number | null;
  years20132015: number | null;
  years20162018: number | null;
}

export interface OverTimeHistogramEdge {
  node: OverTimeHistogram | null;
}

export interface OverTimeHistogramConnection {
  edges: (OverTimeHistogramEdge | null)[];
}

export interface JordanIndustry {
  industryCode: string;
  title: string | null;
  theme: string | null;
  subtheme: string | null;
  description: string | null;
  keywords: string | null;
  factors: FactorsConnection;
  globalTopFdi: TopFDIConnection;
  regionTopFdi: TopFDIConnection;
  nationality: NationalityConnection;
  schooling: SchoolingConnection;
  occupation: OccupationConnection;
  mapLocation: MapLocationConnection;
  wageHistogram: WageHistogramConnection;
  overTime: OverTimeHistogramConnection;
}

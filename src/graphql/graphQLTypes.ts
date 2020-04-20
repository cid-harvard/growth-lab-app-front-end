export enum RCADirection {
  LessThanOne = '< 1',
  GreaterThanOrEqualToOne = '>= 1',
}

export interface Factors {
  naceId: string;
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
  vText: string | null;
  aText: string | null;
  rcaText1: string | null;
  rcaText2: string | null;
}

export interface FactorsEdge {
  node: Factors | null;
}

export interface FactorsConnection {
  edges: (FactorsEdge | null)[];
}

export enum LocationLevel {
  Region = 'REGION',
  Country = 'COUNTRY',
}

export interface Country {
  locationId: string;
  code: string | null;
  level: LocationLevel;
  nameEn: string | null;
  nameShortEn: string | null;
  iso2: string | null;
  parentId: number | null;
  name: string | null;
  isTrusted: boolean | null;
  inRankings: boolean | null;
  reportedServ: boolean | null;
  reportedServRecent: boolean | null;
  formerCountry: boolean | null;
}

export interface CountryEdge {
  node: Country | null;
}

export interface CountryConnection {
  edges: (CountryEdge | null)[];
}

export interface FDIMarket {
  naceId: string;
  locationId: number | null;
  parentCompany: string;
  sourceCountry: string;
  sourceCity: string;
  capexWorld: number | null;
  capexEurope: number | null;
  capexBalkans: number | null;
  projectsWorld: number | null;
  projectsEurope: number | null;
  projectsBalkans: number | null;
  country: CountryConnection;
}

export interface FDIMarketEdge {
  node: FDIMarket | null;
}

export interface FDIMarketConnection {
  edges: (FDIMarketEdge | null)[];
}

export enum FDIMarketOvertimeDestination {
  Balkans = 'Balkans',
  RestOfEurope = 'Rest of Europe',
  RestOfWorld = 'Rest of World',
}

export interface FDIMarketOvertime {
  naceId: string;
  destination: FDIMarketOvertimeDestination | null;
  projects0306: number | null;
  projects0710: number | null;
  projects1114: number | null;
  projects1518: number | null;
}

export interface FDIMarketOvertimeEdge {
  node: FDIMarketOvertime | null;
}

export interface FDIMarketOvertimeConnection {
  edges: (FDIMarketOvertimeEdge | null)[];
}

export enum NACELevel {
  section = 'SECTION', // highest tier
  division = 'DIVISION', // middle tier
  group = 'GROUP', // lowest tier
}

export interface NACEIndustry {
  naceId: string;
  level: NACELevel | null;
  code: string | null;
  name: string | null;
  parentId: number | null;
  factors: FactorsConnection;
  fdiMarketsOvertime: FDIMarketOvertimeConnection;
  fdiMarkets: FDIMarketConnection;
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
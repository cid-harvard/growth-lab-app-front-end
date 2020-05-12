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
  strategy: string | null;
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

export interface IndustryNowOccupation {
  naceId: string;
  managersMale: number | null;
  managersFemale: number | null;
  professionalsMale: number | null;
  professionalsFemale: number | null;
  techniciansMale: number | null;
  techniciansFemale: number | null;
  clericalMale: number | null;
  clericalFemale: number | null;
  servicesMale: number | null;
  servicesFemale: number | null;
  craftMale: number | null;
  craftFemale: number | null;
  assemblyMale: number | null;
  assemblyFemale: number | null;
  primaryMale: number | null;
  primaryFemale: number | null;
  elementaryMale: number | null;
  elementaryFemale: number | null;
  otherMale: number | null;
  otherFemale: number | null;
  id: string;
}

export interface IndustryNowOccupationEdge {
  node: IndustryNowOccupation | null;
}

export interface IndustryNowOccupationConnection {
  edges: (IndustryNowOccupationEdge | null)[];
}

export interface IndustryNowNearestIndustry {
  naceId: string;
  place: string;
  neighborNaceId: number | null;
  neighborCode: string | null;
  neighborName: string | null;
  neighborRcaGte1: boolean;
  id: string;
}

export interface IndustryNowNearestIndustryEdge {
  node: IndustryNowNearestIndustry | null;
}

export interface IndustryNowNearestIndustryConnection {
  edges: (IndustryNowNearestIndustryEdge | null)[];
}

export interface IndustryNowWage {
  naceId: string;
  ind010k: number | null;
  ind10k25k: number | null;
  ind25k50k: number | null;
  ind50k75k: number | null;
  ind75k100k: number | null;
  ind100kUp: number | null;
  national010k: number | null;
  national10k25k: number | null;
  national25k50k: number | null;
  national50k75k: number | null;
  national75k100k: number | null;
  national100kUp: number | null;
  id: string;
}

export interface IndustryNowWageEdge {
  node: IndustryNowWage | null;
}

export interface IndustryNowWageConnection {
  edges: (IndustryNowWageEdge | null)[];
}

export interface IndustryNowSchooling {
  naceId: string;
  esBelowMale: number | null;
  esBelowFemale: number | null;
  lowerSecondaryMale: number | null;
  lowerSecondaryFemale: number | null;
  technicalVocationalMale: number | null;
  technicalVocationalFemale: number | null;
  hsSomeCollegeMale: number | null;
  hsSomeCollegeFemale: number | null;
  universityHigherMale: number | null;
  universityHigherFemale: number | null;
  id: string;
}

export interface IndustryNowSchoolingEdge {
  node: IndustryNowSchooling | null;
}

export interface IndustryNowSchoolingConnection {
  edges: (IndustryNowSchoolingEdge | null)[];
}

export interface IndustryNowLocation {
  naceId: string;
  berat: number | null;
  diber: number | null;
  durres: number | null;
  elbasan: number | null;
  fier: number | null;
  gjirokaster: number | null;
  korce: number | null;
  kukes: number | null;
  lezhe: number | null;
  shkoder: number | null;
  tirane: number | null;
  vlore: number | null;
  id: string;
}

export interface IndustryNowLocationEdge {
  node: IndustryNowLocation | null;
}

export interface IndustryNowLocationConnection {
  edges: (IndustryNowLocationEdge | null)[];
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
  avgCapex: number | null;
  avgJobs: number | null;
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
  industryNowLocation: IndustryNowLocationConnection;
  industryNowSchooling: IndustryNowSchoolingConnection;
  industryNowOccupation: IndustryNowOccupationConnection;
  industryNowNearestIndustry: IndustryNowNearestIndustryConnection;
  industryNowWage: IndustryNowWageConnection;
}

export enum SectionEnum {
  Introduction = 'Introduction',
  Overview = 'Overview',
  ViabilityFactors = 'Viability Factors',
  AttractivenessFactors = 'Attractiveness Factors',
  IndustryPotential = 'Industry Potential',
  IndustryNow = 'Industry Now',
}

export enum SubSectionEnum {
  Introduction = 'Introduction',
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
  LocationOfWorkers = 'Location of Workers',
  EducationDistribution = 'Education Distribution',
  OccupationDistribution = 'Occupation Distribution',
  IndustryWages = 'Industry Wages',
  NearbyIndustries = 'Nearby Industries',
}

export interface Script {
  section: SectionEnum;
  subsection: SubSectionEnum;
  text: string | null;
  id: string;
}
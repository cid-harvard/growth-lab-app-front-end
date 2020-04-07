export enum IndustryLevel {
  section = 'section',
  division = 'division',
  group = 'group',
}

export interface NACEIndustry {
  nace_id: number;
  level: IndustryLevel | null;
  code: string | null;
  name: string | null;
  parent_id: number | null;
}

export enum LocationLevel {
  region = 'region',
  country = 'country',
}

export interface Country {
  location_id: number;
  code: string | null;
  level: LocationLevel | null;
  name_en: string | null;
  name_short_en: string | null;
  iso2: string | null;
  parent_id: number | null;
  name: string | null;
  is_trusted: boolean | null;
  in_rankings: boolean | null;
  reported_serv: boolean | null;
  reported_serv_recent: boolean | null;
  former_country: boolean | null;
}

export interface FDIMarkets {
  // primary_key "nace_id", "parent_company", "source_city", "source_country"
  nace_id: number | null;
  location_id: number | null;
  parent_company: string | null;
  source_country: string | null;
  source_city: string | null;
  capex_world: number | null;
  capex_europe: number | null;
  capex_balkans: number | null;
  projects_world: number | null;
  projects_europe: number | null;
  projects_balkans: number | null;
}


export enum Destination {
  balkans = 'balkans',
  rest_europe = 'rest_europe',
  rest_world = 'rest_world',
}

export interface FDIMarketsOvertime {
  nace_id: number;
  destination: Destination | null;
  projects_03_06: number | null;
  projects_07_10: number | null;
  projects_11_14: number | null;
  projects_15_18: number | null;
}

export interface Viability {
  nace_id: number;
  score_rca: number | null;
  score_dist: number | null;
  score_fdipeers: number | null;
  score_contracts: number | null;
}

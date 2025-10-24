export type CountryYearMetric = {
  countryId: number;
  year: number;
  nameEn?: string;
  iso3Code?: string;
  rank?: number | null;
  rankingMetric?: string | null; // API returns this as a string
  coiGreen?: number;
};

export type RankedRow = {
  rank: number;
  name: string;
  iso3: string;
  rankingMetric: number;
};

export type CountryOption = {
  label: string;
  iso3: string;
};

export type TooltipState = {
  show: boolean;
  x: number;
  y: number;
  name: string;
  rank: number | null;
  greenEci: number | null;
};

export type TabType = "map" | "bump";

export type SortColumn = "rank" | "country" | "greenplexity" | "change";

export type SortDirection = "asc" | "desc";

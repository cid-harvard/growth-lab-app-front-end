// Shared constants and types for overtimeViz components

export const fontFamily = '"Source Sans Pro", "Arial", sans-serif';

export const chartHeight = 670;

export const overtimeMinYear = 2000;

// Color scale (low → high ECI) - using greens for high complexity
export const colors = ["#B12231", "#F0A486", "#F9E9C4", "#7db89a", "#1d8968"];

// Location data type matching the GraphQL schema
export interface LocationDatum {
  location: {
    id: number;
    shortName: string;
    nameAbbr: string;
    thePrefix: boolean;
    code: string;
    isInComplexityRankings: boolean;
  };
  eciYearRange: Array<{ year: number; quantity: number | null }>;
  eciRankYearRange: Array<{ year: number; quantity: number | null }>;
}

// Utility function to format country names
export const getCountryName = (params: {
  shortName?: string;
  nameAbbr?: string;
  thePrefix: boolean;
}): { nameInChart: string } => {
  const { shortName, nameAbbr, thePrefix } = params;
  const name = nameAbbr || shortName || "";
  const nameInChart = thePrefix ? `the ${name}` : name;
  return { nameInChart };
};

// Latest year for the rankings
export const latestYear = 2023;

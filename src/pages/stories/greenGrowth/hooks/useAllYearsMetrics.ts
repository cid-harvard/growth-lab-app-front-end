import { useState, useEffect, useMemo } from "react";
import { useQuery, gql } from "@apollo/client";

// OPTIMIZED: Fetch all years at once (year parameter is now optional)
const GET_ALL_YEARS_METRICS = gql`
  query GetAllYearsMetrics {
    gpCountryYearList {
      countryId
      year
      coiGreen
      lntotnetnrexpPc
      lnypc
      xResid
      policyRecommendation
      rank
      rankingMetric
    }
  }
`;

const GET_COUNTRIES = gql`
  query GetCountries {
    gpLocationCountryList {
      countryId
      nameEn
      nameShortEn
      iso3Code
    }
  }
`;

interface CountryYearMetric {
  countryId: number;
  year: number;
  coiGreen: number;
  lntotnetnrexpPc: number;
  lnypc: number;
  xResid: number;
  policyRecommendation?: string;
  rank?: number | null;
  rankingMetric?: string | null;
  nameEn?: string;
  nameShortEn?: string;
  iso3Code?: string;
}

/**
 * Optimized hook to fetch country metrics for ALL years at once
 * Now that the year parameter is optional in the GraphQL API,
 * we can fetch all years in a single query instead of 12+ separate queries
 * 
 * @returns Object containing metrics grouped by year and global min/max values
 */
export const useAllYearsMetrics = () => {
  const [metricsByYear, setMetricsByYear] = useState<Map<number, CountryYearMetric[]>>(new Map());
  const [globalMinValue, setGlobalMinValue] = useState<number>(0);
  const [globalMaxValue, setGlobalMaxValue] = useState<number>(1);

  // Fetch all years data at once
  const { data: allYearsData, loading: allYearsLoading, error: allYearsError } = useQuery(
    GET_ALL_YEARS_METRICS
  );

  // Fetch countries for metadata
  const { data: countriesData, loading: countriesLoading, error: countriesError } = useQuery(
    GET_COUNTRIES
  );

  // Process and group data by year
  useEffect(() => {
    if (!allYearsData?.gpCountryYearList || !countriesData?.gpLocationCountryList) return;

    // Define country type for lookup
    interface CountryInfo {
      countryId: number;
      nameEn: string;
      nameShortEn: string;
      iso3Code: string;
    }

    // Create country lookup
    const countryLookup = new Map<number, CountryInfo>(
      countriesData.gpLocationCountryList.map((country: any) => [
        country.countryId,
        country as CountryInfo,
      ])
    );

    // Group by year and enrich with country metadata
    const byYear = new Map<number, CountryYearMetric[]>();
    let min = Infinity;
    let max = -Infinity;

    allYearsData.gpCountryYearList.forEach((metric: any) => {
      const country = countryLookup.get(metric.countryId);
      if (!country) return;

      const enrichedMetric: CountryYearMetric = {
        ...metric,
        nameEn: country.nameEn,
        nameShortEn: country.nameShortEn,
        iso3Code: country.iso3Code,
      };

      // Track global min/max
      if (metric.rankingMetric) {
        const val = parseFloat(metric.rankingMetric);
        if (!Number.isNaN(val)) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }

      // Group by year
      if (!byYear.has(metric.year)) {
        byYear.set(metric.year, []);
      }
      byYear.get(metric.year)!.push(enrichedMetric);
    });

    setMetricsByYear(byYear);
    setGlobalMinValue(min === Infinity ? 0 : min);
    setGlobalMaxValue(max === -Infinity ? 1 : max);
  }, [allYearsData, countriesData]);

  // Helper function to get metrics for a specific year
  const getMetricsForYear = (year: number): CountryYearMetric[] => {
    return metricsByYear.get(year) || [];
  };

  return {
    metricsByYear,
    getMetricsForYear,
    globalMinValue,
    globalMaxValue,
    loading: allYearsLoading || countriesLoading,
    error: allYearsError || countriesError,
  };
};


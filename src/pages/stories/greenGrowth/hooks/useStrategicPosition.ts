import { useMemo } from "react";
import { useGreenGrowthData } from "./useGreenGrowthData";
import {
  STRATEGIC_POSITION_DESCRIPTIONS,
  QuadrantType,
  mapPolicyRecommendationToPosition,
} from "../utils/strategicPositionConstants";

export interface StrategicPosition {
  quadrant: QuadrantType | null;
  label: string;
  color: string;
  description?: string;
}

/**
 * Hook to determine a country's strategic position in the green growth landscape
 * @param countryId - The ID of the country to analyze
 * @param year - The year for the analysis
 * @returns Strategic position information including quadrant, label, color, and description
 */
export const useStrategicPosition = (
  countryId: number | null,
  year: number,
): StrategicPosition => {
  // Fetch all countries metrics to determine relative positioning
  const { allCountriesMetrics, isLoading } = useGreenGrowthData(
    null, // No specific country selection needed
    year,
    true, // Fetch all countries metrics
  );

  return useMemo(() => {
    // Return null state while loading or if no country selected
    if (isLoading || !countryId || !allCountriesMetrics.length) {
      return {
        quadrant: null,
        label: "Loading...",
        color: "#ccc",
        description: "Determining strategic position...",
      };
    }

    // Find the selected country's data
    const selectedCountryData = allCountriesMetrics.find(
      (country) => country.countryId === countryId,
    );

    if (!selectedCountryData) {
      return {
        quadrant: null,
        label: "No Data Available",
        color: "#ccc",
        description: "Strategic position data not available for this country",
      };
    }

    // Use API policy recommendation for classification
    const { quadrant, fillColor, label } = mapPolicyRecommendationToPosition(
      selectedCountryData.policyRecommendation,
    );

    return {
      quadrant,
      label,
      color: fillColor,
      description: STRATEGIC_POSITION_DESCRIPTIONS[quadrant],
    };
  }, [allCountriesMetrics, countryId, isLoading, year]);
};

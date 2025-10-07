export const STRATEGIC_POSITION_QUADRANTS = {
  topRight: "Light Touch Approach",
  topLeft: "Parsimonious Industrial Policy Approach",
  bottomRight: "Technological Frontier Approach",
  bottomLeft: "Strategic Bets Approach",
} as const;

export const STRATEGIC_POSITION_COLORS = {
  topLeft: "#FFBD59", // Yellow
  topRight: "#5480C6", // Blue
  bottomLeft: "#F28A5A", // Orange
  bottomRight: "#58BD9B", // Green
} as const;

export const STRATEGIC_POSITION_DESCRIPTIONS = {
  topRight:
    "Ample space to diversify calls for leveraging existing successes to enter more complex production.",
  topLeft:
    "Limited opportunities requires addressing bottlenecks, to help jump short distances, into related products.",
  bottomRight:
    "Having exploited virtually all, major existing products, gains come from developing new products.",
  bottomLeft:
    "Few nearby opportunities call for coordinated long jumps into strategic areas with future diversification potential.",
} as const;

export type QuadrantType = keyof typeof STRATEGIC_POSITION_QUADRANTS;

// Mapping function to convert API policy recommendations to strategic position
// Maps the actual API policy recommendation values from the GraphQL backend to the 4 chart quadrants
export const mapPolicyRecommendationToPosition = (
  policyRecommendation?: string | null,
): { quadrant: QuadrantType; fillColor: string; label: string } => {
  if (!policyRecommendation) {
    // Fallback for missing data
    return {
      quadrant: "bottomLeft",
      fillColor: STRATEGIC_POSITION_COLORS.bottomLeft,
      label: STRATEGIC_POSITION_QUADRANTS.bottomLeft,
    };
  }

  // Convert to lowercase and trim for consistent matching
  const recommendation = policyRecommendation.toLowerCase().trim();

  // Map based on actual GraphQL API values:
  // - "Harness nearby opportunities" (high coiGreen, high xResid) -> Top Right (Light Touch)
  // - "Climb the complexity ladder" (high coiGreen, lower xResid) -> Top Left (Parsimonious)
  // - "Maintain competitive edge" (varies coiGreen, high xResid) -> Bottom Right (Frontier)
  // - "Reinvent industrial base" (low coiGreen, varies xResid) -> Bottom Left (Strategic Bets)
  switch (recommendation) {
    case "harness nearby opportunities":
      return {
        quadrant: "topRight",
        fillColor: STRATEGIC_POSITION_COLORS.topRight,
        label: STRATEGIC_POSITION_QUADRANTS.topRight,
      };

    case "climb the complexity ladder":
      return {
        quadrant: "topLeft",
        fillColor: STRATEGIC_POSITION_COLORS.topLeft,
        label: STRATEGIC_POSITION_QUADRANTS.topLeft,
      };

    case "maintain competitive edge":
      return {
        quadrant: "bottomRight",
        fillColor: STRATEGIC_POSITION_COLORS.bottomRight,
        label: STRATEGIC_POSITION_QUADRANTS.bottomRight,
      };

    case "reinvent industrial base":
      return {
        quadrant: "bottomLeft",
        fillColor: STRATEGIC_POSITION_COLORS.bottomLeft,
        label: STRATEGIC_POSITION_QUADRANTS.bottomLeft,
      };

    default:
      // Unknown recommendation - fallback and warn
      console.warn(`Unknown policy recommendation: "${policyRecommendation}"`);
      return {
        quadrant: "bottomLeft",
        fillColor: STRATEGIC_POSITION_COLORS.bottomLeft,
        label: STRATEGIC_POSITION_QUADRANTS.bottomLeft,
      };
  }
};

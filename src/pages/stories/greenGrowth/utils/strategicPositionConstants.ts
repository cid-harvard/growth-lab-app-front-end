export const STRATEGIC_POSITION_QUADRANTS = {
  topRight: "Harness Nearby Opportunities",
  topLeft: "Climb the Complexity Ladder",
  bottomRight: "Maintain Competitive Edge",
  bottomLeft: "Reinvent Industrial Base",
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
    "Diversify into progressively more complex products in green value chains, considering related products as a starting point.",
  bottomRight:
    "With good presence in complex green industries, gains come from developing new products and maintaining competitiveness.",
  bottomLeft:
    "Few nearby opportunities call for coordinated long jumps into complex industries that open future diversification pathways.",
} as const;

export type QuadrantType = keyof typeof STRATEGIC_POSITION_QUADRANTS;

// Mapping function to convert API policy recommendations to strategic position
// Maps the 4 actual API policy recommendation values to the 4 chart quadrants
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

  // Map based on actual data patterns:
  // - "Harness nearby opportunities": High coiGreen + High xResid = Top Right
  // - "Climb the complexity ladder": Positive coiGreen + Low xResid = Top Left
  // - "Maintain competitive edge": Mixed coiGreen + High xResid = Bottom Right
  // - "Reinvent industrial base": Low coiGreen + Mixed xResid = Bottom Left
  switch (recommendation) {
    case "harness nearby opportunities":
      // Top Right: High green connectivity, higher complexity
      return {
        quadrant: "topRight",
        fillColor: STRATEGIC_POSITION_COLORS.topRight,
        label: STRATEGIC_POSITION_QUADRANTS.topRight,
      };

    case "climb the complexity ladder":
      // Top Left: Good green connectivity, lower complexity (need to climb)
      return {
        quadrant: "topLeft",
        fillColor: STRATEGIC_POSITION_COLORS.topLeft,
        label: STRATEGIC_POSITION_QUADRANTS.topLeft,
      };

    case "maintain competitive edge":
      // Bottom Right: Mixed green connectivity, very high complexity
      return {
        quadrant: "bottomRight",
        fillColor: STRATEGIC_POSITION_COLORS.bottomRight,
        label: STRATEGIC_POSITION_QUADRANTS.bottomRight,
      };

    case "reinvent industrial base":
      // Bottom Left: Poor green connectivity, mixed complexity
      return {
        quadrant: "bottomLeft",
        fillColor: STRATEGIC_POSITION_COLORS.bottomLeft,
        label: STRATEGIC_POSITION_QUADRANTS.bottomLeft,
      };

    default:
      // Unknown recommendation - fallback to Emerging Opportunities
      console.warn(`Unknown policy recommendation: "${policyRecommendation}"`);
      return {
        quadrant: "bottomLeft",
        fillColor: STRATEGIC_POSITION_COLORS.bottomLeft,
        label: STRATEGIC_POSITION_QUADRANTS.bottomLeft,
      };
  }
};

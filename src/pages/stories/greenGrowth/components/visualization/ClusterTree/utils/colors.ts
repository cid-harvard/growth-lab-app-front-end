import { scaleSequential } from "d3-scale";
import { interpolateRdYlBu } from "d3-scale-chromatic";

// Helper function to get color based on potential score using D3 color scale
export const getPotentialColor = (
  score: number,
  minScore: number,
  maxScore: number,
) => {
  const scoreRange = maxScore - minScore;
  if (scoreRange === 0) return "#4A90E2"; // Default blue if all scores are the same

  // Create D3 sequential color scale using RdYlBu (red → yellow → blue)
  // High potential (higher scores) map to blue; low potential to red
  const colorScale = scaleSequential(interpolateRdYlBu).domain([
    minScore,
    maxScore,
  ]);

  return colorScale(score);
};

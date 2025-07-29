import { scaleSequential } from "d3-scale";
import { interpolateBlues } from "d3-scale-chromatic";

// Shared 3-tier RCA range definitions (consistent across all components)
export const RCA_RANGES = [
  {
    min: 1.0,
    max: Infinity,
    label: "High RCA (≥1.0)",
    description: "Strong Capability",
    opacity: 1.0,
    colorPosition: 0.8,
  },
  {
    min: 0.5,
    max: 1.0,
    label: "Medium RCA (0.5-1.0)",
    description: "Moderate Capability",
    opacity: 0.6,
    colorPosition: 0.5,
  },
  {
    min: 0,
    max: 0.5,
    label: "Low RCA (<0.5)",
    description: "Limited Capability",
    opacity: 0.3,
    colorPosition: 0.2,
  },
];

/**
 * Get RCA range information for a given RCA value
 */
export function getRCARange(rca: number) {
  return (
    RCA_RANGES.find((range) => rca >= range.min && rca < range.max) ||
    RCA_RANGES[RCA_RANGES.length - 1]
  );
}

/**
 * Get opacity for RCA value
 */
export function getRCAOpacity(rca: number): number {
  const range = getRCARange(rca);
  return range.opacity;
}

/**
 * Get blue color for RCA value using D3 blues scale
 */
export function getRCABlueColor(rca: number): string {
  const bluesScale = scaleSequential(interpolateBlues);
  const range = getRCARange(rca);
  return bluesScale(range.colorPosition);
}

/**
 * Get all RCA legend items for display
 */
export function getRCALegendItems() {
  return RCA_RANGES;
}

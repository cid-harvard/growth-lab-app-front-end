import { scaleSequential } from "d3-scale";
import { interpolateBlues } from "d3-scale-chromatic";

// Shared 3-tier RCA range definitions (consistent across all components)
// Simplified 2-tier RCA ranges: >1 and ≤1
export const RCA_RANGES = [
  {
    min: 1.0,
    max: Infinity,
    label: "High (RCA>1)",
    description: "Strong Capability",
    opacity: 1.0,
    colorPosition: 0.9,
  },
  {
    min: -Infinity,
    max: 1.0,
    label: "Low (RCA≤1)",
    description: "Limited Capability",
    opacity: 0.35,
    colorPosition: 0.3,
  },
];

/**
 * Get RCA range information for a given RCA value
 */
export function getRCARange(rca: number, threshold: number = 1.0) {
  // Compute a dynamic two-tier range using the provided threshold
  const high = {
    min: threshold,
    max: Infinity,
    label: `High (RCA>${threshold})`,
    description: "Strong Capability",
    opacity: 1.0,
    colorPosition: 0.9,
  };
  const low = {
    min: -Infinity,
    max: threshold,
    label: `Low (RCA≤${threshold})`,
    description: "Limited Capability",
    opacity: 0.35,
    colorPosition: 0.3,
  };
  const ranges = [high, low];
  return ranges.find((range) => rca >= range.min && rca < range.max) || low;
}

/**
 * Get opacity for RCA value
 */
export function getRCAOpacity(rca: number, threshold: number = 1.0): number {
  const range = getRCARange(rca, threshold);
  return range.opacity;
}

/**
 * Get blue color for RCA value using D3 blues scale
 */
export function getRCABlueColor(rca: number, threshold: number = 1.0): string {
  const bluesScale = scaleSequential(interpolateBlues);
  const range = getRCARange(rca, threshold);
  return bluesScale(range.colorPosition);
}

/**
 * Get all RCA legend items for display
 */
export function getRCALegendItems(threshold: number = 1.0) {
  return [
    {
      min: threshold,
      max: Infinity,
      label: `High (RCA>${threshold})`,
      description: "Strong Capability",
      opacity: 1.0,
      colorPosition: 0.9,
    },
    {
      min: -Infinity,
      max: threshold,
      label: `Low (RCA≤${threshold})`,
      description: "Limited Capability",
      opacity: 0.35,
      colorPosition: 0.3,
    },
  ];
}

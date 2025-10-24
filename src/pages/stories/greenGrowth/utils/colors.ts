import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";

// Shared color utilities for the Green Growth story

// Value chain colors (matching canonical image order)
export const valueChainColors: Record<string, string> = {
  "Electric Vehicles": "#dc143c", // Red
  "Heat Pumps": "#8b4513", // Brown
  "Fuel Cells And Green Hydrogen": "#8a2be2", // Purple
  "Wind Power": "#20b2aa", // Cyan/Teal
  "Solar Power": "#9acd32", // Yellow-Green
  "Hydroelectric Power": "#ff69b4", // Pink
  "Nuclear Power": "#808080", // Gray
  Batteries: "#1e90ff", // Blue
  "Electric Grid": "#32cd32", // Green
  "Critical Metals and Minerals": "#ff8c00", // Orange
  "Carbon Capture": "#adb5bd",
};

// RCA color mapping
export const getColorFromRca = (rca: number): string => {
  if (rca > 1.5) return "#4caf50"; // Strong advantage
  if (rca > 1) return "#8bc34a"; // Advantage
  if (rca > 0.7) return "#cddc39"; // Slight advantage
  if (rca > 0.4) return "#bdbdbd"; // Neutral
  return "#9e9e9e"; // Disadvantage
};

// RCA opacity mapping (from CirclePack)
export const getRCAOpacity = (rca: number): number => {
  if (rca >= 1) return 1;
  if (rca > 0.2) return 0.6;
  return 0.15;
};

// RCA legend items for consistent legend display
export const RCA_LEGEND_ITEMS = [
  { color: "#4caf50", label: "RCA > 1.5 (Strong advantage)" },
  { color: "#8bc34a", label: "RCA > 1 (Advantage)" },
  { color: "#cddc39", label: "RCA > 0.7 (Moderate)" },
  { color: "#9e9e9e", label: "RCA ≤ 0.7 (Disadvantage)" },
];

// Explicit supply chain ID to color mapping based on ACTUAL database IDs (matching canonical image)
// This ensures consistent colors between SankeyTree and CirclePack
export const supplyChainIdColors: Record<number, string> = {
  0: "#dc143c", // Electric Vehicles (database ID 0) - Red
  1: "#1e90ff", // Batteries (database ID 1) - Blue
  2: "#8a2be2", // Fuel Cells And Green Hydrogen (database ID 2) - Purple
  3: "#32cd32", // Electric Grid (database ID 3) - Green
  4: "#9acd32", // Solar Power (database ID 4) - Yellow-Green
  5: "#8b4513", // Heat Pumps (database ID 5) - Brown
  6: "#ff8c00", // Critical Metals and Minerals (database ID 6) - Orange
  7: "#808080", // Nuclear Power (database ID 7) - Gray
  8: "#20b2aa", // Wind Power (database ID 8) - Cyan/Teal
  9: "#ff69b4", // Hydroelectric Power (database ID 9) - Pink
};

// Mapping from value chain names to supply chain IDs based on ACTUAL database IDs
const valueChainNameToSupplyChainId: Record<string, number> = {
  "Electric Vehicles": 0,
  Batteries: 1,
  "Fuel Cells And Green Hydrogen": 2,
  "Electric Grid": 3,
  "Solar Power": 4,
  "Heat Pumps": 5,
  "Critical Metals and Minerals": 6,
  "Nuclear Power": 7,
  "Wind Power": 8,
  "Hydroelectric Power": 9,
};

// Color function that uses explicit ID mapping for supply chains
export const getSupplyChainColor = (supplyChainId: number): string => {
  return supplyChainIdColors[supplyChainId] || "#1f77b4"; // fallback to blue
};

// NEW: Function to get consistent color for value chain by name (for SankeyTree compatibility)
export const getValueChainColor = (valueChainName: string): string => {
  const supplyChainId = valueChainNameToSupplyChainId[valueChainName];
  if (supplyChainId !== undefined) {
    return supplyChainIdColors[supplyChainId];
  }
  return "#808080"; // fallback to gray
};

// Default color scale for general use (non-supply chain specific)
export const colorScale = scaleOrdinal(schemeCategory10);

// Shared ranking/complexity color scale (low → high complexity)
// Updated to 4 colors for better grouping
export const RANKING_COLORS = [
  "#F0A486", // Lower complexity (light red/orange)
  "#F9E9C4", // Lower-mid complexity (cream)
  "#7db89a", // Upper-mid complexity (light green)
  "#1d8968", // High complexity (dark green)
];

// Creates a discrete color scale that diverges at 0
// With 4 bands: 2 negative (below 0), 2 positive (above 0)
// The boundary is exactly at 0
export const createDiscreteColorScale = (
  minValue: number,
  maxValue: number,
) => {
  // Divide data range into 4 bands with 0 as the exact boundary
  // Band 1: min to negativeMid (most negative)
  // Band 2: negativeMid to 0 (less negative)
  // Band 3: 0 to positiveMid (less positive)
  // Band 4: positiveMid to max (most positive)

  // Divide negative side into 2 equal bands
  const negativeMid = minValue / 2;

  // Divide positive side into 2 equal bands
  const positiveMid = maxValue / 2;

  const bands = [
    { min: -Infinity, max: negativeMid, color: RANKING_COLORS[0] }, // Most negative
    { min: negativeMid, max: 0, color: RANKING_COLORS[1] }, // Less negative (ends at 0)
    { min: 0, max: positiveMid, color: RANKING_COLORS[2] }, // Less positive (starts at 0)
    { min: positiveMid, max: Infinity, color: RANKING_COLORS[3] }, // Most positive
  ];

  return (value: number) => {
    const band = bands.find((b) => value >= b.min && value < b.max);
    return band ? band.color : RANKING_COLORS[2]; // default to positive color
  };
};

// Creates a continuous color scale (for map and table)
// Diverges at 0: interpolates within negative colors for values < 0,
// and within positive colors for values >= 0
export const createContinuousColorScale = (
  minValue: number,
  maxValue: number,
) => {
  // Helper to interpolate between two colors
  const interpolateColor = (
    color1: string,
    color2: string,
    factor: number,
  ): string => {
    const hex1 = color1.replace("#", "");
    const hex2 = color2.replace("#", "");

    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);

    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  return (value: number) => {
    // Continuous scale with breakpoints matching discrete bands
    // This creates smooth interpolation while aligning with the discrete categories
    // Key positions: minValue → negativeMid → 0 → positiveMid → maxValue
    // Color mapping: COLORS[0] → COLORS[1] → COLORS[2] → COLORS[3]

    const negativeMid = minValue / 2;
    const positiveMid = maxValue / 2;

    if (value <= negativeMid) {
      // Segment 1: minValue to negativeMid (COLORS[0] → COLORS[1])
      const normalized = (value - minValue) / (negativeMid - minValue);
      const clamped = Math.max(0, Math.min(1, normalized));
      return interpolateColor(RANKING_COLORS[0], RANKING_COLORS[1], clamped);
    } else if (value <= 0) {
      // Segment 2: negativeMid to 0 (COLORS[1] → COLORS[2])
      const normalized = (value - negativeMid) / (0 - negativeMid);
      const clamped = Math.max(0, Math.min(1, normalized));
      return interpolateColor(RANKING_COLORS[1], RANKING_COLORS[2], clamped);
    } else if (value <= positiveMid) {
      // Segment 3: 0 to positiveMid (COLORS[2] → COLORS[3])
      const normalized = value / positiveMid;
      const clamped = Math.max(0, Math.min(1, normalized));
      return interpolateColor(RANKING_COLORS[2], RANKING_COLORS[3], clamped);
    } else {
      // Beyond positiveMid: already at full COLORS[3]
      return RANKING_COLORS[3];
    }
  };
};

// Discrete bubble size mappings
export const BUBBLE_SIZES = {
  TINY: 0.3,
  SMALL: 0.6,
  MEDIUM: 0.9,
  LARGE: 1.1,
  HUGE: 1.4,
};

// Helper to create lighter version of a color for cluster backgrounds
export const getLighterColor = (
  color: string,
  opacity: number = 0.5,
): string => {
  // Convert hex color to RGB and add opacity
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Helper to create a lighter version of a color without opacity (for stacked elements)
export const getLighterColorSolid = (
  color: string,
  lightness: number = 0.3,
): string => {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Blend with white to create lighter solid color
  const newR = Math.round(r + (255 - r) * lightness);
  const newG = Math.round(g + (255 - g) * lightness);
  const newB = Math.round(b + (255 - b) * lightness);

  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};

// Helper to create a darker version of a color without opacity (for strokes)
export const getDarkerColorSolid = (
  color: string,
  darkness: number = 0.2,
): string => {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Multiply by darkness factor to create darker solid color
  const newR = Math.round(r * (1 - darkness));
  const newG = Math.round(g * (1 - darkness));
  const newB = Math.round(b * (1 - darkness));

  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};

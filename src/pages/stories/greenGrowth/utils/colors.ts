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

// Discrete bubble size mappings
export const BUBBLE_SIZES = {
  TINY: 0.3,
  SMALL: 0.6,
  MEDIUM: 0.9,
  LARGE: 1.1,
  HUGE: 1.4,
};

// Helper to get discrete ranking for bubble sizing
export const getDiscreteRanking = (
  ranking: number,
  minRank: number,
  maxRank: number,
): number => {
  const percentile = (ranking - minRank) / (maxRank - minRank);
  if (percentile <= 0.2) return BUBBLE_SIZES.TINY;
  if (percentile <= 0.4) return BUBBLE_SIZES.SMALL;
  if (percentile <= 0.6) return BUBBLE_SIZES.MEDIUM;
  if (percentile <= 0.8) return BUBBLE_SIZES.LARGE;
  return BUBBLE_SIZES.HUGE;
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

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
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

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

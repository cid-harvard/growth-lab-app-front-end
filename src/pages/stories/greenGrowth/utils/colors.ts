import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

// Shared color utilities for the Green Growth story

// Value chain colors (from SankeyTree constants)
export const valueChainColors: Record<string, string> = {
  'Hydroelectric Power': '#808080',
  'Nuclear Power': '#2a9d8f',
  'Electric Grid': '#8338ec',
  'Heat Pumps': '#ffb703',
  'Solar Power': '#3a86ff',
  'Wind Power': '#ef476f',
  'Electric Vehicles': '#4361ee',
  'Carbon Capture': '#adb5bd',
  'Critical Metals and Minerals': '#b42b51',
  'Fuel Cells And Green Hydrogen': '#57cc99',
  Batteries: '#fb8500',
};

// RCA color mapping
export const getColorFromRca = (rca: number): string => {
  if (rca > 1.5) return '#4caf50'; // Strong advantage
  if (rca > 1) return '#8bc34a'; // Advantage
  if (rca > 0.7) return '#cddc39'; // Slight advantage
  if (rca > 0.4) return '#bdbdbd'; // Neutral
  return '#9e9e9e'; // Disadvantage
};

// RCA opacity mapping (from useSupplyChainBubbles)
export const getRCAOpacity = (rca: number): number => {
  if (rca >= 1) return 1;
  if (rca > 0.2) return 0.6;
  return 0.15;
};

// RCA legend items for consistent legend display
export const RCA_LEGEND_ITEMS = [
  { color: '#4caf50', label: 'RCA > 1.5 (Strong advantage)' },
  { color: '#8bc34a', label: 'RCA > 1 (Advantage)' },
  { color: '#cddc39', label: 'RCA > 0.7 (Moderate)' },
  { color: '#9e9e9e', label: 'RCA ≤ 0.7 (Disadvantage)' },
];

// Explicit supply chain ID to color mapping to maintain consistent colors
// Maps new supply chain IDs to match the original visualization colors
export const supplyChainIdColors: Record<number, string> = {
  0: '#8B4513', // Heat Pumps - Brown
  1: '#FF8C00', // Critical Metals and Minerals - Orange
  2: '#9370DB', // Fuel Cells And Green Hydrogen - Purple
  3: '#00CED1', // Wind Power - Cyan/Turquoise
  4: '#DC143C', // Electric Vehicles - Red
  5: '#808080', // Nuclear Power - Gray
  6: '#32CD32', // Electric Grid - Green
  7: '#9ACD32', // Solar Power - Yellow-green
  8: '#FF69B4', // Hydroelectric Power - Pink
  9: '#1E90FF', // Batteries - Blue
};

// Mapping from value chain names to supply chain IDs for consistent coloring
const valueChainNameToSupplyChainId: Record<string, number> = {
  'Heat Pumps': 0,
  'Critical Metals and Minerals': 1,
  'Fuel Cells And Green Hydrogen': 2,
  'Wind Power': 3,
  'Electric Vehicles': 4,
  'Nuclear Power': 5,
  'Electric Grid': 6,
  'Solar Power': 7,
  'Hydroelectric Power': 8,
  Batteries: 9,
};

// Color function that uses explicit ID mapping for supply chains
export const getSupplyChainColor = (supplyChainId: number): string => {
  return supplyChainIdColors[supplyChainId] || '#1f77b4'; // fallback to blue
};

// NEW: Function to get consistent color for value chain by name (for SankeyTree compatibility)
export const getValueChainColor = (valueChainName: string): string => {
  const supplyChainId = valueChainNameToSupplyChainId[valueChainName];
  if (supplyChainId !== undefined) {
    return supplyChainIdColors[supplyChainId];
  }
  return '#808080'; // fallback to gray
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

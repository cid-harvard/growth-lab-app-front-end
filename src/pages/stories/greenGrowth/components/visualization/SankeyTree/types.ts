// Interfaces
export interface Country {
  countryId: number;
  nameEn: string;
  iso3Code: string;
}

export interface Product {
  productId: number;
  code: string;
  nameEn: string;
  nameShortEn: string;
  productLevel: number;
  parentId: number;
}

export interface Cluster {
  clusterId: number;
  clusterName: string;
}

export interface SupplyChain {
  supplyChainId: number;
  supplyChain: string;
}

export interface ProductMapping {
  supplyChainId: number;
  productId: number;
  clusterId: number;
}

export interface CountryProductData {
  countryId: number;
  productId: number;
  exportRca: number;
  normalizedPci: number;
  normalizedCog: number;
  density: number;
  globalMarketShare: number;
  productMarketShare: number;
  productMarketShareGrowth: number;
  feasibilityStd: number | null;
  strategyBalancedPortfolio: number | null;
  strategyLongJump: number | null;
  strategyLowHangingFruit: number | null;
  strategyFrontier: number | null;
}

export interface CountryClusterData {
  countryId: number;
  clusterId: number;
  pci: number;
  cog: number;
  density: number;
  rca: number;
}

export interface ProductClusterRow {
  HS2012_4dg: string;
  dominant_cluster: number;
  supply_chain: string;
  cluster_name: string;
  product_id: number;
  name_short_en: string;
  product_level: number;
}

// Enhanced node type with visibility state
export interface HierarchyNodeData {
  id: string;
  name: string;
  type: "value_chain" | "manufacturing_cluster" | "product";
  color: string;
  visible: boolean;
  rca?: number; // Optional RCA value for opacity calculations
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// Enhanced link type with visibility
export interface HierarchyLinkData {
  id: string;
  source: string;
  target: string;
  value: number;
  color: string;
  visible: boolean;
  rca?: number; // Optional RCA value for opacity calculations
  sourceX?: number;
  sourceY?: number;
  targetX?: number;
  targetY?: number;
  // For cluster->product links, indicates which value chains this link is part of
  supplyChains?: string[];
}

// Complete hierarchy data structure
export interface TreeHierarchy {
  nodes: HierarchyNodeData[];
  links: HierarchyLinkData[];
}

// Tree node for tree layout
export interface TreeNode {
  name: string;
  id: string;
  type: "value_chain" | "manufacturing_cluster" | "product";
  color: string;
  radius?: number; // Dynamic radius for proper spacing
  children?: TreeNode[];
}

// New types for element transitions
export interface NodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  type: "value_chain" | "manufacturing_cluster" | "product";
}

// Link position type for animations
export interface LinkPosition {
  id: string;
  sourceName: string;
  targetName: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  color: string;
  value: number;
  isTreeLink: boolean;
  curveIntensity: number;
  rca?: number; // Optional RCA value for opacity calculations
}

export interface SankeyNodeExtra {
  name: string;
  type: "value_chain" | "manufacturing_cluster";
}

// Link position type for animations
export interface LinkStyles {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  opacity: number;
}

export interface NodeStyles {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

// Sankey coloring mode type
export type SankeyColoringMode = "Country Specific" | "Global";

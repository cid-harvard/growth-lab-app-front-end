// Shared types for Green Growth app

export interface ProductMapping {
  supplyChainId: number;
  productId: number;
  clusterId: number;
}

export interface SupplyChain {
  supplyChainId: number;
  supplyChain: string;
}

export interface CountryClusterData {
  clusterId: number;
  countryId: number;
  year: number;
  pci: number;
  cog: number;
  density: number;
  rca: number;
}

export interface CountryProductData {
  year: number;
  countryId: number;
  productId: number;
  exportRca: number;
  exportValue: number;
  expectedExports: number;
  normalizedPci: number;
  normalizedCog: number;
  feasibility: number;
  effectiveNumberOfExporters: number;
  marketGrowth: number;
  pciStd: number;
  cogStd: number;
  feasibilityStd: number;
  pciCogFeasibilityComposite: number;
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

export interface Product {
  productId: number;
  code: string;
  nameShortEn: string;
  productLevel: number;
}

export interface Cluster {
  clusterId: number;
  clusterName: string;
}

export interface Country {
  countryId: number;
  nameEn: string;
  nameShortEn: string;
  iso3Code: string;
  iso2Code: string;
}

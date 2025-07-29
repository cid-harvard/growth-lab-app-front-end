import { gql } from "@apollo/client";

// Shared GraphQL queries used across multiple components
// Using comprehensive versions for maximum caching efficiency - overfetching is OK for better cache reuse

export const GET_COUNTRIES = gql`
  query GetCountries {
    ggLocationCountryList {
      countryId
      nameEn
      nameShortEn
      nameEs
      nameShortEs
      iso3Code
      iso2Code
      legacyLocationId
      nameAbbrEn
      thePrefix
      formerCountry
      rankingsOverride
      cpOverride
      incomelevelEnum
      countryProject
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts {
    ggProductList {
      productId
      code
      nameEn
      nameShortEn
      productLevel
      parentId
      productIdHierarchy
      topParentId
      showFeasibility
    }
  }
`;

export const GET_CLUSTERS = gql`
  query GetClusters {
    ggClusterList {
      clusterId
      clusterName
    }
  }
`;

// OPTIMIZED: Batched cluster data query using GraphQL aliases
// Fetches ALL clusters (1-34) in one request instead of N individual requests
export const GET_CLUSTER_COUNTRY_DATA = gql`
  query GetClusterCountryData($year: Int!, $countryId: Int!) {
    cluster1: ggClusterCountryYearList(
      clusterId: 1
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster2: ggClusterCountryYearList(
      clusterId: 2
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster3: ggClusterCountryYearList(
      clusterId: 3
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster4: ggClusterCountryYearList(
      clusterId: 4
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster5: ggClusterCountryYearList(
      clusterId: 5
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster6: ggClusterCountryYearList(
      clusterId: 6
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster7: ggClusterCountryYearList(
      clusterId: 7
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster8: ggClusterCountryYearList(
      clusterId: 8
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster9: ggClusterCountryYearList(
      clusterId: 9
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster10: ggClusterCountryYearList(
      clusterId: 10
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster11: ggClusterCountryYearList(
      clusterId: 11
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster12: ggClusterCountryYearList(
      clusterId: 12
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster13: ggClusterCountryYearList(
      clusterId: 13
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster14: ggClusterCountryYearList(
      clusterId: 14
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster15: ggClusterCountryYearList(
      clusterId: 15
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster16: ggClusterCountryYearList(
      clusterId: 16
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster17: ggClusterCountryYearList(
      clusterId: 17
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster18: ggClusterCountryYearList(
      clusterId: 18
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster19: ggClusterCountryYearList(
      clusterId: 19
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster20: ggClusterCountryYearList(
      clusterId: 20
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster21: ggClusterCountryYearList(
      clusterId: 21
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster22: ggClusterCountryYearList(
      clusterId: 22
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster23: ggClusterCountryYearList(
      clusterId: 23
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster24: ggClusterCountryYearList(
      clusterId: 24
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster25: ggClusterCountryYearList(
      clusterId: 25
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster26: ggClusterCountryYearList(
      clusterId: 26
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster27: ggClusterCountryYearList(
      clusterId: 27
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster28: ggClusterCountryYearList(
      clusterId: 28
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster29: ggClusterCountryYearList(
      clusterId: 29
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster30: ggClusterCountryYearList(
      clusterId: 30
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster31: ggClusterCountryYearList(
      clusterId: 31
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster32: ggClusterCountryYearList(
      clusterId: 32
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster33: ggClusterCountryYearList(
      clusterId: 33
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
    cluster34: ggClusterCountryYearList(
      clusterId: 34
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
  }
`;

export const GET_SUPPLY_CHAINS = gql`
  query GetSupplyChains {
    ggSupplyChainList {
      supplyChainId
      supplyChain
    }
  }
`;

export const GET_COUNTRY_PRODUCT_DATA = gql`
  query GetCountryProductData($year: Int!, $countryId: Int!) {
    ggCpyList(year: $year, countryId: $countryId) {
      year
      countryId
      productId
      exportRca
      exportValue
      expectedExports
      normalizedPci
      normalizedCog
      density
      productMarketShareGrowth
      globalMarketShare
      productMarketShare

      pciStd
      cogStd
      feasibilityStd
      strategyBalancedPortfolio
      strategyLongJump
      strategyLowHangingFruit
      strategyFrontier
    }
    ggCpyscList(year: $year, countryId: $countryId) {
      year
      countryId
      productId
      supplyChainId
      productRanking
    }
  }
`;

// DEPRECATED: Use GET_CLUSTER_COUNTRY_DATA instead for better performance
// This individual cluster query has been replaced by a batched version
export const GET_COUNTRY_CLUSTER_DATA = gql`
  query GetCountryClusterData($clusterId: Int!, $countryId: Int!, $year: Int!) {
    ggClusterCountryYearList(
      clusterId: $clusterId
      countryId: $countryId
      year: $year
    ) {
      clusterId
      countryId
      year
      pci
      cog
      density
      rca
    }
  }
`;

// Runtime warning for deprecated query usage
if (typeof window !== "undefined") {
  console.warn(
    "⚠️ GET_COUNTRY_CLUSTER_DATA is deprecated. Use GET_CLUSTER_COUNTRY_DATA for better performance.",
  );
}

export const GET_PRODUCT_MAPPINGS_FOR_SUPPLY_CHAIN = gql`
  query GetProductMappingsForSupplyChain($supplyChainId: Int!) {
    ggSupplyChainClusterProductMemberList(supplyChainId: $supplyChainId) {
      supplyChainId
      productId
      clusterId
    }
  }
`;

// Additional query for supply chain product mappings (comprehensive version)
export const GET_SUPPLY_CHAIN_PRODUCT_MAPPINGS = gql`
  query GetSupplyChainProductMappings {
    supplyChain0: ggSupplyChainClusterProductMemberList(supplyChainId: 0) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain1: ggSupplyChainClusterProductMemberList(supplyChainId: 1) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain2: ggSupplyChainClusterProductMemberList(supplyChainId: 2) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain3: ggSupplyChainClusterProductMemberList(supplyChainId: 3) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain4: ggSupplyChainClusterProductMemberList(supplyChainId: 4) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain5: ggSupplyChainClusterProductMemberList(supplyChainId: 5) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain6: ggSupplyChainClusterProductMemberList(supplyChainId: 6) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain7: ggSupplyChainClusterProductMemberList(supplyChainId: 7) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain8: ggSupplyChainClusterProductMemberList(supplyChainId: 8) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain9: ggSupplyChainClusterProductMemberList(supplyChainId: 9) {
      supplyChainId
      productId
      clusterId
    }
  }
`;

export const GET_COUNTRY_YEAR_METRICS = gql`
  query GetCountryYearMetrics($year: Int!, $countryId: Int!) {
    ggCountryYearList(year: $year, countryId: $countryId) {
      countryId
      year
      coiGreen
      lntotnetnrexpPc
      lnypc
      xResid
      policyRecommendation
    }
  }
`;

// Optimized query to fetch all countries' metrics in a single request
// Note: Backend resolver needs to be updated to make countryId optional
// Once updated, this will reduce N individual requests to 1 batch request
export const GET_ALL_COUNTRIES_YEAR_METRICS = gql`
  query GetAllCountriesYearMetrics($year: Int!) {
    ggCountryYearList(year: $year) {
      countryId
      year
      coiGreen
      lntotnetnrexpPc
      lnypc
      xResid
      policyRecommendation
      __typename
    }
  }
`;

import { gql } from "@apollo/client";

// Shared GraphQL queries used across multiple components
// Using comprehensive versions for maximum caching efficiency - overfetching is OK for better cache reuse

export const GET_COUNTRIES = gql`
  query GetCountries {
    gpLocationCountryList {
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
    gpProductList {
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
    gpClusterList {
      clusterId
      clusterName
    }
  }
`;

// OPTIMIZED: Batched cluster data query using GraphQL aliases
// Fetches ALL clusters (1-34) in one request instead of N individual requests
export const GET_CLUSTER_COUNTRY_DATA = gql`
  query GetClusterCountryData($year: Int!, $countryId: Int!) {
    cluster1: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster2: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster3: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster4: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster5: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster6: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster7: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster8: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster9: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster10: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster11: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster12: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster13: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster14: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster15: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster16: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster17: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster18: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster19: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster20: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster21: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster22: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster23: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster24: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster25: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster26: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster27: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster28: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster29: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster30: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster31: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster32: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster33: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
    cluster34: gpClusterCountryYearList(
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
      exportRcaCluster
      countryShareCluster
      worldShareCluster
      countryWorldShareCluster
    }
  }
`;

export const GET_SUPPLY_CHAINS = gql`
  query GetSupplyChains {
    gpSupplyChainList {
      supplyChainId
      supplyChain
    }
  }
`;

export const GET_COUNTRY_PRODUCT_DATA = gql`
  query GetCountryProductData($year: Int!, $countryId: Int!) {
    gpCpyList(year: $year, countryId: $countryId) {
      year
      countryId
      productId
      exportRca
      exportValue
      expectedExports
      normalizedPci
      normalizedCog
      density
      worldShareProductRelativepct
      worldShareProduct
      worldShareProductPctpointChange

      pciStd
      cogStd
      feasibilityStd
      strategyBalancedPortfolio
      strategyLongJump
      strategyLowHangingFruit
      strategyFrontier
    }
    gpCpyscList(year: $year, countryId: $countryId) {
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
// Note: GET_COUNTRY_CLUSTER_DATA has been removed in favor of GET_CLUSTER_COUNTRY_DATA for better performance

export const GET_PRODUCT_MAPPINGS_FOR_SUPPLY_CHAIN = gql`
  query GetProductMappingsForSupplyChain($supplyChainId: Int!) {
    gpSupplyChainClusterProductMemberList(supplyChainId: $supplyChainId) {
      supplyChainId
      productId
      clusterId
    }
  }
`;

// Additional query for supply chain product mappings (comprehensive version)
export const GET_SUPPLY_CHAIN_PRODUCT_MAPPINGS = gql`
  query GetSupplyChainProductMappings {
    supplyChain0: gpSupplyChainClusterProductMemberList(supplyChainId: 0) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain1: gpSupplyChainClusterProductMemberList(supplyChainId: 1) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain2: gpSupplyChainClusterProductMemberList(supplyChainId: 2) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain3: gpSupplyChainClusterProductMemberList(supplyChainId: 3) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain4: gpSupplyChainClusterProductMemberList(supplyChainId: 4) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain5: gpSupplyChainClusterProductMemberList(supplyChainId: 5) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain6: gpSupplyChainClusterProductMemberList(supplyChainId: 6) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain7: gpSupplyChainClusterProductMemberList(supplyChainId: 7) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain8: gpSupplyChainClusterProductMemberList(supplyChainId: 8) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain9: gpSupplyChainClusterProductMemberList(supplyChainId: 9) {
      supplyChainId
      productId
      clusterId
    }
  }
`;

export const GET_COUNTRY_YEAR_METRICS = gql`
  query GetCountryYearMetrics($year: Int!, $countryId: Int!) {
    gpCountryYearList(year: $year, countryId: $countryId) {
      countryId
      year
      coiGreen
      lntotnetnrexpPc
      lnypc
      xResid
      policyRecommendation
      rank
      rankingMetric
    }
  }
`;

// Optimized query to fetch all countries' metrics in a single request
// Note: Backend resolver needs to be updated to make countryId optional
// Once updated, this will reduce N individual requests to 1 batch request
export const GET_ALL_COUNTRIES_YEAR_METRICS = gql`
  query GetAllCountriesYearMetrics($year: Int!) {
    gpCountryYearList(year: $year) {
      countryId
      year
      coiGreen
      lntotnetnrexpPc
      lnypc
      xResid
      policyRecommendation
      rank
      rankingMetric
      __typename
    }
  }
`;

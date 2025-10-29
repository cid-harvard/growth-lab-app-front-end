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

// OPTIMIZED: Single query to fetch ALL cluster data at once
// Now that clusterId is optional, we can fetch all clusters in one request without aliases
export const GET_CLUSTER_COUNTRY_DATA = gql`
  query GetClusterCountryData($year: Int!, $countryId: Int!) {
    gpClusterCountryYearList(countryId: $countryId, year: $year) {
      clusterId
      countryId
      year
      pci
      cog
      density
      exportValue
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
      countryWorldShareProduct

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

// OPTIMIZED: Fetch all supply chain product mappings at once
// supplyChainId is now optional, allowing us to fetch all mappings in one query
export const GET_ALL_PRODUCT_MAPPINGS = gql`
  query GetAllProductMappings {
    gpSupplyChainClusterProductMemberList {
      supplyChainId
      productId
      clusterId
    }
  }
`;

// Individual query kept for backward compatibility if needed
export const GET_PRODUCT_MAPPINGS_FOR_SUPPLY_CHAIN = gql`
  query GetProductMappingsForSupplyChain($supplyChainId: Int!) {
    gpSupplyChainClusterProductMemberList(supplyChainId: $supplyChainId) {
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

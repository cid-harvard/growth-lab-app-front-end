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
      feasibility
      effectiveNumberOfExporters
      marketGrowth
      pciStd
      cogStd
      feasibilityStd
      pciCogFeasibilityComposite
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
    }
  }
`;

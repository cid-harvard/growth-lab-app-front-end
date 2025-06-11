import { gql } from "@apollo/client";

// Re-export shared comprehensive queries for maximum caching efficiency
export {
  GET_COUNTRIES,
  GET_PRODUCTS,
  GET_CLUSTERS,
  GET_SUPPLY_CHAINS,
  GET_PRODUCT_MAPPINGS_FOR_SUPPLY_CHAIN,
  GET_COUNTRY_PRODUCT_DATA,
  GET_COUNTRY_CLUSTER_DATA,
} from "../../../queries/shared";

// SankeyTree-specific queries that are not shared
export const GET_ALL_CLUSTERS = gql`
  query GetAllClusters {
    ggClusterList {
      clusterId
    }
  }
`;

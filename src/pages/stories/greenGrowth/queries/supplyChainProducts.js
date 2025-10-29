import { useQuery } from "@apollo/client";
import { group } from "d3";
import { GET_ALL_PRODUCT_MAPPINGS } from "./shared";

// Re-export the shared query for backward compatibility
export const GG_SUPPLY_CHAIN_PRODUCT_MEMBER_LIST_QUERY = GET_ALL_PRODUCT_MAPPINGS;

export const useSupplyChainProductLookup = () => {
  // OPTIMIZED: Use new query that fetches all mappings at once (supplyChainId is now optional)
  const { data } = useQuery(GET_ALL_PRODUCT_MAPPINGS);

  // Data is now returned directly as an array, no need to combine aliases
  const allData = data?.gpSupplyChainClusterProductMemberList || [];

  return group(allData, (d) => d.productId);
};

export const useClusterToSupplyChains = () => {
  // OPTIMIZED: Use new query that fetches all mappings at once (supplyChainId is now optional)
  const { data } = useQuery(GET_ALL_PRODUCT_MAPPINGS);

  // Data is now returned directly as an array, no need to combine aliases
  const allData = data?.gpSupplyChainClusterProductMemberList || [];

  // Returns a Map: clusterId -> array of { supplyChainId, productId, clusterId }
  return group(allData, (d) => d.clusterId);
};

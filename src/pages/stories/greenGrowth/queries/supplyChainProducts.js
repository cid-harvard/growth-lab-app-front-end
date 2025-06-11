import { useQuery } from "@apollo/react-hooks";
import { group } from "d3";
import { GET_SUPPLY_CHAIN_PRODUCT_MAPPINGS } from "./shared";

// Re-export the shared query for backward compatibility
export const GG_SUPPLY_CHAIN_PRODUCT_MEMBER_LIST_QUERY =
  GET_SUPPLY_CHAIN_PRODUCT_MAPPINGS;

export const useSupplyChainProductLookup = () => {
  const { data } = useQuery(GET_SUPPLY_CHAIN_PRODUCT_MAPPINGS);

  // Combine all supply chain data into a single array
  const allData = [];
  if (data) {
    for (let i = 0; i <= 9; i++) {
      const supplyChainData = data[`supplyChain${i}`] || [];
      allData.push(...supplyChainData);
    }
  }

  return group(allData, (d) => d.productId);
};

export const useClusterToSupplyChains = () => {
  const { data } = useQuery(GET_SUPPLY_CHAIN_PRODUCT_MAPPINGS);

  // Combine all supply chain data into a single array
  const allData = [];
  if (data) {
    for (let i = 0; i <= 9; i++) {
      const supplyChainData = data[`supplyChain${i}`] || [];
      allData.push(...supplyChainData);
    }
  }

  // Returns a Map: clusterId -> array of { supplyChainId, productId, clusterId }
  return group(allData, (d) => d.clusterId);
};

import { useQuery } from "@apollo/client";
import { index } from "d3";
import { GET_SUPPLY_CHAINS } from "./shared";

// Re-export the shared query for backward compatibility
export const GET_ALL_SUPPLY_CHAIN_DETAILS = GET_SUPPLY_CHAINS;

export const useSupplyChainLookup = () => {
  const { data } = useQuery(GET_SUPPLY_CHAINS);
  return index(data?.gpSupplyChainList || [], (d) => d.supplyChainId);
};

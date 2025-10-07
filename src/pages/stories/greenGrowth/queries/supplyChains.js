import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { index } from "d3";

export const GET_ALL_SUPPLY_CHAIN_DETAILS = gql`
  query GetAllSupplyChainDetails {
    ggSupplyChainList {
      supplyChainId
      supplyChain
    }
  }
`;

export const useSupplyChainLookup = () => {
  const { data } = useQuery(GET_ALL_SUPPLY_CHAIN_DETAILS);
  return index(data?.ggSupplyChainList || [], (d) => d.supplyChainId);
};

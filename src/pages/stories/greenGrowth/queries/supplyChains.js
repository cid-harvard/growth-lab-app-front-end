import { gql } from "@apollo/client";
import { useQuery } from "@apollo/react-hooks";
import { index } from "d3";

export const GET_ALL_SUPPLY_CHAIN_DETAILS = gql`
  query GetAllSupplyChainDetails {
    ggSupplyChainList {
      supplyChainId
      supplyChain
      id
    }
  }
`;

export const useSupplyChainLookup = () => {
  const { data } = useQuery(GET_ALL_SUPPLY_CHAIN_DETAILS);
  return index(data?.ggSupplyChainList || [], (d) => d.supplyChainId);
};

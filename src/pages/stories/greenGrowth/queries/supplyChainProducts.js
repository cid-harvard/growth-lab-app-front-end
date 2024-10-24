import { gql } from "@apollo/client";
import { useQuery } from "@apollo/react-hooks";
import { group } from "d3";

export const GG_SUPPLY_CHAIN_PRODUCT_MEMBER_LIST_QUERY = gql`
  query ggSupplyChainProductMemberList {
    ggSupplyChainProductMemberList {
      supplyChainId
      productId
    }
  }
`;
export const useSupplyChainProductLookup = () => {
  const { data } = useQuery(GG_SUPPLY_CHAIN_PRODUCT_MEMBER_LIST_QUERY);
  return group(data?.ggSupplyChainProductMemberList || [], (d) => d.productId);
};

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/react-hooks";
import { group } from "d3";

export const GG_SUPPLY_CHAIN_PRODUCT_MEMBER_LIST_QUERY = gql`
  query ggSupplyChainClusterProductMemberList {
    ggSupplyChainClusterProductMemberList {
      supplyChainId
      productId
      clusterId
    }
  }
`;
export const useSupplyChainProductLookup = () => {
  const { data } = useQuery(GG_SUPPLY_CHAIN_PRODUCT_MEMBER_LIST_QUERY);
  return group(
    data?.ggSupplyChainClusterProductMemberList || [],
    (d) => d.productId,
  );
};

export const useClusterToSupplyChains = () => {
  const { data } = useQuery(GG_SUPPLY_CHAIN_PRODUCT_MEMBER_LIST_QUERY);
  // Returns a Map: clusterId -> array of { supplyChainId, productId, clusterId }
  return group(
    data?.ggSupplyChainClusterProductMemberList || [],
    (d) => d.clusterId,
  );
};

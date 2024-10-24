import { gql } from "@apollo/client";
import { useQuery } from "@apollo/react-hooks";
import { index } from "d3";

export const GG_PRODUCT_LIST_QUERY = gql`
  query ggProductList {
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

export const useProductLookup = () => {
  const { data } = useQuery(GG_PRODUCT_LIST_QUERY);
  const lookup = index(data?.ggProductList || [], (d) => d.productId);
  return lookup;
};

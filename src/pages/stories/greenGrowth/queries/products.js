import { useQuery } from "@apollo/react-hooks";
import { index } from "d3";
import { useMemo } from "react";
import { GET_PRODUCTS } from "./shared";

// Re-export the shared query for backward compatibility
export const GG_PRODUCT_LIST_QUERY = GET_PRODUCTS;

export const useProductLookup = () => {
  const { data } = useQuery(GET_PRODUCTS);
  const lookup = useMemo(
    () => index(data?.gpProductList || [], (d) => d.productId),
    [data?.gpProductList],
  );
  return lookup;
};

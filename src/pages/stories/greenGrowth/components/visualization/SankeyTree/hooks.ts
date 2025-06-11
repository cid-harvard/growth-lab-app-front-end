import { useState, useEffect, useMemo } from "react";
import { useApolloClient } from "@apollo/client";
import {
  ProductMapping,
  SupplyChain,
  CountryClusterData,
  CountryProductData,
  ProductClusterRow,
  Product,
} from "./types";
import {
  GET_PRODUCT_MAPPINGS_FOR_SUPPLY_CHAIN,
  GET_ALL_CLUSTERS,
  GET_COUNTRY_CLUSTER_DATA,
  GET_COUNTRY_PRODUCT_DATA,
} from "./queries";

// Hook for fetching product mappings
export function useProductMappings(supplyChainsData: any) {
  const [productMappings, setProductMappings] = useState<ProductMapping[]>([]);
  const client = useApolloClient();

  useEffect(() => {
    const fetchProductMappings = async () => {
      if (!supplyChainsData?.ggSupplyChainList) return;

      try {
        const supplyChains = supplyChainsData.ggSupplyChainList;

        const mappingPromises = supplyChains.map((sc: SupplyChain) =>
          client.query({
            query: GET_PRODUCT_MAPPINGS_FOR_SUPPLY_CHAIN,
            variables: { supplyChainId: sc.supplyChainId },
          }),
        );

        const mappingResponses = await Promise.all(mappingPromises);
        const allMappings = mappingResponses.flatMap(
          (res) => res.data.ggSupplyChainClusterProductMemberList || [],
        );

        setProductMappings(allMappings);
      } catch (error) {
        console.error("Error fetching product mappings:", error);
      }
    };

    fetchProductMappings();
  }, [supplyChainsData, client]);

  return productMappings;
}

// Hook for fetching country data
export function useCountryData(countrySelection: number | null) {
  const [countryData, setCountryData] = useState<{
    clusterData: CountryClusterData[];
    productData: CountryProductData[];
  }>({ clusterData: [], productData: [] });
  const [isCountryDataLoading, setIsCountryDataLoading] = useState(false);
  const client = useApolloClient();

  useEffect(() => {
    if (countrySelection === null) {
      setCountryData({ clusterData: [], productData: [] });
      return;
    }

    const loadData = async () => {
      setIsCountryDataLoading(true);
      try {
        // Load country cluster data
        const clusterResponse = await client.query({
          query: GET_ALL_CLUSTERS,
        });

        const clusters = clusterResponse.data.ggClusterList || [];
        const clusterData: CountryClusterData[] = [];

        // For each cluster, get country-specific data
        for (const cluster of clusters) {
          try {
            const clusterCountryResponse = await client.query({
              query: GET_COUNTRY_CLUSTER_DATA,
              variables: {
                clusterId: cluster.clusterId,
                countryId: countrySelection,
                year: 2021,
              },
            });

            if (
              clusterCountryResponse.data.ggClusterCountryYearList?.length > 0
            ) {
              clusterData.push(
                ...clusterCountryResponse.data.ggClusterCountryYearList,
              );
            }
          } catch (err) {
            console.error(
              `Error loading data for cluster ${cluster.clusterId}:`,
              err,
            );
          }
        }

        // Load country product data
        const productResponse = await client.query({
          query: GET_COUNTRY_PRODUCT_DATA,
          variables: { year: 2021, countryId: countrySelection },
        });

        const productData = productResponse.data.ggCpyList || [];

        setCountryData({ clusterData, productData });
      } catch (error) {
        console.error("Error loading country data:", error);
      } finally {
        setIsCountryDataLoading(false);
      }
    };

    loadData();
  }, [countrySelection, client]);

  return { countryData, isCountryDataLoading };
}

// Hook for building product cluster rows
export function useProductClusterRows(
  productsData: any,
  clustersData: any,
  supplyChainsData: any,
  productMappings: ProductMapping[],
): ProductClusterRow[] {
  return useMemo((): ProductClusterRow[] => {
    if (
      !productsData ||
      !clustersData ||
      !supplyChainsData ||
      !productMappings.length
    ) {
      return [];
    }

    const products = productsData.ggProductList;
    const clusters = clustersData.ggClusterList;
    const supplyChains = supplyChainsData.ggSupplyChainList;

    // Create lookup maps
    const clusterMap = new Map(
      clusters.map((c: any) => [c.clusterId, c.clusterName]),
    );
    const supplyChainMap = new Map(
      supplyChains.map((sc: any) => [sc.supplyChainId, sc.supplyChain]),
    );
    const mappingMap = new Map();

    for (const mapping of productMappings) {
      mappingMap.set(mapping.productId, {
        clusterId: mapping.clusterId,
        supplyChainId: mapping.supplyChainId,
      });
    }

    return products
      .map((product: Product) => {
        const mapping = mappingMap.get(product.productId) || {
          clusterId: 0,
          supplyChainId: 0,
        };

        return {
          HS2012_4dg: product.code,
          dominant_cluster: mapping.clusterId,
          supply_chain: supplyChainMap.get(mapping.supplyChainId) || "Unknown",
          cluster_name: clusterMap.get(mapping.clusterId) || "Unknown",
          product_id: product.productId,
          name_short_en: product.nameShortEn,
          product_level: product.productLevel,
        };
      })
      .filter(
        (row: ProductClusterRow) =>
          row.supply_chain !== "Unknown" && row.cluster_name !== "Unknown",
      );
  }, [productsData, clustersData, supplyChainsData, productMappings]);
}

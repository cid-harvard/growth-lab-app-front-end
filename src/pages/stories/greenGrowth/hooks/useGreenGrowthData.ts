import { useState, useEffect, useMemo } from "react";
import { useQuery, useApolloClient, gql } from "@apollo/client";
import {
  GET_PRODUCTS,
  GET_CLUSTERS,
  GET_SUPPLY_CHAINS,
  GET_COUNTRY_PRODUCT_DATA,
  GET_COUNTRY_CLUSTER_DATA,
  GET_PRODUCT_MAPPINGS_FOR_SUPPLY_CHAIN,
} from "../queries/shared";
import {
  ProductMapping,
  SupplyChain,
  CountryClusterData,
  ProductClusterRow,
  Product,
} from "../types";

// GET_ALL_CLUSTERS query specific to this hook
const GET_ALL_CLUSTERS = gql`
  query GetAllClusters {
    ggClusterList {
      clusterId
    }
  }
`;

/**
 * Centralized data loading hook for the Green Growth app
 * Integrates SankeyTree data loading with shared app data
 */
export const useGreenGrowthData = (countrySelection: number | null) => {
  const client = useApolloClient();

  // Shared GraphQL queries - these are used across multiple components
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery(GET_PRODUCTS);
  const {
    data: clustersData,
    loading: clustersLoading,
    error: clustersError,
  } = useQuery(GET_CLUSTERS);
  const {
    data: supplyChainsData,
    loading: supplyChainsLoading,
    error: supplyChainsError,
  } = useQuery(GET_SUPPLY_CHAINS);

  // Country-specific data queries (conditional loading)
  const {
    data: countryProductData,
    loading: countryProductLoading,
    error: countryProductError,
  } = useQuery(GET_COUNTRY_PRODUCT_DATA, {
    variables: { year: 2021, countryId: countrySelection },
    skip: countrySelection === null,
  });

  const {
    data: allClustersData,
    loading: allClustersLoading,
    error: allClustersError,
  } = useQuery(GET_ALL_CLUSTERS, {
    skip: countrySelection === null,
  });

  // State for SankeyTree-specific data
  const [productMappings, setProductMappings] = useState<ProductMapping[]>([]);
  const [countryClusterData, setCountryClusterData] = useState<
    CountryClusterData[]
  >([]);
  const [productMappingsLoading, setProductMappingsLoading] = useState(false);
  const [countryClusterLoading, setCountryClusterLoading] = useState(false);

  // Fetch product mappings when supply chains data is available
  useEffect(() => {
    const fetchProductMappings = async () => {
      if (!supplyChainsData?.ggSupplyChainList) return;

      setProductMappingsLoading(true);
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
      } finally {
        setProductMappingsLoading(false);
      }
    };

    fetchProductMappings();
  }, [supplyChainsData, client]);

  // Fetch country cluster data for all clusters (batched and optimized)
  useEffect(() => {
    if (!allClustersData?.ggClusterList || countrySelection === null) {
      setCountryClusterData([]);
      return;
    }

    const loadCountryClusterData = async () => {
      setCountryClusterLoading(true);
      try {
        const clusters = allClustersData.ggClusterList;

        // Batch requests with Promise.allSettled to handle failures gracefully
        const clusterRequests = clusters.map((cluster: any) =>
          client
            .query({
              query: GET_COUNTRY_CLUSTER_DATA,
              variables: {
                clusterId: cluster.clusterId,
                countryId: countrySelection,
                year: 2021,
              },
            })
            .catch((err) => {
              console.warn(
                `Failed to load data for cluster ${cluster.clusterId}:`,
                err,
              );
              return null;
            }),
        );

        const clusterResponses = await Promise.allSettled(clusterRequests);

        const clusterData: CountryClusterData[] = [];
        clusterResponses.forEach((response) => {
          if (
            response.status === "fulfilled" &&
            response.value?.data.ggClusterCountryYearList?.length > 0
          ) {
            clusterData.push(...response.value.data.ggClusterCountryYearList);
          }
        });

        setCountryClusterData(clusterData);
      } catch (error) {
        console.error("Error loading country cluster data:", error);
        setCountryClusterData([]);
      } finally {
        setCountryClusterLoading(false);
      }
    };

    loadCountryClusterData();
  }, [allClustersData, countrySelection, client]);

  // Build product cluster rows (SankeyTree-specific derived data)
  const productClusterRows = useMemo((): ProductClusterRow[] => {
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

  // Combine country data from different sources
  const countryData = useMemo(
    () => ({
      clusterData: countryClusterData,
      productData: countryProductData?.ggCpyList || [],
    }),
    [countryClusterData, countryProductData],
  );

  // Calculate overall loading state (includes country data loading)
  const isLoading =
    productsLoading ||
    clustersLoading ||
    supplyChainsLoading ||
    productMappingsLoading ||
    countryProductLoading ||
    allClustersLoading ||
    countryClusterLoading;

  const isCountryDataLoading =
    countryProductLoading || allClustersLoading || countryClusterLoading;

  const hasErrors =
    productsError ||
    clustersError ||
    supplyChainsError ||
    countryProductError ||
    allClustersError;

  return {
    // Raw GraphQL data (can be used by other components)
    productsData,
    clustersData,
    supplyChainsData,

    // SankeyTree-specific processed data
    productMappings,
    countryData,
    productClusterRows,

    // Loading states
    isLoading,
    isCountryDataLoading,
    productsLoading,
    clustersLoading,
    supplyChainsLoading,
    productMappingsLoading,
    countryProductLoading,
    allClustersLoading,
    countryClusterLoading,

    // Error states
    hasErrors,
    productsError,
    clustersError,
    supplyChainsError,
    countryProductError,
    allClustersError,
  };
};

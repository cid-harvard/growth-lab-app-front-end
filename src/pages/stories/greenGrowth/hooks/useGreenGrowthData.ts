import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useApolloClient, gql } from "@apollo/client";
import {
  GET_PRODUCTS,
  GET_CLUSTERS,
  GET_SUPPLY_CHAINS,
  GET_COUNTRY_PRODUCT_DATA,
  // Note: Using GET_CLUSTER_COUNTRY_DATA for optimized batched cluster queries
  GET_CLUSTER_COUNTRY_DATA, // OPTIMIZED: Batched cluster query
  GET_PRODUCT_MAPPINGS_FOR_SUPPLY_CHAIN,
  GET_COUNTRY_YEAR_METRICS,
  GET_ALL_COUNTRIES_YEAR_METRICS,
  GET_COUNTRIES,
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
    gpClusterList {
      clusterId
    }
  }
`;

// Enhanced type for country year metrics
interface CountryYearMetrics {
  countryId: number;
  year: number;
  coiGreen: number;
  lntotnetnrexpPc: number;
  lnypc: number;
  xResid: number;
  policyRecommendation?: string;
  rank?: number | null;
  rankingMetric?: string | null; // API returns this as a string
  // Include country info for convenience
  nameEn?: string;
  nameShortEn?: string;
  iso3Code?: string;
}

/**
 * Centralized data loading hook for the Green Growth app
 * Integrates all visualization data loading with shared app data
 * Uses Apollo Client's previousData for smooth country transitions
 *
 * @param countrySelection - Selected country ID
 * @param selectedYear - Selected year for analysis
 * @param fetchAllCountriesMetrics - Whether to fetch metrics for all countries (for StrategicPositionChart)
 * @returns {Object} Hook return object with loadable data and loading states
 *
 * Loading States:
 * - isLoading: Only true when no usable data is available (initial load)
 * - isCountryDataLoading: True when country-specific data is loading (but previous data is shown)
 * - isInitialLoading: True only on first load when no previous data exists
 * - hasPreviousData: True when previous country data is available as fallback
 *
 * Usage Pattern:
 * ```tsx
 * const {
 *   countryData,
 *   productClusterRows,
 *   allCountriesMetrics,
 *   isLoading,
 *   isCountryDataLoading,
 *   hasPreviousData
 * } = useGreenGrowthData(countryId, selectedYear, true);
 *
 * // Show full loading screen only on initial load
 * if (isLoading && !hasPreviousData) {
 *   return <LoadingScreen />;
 * }
 *
 * // Show subtle loading indicator when updating with previous data fallback
 * const showSubtleLoader = isCountryDataLoading && hasPreviousData;
 * ```
 */
export const useGreenGrowthData = (
  countrySelection: number | null,
  selectedYear: number = 2021,
  fetchAllCountriesMetrics: boolean = false,
) => {
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

  // Countries data for country metrics lookup
  const {
    data: countriesData,
    loading: countriesLoading,
    error: countriesError,
  } = useQuery(GET_COUNTRIES, {
    skip: !fetchAllCountriesMetrics,
  });

  // Country-specific data queries with previousData pattern
  const {
    data: countryProductData,
    previousData: previousCountryProductData,
    loading: countryProductLoading,
    error: countryProductError,
  } = useQuery(GET_COUNTRY_PRODUCT_DATA, {
    variables: { year: selectedYear, countryId: countrySelection },
    skip: countrySelection === null,
    // Enable previousData to show previous country data while loading
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: allClustersData,
    previousData: previousAllClustersData,
    loading: allClustersLoading,
    error: allClustersError,
  } = useQuery(GET_ALL_CLUSTERS, {
    skip: countrySelection === null,
    // Enable previousData for clusters as well
    notifyOnNetworkStatusChange: true,
  });

  // Use current data or fallback to previous data for smooth transitions
  const currentCountryProductData =
    countryProductData || previousCountryProductData;

  // State for SankeyTree-specific data with previous data tracking
  const [productMappings, setProductMappings] = useState<ProductMapping[]>([]);
  const [previousProductMappings, setPreviousProductMappings] = useState<
    ProductMapping[]
  >([]);
  const [countryClusterData, setCountryClusterData] = useState<
    CountryClusterData[]
  >([]);
  const [previousCountryClusterData, setPreviousCountryClusterData] = useState<
    CountryClusterData[]
  >([]);

  // State for all countries metrics (for StrategicPositionChart)
  const [allCountriesMetrics, setAllCountriesMetrics] = useState<
    CountryYearMetrics[]
  >([]);
  const [previousAllCountriesMetrics, setPreviousAllCountriesMetrics] =
    useState<CountryYearMetrics[]>([]);

  const [productMappingsLoading, setProductMappingsLoading] = useState(false);
  const [countryClusterLoading, setCountryClusterLoading] = useState(false);
  const [allCountriesMetricsLoading, setAllCountriesMetricsLoading] =
    useState(false);

  // Track the current country selection to detect changes
  const previousCountrySelection = useRef<number | null>(null);
  const previousSelectedYear = useRef<number>(selectedYear);
  const isCountryChanging =
    previousCountrySelection.current !== countrySelection;
  const isYearChanging = previousSelectedYear.current !== selectedYear;

  // Update previous selection refs
  useEffect(() => {
    if (previousCountrySelection.current !== countrySelection) {
      previousCountrySelection.current = countrySelection;
    }
    if (previousSelectedYear.current !== selectedYear) {
      previousSelectedYear.current = selectedYear;
    }
  }, [countrySelection, selectedYear]);

  // Fetch product mappings when supply chains data is available
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchProductMappings = async () => {
      if (!supplyChainsData?.gpSupplyChainList) return;

      // Store previous mappings before starting new fetch
      if (productMappings.length > 0 && isCountryChanging) {
        setPreviousProductMappings(productMappings);
      }

      setProductMappingsLoading(true);
      try {
        const supplyChains = supplyChainsData.gpSupplyChainList;

        const mappingPromises = supplyChains.map((sc: SupplyChain) =>
          client.query({
            query: GET_PRODUCT_MAPPINGS_FOR_SUPPLY_CHAIN,
            variables: { supplyChainId: sc.supplyChainId },
          }),
        );

        const mappingResponses = await Promise.all(mappingPromises);
        const allMappings = mappingResponses.flatMap(
          (res) => res.data.gpSupplyChainClusterProductMemberList || [],
        );

        setProductMappings(allMappings);
      } catch (error) {
        console.error("Error fetching product mappings:", error);
      } finally {
        setProductMappingsLoading(false);
      }
    };

    fetchProductMappings();
  }, [supplyChainsData, client]); // Simplified deps to avoid infinite loops

  // Fetch country cluster data for all clusters (OPTIMIZED: single batched request)
  // PERFORMANCE: Reduced from ~6 individual requests to 1 batched GraphQL query using aliases
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (countrySelection === null) {
      // Don't clear data immediately to maintain previous data during transitions
      if (!countryClusterLoading) {
        setCountryClusterData([]);
      }
      return;
    }

    const loadCountryClusterData = async () => {
      // Store previous cluster data before starting new fetch
      if (countryClusterData.length > 0 && isCountryChanging) {
        setPreviousCountryClusterData(countryClusterData);
      }

      setCountryClusterLoading(true);
      try {
        // OPTIMIZATION: Use single batched request instead of N individual requests
        const { data } = await client.query({
          query: GET_CLUSTER_COUNTRY_DATA,
          variables: {
            countryId: countrySelection,
            year: selectedYear,
          },
        });

        // Process the aliased response structure
        const clusterData: CountryClusterData[] = [];

        // Extract data from each cluster alias (cluster0, cluster1, cluster2, etc.)
        Object.keys(data).forEach((clusterKey) => {
          const clusterResults = data[clusterKey];
          if (clusterResults && clusterResults.length > 0) {
            clusterData.push(...clusterResults);
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
  }, [countrySelection, selectedYear, client, isCountryChanging]); // Optimized to remove unnecessary dependencies

  // Fetch all countries metrics when needed (for StrategicPositionChart)
  // OPTIMIZATION: Uses a single GraphQL request instead of N individual requests
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!fetchAllCountriesMetrics || !countriesData?.gpLocationCountryList) {
      return;
    }

    const fetchAllCountryMetrics = async () => {
      // Store previous metrics before starting new fetch
      if (
        allCountriesMetrics.length > 0 &&
        (isCountryChanging || isYearChanging)
      ) {
        setPreviousAllCountriesMetrics(allCountriesMetrics);
      }

      setAllCountriesMetricsLoading(true);
      try {
        const countries = countriesData.gpLocationCountryList;

        // Create a lookup map for country metadata
        const countryLookupMap = new Map(
          countries.map((country: any) => [country.countryId, country]),
        );

        // Optimized: Try to fetch all countries' data in a single request
        // Falls back to individual requests if backend doesn't support it yet
        let allMetrics: any[] = [];

        try {
          const { data } = await client.query({
            query: GET_ALL_COUNTRIES_YEAR_METRICS,
            variables: {
              year: selectedYear,
            },
          });
          allMetrics = data.gpCountryYearList || [];
        } catch (singleQueryError: any) {
          // Fallback: If single query fails, use individual requests
          if (
            singleQueryError.message?.includes(
              "missing 1 required positional argument",
            )
          ) {
            console.info(
              "Using fallback individual requests - backend will be updated to support bulk fetch",
            );

            const promises = countries.map(async (country: any) => {
              try {
                const { data } = await client.query({
                  query: GET_COUNTRY_YEAR_METRICS,
                  variables: {
                    year: selectedYear,
                    countryId: country.countryId,
                  },
                });
                return data.gpCountryYearList?.[0] || null;
              } catch (err) {
                // Silently skip countries without data
                console.warn(
                  `No data for country ${country.countryId}:`,
                  (err as Error).message,
                );
                return null;
              }
            });

            const results = await Promise.all(promises);
            allMetrics = results.filter(Boolean);
          } else {
            throw singleQueryError;
          }
        }

        // Process and enrich the results with country metadata
        const validResults = allMetrics
          .map((metrics: any) => {
            const country = countryLookupMap.get(metrics.countryId);
            if (
              country &&
              metrics.coiGreen !== null &&
              metrics.xResid !== null
            ) {
              return {
                ...metrics,
                nameEn: (country as any).nameEn,
                nameShortEn: (country as any).nameShortEn,
                iso3Code: (country as any).iso3Code,
              };
            }
            return null;
          })
          .filter(Boolean)
          .filter(
            (d: any) =>
              d.nameEn &&
              !isNaN(d.coiGreen) &&
              !isNaN(d.xResid) &&
              d.coiGreen !== null &&
              d.xResid !== null,
          ) as CountryYearMetrics[];

        setAllCountriesMetrics(validResults);
      } catch (error) {
        console.error("Error fetching all countries metrics:", error);
        setAllCountriesMetrics([]);
      } finally {
        setAllCountriesMetricsLoading(false);
      }
    };

    fetchAllCountryMetrics();
  }, [
    countriesData,
    selectedYear,
    fetchAllCountriesMetrics,
    client,
    isCountryChanging,
    isYearChanging,
  ]);

  // Current mappings with fallback to previous when loading
  const currentProductMappings = useMemo(() => {
    if (
      productMappingsLoading &&
      isCountryChanging &&
      previousProductMappings.length > 0
    ) {
      return previousProductMappings;
    }
    return productMappings;
  }, [
    productMappings,
    previousProductMappings,
    productMappingsLoading,
    isCountryChanging,
  ]);

  // Current cluster data with fallback to previous when loading
  const currentCountryClusterData = useMemo(() => {
    if (
      countryClusterLoading &&
      isCountryChanging &&
      previousCountryClusterData.length > 0
    ) {
      return previousCountryClusterData;
    }
    return countryClusterData;
  }, [
    countryClusterData,
    previousCountryClusterData,
    countryClusterLoading,
    isCountryChanging,
  ]);

  // Current all countries metrics with fallback to previous when loading
  const currentAllCountriesMetrics = useMemo(() => {
    if (
      allCountriesMetricsLoading &&
      (isCountryChanging || isYearChanging) &&
      previousAllCountriesMetrics.length > 0
    ) {
      return previousAllCountriesMetrics;
    }
    return allCountriesMetrics;
  }, [
    allCountriesMetrics,
    previousAllCountriesMetrics,
    allCountriesMetricsLoading,
    isCountryChanging,
    isYearChanging,
  ]);

  // Build product cluster rows (SankeyTree-specific derived data)
  const productClusterRows = useMemo((): ProductClusterRow[] => {
    if (
      !productsData ||
      !clustersData ||
      !supplyChainsData ||
      !currentProductMappings.length
    ) {
      return [];
    }

    const products = productsData.gpProductList;
    const clusters = clustersData.gpClusterList;
    const supplyChains = supplyChainsData.gpSupplyChainList;

    // Create lookup maps
    const clusterMap = new Map(
      clusters.map((c: any) => [c.clusterId, c.clusterName]),
    );
    const supplyChainMap = new Map(
      supplyChains.map((sc: any) => [sc.supplyChainId, sc.supplyChain]),
    );
    const mappingMap = new Map();

    for (const mapping of currentProductMappings) {
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
  }, [productsData, clustersData, supplyChainsData, currentProductMappings]);

  // Combine country data from different sources (using current data with fallbacks)
  const countryData = useMemo(
    () => ({
      clusterData: currentCountryClusterData,
      productData: currentCountryProductData?.gpCpyList || [],
      productSupplyChainData: currentCountryProductData?.gpCpyscList || [],
    }),
    [currentCountryClusterData, currentCountryProductData],
  );

  // Countries lookup for convenience
  const countryLookup = useMemo(() => {
    if (!countriesData?.gpLocationCountryList) return new Map();
    return new Map(
      countriesData.gpLocationCountryList.map((country: any) => [
        country.countryId,
        country,
      ]),
    );
  }, [countriesData]);

  // Calculate loading states - differentiate between initial loading and country switching
  // Only show loading when core GraphQL queries are actually loading AND we have no data
  const isCoreDataLoading =
    productsLoading || clustersLoading || supplyChainsLoading;
  const hasCoreData = !!(
    productsData?.gpProductList &&
    clustersData?.gpClusterList &&
    supplyChainsData?.gpSupplyChainList
  );

  // For country-specific data, only show loading if we have no current data AND no previous data
  const hasCountryData = !!(
    countryProductData?.gpCpyList || previousCountryProductData?.gpCpyList
  );

  const isInitialLoading =
    (isCoreDataLoading && !hasCoreData) ||
    (fetchAllCountriesMetrics &&
      countriesLoading &&
      !countriesData?.gpLocationCountryList) ||
    (countrySelection !== null &&
      (!hasCountryData || (!allClustersData && !previousAllClustersData))) ||
    (fetchAllCountriesMetrics &&
      allCountriesMetrics.length === 0 &&
      previousAllCountriesMetrics.length === 0 &&
      countriesData?.gpLocationCountryList?.length > 0);

  // Loading state specifically for country data changes (shows previous data)
  const isCountryDataLoading =
    countryProductLoading ||
    allClustersLoading ||
    countryClusterLoading ||
    allCountriesMetricsLoading;

  // Overall loading (true only when no usable data is available)
  // If we have cached core data, don't show loading even if derived data is still processing
  const isLoading = hasCoreData && hasCountryData ? false : isInitialLoading;

  const hasErrors =
    productsError ||
    clustersError ||
    supplyChainsError ||
    countryProductError ||
    allClustersError ||
    (fetchAllCountriesMetrics && countriesError);

  return {
    // Raw GraphQL data (can be used by other components)
    productsData,
    clustersData,
    supplyChainsData,
    countriesData,

    // SankeyTree-specific processed data (using current data with fallbacks)
    productMappings: currentProductMappings,
    countryData,
    productClusterRows,

    // All countries metrics for StrategicPositionChart
    allCountriesMetrics: currentAllCountriesMetrics,
    countryLookup,

    // Loading states
    isLoading, // Only true when no usable data is available
    isCountryDataLoading, // True when country-specific data is loading (but previous data shown)
    isInitialLoading, // True only on first load when no previous data exists
    productsLoading,
    clustersLoading,
    supplyChainsLoading,
    countriesLoading,
    productMappingsLoading,
    countryProductLoading,
    allClustersLoading,
    countryClusterLoading,
    allCountriesMetricsLoading,

    // Previous data availability (useful for UI indicators)
    hasPreviousData: !!(
      previousCountryProductData ||
      previousProductMappings.length > 0 ||
      previousCountryClusterData.length > 0 ||
      previousAllCountriesMetrics.length > 0
    ),

    // Error states
    hasErrors,
    productsError,
    clustersError,
    supplyChainsError,
    countryProductError,
    allClustersError,
    countriesError: fetchAllCountriesMetrics ? countriesError : null,
  };
};

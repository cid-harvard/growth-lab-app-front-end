import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  GET_PRODUCTS,
  GET_CLUSTERS,
  GET_SUPPLY_CHAINS,
  GET_COUNTRY_PRODUCT_DATA,
  GET_CLUSTER_COUNTRY_DATA,
  GET_ALL_PRODUCT_MAPPINGS,
  GET_ALL_COUNTRIES_YEAR_METRICS,
  GET_COUNTRIES,
} from "../queries/shared";
import {
  ProductMapping,
  CountryClusterData,
  ProductClusterRow,
  Product,
} from "../types";

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
  rankingMetric?: string | null;
  nameEn?: string;
  nameShortEn?: string;
  iso3Code?: string;
}

/**
 * REFACTORED: Centralized data loading hook for the Green Growth app
 * Now uses standard Apollo Client useQuery hooks throughout - no manual client.query() calls
 * Relies on Apollo's built-in caching and previousData instead of manual state management
 *
 * @param countrySelection - Selected country ID
 * @param selectedYear - Selected year for analysis
 * @param fetchAllCountriesMetrics - Whether to fetch metrics for all countries
 * @returns {Object} Hook return object with data and loading states
 */
export const useGreenGrowthData = (
  countrySelection: number | null,
  selectedYear: number = 2021,
  fetchAllCountriesMetrics: boolean = false,
) => {
  // Core data queries - all using standard useQuery
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

  // Countries data for metadata enrichment
  const {
    data: countriesData,
    loading: countriesLoading,
    error: countriesError,
  } = useQuery(GET_COUNTRIES, {
    skip: !fetchAllCountriesMetrics,
  });

  // Product mappings - now fetches all at once
  const {
    data: productMappingsData,
    loading: productMappingsLoading,
    error: productMappingsError,
  } = useQuery(GET_ALL_PRODUCT_MAPPINGS);

  // Country-specific data with Apollo's previousData for smooth transitions
  const {
    data: countryProductData,
    previousData: previousCountryProductData,
    loading: countryProductLoading,
    error: countryProductError,
  } = useQuery(GET_COUNTRY_PRODUCT_DATA, {
    variables: { year: selectedYear, countryId: countrySelection },
    skip: countrySelection === null,
    notifyOnNetworkStatusChange: true,
  });

  // Cluster country data - now fetches all clusters in one query
  const {
    data: clusterCountryData,
    previousData: previousClusterCountryData,
    loading: clusterCountryLoading,
    error: clusterCountryError,
  } = useQuery(GET_CLUSTER_COUNTRY_DATA, {
    variables: { year: selectedYear, countryId: countrySelection },
    skip: countrySelection === null,
    notifyOnNetworkStatusChange: true,
  });

  // All countries metrics (optional)
  const {
    data: allCountriesMetricsData,
    previousData: previousAllCountriesMetricsData,
    loading: allCountriesMetricsLoading,
    error: allCountriesMetricsError,
  } = useQuery(GET_ALL_COUNTRIES_YEAR_METRICS, {
    variables: { year: selectedYear },
    skip: !fetchAllCountriesMetrics,
    notifyOnNetworkStatusChange: true,
  });

  // Use current data or fall back to previous for smooth transitions
  const currentCountryProductData =
    countryProductData || previousCountryProductData;
  const currentClusterCountryData =
    clusterCountryData || previousClusterCountryData;
  const currentAllCountriesMetricsData =
    allCountriesMetricsData || previousAllCountriesMetricsData;

  // Process product mappings
  const productMappings: ProductMapping[] = useMemo(() => {
    return productMappingsData?.gpSupplyChainClusterProductMemberList || [];
  }, [productMappingsData]);

  // Process cluster country data
  const countryClusterDataArray: CountryClusterData[] = useMemo(() => {
    return currentClusterCountryData?.gpClusterCountryYearList || [];
  }, [currentClusterCountryData]);

  // Process all countries metrics with enrichment
  const allCountriesMetrics: CountryYearMetrics[] = useMemo(() => {
    if (
      !currentAllCountriesMetricsData?.gpCountryYearList ||
      !countriesData?.gpLocationCountryList
    ) {
      return [];
    }

    const countryLookup = new Map(
      countriesData.gpLocationCountryList.map((country: any) => [
        country.countryId,
        country,
      ]),
    );

    return currentAllCountriesMetricsData.gpCountryYearList
      .map((metrics: any) => {
        const country = countryLookup.get(metrics.countryId);
        if (!country || metrics.coiGreen === null || metrics.xResid === null) {
          return null;
        }

        return {
          ...metrics,
          nameEn: (country as any).nameEn,
          nameShortEn: (country as any).nameShortEn,
          iso3Code: (country as any).iso3Code,
        };
      })
      .filter(Boolean) as CountryYearMetrics[];
  }, [currentAllCountriesMetricsData, countriesData]);

  // Build product cluster rows (derived data for SankeyTree)
  const productClusterRows = useMemo((): ProductClusterRow[] => {
    if (
      !productsData?.gpProductList ||
      !clustersData?.gpClusterList ||
      !supplyChainsData?.gpSupplyChainList ||
      !productMappings.length
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

  // Combine country data
  const countryData = useMemo(
    () => ({
      clusterData: countryClusterDataArray,
      productData: currentCountryProductData?.gpCpyList || [],
      productSupplyChainData: currentCountryProductData?.gpCpyscList || [],
    }),
    [countryClusterDataArray, currentCountryProductData],
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

  // Calculate loading states
  const isCoreDataLoading =
    productsLoading || clustersLoading || supplyChainsLoading;
  const hasCoreData = !!(
    productsData?.gpProductList &&
    clustersData?.gpClusterList &&
    supplyChainsData?.gpSupplyChainList
  );

  const hasCountryData = !!(
    countryProductData?.gpCpyList || previousCountryProductData?.gpCpyList
  );

  const isInitialLoading =
    (isCoreDataLoading && !hasCoreData) ||
    (fetchAllCountriesMetrics &&
      countriesLoading &&
      !countriesData?.gpLocationCountryList) ||
    (countrySelection !== null &&
      !hasCountryData &&
      !clusterCountryData &&
      !previousClusterCountryData) ||
    (fetchAllCountriesMetrics &&
      allCountriesMetrics.length === 0 &&
      !previousAllCountriesMetricsData &&
      countriesData?.gpLocationCountryList?.length > 0);

  const isCountryDataLoading =
    countryProductLoading ||
    clusterCountryLoading ||
    allCountriesMetricsLoading;

  const isLoading = hasCoreData && hasCountryData ? false : isInitialLoading;

  const hasErrors =
    productsError ||
    clustersError ||
    supplyChainsError ||
    productMappingsError ||
    countryProductError ||
    clusterCountryError ||
    (fetchAllCountriesMetrics && (countriesError || allCountriesMetricsError));

  return {
    // Raw GraphQL data
    productsData,
    clustersData,
    supplyChainsData,
    countriesData,

    // Processed data
    productMappings,
    countryData,
    productClusterRows,
    allCountriesMetrics,
    countryLookup,

    // Loading states
    isLoading,
    isCountryDataLoading,
    isInitialLoading,
    productsLoading,
    clustersLoading,
    supplyChainsLoading,
    countriesLoading,
    productMappingsLoading,
    countryProductLoading,
    clusterCountryLoading,
    allCountriesMetricsLoading,

    // Previous data availability (for UI indicators)
    hasPreviousData: !!(
      previousCountryProductData ||
      previousClusterCountryData ||
      previousAllCountriesMetricsData
    ),

    // Error states
    hasErrors,
    productsError,
    clustersError,
    supplyChainsError,
    productMappingsError,
    countryProductError,
    clusterCountryError,
    countriesError: fetchAllCountriesMetrics ? countriesError : null,
    allCountriesMetricsError: fetchAllCountriesMetrics
      ? allCountriesMetricsError
      : null,
  };
};

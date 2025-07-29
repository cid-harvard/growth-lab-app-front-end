import { useMemo } from "react";
import { useProductLookup } from "../queries/products";
import { useSupplyChainProductLookup } from "../queries/supplyChainProducts";
import { useSupplyChainLookup } from "../queries/supplyChains";
import { useGreenGrowthData } from "./useGreenGrowthData";

export interface ProcessedProductData {
  productCode: string;
  productName: string;
  productLevel: string;
  clusterName: string;
  supplyChainName: string;
  exportRca: number | null;
  exportValue: number | null;
  expectedExports: number | null;
  normalizedPci: number | null;
  normalizedCog: number | null;
  density: number | null;
  globalMarketShare: number | null;
  productMarketShare: number | null;

  marketGrowth: number | null;
  productMarketShareGrowth: number | null;
  pciStd: number | null;
  cogStd: number | null;
  feasibilityStd: number | null;
  strategyBalancedPortfolio: number | null;
  strategyLongJump: number | null;
  strategyLowHangingFruit: number | null;
  strategyFrontier: number | null;
  pciCogFeasibilityComposite: number | null;
}

export interface ProcessedCountryData {
  countryName: string;
  countryCode: string;
  year: number;
  coiGreen: number | null;
  lntotnetnrexpPc: number | null;
  lnypc: number | null;
  xResid: number | null;
  isSelected: boolean;
}

export const useProcessedTableData = (
  selectedCountry: number,
  selectedYear: number,
  fetchAllCountries: boolean = true,
) => {
  const productLookup = useProductLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();
  const supplyChainLookup = useSupplyChainLookup();

  // Fetch the same data as DataTable
  const {
    countryData,
    clustersData,
    allCountriesMetrics,
    countryLookup,
    productClusterRows,
    isLoading,
    hasErrors,
  } = useGreenGrowthData(selectedCountry, selectedYear, fetchAllCountries);

  // Create cluster lookup for enriching data
  const clusterLookup = useMemo(() => {
    if (!clustersData?.ggClusterList) return new Map();
    return new Map(
      clustersData.ggClusterList.map((cluster: any) => [
        cluster.clusterId,
        cluster,
      ]),
    );
  }, [clustersData]);

  // Process products data (same as ProductsTable in DataTable)
  const processedProductsData = useMemo((): ProcessedProductData[] => {
    if (!countryData?.productData || !productLookup) return [];

    return countryData.productData
      .map((item: any): ProcessedProductData => {
        const product = productLookup.get(item.productId);
        const supplyChainMappings =
          supplyChainProductLookup?.get(item.productId) || [];
        const firstMapping = supplyChainMappings[0];
        const supplyChain = firstMapping
          ? supplyChainLookup?.get(firstMapping.supplyChainId)
          : null;
        const cluster = firstMapping
          ? clusterLookup?.get(firstMapping.clusterId)
          : null;

        return {
          productCode: product?.code || "N/A",
          productName: product?.nameShortEn || "Unknown Product",
          productLevel: product?.productLevel || "N/A",
          clusterName: cluster?.clusterName || "N/A",
          supplyChainName: supplyChain?.supplyChain || "N/A",
          exportRca: item.exportRca,
          exportValue: item.exportValue,
          expectedExports: item.expectedExports,
          normalizedPci: item.normalizedPci,
          normalizedCog: item.normalizedCog,
          density: item.density,
          globalMarketShare: item.globalMarketShare,
          productMarketShare: item.productMarketShare,
          marketGrowth: item.marketGrowth,
          productMarketShareGrowth: item.productMarketShareGrowth,
          pciStd: item.pciStd,
          cogStd: item.cogStd,
          feasibilityStd: item.feasibilityStd,
          strategyBalancedPortfolio: item.strategyBalancedPortfolio,
          strategyLongJump: item.strategyLongJump,
          strategyLowHangingFruit: item.strategyLowHangingFruit,
          strategyFrontier: item.strategyFrontier,
          pciCogFeasibilityComposite: item.pciCogFeasibilityComposite,
        };
      })
      .sort(
        (a: ProcessedProductData, b: ProcessedProductData) =>
          (b.pciCogFeasibilityComposite || 0) -
          (a.pciCogFeasibilityComposite || 0),
      );
  }, [
    countryData,
    productLookup,
    supplyChainProductLookup,
    supplyChainLookup,
    clusterLookup,
  ]);

  // Process country data (same as CountryTable in DataTable)
  const processedCountryData = useMemo((): ProcessedCountryData[] => {
    if (!allCountriesMetrics.length || !countryLookup) return [];

    return allCountriesMetrics
      .map((item: any): ProcessedCountryData => {
        const country = countryLookup.get(item.countryId);
        return {
          countryName: country?.nameShortEn || "Unknown Country",
          countryCode: country?.iso3Code || "N/A",
          year: item.year,
          coiGreen: item.coiGreen,
          lntotnetnrexpPc: item.lntotnetnrexpPc,
          lnypc: item.lnypc,
          xResid: item.xResid,
          isSelected: item.countryId === selectedCountry,
        };
      })
      .sort((a: ProcessedCountryData, b: ProcessedCountryData) => {
        if (a.isSelected && !b.isSelected) return -1;
        if (!a.isSelected && b.isSelected) return 1;
        return (b.coiGreen || 0) - (a.coiGreen || 0);
      });
  }, [allCountriesMetrics, countryLookup, selectedCountry]);

  return {
    processedProductsData,
    processedCountryData,
    countryData,
    clustersData,
    allCountriesMetrics,
    countryLookup,
    productClusterRows,
    isLoading,
    hasErrors,
  };
};

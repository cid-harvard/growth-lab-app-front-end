// Calculation utilities for ClusterTree component
import {
  calculateClusterScores as sharedCalculateClusterScores,
  calculateAttractiveness,
} from "../../../../utils/rankings";

// Re-export the shared function with wrapper for backward compatibility
export const calculateClusterScores = (clusterData: any[]) => {
  if (!clusterData || clusterData.length === 0) return [];

  // Use ALL clusters - no filtering based on RCA
  const allClusters = clusterData;

  // Calculate cluster positions (same as ProductScatter cluster mode)
  const clustersWithPositions = allClusters.map((clusterItem) => {
    const attractiveness = calculateAttractiveness(
      Number.parseFloat(clusterItem.cog),
      Number.parseFloat(clusterItem.pci),
    );
    const density = Number.parseFloat(clusterItem.density);

    return {
      ...clusterItem,
      attractiveness,
      density,
    };
  });

  // Use shared ranking function to calculate scores and sort
  return sharedCalculateClusterScores(clustersWithPositions);
};

// Helper function to calculate cluster export values
export const calculateClusterExportValue = (
  cluster: any,
  countryData: any,
  supplyChainProductLookup: any,
) => {
  if (!countryData?.productData) return 0;

  // Find products that belong to this cluster and sum their export values
  const clusterProducts = countryData.productData.filter((productItem: any) => {
    const mappings = supplyChainProductLookup.get(productItem.productId) || [];
    return mappings.some(
      (mapping: any) => mapping.clusterId === cluster.clusterId,
    );
  });

  return clusterProducts.reduce((sum: number, product: any) => {
    return sum + (Number.parseFloat(product.exportValue) || 0);
  }, 0);
};

// Helper function to calculate node size based on export value
export const calculateNodeSize = (
  exportValue: number,
  minSize: number = 4,
  maxSize: number = 16,
  allExportValues: number[] = [],
) => {
  if (!exportValue || exportValue <= 0) return minSize;

  // If we have all export values, use relative scaling
  if (allExportValues.length > 0) {
    const validValues = allExportValues.filter((v) => v > 0);
    if (validValues.length > 1) {
      const minValue = Math.min(...validValues);
      const maxValue = Math.max(...validValues);

      // Use square root scaling for better visual distribution
      const normalizedValue =
        (Math.sqrt(exportValue) - Math.sqrt(minValue)) /
        (Math.sqrt(maxValue) - Math.sqrt(minValue));
      return minSize + normalizedValue * (maxSize - minSize);
    }
  }

  // Fallback to log scale for better visualization of export values
  const logValue = Math.log10(exportValue + 1);
  const normalizedSize = minSize + (logValue / 10) * (maxSize - minSize);
  return Math.max(minSize, Math.min(maxSize, normalizedSize));
};

// Calculation utilities for ClusterTree component

// Function to calculate cluster top-right scores (same logic as ProductRadar.jsx)
export const calculateClusterScores = (clusterData: any[]) => {
  if (!clusterData || clusterData.length === 0) return [];

  // Use ALL clusters - no filtering based on RCA
  const allClusters = clusterData;

  // Calculate cluster positions (same as ProductScatter cluster mode)
  const clustersWithPositions = allClusters.map((clusterItem) => {
    const attractiveness =
      0.6 * Number.parseFloat(clusterItem.cog) +
      0.4 * Number.parseFloat(clusterItem.pci);
    const density = Number.parseFloat(clusterItem.rca);

    return {
      ...clusterItem,
      attractiveness,
      density,
    };
  });

  // Find the range of values to normalize for better "top right" detection
  const attractivenessValues = clustersWithPositions.map(
    (c) => c.attractiveness,
  );
  const densityValues = clustersWithPositions.map((c) => c.density);

  const minAttractiveness = Math.min(...attractivenessValues);
  const maxAttractiveness = Math.max(...attractivenessValues);
  const minDensity = Math.min(...densityValues);
  const maxDensity = Math.max(...densityValues);

  // Normalize values to 0-1 range for fair comparison
  const clustersWithNormalizedScores = clustersWithPositions.map((cluster) => {
    const normalizedAttractiveness =
      attractivenessValues.length > 1
        ? (cluster.attractiveness - minAttractiveness) /
          (maxAttractiveness - minAttractiveness)
        : 0.5;
    const normalizedDensity =
      densityValues.length > 1
        ? (cluster.density - minDensity) / (maxDensity - minDensity)
        : 0.5;

    // Calculate distance from top-right corner (1, 1) - smaller distance means closer to top-right
    const distanceFromTopRight = Math.sqrt(
      Math.pow(1 - normalizedDensity, 2) +
        Math.pow(1 - normalizedAttractiveness, 2),
    );

    // Alternative scoring methods for robust top-right detection:
    // 1. Geometric mean of normalized values (emphasizes balance)
    const geometricMean = Math.sqrt(
      normalizedAttractiveness * normalizedDensity,
    );

    // 2. Minimum of the two dimensions (ensures both are reasonably high)
    const minScore = Math.min(normalizedAttractiveness, normalizedDensity);

    // 3. Weighted product (emphasizes having both dimensions high)
    const productScore = normalizedAttractiveness * normalizedDensity;

    // Use distance-based approach as primary, with geometric mean as tiebreaker
    const topRightScore = 1 - distanceFromTopRight + geometricMean * 0.1;

    return {
      ...cluster,
      normalizedAttractiveness,
      normalizedDensity,
      distanceFromTopRight,
      geometricMean,
      minScore,
      productScore,
      topRightScore,
    };
  });

  // Sort by top-right score (higher is better)
  return clustersWithNormalizedScores.sort((a, b) => {
    // Primary sort by topRightScore
    if (Math.abs(a.topRightScore - b.topRightScore) > 0.01) {
      return b.topRightScore - a.topRightScore;
    }
    // Tiebreaker: prefer higher geometric mean
    return b.geometricMean - a.geometricMean;
  });
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

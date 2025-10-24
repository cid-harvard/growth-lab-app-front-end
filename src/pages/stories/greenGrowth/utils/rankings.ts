/**
 * Shared utilities for cluster ranking calculations
 * Used across ProductRadar, SummaryPage, ClusterTree, and other components
 */

export interface ClusterWithPosition {
  attractiveness: number;
  density: number;
  [key: string]: unknown;
}

export interface ClusterWithScore extends ClusterWithPosition {
  normalizedAttractiveness: number;
  normalizedDensity: number;
  distanceFromTopRight: number;
  geometricMean: number;
  minScore: number;
  productScore: number;
  topRightScore: number;
}

/**
 * Calculates normalized scores and ranks clusters based on their position
 * in attractiveness-density space (top-right quadrant is best)
 *
 * @param clusters - Array of clusters with attractiveness and density values
 * @returns Array of clusters with normalized scores, sorted by top-right score (best first)
 */
export const calculateClusterScores = <T extends ClusterWithPosition>(
  clusters: T[],
): (T & ClusterWithScore)[] => {
  if (!clusters || clusters.length === 0) return [];

  // Extract values for normalization
  const attractivenessValues = clusters.map((c) => c.attractiveness);
  const densityValues = clusters.map((c) => c.density);

  const minAttractiveness = Math.min(...attractivenessValues);
  const maxAttractiveness = Math.max(...attractivenessValues);
  const minDensity = Math.min(...densityValues);
  const maxDensity = Math.max(...densityValues);

  // Normalize values to 0-1 range for fair comparison
  const clustersWithScores = clusters.map((cluster) => {
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
  return clustersWithScores.sort((a, b) => {
    // Primary sort by topRightScore
    if (Math.abs(a.topRightScore - b.topRightScore) > 0.01) {
      return b.topRightScore - a.topRightScore;
    }
    // Tiebreaker: prefer higher geometric mean
    return b.geometricMean - a.geometricMean;
  });
};

/**
 * Calculates attractiveness from COG and PCI values
 * @param cog - Complexity Outlook Gain
 * @param pci - Product Complexity Index
 * @returns Attractiveness score (weighted combination)
 */
export const calculateAttractiveness = (cog: number, pci: number): number => {
  return 0.6 * cog + 0.4 * pci;
};

/**
 * Simplified function to calculate top-right score for a single item
 * Used in ProductScatter for individual point scoring
 *
 * @param attractiveness - Item's attractiveness value
 * @param density - Item's density value
 * @param allItems - All items for normalization context
 * @returns Top-right score (higher is better)
 */
export const calculateTopRightScore = (
  attractiveness: number,
  density: number,
  allItems: ClusterWithPosition[],
): number => {
  // Get min/max values for normalization
  const attractivenessValues = allItems.map((item) => item.attractiveness);
  const densityValues = allItems.map((item) => item.density);

  const minAttractiveness = Math.min(...attractivenessValues);
  const maxAttractiveness = Math.max(...attractivenessValues);
  const minDensity = Math.min(...densityValues);
  const maxDensity = Math.max(...densityValues);

  // Normalize values to 0-1 range
  const normalizedAttractiveness =
    attractivenessValues.length > 1
      ? (attractiveness - minAttractiveness) /
        (maxAttractiveness - minAttractiveness)
      : 0.5;
  const normalizedDensity =
    densityValues.length > 1
      ? (density - minDensity) / (maxDensity - minDensity)
      : 0.5;

  // Calculate distance from top-right corner (1, 1) - smaller distance means higher score
  const distanceFromTopRight = Math.sqrt(
    Math.pow(1 - normalizedDensity, 2) +
      Math.pow(1 - normalizedAttractiveness, 2),
  );

  // Convert distance to score (closer to top-right = higher score)
  return Math.max(0, 2 - distanceFromTopRight); // This gives a score roughly between 0-2
};

import { calculateClusterExportValue } from "./calculations";
import { getPotentialColor } from "./colors";
import {
  CLUSTER_RANKING_NODE_RADIUS,
  CLUSTER_RANKING_NODE_RADIUS_MOBILE,
  CLUSTER_RANKING_EDGE_PADDING,
  CLUSTER_RANKING_EDGE_PADDING_MOBILE,
  CLUSTER_RANKING_SPACING,
  CLUSTER_RANKING_SPACING_MOBILE,
} from "../config";

// Create ordered row layout for clusters based on rank
export const createOrderedRowLayout = (
  clusters: any[],
  height: number,
  countryData: any,
  supplyChainProductLookup: any,
  minScore: number,
  maxScore: number,
  edgePadding?: number,
  isMobile?: boolean,
) => {
  if (!clusters.length) return [];

  // Calculate export values for all clusters
  const clustersWithExports = clusters.map((cluster) => ({
    ...cluster,
    exportValue: calculateClusterExportValue(
      cluster,
      countryData,
      supplyChainProductLookup,
    ),
  }));

  // Use consistent score range for color calculation (calculated at component level)

  // Use fixed values from config with mobile overrides
  const staticRadius = isMobile
    ? CLUSTER_RANKING_NODE_RADIUS_MOBILE
    : CLUSTER_RANKING_NODE_RADIUS;
  const padding =
    edgePadding ??
    (isMobile
      ? CLUSTER_RANKING_EDGE_PADDING_MOBILE
      : CLUSTER_RANKING_EDGE_PADDING);
  const spaceBetween = isMobile
    ? CLUSTER_RANKING_SPACING_MOBILE
    : CLUSTER_RANKING_SPACING;

  // Center Y position
  const centerY = height / 2;

  // Create ordered layout data - already sorted by topRightScore (rank)
  return clustersWithExports.map((cluster, index) => {
    // Position based on rank (index in sorted array)
    const x = padding + index * spaceBetween;

    // Use static size for all cluster nodes
    const radius = staticRadius;

    // Calculate color based on potential score
    const color = getPotentialColor(cluster.topRightScore, minScore, maxScore);

    const rank = index + 1; // 1-based ranking

    return {
      id: cluster.clusterId,
      name: cluster.clusterName || `Cluster ${cluster.clusterId}`,
      x,
      y: centerY,
      score: cluster.topRightScore,
      exportValue: cluster.exportValue,
      radius,
      color,
      cluster,
      rank,
    };
  });
};

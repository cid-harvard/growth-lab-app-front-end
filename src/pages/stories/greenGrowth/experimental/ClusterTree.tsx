import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import { ParentSize } from "@visx/responsive";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  SelectChangeEvent,
  Box,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import styled from "styled-components";
import {
  FullWidthContent,
  FullWidthContentContainer,
} from "../../../../styling/Grid";

import { useGreenGrowthData } from "../hooks";
import { buildHierarchicalData } from "../components/visualization/SankeyTree/dataUtils";
import { convertToPositions } from "../components/visualization/SankeyTree/layoutUtils";

import { useQuery } from "@apollo/client";
import { GET_COUNTRIES } from "../queries/shared";
import { useSupplyChainProductLookup } from "../queries/supplyChainProducts";

const theme = createTheme({
  typography: {
    fontFamily: '"Source Sans Pro", "Source Sans", sans-serif',
  },
});

const PageContainer = styled(FullWidthContentContainer)`
  padding: 40px 20px;
  font-family: "Source Sans Pro", sans-serif;
`;

const ControlsContainer = styled(Paper)`
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

// Function to calculate cluster top-right scores (same logic as ProductRadar.jsx)
const calculateClusterScores = (clusterData: any[]) => {
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
const calculateClusterExportValue = (
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
const calculateNodeSize = (
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

// Helper function to get color based on potential score
const getPotentialColor = (
  score: number,
  minScore: number,
  maxScore: number,
) => {
  const scoreRange = maxScore - minScore;
  if (scoreRange === 0) return "#4A90E2"; // Default blue if all scores are the same

  // Normalize score to 0-1 range
  const normalizedScore = (score - minScore) / scoreRange;

  // Color scale from blue (high potential) to red (low potential)
  // Higher scores should be more blue, lower scores more red
  const hue = normalizedScore * 240; // 240 = blue, 0 = red
  const saturation = 70;
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Proper beeswarm layout algorithm (adapted from Yuri Vishnevsky's Observable notebook)
const createBeeswarmLayout = (
  clusters: any[],
  width: number,
  height: number,
  countryData: any,
  supplyChainProductLookup: any,
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

  // Get all export values for relative sizing
  const allExportValues = clustersWithExports
    .map((c) => c.exportValue)
    .filter((v) => v > 0);

  // Get score range for color calculation
  const minScore = Math.min(...clusters.map((c) => c.topRightScore));
  const maxScore = Math.max(...clusters.map((c) => c.topRightScore));
  const scoreRange = maxScore - minScore;

  // Calculate max radius for dynamic padding
  const maxPossibleRadius = 20; // From calculateNodeSize max

  // Prepare data for beeswarm algorithm
  const beeswarmData = clustersWithExports.map((cluster, index) => {
    // Map score to x position - REVERSE so higher potential is on the left
    // Use full width with minimal padding only for the largest circles
    const normalizedScore =
      scoreRange > 0 ? (cluster.topRightScore - minScore) / scoreRange : 0.5;

    // Use max possible radius as padding to ensure no circle gets cut off
    const dynamicPadding = maxPossibleRadius;

    const x =
      dynamicPadding + (1 - normalizedScore) * (width - 2 * dynamicPadding);

    // Calculate node size based on export value
    const radius = calculateNodeSize(
      cluster.exportValue,
      9,
      20,
      allExportValues,
    );

    // Calculate color based on potential score
    const color = getPotentialColor(cluster.topRightScore, minScore, maxScore);

    return {
      datum: cluster,
      x,
      y: Infinity, // Will be calculated by beeswarm algorithm
      r: radius,
      priority: cluster.exportValue || 0, // Use export value as priority (larger circles placed first)
      index,
      id: cluster.clusterId,
      name: cluster.clusterName || `Cluster ${cluster.clusterId}`,
      score: cluster.topRightScore,
      exportValue: cluster.exportValue,
      color,
      cluster,
    };
  });

  // Beeswarm algorithm (adapted from Yuri Vishnevsky)
  const swarm = (data: any[], symmetric = true) => {
    let circles = [...data].sort((a, b) => a.x - b.x);
    let indices = Array.from({ length: circles.length }, (_, i) => i).sort(
      (a, b) => (circles[b].priority || 0) - (circles[a].priority || 0),
    ); // Higher priority first

    indices.forEach((index, order) => {
      circles[index].order = order;
    });

    const { sqrt, abs } = Math;
    const maxRadius = Math.max(...circles.map((d) => d.r));

    for (let index of indices) {
      let intervals: [number, number][] = [];
      let circle = circles[index];

      // Scan adjacent circles to the left and right
      for (let step of [-1, 1]) {
        for (let i = index + step; i > -1 && i < circles.length; i += step) {
          let other = circles[i];
          let dist = abs(circle.x - other.x);
          let radiusSum = circle.r + other.r + 2; // Add 2px padding between circles

          // Stop once it becomes clear that no circle can overlap us
          if (dist > circle.r + maxRadius + 2) break; // Account for padding in early exit

          // Don't pay attention to this specific circle if
          // it hasn't been placed yet or doesn't overlap us
          if (other.y === Infinity || dist > radiusSum) continue;

          // Compute the distance by which one would need to offset the circle
          // so that it just touches the other circle
          let offset = sqrt(radiusSum * radiusSum - dist * dist);

          // Use that offset to create an interval in which this circle is forbidden
          intervals.push([other.y - offset, other.y + offset]);
        }
      }

      // Find a y coordinate for this circle by finding
      // the lowest point at the edge of any interval where it can fit
      let y = 0;
      if (intervals.length) {
        let candidates = intervals.flat().sort((a, b) => abs(a) - abs(b));

        for (let candidate of candidates) {
          if (!symmetric && candidate > 0) continue;
          if (
            intervals.every(([lo, hi]) => candidate <= lo || candidate >= hi)
          ) {
            y = candidate;
            break;
          }
        }
      }

      circles[index].y = y;
    }

    return circles;
  };

  // Apply beeswarm algorithm
  const swarmedCircles = swarm(beeswarmData, true);

  // Calculate the natural height needed for the swarm
  const yValues = swarmedCircles.map((d) => d.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const naturalHeight = maxY - minY;

  // Calculate max radius for padding
  const maxRadius = Math.max(...swarmedCircles.map((d) => d.r));
  const neededHeight = naturalHeight + maxRadius * 2 + 10; // Extra padding

  // If the natural swarm is taller than available height, don't clamp (preserve algorithm's work)
  // Instead, let it overflow - this prevents overlaps
  const centerY = height / 2;
  const shouldClamp = neededHeight <= height;

  return swarmedCircles.map((circle) => {
    // Center the swarm vertically
    let adjustedY = centerY + (circle.y - (minY + naturalHeight / 2));

    // Only apply bounds if we have enough space, otherwise preserve spacing
    if (shouldClamp) {
      const topBound = circle.r + 5;
      const bottomBound = height - circle.r - 5;
      adjustedY = Math.max(topBound, Math.min(bottomBound, adjustedY));
    }

    return {
      id: circle.id,
      name: circle.name,
      x: circle.x,
      y: adjustedY,
      score: circle.score,
      exportValue: circle.exportValue,
      radius: circle.r,
      color: circle.color,
      cluster: circle.cluster,
    };
  });
};

// Beeswarm component
const ClusterBeeswarm: React.FC<{
  width: number;
  height: number;
  clusterData: any[];
  clusterLookup: Map<number, string>;
  countryData: any;
  supplyChainProductLookup: any;
  selectedCluster: string;
  onClusterSelect: (clusterName: string) => void;
  isMobile: boolean;
}> = ({
  width,
  height,
  clusterData,
  clusterLookup,
  countryData,
  supplyChainProductLookup,
  selectedCluster,
  onClusterSelect,
  isMobile,
}) => {
  // Calculate cluster scores and create beeswarm layout
  const beeswarmData = useMemo(() => {
    if (!clusterData || !clusterData.length) return [];

    const scoredClusters = calculateClusterScores(clusterData);

    // Add cluster names from lookup
    const clustersWithNames = scoredClusters.map((cluster) => ({
      ...cluster,
      clusterName:
        clusterLookup.get(cluster.clusterId) || `Cluster ${cluster.clusterId}`,
    }));

    return createBeeswarmLayout(
      clustersWithNames,
      width,
      height - 40,
      countryData,
      supplyChainProductLookup,
    );
  }, [
    clusterData,
    clusterLookup,
    countryData,
    supplyChainProductLookup,
    width,
    height,
  ]);

  const handleClusterClick = useCallback(
    (clusterName: string) => {
      onClusterSelect(clusterName);
    },
    [onClusterSelect],
  );

  // Calculate actual height needed and adjust circle positions
  const { actualHeight, adjustedBeeswarmData } = useMemo(() => {
    if (!beeswarmData.length) {
      return { actualHeight: height, adjustedBeeswarmData: [] };
    }

    // Find the bounds of all circles (including their radii)
    const minY = Math.min(...beeswarmData.map((d) => d.y - d.radius));
    const maxY = Math.max(...beeswarmData.map((d) => d.y + d.radius));

    // Calculate needed height with padding
    const neededHeight = maxY - minY + 10; // 5px padding on each side
    const finalHeight = Math.max(height, neededHeight);

    // Adjust circle positions so they're all visible (translate so minY becomes 5px from top)
    const yOffset = 5 - minY; // Offset to move the topmost circle to 5px from top

    const adjustedData = beeswarmData.map((circle) => ({
      ...circle,
      y: circle.y + yOffset,
    }));

    return { actualHeight: finalHeight, adjustedBeeswarmData: adjustedData };
  }, [beeswarmData, height]);

  return (
    <Box sx={{ position: "relative", mb: 2 }}>
      <svg
        width={width}
        height={actualHeight}
        style={{ border: "1px solid #e0e0e0", borderRadius: "8px" }}
        role="img"
        aria-label="Cluster opportunity spectrum visualization"
      >
        <title>
          Interactive cluster opportunity spectrum showing clusters positioned
          by attractiveness and feasibility
        </title>
        {/* Fixed background */}
        <rect x={0} y={0} width={width} height={actualHeight} fill="#f8f9fa" />

        {/* Axis labels */}
        <text
          x={20}
          y={actualHeight - 10}
          fontSize={isMobile ? "10px" : "12px"}
          fill="#666"
          fontFamily="Source Sans Pro, sans-serif"
        >
          Higher Potential
        </text>
        <text
          x={width - 20}
          y={actualHeight - 10}
          fontSize={isMobile ? "10px" : "12px"}
          fill="#666"
          textAnchor="end"
          fontFamily="Source Sans Pro, sans-serif"
        >
          Lower Potential
        </text>

        {/* Render clusters */}
        {adjustedBeeswarmData.map((item) => {
          const isSelected = selectedCluster === item.name;

          return (
            <g key={item.id}>
              {/* Cluster circle */}
              <circle
                cx={item.x}
                cy={item.y}
                r={item.radius}
                fill={isSelected ? "#1976d2" : item.color}
                stroke={isSelected ? "#0d47a1" : "rgba(0, 0, 0, 0.3)"}
                strokeWidth={isSelected ? 2 : 1}
                style={{
                  cursor: "pointer",
                  opacity: 0.8,
                }}
                onClick={() => handleClusterClick(item.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClusterClick(item.name);
                  }
                }}
                aria-label={`Select cluster ${item.name} with opportunity score ${item.score.toFixed(3)} and export value $${(item.exportValue / 1e6).toFixed(1)}M`}
              />

              {/* Cluster label - only show for selected cluster */}
              {isSelected && (
                <text
                  x={item.x}
                  y={item.y - item.radius - 8}
                  fontSize={isMobile ? "10px" : "12px"}
                  fill="#333"
                  textAnchor="middle"
                  fontFamily="Source Sans Pro, sans-serif"
                  fontWeight="600"
                  style={{ pointerEvents: "none" }}
                >
                  {item.name.length > 20
                    ? item.name.substring(0, 17) + "..."
                    : item.name}
                </text>
              )}

              {/* Tooltip on hover */}
              <title>{`${item.name} - Potential Score: ${item.score.toFixed(3)} - Export Value: $${(item.exportValue / 1e6).toFixed(1)}M - Click to explore`}</title>
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

// Internal component that receives dimensions from ParentSize
const ClusterTreeInternal = ({
  width,
  height,
  selectedCluster,
  productClusterRows,
  countryData,
  clusterLookup,
  supplyChainProductLookup,
  onClusterSelect,
}: {
  width: number;
  height: number;
  selectedCluster: string;
  productClusterRows: any[];
  countryData: any;
  clusterLookup: Map<number, string>;
  supplyChainProductLookup: any;
  onClusterSelect: (clusterName: string) => void;
}) => {
  // Responsive setup
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  // Calculate responsive dimensions - reserve space for beeswarm
  const beeswarmHeight = isMobile ? 120 : 140;
  const treeHeight = height - beeswarmHeight - 40; // 40px for spacing

  const dimensions = useMemo(() => {
    const calculatedWidth = Math.max(width - (isMobile ? 10 : 20), 400);
    const calculatedTreeHeight = Math.max(treeHeight, 300);

    return {
      width: calculatedWidth,
      height: calculatedTreeHeight,
      beeswarmHeight,
    };
  }, [width, treeHeight, beeswarmHeight, isMobile]);

  // State
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(
    new Set(),
  );
  const [connectedLinkIds, setConnectedLinkIds] = useState<Set<string>>(
    new Set(),
  );
  const isAnimating = useRef(false);

  // Build initial hierarchy data - same as SankeyTree
  const baseHierarchyData = useMemo(() => {
    if (!productClusterRows.length) return null;

    try {
      return buildHierarchicalData(productClusterRows, countryData);
    } catch (err) {
      console.error("Error processing hierarchy data:", err);
      return null;
    }
  }, [productClusterRows, countryData]);

  // Apply focus-based visibility - show all elements, no RCA filtering
  const hierarchyData = useMemo(() => {
    if (!baseHierarchyData) return null;

    // Use all hierarchy data without RCA filtering
    const allHierarchy = baseHierarchyData;

    // Apply focus-based visibility for the selected cluster - show ALL connected elements
    const updatedNodes = allHierarchy.nodes.map((node) => {
      if (node.id === selectedCluster) {
        return { ...node, visible: true };
      } else if (node.type === "value_chain") {
        // Show value chains connected to this cluster
        const isConnected = allHierarchy.links.some(
          (l) => l.source === node.id && l.target === selectedCluster,
        );
        return { ...node, visible: isConnected };
      } else if (node.type === "product") {
        // Show products connected to this cluster
        const isConnected = allHierarchy.links.some(
          (l) => l.source === selectedCluster && l.target === node.id,
        );
        return { ...node, visible: isConnected };
      } else {
        return { ...node, visible: false };
      }
    });

    const nodeVisibility = new Map(
      updatedNodes.map((node) => [node.id, node.visible]),
    );

    const updatedLinks = allHierarchy.links.map((link) => {
      const sourceVisible = nodeVisibility.get(link.source) ?? false;
      const targetVisible = nodeVisibility.get(link.target) ?? false;
      const bothNodesVisible = sourceVisible && targetVisible;

      return {
        ...link,
        visible: bothNodesVisible,
      };
    });

    return { nodes: updatedNodes, links: updatedLinks };
  }, [baseHierarchyData, selectedCluster]);

  // Apply layout to hierarchy data - use same cluster focus layout as SankeyTree
  const positionedHierarchyData = useMemo(() => {
    if (!hierarchyData || !selectedCluster) return null;

    const visibleNodes = hierarchyData.nodes.filter((n) => n.visible);

    // Get connected value chains (sources) and products (targets)
    const valueChains = visibleNodes.filter((n) => n.type === "value_chain");
    const products = visibleNodes.filter((n) => n.type === "product");

    const updatedNodes = visibleNodes.map((node) => {
      const nodeWidth = 16; // Fixed width for circles - same as SankeyTree
      const nodeHeight = 16; // Fixed height for circles - same as SankeyTree

      if (node.id === selectedCluster) {
        // Center the cluster node - same as SankeyTree
        return {
          ...node,
          x: dimensions.width / 2 - nodeWidth / 2,
          y: dimensions.height / 2 - nodeHeight / 2,
          width: nodeWidth,
          height: nodeHeight,
        };
      } else if (node.type === "value_chain") {
        // Arrange value chains vertically on the left - same as SankeyTree
        const index = valueChains.findIndex((vc) => vc.id === node.id);
        const totalHeight = valueChains.length * 60;
        const startY = (dimensions.height - totalHeight) / 2;

        return {
          ...node,
          x: 150,
          y: startY + index * 60,
          width: nodeWidth,
          height: nodeHeight,
        };
      } else if (node.type === "product") {
        // Arrange products vertically on the right - same as SankeyTree
        const index = products.findIndex((p) => p.id === node.id);
        const totalHeight = products.length * 40;
        const startY = (dimensions.height - totalHeight) / 2;

        return {
          ...node,
          x: dimensions.width - 200,
          y: startY + index * 40,
          width: nodeWidth,
          height: nodeHeight,
        };
      }

      return node;
    });

    return {
      ...hierarchyData,
      nodes: updatedNodes,
      links: hierarchyData.links.filter((l) => l.visible),
    };
  }, [hierarchyData, selectedCluster, dimensions]);

  // Convert hierarchical data to node and link positions for rendering - same as SankeyTree
  const { nodePositions, linkPositions } = useMemo(() => {
    if (!positionedHierarchyData)
      return { nodePositions: [], linkPositions: [] };

    return convertToPositions(
      positionedHierarchyData,
      null, // focusedValueChain
      selectedCluster, // focusedCluster
    );
  }, [positionedHierarchyData, selectedCluster]);

  // No animations - static rendering

  // Event handlers - same as SankeyTree
  const handleNodeMouseEnter = useCallback(
    (nodeId: string) => {
      setHoveredNode(nodeId);

      if (hierarchyData) {
        const connectedNodes = new Set<string>();
        const connectedLinks = new Set<string>();

        // Find directly connected nodes
        hierarchyData.links.forEach((link) => {
          if (link.source === nodeId) {
            connectedNodes.add(link.target);
            connectedLinks.add(link.id);
          } else if (link.target === nodeId) {
            connectedNodes.add(link.source);
            connectedLinks.add(link.id);
          }
        });

        setConnectedNodeIds(connectedNodes);
        setConnectedLinkIds(connectedLinks);
      }
    },
    [hierarchyData],
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setConnectedNodeIds(new Set());
    setConnectedLinkIds(new Set());
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (isAnimating.current) return;
    console.log("Clicked node:", nodeId);
  }, []);

  // Debug: Check if we have data and selectedCluster
  console.log("ClusterTreeInternal debug:", {
    selectedCluster,
    productClusterRowsLength: productClusterRows?.length || 0,
    countryData: countryData ? "present" : "missing",
    nodePositionsLength: nodePositions.length,
    linkPositionsLength: linkPositions.length,
    hierarchyDataNodes: hierarchyData?.nodes?.length || 0,
    hierarchyDataLinks: hierarchyData?.links?.length || 0,
  });

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* Beeswarm Visualization */}
      {countryData?.clusterData && (
        <ClusterBeeswarm
          width={dimensions.width}
          height={dimensions.beeswarmHeight}
          clusterData={countryData.clusterData}
          clusterLookup={clusterLookup}
          countryData={countryData}
          supplyChainProductLookup={supplyChainProductLookup}
          selectedCluster={selectedCluster}
          onClusterSelect={onClusterSelect}
          isMobile={isMobile}
        />
      )}

      {/* Tree Visualization */}
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", mt: 2 }}>
        <Typography
          variant="body2"
          sx={{ p: 2, borderBottom: "1px solid #e0e0e0", bgcolor: "#f5f5f5" }}
        >
          <strong>Selected Cluster:</strong>{" "}
          {selectedCluster || "None selected"}
        </Typography>

        <svg
          width={dimensions.width}
          height={dimensions.height}
          role="img"
          aria-label="Cluster tree visualization"
        >
          <title>
            Interactive tree showing selected cluster connections to value
            chains and products
          </title>
          {/* Render links - static SVG */}
          {linkPositions.map((item) => {
            const isConnectedToHovered = connectedLinkIds.has(item.id);
            const hasHoveredNode = hoveredNode !== null;
            const flowHighlightOpacity = hasHoveredNode
              ? isConnectedToHovered
                ? 1.0
                : 0.3
              : 1.0;

            // Calculate curved path - same as SankeyTree
            const midX = (item.sourceX + item.targetX) / 2;
            const verticalDistance = Math.abs(item.sourceY - item.targetY);
            const curveIntensity = Math.min(0.8, verticalDistance / 300);
            const controlY1 =
              item.sourceY + (item.targetY - item.sourceY) * curveIntensity;
            const controlY2 =
              item.targetY - (item.targetY - item.sourceY) * curveIntensity;

            return (
              <path
                key={item.id}
                d={`M ${item.sourceX} ${item.sourceY} C ${midX} ${controlY1}, ${midX} ${controlY2}, ${item.targetX} ${item.targetY}`}
                stroke={item.color}
                strokeWidth={2}
                fill="none"
                opacity={flowHighlightOpacity}
              />
            );
          })}

          {/* Render nodes - static SVG */}
          {nodePositions.map((item) => {
            const isValueChain = item.type === "value_chain";
            const isCluster = item.type === "manufacturing_cluster";
            const isProduct = item.type === "product";
            const isFocused = item.id === selectedCluster;
            const isHovered = item.id === hoveredNode;
            const isConnectedToHovered = connectedNodeIds.has(item.id);

            // Node colors: value chains keep their colors, everything else is grey in focused views - same as SankeyTree
            let nodeColor = item.color;
            if (!isValueChain) {
              nodeColor = "#808080"; // Grey for non-value-chain nodes in focused views
            }

            const hasHoveredNode = hoveredNode !== null;
            const nodeHighlightOpacity = hasHoveredNode
              ? isHovered || isConnectedToHovered
                ? 1.0
                : 0.3
              : 1.0;

            return (
              <g
                key={item.id}
                transform={`translate(${item.x},${item.y})`}
                style={{ cursor: "pointer" }}
                onClick={() => handleNodeClick(item.id)}
                onMouseEnter={() => handleNodeMouseEnter(item.id)}
                onMouseLeave={handleNodeMouseLeave}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNodeClick(item.id);
                  }
                }}
                aria-label={`${item.type} ${item.label}`}
              >
                {/* Circular nodes - same as SankeyTree focused view */}
                <circle
                  cx={item.width / 2}
                  cy={item.height / 2}
                  r={8} // Same radius as SankeyTree
                  fill={nodeColor}
                  stroke={isFocused || isHovered ? "#000000" : "transparent"}
                  strokeWidth={isFocused || isHovered ? 2 : 0}
                  opacity={nodeHighlightOpacity}
                />

                {/* Node labels - same positioning as SankeyTree */}
                <text
                  x={(() => {
                    if (isValueChain) return isMobile ? -8 : -15; // Root nodes to left
                    if (isCluster && item.id === selectedCluster)
                      return item.width / 2; // Center node underneath
                    if (isProduct) return item.width + (isMobile ? 8 : 15); // Leaf nodes to right
                    return item.width / 2;
                  })()}
                  y={(() => {
                    if (isCluster && item.id === selectedCluster) {
                      return item.height + (isMobile ? 20 : 25); // Center node underneath
                    }
                    return item.height / 2; // All other nodes at vertical center
                  })()}
                  textAnchor={(() => {
                    if (isValueChain) return "end"; // Root nodes to left
                    if (isCluster && item.id === selectedCluster)
                      return "middle"; // Center node underneath
                    if (isProduct) return "start"; // Leaf nodes to right
                    return "middle";
                  })()}
                  fontSize={isMobile ? 10 : 12}
                  fontWeight={500}
                  fontFamily={'"Source Sans Pro", sans-serif'}
                  fill="#333"
                  style={{ pointerEvents: "none" }}
                  dominantBaseline={(() => {
                    if (isCluster && item.id === selectedCluster) {
                      return "hanging"; // Text below the selected cluster
                    }
                    return "middle";
                  })()}
                  opacity={(() => {
                    if (hoveredNode && !isHovered && !isConnectedToHovered) {
                      return 0;
                    }
                    return nodeHighlightOpacity;
                  })()}
                >
                  {(() => {
                    const maxLength = (() => {
                      const baseLength = isMobile ? 12 : 18;
                      if (isValueChain) return baseLength;
                      if (isCluster && item.id === selectedCluster)
                        return baseLength + 7;
                      if (isProduct) return baseLength + 4;
                      return baseLength + 2;
                    })();

                    return item.label.length > maxLength
                      ? item.label.substring(0, maxLength - 3) + "..."
                      : item.label;
                  })()}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
    </div>
  );
};

// Main component
const ClusterTree: React.FC = () => {
  const [selectedCluster, setSelectedCluster] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("USA");
  const [selectedYear, setSelectedYear] = useState<string>("2021");

  // Fetch countries data to map country codes to IDs
  const { data: countriesData, loading: countriesLoading } =
    useQuery(GET_COUNTRIES);

  // Map country code to country ID
  const selectedCountryId = useMemo(() => {
    if (!countriesData?.ggLocationCountryList) return null;

    const country = countriesData.ggLocationCountryList.find(
      (c: any) =>
        c.iso3Code === selectedCountry || c.nameShortEn === selectedCountry,
    );

    return country ? country.countryId : null;
  }, [countriesData, selectedCountry]);

  // Data loading to get available clusters
  const { productClusterRows, countryData, clustersData, isLoading } =
    useGreenGrowthData(selectedCountryId, parseInt(selectedYear, 10), false);

  // Get supply chain product lookup
  const supplyChainProductLookup = useSupplyChainProductLookup();

  // Get cluster data lookup
  const clusterLookup = useMemo(() => {
    if (!clustersData?.ggClusterList) return new Map();
    return new Map(
      clustersData.ggClusterList.map((cluster: any) => [
        cluster.clusterId,
        cluster.clusterName,
      ]),
    );
  }, [clustersData]);

  // Debug: Check country ID mapping
  console.log("ClusterTree debug:", {
    selectedCountry,
    selectedCountryId,
    countriesDataAvailable: !!countriesData?.ggLocationCountryList,
    productClusterRowsLength: productClusterRows?.length || 0,
  });

  // Get unique clusters for selection
  const availableClusters = useMemo(() => {
    if (!productClusterRows) return [];
    const clusters = Array.from(
      new Set(productClusterRows.map((row) => row.cluster_name)),
    );
    return clusters.sort();
  }, [productClusterRows]);

  // Set default cluster when data loads
  useEffect(() => {
    if (availableClusters.length > 0 && !selectedCluster) {
      setSelectedCluster(availableClusters[0]);
    }
  }, [availableClusters, selectedCluster]);

  const handleClusterChange = (event: SelectChangeEvent<string>) => {
    setSelectedCluster(event.target.value);
  };

  const handleCountryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCountry(event.target.value);
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value);
  };

  // Handle cluster selection from beeswarm
  const handleClusterSelect = useCallback((clusterName: string) => {
    setSelectedCluster(clusterName);
  }, []);

  // Available countries (from actual data)
  const availableCountries = useMemo(() => {
    if (!countriesData?.ggLocationCountryList) return [];

    // Get common countries with green growth data
    const commonCountries = [
      "USA",
      "DEU",
      "CHN",
      "JPN",
      "GBR",
      "FRA",
      "ITA",
      "KOR",
      "CAN",
      "AUS",
    ];

    return countriesData.ggLocationCountryList
      .filter((c: any) => commonCountries.includes(c.iso3Code))
      .map((c: any) => c.iso3Code)
      .sort();
  }, [countriesData]);

  // Available years
  const availableYears = [
    "2015",
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
    "2021",
  ];

  if (isLoading || countriesLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullWidthContent>
          <PageContainer>
            <Typography variant="h5">Loading...</Typography>
          </PageContainer>
        </FullWidthContent>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FullWidthContent>
        <PageContainer>
          <ControlsContainer>
            <Box
              sx={{
                mb: 3,
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <FormControl size="medium" sx={{ flex: 1 }}>
                <InputLabel>Country</InputLabel>
                <Select
                  value={selectedCountry}
                  label="Country"
                  onChange={handleCountryChange}
                >
                  {availableCountries.map((country: string) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="medium" sx={{ flex: 1 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  label="Year"
                  onChange={handleYearChange}
                >
                  {availableYears.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="medium" sx={{ flex: 2 }}>
                <InputLabel>Select Manufacturing Cluster</InputLabel>
                <Select
                  value={selectedCluster}
                  label="Select Manufacturing Cluster"
                  onChange={handleClusterChange}
                  disabled={availableClusters.length === 0}
                >
                  {availableClusters.map((cluster) => (
                    <MenuItem key={cluster} value={cluster}>
                      {cluster}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </ControlsContainer>

          <div style={{ height: "800px", width: "100%" }}>
            <ParentSize>
              {({ width, height }) => (
                <ClusterTreeInternal
                  width={width}
                  height={height}
                  selectedCluster={selectedCluster}
                  productClusterRows={productClusterRows || []}
                  countryData={countryData}
                  clusterLookup={clusterLookup}
                  supplyChainProductLookup={supplyChainProductLookup}
                  onClusterSelect={handleClusterSelect}
                />
              )}
            </ParentSize>
          </div>
        </PageContainer>
      </FullWidthContent>
    </ThemeProvider>
  );
};

export default ClusterTree;

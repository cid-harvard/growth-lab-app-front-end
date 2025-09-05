/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/mouse-events-have-key-events */
import { type FC, useState, useMemo, useRef, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Typography, Paper, Box, CircularProgress, Alert } from "@mui/material";
import { useQuery, gql } from "@apollo/client";
import styled from "styled-components";
import {
  FullWidthContent,
  FullWidthContentContainer,
} from "../../../../styling/Grid";
import { scaleLinear, scaleOrdinal } from "d3-scale";
import { extent } from "d3-array";
import { polygonHull } from "d3-polygon";
import { schemeCategory10, schemeSet3 } from "d3-scale-chromatic";

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

const VisualizationContainer = styled.div`
  width: 100%;
  height: 80vh;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: #ffffff;
`;

const StatsContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
`;

const StatsText = styled.p`
  margin: 4px 0;
  color: #2c3e50;
  font-size: 0.9rem;
`;

// Types for the actual product space data
interface ProductSpaceNodeData {
  product_code: string;
  x: string;
  y: string;
  cluster_name: string;
  total_exports: string;
  pci: string;
  total_exports_log: string;
  total_exports_sqrt: string;
  color_col: string;
  size_col: string;
  cluster_name_short: string;
  section_name: string;
  x_old: string;
  y_old: string;
}

interface ProductSpaceEdgeData {
  source: string;
  target: string;
  proximity: string;
  umap_distance: string;
  rank_source: string;
  rank_target: string;
}

interface GGProduct {
  productId: number;
  code: string;
  nameEn: string;
  nameShortEn: string;
}

interface GGCluster {
  clusterId: number;
  clusterName: string;
}

interface GGProductClusterMapping {
  supplyChainId: number;
  productId: number;
  clusterId: number;
}

interface ProductSpaceNode {
  productCode: string;
  productName?: string;
  x: number;
  y: number;
  clusterName: string | null;
  clusterNameShort: string | null;
  pci: number;
  totalExports: number;
  color: string;
  rca?: number;
  density?: number;
  isInGreenCluster?: boolean;
}

interface ClusterIndicator {
  clusterName: string;
  clusterNameShort: string;
  type: "single" | "pair" | "hull";
  color: string;
  points: [number, number][];
  centroid: [number, number];
}

// GraphQL queries for Green Growth data
const GET_CLUSTERS = gql`
  query GetClusters {
    ggClusterList {
      clusterId
      clusterName
    }
  }
`;

const GET_PRODUCTS = gql`
  query GetProducts {
    ggProductList {
      productId
      code
      nameEn
      nameShortEn
    }
  }
`;

const GET_PRODUCT_CLUSTER_MAPPINGS = gql`
  query GetProductClusterMappings($supplyChainId: Int!) {
    ggSupplyChainClusterProductMemberList(supplyChainId: $supplyChainId) {
      productId
      clusterId
    }
  }
`;

// Load and process the actual product space data
const loadProductSpaceData = async (): Promise<{
  nodes: ProductSpaceNodeData[];
  edges: ProductSpaceEdgeData[];
}> => {
  try {
    // Import the actual product space data files
    const nodesModule = await import("./umap_ps_pruned.json");
    const edgesModule = await import("./top_edges_pruned.json");

    return {
      nodes: nodesModule.default,
      edges: edgesModule.default,
    };
  } catch (error) {
    console.error("Failed to load product space data:", error);
    return { nodes: [], edges: [] };
  }
};

// Load Green Growth API data
// Helper function to process raw mappings data
const processProductClusterMappings = (
  rawMappings: { productId: number; clusterId: number }[],
): GGProductClusterMapping[] => {
  // Create unique product-cluster mappings (remove duplicates)
  const uniqueMappings = new Map<number, number>();
  rawMappings.forEach((mapping) => {
    uniqueMappings.set(mapping.productId, mapping.clusterId);
  });

  // Convert to array format expected by the component
  return Array.from(uniqueMappings.entries()).map(([productId, clusterId]) => ({
    supplyChainId: 0, // Default supply chain for this prototype
    productId,
    clusterId,
  }));
};

// Generate product space layout showing all products with Green Growth cluster overlays
const generateProductSpaceLayout = (
  productSpaceNodes: ProductSpaceNodeData[],
  greenGrowthProducts: GGProduct[],
  greenGrowthClusters: GGCluster[],
  productClusterMappings: GGProductClusterMapping[],
  colorScale: (clusterName: string) => string,
): ProductSpaceNode[] => {
  // Create lookup maps for Green Growth API data
  const productMap = new Map(greenGrowthProducts.map((p) => [p.code, p]));
  const clusterMap = new Map(greenGrowthClusters.map((c) => [c.clusterId, c]));
  const clusterMappingMap = new Map(
    productClusterMappings.map((m) => [m.productId, m.clusterId]),
  );

  const nodes: ProductSpaceNode[] = [];

  for (const psNode of productSpaceNodes) {
    // Default values for products not in Green Growth clusters
    let clusterName = null; // No cluster by default
    let clusterNameShort = null;
    let isInGreenCluster = false;

    // Check if this product has Green Growth API mapping
    const ggProduct = productMap.get(psNode.product_code);
    if (ggProduct) {
      // Check if it has a cluster mapping in Green Growth API
      const clusterId = clusterMappingMap.get(ggProduct.productId);
      if (clusterId !== undefined) {
        const cluster = clusterMap.get(clusterId);
        if (cluster) {
          // This product is in a Green Growth cluster
          clusterName = cluster.clusterName;
          clusterNameShort = cluster.clusterName;
          isInGreenCluster = true;
        }
      }
    }

    // Include all products
    nodes.push({
      productCode: psNode.product_code,
      productName: ggProduct?.nameEn || undefined,
      x: parseFloat(psNode.x),
      y: parseFloat(psNode.y),
      clusterName,
      clusterNameShort,
      pci: parseFloat(psNode.pci),
      totalExports: parseFloat(psNode.total_exports),
      color:
        isInGreenCluster && clusterName ? colorScale(clusterName) : "#cccccc", // Use cluster color or gray for non-green products
      isInGreenCluster,
    });
  }

  return nodes;
};

// Generate a color scale for clusters
const generateClusterColorScale = (clusterNames: string[]) => {
  // Create an extended color palette by combining multiple D3 schemes
  const extendedColors = [
    ...schemeCategory10,
    ...schemeSet3,
    // Add more distinct colors for additional clusters
    "#8B4513",
    "#FF1493",
    "#00CED1",
    "#FF6347",
    "#9932CC",
    "#32CD32",
    "#FFD700",
    "#DC143C",
    "#00FA9A",
    "#FF69B4",
    "#1E90FF",
    "#FFA500",
    "#ADFF2F",
    "#FF4500",
    "#DA70D6",
    "#00FF7F",
    "#B22222",
    "#87CEEB",
    "#F0E68C",
    "#DDA0DD",
    "#98FB98",
    "#F4A460",
    "#7B68EE",
    "#00BFFF",
    "#FF7F50",
  ];

  return scaleOrdinal<string, string>()
    .domain(clusterNames)
    .range(extendedColors);
};

// Calculate cluster indicators for all cluster types
const calculateClusterIndicators = (
  nodes: ProductSpaceNode[],
  colorScale: (clusterName: string) => string,
): ClusterIndicator[] => {
  const clusterGroups = new Map<string, ProductSpaceNode[]>();

  // Group nodes by cluster name (only for products in Green Growth clusters)
  for (const node of nodes) {
    if (node.clusterName && node.isInGreenCluster) {
      if (!clusterGroups.has(node.clusterName)) {
        clusterGroups.set(node.clusterName, []);
      }
      const group = clusterGroups.get(node.clusterName);
      if (group) {
        group.push(node);
      }
    }
  }

  const indicators: ClusterIndicator[] = [];

  for (const [clusterName, clusterNodes] of Array.from(clusterGroups)) {
    const points: [number, number][] = clusterNodes.map((node) => [
      node.x,
      node.y,
    ]);

    // Calculate centroid
    const centroid: [number, number] = [
      clusterNodes.reduce(
        (sum: number, node: ProductSpaceNode) => sum + node.x,
        0,
      ) / clusterNodes.length,
      clusterNodes.reduce(
        (sum: number, node: ProductSpaceNode) => sum + node.y,
        0,
      ) / clusterNodes.length,
    ];

    const color = colorScale(clusterName);
    const clusterNameShort = clusterNodes[0].clusterNameShort || clusterName;

    if (clusterNodes.length === 1) {
      // Single product: draw a circle around it
      indicators.push({
        clusterName,
        clusterNameShort,
        type: "single",
        color,
        points,
        centroid,
      });
    } else if (clusterNodes.length === 2) {
      // Two products: draw a line connecting them
      indicators.push({
        clusterName,
        clusterNameShort,
        type: "pair",
        color,
        points,
        centroid,
      });
    } else {
      // Three or more products: try to draw convex hull
      const hull = polygonHull(points);
      if (hull && hull.length >= 3) {
        indicators.push({
          clusterName,
          clusterNameShort,
          type: "hull",
          color,
          points: hull,
          centroid,
        });
      } else {
        // Fallback: treat as individual points if hull fails
        indicators.push({
          clusterName,
          clusterNameShort,
          type: "single",
          color,
          points,
          centroid,
        });
      }
    }
  }

  return indicators;
};

// Visualization component
const ProductSpaceVisualization: FC<{
  nodes: ProductSpaceNode[];
  indicators: ClusterIndicator[];
  width: number;
  height: number;
  hoveredCluster: string | null;
  onClusterHover: (clusterName: string | null) => void;
}> = ({ nodes, indicators, width, height, hoveredCluster, onClusterHover }) => {
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create scales
  const xExtent = extent(nodes, (d) => d.x) as [number, number];
  const yExtent = extent(nodes, (d) => d.y) as [number, number];

  const xScale = scaleLinear().domain(xExtent).range([0, innerWidth]).nice();

  const yScale = scaleLinear().domain(yExtent).range([innerHeight, 0]).nice();

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-labelledby="product-space-title"
    >
      <title id="product-space-title">
        Product Space Visualization with Cluster Centroids
      </title>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Grid lines */}
        {xScale.ticks(8).map((tick) => (
          <line
            key={`x-grid-${tick}`}
            x1={xScale(tick)}
            y1={0}
            x2={xScale(tick)}
            y2={innerHeight}
            stroke="#f0f0f0"
            strokeWidth={1}
          />
        ))}
        {yScale.ticks(6).map((tick) => (
          <line
            key={`y-grid-${tick}`}
            x1={0}
            y1={yScale(tick)}
            x2={innerWidth}
            y2={yScale(tick)}
            stroke="#f0f0f0"
            strokeWidth={1}
          />
        ))}

        {/* Cluster indicators */}
        {indicators.map((indicator) => {
          const isHovered = hoveredCluster === indicator.clusterName;
          const isOtherHovered =
            hoveredCluster && hoveredCluster !== indicator.clusterName;

          const centroidX = xScale(indicator.centroid[0]);
          const centroidY = yScale(indicator.centroid[1]);
          const baseRadius = 20;
          const radius = isHovered ? baseRadius + 4 : baseRadius;

          const centroidFillOpacity = isOtherHovered
            ? 0.08
            : isHovered
              ? 0.25
              : 0.15;
          const centroidStrokeOpacity = isOtherHovered
            ? 0.2
            : isHovered
              ? 1
              : 0.7;
          const labelOpacity = isOtherHovered ? 0.4 : 1;

          return (
            <g
              key={`indicator-${indicator.clusterName}`}
              style={{ cursor: "pointer" }}
            >
              {/* Show boundary only when hovered */}
              {isHovered && indicator.type === "hull" && (
                <polygon
                  points={indicator.points
                    .map((point) => `${xScale(point[0])},${yScale(point[1])}`)
                    .join(" ")}
                  fill={indicator.color}
                  fillOpacity={0.22}
                  stroke={indicator.color}
                  strokeWidth={3}
                  strokeOpacity={0.9}
                />
              )}
              {isHovered && indicator.type === "pair" && (
                <line
                  x1={xScale(indicator.points[0][0])}
                  y1={yScale(indicator.points[0][1])}
                  x2={xScale(indicator.points[1][0])}
                  y2={yScale(indicator.points[1][1])}
                  stroke={indicator.color}
                  strokeWidth={4}
                  strokeDasharray="8,4"
                  opacity={0.9}
                />
              )}
              {isHovered && indicator.type === "single" && (
                <>
                  {indicator.points.map((point) => (
                    <circle
                      key={`single-${point[0]}-${point[1]}`}
                      cx={xScale(point[0])}
                      cy={yScale(point[1])}
                      r={14}
                      fill="none"
                      stroke={indicator.color}
                      strokeWidth={3}
                      strokeDasharray="3,3"
                      opacity={0.9}
                    />
                  ))}
                </>
              )}

              {/* Centroid circle */}
              <circle
                cx={centroidX}
                cy={centroidY}
                r={radius}
                fill={indicator.color}
                fillOpacity={centroidFillOpacity}
                stroke={indicator.color}
                strokeWidth={isHovered ? 3 : 2}
                strokeOpacity={centroidStrokeOpacity}
              />

              {/* Cluster label at centroid */}
              <text
                x={centroidX}
                y={centroidY}
                textAnchor="middle"
                dy="0.35em"
                fontSize={isHovered ? 14 : 12}
                fontWeight="bold"
                fill="#000"
                stroke="white"
                strokeWidth={3}
                paintOrder="stroke"
                opacity={labelOpacity}
              >
                {indicator.clusterNameShort}
              </text>

              {/* Accessible overlay for hover/focus interactions */}
              <foreignObject
                x={centroidX - radius}
                y={centroidY - radius}
                width={radius * 2}
                height={radius * 2}
                style={{ overflow: "visible" }}
              >
                <button
                  type="button"
                  aria-label={`Highlight ${indicator.clusterNameShort}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "transparent",
                    border: 0,
                    padding: 0,
                    cursor: "pointer",
                    borderRadius: "50%",
                  }}
                  onMouseEnter={() => onClusterHover(indicator.clusterName)}
                  onMouseLeave={() => onClusterHover(null)}
                />
              </foreignObject>
            </g>
          );
        })}

        {/* Product nodes */}
        {nodes.map((node) => {
          const inHoveredCluster =
            hoveredCluster !== null && node.clusterName === hoveredCluster;
          const hasHoveredCluster = hoveredCluster !== null;

          const nodeFill = inHoveredCluster ? node.color : "#cccccc";
          const nodeRadius = inHoveredCluster ? 5 : 4;
          const nodeStroke =
            inHoveredCluster && node.isInGreenCluster ? "white" : "none";
          const nodeStrokeWidth =
            inHoveredCluster && node.isInGreenCluster ? 2 : 0;

          // Default: all nodes grey, modest opacity; when hovering a cluster, de-emphasize others
          const nodeOpacity = hasHoveredCluster
            ? inHoveredCluster
              ? 1
              : 0.15
            : 0.4;

          return (
            <circle
              key={`node-${node.productCode}`}
              cx={xScale(node.x)}
              cy={yScale(node.y)}
              r={nodeRadius}
              fill={nodeFill}
              stroke={nodeStroke}
              strokeWidth={nodeStrokeWidth}
              opacity={nodeOpacity}
            >
              <title>
                {`${node.productName || "Unknown Product"} (${node.productCode})${node.clusterName ? ` - Cluster: ${node.clusterName}` : ""} - PCI: ${node.pci.toFixed(2)}`}
              </title>
            </circle>
          );
        })}

        {/* Axes */}
        <g transform={`translate(0, ${innerHeight})`}>
          <line
            x1={0}
            y1={0}
            x2={innerWidth}
            y2={0}
            stroke="#333"
            strokeWidth={1}
          />
          {xScale.ticks(8).map((tick) => (
            <g
              key={`x-tick-${tick}`}
              transform={`translate(${xScale(tick)}, 0)`}
            >
              <line y1={0} y2={6} stroke="#333" strokeWidth={1} />
              <text y={20} textAnchor="middle" fontSize={12} fill="#666">
                {tick.toFixed(1)}
              </text>
            </g>
          ))}
          <text
            x={innerWidth / 2}
            y={50}
            textAnchor="middle"
            fontSize={14}
            fontWeight="bold"
            fill="#333"
          >
            Product Space X Coordinate →
          </text>
        </g>

        <g>
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={innerHeight}
            stroke="#333"
            strokeWidth={1}
          />
          {yScale.ticks(6).map((tick) => (
            <g
              key={`y-tick-${tick}`}
              transform={`translate(0, ${yScale(tick)})`}
            >
              <line
                x1={-6}
                y1={0}
                x2={0}
                y2={0}
                stroke="#333"
                strokeWidth={1}
              />
              <text
                x={-10}
                y={0}
                textAnchor="end"
                dy="0.35em"
                fontSize={12}
                fill="#666"
              >
                {tick.toFixed(1)}
              </text>
            </g>
          ))}
          <text
            x={-40}
            y={innerHeight / 2}
            textAnchor="middle"
            fontSize={14}
            fontWeight="bold"
            fill="#333"
            transform={`rotate(-90, -40, ${innerHeight / 2})`}
          >
            ← Product Space Y Coordinate
          </text>
        </g>
      </g>
    </svg>
  );
};

// Color Legend component
const ColorLegend: FC<{
  indicators: ClusterIndicator[];
  hoveredCluster: string | null;
  onClusterHover: (clusterName: string | null) => void;
}> = ({ indicators, hoveredCluster, onClusterHover }) => {
  if (indicators.length === 0) return null;

  return (
    <div
      style={{
        marginTop: "20px",
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        maxHeight: "200px",
        overflowY: "auto",
      }}
    >
      {indicators.map((indicator) => {
        const isHovered = hoveredCluster === indicator.clusterName;
        const isOtherHovered =
          hoveredCluster && hoveredCluster !== indicator.clusterName;

        return (
          <button
            key={indicator.clusterName}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 8px",
              border: `2px solid ${indicator.color}`,
              borderRadius: "4px",
              backgroundColor: isHovered
                ? indicator.color + "20"
                : "transparent",
              opacity: isOtherHovered ? 0.4 : 1,
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontSize: "12px",
              fontWeight: isHovered ? "bold" : "normal",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              boxShadow: isHovered ? `0 2px 8px ${indicator.color}40` : "none",
            }}
            onMouseEnter={() => onClusterHover(indicator.clusterName)}
            onMouseLeave={() => onClusterHover(null)}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: indicator.color,
                marginRight: "6px",
                borderRadius: "2px",
                opacity: isHovered ? 1 : 0.8,
              }}
            />
            <span style={{ color: "#333" }}>
              {indicator.clusterNameShort}
              <span
                style={{
                  fontSize: "10px",
                  color: "#666",
                  marginLeft: "4px",
                }}
              >
                (
                {indicator.type === "hull"
                  ? `${indicator.points.length}`
                  : indicator.type === "pair"
                    ? "2"
                    : "1"}
                )
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

// Main component
const ProductSpaceClusterBoundaries: FC = () => {
  // Product space data (loaded once)
  const [productSpaceNodes, setProductSpaceNodes] = useState<
    ProductSpaceNodeData[]
  >([]);
  const [, setProductSpaceEdges] = useState<ProductSpaceEdgeData[]>([]);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);

  // Use Apollo Client to fetch Green Growth data
  const {
    loading: loadingClusters,
    error: errorClusters,
    data: clustersData,
  } = useQuery(GET_CLUSTERS);

  const {
    loading: loadingProducts,
    error: errorProducts,
    data: productsData,
  } = useQuery(GET_PRODUCTS);

  const {
    loading: loadingMappings,
    error: errorMappings,
    data: mappingsData,
  } = useQuery(GET_PRODUCT_CLUSTER_MAPPINGS, {
    variables: { supplyChainId: 0 },
  });

  // Combine loading and error states
  const loading = loadingClusters || loadingProducts || loadingMappings;
  const error = errorClusters || errorProducts || errorMappings;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width || 1200, height: height || 800 });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load the actual product space data on component mount
  // Load product space data once on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load product space data from local files
        const { nodes, edges } = await loadProductSpaceData();
        setProductSpaceNodes(nodes);
        setProductSpaceEdges(edges);
      } catch (err) {
        console.error("Failed to load product space data:", err);
      }
    };

    loadData();
  }, []);

  // Generate visualization data
  const visualizationData = useMemo(() => {
    if (
      productSpaceNodes.length === 0 ||
      !clustersData ||
      !productsData ||
      !mappingsData
    ) {
      return { nodes: [], boundaries: [] };
    }

    // Extract and process Apollo Client data
    const greenGrowthProducts = productsData.ggProductList || [];
    const greenGrowthClusters = clustersData.ggClusterList || [];
    const productClusterMappings = processProductClusterMappings(
      mappingsData.ggSupplyChainClusterProductMemberList || [],
    );

    // Generate color scale for clusters
    const clusterNames = greenGrowthClusters.map(
      (cluster: GGCluster) => cluster.clusterName,
    );
    const colorScale = generateClusterColorScale(clusterNames);

    const nodes = generateProductSpaceLayout(
      productSpaceNodes,
      greenGrowthProducts,
      greenGrowthClusters,
      productClusterMappings,
      colorScale,
    );
    const indicators = calculateClusterIndicators(nodes, colorScale);

    // Debug: Log cluster information
    console.log("Green Growth Analysis:");
    console.log("- Total clusters in API:", greenGrowthClusters.length);
    console.log("- Total product mappings:", productClusterMappings.length);
    console.log("- Clusters with indicators:", indicators.length);

    const clustersWithProducts = new Set(
      productClusterMappings.map((m) => m.clusterId),
    );
    const clustersWithIndicators = new Set(
      indicators
        .map(
          (i) =>
            greenGrowthClusters.find(
              (c: GGCluster) => c.clusterName === i.clusterName,
            )?.clusterId,
        )
        .filter(Boolean),
    );

    console.log(
      "- Cluster IDs with products:",
      Array.from(clustersWithProducts).sort((a, b) => a - b),
    );
    console.log(
      "- Cluster IDs with indicators:",
      Array.from(clustersWithIndicators).sort((a, b) => a - b),
    );

    const missingClusters = greenGrowthClusters.filter(
      (c: GGCluster) => !clustersWithIndicators.has(c.clusterId),
    );
    console.log(
      "- Clusters without boundaries:",
      missingClusters.map((c: GGCluster) => `${c.clusterId}: ${c.clusterName}`),
    );

    return { nodes, indicators };
  }, [productSpaceNodes, clustersData, productsData, mappingsData]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FullWidthContent>
        <PageContainer>
          <ControlsContainer>
            <Typography variant="h4" gutterBottom>
              Product Space with Cluster Centroids
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              This prototype displays the product space for a given country and
              year, showing large circles at cluster centroids from the Green
              Growth taxonomy. Products are positioned using their Product
              Complexity Index (PCI) and Complexity Outlook Gain (COG) values.
              Hover a centroid to highlight its products and reveal the
              underlying boundary/connection shape.
            </Typography>
          </ControlsContainer>

          {!loading && visualizationData.nodes.length > 0 && (
            <StatsContainer>
              <StatsText>
                <strong>Products displayed:</strong>{" "}
                {visualizationData.nodes.length} total products
              </StatsText>
              <StatsText>
                <strong>Green Growth clusters:</strong>{" "}
                {visualizationData.indicators?.length || 0} clusters with visual
                indicators
              </StatsText>
              {/* <StatsText>
                <strong>Products in Green Growth clusters:</strong>{" "}
                {
                  visualizationData.nodes.filter((n) => n.isInGreenCluster)
                    .length
                }{" "}
                products
              </StatsText> */}
              <StatsText>
                <strong>Note:</strong> All products are shown as grey points by
                default. Green Growth clusters are represented by large centroid
                circles; hover a centroid to color and highlight its products
                and reveal the boundary polygon (3+), dashed line (2), or dashed
                circle (1).
              </StatsText>
            </StatsContainer>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Failed to load Green Growth data: {error.message}
            </Alert>
          )}

          <VisualizationContainer ref={containerRef}>
            {loading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <CircularProgress size={60} />
              </Box>
            ) : visualizationData.nodes.length > 0 ? (
              <>
                <ProductSpaceVisualization
                  nodes={visualizationData.nodes}
                  indicators={visualizationData.indicators || []}
                  width={dimensions.width}
                  height={dimensions.height}
                  hoveredCluster={hoveredCluster}
                  onClusterHover={setHoveredCluster}
                />
                <ColorLegend
                  indicators={visualizationData.indicators || []}
                  hoveredCluster={hoveredCluster}
                  onClusterHover={setHoveredCluster}
                />
              </>
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Typography variant="h6" color="text.secondary">
                  No data available for the selected country and year
                </Typography>
              </Box>
            )}
          </VisualizationContainer>
        </PageContainer>
      </FullWidthContent>
    </ThemeProvider>
  );
};

export default ProductSpaceClusterBoundaries;

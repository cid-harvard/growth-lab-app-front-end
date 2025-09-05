import { animated, useTransition, config } from "@react-spring/web";
import React, { memo, useMemo, useState, useRef, useEffect } from "react";
import "./scrollyCanvas.css";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import { pack, hierarchy } from "d3-hierarchy";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import {
  getSupplyChainColor,
  getLighterColorSolid,
  getDarkerColorSolid,
} from "../../utils";
import { getRCAOpacity } from "../../utils/rcaConfig";
import ClickHintBox from "../../../../../components/general/ClickHintBox";
import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import Legend from "./Legend";
import { getValueChainIcon } from "./ClusterTree/valueChainIconMapping";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { VisualizationLoading } from "../shared";
import { useImageCaptureContext } from "../../hooks/useImageCaptureContext";
import html2canvas from "html2canvas";
import { useSelectionDataModal } from "../../hooks/useSelectionDataModal";

// Unified layout calculator that positions all elements in a single coordinate system
const calculateUnifiedLayout = (
  allValueChains,
  layoutMode,
  productLookup,
  supplyChainLookup,
  containerWidth,
  containerHeight,
  isNarrow,
) => {
  // Calculate the normalized product size for this layout mode
  const normalizedProductSize = calculateAllLayoutsForSizing(
    allValueChains,
    layoutMode,
    productLookup,
  );
  // All circles will be positioned in this unified coordinate system
  const productBubbles = [];
  const clusterCircles = [];
  const valueChainCircles = [];
  const valueChainLabels = [];
  const clusterLabels = [];

  // Grid layout parameters (use MUI breakpoint flag passed in)
  const cols = isNarrow ? 2 : 5; // narrow: 2 cols, otherwise: 5 cols
  const rows = isNarrow ? 5 : 2; // narrow: 5 rows, otherwise: 2 rows

  // Reserve space for legend at bottom (approx 120px for legend + padding)
  const legendHeight = 120;
  const availableHeight = Math.max(300, containerHeight - legendHeight);
  console.log(availableHeight);
  const cellWidth = containerWidth / cols;
  // Add fixed gap between rows for annotations (70px extra per row)
  const rowGap = 70;
  const cellHeight = (availableHeight - (rows - 1) * rowGap) / rows;

  // Calculate actual rows needed for better vertical centering
  const valueChainCount = Object.keys(allValueChains).length;
  const actualRows = Math.ceil(valueChainCount / cols);
  const actualGridHeight = actualRows * cellHeight;
  const verticalOffset =
    actualRows < rows ? (availableHeight - actualGridHeight) / 2 : 0;

  // For clusters-only mode, use a different grid
  const clustersOnlyCols = isNarrow ? 2 : 4;
  const clustersOnlyRows = Math.ceil(
    Object.keys(allValueChains).length / clustersOnlyCols,
  );
  // Add explicit gaps between cluster cells so larger circles don't overlap
  // Use proportional gaps so they don't dominate the available height/width
  const clustersOnlyColGap = Math.max(12, Math.min(32, containerWidth * 0.01));
  const clustersOnlyRowGap = Math.max(
    8,
    Math.min(32, (availableHeight || 0) * 0.02),
  );
  const clusterGridWidth =
    containerWidth - Math.max(0, clustersOnlyCols - 1) * clustersOnlyColGap;
  const clusterGridHeight =
    availableHeight - Math.max(0, clustersOnlyRows - 1) * clustersOnlyRowGap;
  const clusterCellWidth = clusterGridWidth / clustersOnlyCols;
  const clusterCellHeight = clusterGridHeight / clustersOnlyRows;
  const clusterGridOffsetX = (containerWidth - clusterGridWidth) / 2;
  // Start grid at the top of the available area to avoid large top gap
  const clusterGridOffsetY = 0;
  // Equal cluster radius that fits within each grid cell
  const equalClusterRadius =
    Math.min(clusterCellWidth, clusterCellHeight) * 0.42;
  // Global product bubble radius across all clusters (clusters-only mode)
  let globalProductRadius = 4; // fallback
  if (layoutMode === "clusters-only") {
    let globalMinChildR = Infinity;
    Object.entries(allValueChains).forEach(([clusterId, clusterData]) => {
      const hierarchyData = {
        id: `cluster-${clusterId}`,
        children: (clusterData.products || []).map((product) => ({
          id: product.code || `product-${product.productId}`,
          value: 1,
        })),
      };

      const rootTmp = hierarchy(hierarchyData)
        .sum((d) => d.value || 1)
        .sort((a, b) => b.value - a.value);

      const packerTmp = pack()
        .size([equalClusterRadius * 1.8, equalClusterRadius * 1.8])
        .padding(8);

      const packedRootTmp = packerTmp(rootTmp);
      packedRootTmp.children?.forEach((node) => {
        globalMinChildR = Math.min(globalMinChildR, node.r);
      });
    });
    if (!Number.isFinite(globalMinChildR)) {
      globalMinChildR = equalClusterRadius * 0.16;
    }
    globalProductRadius = Math.max(3, globalMinChildR * 0.9);
  }
  // Compute product count range across clusters for dynamic sizing in clusters-only mode
  // Note: clusters-only uses equal radius; no per-cluster precomputation needed

  if (layoutMode === "clusters-only") {
    // Clusters-only layout: position each cluster in grid cells
    // Note: clusters can contain products from multiple value chains
    // Keep same IDs as in steps 1&2 for smooth transitions

    Object.entries(allValueChains).forEach(
      ([clusterId, clusterData], index) => {
        const col = index % clustersOnlyCols;
        const row = Math.floor(index / clustersOnlyCols);

        const cellCenterX =
          clusterGridOffsetX +
          col * (clusterCellWidth + clustersOnlyColGap) +
          clusterCellWidth / 2;
        const cellCenterY =
          clusterGridOffsetY +
          row * (clusterCellHeight + clustersOnlyRowGap) +
          clusterCellHeight / 2;

        // Equal-sized cluster circle that fits its grid cell
        const clusterRadius = equalClusterRadius;

        // Create cluster circles for each value chain this cluster appears in
        // This allows smooth transitions from step 2 where clusters are value-chain-specific
        if (clusterData.valueChains && clusterData.valueChains.length > 0) {
          clusterData.valueChains.forEach((valueChainId) => {
            clusterCircles.push({
              id: `cluster-${clusterId}-vc-${valueChainId}`, // Same ID format as step 2
              x: cellCenterX,
              y: cellCenterY,
              r: clusterRadius,
              clusterId: parseInt(clusterId),
              clusterName: clusterData.clusterName,
              productCount: clusterData.products.length,
              fill: "#F8FCFF", // Extremely light blue background, almost white
              stroke: "#5DADE2", // Medium blue for stroke
              strokeWidth: 1, // Reduced from 2 to 1
            });
          });
        } else {
          // Fallback for clusters without value chain info
          clusterCircles.push({
            id: `cluster-${clusterId}`,
            x: cellCenterX,
            y: cellCenterY,
            r: clusterRadius,
            clusterId: parseInt(clusterId),
            clusterName: clusterData.clusterName,
            productCount: clusterData.products.length,
            fill: "#7BB3D9", // Lighter, less bright version of #2685BD
            stroke: "#1E5A8A", // Darker version for stroke
            strokeWidth: 2,
          });
        }

        // Add cluster label positioned above the cluster circle with character limit
        const maxChars = 24; // Allow a few more characters before truncation
        const truncatedName =
          clusterData.clusterName.length > maxChars
            ? clusterData.clusterName.substring(0, maxChars - 3) + "..."
            : clusterData.clusterName;

        clusterLabels.push({
          id: `cluster-label-${clusterId}`,
          x: cellCenterX,
          y: cellCenterY - clusterRadius - 5, // Moved even closer to the circle
          text: truncatedName,
          clusterId: parseInt(clusterId),
        });

        // Position products within the cluster circle using circle packing
        const productValue = 1;
        const hierarchyData = {
          id: `cluster-${clusterId}`,
          children: clusterData.products.map((product) => {
            const productDetails = productLookup.get(product.productId);
            return {
              id: product.code || `product-${product.productId}`,
              value: productValue,
              data: product,
              product: productDetails,
            };
          }),
        };

        const root = hierarchy(hierarchyData)
          .sum((d) => d.value || 1)
          .sort((a, b) => b.value - a.value);

        const packer = pack()
          .size([clusterRadius * 1.8, clusterRadius * 1.8])
          .padding(8);

        const packedRoot = packer(root);
        const layoutCenterX = clusterRadius * 0.9;
        const layoutCenterY = clusterRadius * 0.9;
        // Use global product radius so all product bubbles share one size

        packedRoot.children?.forEach((productNode) => {
          const product = productNode.data.data;
          const productDetails = productNode.data.product;

          // For clusters-only mode, we need to create product entries that match
          // the EXACT same IDs used in steps 1&2, so they can transition smoothly
          // Products in clusters-only should transition from their original value chain positions

          // Find all value chains this product appears in, so we can create
          // matching entries for smooth transitions
          if (product.valueChains && product.valueChains.length > 0) {
            product.valueChains.forEach((valueChainId) => {
              const layoutSpecificProductId = `product-${product.productId}-vc-${valueChainId}`;

              productBubbles.push({
                id: layoutSpecificProductId, // SAME ID as in steps 1&2
                x: cellCenterX + (productNode.x - layoutCenterX),
                y: cellCenterY + (productNode.y - layoutCenterY),
                r: globalProductRadius,
                title: productDetails?.nameShortEn,
                rca: product.exportRca,
                product: productDetails,
                data: product,
                clusterId: parseInt(clusterId),
                valueChainId: valueChainId,
                opacity: 1,
                fill: "#2685BD",
                globalProductId: `product-${product.productId}`,
                // Keep track of original position context for transitions
                layoutContext: {
                  type: "cluster-only",
                  clusterId: parseInt(clusterId),
                  clusterName: clusterData.clusterName,
                  originalValueChainId: valueChainId,
                },
              });
            });
          } else {
            // Fallback: create at least one instance with no specific value chain
            const globalProductId = `product-${product.productId}`;
            productBubbles.push({
              id: globalProductId,
              x: cellCenterX + (productNode.x - layoutCenterX),
              y: cellCenterY + (productNode.y - layoutCenterY),
              r: globalProductRadius,
              title: productDetails?.nameShortEn,
              rca: product.exportRca,
              product: productDetails,
              data: product,
              clusterId: parseInt(clusterId),
              valueChainId: null,
              opacity: 1,
              fill: "#2685BD",
              globalProductId,
              layoutContext: {
                type: "cluster-only",
                clusterId: parseInt(clusterId),
                clusterName: clusterData.clusterName,
              },
            });
          }
        });
      },
    );
  } else {
    // Value chain layouts (flat and clustered)
    const sortedValueChains = Object.entries(allValueChains).sort(
      ([aId], [bId]) => {
        const aSupplyChainDetails = supplyChainLookup.get(parseInt(aId));
        const bSupplyChainDetails = supplyChainLookup.get(parseInt(bId));
        const aName = aSupplyChainDetails?.supplyChain || `Supply Chain ${aId}`;
        const bName = bSupplyChainDetails?.supplyChain || `Supply Chain ${bId}`;

        const valueChainNameToSortOrder = {
          "Electric Vehicles": 0,
          "Heat Pumps": 1,
          "Fuel Cells And Green Hydrogen": 2,
          "Wind Power": 3,
          "Solar Power": 4,
          "Hydroelectric Power": 5,
          "Nuclear Power": 6,
          Batteries: 7,
          "Electric Grid": 8,
          "Critical Metals and Minerals": 9,
        };

        const aOrder = valueChainNameToSortOrder[aName] ?? 999;
        const bOrder = valueChainNameToSortOrder[bName] ?? 999;
        return aOrder - bOrder;
      },
    );

    sortedValueChains.forEach(([supplyChainId, chainData], index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const cellCenterX = (col + 0.5) * cellWidth;
      const cellCenterY =
        (row + 0.5) * cellHeight + row * rowGap + verticalOffset;

      // Value chain boundary circle - made bigger for better visibility
      const valueChainRadius = Math.min(cellWidth, cellHeight) * 0.45; // Increased from 0.4 to 0.45

      const supplyChainDetails = supplyChainLookup.get(parseInt(supplyChainId));
      const supplyChainName =
        supplyChainDetails?.supplyChain || `Supply Chain ${supplyChainId}`;

      valueChainCircles.push({
        id: `value-chain-${supplyChainId}`,
        x: cellCenterX,
        y: cellCenterY,
        r: valueChainRadius,
        supplyChainId: parseInt(supplyChainId),
        supplyChainName,
        fill: "none",
        stroke: getSupplyChainColor(supplyChainId),
        strokeWidth: 2,
      });

      // Get icon for this value chain
      const valueChainIcon = getValueChainIcon(supplyChainName);

      // Always use standard positioning - grid layout ensures adequate space
      valueChainLabels.push({
        id: `label-${supplyChainId}`,
        x: cellCenterX,
        y: cellCenterY - valueChainRadius - 15, // Moved down 5px for more spacing from icon
        text: supplyChainName,
        supplyChainId: parseInt(supplyChainId),
        icon: valueChainIcon,
        iconX: cellCenterX,
        iconY: cellCenterY - valueChainRadius - 55, // Standard icon position
      });

      if (layoutMode === "clustered" && chainData.clusters) {
        // Clustered layout within value chain
        const hierarchyData = {
          id: `sc-${supplyChainId}`,
          children: Object.entries(chainData.clusters).map(
            ([clusterId, clusterData]) => ({
              id: `cluster-${clusterId}`,
              name: clusterData.clusterName,
              clusterId: parseInt(clusterId),
              children: clusterData.products.map((product) => ({
                id: product.code,
                value: 1,
                data: product,
              })),
            }),
          ),
        };

        const root = hierarchy(hierarchyData)
          .sum((d) => d.value || 0)
          .sort((a, b) => b.value - a.value);

        const packer = pack()
          .size([valueChainRadius * 1.8, valueChainRadius * 1.8])
          .padding(3); // 3px padding between clusters as requested

        const packedRoot = packer(root);
        const layoutCenterX = valueChainRadius * 0.9;
        const layoutCenterY = valueChainRadius * 0.9;

        packedRoot.children?.forEach((clusterNode) => {
          clusterCircles.push({
            id: `cluster-${clusterNode.data.clusterId}-vc-${supplyChainId}`, // Value-chain-specific cluster ID for step 2
            x: cellCenterX + (clusterNode.x - layoutCenterX),
            y: cellCenterY + (clusterNode.y - layoutCenterY),
            r: clusterNode.r,
            clusterId: clusterNode.data.clusterId,
            valueChainId: parseInt(supplyChainId),
            fill: getLighterColorSolid(
              getSupplyChainColor(supplyChainId),
              0.95,
            ), // Extremely light cluster background
            stroke: getDarkerColorSolid(
              getSupplyChainColor(supplyChainId),
              0.2,
            ),
            strokeWidth: 0.5, // Reduced from 1 to 0.5
          });

          clusterNode.children?.forEach((productNode) => {
            const product = productNode.data.data;
            const productDetails = productLookup.get(product.productId);

            // Use value-chain-specific product ID for flat/clustered layouts
            // This allows products to appear in multiple value chains
            const layoutSpecificProductId = `product-${product.productId}-vc-${supplyChainId}`;

            productBubbles.push({
              id: layoutSpecificProductId,
              x: cellCenterX + (productNode.x - layoutCenterX),
              y: cellCenterY + (productNode.y - layoutCenterY),
              r: normalizedProductSize,
              title: productDetails?.nameShortEn,
              rca: product.exportRca,
              product: productDetails,
              data: product,
              clusterId: clusterNode.data.clusterId,
              valueChainId: parseInt(supplyChainId),
              opacity: 1,
              fill: getSupplyChainColor(supplyChainId),
              // Keep track of original position context for transitions
              globalProductId: `product-${product.productId}`, // For transition mapping
              layoutContext: {
                type: "clustered",
                valueChainId: parseInt(supplyChainId),
                clusterId: clusterNode.data.clusterId,
                clusterName: clusterNode.data.name,
                valueChainName: supplyChainName,
              },
            });
          });
        });
      } else {
        // Flat layout within value chain
        const hierarchyData = {
          id: `sc-${supplyChainId}`,
          children: chainData.products.map((product) => {
            const productDetails = productLookup.get(product.productId);
            return {
              id: product.code,
              value: 1,
              data: product,
              product: productDetails,
            };
          }),
        };

        const root = hierarchy(hierarchyData)
          .sum((d) => d.value || 1)
          .sort((a, b) => b.value - a.value);

        const packer = pack()
          .size([valueChainRadius * 1.8, valueChainRadius * 1.8])
          .padding(Math.max(1.0, valueChainRadius * 0.01));

        const packedRoot = packer(root);
        const layoutCenterX = valueChainRadius * 0.9;
        const layoutCenterY = valueChainRadius * 0.9;

        packedRoot.children?.forEach((productNode) => {
          const product = productNode.data.data;
          const productDetails = productNode.data.product;

          // Use value-chain-specific product ID for flat/clustered layouts
          // This allows products to appear in multiple value chains
          const layoutSpecificProductId = `product-${product.productId}-vc-${supplyChainId}`;

          productBubbles.push({
            id: layoutSpecificProductId,
            x: cellCenterX + (productNode.x - layoutCenterX),
            y: cellCenterY + (productNode.y - layoutCenterY),
            r: normalizedProductSize,
            title: productDetails?.nameShortEn,
            rca: product.exportRca,
            product: productDetails,
            data: product,
            clusterId: null,
            valueChainId: parseInt(supplyChainId),
            opacity: 1,
            fill: getSupplyChainColor(supplyChainId),
            // Keep track of original position context for transitions
            globalProductId: `product-${product.productId}`, // For transition mapping
            layoutContext: {
              type: "flat",
              valueChainId: parseInt(supplyChainId),
              valueChainName: supplyChainName,
            },
          });
        });
      }
    });
  }

  return {
    productBubbles,
    clusterCircles,
    valueChainCircles,
    valueChainLabels,
    clusterLabels,
  };
};

// Calculate all layouts to determine minimum product size per layout mode
const calculateAllLayoutsForSizing = (
  allValueChains,
  layoutMode,
  productLookup,
) => {
  const REFERENCE_SIZE = 200;
  let minProductRadius = Infinity;

  if (layoutMode === "clusters-only") {
    // For clusters-only mode, calculate minimum product size across all clusters
    Object.entries(allValueChains).forEach(([clusterId, clusterData]) => {
      const hierarchyData = {
        id: `cluster-${clusterId}`,
        children: clusterData.products.map((product) => {
          const productDetails = productLookup.get(product.productId);
          return {
            id: product.code || `product-${product.productId}`,
            value: 1,
            data: product,
            product: productDetails,
          };
        }),
      };

      const root = hierarchy(hierarchyData)
        .sum((d) => d.value || 1)
        .sort((a, b) => b.value - a.value);

      const packer = pack()
        .size([REFERENCE_SIZE * 2.2, REFERENCE_SIZE * 2.2]) // Match the actual layout
        .padding(8); // Match the actual layout padding

      const packedRoot = packer(root);

      packedRoot.children?.forEach((productNode) => {
        // Scale products to fit nicely within clusters, with a very small multiplier
        const scaledRadius = Math.max(0.8, productNode.r * 0.15); // Reduced from 0.25 to 0.15
        minProductRadius = Math.min(minProductRadius, scaledRadius);
      });
    });
  } else {
    // For flat and clustered layouts, calculate minimum across all value chains
    Object.entries(allValueChains).forEach(
      ([supplyChainId, supplyChainData]) => {
        const { products, clusters } = supplyChainData;

        if (layoutMode === "clustered" && clusters) {
          // Clustered layout
          const hierarchyData = {
            id: `sc-${supplyChainId}`,
            children: Object.entries(clusters).map(
              ([clusterId, clusterData]) => ({
                id: `cluster-${clusterId}`,
                name: clusterData.clusterName,
                clusterId: parseInt(clusterId),
                children: clusterData.products.map((product) => ({
                  id: product.code || `product-${product.productId}`,
                  value: 1,
                  data: product,
                })),
              }),
            ),
          };

          const root = hierarchy(hierarchyData)
            .sum((d) => d.value || 0)
            .sort((a, b) => b.value - a.value);

          const packer = pack()
            .size([REFERENCE_SIZE * 0.95, REFERENCE_SIZE * 0.95])
            .padding(3); // 3px padding between clusters as requested

          const packedRoot = packer(root);

          packedRoot.children?.forEach((clusterNode) => {
            clusterNode.children?.forEach((productNode) => {
              minProductRadius = Math.min(minProductRadius, productNode.r);
            });
          });
        } else {
          // Flat layout
          const hierarchyData = {
            id: `sc-${supplyChainId}`,
            children: products.map((product) => {
              const productDetails = productLookup.get(product.productId);
              return {
                id: product.code || `product-${product.productId}`,
                value: 1,
                data: product,
                product: productDetails,
              };
            }),
          };

          const root = hierarchy(hierarchyData)
            .sum((d) => d.value || 1)
            .sort((a, b) => b.value - a.value);

          const packer = pack()
            .size([REFERENCE_SIZE * 0.95, REFERENCE_SIZE * 0.95])
            .padding(Math.max(1.0, REFERENCE_SIZE * 0.01));

          const packedRoot = packer(root);

          packedRoot.children?.forEach((productNode) => {
            minProductRadius = Math.min(minProductRadius, productNode.r);
          });
        }
      },
    );
  }

  return Math.max(3, minProductRadius * 0.8); // Apply same scaling as in actual layout
};

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  compactDisplay: "short",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// Data transformation helper for clusters-only layout
const transformDataForClustersOnly = (
  ggCpyList,
  ggCpyscList,
  clusterLookup,
) => {
  if (!ggCpyList || !ggCpyscList || !clusterLookup.size) return {};

  const clusters = {};

  // Create mapping from productId to value chains for transition purposes
  const productToValueChains = new Map();
  ggCpyscList.forEach((item) => {
    const { supplyChainId, productId } = item;
    if (!productToValueChains.has(productId)) {
      productToValueChains.set(productId, []);
    }
    productToValueChains.get(productId).push(supplyChainId);
  });

  // Group products by cluster, deduplicating across value chains
  ggCpyList.forEach((product) => {
    const clusterInfo = clusterLookup.get(product.productId);
    if (clusterInfo) {
      const { clusterId, clusterName } = clusterInfo;

      if (!clusters[clusterId]) {
        clusters[clusterId] = {
          clusterId,
          clusterName,
          products: [],
          // Store which value chains this cluster's products belong to
          valueChains: new Set(),
        };
      }

      // Only add product if not already in this cluster (deduplicate)
      const existingProduct = clusters[clusterId].products.find(
        (p) => p.productId === product.productId,
      );
      if (!existingProduct) {
        clusters[clusterId].products.push({
          ...product,
          // Add value chain info for transition mapping
          valueChains: productToValueChains.get(product.productId) || [],
        });

        // Track which value chains this cluster spans
        const productValueChains =
          productToValueChains.get(product.productId) || [];
        productValueChains.forEach((vcId) =>
          clusters[clusterId].valueChains.add(vcId),
        );
      }
    }
  });

  // Convert Set to Array for easier iteration
  Object.values(clusters).forEach((cluster) => {
    cluster.valueChains = Array.from(cluster.valueChains);
  });

  return clusters;
};

// Data transformation helper
const transformDataForValueChains = (
  ggCpyList,
  ggCpyscList,
  clusterLookup,
  layoutMode,
) => {
  if (!ggCpyList || !ggCpyscList) return {};

  // Handle clusters-only layout separately
  if (layoutMode === "clusters-only") {
    return transformDataForClustersOnly(ggCpyList, ggCpyscList, clusterLookup);
  }

  const valueChains = {};

  // Group products by supply chain
  ggCpyscList.forEach((item) => {
    const { supplyChainId, productId } = item;
    const product = ggCpyList.find((p) => p.productId === productId);
    if (!product) return;

    if (!valueChains[supplyChainId]) {
      valueChains[supplyChainId] = {
        supplyChainId,
        products: [],
        clusters: {},
      };
    }

    valueChains[supplyChainId].products.push(product);

    // Add clustering info if in clustered mode
    if (layoutMode === "clustered" && clusterLookup.size) {
      const clusterInfo = clusterLookup.get(productId);
      if (clusterInfo) {
        const { clusterId, clusterName } = clusterInfo;
        if (!valueChains[supplyChainId].clusters[clusterId]) {
          valueChains[supplyChainId].clusters[clusterId] = {
            clusterId,
            clusterName,
            products: [],
          };
        }
        valueChains[supplyChainId].clusters[clusterId].products.push(product);
      }
    }
  });

  return valueChains;
};

// Unified SVG component that handles all three layout modes with smooth transitions
const UnifiedCirclePack = ({ view, showTooltip, hideTooltip }) => {
  const theme = useTheme();
  const yearSelection = useYearSelection();
  const countrySelection = useCountrySelection();
  const { fill, layoutMode: initialLayoutMode = "flat" } = view;

  // State for layout mode toggle
  const [layoutMode, setLayoutMode] = useState(initialLayoutMode);
  const [hoveredProductGlobalId, setHoveredProductGlobalId] = useState(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Determine narrowness based on the visualization container width, not window width
  const isNarrow = useMemo(() => {
    return (dimensions?.width || 0) < (theme.breakpoints?.values?.sm || 600);
  }, [dimensions.width, theme]);

  // Update layout mode when view changes
  useEffect(() => {
    setLayoutMode(initialLayoutMode);
  }, [initialLayoutMode]);

  // Image capture functionality
  const { registerCaptureFunction, unregisterCaptureFunction } =
    useImageCaptureContext();
  // Contextual selection modal (must be declared before any early returns)
  const { openSelectionModal } = useSelectionDataModal();

  // Use shared data fetching hook
  const {
    countryData,
    productClusterRows,
    isLoading,
    isInitialLoading,
    isCountryDataLoading,
    hasPreviousData,
    hasErrors,
  } = useGreenGrowthData(parseInt(countrySelection), parseInt(yearSelection));

  // Extract data for compatibility
  const currentData = useMemo(() => {
    if (!countryData?.productData) return null;
    return {
      ggCpyList: countryData.productData,
      ggCpyscList: countryData.productSupplyChainData || [],
      productClusterRows: productClusterRows || [],
    };
  }, [countryData, productClusterRows]);

  // Enhanced loading state logic
  // Show loading if:
  // 1. Initial loading with no previous data
  // 2. No current data available at all
  // 3. Core data is still loading and no usable data exists
  const shouldShowLoading =
    (isInitialLoading && !hasPreviousData) ||
    (!currentData && isLoading) ||
    (!currentData && isCountryDataLoading);

  const loading = shouldShowLoading;
  const error = hasErrors;

  const supplyChainLookup = useSupplyChainLookup();
  const productLookup = useProductLookup();

  // Create cluster lookup from productClusterRows
  const clusterLookup = useMemo(() => {
    if (!currentData?.productClusterRows) return new Map();

    const lookup = new Map();
    currentData.productClusterRows.forEach((row) => {
      lookup.set(row.product_id, {
        clusterId: row.dominant_cluster,
        clusterName: row.cluster_name,
        supplyChain: row.supply_chain,
      });
    });
    return lookup;
  }, [currentData?.productClusterRows]);

  // Transform data for value chains or clusters
  const valueChains = useMemo(() => {
    if (!currentData) return {};
    return transformDataForValueChains(
      currentData.ggCpyList,
      currentData.ggCpyscList,
      clusterLookup,
      layoutMode,
    );
  }, [currentData, clusterLookup, layoutMode]);

  // Calculate container dimensions
  useEffect(() => {
    if (!containerRef?.current) return;

    const updateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: rect.height,
      });
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate unified layout
  const unifiedLayout = useMemo(() => {
    if (!valueChains || Object.keys(valueChains).length === 0) {
      return {
        productBubbles: [],
        clusterCircles: [],
        valueChainCircles: [],
        valueChainLabels: [],
        clusterLabels: [],
      };
    }

    return calculateUnifiedLayout(
      valueChains,
      layoutMode,
      productLookup,
      supplyChainLookup,
      dimensions.width,
      dimensions.height,
      isNarrow,
    );
  }, [
    valueChains,
    layoutMode,
    productLookup,
    supplyChainLookup,
    dimensions,
    isNarrow,
  ]);

  // Apply dynamic properties (opacity for RCA)
  const processedBubbles = useMemo(() => {
    return unifiedLayout.productBubbles.map((bubble) => {
      const computedOpacity = fill === "rca" ? getRCAOpacity(bubble.rca) : 1;
      const gpId =
        bubble.globalProductId ||
        (bubble?.data?.productId
          ? `product-${bubble.data.productId}`
          : undefined);
      const highlighted =
        hoveredProductGlobalId && gpId
          ? gpId === hoveredProductGlobalId
          : false;
      return {
        ...bubble,
        opacity: computedOpacity,
        highlighted,
      };
    });
  }, [unifiedLayout.productBubbles, fill, hoveredProductGlobalId]);
  const sharedConfig = { ...config.gentle, tension: 140, friction: 20 };
  // Product bubble transitions
  const productTransitions = useTransition(processedBubbles, {
    from: (item) => ({
      fillOpacity: 0,
      r: 0,
      x: item.x,
      y: item.y,
    }),
    enter: (item) => ({
      fillOpacity: item.opacity,
      r: item.r,
      x: item.x,
      y: item.y,
    }),
    update: (item) => ({
      fillOpacity: item.opacity,
      r: item.r,
      x: item.x,
      y: item.y,
    }),
    leave: () => ({
      fillOpacity: 0,
      r: 0,
    }),
    keys: (item) => item.id,
    config: sharedConfig,
  });

  // Cluster circle transitions
  const clusterTransitions = useTransition(unifiedLayout.clusterCircles, {
    from: (item) => ({
      r: 0,
      x: item.x,
      y: item.y,
    }),
    enter: (item) => ({
      r: item.r,
      x: item.x,
      y: item.y,
    }),
    update: (item) => ({
      r: item.r,
      x: item.x,
      y: item.y,
    }),
    leave: () => ({
      r: 0,
    }),
    keys: (item) => item.id,
    config: sharedConfig,
  });

  // Value chain circle transitions
  const valueChainTransitions = useTransition(unifiedLayout.valueChainCircles, {
    from: (item) => ({
      strokeOpacity: 0,
      r: 0,
      x: item.x,
      y: item.y,
    }),
    enter: (item) => ({
      strokeOpacity: 1,
      r: item.r,
      x: item.x,
      y: item.y,
    }),
    update: (item) => ({
      strokeOpacity: 1,
      r: item.r,
      x: item.x,
      y: item.y,
    }),
    leave: () => ({
      strokeOpacity: 0,
      r: 0,
    }),
    keys: (item) => item.id,
    config: sharedConfig,
  });

  // Value chain label transitions
  const labelTransitions = useTransition(unifiedLayout.valueChainLabels, {
    from: (item) => ({
      opacity: 0,
      x: item.x,
      y: item.y,
    }),
    enter: (item) => ({
      opacity: 1,
      x: item.x,
      y: item.y,
    }),
    update: (item) => ({
      opacity: 1,
      x: item.x,
      y: item.y,
    }),
    leave: () => ({
      opacity: 0,
    }),
    keys: (item) => item.id,
    config: sharedConfig,
  });

  // Cluster label transitions
  const clusterLabelTransitions = useTransition(unifiedLayout.clusterLabels, {
    from: (item) => ({
      opacity: 0,
      x: item.x,
      y: item.y,
    }),
    enter: (item) => ({
      opacity: 1,
      x: item.x,
      y: item.y,
    }),
    update: (item) => ({
      opacity: 1,
      x: item.x,
      y: item.y,
    }),
    leave: () => ({
      opacity: 0,
    }),
    keys: (item) => item.id,
    config: sharedConfig,
  });

  // Register image capture function
  useEffect(() => {
    const handleCaptureImage = async () => {
      if (!containerRef.current) {
        console.warn("Chart container not found");
        return;
      }

      try {
        const canvas = await html2canvas(containerRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `supply_chain_bubbles_${countrySelection}_${yearSelection}_${layoutMode}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, "image/png");
      } catch (error) {
        console.error("Error capturing image:", error);
      }
    };

    registerCaptureFunction(handleCaptureImage);
    return () => {
      unregisterCaptureFunction();
    };
  }, [
    registerCaptureFunction,
    unregisterCaptureFunction,
    countrySelection,
    yearSelection,
    layoutMode,
  ]);

  // Show loading state
  if (loading) {
    const loadingMessage = isInitialLoading
      ? "Loading visualization data..."
      : isCountryDataLoading && !hasPreviousData
        ? "Loading country data..."
        : "Loading data...";

    return <VisualizationLoading message={loadingMessage} />;
  }

  // Show error state
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.secondary", mb: 1, textAlign: "center" }}
        >
          Unable to load visualization data
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.disabled", textAlign: "center" }}
        >
          Please try refreshing the page or selecting a different country/year
        </Typography>
      </Box>
    );
  }

  const isClustersOnlyMode = layoutMode === "clusters-only";
  const svgAriaLabel = isClustersOnlyMode
    ? "Industrial Clusters & Products"
    : layoutMode === "clustered"
      ? "Green Value Chains, Industrial Clusters & Products"
      : "Green Value Chains and Products";

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "white",
      }}
    >
      {/* Main Title */}
      <Box
        sx={{
          height: 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          mb: 1,
        }}
      >
        <Typography variant="chart-title">
          {isClustersOnlyMode
            ? "Industrial Clusters & Products"
            : layoutMode === "clustered"
              ? "Green Value Chains, Industrial Clusters & Products"
              : "Green Value Chains and Products"}
        </Typography>
      </Box>

      {/* Header Controls */}
      <Box
        sx={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 0,
          px: 2,
        }}
      >
        {/* Instruction text */}
        <ClickHintBox text="Click on a bubble to see its products" />
      </Box>

      {/* Unified SVG */}
      <Box
        sx={{
          marginTop: {
            xs: "80px",
            md: "80px",
          },
          marginBottom: {
            xs: "160px",
            md: "120px",
          },
          height: {
            xs: "calc(100vh - 240px)",
            md: "calc(100vh - 200px)",
          },
          width: "100%",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: "visible" }}
          role="img"
          aria-label={svgAriaLabel}
          aria-describedby="circle-pack-desc"
        >
          <desc id="circle-pack-desc">
            Interactive bubble chart of green value chains, clusters, and
            products. Hover or focus a bubble to see details.
          </desc>
          {/* Click hint now rendered above in header controls to avoid overlap */}
          {/* Value chain boundary circles */}
          {valueChainTransitions((style, circle) => (
            <animated.circle
              key={circle.id}
              cx={style.x}
              cy={style.y}
              r={style.r}
              fill={circle.fill}
              stroke={circle.stroke}
              strokeWidth={circle.strokeWidth}
              strokeOpacity={style.strokeOpacity}
              pointerEvents="none"
            />
          ))}

          {/* Cluster circles */}
          {clusterTransitions((style, circle) => (
            <animated.circle
              key={circle.id}
              cx={style.x}
              cy={style.y}
              r={style.r}
              fill={circle.fill}
              stroke={circle.stroke}
              strokeWidth={circle.strokeWidth}
              pointerEvents={layoutMode === "clusters-only" ? "all" : "none"}
              style={
                layoutMode === "clusters-only" ? { cursor: "pointer" } : {}
              }
              onMouseEnter={
                layoutMode === "clusters-only"
                  ? (event) => {
                      const { clientX, clientY } = event;
                      showTooltip({
                        tooltipData: {
                          type: "cluster",
                          data: {
                            clusterName: circle.clusterName,
                            productCount: circle.productCount,
                          },
                        },
                        tooltipLeft: clientX,
                        tooltipTop: clientY,
                      });
                    }
                  : undefined
              }
              onMouseLeave={
                layoutMode === "clusters-only" ? () => hideTooltip() : undefined
              }
              onClick={
                layoutMode === "clusters-only"
                  ? () =>
                      openSelectionModal({
                        type: "cluster",
                        clusterId: circle.clusterId,
                        title: circle.clusterName,
                        source: "circle-pack",
                        detailLevel: "basic",
                      })
                  : undefined
              }
            />
          ))}

          {/* Product bubbles */}
          {productTransitions((style, bubble) => (
            <animated.circle
              key={bubble.id}
              cx={style.x}
              cy={style.y}
              r={style.r}
              fill={bubble.fill}
              fillOpacity={style.fillOpacity}
              stroke={bubble.highlighted ? "#000" : "none"}
              strokeWidth={bubble.highlighted ? 2 : 0}
              style={
                layoutMode === "clusters-only" ? {} : { cursor: "pointer" }
              }
              pointerEvents={layoutMode === "clusters-only" ? "none" : "all"}
              onMouseEnter={
                layoutMode === "clusters-only"
                  ? undefined
                  : (event) => {
                      const { clientX, clientY } = event;
                      const gpId =
                        bubble.globalProductId ||
                        (bubble?.data?.productId
                          ? `product-${bubble.data.productId}`
                          : undefined);
                      if (gpId) setHoveredProductGlobalId(gpId);
                      showTooltip({
                        tooltipData: {
                          type: "product",
                          data: {
                            product: bubble.product,
                            nameShortEn: bubble.product?.nameShortEn,
                            code: bubble.product?.code,
                            exportValue: bubble.data?.exportValue,
                            exportRca: bubble.data?.exportRca,
                            // Include cluster information when available (clustered layout)
                            clusterName: bubble?.layoutContext?.clusterName,
                            clusterId: bubble?.clusterId,
                            year: parseInt(yearSelection),
                          },
                        },
                        tooltipLeft: clientX,
                        tooltipTop: clientY,
                      });
                    }
              }
              onMouseLeave={
                layoutMode === "clusters-only"
                  ? undefined
                  : () => {
                      setHoveredProductGlobalId(null);
                      hideTooltip();
                    }
              }
              onClick={
                layoutMode === "clusters-only"
                  ? undefined
                  : () =>
                      openSelectionModal({
                        type: "product",
                        productId: bubble?.data?.productId,
                        title: bubble.product?.nameShortEn,
                        source: "circle-pack",
                        detailLevel: "basic",
                      })
              }
            />
          ))}

          {/* Value chain icons and labels */}
          {labelTransitions((style, label) => (
            <React.Fragment key={label.id}>
              {/* Value chain icon */}
              {label.icon && (
                <animated.image
                  href={label.icon}
                  x={label.iconX - 17.5} // Center 35px icon
                  y={label.iconY - 17.5}
                  width="35"
                  height="35"
                  opacity={style.opacity}
                  pointerEvents="none"
                />
              )}
              {/* Value chain text */}
              <animated.text
                x={style.x}
                y={style.y}
                textAnchor="middle"
                fontSize="16"
                fontWeight="600"
                fill="#000"
                opacity={style.opacity}
                pointerEvents="none"
              >
                {label.text}
              </animated.text>
            </React.Fragment>
          ))}

          {/* Cluster labels */}
          {clusterLabelTransitions((style, label) => (
            <animated.text
              key={label.id}
              x={style.x}
              y={style.y}
              textAnchor="middle"
              fontSize="16"
              fontWeight="600"
              fill="#000"
              opacity={style.opacity}
              pointerEvents="none"
              style={{
                maxWidth: "130px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {label.text}
            </animated.text>
          ))}
        </svg>
      </Box>

      {/* RCA Legend Section */}
      {view.legend && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 19,
            padding: {
              xs: "24px 12px 20px 12px",
              md: "20px 16px 16px 16px",
            },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: {
              xs: "80px",
              md: "60px",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Legend key={view.legend} mode={view.legend} />
          </Box>
        </Box>
      )}

      {/* Attribution */}
      <Typography
        variant="chart-attribution"
        sx={{
          position: "absolute",
          right: 16,
          bottom: 8,
          zIndex: 25,
          fontSize: "10px",
        }}
      >
        {view.source}
      </Typography>
    </Box>
  );
};

const CirclePack = ({ view, showTooltip, hideTooltip }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <UnifiedCirclePack
        view={view}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
      />
    </div>
  );
};

export default memo(CirclePack);

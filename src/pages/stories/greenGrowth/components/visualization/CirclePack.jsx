import { animated, useTransition, config } from "@react-spring/web";
import React, { memo, useMemo, useState, useRef, useEffect } from "react";
import "./scrollyCanvas.css";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import { pack, hierarchy } from "d3-hierarchy";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import { getSupplyChainColor, getDarkerColorSolid } from "../../utils";
import { getRCAOpacity, getRCABlueColor } from "../../utils/rcaConfig";
import ClickHintBox from "../../../../../components/general/ClickHintBox";
import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import Legend from "./Legend";
import { getValueChainIcon } from "./ClusterTree/valueChainIconMapping";
import Box from "@mui/material/Box";
import { Typography, useMediaQuery } from "@mui/material";
import { ParentSize } from "@visx/responsive";
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
  isShortHeight,
) => {
  // normalizedProductSize will be calculated after cell dimensions are known
  let normalizedProductSize = 0;
  // All circles will be positioned in this unified coordinate system
  const productBubbles = [];
  const clusterCircles = [];
  const valueChainCircles = [];
  const valueChainLabels = [];
  const clusterLabels = [];

  // Grid layout parameters (use MUI breakpoint flag passed in)
  const cols = isNarrow ? 2 : 5; // narrow: 2 cols, otherwise: 5 cols
  const rows = isNarrow ? 5 : 2; // narrow: 5 rows, otherwise: 2 rows

  // With flexbox layout, ParentSize gives us the actual available height
  // No need to reserve space for legend - flexbox handles that
  const availableHeight = Math.max(360, containerHeight);
  // Horizontal gaps between value chains
  const colGap = isNarrow ? 12 : 2;
  const totalGapWidth = Math.max(0, cols - 1) * colGap;
  const cellWidth = (containerWidth - totalGapWidth) / cols;
  const gridTotalWidth = cols * cellWidth + totalGapWidth;
  const gridOffsetX = (containerWidth - gridTotalWidth) / 2;
  // Vertical gaps between rows: larger for 2-row (wide) layout, smaller for multi-row (narrow) layout
  const baseCellHeight = availableHeight / Math.max(1, rows);
  // Estimate label+icon stack height to ensure enough clearance between rows when icons show
  const showIconsGlobal = !isNarrow;
  const estimatedIconSize = showIconsGlobal
    ? Math.max(24, Math.min(40, Math.min(cellWidth, baseCellHeight) * 0.22))
    : 0;
  const requiredLabelSpace =
    8 /* text offset */ +
    (showIconsGlobal ? estimatedIconSize + 6 /*icon gap*/ : 0) +
    6; /*safety*/
  const rowGap =
    rows > 1
      ? rows === 2
        ? Math.max(
            isShortHeight ? 84 : 68,
            Math.min(180, baseCellHeight * 0.22),
            requiredLabelSpace,
          )
        : Math.max(
            isShortHeight ? 28 : 18,
            Math.min(48, baseCellHeight * 0.14),
            requiredLabelSpace,
          )
      : 0;
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
  // Reserve space at top for cluster labels to avoid cutoff in exports
  // Use a fixed reasonable space (font size ~16-18px + small margin)
  const clusterLabelReservedSpace = 30;
  // Add horizontal padding to prevent edge cutoff (more on narrow screens)
  const clusterHorizontalPadding = isNarrow ? 16 : 24;
  const clusterGridWidth =
    containerWidth -
    Math.max(0, clustersOnlyCols - 1) * clustersOnlyColGap -
    clusterHorizontalPadding * 2; // padding on both sides
  // Subtract reserved space from available height so grid fits properly
  const clusterGridHeight =
    availableHeight -
    clusterLabelReservedSpace -
    Math.max(0, clustersOnlyRows - 1) * clustersOnlyRowGap;
  const clusterCellWidth = clusterGridWidth / clustersOnlyCols;
  const clusterCellHeight = clusterGridHeight / clustersOnlyRows;
  const clusterGridOffsetX = (containerWidth - clusterGridWidth) / 2;
  const clusterGridOffsetY = clusterLabelReservedSpace;
  // Equal cluster radius that fits within each grid cell
  const equalClusterRadius =
    Math.min(clusterCellWidth, clusterCellHeight) * 0.42;

  // Compute a representative value chain radius for sizing, matching layout logic
  const boundaryStrokeWidthForSizing = 2;
  const sizingValueChainRadius = isNarrow
    ? Math.max(
        8,
        Math.min(cellWidth, cellHeight) / 2 - boundaryStrokeWidthForSizing - 2,
      )
    : (() => {
        const maxRadiusHorizontal =
          (cellWidth + colGap - boundaryStrokeWidthForSizing) / 2;
        const maxRadiusVertical =
          (cellHeight + rowGap - boundaryStrokeWidthForSizing) / 2;
        return Math.max(
          8,
          Math.min(maxRadiusHorizontal, maxRadiusVertical) - 6,
        );
      })();

  // Calculate the normalized product size for this layout mode using actual radii
  normalizedProductSize = calculateAllLayoutsForSizing(
    allValueChains,
    layoutMode,
    productLookup,
    { valueChainRadius: sizingValueChainRadius, equalClusterRadius },
  );
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
        .padding(6);

      const packedRootTmp = packerTmp(rootTmp);
      packedRootTmp.children?.forEach((node) => {
        globalMinChildR = Math.min(globalMinChildR, node.r);
      });
    });
    if (!Number.isFinite(globalMinChildR)) {
      globalMinChildR = equalClusterRadius * 0.16;
    }
    globalProductRadius = Math.max(2.5, globalMinChildR * 0.95);
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
              valueChainId,
              fill: "none",
              stroke: "#5DADE2", // Medium blue for stroke
              strokeWidth: 2,
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
            fill: "none",
            stroke: "#1E5A8A", // Darker version for stroke
            strokeWidth: 2,
          });
        }

        // Add cluster label positioned above the cluster circle with character limit
        // Calculate character limit based on available cell width
        const clusterLabelFontSize = Math.max(
          12,
          Math.min(18, clusterRadius * 0.2),
        );

        // Available width for label is the cell width minus some padding
        const availableLabelWidth = clusterCellWidth * 0.9; // 90% of cell width to avoid overlap

        // Estimate character width: average character is ~0.55 times font size for most fonts
        const avgCharWidth = clusterLabelFontSize * 0.55;
        const maxChars = Math.floor(availableLabelWidth / avgCharWidth);

        const truncatedName =
          clusterData.clusterName.length > maxChars
            ? clusterData.clusterName.substring(0, Math.max(10, maxChars - 3)) +
              "..."
            : clusterData.clusterName;

        clusterLabels.push({
          id: `cluster-label-${clusterId}`,
          x: cellCenterX,
          y: cellCenterY - clusterRadius - 5, // Moved even closer to the circle
          text: truncatedName,
          clusterId: parseInt(clusterId),
          fontSize: clusterLabelFontSize,
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
          .padding(6);

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

      const cellCenterX =
        gridOffsetX + col * (cellWidth + colGap) + cellWidth / 2;
      const cellCenterY =
        (row + 0.5) * cellHeight + row * rowGap + verticalOffset;

      // Value chain boundary circle - ensure no overlap (including strokes)
      const boundaryStrokeWidth = 2; // thinner outer boundary for 3-level pack
      const valueChainRadius = isNarrow
        ? Math.max(
            8,
            Math.min(cellWidth, cellHeight) / 2 - boundaryStrokeWidth - 2,
          )
        : (() => {
            const maxRadiusHorizontal = (cellWidth - boundaryStrokeWidth) / 2;
            const maxRadiusVertical = (cellHeight - boundaryStrokeWidth) / 2;
            return Math.max(
              8,
              Math.min(maxRadiusHorizontal, maxRadiusVertical) - 6,
            );
          })();

      const supplyChainDetails = supplyChainLookup.get(parseInt(supplyChainId));
      const supplyChainName =
        supplyChainDetails?.supplyChain || `Supply Chain ${supplyChainId}`;
      const displaySupplyChainName = supplyChainName.replace(
        /\s+and\s+/gi,
        " & ",
      );

      valueChainCircles.push({
        id: `value-chain-${supplyChainId}`,
        x: cellCenterX,
        y: cellCenterY,
        r: valueChainRadius,
        supplyChainId: parseInt(supplyChainId),
        supplyChainName,
        fill: "none",
        stroke: getSupplyChainColor(supplyChainId),
        strokeWidth: boundaryStrokeWidth,
      });

      // Get icon for this value chain
      const valueChainIcon = getValueChainIcon(supplyChainName);
      const baseDim = Math.min(cellWidth, cellHeight);
      const valueChainLabelFontSize = 16;
      const iconSize = Math.max(24, Math.min(40, baseDim * 0.22));

      // Always use standard positioning - grid layout ensures adequate space
      const textOffset = 8; // slightly larger to avoid touching boundary
      const iconGap = 8;
      const textY = cellCenterY - valueChainRadius - textOffset;
      const iconY = textY - iconSize - iconGap;

      const showIcon = !isNarrow; // hide icons only in 2-column (narrow) view

      valueChainLabels.push({
        id: `label-${supplyChainId}`,
        x: cellCenterX,
        y: textY,
        text: displaySupplyChainName,
        supplyChainId: parseInt(supplyChainId),
        icon: showIcon ? valueChainIcon : null,
        iconX: cellCenterX,
        iconY,
        fontSize: valueChainLabelFontSize,
        iconSize,
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

        const clusterLevelPadding = Math.max(
          8,
          Math.min(16, valueChainRadius * 0.03),
        );
        const productLevelPadding = Math.max(
          1.5,
          Math.min(4, valueChainRadius * 0.016),
        );
        const packer = pack()
          .size([valueChainRadius * 1.9, valueChainRadius * 1.9])
          .padding((node) =>
            node.depth === 1
              ? Math.max(1.5, productLevelPadding)
              : Math.max(10, clusterLevelPadding),
          );

        const packedRoot = packer(root);
        const layoutCenterX = valueChainRadius * 0.95;
        const layoutCenterY = valueChainRadius * 0.95;

        packedRoot.children?.forEach((clusterNode) => {
          clusterCircles.push({
            id: `cluster-${clusterNode.data.clusterId}-vc-${supplyChainId}`, // Value-chain-specific cluster ID for step 2
            x: cellCenterX + (clusterNode.x - layoutCenterX),
            y: cellCenterY + (clusterNode.y - layoutCenterY),
            r: clusterNode.r,
            clusterId: clusterNode.data.clusterId,
            valueChainId: parseInt(supplyChainId),
            fill: "none",
            stroke: getDarkerColorSolid(
              getSupplyChainColor(supplyChainId),
              0.2,
            ),
            strokeWidth: 1.25,
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
              r: Math.min(
                normalizedProductSize,
                Math.max(3, productNode.r * 0.92),
              ),
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
          .size([valueChainRadius * 1.9, valueChainRadius * 1.9])
          .padding(Math.max(1.0, valueChainRadius * 0.008));

        const packedRoot = packer(root);
        const layoutCenterX = valueChainRadius * 0.95;
        const layoutCenterY = valueChainRadius * 0.95;

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
            r: Math.min(
              normalizedProductSize,
              Math.max(1.5, productNode.r * 0.92),
            ),
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
// Uses actual cell-derived radii instead of a fixed reference size
const calculateAllLayoutsForSizing = (
  allValueChains,
  layoutMode,
  productLookup,
  radii,
) => {
  const { valueChainRadius, equalClusterRadius } = radii || {};
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

      const effectiveRadius = Math.max(8, (equalClusterRadius || 90) * 0.98);
      const packer = pack()
        .size([effectiveRadius * 1.8, effectiveRadius * 1.8])
        .padding(6);

      const packedRoot = packer(root);

      packedRoot.children?.forEach((productNode) => {
        // Scale products to fit nicely within clusters, with a very small multiplier
        const scaledRadius = Math.max(1.0, productNode.r * 0.18);
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

          const effectiveRadius = Math.max(8, (valueChainRadius || 90) * 1.0);
          const clusterLevelPadding = Math.max(
            8,
            Math.min(16, effectiveRadius * 0.03),
          );
          const productLevelPadding = Math.max(
            1.5,
            Math.min(4, effectiveRadius * 0.016),
          );
          const packer = pack()
            .size([effectiveRadius * 1.9, effectiveRadius * 1.9])
            // Keep mapping consistent with render-time padding usage
            .padding((node) =>
              node.depth === 1 ? productLevelPadding : clusterLevelPadding,
            );

          const packedRoot = packer(root);

          packedRoot.children?.forEach((clusterNode) => {
            clusterNode.children?.forEach((productNode) => {
              // Slightly reduce to guarantee visual gaps between leaf nodes
              minProductRadius = Math.min(
                minProductRadius,
                productNode.r * 0.9,
              );
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

          const effectiveRadius = Math.max(8, (valueChainRadius || 90) * 1.0);
          const packer = pack()
            .size([effectiveRadius * 1.9, effectiveRadius * 1.9])
            .padding(Math.max(0.6, effectiveRadius * 0.006));

          const packedRoot = packer(root);

          packedRoot.children?.forEach((productNode) => {
            minProductRadius = Math.min(minProductRadius, productNode.r);
          });
        }
      },
    );
  }

  return Math.max(3, minProductRadius * 0.95); // Balance between visibility and preventing overlap
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
  gpCpyList,
  gpCpyscList,
  clusterLookup,
) => {
  if (!gpCpyList || !gpCpyscList || !clusterLookup.size) return {};

  const clusters = {};

  // Create mapping from productId to value chains for transition purposes
  const productToValueChains = new Map();
  gpCpyscList.forEach((item) => {
    const { supplyChainId, productId } = item;
    if (!productToValueChains.has(productId)) {
      productToValueChains.set(productId, []);
    }
    productToValueChains.get(productId).push(supplyChainId);
  });

  // Group products by cluster, deduplicating across value chains
  gpCpyList.forEach((product) => {
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
  gpCpyList,
  gpCpyscList,
  clusterLookup,
  layoutMode,
) => {
  if (!gpCpyList || !gpCpyscList) return {};

  // Handle clusters-only layout separately
  if (layoutMode === "clusters-only") {
    return transformDataForClustersOnly(gpCpyList, gpCpyscList, clusterLookup);
  }

  const valueChains = {};

  // Group products by supply chain
  gpCpyscList.forEach((item) => {
    const { supplyChainId, productId } = item;
    const product = gpCpyList.find((p) => p.productId === productId);
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
  const [rcaThreshold, setRcaThreshold] = useState(1.0);
  const [hoveredProductGlobalId, setHoveredProductGlobalId] = useState(null);
  const containerRef = useRef(null);
  // Only track plot dimensions from ParentSize (no redundant state)
  const [plotDimensions, setPlotDimensions] = useState({
    width: 800,
    height: 600,
  });

  // Determine narrowness based on the visualization container width, not window width
  const isNarrow = useMemo(() => {
    return (
      (plotDimensions?.width || 0) < (theme.breakpoints?.values?.sm || 600)
    );
  }, [plotDimensions.width, theme]);

  // Consider a short viewport height as a separate constraint for spacing
  const isShortHeight = useMediaQuery("(max-height:740px)");

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
      gpCpyList: countryData.productData,
      gpCpyscList: countryData.productSupplyChainData || [],
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
      currentData.gpCpyList,
      currentData.gpCpyscList,
      clusterLookup,
      layoutMode,
    );
  }, [currentData, clusterLookup, layoutMode]);

  // Helper component to sync ParentSize measurements into state
  // This useEffect is necessary because ParentSize provides dimensions as props,
  // and we need them in state for useMemo dependencies
  const SizeSync = ({ width, height }) => {
    useEffect(() => {
      if (width > 0 && height > 0) {
        // Only update if dimensions actually changed (avoid infinite loops)
        setPlotDimensions((prev) => {
          if (prev.width !== width || prev.height !== height) {
            return { width, height };
          }
          return prev;
        });
      }
    }, [width, height]);
    return null;
  };

  // Calculate unified layout
  const unifiedLayout = useMemo(() => {
    if (!valueChains || Object.keys(valueChains).length === 0) {
      return {
        productBubbles: [],
        clusterCircles: [],
        valueChainCircles: [],
        valueChainLabels: [],
        clusterLabels: [],
        bounds: { minY: 0, maxY: plotDimensions.height },
      };
    }

    const layout = calculateUnifiedLayout(
      valueChains,
      layoutMode,
      productLookup,
      supplyChainLookup,
      plotDimensions.width,
      plotDimensions.height,
      isNarrow,
      isShortHeight,
    );

    // Calculate actual bounds of all content
    let minY = Infinity;
    let maxY = -Infinity;

    // Check value chain labels and icons
    layout.valueChainLabels.forEach((label) => {
      if (label.icon && label.iconY !== undefined) {
        // Icon is centered at iconY, so top edge is iconY - iconSize/2
        const iconSize = label.iconSize || 35;
        minY = Math.min(minY, label.iconY - iconSize / 2);
      }
      minY = Math.min(minY, label.y - 10); // Account for text height
      maxY = Math.max(maxY, label.y + 10);
    });

    // Check cluster labels
    layout.clusterLabels.forEach((label) => {
      minY = Math.min(minY, label.y - 10);
      maxY = Math.max(maxY, label.y + 10);
    });

    // Check circles
    layout.valueChainCircles.forEach((circle) => {
      maxY = Math.max(maxY, circle.y + circle.r);
    });

    layout.clusterCircles.forEach((circle) => {
      maxY = Math.max(maxY, circle.y + circle.r);
    });

    return {
      ...layout,
      bounds: {
        minY: Math.min(0, minY),
        maxY: Math.max(plotDimensions.height, maxY),
      },
    };
  }, [
    valueChains,
    layoutMode,
    productLookup,
    supplyChainLookup,
    plotDimensions,
    isNarrow,
    isShortHeight,
  ]);

  // No hardcoded spacing needed - flexbox will handle it

  // Apply dynamic properties (opacity for RCA)
  const processedBubbles = useMemo(() => {
    const isClustersOnly = layoutMode === "clusters-only";
    return unifiedLayout.productBubbles.map((bubble) => {
      const gpId =
        bubble.globalProductId ||
        (bubble?.data?.productId
          ? `product-${bubble.data.productId}`
          : undefined);
      const highlighted =
        hoveredProductGlobalId && gpId
          ? gpId === hoveredProductGlobalId
          : false;

      // In clusters-only layout, use solid color mapping for RCA (no opacity stacking)
      let computedOpacity = 1;
      let computedFill = bubble.fill;
      if (fill === "rca") {
        if (isClustersOnly) {
          computedFill = getRCABlueColor(bubble.rca, rcaThreshold);
          computedOpacity = 1;
        } else {
          computedOpacity = getRCAOpacity(bubble.rca, rcaThreshold);
        }
      }

      return {
        ...bubble,
        fill: computedFill,
        opacity: computedOpacity,
        highlighted,
      };
    });
  }, [
    unifiedLayout.productBubbles,
    fill,
    hoveredProductGlobalId,
    rcaThreshold,
    layoutMode,
  ]);
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
        // Temporarily hide non-export elements (e.g., click hints)
        const hiddenElements = [];
        const candidates = containerRef.current.querySelectorAll(
          '[data-export-hide="true"]',
        );
        candidates.forEach((el) => {
          const element = el;
          if (element?.style) {
            hiddenElements.push(element);
            element.setAttribute(
              "data-export-original-display",
              element.style.display || "",
            );
            element.style.display = "none";
          }
        });

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

        // Restore hidden elements
        hiddenElements.forEach((el) => {
          const original =
            el.getAttribute("data-export-original-display") || "";
          el.style.display = original;
          el.removeAttribute("data-export-original-display");
        });
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
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "white",
      }}
    >
      {/* Header Section - Title and Click Hint */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: { xs: 0.5, md: 1 },
          pt: { xs: 1, md: 1.5 },
          pb: { xs: 0.5, md: 1 },
          px: 2,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        {/* Title */}
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

        {/* Click Hint */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <ClickHintBox text="Click on a bubble to see its products" />
        </Box>
      </Box>

      {/* Visualization Container - Grows to fill available space */}
      <Box
        sx={{
          flex: "1 1 auto",
          width: "100%",
          minHeight: 0, // Important for flexbox to allow shrinking
          position: "relative",
        }}
      >
        <ParentSize debounceTime={0}>
          {({ width, height }) => {
            // Calculate viewBox dimensions to encompass all content
            const viewBoxY = unifiedLayout.bounds?.minY || 0;
            const viewBoxHeight =
              (unifiedLayout.bounds?.maxY || height) - viewBoxY;

            return (
              <svg
                width="100%"
                height="100%"
                viewBox={`0 ${viewBoxY} ${width} ${viewBoxHeight}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: "visible" }}
                role="img"
                aria-label={svgAriaLabel}
                aria-describedby="circle-pack-desc"
              >
                {/* keep plotDimensions in state so upstream memoized layout recomputes */}
                <SizeSync width={width} height={height} />
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
                    pointerEvents={
                      layoutMode === "clusters-only" ? "all" : "none"
                    }
                    style={
                      layoutMode === "clusters-only"
                        ? { cursor: "pointer" }
                        : {}
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
                      layoutMode === "clusters-only"
                        ? () => hideTooltip()
                        : undefined
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
                      layoutMode === "clusters-only"
                        ? {}
                        : { cursor: "pointer" }
                    }
                    pointerEvents={
                      layoutMode === "clusters-only" ? "none" : "all"
                    }
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
                                  clusterName:
                                    bubble?.layoutContext?.clusterName,
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
                              supplyChainId: bubble?.valueChainId,
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
                        x={label.iconX - (label.iconSize || 35) / 2}
                        y={label.iconY - (label.iconSize || 35) / 2}
                        width={label.iconSize || 35}
                        height={label.iconSize || 35}
                        opacity={style.opacity}
                        pointerEvents="none"
                      />
                    )}
                    {/* Value chain text */}
                    <animated.text
                      x={style.x}
                      y={style.y}
                      textAnchor="middle"
                      fontSize={label.fontSize || 16}
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
            );
          }}
        </ParentSize>
      </Box>

      {/* Footer Section - Legend and Attribution */}
      {view.legend && (
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            pt: 1,
            pb: { xs: 1, md: 1.5 },
            px: 2,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            position: "relative",
          }}
        >
          {/* Legend */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Legend
              key={view.legend}
              mode={view.legend}
              rcaThreshold={rcaThreshold}
              onChangeRcaThreshold={setRcaThreshold}
            />
          </Box>

          {/* Attribution */}
          <Typography
            variant="chart-attribution"
            sx={{
              textAlign: "right",
              fontSize: "0.625rem",
            }}
          >
            {view.source}
          </Typography>
        </Box>
      )}

      {/* Attribution (when no legend) */}
      {!view.legend && (
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            px: 2,
            py: 1,
          }}
        >
          <Typography
            variant="chart-attribution"
            sx={{
              fontSize: "0.625rem",
            }}
          >
            {view.source}
          </Typography>
        </Box>
      )}
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

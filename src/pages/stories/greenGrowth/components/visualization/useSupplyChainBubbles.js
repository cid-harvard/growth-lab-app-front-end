import { useMemo, useCallback } from "react";
import "./scrollyCanvas.css";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import { pack, hierarchy } from "d3-hierarchy";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import { getSupplyChainColor } from "../../utils";
import { index } from "d3";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getRCAOpacity } from "../../utils/rcaConfig";

const BUBBLE_SIZES = {
  TINY: 0.3,
  SMALL: 0.6,
  MEDIUM: 0.9,
  LARGE: 1.1,
  HUGE: 1.4,
};

const getDiscreteRanking = (ranking, minRank, maxRank) => {
  const percentile = (ranking - minRank) / (maxRank - minRank);
  if (percentile <= 0.2) return BUBBLE_SIZES.TINY;
  if (percentile <= 0.4) return BUBBLE_SIZES.SMALL;
  if (percentile <= 0.6) return BUBBLE_SIZES.MEDIUM;
  if (percentile <= 0.8) return BUBBLE_SIZES.LARGE;
  return BUBBLE_SIZES.HUGE;
};

const SUPPLY_CHAIN_LAYOUT_WIDE = {
  ROW_1: [4, 0, 2, 3, 7], // EVs, Heat Pumps, Fuel Cells, Wind, Solar
  ROW_2: [8, 5, 9, 6, 1], // Hydro, Nuclear, Batteries, Grid, Minerals
};

const SUPPLY_CHAIN_LAYOUT_TALL = {
  ROW_1: [4, 0], // EVs, Heat Pumps
  ROW_2: [2, 3], // Fuel Cells, Wind
  ROW_3: [7, 8], // Solar, Hydro
  ROW_4: [5, 9], // Nuclear, Batteries
  ROW_5: [6, 1], // Grid, Minerals
};

export const useSupplyChainBubbles = ({
  year,
  countryId,
  width,
  height,
  fill,
  stroke = null,
  layoutMode = "flat", // "flat" or "clustered"
}) => {
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up("sm"));

  // Use shared data fetching hook
  const { countryData, productClusterRows, isLoading, hasErrors } =
    useGreenGrowthData(parseInt(countryId), parseInt(year));

  // Extract data for compatibility
  const currentData = useMemo(() => {
    if (!countryData?.productData) return null;
    return {
      ggCpyList: countryData.productData,
      ggCpyscList: countryData.productSupplyChainData || [],
      productClusterRows: productClusterRows || [],
    };
  }, [countryData, productClusterRows]);

  // Only show loading if we actually don't have any data to render with
  const loading = isLoading && !currentData;
  const error = hasErrors;

  const productLookup = useProductLookup();
  const supplyChainLookup = useSupplyChainLookup();

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

  // Create global ranking system for consistent sizing across layouts
  const getGlobalProductSizes = useCallback((ggCpyscList) => {
    if (!ggCpyscList) return new Map();

    // Get all rankings globally
    const allRankings = ggCpyscList.map((item) => item.productRanking);
    const globalMinRank = Math.min(...allRankings);
    const globalMaxRank = Math.max(...allRankings);

    // Create global size map
    const globalSizeMap = new Map();
    ggCpyscList.forEach((item) => {
      const { productId, productRanking } = item;
      const globalDiscreteRanking =
        globalMaxRank === globalMinRank
          ? BUBBLE_SIZES.MEDIUM
          : getDiscreteRanking(productRanking, globalMinRank, globalMaxRank);
      globalSizeMap.set(productId, globalDiscreteRanking);
    });

    return globalSizeMap;
  }, []);

  const createFlatLayout = useCallback(
    (ggCpyList, ggCpyscList, globalSizeMap) => {
      if (!ggCpyList || !ggCpyscList || !width || !height)
        return { childBubbles: [], parentCircles: [], clusterCircles: [] };

      const SUPPLY_CHAIN_LAYOUT = isWide
        ? SUPPLY_CHAIN_LAYOUT_WIDE
        : SUPPLY_CHAIN_LAYOUT_TALL;
      const numRows = isWide ? 2 : 5;

      const margin = isWide ? 60 : 10;
      const padding = 0;
      const groupSpacing = isWide ? 40 : 6;
      const rowSpacing = isWide ? 60 : 7;

      const legendOffset = isWide ? 0 : 50;
      const topMargin = isWide ? margin : 20 + legendOffset;
      const bottomMargin = isWide ? margin : 20;

      const availableHeight = isWide
        ? height - margin * 1.2 - rowSpacing * numRows
        : height - topMargin - bottomMargin - rowSpacing * (numRows - 1);
      const rowHeights = Array(numRows).fill(availableHeight / numRows);

      const supplyChainMap = new Map();
      ggCpyscList.forEach((item) => {
        const { supplyChainId, productId } = item;
        if (!supplyChainMap.has(supplyChainId)) {
          supplyChainMap.set(supplyChainId, new Map());
        }
        // Use global size instead of per-supply-chain normalization
        const globalSize = globalSizeMap.get(productId) || BUBBLE_SIZES.MEDIUM;
        supplyChainMap.get(supplyChainId).set(productId, globalSize);
      });

      const hierarchyData = {
        id: "root",
        children: Array.from(supplyChainMap.entries()).map(
          ([supplyChainId, products]) => {
            const supplyChainDetails = supplyChainLookup.get(supplyChainId);
            const filteredProducts = ggCpyList.filter((product) =>
              products.has(product.productId),
            );

            return {
              id: supplyChainId,
              name: supplyChainDetails
                ? supplyChainDetails.supplyChain
                : supplyChainId,
              children: filteredProducts.map((product) => {
                const productDetails = productLookup.get(product.productId);
                return {
                  id: product.code,
                  parentId: supplyChainId,
                  scaledRanking: products.get(product.productId),
                  ...product,
                  product: productDetails,
                };
              }),
            };
          },
        ),
      };

      const sectorTree = hierarchy(hierarchyData)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value);

      const packedSectorTree = pack().size([width, height]).padding(padding)(
        sectorTree,
      );

      const groups = packedSectorTree.children || [];

      const maxBubblesPerGroup = Math.max(
        ...groups.map((g) => g.children?.length || 0),
      );

      const parentCircles = [];
      const childBubbles = [];

      groups.forEach((group) => {
        const supplyChainId = group.data.id;
        let row, col, totalColsInRow;

        for (let i = 1; i <= numRows; i++) {
          const rowKey = `ROW_${i}`;
          const rowArray = SUPPLY_CHAIN_LAYOUT[rowKey];
          const colIndex = rowArray?.indexOf(supplyChainId);
          if (colIndex !== -1) {
            row = i - 1;
            col = colIndex;
            totalColsInRow = rowArray.length;
            break;
          }
        }

        if (row === undefined) return;

        const rowHeight = rowHeights[row];
        const cellWidth = isWide
          ? (width - margin * 2 - groupSpacing * (totalColsInRow - 1)) /
            totalColsInRow
          : (width - margin * 2 - groupSpacing) / 2;

        const rowY = isWide
          ? margin +
            rowHeights.slice(0, row).reduce((a, b) => a + b, 0) +
            row * rowSpacing
          : topMargin +
            rowHeights.slice(0, row).reduce((a, b) => a + b, 0) +
            row * rowSpacing;

        const groupX =
          margin + (cellWidth + groupSpacing) * col + cellWidth / 2;
        const groupY = rowY + rowHeight / 2;

        const groupPack = pack()
          .size([
            cellWidth * (isWide ? 0.9 : 0.85),
            rowHeight * (isWide ? 0.9 : 0.25),
          ])
          .padding(isWide ? 2 : 1)
          .radius((d) => {
            const baseRadius =
              Math.min(cellWidth, rowHeight) /
              (isWide ? 2 : 3) /
              Math.sqrt(maxBubblesPerGroup);
            return baseRadius * d.data.data.scaledRanking * (isWide ? 1 : 1);
          });

        const packedGroup = groupPack(hierarchy(group).sum((d) => d.value));

        // Calculate consistent parent radius based on packed layout bounds
        const parentRadius = packedGroup.r;

        parentCircles.push({
          id: group.data.id,
          name: group.data.name,
          x: groupX,
          y: groupY,
          radius: parentRadius,
        });

        packedGroup.children.forEach((leaf) => {
          const x = groupX + (leaf.x - packedGroup.x);
          const y = groupY + (leaf.y - packedGroup.y);

          childBubbles.push({
            parentId: group.data.id,
            radius: leaf.r,
            ...leaf.data,
            x,
            y,
            r: leaf.r,
          });
        });
      });

      const bubblesArray = childBubbles.map((d, i) => {
        // Extract product code using productId and productLookup
        const productId = d.data.productId; // In flat layout, d.data is the ggCpyList item
        const productDetails = productLookup.get(productId);
        const productCode = productDetails?.code || `product-${productId}`;

        return {
          ...d,
          i,
          title: productDetails?.nameShortEn,
          opacity: fill === "rca" ? getRCAOpacity(d.data.exportRca) : 1,
          stroke: "white",
          strokeWidth: 0,
          strokeOpacity: 0,
          rca: d.data.exportRca,
          fill: getSupplyChainColor(d.parentId),
          id: `${productCode}-${d.parentId}`, // Unique ID: product code + supply chain
          scaledRanking: d.data.scaledRanking,
        };
      });

      const bubbles = index(
        bubblesArray.filter((d) => d && !d?.id?.includes("undefined")),
        (d) => d.id,
      );

      return {
        childBubbles: bubbles,
        parentCircles,
        clusterCircles: [], // No cluster circles in flat mode
      };
    },
    [width, height, isWide, supplyChainLookup, productLookup, fill],
  );

  const createClusteredLayout = useCallback(
    (ggCpyList, ggCpyscList, globalSizeMap) => {
      if (
        !ggCpyList ||
        !ggCpyscList ||
        !width ||
        !height ||
        !clusterLookup.size
      )
        return { childBubbles: [], parentCircles: [], clusterCircles: [] };

      const SUPPLY_CHAIN_LAYOUT = isWide
        ? SUPPLY_CHAIN_LAYOUT_WIDE
        : SUPPLY_CHAIN_LAYOUT_TALL;
      const numRows = isWide ? 2 : 5;

      const margin = isWide ? 60 : 10;
      const padding = 0;
      const groupSpacing = isWide ? 40 : 6;
      const rowSpacing = isWide ? 60 : 7;

      const legendOffset = isWide ? 0 : 50;
      const topMargin = isWide ? margin : 20 + legendOffset;
      const bottomMargin = isWide ? margin : 20;

      const availableHeight = isWide
        ? height - margin * 1.2 - rowSpacing * numRows
        : height - topMargin - bottomMargin - rowSpacing * (numRows - 1);
      const rowHeights = Array(numRows).fill(availableHeight / numRows);

      // Group products by supply chain and clusters using d3 hierarchy structure
      const supplyChainHierarchies = new Map();

      // Process each product-supply chain combination (like flat layout does)
      ggCpyscList.forEach((supplyChainItem) => {
        const { supplyChainId, productId, productRanking } = supplyChainItem;

        // Find the corresponding product in ggCpyList
        const product = ggCpyList.find((p) => p.productId === productId);
        if (!product) return;

        const clusterInfo = clusterLookup.get(productId);
        // Use cluster info if available, otherwise create fallback cluster
        const clusterId = clusterInfo?.clusterId || 9999; // Use high number for unknown cluster
        const clusterName = clusterInfo?.clusterName || "Other Products";

        // Initialize supply chain hierarchy if needed
        if (!supplyChainHierarchies.has(supplyChainId)) {
          supplyChainHierarchies.set(supplyChainId, new Map());
        }

        // Initialize cluster if needed
        if (!supplyChainHierarchies.get(supplyChainId).has(clusterId)) {
          supplyChainHierarchies.get(supplyChainId).set(clusterId, {
            clusterName,
            products: [],
          });
        }

        const productDetails = productLookup.get(productId);

        // Use global size instead of cluster-based normalization
        const globalSize = globalSizeMap.get(productId) || BUBBLE_SIZES.MEDIUM;

        supplyChainHierarchies
          .get(supplyChainId)
          .get(clusterId)
          .products.push({
            id: product.code, // Use consistent ID (just product code)
            parentId: supplyChainId,
            clusterId: clusterId,
            ranking: productRanking,
            scaledRanking: globalSize, // Use global size for consistency
            ...product,
            product: productDetails,
          });
      });

      const parentCircles = [];
      const clusterCircles = [];
      const childBubbles = [];

      // Process each supply chain
      supplyChainHierarchies.forEach((clusterMap, supplyChainId) => {
        let row, col, totalColsInRow;

        for (let i = 1; i <= numRows; i++) {
          const rowKey = `ROW_${i}`;
          const rowArray = SUPPLY_CHAIN_LAYOUT[rowKey];
          const colIndex = rowArray?.indexOf(supplyChainId);
          if (colIndex !== -1) {
            row = i - 1;
            col = colIndex;
            totalColsInRow = rowArray.length;
            break;
          }
        }

        if (row === undefined) return;

        const rowHeight = rowHeights[row];
        const cellWidth = isWide
          ? (width - margin * 2 - groupSpacing * (totalColsInRow - 1)) /
            totalColsInRow
          : (width - margin * 2 - groupSpacing) / 2;

        const rowY = isWide
          ? margin +
            rowHeights.slice(0, row).reduce((a, b) => a + b, 0) +
            row * rowSpacing
          : topMargin +
            rowHeights.slice(0, row).reduce((a, b) => a + b, 0) +
            row * rowSpacing;

        const groupX =
          margin + (cellWidth + groupSpacing) * col + cellWidth / 2;
        const groupY = rowY + rowHeight / 2;

        const supplyChainDetails = supplyChainLookup.get(supplyChainId);
        const supplyChainName = supplyChainDetails
          ? supplyChainDetails.supplyChain
          : supplyChainId;

        // Create d3 hierarchy for proper circle packing
        const hierarchyData = {
          id: `sc-${supplyChainId}`,
          children: Array.from(clusterMap.entries()).map(
            ([clusterId, clusterData]) => ({
              id: `cluster-${clusterId}`,
              name: clusterData.clusterName,
              clusterId: clusterId,
              // Don't set value on cluster - let d3 sum from children
              children: clusterData.products.map((product) => ({
                id: product.id,
                // Scale up values to ensure cluster circles are visible
                value: (product.scaledRanking || 1) * 100,
                data: product,
              })),
            }),
          ),
        };

        const root = hierarchy(hierarchyData)
          .sum((d) => d.value || 0) // Only sum leaf node values
          .sort((a, b) => b.value - a.value);

        // Apply circle packing to the hierarchy
        const packSize =
          Math.min(cellWidth, rowHeight) * (isWide ? 0.85 : 0.75);

        const packer = pack()
          .size([packSize, packSize])
          .padding(isWide ? 2 : 2) // Increase padding to prevent cluster overlap
          .radius((d) => {
            // Ensure minimum radius for leaf nodes
            if (!d.children) {
              const baseRadius = Math.sqrt(d.value / Math.PI);
              return Math.max(baseRadius, 3); // Minimum 3px radius
            }
            return null; // Let d3 calculate cluster radii
          });

        const packedRoot = packer(root);

        // Calculate consistent parent circle radius (same logic as flat layout)
        const parentRadius = packedRoot.r;

        parentCircles.push({
          id: supplyChainId,
          name: supplyChainName,
          x: groupX,
          y: groupY,
          radius: parentRadius,
        });

        // Process cluster circles and product bubbles
        packedRoot.children?.forEach((clusterNode) => {
          const clusterX = groupX + (clusterNode.x - packedRoot.x);
          const clusterY = groupY + (clusterNode.y - packedRoot.y);

          // Create cluster circle
          clusterCircles.push({
            id: `${supplyChainId}-cluster-${clusterNode.data.clusterId}`,
            name: clusterNode.data.name,
            x: clusterX,
            y: clusterY,
            radius: clusterNode.r,
            parentId: supplyChainId,
          });

          // Process products within cluster
          clusterNode.children?.forEach((productNode) => {
            const productX = groupX + (productNode.x - packedRoot.x);
            const productY = groupY + (productNode.y - packedRoot.y);

            childBubbles.push({
              parentId: supplyChainId,
              clusterId: clusterNode.data.clusterId,
              radius: productNode.r,
              data: productNode.data.data, // Product data
              x: productX,
              y: productY,
              r: productNode.r,
              // Flatten essential properties for consistency
              id: productNode.data.data.id, // Use consistent product code ID
              scaledRanking: productNode.data.data.scaledRanking,
              product: productNode.data.data.product,
              exportRca: productNode.data.data.exportRca,
              productId: productNode.data.data.productId,
              code: productNode.data.data.code,
            });
          });
        });
      });

      const bubblesArray = childBubbles.map((d, i) => {
        // Extract product code using productId and productLookup (same as flat layout)
        const productId =
          d?.data?.data?.productId || d?.data?.productId || d?.productId;
        const productDetails = productLookup.get(productId);
        const productCode = productDetails?.code || `product-${productId}`;

        return {
          ...d,
          i,
          title: productDetails?.nameShortEn,
          opacity:
            fill === "rca"
              ? getRCAOpacity(d?.data?.exportRca || d?.exportRca)
              : 1,
          stroke: "white",
          strokeWidth: 0,
          strokeOpacity: 0,
          rca: d?.data?.exportRca || d?.exportRca,
          fill: getSupplyChainColor(d.parentId),
          id: `${productCode}-${d.parentId}`, // Unique ID: product code + supply chain
          scaledRanking: d?.data?.scaledRanking || d?.scaledRanking,
        };
      });

      const bubbles = index(
        bubblesArray.filter((d) => d && !d?.id?.includes("undefined")),
        (d) => d.id,
      );

      return {
        childBubbles: bubbles,
        parentCircles,
        clusterCircles,
      };
    },
    [
      width,
      height,
      isWide,
      supplyChainLookup,
      productLookup,
      clusterLookup,
      fill,
    ],
  );

  const layout = useMemo(() => {
    if (!currentData)
      return { childBubbles: [], parentCircles: [], clusterCircles: [] };

    // Calculate global sizes for consistency across layouts
    const globalSizeMap = getGlobalProductSizes(currentData.ggCpyscList);

    if (layoutMode === "clustered") {
      return createClusteredLayout(
        currentData.ggCpyList,
        currentData.ggCpyscList,
        globalSizeMap,
      );
    } else {
      return createFlatLayout(
        currentData.ggCpyList,
        currentData.ggCpyscList,
        globalSizeMap,
      );
    }
  }, [
    currentData,
    layoutMode,
    createFlatLayout,
    createClusteredLayout,
    getGlobalProductSizes,
  ]);

  return { loading, error, ...layout };
};

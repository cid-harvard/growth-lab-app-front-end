import React from "react";
import { useState, useMemo, useEffect, useRef } from "react";
import { animated, useTransition, config } from "@react-spring/web";
import { Box, Typography, IconButton } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import { ParentSize } from "@visx/responsive";
import { Text } from "@visx/text";
import { pack, hierarchy, HierarchyCircularNode } from "d3-hierarchy";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import { getValueChainIcon } from "../visualization/ClusterTree/valueChainIconMapping";
import HierarchyLegend from "../HierarchyLegend";
import { getSupplyChainColor } from "../../utils";

// Type definitions for the simplified animation
interface ValueChain {
  id: number;
  name: string;
  color: string;
  icon: string;
  x: number;
  y: number;
  radius: number;
}

interface Product {
  id: number;
  code: string;
  name: string;
  supplyChain: string;
  clusterId: number;
}

interface Cluster {
  id: number;
  name: string;
  products: Product[];
  valueChainIds: number[];
}

interface HighlightedProduct {
  productId: number;
  valueChainIds: number[];
}

interface AnimatedProduct {
  id: number | string;
  globalProductId: number;
  code: string;
  name: string;
  clusterId: number;
  x: number;
  y: number;
  r: number;
  opacity: number;
  fill: string;
  hasGlow?: boolean;
  glowColor?: string | null;
}

// Type for hierarchy node data
interface HierarchyNodeData {
  id: string;
  name?: string;
  clusterId?: number;
  value: number;
  data?: Product;
  children?: HierarchyNodeData[];
}

// Type for react-spring animated style
interface AnimatedStyle {
  x: any;
  y: any;
  r: any;
  opacity: any;
  fillColor?: any;
  fillOpacity?: any;
}

// Type for cluster transition data
interface ClusterTransitionData {
  id: string;
  clusterId: number;
  x: number;
  y: number;
  r: number;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  name: string;
  isHighlighted: boolean;
  textY: number;
  fontSize: number;
}

// Value chain names and their exact order (matching CirclePack.jsx)
const VALUE_CHAIN_ORDER = [
  "Electric Vehicles",
  "Heat Pumps",
  "Fuel Cells And Green Hydrogen",
  "Wind Power",
  "Solar Power",
  "Hydroelectric Power",
  "Nuclear Power",
  "Batteries",
  "Electric Grid",
  "Critical Metals and Minerals",
];

// Colors now sourced from shared utilities (consistent across app)

// Animation steps with duration configuration
const STEPS = [
  {
    id: "value-chains",
    title: "",
    description:
      "The path to decarbonization runs through these <b>green value chains</b>.",
    duration: 3000,
  },
  {
    id: "green-products",
    title: "",
    description:
      "Each green value chain is composed of products used in clean energy technologies, from raw materials to finished green technologies.",
    duration: 5000,
  },
  {
    id: "product-highlight-1",
    title: "",
    description: "Many products appear in more than one value chain.",
    duration: 1500,
  },
  {
    id: "product-highlight-2",
    title: "",
    description: "Many products appear in more than one value chain.",
    duration: 1500,
  },
  {
    id: "product-highlight-3",
    title: "",
    description: "Many products appear in more than one value chain.",
    duration: 1500,
  },
  {
    id: "value-chain-products",
    title: "",
    description:
      "For example, the Batteries value chain contains many distinct products that together enable battery technologies.",
    duration: 5000,
  },
  {
    id: "product-clusters",
    title: "",
    description:
      "Products that rely on similar capabilities naturally group into <b>green industrial clusters</b>.",
    duration: 5000,
  },
  {
    id: "value-chain-zoom",
    title: "",
    description:
      "Zooming into the [selected chain name] value chain reveals the full structure: individual products, organized into green industrial clusters, all nested within a single value chain.",
    duration: 5000,
  },
  {
    id: "all-value-chains-hierarchy",
    title: "",
    description:
      "Greenplexity maps ten value chains - Electric Vehicles, Heat Pumps, Fuel Cells & Green Hydrogen, Wind Power, Solar Power, Hydroelectric Power, Nuclear Power, Batteries, Electric Grid, and Critical Metals & Minerals - showing their respective clusters and products inside.",
    duration: 6000,
  },
];

interface AnimatedValueChainIntroProps {
  width?: number;
  height?: number;
  selectedCountry?: number;
  selectedYear?: number;
}

// Simple text wrapper for SVG tspans based on estimated characters-per-line
const estimateMaxCharsPerLine = (blockWidth: number, fontSizePx: number) => {
  const averageCharWidth = fontSizePx * 0.6; // rough estimate for Latin text
  return Math.max(10, Math.floor(blockWidth / Math.max(1, averageCharWidth)));
};

const wrapTextIntoLines = (text: string, maxChars: number): string[] => {
  const words = (text || "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";
  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length > maxChars && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
};

// Internal component that receives width and height
const AnimatedValueChainIntroInternal: React.FC<
  AnimatedValueChainIntroProps
> = ({
  width = 800,
  height = 600,
  selectedCountry = 1, // Default to a country with data
  selectedYear = 2021,
}) => {
  // Global responsive layout constants derived from visx ParentSize
  const controlsHeight = Math.max(48, Math.min(80, Math.round(height * 0.12)));
  const availableSvgHeight = Math.max(120, height - controlsHeight);
  const textAreaHeight = Math.max(
    56,
    Math.min(110, Math.round(availableSvgHeight * 0.18)),
  );
  const valueChainCellHeight = Math.max(
    72,
    Math.min(140, Math.round(availableSvgHeight * 0.22)),
  );
  const valueChainCircleRadius = Math.max(
    28,
    Math.min(50, Math.round(Math.min(width, availableSvgHeight) * 0.05)),
  );
  const valueChainTopOffset = Math.max(
    16,
    Math.min(40, Math.round(availableSvgHeight * 0.04)),
  );
  const valueChainLabelGap = Math.max(
    16,
    Math.min(30, Math.round(valueChainCircleRadius * 0.6)),
  );
  // Cluster title styling used for step 6 grid
  const clusterLabelFontSizeStep6 = 11;
  // Extra vertical offset for step 0 to visually center value chains a bit lower
  const step0YOffset = Math.max(
    16,
    Math.min(80, Math.round(availableSvgHeight * 0.08)),
  );
  const clusterLabelMarginStep6 = 12;
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [selectedValueChain, setSelectedValueChain] = useState<number | null>(
    1,
  );
  const [hoveredValueChain, setHoveredValueChain] = useState<number | null>(
    null,
  );
  const [randomSeed, setRandomSeed] = useState(0); // For randomizing selections on restart
  const previousHighlightedProduct = useRef<number | null>(null);

  // Get data from shared hook
  const { supplyChainsData, productClusterRows, isLoading, productMappings } =
    useGreenGrowthData(selectedCountry, selectedYear);

  // Calculate dynamic layout parameters based on products that have connections
  const layoutParams = useMemo(() => {
    const validProducts =
      productClusterRows?.filter((row) =>
        supplyChainsData?.ggSupplyChainList?.some(
          (chain: { supplyChain: string }) =>
            chain.supplyChain === row.supply_chain,
        ),
      ) || [];

    const numProducts = validProducts.length;
    const baseMargin = 50;
    const availableWidth = width - 2 * baseMargin;

    const minSpacing = 24;
    const maxSpacing = 35;
    const spaceRatio = (availableWidth * 0.7) / Math.max(1, numProducts);
    const dynamicSpacing = Math.min(
      maxSpacing,
      Math.max(minSpacing, spaceRatio * 8),
    );

    const dotSpacing = Math.round(dynamicSpacing);
    const dotsPerRow = Math.floor(availableWidth / dotSpacing);
    const rowSpacing = Math.round(dynamicSpacing * 0.9);

    const actualRows = Math.ceil(numProducts / dotsPerRow);
    const usedHeight = actualRows * rowSpacing;
    const extraMargin = Math.min(
      30,
      (availableSvgHeight - usedHeight - 300) / 4,
    );
    const margin = baseMargin + Math.max(0, extraMargin);

    return { dotSpacing, rowSpacing, margin };
  }, [width, availableSvgHeight, productClusterRows, supplyChainsData]);

  // Process data for animation - simplified for new design
  const animationData = useMemo(() => {
    if (!supplyChainsData?.ggSupplyChainList || !productClusterRows) {
      return { valueChains: [], products: [] };
    }

    // Create value chains in the exact order from CirclePack.jsx
    const valueChains: ValueChain[] = VALUE_CHAIN_ORDER.map(
      (chainName, index) => {
        // Find matching supply chain data
        const supplyChainData = supplyChainsData.ggSupplyChainList.find(
          (chain: { supplyChain: string; supplyChainId: number }) =>
            chain.supplyChain === chainName,
        );

        if (!supplyChainData) {
          return null;
        }

        // Calculate grid position (5 cols, 2 rows) - moved to top
        const cols = 5;
        const col = index % cols;
        const row = Math.floor(index / cols);

        const cellWidth = width / cols;
        const cellHeight = valueChainCellHeight;

        const x = col * cellWidth + cellWidth / 2;
        const y = row * cellHeight + cellHeight / 2 + valueChainTopOffset;

        return {
          id: supplyChainData.supplyChainId,
          name: chainName,
          color: getSupplyChainColor(supplyChainData.supplyChainId),
          icon: getValueChainIcon(chainName) || "",
          x,
          y,
          radius: valueChainCircleRadius,
        };
      },
    ).filter(Boolean) as ValueChain[];

    // Get all products for step 2
    const products: Product[] = productClusterRows.map((row) => ({
      id: row.product_id,
      code: row.HS2012_4dg,
      name: row.name_short_en,
      supplyChain: row.supply_chain,
      clusterId: row.dominant_cluster,
    }));

    return { valueChains, products };
  }, [
    supplyChainsData,
    productClusterRows,
    width,
    valueChainCellHeight,
    valueChainTopOffset,
    valueChainCircleRadius,
  ]);

  // (moved below after allProductToValueChains)

  // Create a mapping of all products to their value chains using the raw product mappings
  const allProductToValueChains = useMemo(() => {
    if (
      !productMappings?.length ||
      !supplyChainsData?.ggSupplyChainList?.length
    ) {
      return new Map();
    }

    const productValueChains = new Map<number, number[]>();

    // Use the raw product mappings directly to avoid the filtering issue
    productMappings.forEach((mapping) => {
      if (!productValueChains.has(mapping.productId)) {
        productValueChains.set(mapping.productId, []);
      }
      const existing = productValueChains.get(mapping.productId) || [];
      if (!existing.includes(mapping.supplyChainId)) {
        existing.push(mapping.supplyChainId);
        productValueChains.set(mapping.productId, existing);
      }
    });

    return productValueChains;
  }, [productMappings, supplyChainsData]);

  // Find products that appear in multiple value chains for highlighting
  const highlightedProducts = useMemo(() => {
    if (!allProductToValueChains.size) return [];

    // Use the actual product-to-value-chain mapping to find multi-chain products
    const highlights: HighlightedProduct[] = [];

    allProductToValueChains.forEach((valueChainIds, productId) => {
      if (valueChainIds.length >= 2) {
        highlights.push({
          productId,
          valueChainIds: valueChainIds,
        });
      }
    });

    // Sort by number of connections (most connected first)
    highlights.sort((a, b) => b.valueChainIds.length - a.valueChainIds.length);

    // If no multi-chain products found, create some sample highlights for demo
    if (highlights.length === 0) {
      const sampleProducts = Array.from(
        allProductToValueChains.entries(),
      ).slice(0, 3);
      sampleProducts.forEach(([productId, chains]) => {
        // Add a second chain to create fake multi-chain connections for demo
        const additionalChain = (chains[0] % 10) + 1; // Simple way to get another chain ID
        highlights.push({
          productId,
          valueChainIds: [...chains, additionalChain],
        });
      });
    }

    // Create a simple seeded random selection based on randomSeed
    const seededRandom = (seed: number, max: number) => {
      const x = Math.sin(seed) * 10000;
      return Math.floor((x - Math.floor(x)) * max);
    };

    // Randomize the selection order based on randomSeed
    const shuffledHighlights = [...highlights];
    for (let i = shuffledHighlights.length - 1; i > 0; i--) {
      const j = seededRandom(randomSeed + i, i + 1);
      [shuffledHighlights[i], shuffledHighlights[j]] = [
        shuffledHighlights[j],
        shuffledHighlights[i],
      ];
    }

    return shuffledHighlights.slice(0, 5); // Return top 5 most connected products
  }, [allProductToValueChains, randomSeed]);

  // Compute a stable grid index for each product to create a wave-like darkness pattern
  const productGridIndexMap = useMemo(() => {
    if (!animationData.products.length) return new Map<number, number>();

    // Filter to products that have any value-chain mapping
    const validProducts = animationData.products.filter((product) =>
      allProductToValueChains.has(product.id as number),
    );

    const { dotSpacing, margin } = layoutParams;
    const availableWidth = width - 2 * margin;
    const dotsPerRow = Math.max(
      1,
      Math.floor(availableWidth / Math.max(1, dotSpacing)),
    );
    const rows = Math.max(1, Math.ceil(validProducts.length / dotsPerRow));

    // Rank products by how many value chains they appear in (desc)
    const productsWithCounts = validProducts
      .map((p) => ({
        product: p,
        count: (allProductToValueChains.get(p.id) || []).length,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return (a.product.id as number) - (b.product.id as number);
      });

    // Score each grid position using a sine wave across columns
    const phase = -Math.PI / 2; // start with a crest at the left
    const base = (rows - 1) * 0.5; // vertical midpoint
    const amplitude = (rows - 1) * 0.45; // wave height relative to grid

    const positions = Array.from(
      { length: validProducts.length },
      (_, index) => {
        const row = Math.floor(index / dotsPerRow);
        const col = index % dotsPerRow;
        const waveAtCol =
          base +
          amplitude *
            Math.sin((2 * Math.PI * col) / Math.max(1, dotsPerRow) + phase);
        const score = waveAtCol - row; // higher means deeper inside the wave
        return { index, row, col, score };
      },
    ).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.col !== b.col) return a.col - b.col; // deterministic tiebreakers
      return a.row - b.row;
    });

    const map = new Map<number, number>();
    for (let i = 0; i < productsWithCounts.length; i++) {
      const productId = productsWithCounts[i].product.id as number;
      const positionIndex = positions[i]?.index ?? i;
      map.set(productId, positionIndex);
    }
    return map;
  }, [animationData.products, allProductToValueChains, layoutParams, width]);

  // Extract data for compatibility with CirclePack pattern (currently unused)
  // const currentData = useMemo(() => {
  //   if (!countryData?.productData) return null;
  //   return {
  //     ggCpyList: countryData.productData,
  //     ggCpyscList: countryData.productSupplyChainData || [],
  //     productClusterRows: productClusterRows || [],
  //   };
  // }, [productClusterRows]);

  // Transform data for clusters-only layout using proven approach from ClusterTreeInternal.tsx
  const clusterData = useMemo(() => {
    if (!productClusterRows || productClusterRows.length === 0) {
      return new Map<number, Cluster>();
    }

    const clusters = new Map<number, Cluster>();

    // Use productClusterRows directly - this is the proven approach that works
    productClusterRows.forEach((row) => {
      const clusterId = row.dominant_cluster;
      const clusterName = row.cluster_name;
      const productId = row.product_id;

      if (!clusters.has(clusterId)) {
        clusters.set(clusterId, {
          id: clusterId,
          name: clusterName,
          products: [],
          valueChainIds: [],
        });
      }

      const cluster = clusters.get(clusterId);
      if (!cluster) return;

      // Only add product if not already in this cluster (deduplicate)
      const existingProduct = cluster.products.find((p) => p.id === productId);
      if (!existingProduct) {
        const productObj: Product = {
          id: productId,
          code: row.HS2012_4dg,
          name: row.name_short_en,
          supplyChain: row.supply_chain,
          clusterId: clusterId,
        };

        cluster.products.push(productObj);

        // Track which value chains this cluster spans using allProductToValueChains mapping
        const productValueChains = allProductToValueChains.get(productId) || [];
        productValueChains.forEach((vcId: number) => {
          if (!cluster.valueChainIds.includes(vcId)) {
            cluster.valueChainIds.push(vcId);
          }
        });
      }
    });

    return clusters;
  }, [productClusterRows, allProductToValueChains]);

  // Generate cluster positions for step 6 using a responsive grid layout
  const clusterPositions = useMemo(() => {
    if (currentStep !== 6) return new Map();

    const allClusters = Array.from(clusterData.values());
    if (allClusters.length === 0) return new Map();

    // Three-row layout: value chains, clusters+products, text
    const valueChainBottomY =
      2 * valueChainCellHeight +
      valueChainTopOffset +
      valueChainCircleRadius +
      valueChainLabelGap;

    const clusterAreaTop = valueChainBottomY + 15; // Start tight to value chains
    const clusterAreaBottom = availableSvgHeight - textAreaHeight - 20; // Leave room for text at bottom

    const minY = clusterAreaTop; // Start tight below value chains
    const maxY = clusterAreaBottom; // End before text area
    const minX = 40; // Responsive margin from left edge
    const maxX = width - 40; // Responsive margin from right edge

    const gridWidth = Math.max(0, maxX - minX);
    const gridHeight = Math.max(0, maxY - minY);

    // Compute grid dimensions based on available aspect ratio and number of clusters
    const numClusters = allClusters.length;
    const aspect = gridWidth > 0 && gridHeight > 0 ? gridWidth / gridHeight : 1;
    const cols = Math.max(1, Math.ceil(Math.sqrt(numClusters * aspect)));
    const rows = Math.max(1, Math.ceil(numClusters / cols));

    const cellWidth = cols > 0 ? gridWidth / cols : gridWidth;
    const cellHeight = rows > 0 ? gridHeight / rows : gridHeight;

    // Reserve vertical space in each cell for the cluster title above the circle
    const reservedLabelSpace =
      clusterLabelFontSizeStep6 + clusterLabelMarginStep6;

    const positionMap = new Map();
    allClusters.forEach((cluster, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const centerX = minX + col * cellWidth + cellWidth / 2;
      const centerY = minY + row * cellHeight + cellHeight / 2;

      // Circle radius: take more space while avoiding overlap and reserving label area
      const horizontalPadding = 6; // px between circles in adjacent columns
      const verticalPadding = 4; // px between circle and label area inside the cell

      // Width constraint: half cell width minus padding to avoid touching neighbors
      const radiusByWidth = Math.max(10, cellWidth * 0.5 - horizontalPadding);

      // Height constraint: use remaining vertical space after reserving label area
      // Remaining height = cellHeight - reservedLabelSpace
      // Max radius from height = 0.5 * remainingHeight - vertical padding
      const maxRadiusByHeight = Math.max(
        0,
        0.5 * (cellHeight - reservedLabelSpace) - verticalPadding,
      );
      const radiusByHeight = Math.max(10, maxRadiusByHeight);

      const radius = Math.max(12, Math.min(radiusByWidth, radiusByHeight));

      positionMap.set(cluster.id, {
        x: centerX,
        y: centerY,
        radius,
        cluster,
      });
    });

    return positionMap;
  }, [
    currentStep,
    clusterData,
    width,
    availableSvgHeight,
    valueChainCellHeight,
    valueChainTopOffset,
    valueChainCircleRadius,
    valueChainLabelGap,
    textAreaHeight,
  ]);

  // Precompute final step (step 8) grid layout and packed hierarchies so all elements share the same centers/radii
  const finalStepLayout = useMemo(() => {
    const layoutMap = new Map<
      number,
      { centerX: number; centerY: number; radius: number; packedRoot: any }
    >();
    if (!animationData.valueChains.length || clusterData.size === 0)
      return layoutMap;

    const cols = 5;
    const rows = 2;
    const marginX = 40;
    const marginY = Math.max(
      40,
      Math.min(80, Math.round(availableSvgHeight * 0.08)),
    );
    const cellWidth = (width - marginX * 2) / cols;
    const cellHeight = (availableSvgHeight - marginY * 2) / rows;

    animationData.valueChains.forEach((chain) => {
      const chainIndex = VALUE_CHAIN_ORDER.indexOf(chain.name);
      const col = chainIndex % cols;
      const row = Math.floor(chainIndex / cols);
      const centerX = marginX + col * cellWidth + cellWidth / 2;
      const centerY = marginY + row * cellHeight + cellHeight / 2;
      const chainRadius = Math.min(cellWidth, cellHeight) * 0.42;

      // Build hierarchy for this chain
      const valueChainClusters = Array.from(clusterData.values()).filter((c) =>
        c.valueChainIds.includes(chain.id),
      );

      const hierarchyData = {
        id: `value-chain-${chain.id}`,
        value: 0,
        children: valueChainClusters
          .map((cluster) => {
            const valueChainProducts = cluster.products.filter((product) => {
              const vcIds = allProductToValueChains.get(product.id) || [];
              return vcIds.includes(chain.id);
            });
            return {
              id: `cluster-${cluster.id}`,
              name: cluster.name,
              clusterId: cluster.id,
              value: 0,
              children: valueChainProducts.map((product) => ({
                id: `product-${product.id}`,
                value: 1,
                data: product,
              })),
            };
          })
          .filter((c) => c.children.length > 0),
      };

      const root = hierarchy(hierarchyData)
        .sum((d) => d.value || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      const packer = pack()
        .size([chainRadius * 2, chainRadius * 2])
        .padding((d) => {
          if (d.depth === 0) return 12;
          if (d.depth === 1) return 4;
          return 2;
        });
      const packedRoot = packer(root);

      layoutMap.set(chain.id, {
        centerX,
        centerY,
        radius: chainRadius,
        packedRoot,
      });
    });

    return layoutMap;
  }, [
    animationData.valueChains,
    clusterData,
    allProductToValueChains,
    width,
    availableSvgHeight,
  ]);

  // Determine which product to highlight in the current step
  const currentHighlightedProduct = useMemo(() => {
    if (currentStep < 2) return null; // No highlighting in first two steps
    if (hoveredProduct) return hoveredProduct; // Use hovered product if available

    // Use different products for different slides (cycle through them)
    if (highlightedProducts.length === 0) {
      // Fallback: use the first product if no highlighted products found
      return animationData.products[0]?.id || null;
    }

    const highlightIndex = (currentStep - 2) % highlightedProducts.length;
    const selectedProduct =
      highlightedProducts[highlightIndex]?.productId || null;

    // Track the selected product for reference
    if (
      selectedProduct &&
      selectedProduct !== previousHighlightedProduct.current
    ) {
      previousHighlightedProduct.current = selectedProduct;
    }
    return selectedProduct;
  }, [
    currentStep,
    hoveredProduct,
    highlightedProducts,
    animationData.products,
  ]);

  // Calculate animated product positions for current step
  const animatedProducts = useMemo(() => {
    if (!animationData.products.length) return [];

    const products: AnimatedProduct[] = [];
    // Three-row layout: use same positioning as clusters
    const valueChainBottom =
      2 * valueChainCellHeight +
      valueChainTopOffset +
      valueChainCircleRadius +
      valueChainLabelGap;
    const startY = valueChainBottom + 15; // Start tight below value chains, same as clusters

    if (currentStep < 6) {
      // Grid layout for steps 0-4
      const validProducts = animationData.products.filter((product) =>
        allProductToValueChains.has(product.id as number),
      );

      const { dotSpacing, rowSpacing, margin } = layoutParams;
      const availableWidth = width - 2 * margin;
      const dotsPerRow = Math.floor(availableWidth / dotSpacing);

      validProducts.forEach((product, index) => {
        const assignedIndex =
          productGridIndexMap.get(product.id as number) ?? index;
        const row = Math.floor(assignedIndex / dotsPerRow);
        const col = assignedIndex % dotsPerRow;

        const startX =
          margin + (availableWidth - (dotsPerRow - 1) * dotSpacing) / 2;
        const x = startX + col * dotSpacing;
        const y = startY + row * rowSpacing;

        const isHighlighted =
          currentHighlightedProduct === product.id ||
          currentHighlightedProduct === (product as any).globalProductId ||
          hoveredProduct === product.id ||
          hoveredProduct === (product as any).globalProductId;
        const isInProductHighlightStep = currentStep >= 2;

        // Check if this product should have a glow effect when value chain is hovered in step 2
        const productValueChains =
          allProductToValueChains.get(product.id) || [];
        const isProductHovered =
          currentStep === 2 &&
          hoveredValueChain !== null &&
          productValueChains.includes(hoveredValueChain);

        // Get the color of the hovered value chain for the glow effect
        let glowColor = null;
        if (isProductHovered && hoveredValueChain !== null) {
          const hoveredChain = animationData.valueChains.find(
            (vc) => vc.id === hoveredValueChain,
          );
          glowColor = hoveredChain?.color || "#2685BD";
        }

        // For smooth transitions with duplicated products across value chains,
        // emit one bubble per value chain using consistent VC-specific IDs.
        // Position overlaps for all duplicates in early steps so they can fan out later.
        productValueChains.forEach((vcId: number) => {
          // Step 5: emphasize only the selected value chain's duplicates
          let productColor = "#9CA3AF";
          let productOpacity = 0.7;
          let productRadius = 9;

          if (currentStep === 5 && selectedValueChain !== null) {
            if (vcId === selectedValueChain) {
              const selectedChain = animationData.valueChains.find(
                (vc) => vc.id === selectedValueChain,
              );
              productColor = selectedChain?.color || "#2685BD";
              productOpacity = 1;
              productRadius = 11;
            } else {
              productOpacity = 0.15; // deemphasize non-selected VC duplicates
            }
          }

          // Glow only for the hovered value chain's duplicate
          const duplicateHasGlow =
            isProductHovered && hoveredValueChain === vcId;

          products.push({
            id: `product-${product.id}-vc-${vcId}`,
            globalProductId: product.id,
            code: product.code,
            name: product.name,
            clusterId: product.clusterId,
            x,
            y,
            r: currentStep === 5 ? productRadius : isHighlighted ? 13.5 : 9,
            opacity:
              currentStep === 5
                ? productOpacity
                : isInProductHighlightStep
                  ? isHighlighted
                    ? 1
                    : 0.3
                  : 0.7,
            fill:
              currentStep === 5
                ? productColor
                : isHighlighted
                  ? "#000"
                  : "#9CA3AF",
            hasGlow: duplicateHasGlow,
            glowColor: duplicateHasGlow ? glowColor : null,
          });
        });
      });
    } else if (currentStep === 6 && selectedValueChain !== null) {
      // Clustered layout for step 5 - use shared cluster positions
      // Now position products within each cluster using circle packing
      clusterPositions.forEach((position, _clusterId) => {
        const cluster = position.cluster;
        const clusterRadius = position.radius;
        const centerX = position.x;
        const centerY = position.y;

        // Use d3 circle packing for products within cluster
        const hierarchyData = {
          id: `cluster-${cluster.id}`,
          value: 0,
          children: cluster.products.map((product: Product) => ({
            id: `product-${product.id}`,
            value: 1, // Equal value for all products = equal size
            data: product,
          })),
        };

        const root = hierarchy(hierarchyData)
          .sum((d) => d.value || 1)
          .sort((a, b) => (b.value || 0) - (a.value || 0));

        const packer = pack()
          .size([clusterRadius * 1.8, clusterRadius * 1.8])
          .padding(2); // Padding between products

        const packedRoot = packer(root);
        const layoutCenterX = clusterRadius * 0.9;
        const layoutCenterY = clusterRadius * 0.9;

        packedRoot.children?.forEach(
          (productNode: HierarchyCircularNode<HierarchyNodeData>) => {
            const product = (productNode.data as HierarchyNodeData).data;

            if (!product) return;

            const x = centerX + (productNode.x - layoutCenterX);
            const y = centerY + (productNode.y - layoutCenterY);

            // Check if this specific product belongs to the selected value chain
            const productValueChains =
              allProductToValueChains.get(product.id) || [];
            const isProductHighlighted =
              productValueChains.includes(selectedValueChain);
            const isProductHovered =
              hoveredValueChain !== null &&
              productValueChains.includes(hoveredValueChain);

            // Get the color of the hovered value chain for the glow effect
            let glowColor = null;
            if (isProductHovered && hoveredValueChain !== null) {
              const hoveredChain = animationData.valueChains.find(
                (vc) => vc.id === hoveredValueChain,
              );
              glowColor = hoveredChain?.color || "#2685BD";
            }

            // Get the color of the selected value chain for highlighted products
            let selectedChainColor = "#2685BD"; // fallback
            if (isProductHighlighted && selectedValueChain !== null) {
              const selectedChain = animationData.valueChains.find(
                (vc) => vc.id === selectedValueChain,
              );
              selectedChainColor = selectedChain?.color || "#2685BD";
            }

            // Use uniform product size (equal circles) - scale based on cluster size
            const productSize = Math.max(4, Math.min(8, productNode.r * 0.6));

            products.push({
              id: `product-${product.id}-vc-${selectedValueChain}`,
              globalProductId: product.id,
              code: product.code,
              name: product.name,
              clusterId: product.clusterId,
              x,
              y,
              r: productSize, // Equal size for all products
              opacity: isProductHighlighted ? 1 : 0.3,
              fill: isProductHighlighted ? selectedChainColor : "#CCCCCC",
              hasGlow: isProductHovered, // Add glow state
              glowColor: glowColor, // Add glow color
            });
          },
        );
      });
    } else if (currentStep === 7 && selectedValueChain !== null) {
      // Step 7: 3-level circle pack zoom-in on selected value chain
      // Create hierarchy: value chain > clusters > products

      const valueChainClusters = Array.from(clusterData.values()).filter(
        (cluster) => cluster.valueChainIds.includes(selectedValueChain),
      );

      if (valueChainClusters.length === 0) {
        // Fallback: show all clusters if none found for selected value chain
        valueChainClusters.push(...Array.from(clusterData.values()));
      }

      // Create 3-level hierarchical structure
      const hierarchyData = {
        id: `value-chain-${selectedValueChain}`,
        name:
          animationData.valueChains.find((vc) => vc.id === selectedValueChain)
            ?.name || "Value Chain",
        value: 0,
        children: valueChainClusters
          .map((cluster) => {
            // Filter products to only include those from the selected value chain
            const valueChainProducts = cluster.products.filter((product) => {
              const productValueChains =
                allProductToValueChains.get(product.id) || [];
              return productValueChains.includes(selectedValueChain);
            });

            return {
              id: `cluster-${cluster.id}`,
              name: cluster.name,
              clusterId: cluster.id,
              value: 0,
              children: valueChainProducts.map((product) => ({
                id: `product-${product.id}-vc-${selectedValueChain}`,
                value: 1, // Equal size for all products
                data: product,
              })),
            };
          })
          .filter((cluster) => cluster.children.length > 0), // Only include clusters with products
      };

      const root = hierarchy(hierarchyData)
        .sum((d) => d.value || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      // Use full available space for the zoom view, 30% smaller
      const availableWidth = width - 40;
      const availableHeight = availableSvgHeight - textAreaHeight - 20;
      const packingSize = Math.min(availableWidth, availableHeight) * 0.65;

      const packer = pack()
        .size([packingSize, packingSize])
        .padding((d) => {
          // Different padding based on hierarchy level
          if (d.depth === 0) return 30; // Value chain container
          if (d.depth === 1) return 15; // Between clusters
          return 3; // Between products
        });

      const packedRoot = packer(root);
      const centerX = width / 2;
      const centerY = (availableSvgHeight - textAreaHeight) / 2; // Center within svg area above text
      const layoutCenterX = packingSize / 2;
      const layoutCenterY = packingSize / 2;

      // Add products within clusters
      packedRoot.children?.forEach(
        (clusterNode: HierarchyCircularNode<HierarchyNodeData>) => {
          clusterNode.children?.forEach(
            (productNode: HierarchyCircularNode<HierarchyNodeData>) => {
              const product = (productNode.data as HierarchyNodeData).data;

              if (!product) return;

              const productX = centerX + (productNode.x - layoutCenterX);
              const productY = centerY + (productNode.y - layoutCenterY);

              // Scale product size based on available space
              const productSize = Math.max(
                3,
                Math.min(12, productNode.r * 0.7),
              );

              // Check if this product should have a glow effect
              const productValueChains =
                allProductToValueChains.get(product.id) || [];
              const isProductHovered =
                hoveredValueChain !== null &&
                productValueChains.includes(hoveredValueChain);

              // Get the color of the hovered value chain for the glow effect
              let glowColor = null;
              if (isProductHovered && hoveredValueChain !== null) {
                const hoveredChain = animationData.valueChains.find(
                  (vc) => vc.id === hoveredValueChain,
                );
                glowColor = hoveredChain?.color || "#2685BD";
              }

              // Get the color of the selected value chain
              let selectedChainColor = "#2685BD"; // fallback
              if (selectedValueChain !== null) {
                const selectedChain = animationData.valueChains.find(
                  (vc) => vc.id === selectedValueChain,
                );
                selectedChainColor = selectedChain?.color || "#2685BD";
              }

              products.push({
                id: `product-${product.id}-vc-${selectedValueChain}`,
                globalProductId: product.id,
                code: product.code,
                name: product.name,
                clusterId: product.clusterId,
                x: productX,
                y: productY,
                r: productSize,
                opacity: 1,
                fill: selectedChainColor,
                hasGlow: isProductHovered,
                glowColor: glowColor,
              });
            },
          );
        },
      );
    } else if (currentStep === 8) {
      // Step 8: Use shared final layout so clusters and products align perfectly
      animationData.valueChains.forEach((chain) => {
        const layout = finalStepLayout.get(chain.id);
        if (!layout) return;
        const packedRoot = layout.packedRoot;
        const centerX = layout.centerX;
        const centerY = layout.centerY;
        // When pack size is [2R,2R], root is centered at (R,R)
        const layoutCenterX = layout.radius;
        const layoutCenterY = layout.radius;

        packedRoot.children?.forEach(
          (clusterNode: HierarchyCircularNode<HierarchyNodeData>) => {
            clusterNode.children?.forEach(
              (productNode: HierarchyCircularNode<HierarchyNodeData>) => {
                const product = (productNode.data as HierarchyNodeData).data;
                if (!product) return;

                const x = centerX + (productNode.x - layoutCenterX);
                const y = centerY + (productNode.y - layoutCenterY);

                const productSize = Math.max(
                  3,
                  Math.min(9, productNode.r * 0.6),
                );

                const productValueChains =
                  allProductToValueChains.get(product.id) || [];
                const isProductHovered =
                  hoveredValueChain !== null &&
                  productValueChains.includes(hoveredValueChain);

                // Hover color based on hovered value chain
                let glowColor = null as string | null;
                if (isProductHovered && hoveredValueChain !== null) {
                  const hoveredChain = animationData.valueChains.find(
                    (vc) => vc.id === hoveredValueChain,
                  );
                  glowColor = hoveredChain?.color || "#2685BD";
                }

                products.push({
                  id: `product-${product.id}-vc-${chain.id}`,
                  globalProductId: product.id,
                  code: product.code,
                  name: product.name,
                  clusterId: product.clusterId,
                  x,
                  y,
                  r: productSize,
                  opacity: 1,
                  fill: chain.color,
                  hasGlow: isProductHovered,
                  glowColor,
                });
              },
            );
          },
        );
      });
    }

    return products;
  }, [
    animationData.products,
    animationData.valueChains,
    currentStep,
    allProductToValueChains,
    layoutParams,
    width,
    availableSvgHeight,
    textAreaHeight,
    hoveredProduct,
    currentHighlightedProduct,
    selectedValueChain,
    hoveredValueChain,
    clusterData,
    clusterPositions,
    finalStepLayout,
    productGridIndexMap,
    valueChainCellHeight,
    valueChainTopOffset,
    valueChainCircleRadius,
    valueChainLabelGap,
  ]);

  // Prepare value chain data for transitions
  const valueChainTransitionData = useMemo(() => {
    return animationData.valueChains.map((chain) => {
      let opacity = 1;
      let isHighlighted = false;
      let position = { x: chain.x, y: chain.y, r: chain.radius };
      let computedFillColor = chain.color;
      // Soften value chain fill globally to make colors less aggressive
      let computedFillOpacity = 0.4;

      // In the initial step with only value chains, nudge them down a bit
      if (currentStep === 0) {
        position = { ...position, y: chain.y + step0YOffset };
      }

      if (currentStep >= 2 && currentStep < 5 && currentHighlightedProduct) {
        // Product highlighting steps (2-4)
        const connectedChains =
          allProductToValueChains.get(currentHighlightedProduct) || [];
        if (connectedChains.length === 0) {
          const highlightedProductData = highlightedProducts.find(
            (p) => p.productId === currentHighlightedProduct,
          );
          if (highlightedProductData) {
            connectedChains.push(...highlightedProductData.valueChainIds);
          }
        }
        opacity = connectedChains.includes(chain.id) ? 1 : 0.3;
      } else if (currentStep === 5) {
        // Value chain products step - highlight selected value chain
        isHighlighted = selectedValueChain === chain.id;
        opacity = isHighlighted ? 1 : 0.4;
      } else if (currentStep === 6) {
        // Clustering step - highlight selected value chain
        isHighlighted = selectedValueChain === chain.id;
        opacity = isHighlighted ? 1 : 0.4;
      } else if (currentStep === 7) {
        // Zoom step - animate selected value chain to outer circle of hierarchy, hide others
        if (selectedValueChain === chain.id) {
          opacity = 1;
          computedFillColor = "white";
          // Match step 8 style: outline only
          computedFillOpacity = 0;

          // Calculate the exact position and size of the outer circle from the 3-level hierarchy
          const valueChainClusters = Array.from(clusterData.values()).filter(
            (cluster) => cluster.valueChainIds.includes(selectedValueChain),
          );

          if (valueChainClusters.length > 0) {
            // Create the same hierarchical structure as used in cluster transitions
            const hierarchyData = {
              id: `value-chain-${selectedValueChain}`,
              value: 0,
              children: valueChainClusters
                .map((cluster) => {
                  const valueChainProducts = cluster.products.filter(
                    (product) => {
                      const productValueChains =
                        allProductToValueChains.get(product.id) || [];
                      return productValueChains.includes(selectedValueChain);
                    },
                  );

                  return {
                    id: `cluster-${cluster.id}`,
                    name: cluster.name,
                    clusterId: cluster.id,
                    value: 0,
                    children: valueChainProducts.map((product) => ({
                      id: `product-${product.id}`,
                      value: 1,
                      data: product,
                    })),
                  };
                })
                .filter((cluster) => cluster.children.length > 0),
            };

            const root = hierarchy(hierarchyData)
              .sum((d) => d.value || 0)
              .sort((a, b) => (b.value || 0) - (a.value || 0));

            // Use full available space since we're hiding other value chains
            const availableWidth = width - 40; // Minimal margins
            const availableHeight = availableSvgHeight - textAreaHeight - 20;
            const packingSize =
              Math.min(availableWidth, availableHeight) * 0.65; // 30% smaller than before (0.95 * 0.7 ≈ 0.65)

            const packer = pack()
              .size([packingSize, packingSize])
              .padding((d) => {
                if (d.depth === 0) return 30; // Value chain container
                if (d.depth === 1) return 15; // Between clusters
                return 3; // Between products
              });

            const packedRoot = packer(root);
            const centerX = width / 2;
            const centerY = (availableSvgHeight - textAreaHeight) / 2; // Center within svg area

            // Use the exact position and radius of the outer circle
            position = {
              x: centerX,
              y: centerY,
              r: packedRoot.r,
            };
          } else {
            // Fallback if no clusters found - use full available space
            const availableHeight = availableSvgHeight - textAreaHeight - 20;
            const packingSize = Math.min(width - 40, availableHeight) * 0.65;
            position = {
              x: width / 2,
              y: (availableSvgHeight - textAreaHeight) / 2, // Center within svg area
              r: packingSize / 2,
            };
          }
        } else {
          opacity = 0; // Hide non-selected chains
        }
      } else if (currentStep === 8) {
        // Use final step layout centers/radii for container circles as well
        const layout = finalStepLayout.get(chain.id);
        const centerX = layout?.centerX ?? chain.x;
        const centerY = layout?.centerY ?? chain.y;
        const chainRadius = layout?.radius ?? chain.radius;
        opacity = 1;
        isHighlighted = false;
        position = { x: centerX, y: centerY, r: chainRadius };
        // Keep color but hide fill via opacity instead of switching to 'none'
        computedFillOpacity = 0;
      }

      return {
        ...chain,
        opacity,
        isHighlighted,
        x: position.x,
        y: position.y,
        r: position.r,
        fillColor: computedFillColor,
        fillOpacity: computedFillOpacity,
      };
    });
  }, [
    animationData.valueChains,
    currentStep,
    currentHighlightedProduct,
    selectedValueChain,
    allProductToValueChains,
    highlightedProducts,
    clusterData,
    width,
    availableSvgHeight,
    textAreaHeight,
    step0YOffset,
    finalStepLayout,
  ]);

  // Create spring transitions for value chains
  const valueChainTransitions = useTransition(valueChainTransitionData, {
    from: (item) => ({
      x: item.x,
      y: item.y,
      r: item.r,
      opacity: 0,
      fillColor: item.color,
      fillOpacity: 0,
    }),
    enter: (item) => ({
      x: item.x,
      y: item.y,
      r: item.r,
      opacity: item.opacity,
      fillColor: item.fillColor,
      fillOpacity: item.fillOpacity ?? 1,
    }),
    update: (item) => ({
      x: item.x,
      y: item.y,
      r: item.r,
      opacity: item.opacity,
      fillColor: item.fillColor,
      fillOpacity: item.fillOpacity ?? 1,
    }),
    leave: () => ({
      opacity: 0,
    }),
    keys: (item) => item.id,
    config: config.gentle,
  });

  // Create cluster transition data
  const clusterTransitionData = useMemo(() => {
    if (currentStep !== 6 && currentStep !== 7 && currentStep !== 8) return [];

    const clusters: ClusterTransitionData[] = [];

    if (currentStep === 6) {
      // Step 6: Use shared cluster positions
      Array.from(clusterPositions.values()).forEach((position) => {
        const cluster = position.cluster;
        const isHighlighted =
          cluster.valueChainIds.includes(selectedValueChain);

        clusters.push({
          id: `cluster-${cluster.id}`,
          clusterId: cluster.id,
          x: position.x,
          y: position.y,
          r: position.radius,
          opacity: isHighlighted ? 1 : 0.4,
          fill: "white",
          stroke: "#000",
          strokeWidth: 1,
          name: cluster.name,
          isHighlighted,
          textY: position.y - position.radius - 10,
          fontSize: 11,
        });
      });
    } else if (currentStep === 7 && selectedValueChain !== null) {
      // Step 7: Use hierarchical circle packing for clusters
      const valueChainClusters = Array.from(clusterData.values()).filter(
        (cluster) => cluster.valueChainIds.includes(selectedValueChain),
      );

      if (valueChainClusters.length > 0) {
        // Determine selected chain color for styling
        const selectedChainObj = animationData.valueChains.find(
          (vc) => vc.id === selectedValueChain,
        );
        const selectedChainColor = selectedChainObj?.color || "#2685BD";

        // Create hierarchical structure matching the product layout in step 6
        const hierarchyData = {
          id: `value-chain-${selectedValueChain}`,
          value: 0,
          children: valueChainClusters
            .map((cluster) => {
              const valueChainProducts = cluster.products.filter((product) => {
                const productValueChains =
                  allProductToValueChains.get(product.id) || [];
                return productValueChains.includes(selectedValueChain);
              });

              return {
                id: `cluster-${cluster.id}`,
                name: cluster.name,
                clusterId: cluster.id,
                value: 0,
                children: valueChainProducts.map((product) => ({
                  id: `product-${product.id}`,
                  value: 1,
                  data: product,
                })),
              };
            })
            .filter((cluster) => cluster.children.length > 0),
        };

        const root = hierarchy(hierarchyData)
          .sum((d) => d.value || 0)
          .sort((a, b) => (b.value || 0) - (a.value || 0));

        // Use full available space since we're hiding other value chains
        const availableWidth = width - 40; // Minimal margins
        const availableHeight = availableSvgHeight - textAreaHeight - 20;
        const packingSize = Math.min(availableWidth, availableHeight) * 0.65; // 30% smaller than before

        const packer = pack()
          .size([packingSize, packingSize])
          .padding((d) => {
            if (d.depth === 0) return 30; // Value chain container
            if (d.depth === 1) return 15; // Between clusters
            return 3; // Between products
          });

        const packedRoot = packer(root);
        const centerX = width / 2;
        const centerY = (availableSvgHeight - textAreaHeight) / 2; // Center within svg area
        const layoutCenterX = packingSize / 2;
        const layoutCenterY = packingSize / 2;

        // Add cluster circles from the hierarchical layout
        packedRoot.children?.forEach(
          (clusterNode: HierarchyCircularNode<HierarchyNodeData>) => {
            const clusterX = centerX + (clusterNode.x - layoutCenterX);
            const clusterY = centerY + (clusterNode.y - layoutCenterY);
            const clusterData = clusterNode.data as HierarchyNodeData;

            clusters.push({
              id: `cluster-${clusterData.clusterId || 0}`,
              clusterId: clusterData.clusterId || 0,
              x: clusterX,
              y: clusterY,
              r: clusterNode.r,
              opacity: 0.6,
              fill: "none", // Match step 8 outline-only style
              stroke: selectedChainColor,
              strokeWidth: 0.5,
              name: clusterData.name || "Unnamed Cluster",
              isHighlighted: true,
              textY: clusterY, // Center text on cluster circle
              fontSize: 12,
            });
          },
        );
      }
    } else if (currentStep === 8) {
      // Step 8: use EXACT same packed layout as products
      animationData.valueChains.forEach((chain) => {
        const layout = finalStepLayout.get(chain.id);
        if (!layout) return;
        const centerX = layout.centerX;
        const centerY = layout.centerY;
        const layoutCenterX = layout.radius; // packed root centered at (R,R)
        const layoutCenterY = layout.radius;

        layout.packedRoot.children?.forEach((clusterNode: any) => {
          const nodeData = clusterNode.data as HierarchyNodeData;
          const clusterX = centerX + (clusterNode.x - layoutCenterX);
          const clusterY = centerY + (clusterNode.y - layoutCenterY);

          clusters.push({
            id: `cluster-${nodeData.clusterId}-vc-${chain.id}`,
            clusterId: nodeData.clusterId || 0,
            x: clusterX,
            y: clusterY,
            r: clusterNode.r,
            opacity: 0.6,
            fill: "none",
            stroke: chain.color,
            strokeWidth: 0.5,
            name: "",
            isHighlighted: false,
            textY: clusterY,
            fontSize: 11,
          });
        });
      });
    }

    return clusters;
  }, [
    currentStep,
    selectedValueChain,
    clusterPositions,
    clusterData,
    allProductToValueChains,
    animationData.valueChains,
    finalStepLayout,
    width,
    availableSvgHeight,
    textAreaHeight,
  ]);

  // Cluster transitions
  const clusterTransitions = useTransition(clusterTransitionData, {
    keys: (item) => item.id,
    from: (item) => ({ x: item.x, y: item.y, r: 0, opacity: 0 }), // Start from final position with zero radius
    enter: (item) => ({
      x: item.x,
      y: item.y,
      r: item.r,
      opacity: item.opacity,
    }),
    update: (item) => ({
      x: item.x,
      y: item.y,
      r: item.r,
      opacity: item.opacity,
    }),
    leave: (item) => ({ x: item.x, y: item.y, r: 0, opacity: 0 }), // Shrink to zero radius at final position
    config: config.gentle,
  });

  // Create spring transitions for animated products
  const productTransitions = useTransition(animatedProducts, {
    from: (item: AnimatedProduct) => ({
      x: item.x,
      y: item.y,
      r: 0,
      opacity: 0,
    }),
    enter: (item: AnimatedProduct) => ({
      x: item.x,
      y: item.y,
      r: item.r,
      opacity: item.opacity,
    }),
    update: (item: AnimatedProduct) => ({
      x: item.x,
      y: item.y,
      r: item.r,
      opacity: item.opacity,
    }),
    leave: () => ({
      r: 0,
      opacity: 0,
    }),
    keys: (item: AnimatedProduct) => item.id,
    config: { ...config.gentle, tension: 120, friction: 18 },
  });

  // Set default value chain when entering clustering step
  useEffect(() => {
    if (
      (currentStep === 5 || currentStep === 6 || currentStep === 7) &&
      selectedValueChain === null
    ) {
      // Steps 5, 6 and 7 all require a selected value chain
      // Find the value chain with the most clusters
      const valueChainClusterCounts = new Map<number, number>();

      clusterData.forEach((cluster) => {
        cluster.valueChainIds.forEach((vcId) => {
          valueChainClusterCounts.set(
            vcId,
            (valueChainClusterCounts.get(vcId) || 0) + 1,
          );
        });
      });

      if (valueChainClusterCounts.size > 0) {
        // Get available value chains sorted by cluster count
        const sortedValueChains = Array.from(valueChainClusterCounts.entries())
          .sort(([, a], [, b]) => b - a)
          .map(([vcId]) => vcId);

        // Randomize selection based on randomSeed
        const seededRandom = (seed: number, max: number) => {
          const x = Math.sin(seed + 42) * 10000; // Add offset to differentiate from product randomization
          return Math.floor((x - Math.floor(x)) * max);
        };

        const randomIndex = seededRandom(randomSeed, sortedValueChains.length);
        const defaultValueChain = sortedValueChains[randomIndex];

        setSelectedValueChain(defaultValueChain);
      }
    }
  }, [currentStep, selectedValueChain, clusterData, randomSeed]);

  // Auto-play functionality with restart
  useEffect(() => {
    if (!isPlaying) return;

    // Get duration for current step, default to 3000ms if not found
    const currentStepDuration = STEPS[currentStep]?.duration || 3000;

    const timer = setTimeout(() => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Restart the animation with new randomization - start on step 2 so products are already visible
        setCurrentStep(1);
        setRandomSeed((prev) => prev + 1); // Increment seed for new random selections
        setSelectedValueChain(null); // Reset to trigger new default selection
      }
    }, currentStepDuration);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleValueChainClick = (valueChainId: number) => {
    if (currentStep === 5 || currentStep === 6 || currentStep === 7) {
      // In value chain products, clustering and ecosystem steps
      setSelectedValueChain(valueChainId);
    }
  };

  const handleValueChainMouseEnter = (valueChainId: number) => {
    if (
      currentStep === 2 ||
      currentStep === 5 ||
      currentStep === 6 ||
      currentStep === 7
    ) {
      setHoveredValueChain(valueChainId);
    }
  };

  const handleValueChainMouseLeave = () => {
    if (
      currentStep === 2 ||
      currentStep === 5 ||
      currentStep === 6 ||
      currentStep === 7
    ) {
      setHoveredValueChain(null);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height,
        }}
      >
        <Typography>Loading animation data...</Typography>
      </Box>
    );
  }

  // Derived positions for section titles
  const valueChainBottomY =
    2 * valueChainCellHeight +
    valueChainTopOffset +
    valueChainCircleRadius +
    valueChainLabelGap;
  const topTitleY = Math.max(16, Math.round(valueChainTopOffset * 0.6));
  const midTitleY = valueChainBottomY - 20; // in-between title position

  // Dynamically compute the bottom of visible content to place step text just below it for steps 0–5
  const bottomOfContentY = (() => {
    if (currentStep <= 5) {
      if (!animationData.valueChains.length) {
        return availableSvgHeight - textAreaHeight;
      }

      // Bottom of value chain labels (labels are rendered at y + 65)
      const valueChainLabelOffset = 65;
      const valueChainLabelPadding = 10;
      const valueChainsBottom = Math.max(
        ...animationData.valueChains.map(
          (vc) => vc.y + valueChainLabelOffset + valueChainLabelPadding,
        ),
      );

      // Step 0: only value chains (account for visual downward offset)
      if (currentStep === 0) return valueChainsBottom + step0YOffset + 8;

      // Steps 1–5: products grid rendered below value chains
      const validProducts = animationData.products.filter((p) =>
        allProductToValueChains.has(p.id as number),
      );
      if (validProducts.length === 0) return valueChainsBottom + 8;

      const { dotSpacing, rowSpacing, margin } = layoutParams;
      const availableWidthForGrid = width - 2 * margin;
      const dotsPerRow = Math.max(
        1,
        Math.floor(availableWidthForGrid / Math.max(1, dotSpacing)),
      );
      const rows = Math.max(1, Math.ceil(validProducts.length / dotsPerRow));

      const productsStartY = valueChainsBottom + 15; // matches product start in layout
      const lastRowCenterY = productsStartY + (rows - 1) * rowSpacing;
      const productRadiusMax = currentStep >= 2 && currentStep < 5 ? 13.5 : 11;
      return lastRowCenterY + productRadiusMax + 40;
    }

    // Other steps use reserved text area
    return availableSvgHeight - textAreaHeight;
  })();

  // Base Y positions for bottom title/description
  const baseDynamicTextTitleY =
    currentStep <= 5
      ? bottomOfContentY + 45
      : availableSvgHeight - textAreaHeight + 20;
  const baseDynamicTextDescY = baseDynamicTextTitleY + 26;

  // Compute wrapped text for bottom title/description using simple width-based estimation
  // Allow a wider line length on the last two steps (7–8) so text doesn't break too early
  const textBlockWidth = (() => {
    if (currentStep >= 7) {
      return Math.min(width - 16, 1100);
    }
    return Math.min(width - 40, 800);
  })();
  const titleText = (STEPS[currentStep]?.title || "").toUpperCase();
  const selectedChainName =
    (selectedValueChain !== null
      ? animationData.valueChains.find((vc) => vc.id === selectedValueChain)
          ?.name
      : undefined) || "Batteries";
  const descText = (() => {
    if (currentStep === 5 && selectedValueChain !== null) {
      return `For example, the ${selectedChainName} value chain contains many distinct products that together enable ${selectedChainName.toLowerCase()} technologies.`;
    }
    if (currentStep === 7 && selectedValueChain !== null) {
      return `Zooming into the ${selectedChainName} value chain reveals the full structure: individual products, organized into green industrial clusters, all nested within a single value chain.`;
    }
    if (currentStep === 8) {
      return STEPS[currentStep]?.description || "";
    }
    return STEPS[currentStep]?.description || "";
  })();
  const titleMaxChars = estimateMaxCharsPerLine(textBlockWidth, 22);
  const descMaxChars = estimateMaxCharsPerLine(textBlockWidth, 20);
  const wrappedTitleLines = wrapTextIntoLines(titleText, titleMaxChars);
  const wrappedDescLines = wrapTextIntoLines(descText, descMaxChars);

  // Prevent text cut-off on smaller heights by shifting the block upward
  const descLineHeight = 20 * 1.3;
  const descBlockHeight = wrappedDescLines.length * descLineHeight;
  const estimatedBottomY = baseDynamicTextDescY + descBlockHeight - 4;
  const overflowAmount = Math.max(
    0,
    estimatedBottomY - (availableSvgHeight - 0),
  );
  // Allow more upward shift on the last two steps to avoid clipping entirely
  const minTitleYOffset = currentStep <= 5 ? bottomOfContentY + 12 : 8;
  const dynamicTextTitleY = Math.max(
    minTitleYOffset,
    baseDynamicTextTitleY - overflowAmount,
  );
  const dynamicTextDescY = dynamicTextTitleY + 26;

  return (
    <Box
      sx={{
        width,
        height,
        position: "relative",
      }}
    >
      {/* Hierarchy Legend - show only in step 7 (clusters-only equivalent layout) */}
      {currentStep === 7 && (
        <Box
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 10,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <HierarchyLegend layoutMode="clustered" />
        </Box>
      )}

      {/* Main SVG Animation Area - reduced height for controls */}
      <svg
        width={width}
        height={availableSvgHeight}
        aria-hidden="true"
        focusable="false"
        role="img"
      >
        {/* Value Chain Circles with Icons and Names - using React Spring transitions */}
        {valueChainTransitions((style: AnimatedStyle, chain) => {
          // In step 7, completely hide non-selected value chains
          if (currentStep === 7 && selectedValueChain !== chain.id) {
            return null;
          }
          const isZoomStep =
            currentStep === 7 && selectedValueChain === chain.id;
          const isAllChainsStep = currentStep === 8;
          const iconSize = isZoomStep ? 48 : 35; // Ensure standard icons are 35px
          const fontSize = isZoomStep ? 24 : 16; // Larger text in zoom view

          // For zoom step, position icon and text above the circle
          const iconY =
            isZoomStep || isAllChainsStep
              ? style.y.to((y: number) => {
                  const radiusValue =
                    typeof style.r === "object" && "get" in style.r
                      ? style.r.get()
                      : style.r;
                  // place icon clearly above the circle
                  return y - (radiusValue || 100) - 70;
                })
              : style.y.to((y: number) => y - iconSize / 2);
          const iconX = isZoomStep
            ? style.x.to((x: number) => x - 100)
            : style.x.to((x: number) => x - iconSize / 2);
          const textX = isZoomStep
            ? style.x.to((x: number) => x - 40)
            : style.x; // centered for normal and step 8
          const textY = isZoomStep
            ? style.y.to((y: number) => {
                const radiusValue =
                  typeof style.r === "object" && "get" in style.r
                    ? style.r.get()
                    : style.r;
                // zoom view: keep current spacing above the circle
                return y - (radiusValue || 100) - 30;
              })
            : isAllChainsStep
              ? style.y.to((y: number) => {
                  const radiusValue =
                    typeof style.r === "object" && "get" in style.r
                      ? style.r.get()
                      : style.r;
                  // final layout: move title a bit closer to the circle
                  return y - (radiusValue || 100) - 22;
                })
              : style.y.to((y: number) => y + 65);

          return (
            <animated.g key={chain.id}>
              {/* Value chain circle */}
              <animated.circle
                cx={style.x}
                cy={style.y}
                r={style.r}
                fill={style.fillColor}
                fillOpacity={style.fillOpacity ?? style.opacity}
                stroke={
                  isAllChainsStep || isZoomStep
                    ? chain.color
                    : chain.isHighlighted
                      ? "#000"
                      : "#ffffff"
                }
                strokeWidth={
                  isAllChainsStep || isZoomStep
                    ? 2
                    : chain.isHighlighted
                      ? 4
                      : 2
                }
                opacity={style.opacity}
                style={{
                  cursor:
                    currentStep === 2 || currentStep === 5 || currentStep === 6
                      ? "pointer"
                      : "default",
                }}
                onClick={() =>
                  (currentStep === 5 || currentStep === 6) &&
                  handleValueChainClick(chain.id)
                }
                onMouseEnter={() =>
                  (currentStep === 2 ||
                    currentStep === 5 ||
                    currentStep === 6) &&
                  handleValueChainMouseEnter(chain.id)
                }
                onMouseLeave={() =>
                  (currentStep === 2 ||
                    currentStep === 5 ||
                    currentStep === 6) &&
                  handleValueChainMouseLeave()
                }
              />

              {/* Value chain icon */}
              {chain.icon && (
                <animated.image
                  href={chain.icon}
                  x={iconX}
                  y={iconY}
                  width={iconSize}
                  height={iconSize}
                  opacity={style.opacity}
                  style={{
                    pointerEvents:
                      currentStep === 2 ||
                      currentStep === 5 ||
                      currentStep === 6
                        ? "all"
                        : "none",
                    cursor:
                      currentStep === 2 ||
                      currentStep === 5 ||
                      currentStep === 6
                        ? "pointer"
                        : "default",
                  }}
                  onClick={() =>
                    (currentStep === 5 || currentStep === 6) &&
                    handleValueChainClick(chain.id)
                  }
                  onMouseEnter={() =>
                    (currentStep === 2 ||
                      currentStep === 5 ||
                      currentStep === 6) &&
                    handleValueChainMouseEnter(chain.id)
                  }
                  onMouseLeave={() =>
                    (currentStep === 2 ||
                      currentStep === 5 ||
                      currentStep === 6) &&
                    handleValueChainMouseLeave()
                  }
                ></animated.image>
              )}

              {/* Value chain name */}
              <animated.text
                x={textX}
                y={textY}
                textAnchor={isZoomStep ? "start" : "middle"}
                fontSize={fontSize}
                fontWeight={isZoomStep ? "700" : "600"}
                fill="#000"
                opacity={style.opacity}
                style={{
                  pointerEvents:
                    currentStep === 2 || currentStep === 5 || currentStep === 6
                      ? "all"
                      : "none",
                  cursor:
                    currentStep === 2 || currentStep === 5 || currentStep === 6
                      ? "pointer"
                      : "default",
                }}
                onClick={() =>
                  (currentStep === 5 || currentStep === 6) &&
                  handleValueChainClick(chain.id)
                }
                onMouseEnter={() =>
                  (currentStep === 2 ||
                    currentStep === 5 ||
                    currentStep === 6) &&
                  handleValueChainMouseEnter(chain.id)
                }
                onMouseLeave={() =>
                  (currentStep === 2 ||
                    currentStep === 5 ||
                    currentStep === 6) &&
                  handleValueChainMouseLeave()
                }
              >
                {chain.name.replace(/\band\b/gi, "&")}
              </animated.text>
            </animated.g>
          );
        })}

        {/* Animated cluster circles (rendered first, under products) */}
        {clusterTransitions((style: AnimatedStyle, cluster) => (
          <animated.circle
            key={`cluster-circle-${cluster.id}`}
            cx={style.x}
            cy={style.y}
            r={style.r}
            fill={currentStep === 8 ? "none" : cluster.fill}
            stroke={cluster.stroke}
            strokeWidth={currentStep === 8 ? 0.5 : cluster.strokeWidth}
            opacity={style.opacity}
          />
        ))}
        {/* Animated Products - unified for all steps */}
        {currentStep >= 1 && (
          <g>
            {productTransitions(
              (
                style: { x: number; y: number; r: number; opacity: number },
                product: AnimatedProduct,
              ) => (
                <animated.circle
                  key={product.id}
                  cx={style.x}
                  cy={style.y}
                  r={style.r}
                  fill={product.fill}
                  opacity={style.opacity}
                  filter={
                    product.hasGlow && product.glowColor
                      ? `drop-shadow(0px 0px 2px ${hexToRgba(product.glowColor, 1.0)}) drop-shadow(0px 0px 4px ${hexToRgba(product.glowColor, 0.9)}) drop-shadow(0px 0px 8px ${hexToRgba(product.glowColor, 0.8)}) drop-shadow(0px 0px 16px ${hexToRgba(product.glowColor, 0.6)})`
                      : "none"
                  }
                  style={{
                    cursor:
                      currentStep >= 2 && currentStep < 5
                        ? "pointer"
                        : "default",
                  }}
                  onMouseEnter={
                    currentStep >= 2 && currentStep < 5
                      ? () => setHoveredProduct(product.globalProductId)
                      : undefined
                  }
                  onMouseLeave={undefined}
                />
              ),
            )}
          </g>
        )}

        {/* Animated cluster text (rendered last, on top of products) */}
        {clusterTransitions((style: AnimatedStyle, cluster) => (
          <animated.text
            key={`cluster-text-${cluster.id}`}
            x={style.x}
            y={cluster.textY}
            textAnchor="middle"
            fontSize={cluster.fontSize}
            fontWeight="600"
            fill={cluster.isHighlighted ? "#000" : "#666"}
            opacity={style.opacity}
            stroke="white"
            strokeWidth={currentStep === 7 ? "4" : "3"} // Thicker stroke for step 7
            paintOrder="stroke fill"
          >
            {(() => {
              const displayName = (cluster.name || "").replace(
                /\band\b/gi,
                "&",
              );
              if (currentStep === 8) return "";
              const limit = currentStep === 7 ? 20 : 15;
              return displayName.length > limit
                ? `${displayName.substring(0, limit)}...`
                : displayName;
            })()}
          </animated.text>
        ))}

        {/* Product connections and annotations - only show in product highlighting steps */}
        {currentStep >= 2 && currentStep < 5 && currentHighlightedProduct && (
          <ProductConnections
            highlightedProductId={currentHighlightedProduct}
            products={animationData.products}
            valueChains={animationData.valueChains}
            highlightedProducts={highlightedProducts}
            allProductToValueChains={allProductToValueChains}
            startY={
              2 * valueChainCellHeight +
              valueChainTopOffset +
              valueChainCircleRadius +
              valueChainLabelGap +
              15
            }
            width={width}
            dotSpacing={layoutParams.dotSpacing}
            margin={layoutParams.margin}
            rowSpacing={layoutParams.rowSpacing}
            productIndexMap={productGridIndexMap}
          />
        )}

        {/* Fallback connection for demo when no highlighted product */}
        {currentStep >= 2 &&
          currentStep < 5 &&
          !currentHighlightedProduct &&
          animationData.products.length > 0 && (
            <ProductConnections
              highlightedProductId={animationData.products[0].id}
              products={animationData.products}
              valueChains={animationData.valueChains}
              highlightedProducts={highlightedProducts}
              allProductToValueChains={allProductToValueChains}
              startY={
                2 * valueChainCellHeight +
                valueChainTopOffset +
                valueChainCircleRadius +
                valueChainLabelGap +
                15
              }
              width={width}
              dotSpacing={layoutParams.dotSpacing}
              margin={layoutParams.margin}
              rowSpacing={layoutParams.rowSpacing}
              productIndexMap={productGridIndexMap}
            />
          )}

        {/* Value chain to products connections for step 5 */}
        {currentStep === 5 && selectedValueChain !== null && (
          <ValueChainProductConnections
            selectedValueChain={selectedValueChain}
            products={animationData.products}
            valueChains={animationData.valueChains}
            allProductToValueChains={allProductToValueChains}
            startY={
              2 * valueChainCellHeight +
              valueChainTopOffset +
              valueChainCircleRadius +
              valueChainLabelGap +
              15
            }
            width={width}
            dotSpacing={layoutParams.dotSpacing}
            margin={layoutParams.margin}
            rowSpacing={layoutParams.rowSpacing}
            productIndexMap={productGridIndexMap}
          />
        )}

        {/* Section titles: Top (Value Chains) and Middle (Products/Clusters) */}
        {currentStep <= 6 && (
          <Text
            x={width / 2}
            y={topTitleY}
            textAnchor="middle"
            verticalAnchor="start"
            fontSize={20}
            fontWeight="600"
            style={{ pointerEvents: "none", letterSpacing: "0.5px" }}
          >
            Value Chains
          </Text>
        )}

        {currentStep >= 1 && currentStep <= 6 && (
          <Text
            x={width / 2}
            y={midTitleY}
            textAnchor="middle"
            verticalAnchor="start"
            fontSize={20}
            fontWeight="600"
            style={{ pointerEvents: "none", letterSpacing: "0.5px" }}
          >
            {currentStep === 6 ? "Clusters" : "Products"}
          </Text>
        )}

        {/* Designated text section - using STEPS config as single source of truth */}
        <g>
          {/* Dynamic step title (wrapped) */}
          {wrappedTitleLines.map((line) => (
            <Text
              key={`title-line-${line}-${titleText.length}`}
              x={width / 2}
              y={(() => {
                const lineIndex = wrappedTitleLines.indexOf(line);
                return dynamicTextTitleY + lineIndex * 22 * 1.15;
              })()}
              textAnchor="middle"
              verticalAnchor="start"
              fontSize={22}
              fontWeight={800}
              fill="#1e293b"
            >
              {line}
            </Text>
          ))}

          {/* Dynamic step description (wrapped, with <b> support) */}
          {(() => {
            // If description contains <b> tags, parse and render tspans with bold styling
            if (descText && descText.includes("<b>")) {
              const parseBoldSegments = (
                text: string,
              ): { text: string; bold: boolean }[] => {
                const segments: { text: string; bold: boolean }[] = [];
                let i = 0;
                let isBold = false;
                while (i < text.length) {
                  if (text.startsWith("<b>", i)) {
                    isBold = true;
                    i += 3;
                    continue;
                  }
                  if (text.startsWith("</b>", i)) {
                    isBold = false;
                    i += 4;
                    continue;
                  }
                  segments.push({ text: text[i], bold: isBold });
                  i += 1;
                }
                // Merge adjacent chars with same style
                const merged: { text: string; bold: boolean }[] = [];
                for (const seg of segments) {
                  const last = merged[merged.length - 1];
                  if (last && last.bold === seg.bold) {
                    last.text += seg.text;
                  } else {
                    merged.push({ ...seg });
                  }
                }
                return merged;
              };

              const wrapSegments = (
                segments: { text: string; bold: boolean }[],
                maxChars: number,
              ): { text: string; bold: boolean }[][] => {
                // Word-aware wrapping: do not break words; only wrap at whitespace.
                const lines: { text: string; bold: boolean }[][] = [];
                let current: { text: string; bold: boolean }[] = [];
                let count = 0;

                const pushLine = () => {
                  if (current.length) lines.push(current);
                  current = [];
                  count = 0;
                };

                for (const seg of segments) {
                  // Split into words and whitespace tokens, preserving both
                  const tokens = seg.text.split(/(\s+)/);
                  for (const token of tokens) {
                    if (token.length === 0) continue;
                    const isSpace = /^\s+$/.test(token);
                    const tokenLen = token.length;

                    // Avoid leading whitespace at start of a line
                    const effectiveLen = isSpace && count === 0 ? 0 : tokenLen;

                    // If token doesn't fit, wrap to next line (unless line is empty)
                    if (
                      effectiveLen > 0 &&
                      count + effectiveLen > maxChars &&
                      count > 0
                    ) {
                      pushLine();
                    }

                    // If a single non-space token is longer than maxChars and we're at line start,
                    // hard-split it into chunks (rare fallback)
                    if (!isSpace && tokenLen > maxChars && count === 0) {
                      let start = 0;
                      while (start < tokenLen) {
                        const chunk = token.slice(
                          start,
                          start + Math.max(1, maxChars),
                        );
                        current.push({ text: chunk, bold: seg.bold });
                        count += chunk.length;
                        start += Math.max(1, maxChars);
                        if (start < tokenLen) {
                          pushLine();
                        }
                      }
                      continue;
                    }

                    // Normal token append (skip leading spaces)
                    if (!(isSpace && count === 0)) {
                      current.push({ text: token, bold: seg.bold });
                      count += effectiveLen;
                    }
                  }
                }

                if (current.length) lines.push(current);
                return lines;
              };

              const richSegments = parseBoldSegments(
                descText.replace(/\n/g, " "),
              );
              const richLines = wrapSegments(richSegments, descMaxChars);

              return richLines.map((lineSegs) => (
                <text
                  key={`desc-rich-line-${lineSegs
                    .map((s) => `${s.bold ? "b" : "n"}:${s.text}`)
                    .join("|")}`}
                  x={width / 2}
                  y={(() => {
                    const lineIndex = richLines.indexOf(lineSegs);
                    return dynamicTextDescY + lineIndex * 20 * 1.3;
                  })()}
                  textAnchor="middle"
                  dominantBaseline="hanging"
                  style={{ pointerEvents: "none" }}
                  fontSize={20}
                  fill="#1e293b"
                >
                  {lineSegs.map((seg, j) => (
                    <tspan
                      key={`seg-${seg.bold ? "b" : "n"}-${seg.text}-${
                        lineSegs
                          .slice(0, j + 1)
                          .filter(
                            (p) => p.text === seg.text && p.bold === seg.bold,
                          ).length
                      }`}
                      fontWeight={seg.bold ? 700 : 400}
                    >
                      {seg.text}
                    </tspan>
                  ))}
                </text>
              ));
            }
            // Fallback: simple wrapped lines
            return wrappedDescLines.map((line) => (
              <Text
                key={`desc-line-${line}-${descText.length}`}
                x={width / 2}
                y={(() => {
                  const lineIndex = wrappedDescLines.indexOf(line);
                  return dynamicTextDescY + lineIndex * 20 * 1.3;
                })()}
                textAnchor="middle"
                verticalAnchor="start"
                fontSize={20}
                fontWeight={400}
                fill="#1e293b"
              >
                {line}
              </Text>
            ));
          })()}
        </g>
      </svg>

      {/* Controls section below SVG */}
      <Box
        sx={{
          height: controlsHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Progress indicator - centered */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            padding: "10px 16px",
          }}
        >
          <IconButton
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
            sx={{
              backgroundColor: "rgba(255,255,255,0.9)",
              color: "#000",
              border: "1px solid #ccc",
              width: Math.max(40, Math.min(50, Math.round(width * 0.04))),
              height: Math.max(40, Math.min(50, Math.round(width * 0.04))),
              "&:hover": {
                backgroundColor: "rgba(255,255,255,1)",
              },
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <Box
            component="fieldset"
            aria-label="Step indicators"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              border: 0,
              margin: 0,
              padding: 0,
              minInlineSize: 0,
            }}
          >
            {STEPS.map((step, index) => (
              <Box
                key={step.id}
                component="button"
                type="button"
                onClick={() => setCurrentStep(index)}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
                aria-current={index === currentStep ? "step" : undefined}
                title={step.title}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCurrentStep(index);
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1));
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    setCurrentStep(Math.max(0, currentStep - 1));
                  } else if (e.key === "Home") {
                    e.preventDefault();
                    setCurrentStep(0);
                  } else if (e.key === "End") {
                    e.preventDefault();
                    setCurrentStep(STEPS.length - 1);
                  }
                }}
                sx={{
                  width: Math.max(24, Math.min(36, Math.round(width * 0.03))),
                  height: Math.max(
                    6,
                    Math.min(10, Math.round(controlsHeight * 0.1)),
                  ),
                  backgroundColor: index <= currentStep ? "#333" : "#ddd",
                  borderRadius: 1,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: 0,
                  padding: 0,
                  appearance: "none",
                  outlineOffset: 2,
                  "&:hover": {
                    backgroundColor: index <= currentStep ? "#000" : "#bbb",
                    transform: "scaleY(1.2)",
                  },
                  "&:focus-visible": {
                    boxShadow: "0 0 0 3px rgba(0,0,0,0.3)",
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ProductConnections component to show links between highlighted products and value chains
const ProductConnections: React.FC<{
  highlightedProductId: number;
  products: Product[];
  valueChains: ValueChain[];
  highlightedProducts: HighlightedProduct[];
  allProductToValueChains: Map<number, number[]>;
  startY: number;
  width: number;
  dotSpacing: number;
  margin: number;
  rowSpacing?: number;
  productIndexMap?: Map<number, number>;
}> = ({
  highlightedProductId,
  products,
  valueChains,
  highlightedProducts,
  allProductToValueChains,
  startY,
  width,
  dotSpacing,
  margin,
  rowSpacing = 20,
  productIndexMap,
}) => {
  const product = products.find((p) => p.id === highlightedProductId);

  if (!product) return null;

  // Get real value chain connections for this product
  let valueChainIdsToConnect =
    allProductToValueChains.get(highlightedProductId) || [];

  // If no real connections found, use the highlighted products data as fallback
  if (valueChainIdsToConnect.length === 0) {
    const highlightedProductData = highlightedProducts.find(
      (p) => p.productId === highlightedProductId,
    );
    valueChainIdsToConnect = highlightedProductData?.valueChainIds || [];
  }

  // Final fallback: connect to first 2 value chains for demo
  if (valueChainIdsToConnect.length === 0) {
    valueChainIdsToConnect = valueChains.slice(0, 2).map((vc) => vc.id);
  }

  // Calculate product position in the grid
  const availableWidth = width - 2 * margin;
  const dotsPerRow = Math.floor(availableWidth / dotSpacing);
  const defaultIndex = products.findIndex((p) => p.id === highlightedProductId);
  const productIndex =
    productIndexMap?.get(highlightedProductId) ?? defaultIndex;

  if (productIndex === -1) return null;

  const row = Math.floor(productIndex / dotsPerRow);
  const col = productIndex % dotsPerRow;
  const startX = margin + (availableWidth - (dotsPerRow - 1) * dotSpacing) / 2;
  const productX = startX + col * dotSpacing;
  const productY = startY + row * rowSpacing; // Same row spacing as in ProductsGrid

  return (
    <g>
      {/* Connection lines to value chains */}
      {valueChainIdsToConnect.map((valueChainId) => {
        const valueChain = valueChains.find((vc) => vc.id === valueChainId);
        if (!valueChain) {
          return null;
        }

        return (
          <animated.line
            key={`connection-${valueChainId}`}
            x1={productX}
            y1={productY}
            x2={valueChain.x}
            y2={valueChain.y + 65 + 8}
            stroke={valueChain.color}
            strokeWidth={3} // Made thicker for visibility
            strokeLinecap="round"
            opacity={0.8}
            style={{
              transition: "all 0.6s ease",
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Product name annotation - positioned below the node */}
      <g>
        {/* Product name text with white stroke for visibility */}
        <animated.text
          x={productX}
          y={productY + 25} // Positioned below the product node
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
          stroke="white"
          strokeWidth={3}
          paintOrder="stroke fill" // Ensures stroke is behind the fill
          style={{
            transition: "all 0.6s ease",
          }}
        >
          {product.name} {/* Show full product name */}
        </animated.text>
      </g>
    </g>
  );
};

// ValueChainProductConnections component to show links from selected value chain to all its products
const ValueChainProductConnections: React.FC<{
  selectedValueChain: number;
  products: Product[];
  valueChains: ValueChain[];
  allProductToValueChains: Map<number, number[]>;
  startY: number;
  width: number;
  dotSpacing: number;
  margin: number;
  rowSpacing?: number;
  productIndexMap?: Map<number, number>;
}> = ({
  selectedValueChain,
  products,
  valueChains,
  allProductToValueChains,
  startY,
  width,
  dotSpacing,
  margin,
  rowSpacing = 20,
  productIndexMap,
}) => {
  const selectedChain = valueChains.find((vc) => vc.id === selectedValueChain);
  if (!selectedChain) return null;

  // Filter products that only have valid connections
  const validProducts = products.filter((product) =>
    allProductToValueChains.has(product.id as number),
  );

  // Get products connected to the selected value chain
  const connectedProducts = validProducts.filter((product) => {
    const productValueChains = allProductToValueChains.get(product.id) || [];
    return productValueChains.includes(selectedValueChain);
  });

  if (connectedProducts.length === 0) return null;

  // Calculate grid layout parameters (same as in main component)
  const availableWidth = width - 2 * margin;
  const dotsPerRow = Math.floor(availableWidth / dotSpacing);
  const startX = margin + (availableWidth - (dotsPerRow - 1) * dotSpacing) / 2;

  return (
    <g>
      {/* Connection lines from value chain to connected products */}
      {connectedProducts.map((product) => {
        // Find product position in the grid
        const fallbackIndex = validProducts.findIndex(
          (p) => p.id === product.id,
        );
        const productIndex =
          productIndexMap?.get(product.id as number) ?? fallbackIndex;
        if (productIndex === -1) return null;

        const row = Math.floor(productIndex / dotsPerRow);
        const col = productIndex % dotsPerRow;
        const productX = startX + col * dotSpacing;
        const productY = startY + row * rowSpacing;

        // Calculate the bottom of the value chain label
        // Value chain label is positioned at y + 65 (from the main component)
        const labelBottomY = selectedChain.y + 65 + 8; // Add 8px for text height/padding

        return (
          <animated.line
            key={`value-chain-connection-${product.id}`}
            x1={selectedChain.x}
            y1={labelBottomY}
            x2={productX}
            y2={productY}
            stroke={selectedChain.color}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.6}
            style={{
              transition: "all 0.8s ease",
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Optional: Add a subtle glow effect to the value chain */}
      <animated.circle
        cx={selectedChain.x}
        cy={selectedChain.y}
        r={selectedChain.radius + 8}
        fill="none"
        stroke={selectedChain.color}
        strokeWidth={3}
        opacity={0.3}
        style={{
          transition: "all 0.8s ease",
          pointerEvents: "none",
        }}
      />
    </g>
  );
};

// Helper function to convert hex color to RGBA for drop-shadow
const hexToRgba = (hex: string, alpha: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(38, 133, 189, ${alpha})`; // fallback to blue
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Main export component with responsive wrapper
export const AnimatedValueChainIntro: React.FC<
  Omit<AnimatedValueChainIntroProps, "width" | "height">
> = ({ selectedCountry, selectedYear }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <ParentSize>
        {({ width, height }) => {
          if (width === 0 || height === 0) {
            return null;
          }
          return (
            <AnimatedValueChainIntroInternal
              width={width}
              height={height}
              selectedCountry={selectedCountry}
              selectedYear={selectedYear}
            />
          );
        }}
      </ParentSize>
    </div>
  );
};

export default AnimatedValueChainIntro;

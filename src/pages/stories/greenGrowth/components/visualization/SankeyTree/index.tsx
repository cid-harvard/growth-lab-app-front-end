import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { animated, useTransition, to } from "@react-spring/web";
import { tree, hierarchy } from "d3-hierarchy";
import { useTheme, useMediaQuery } from "@mui/material";
import { ParentSize } from "@visx/responsive";
import {
  TableWrapper,
  VisualizationLoading,
  VisualizationControls,
} from "../../shared";
import { useUrlParams, useGreenGrowthData } from "../../../hooks";
import { useImageCaptureContext } from "../../../hooks/useImageCaptureContext";
import { themeUtils } from "../../../theme";
import html2canvas from "html2canvas";

// Local imports
import {
  buildHierarchicalData,
  buildTreeDataForValueChain,
  filterHierarchyByProductRCA,
} from "./dataUtils";
import { applySankeyLayout, convertToPositions } from "./layoutUtils";
import Legend from "./Legend";
import { SankeyColoringMode } from "./types";

// Helper function to get RCA-based opacity (3 groups) - for visual emphasis within filtered results
const getRCAOpacity = (rca?: number): number => {
  if (!rca) return 1;
  if (rca >= 1) return 1.0; // High RCA group - full opacity
  if (rca >= 0.5) return 0.7; // Medium RCA group - slightly reduced
  return 0.5; // Low RCA group - more reduced
};

// Internal component that receives dimensions from ParentSize
const SankeyTreeInternal = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  // Get country selection from URL params
  const { countrySelection } = useUrlParams();

  // Responsive setup
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Calculate responsive dimensions based on available space
  const { dimensions, leftMargin, rightMargin } = useMemo(() => {
    const calculatedWidth = Math.max(width - (isMobile ? 10 : 20), 400);
    // Account for legend space (120px) in height calculation, especially important on mobile
    const legendSpace = 120;
    const calculatedHeight = Math.max(
      height - (isMobile ? 20 : 20) - legendSpace,
      isMobile ? 280 : 350,
    );

    const responsiveLeftMargin = isMobile ? 60 : 100;
    const responsiveRightMargin = isMobile ? 100 : 180;

    return {
      dimensions: {
        width: calculatedWidth,
        height: calculatedHeight,
      },
      leftMargin: responsiveLeftMargin,
      rightMargin: responsiveRightMargin,
    };
  }, [width, height, isMobile]);

  // Image capture functionality
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { registerCaptureFunction, unregisterCaptureFunction } =
    useImageCaptureContext();

  // State
  const [focusedValueChain, setFocusedValueChain] = useState<string | null>(
    null,
  );
  const [focusedCluster, setFocusedCluster] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(
    new Set(),
  );
  const [connectedLinkIds, setConnectedLinkIds] = useState<Set<string>>(
    new Set(),
  );
  const [coloringMode, setColoringMode] =
    useState<SankeyColoringMode>("Country Specific");

  const [rcaThreshold, setRcaThreshold] = useState<number>(1);
  const [showSubtleProducts, setShowSubtleProducts] = useState<boolean>(false);

  const isAnimating = useRef(false);

  // Cleanup function to reset all state when component unmounts or page changes
  const resetComponentState = useCallback(() => {
    setFocusedValueChain(null);
    setFocusedCluster(null);
    setHoveredNode(null);
    setConnectedNodeIds(new Set());
    setConnectedLinkIds(new Set());
    setColoringMode("Country Specific");
    setRcaThreshold(1);
    setShowSubtleProducts(false);
    isAnimating.current = false;
  }, []);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      resetComponentState();
    };
  }, [resetComponentState]);

  // Reset animation state when country selection changes (page navigation)
  useEffect(() => {
    isAnimating.current = false;
    setHoveredNode(null);
    setConnectedNodeIds(new Set());
    setConnectedLinkIds(new Set());
    // Force reset focused states on page navigation
    setFocusedValueChain(null);
    setFocusedCluster(null);
    // Reset RCA threshold on country change
    setRcaThreshold(1);
  }, [countrySelection]);

  // Register/unregister image capture function
  useEffect(() => {
    const handleCaptureImage = async () => {
      if (!chartContainerRef.current) {
        console.warn("Chart container not found");
        return;
      }

      try {
        const canvas = await html2canvas(chartContainerRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: chartContainerRef.current.offsetWidth,
          height: chartContainerRef.current.offsetHeight,
        });

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `sankey_tree_${countrySelection}_${focusedValueChain || focusedCluster || "overview"}.png`;
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
    focusedValueChain,
    focusedCluster,
  ]);

  // Centralized data loading with previous data fallback
  const {
    countryData,
    productClusterRows,
    isLoading,
    isCountryDataLoading,
    isInitialLoading,
    hasPreviousData,
  } = useGreenGrowthData(countrySelection);

  // Build initial hierarchy data
  const baseHierarchyData = useMemo(() => {
    if (!productClusterRows.length) return null;

    try {
      return buildHierarchicalData(productClusterRows, countryData);
    } catch (err) {
      console.error("Error processing hierarchy data:", err);
      return null;
    }
  }, [productClusterRows, countryData]);

  // Apply RCA-based filtering and focus-based visibility
  const hierarchyData = useMemo(() => {
    if (!baseHierarchyData) return null;

    // First apply RCA filtering based on product-level data
    const filteredHierarchy = filterHierarchyByProductRCA(
      baseHierarchyData,
      countryData,
      rcaThreshold,
      coloringMode,
    );

    const nodeMap = new Map(
      filteredHierarchy.nodes.map((node) => [node.id, node]),
    );

    // Apply focus-based visibility to the filtered hierarchy
    const firstPassNodes = filteredHierarchy.nodes.map((node) => {
      // For non-filtered nodes, apply initial visibility
      if (!focusedCluster && !focusedValueChain) {
        return {
          ...node,
          visible: node.type !== "product", // Products will be handled separately in sub-trees
        };
      } else if (focusedValueChain && !focusedCluster) {
        if (node.id === focusedValueChain) {
          return { ...node, visible: true };
        } else if (node.type === "manufacturing_cluster") {
          const isConnected = filteredHierarchy.links.some(
            (l) => l.source === focusedValueChain && l.target === node.id,
          );
          return { ...node, visible: isConnected };
        } else if (node.type === "product") {
          const connectedClusters = filteredHierarchy.links
            .filter((l) => l.source === focusedValueChain)
            .map((l) => l.target);

          const isConnectedToRelevantCluster = filteredHierarchy.links.some(
            (l) => connectedClusters.includes(l.source) && l.target === node.id,
          );

          return { ...node, visible: isConnectedToRelevantCluster };
        } else {
          return { ...node, visible: false };
        }
      } else if (focusedCluster) {
        if (node.id === focusedCluster) {
          return { ...node, visible: true };
        } else if (node.type === "value_chain") {
          const isConnected = filteredHierarchy.links.some(
            (l) => l.source === node.id && l.target === focusedCluster,
          );
          return { ...node, visible: isConnected };
        } else if (node.type === "product") {
          const isConnected = filteredHierarchy.links.some(
            (l) => l.source === focusedCluster && l.target === node.id,
          );
          return { ...node, visible: isConnected };
        } else {
          return { ...node, visible: false };
        }
      }

      return {
        ...node,
        visible: node.type !== "product", // Products will be handled separately in sub-trees
      };
    });

    // Second pass: Hide value chains that have no visible connected manufacturing clusters
    const updatedNodes = firstPassNodes.map((node) => {
      if (
        node.type === "value_chain" &&
        node.visible &&
        !focusedCluster &&
        !focusedValueChain
      ) {
        // Check if this value chain has any visible connected manufacturing clusters
        const hasVisibleConnectedClusters = filteredHierarchy.links.some(
          (link) => {
            if (link.source === node.id) {
              const targetNode = firstPassNodes.find(
                (n) => n.id === link.target,
              );
              return (
                targetNode &&
                targetNode.visible &&
                targetNode.type === "manufacturing_cluster"
              );
            }
            return false;
          },
        );

        if (!hasVisibleConnectedClusters) {
          return { ...node, visible: false };
        }
      }
      return node;
    });

    const nodeVisibility = new Map(
      updatedNodes.map((node) => [node.id, node.visible]),
    );

    const updatedLinks = filteredHierarchy.links.map((link) => {
      const sourceVisible = nodeVisibility.get(link.source) ?? false;
      const targetVisible = nodeVisibility.get(link.target) ?? false;

      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);

      const bothNodesVisible = sourceVisible && targetVisible;
      const isOneHierarchyLevel = !(
        sourceNode?.type === "value_chain" && targetNode?.type === "product"
      );

      return {
        ...link,
        visible: bothNodesVisible && isOneHierarchyLevel,
      };
    });

    return { nodes: updatedNodes, links: updatedLinks };
  }, [
    baseHierarchyData,
    focusedCluster,
    focusedValueChain,
    rcaThreshold,
    coloringMode,
    countryData,
  ]);

  // Add tree layout data for value chain focus view
  const treeLayoutData = useMemo(() => {
    if (!focusedValueChain || !hierarchyData) return null;

    try {
      // Build tree data structure for the selected value chain
      const treeData = buildTreeDataForValueChain(
        hierarchyData,
        focusedValueChain,
      );
      if (!treeData) return null;

      // Create hierarchy for tree layout
      const root = hierarchy(treeData);

      // Calculate tree layout
      const treeLayout = tree<any>()
        .size([dimensions.height - 120, dimensions.width * 0.7])
        .separation((a, b) => {
          const baseSeparation = a.parent === b.parent ? 1.5 : 2;
          if (a.children && a.children.length > 3) {
            return baseSeparation + a.children.length * 0.2;
          }
          return baseSeparation;
        });

      const layoutRoot = treeLayout(root);
      return layoutRoot;
    } catch (err) {
      console.error("Error applying tree layout:", err);
      return null;
    }
  }, [focusedValueChain, hierarchyData, dimensions.width, dimensions.height]);

  // Layout the data using sankey for the main view
  const sankeyLayoutData = useMemo(() => {
    if (!hierarchyData || focusedValueChain) return null;

    try {
      return applySankeyLayout(
        hierarchyData,
        dimensions,
        leftMargin,
        rightMargin,
      );
    } catch (err) {
      console.error("Error applying sankey layout:", err);
      return null;
    }
  }, [hierarchyData, leftMargin, rightMargin, dimensions, focusedValueChain]);

  // Apply layout to hierarchy data
  const positionedHierarchyData = useMemo(() => {
    if (!hierarchyData) return null;

    // Handle tree layout when focusing on a value chain
    if (focusedValueChain && treeLayoutData) {
      const treeNodeMap = new Map();
      treeLayoutData.descendants().forEach((node) => {
        treeNodeMap.set(node.data.id, node);
      });

      // Only include nodes that are both visible AND have corresponding tree layout data
      const updatedNodes = hierarchyData.nodes
        .filter((node) => node.visible && treeNodeMap.has(node.id))
        .map((node) => {
          const treeNode = treeNodeMap.get(node.id)!; // Safe to use ! since we filtered above

          const nodeWidth =
            treeNode.data.type === "value_chain"
              ? 30
              : treeNode.data.type === "manufacturing_cluster"
                ? 28
                : 25;
          const nodeHeight =
            treeNode.data.type === "value_chain"
              ? 50
              : treeNode.data.type === "manufacturing_cluster"
                ? 40
                : 30;

          return {
            ...node,
            x: 120 + treeNode.y,
            y: treeNode.x,
            width: nodeWidth,
            height: nodeHeight,
          };
        });

      return {
        ...hierarchyData,
        nodes: updatedNodes,
        links: hierarchyData.links.filter((l) => l.visible),
      };
    }

    // Handle tree layout when focusing on a cluster
    if (focusedCluster) {
      const visibleNodes = hierarchyData.nodes.filter((n) => n.visible);

      // Get connected value chains (sources) and products (targets)
      const valueChains = visibleNodes.filter((n) => n.type === "value_chain");
      const products = visibleNodes.filter((n) => n.type === "product");

      const updatedNodes = visibleNodes.map((node) => {
        const nodeWidth = 16; // Fixed width for circles
        const nodeHeight = 16; // Fixed height for circles

        if (node.id === focusedCluster) {
          // Center the cluster node
          return {
            ...node,
            x: dimensions.width / 2 - nodeWidth / 2,
            y: dimensions.height / 2 - nodeHeight / 2,
            width: nodeWidth,
            height: nodeHeight,
          };
        } else if (node.type === "value_chain") {
          // Arrange value chains vertically on the left
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
          // Arrange products vertically on the right
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
    }

    // Otherwise use sankey layout
    if (!sankeyLayoutData) return null;

    const sankeyNodeMap = new Map(
      sankeyLayoutData.nodes.map((n) => [n.name, n]),
    );

    // Start with nodes that have corresponding sankey layout data
    const updatedNodes = hierarchyData.nodes
      .filter((node) => node.visible && sankeyNodeMap.has(node.id))
      .map((node) => {
        const sankeyNode = sankeyNodeMap.get(node.id)!; // Safe to use ! since we filtered above

        return {
          ...node,
          x: sankeyNode.x0,
          y: sankeyNode.y0,
          width: (sankeyNode.x1 ?? 0) - (sankeyNode.x0 ?? 0),
          height: (sankeyNode.y1 ?? 0) - (sankeyNode.y0 ?? 0),
        };
      });

    // Add product nodes when subtle products are enabled (for smoother transitions)
    if (showSubtleProducts) {
      // Group products by their parent clusters using FILTERED hierarchy data
      const clusterProducts = new Map<string, any[]>();

      hierarchyData.links
        .filter((link) => {
          const sourceNode = hierarchyData.nodes.find(
            (n) => n.id === link.source,
          );
          const targetNode = hierarchyData.nodes.find(
            (n) => n.id === link.target,
          );
          return (
            sourceNode?.type === "manufacturing_cluster" &&
            targetNode?.type === "product"
          );
        })
        .forEach((link) => {
          const productNode = hierarchyData.nodes.find(
            (n) => n.id === link.target,
          );
          if (productNode) {
            if (!clusterProducts.has(link.source)) {
              clusterProducts.set(link.source, []);
            }
            clusterProducts.get(link.source)?.push({ node: productNode, link });
          }
        });

      // Create positioned product nodes for visible clusters only
      const productAreaWidth = 150; // Same as compact products area
      clusterProducts.forEach((products, clusterId) => {
        // Only process clusters that are visible in the current layout
        const clusterNode = updatedNodes.find((n) => n.id === clusterId);
        if (
          !clusterNode ||
          clusterNode.x === undefined ||
          clusterNode.y === undefined
        )
          return;

        // Position products to match the height of the cluster node
        const maxProducts = Math.min(products.length, 8); // Limit to prevent overcrowding
        const availableHeight = clusterNode.height * 0.8; // Use 80% of cluster height for some padding
        const productSpacing =
          maxProducts > 1 ? availableHeight / (maxProducts - 1) : 0;
        const startY = clusterNode.y! + clusterNode.height * 0.1; // Start with 10% padding from top

        products
          .slice(0, maxProducts)
          .forEach(({ node: productNode }, index) => {
            const productY = startY + index * productSpacing;
            const productX =
              clusterNode.x! + clusterNode.width + productAreaWidth - 2;

            // Add positioned product node (will be rendered with opacity = 0)
            updatedNodes.push({
              ...productNode,
              x: productX,
              y: productY,
              width: 16, // Small circular node
              height: 16,
              visible: true, // Mark as visible so it gets included in nodePositions
              isSubtleProduct: true, // Mark for special opacity handling
            });
          });
      });
    }

    return {
      ...hierarchyData,
      nodes: updatedNodes,
      links: hierarchyData.links.filter((l) => l.visible),
    };
  }, [
    sankeyLayoutData,
    hierarchyData,
    focusedValueChain,
    treeLayoutData,
    focusedCluster,
    dimensions,
    showSubtleProducts,
  ]);

  // Convert hierarchical data to node and link positions for rendering
  const { nodePositions, linkPositions } = useMemo(() => {
    if (!positionedHierarchyData)
      return { nodePositions: [], linkPositions: [] };

    return convertToPositions(
      positionedHierarchyData,
      focusedValueChain,
      focusedCluster,
    );
  }, [positionedHierarchyData, focusedValueChain, focusedCluster]);

  // Create compact product positions when subtle products are enabled
  const compactProductPositions = useMemo(() => {
    if (
      !showSubtleProducts ||
      !hierarchyData ||
      focusedCluster ||
      focusedValueChain
    ) {
      return [];
    }

    const productPositions: any[] = [];
    const productAreaWidth = 175; // Compact 50px area for products

    // Group products by their parent clusters using FILTERED hierarchy data
    const clusterProducts = new Map<string, any[]>();

    hierarchyData.links
      .filter((link) => {
        const sourceNode = hierarchyData.nodes.find(
          (n) => n.id === link.source,
        );
        const targetNode = hierarchyData.nodes.find(
          (n) => n.id === link.target,
        );
        return (
          sourceNode?.type === "manufacturing_cluster" &&
          targetNode?.type === "product"
        );
      })
      .forEach((link) => {
        const productNode = hierarchyData.nodes.find(
          (n) => n.id === link.target,
        );
        if (productNode) {
          if (!clusterProducts.has(link.source)) {
            clusterProducts.set(link.source, []);
          }
          clusterProducts.get(link.source)?.push({ node: productNode, link });
        }
      });

    // Create positioned product links for visible clusters only
    clusterProducts.forEach((products, clusterId) => {
      // Only process clusters that are visible in the current layout
      const clusterNode = nodePositions.find((n) => n.id === clusterId);
      if (!clusterNode) return;

      // Position products to match the height of the cluster node
      const maxProducts = Math.min(products.length, 8); // Limit to prevent overcrowding
      const availableHeight = clusterNode.height * 0.8; // Use 80% of cluster height for some padding
      const productSpacing =
        maxProducts > 1 ? availableHeight / (maxProducts - 1) : 0;
      const startY = clusterNode.y + clusterNode.height * 0.1; // Start with 10% padding from top

      products
        .slice(0, maxProducts)
        .forEach(({ node: productNode, link }, index) => {
          const productY = startY + index * productSpacing;
          const productX = clusterNode.x + clusterNode.width + 5; // Start just after cluster

          // Create positioned product link - use same styling as focus view
          productPositions.push({
            ...link,
            id: link.id, // Keep original ID for consistent React Spring transitions
            sourceX: clusterNode.x + clusterNode.width,
            sourceY: clusterNode.y + clusterNode.height / 2,
            targetX: productX + productAreaWidth - 2,
            targetY: productY + 2,
            sourceName: clusterId,
            targetName: productNode.id,
            value: 1,
            color: "#808080", // Same grey color as focus view
            isTreeLink: true, // Use tree-style curved links like focus view
            isCompactProduct: false, // Remove special compact styling
          });
        });
    });

    return productPositions;
  }, [
    showSubtleProducts,
    hierarchyData,
    focusedCluster,
    focusedValueChain,
    nodePositions,
  ]);

  // Check if we have valid layout data before rendering animations
  const hasValidLayout = useMemo(() => {
    // For sankey layout, we need sankeyLayoutData to be present
    if (!focusedCluster && !focusedValueChain) {
      return !!sankeyLayoutData;
    }
    // For tree layouts, we need the positioned data
    return !!positionedHierarchyData && nodePositions.length > 0;
  }, [
    sankeyLayoutData,
    positionedHierarchyData,
    nodePositions,
    focusedCluster,
    focusedValueChain,
  ]);

  // Combine regular link positions with compact product positions
  const allLinkPositions = useMemo(() => {
    return [...linkPositions, ...compactProductPositions];
  }, [linkPositions, compactProductPositions]);

  // Prepare header data for transitions
  const headerData = useMemo(() => {
    const headers = [];
    const isFocusedView = focusedCluster !== null || focusedValueChain !== null;

    if (hasValidLayout && nodePositions.length > 0) {
      // Find representative nodes for each column
      const valueChainNodes = nodePositions.filter(
        (n) =>
          hierarchyData?.nodes.find((hn) => hn.id === n.id)?.type ===
          "value_chain",
      );
      const clusterNodes = nodePositions.filter(
        (n) =>
          hierarchyData?.nodes.find((hn) => hn.id === n.id)?.type ===
          "manufacturing_cluster",
      );
      const productNodes = nodePositions.filter(
        (n) =>
          hierarchyData?.nodes.find((hn) => hn.id === n.id)?.type === "product",
      );

      const baseY = isFocusedView ? 11 : 30; // Focus mode headers higher

      // Value Chains column
      if (valueChainNodes.length > 0) {
        const avgX =
          valueChainNodes.reduce(
            (sum, node) => sum + node.x + node.width / 2,
            0,
          ) / valueChainNodes.length;
        headers.push({
          id: "header-value-chains",
          text: "VALUE CHAINS",
          x: avgX,
          y: baseY,
          color: themeUtils.chart.colors.text.secondary,
          fontSize: isMobile ? 10 : 16,
          fontWeight:
            themeUtils.chart.typography["chart-column-header"].fontWeight,
          fontFamily:
            themeUtils.chart.typography["chart-column-header"].fontFamily,
        });
      }

      // Clusters column
      if (clusterNodes.length > 0) {
        const avgX =
          clusterNodes.reduce((sum, node) => sum + node.x + node.width / 2, 0) /
          clusterNodes.length;
        headers.push({
          id: "header-clusters",
          text: isMobile ? "CLUSTERS" : "MANUFACTURING CLUSTERS",
          x: avgX,
          y: baseY,
          color: themeUtils.chart.colors.text.secondary,
          fontSize: isMobile ? 10 : 16,
          fontWeight:
            themeUtils.chart.typography["chart-column-header"].fontWeight,
          fontFamily:
            themeUtils.chart.typography["chart-column-header"].fontFamily,
        });
      }

      // Products column
      if (productNodes.length > 0) {
        const avgX =
          productNodes.reduce((sum, node) => sum + node.x + node.width / 2, 0) /
          productNodes.length;
        headers.push({
          id: "header-products",
          text: "PRODUCTS",
          x: avgX,
          y: baseY,
          color: isFocusedView
            ? themeUtils.chart.colors.text.secondary
            : themeUtils.chart.colors.text.muted, // Less prominent in sankey mode
          fontSize: isMobile ? 10 : 16,
          fontWeight:
            themeUtils.chart.typography["chart-column-header"].fontWeight,
          fontFamily:
            themeUtils.chart.typography["chart-column-header"].fontFamily,
        });
      } else if (
        !isFocusedView &&
        showSubtleProducts &&
        compactProductPositions.length > 0
      ) {
        // Show products header in sankey mode when compact products are visible
        const maxClusterX =
          clusterNodes.length > 0
            ? Math.max(...clusterNodes.map((n) => n.x + n.width))
            : dimensions.width - rightMargin;

        // Position header at the center of the compact products area
        // Products are positioned from maxClusterX + 5 to maxClusterX + 5 + 300 - 2
        const productAreaWidth = 300;
        const productAreaStart = maxClusterX + 5;
        const productAreaEnd = productAreaStart + productAreaWidth - 2;
        const productAreaCenter = (productAreaStart + productAreaEnd) / 2;

        headers.push({
          id: "header-products",
          text: "PRODUCTS",
          x: productAreaCenter, // Position at center of compact products area
          y: baseY,
          color: themeUtils.chart.colors.text.muted, // Less prominent in sankey mode
          fontSize: isMobile ? 10 : 16,
          fontWeight:
            themeUtils.chart.typography["chart-column-header"].fontWeight,
          fontFamily:
            themeUtils.chart.typography["chart-column-header"].fontFamily,
          textAnchor: "end",
        });
      }
    }

    return headers;
  }, [
    hasValidLayout,
    nodePositions,
    hierarchyData,
    focusedCluster,
    focusedValueChain,
    isMobile,
    showSubtleProducts,
    compactProductPositions,
    dimensions.width,
    rightMargin,
  ]);

  // Transitions for headers
  const headerTransitions = useTransition(headerData, {
    keys: (item) => item.id,
    from: (item) => ({
      x: item.x,
      y: item.y, // Start slightly above
      opacity: 0,
    }),
    enter: (item) => ({
      x: item.x,
      y: item.y,
      opacity: 1,
    }),
    update: (item) => ({
      x: item.x,
      y: item.y,
    }),
    leave: () => ({
      opacity: 0,
      // Exit upward
    }),
  });

  // Transitions for links with improved entering animation
  const linkTransitions = useTransition(
    hasValidLayout ? allLinkPositions : [],
    {
      keys: (item) => item.id,
      from: (item) => {
        // Calculate approximate path length for stroke dash animation
        const dx = item.targetX - item.sourceX;
        const dy = item.targetY - item.sourceY;
        const pathLength = Math.max(Math.sqrt(dx * dx + dy * dy) * 1.5, 10); // Minimum path length to avoid issues

        return {
          sourceX: item.sourceX,
          sourceY: item.sourceY,
          targetX: item.targetX,
          targetY: item.targetY,
          opacity: 0,
          strokeDasharray: `${pathLength} ${pathLength}`, // Explicit dash pattern
          strokeDashoffset: pathLength, // Start with full offset (invisible)
        };
      },
      enter: (item) => ({
        sourceX: item.sourceX,
        sourceY: item.sourceY,
        targetX: item.targetX,
        targetY: item.targetY,
        opacity: 0.7,
        strokeDasharray: "none", // Remove dash array when fully drawn
        strokeDashoffset: 0, // Animate to 0 (fully visible)
      }),
      update: (item) => ({
        sourceX: item.sourceX,
        sourceY: item.sourceY,
        targetX: item.targetX,
        targetY: item.targetY,

        strokeDasharray: "none",
        strokeDashoffset: 0,
      }),
      leave: () => ({
        opacity: 0,
      }),
    },
  );

  // Transitions for nodes
  const nodeTransitions = useTransition(hasValidLayout ? nodePositions : [], {
    keys: (item) => item.id,
    from: (item) => {
      // For root nodes (value chains), start from their final position
      if (item.type === "value_chain") {
        return {
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          opacity: 0,
        };
      }
      // For other nodes, start slightly offset
      return {
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        opacity: 0,
      };
    },
    enter: (item) => ({
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      opacity: 1,
    }),
    update: (item) => ({
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
    }),
    leave: () => ({
      opacity: 0,
      immediate: true, // Make leave animations immediate to prevent flash
    }),

    onStart: () => {
      isAnimating.current = true;
    },
    onRest: () => {
      isAnimating.current = false;
    },
    immediate: false, // Ensure animations are not immediate
  });

  // Event handlers
  const handleNodeMouseEnter = useCallback(
    (nodeId: string) => {
      if (!focusedCluster && !focusedValueChain) {
        setHoveredNode(nodeId);

        if (hierarchyData) {
          const connectedNodes = new Set<string>();
          const connectedLinks = new Set<string>();

          // First pass: find directly connected nodes
          hierarchyData.links.forEach((link) => {
            if (link.source === nodeId) {
              connectedNodes.add(link.target);
              connectedLinks.add(link.id);
            } else if (link.target === nodeId) {
              connectedNodes.add(link.source);
              connectedLinks.add(link.id);
            }
          });

          // Second pass: in sankey view with products visible, find transitive connections
          // If hovering a value chain, also highlight products connected to the highlighted clusters
          if (showSubtleProducts && compactProductPositions.length > 0) {
            const hoveredNode = hierarchyData.nodes.find(
              (n) => n.id === nodeId,
            );

            if (hoveredNode?.type === "value_chain") {
              // Find clusters connected to this value chain (already in connectedNodes)
              const connectedClusters = Array.from(connectedNodes).filter(
                (nodeId) => {
                  const node = hierarchyData.nodes.find((n) => n.id === nodeId);
                  return node?.type === "manufacturing_cluster";
                },
              );

              // Find products connected to those clusters and their links
              hierarchyData.links.forEach((link) => {
                if (connectedClusters.includes(link.source)) {
                  const targetNode = hierarchyData.nodes.find(
                    (n) => n.id === link.target,
                  );
                  if (targetNode?.type === "product") {
                    connectedNodes.add(link.target);
                    connectedLinks.add(link.id);
                  }
                }
              });

              // Also highlight compact product links for the connected clusters
              compactProductPositions.forEach((productLink) => {
                if (connectedClusters.includes(productLink.sourceName)) {
                  connectedLinks.add(productLink.id);
                }
              });
            }
          }

          setConnectedNodeIds(connectedNodes);
          setConnectedLinkIds(connectedLinks);
        }
      }
    },
    [
      focusedCluster,
      focusedValueChain,
      hierarchyData,
      showSubtleProducts,
      compactProductPositions,
    ],
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setConnectedNodeIds(new Set());
    setConnectedLinkIds(new Set());
  }, []);

  const handleBackClick = useCallback(() => {
    if (isAnimating.current) return;

    // Reset hover state when navigating back
    setHoveredNode(null);
    setConnectedNodeIds(new Set());
    setConnectedLinkIds(new Set());

    if (focusedCluster) {
      setFocusedCluster(null);
    } else if (focusedValueChain) {
      setFocusedValueChain(null);
    }
  }, [focusedCluster, focusedValueChain]);

  const handleClusterClick = useCallback((clusterName: string) => {
    if (isAnimating.current) return;
    // Reset hover state when clicking
    setHoveredNode(null);
    setConnectedNodeIds(new Set());
    setConnectedLinkIds(new Set());
    setFocusedValueChain(null);
    setFocusedCluster(clusterName);
  }, []);

  const handleValueChainClick = useCallback((valueChainName: string) => {
    if (isAnimating.current) return;
    // Reset hover state when clicking
    setHoveredNode(null);
    setConnectedNodeIds(new Set());
    setConnectedLinkIds(new Set());
    setFocusedCluster(null);
    setFocusedValueChain(valueChainName);
  }, []);

  // Handle loading states with graceful fallbacks

  // Only show full loading screen if we have no usable data at all
  // If we have previous data or cached data, show the UI with subtle loading indicator
  if (
    (isInitialLoading || isLoading) &&
    !hasPreviousData &&
    !baseHierarchyData
  ) {
    return <VisualizationLoading message="" />;
  }

  if (!hierarchyData) {
    return <VisualizationLoading message="" />;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Loading indicator - show subtle indicator when loading with previous data */}
      {isCountryDataLoading && hasPreviousData && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 10,
          }}
        >
          <VisualizationLoading message="" size="small" fullHeight={false} />
        </div>
      )}

      {/* Standardized Controls - Always show controls */}
      <VisualizationControls
        controlGroups={[
          // Display Mode Control
          {
            type: "buttonGroup",
            label: "Display Mode",
            options: [
              { value: "Country Specific", label: "Country Specific" },
              { value: "Global", label: "Global" },
            ],
            selected: coloringMode,
            onChange: (value: string) =>
              setColoringMode(value as SankeyColoringMode),
            defaultValue: "Country Specific",
            paramKey: "displayMode",
          },
          // RCA Threshold Slider - only show in Country Specific mode
          ...(coloringMode === "Country Specific"
            ? [
                {
                  type: "slider" as const,
                  label: "Product RCA Threshold",
                  value: rcaThreshold,
                  onChange: setRcaThreshold,
                  min: 0,
                  max: 3,
                  step: 0.1,
                  defaultValue: 1,
                  paramKey: "rcaThreshold",
                  formatLabel: (value: number) =>
                    `Product RCA Threshold: ${value.toFixed(1)}`,
                },
              ]
            : []),
          // Subtle Products Toggle - only show when no node is focused
          ...(!focusedCluster && !focusedValueChain
            ? [
                {
                  type: "buttonGroup" as const,
                  label: "Show Products",
                  options: [
                    { value: "off", label: "Off" },
                    { value: "on", label: "On" },
                  ],
                  selected: showSubtleProducts ? "on" : "off",
                  onChange: (value: string) =>
                    setShowSubtleProducts(value === "on"),
                  defaultValue: "off",
                  paramKey: "showProducts",
                },
              ]
            : []),
        ]}
      />

      {/* Back button for focused views */}
      {(focusedCluster || focusedValueChain) && (
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            onClick={handleBackClick}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Back to Overview
          </button>
        </div>
      )}

      {/* Chart + Legend Container for Image Capture */}
      <div
        ref={chartContainerRef}
        style={{
          position: "relative",
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0, // Allow flex item to shrink
        }}
      >
        {/* SVG Visualization */}
        <div
          style={{
            flex: 1,
            position: "relative",
            // Add subtle visual indication when loading with previous data
            opacity: isCountryDataLoading && hasPreviousData ? 0.7 : 1,
            transition: "opacity 0.3s ease-in-out",
            minHeight: 0, // Allow flex item to shrink
          }}
        >
          <svg
            width={dimensions.width}
            height={dimensions.height}
            style={{
              maxWidth: "100%",
              height: "auto",
              minHeight: isMobile ? "250px" : "300px",
            }}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height + 120}`}
            preserveAspectRatio={isMobile ? "xMidYMid meet" : undefined}
            aria-labelledby="sankeyTitle"
          >
            {/* Animated column headers */}
            {headerTransitions((styles, item) => (
              <animated.text
                key={item.id}
                x={(styles as any).x}
                y={(styles as any).y}
                textAnchor="middle"
                fontSize={item.fontSize}
                fontWeight={item.fontWeight}
                fill={item.color}
                style={{
                  opacity: (styles as any).opacity,
                  pointerEvents: "none",
                }}
              >
                {item.text}
              </animated.text>
            ))}

            {/* Links */}
            {linkTransitions((styles, item) => {
              // Check if we're in a focused view (tree layout or cluster focus)
              const isFocusedView =
                focusedCluster !== null || focusedValueChain !== null;

              // Calculate RCA-based opacity for visual emphasis within filtered results
              const linkRcaOpacity = isFocusedView
                ? 1 // Focused views have full opacity
                : coloringMode === "Country Specific"
                  ? getRCAOpacity((item as any).rca)
                  : 1; // Global mode uses full opacity

              // Calculate flow highlighting opacity
              const isConnectedToHovered = connectedLinkIds.has(item.id);
              const hasHoveredNode = hoveredNode !== null;
              const flowHighlightOpacity = hasHoveredNode
                ? isConnectedToHovered
                  ? 1.0
                  : 0.3 // Emphasize connected, dim others when hovering
                : 1.0; // No hover, full opacity

              // Use the color determined by layout utils (value chain links keep their color, others are grey in focused views)
              const linkColor = item.color;

              // Calculate stroke width based on context and link value
              let strokeWidth;
              if (isFocusedView) {
                // In focused views, use simple fixed width
                strokeWidth = isConnectedToHovered && hasHoveredNode ? 3 : 2;
              } else {
                // In sankey view, calculate stroke width proportional to node height
                // Find the source and target nodes for this link
                const sourceNodePosition = nodePositions.find(
                  (n) => n.id === item.sourceName,
                );
                const targetNodePosition = nodePositions.find(
                  (n) => n.id === item.targetName,
                );

                if (sourceNodePosition && targetNodePosition) {
                  // Get all links from the source node
                  const sourceLinks = linkPositions.filter(
                    (link) => link.sourceName === item.sourceName,
                  );
                  const totalSourceValue = sourceLinks.reduce(
                    (sum, link) => sum + (link.value || 0),
                    0,
                  );

                  // Get all links to the target node
                  const targetLinks = linkPositions.filter(
                    (link) => link.targetName === item.targetName,
                  );
                  const totalTargetValue = targetLinks.reduce(
                    (sum, link) => sum + (link.value || 0),
                    0,
                  );

                  // Calculate proportional width based on source node height
                  const sourceProportionalWidth =
                    totalSourceValue > 0
                      ? (item.value / totalSourceValue) *
                        sourceNodePosition.height
                      : 1;

                  // Calculate proportional width based on target node height
                  const targetProportionalWidth =
                    totalTargetValue > 0
                      ? (item.value / totalTargetValue) *
                        targetNodePosition.height
                      : 1;

                  // Use the average of source and target proportional widths
                  strokeWidth =
                    (sourceProportionalWidth + targetProportionalWidth) / 2;

                  // Ensure minimum and maximum stroke width
                  strokeWidth = Math.max(0.5, Math.min(strokeWidth, 50));
                } else {
                  // Fallback to fixed width if nodes not found
                  strokeWidth = 2;
                }

                // Add hover emphasis
                if (isConnectedToHovered && hasHoveredNode) {
                  strokeWidth = Math.max(strokeWidth * 1.2, strokeWidth + 1);
                }
              }

              return (
                <animated.path
                  key={item.id}
                  style={{
                    stroke: linkColor,
                    fill: "none",
                    strokeWidth,
                    opacity: to(
                      [(styles as any).opacity],
                      (animOpacity: number) =>
                        animOpacity * linkRcaOpacity * flowHighlightOpacity,
                    ),
                    strokeDasharray:
                      (styles as any).strokeDasharray === "none"
                        ? undefined
                        : (styles as any).strokeDasharray,
                    strokeDashoffset: (styles as any).strokeDashoffset,
                  }}
                  d={to(
                    [
                      (styles as any).sourceX,
                      (styles as any).sourceY,
                      (styles as any).targetX,
                      (styles as any).targetY,
                    ],
                    (sx: number, sy: number, tx: number, ty: number) => {
                      if (item.isTreeLink) {
                        // Standard tree-style curved links
                        // Go horizontally from source, then curve down to target
                        const midX = sx + (tx - sx) * 0.6; // 60% of the way horizontally
                        return `M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx},${ty}`;
                      } else {
                        // Sankey-style curved path with proper flow appearance
                        const midX = sx + (tx - sx) * 0.5;
                        return `M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx},${ty}`;
                      }
                    },
                  )}
                />
              );
            })}

            {/* Nodes */}
            {nodeTransitions((styles, item) => {
              const isValueChain = item.type === "value_chain";
              const isCluster = item.type === "manufacturing_cluster";
              const isProduct = item.type === "product";
              const isFocused =
                item.id === focusedCluster || item.id === focusedValueChain;
              const isHovered = item.id === hoveredNode;
              const isConnectedToHovered = connectedNodeIds.has(item.id);

              // Check if we're in a focused view (tree layout or cluster focus)
              const isFocusedView =
                focusedCluster !== null || focusedValueChain !== null;

              // Mark subtle product nodes for special opacity handling
              const isSubtleProduct =
                (isProduct && showSubtleProducts && !isFocusedView) ||
                (item as any).isSubtleProduct;

              // Node colors: value chains keep their colors, everything else is grey in focused views
              let nodeColor = item.color;
              if (isFocusedView && !isValueChain) {
                nodeColor = "#808080"; // Grey for non-value-chain nodes in focused views
              }

              // Calculate node highlighting opacity (similar to links)
              const hasHoveredNode = hoveredNode !== null;
              const nodeHighlightOpacity = hasHoveredNode
                ? isHovered || isConnectedToHovered
                  ? 1.0
                  : 0.3 // Deemphasize unconnected nodes when hovering
                : 1.0; // No hover, full opacity

              // Calculate RCA-based opacity for visual emphasis within filtered results
              let nodeRcaOpacity = 1.0;
              if (
                !isFocusedView &&
                isCluster &&
                coloringMode === "Country Specific"
              ) {
                const nodeData = hierarchyData?.nodes.find(
                  (n) => n.id === item.id,
                );
                if (nodeData && nodeData.rca !== undefined) {
                  nodeRcaOpacity = getRCAOpacity(nodeData.rca);
                }
              }

              // Set opacity = 0 for subtle product nodes to enable smooth transitions
              const subtleProductOpacity = isSubtleProduct ? 0 : 1;

              return (
                <animated.g
                  key={item.id}
                  style={{
                    transform: to(
                      [(styles as any).x, (styles as any).y],
                      (x: number, y: number) => `translate(${x}px,${y}px)`,
                    ),
                    cursor:
                      (isCluster && !focusedCluster) ||
                      (isValueChain && !focusedValueChain)
                        ? "pointer"
                        : "default",
                  }}
                  onClick={
                    isCluster && !focusedCluster
                      ? () => handleClusterClick(item.id)
                      : isValueChain && !focusedValueChain
                        ? () => handleValueChainClick(item.id)
                        : undefined
                  }
                  onMouseEnter={() => handleNodeMouseEnter(item.id)}
                  onMouseLeave={handleNodeMouseLeave}
                >
                  {isFocusedView ? (
                    // Network graph style: consistent circular nodes
                    <animated.circle
                      cx={to(
                        [(styles as any).width],
                        (width: number) => width / 2,
                      )}
                      cy={to(
                        [(styles as any).height],
                        (height: number) => height / 2,
                      )}
                      r={8}
                      fill={nodeColor}
                      stroke={
                        isFocused || isHovered ? "#000000" : "transparent"
                      }
                      strokeWidth={isFocused || isHovered ? 2 : 0}
                      style={{
                        opacity: to(
                          [(styles as any).opacity],
                          (animOpacity: number) =>
                            animOpacity *
                            nodeHighlightOpacity *
                            nodeRcaOpacity *
                            subtleProductOpacity,
                        ),
                      }}
                    />
                  ) : (
                    // Sankey style: rectangular nodes with variable sizes
                    <animated.rect
                      width={(styles as any).width}
                      height={(styles as any).height}
                      rx={to(
                        [(styles as any).width, (styles as any).height],
                        (w: number, h: number) =>
                          isProduct
                            ? 8
                            : isValueChain && focusedCluster
                              ? Math.min(w / 2, h / 2)
                              : focusedValueChain
                                ? 12
                                : 0,
                      )}
                      ry={to(
                        [(styles as any).width, (styles as any).height],
                        (w: number, h: number) =>
                          isProduct
                            ? 8
                            : isValueChain && focusedCluster
                              ? Math.min(w / 2, h / 2)
                              : focusedValueChain
                                ? 12
                                : 0,
                      )}
                      fill={nodeColor}
                      stroke={
                        isFocused || isHovered ? "#000000" : "transparent"
                      }
                      strokeWidth={isFocused || isHovered ? 2 : 0}
                      style={{
                        opacity: to(
                          [(styles as any).opacity],
                          (animOpacity: number) =>
                            animOpacity *
                            nodeHighlightOpacity *
                            nodeRcaOpacity *
                            subtleProductOpacity,
                        ),
                      }}
                    />
                  )}

                  {/* Background rectangle for cluster text in sankey view when products are visible */}
                  {!isFocusedView &&
                    isCluster &&
                    showSubtleProducts &&
                    compactProductPositions.length > 0 && (
                      <animated.rect
                        x={to([(styles as any).width], (width: number) => {
                          // Position based on text anchor - same logic as text positioning
                          return width + (isMobile ? 8 : 12) - 4; // Start slightly before text
                        })}
                        y={to([(styles as any).height], (height: number) => {
                          return height / 2 - (isMobile ? 8 : 10); // Center vertically with some padding
                        })}
                        width={150}
                        height={isMobile ? 16 : 20} // Height to cover the text
                        fill="rgba(255, 255, 255, 0.65)" // Semi-transparent white
                        stroke="none"
                        rx={2} // Slight rounding
                        ry={2}
                        style={{
                          opacity: to(
                            [(styles as any).opacity],
                            (animOpacity: number) => {
                              // Hide background for unrelated nodes when hovering
                              if (
                                hoveredNode &&
                                !isHovered &&
                                !isConnectedToHovered
                              ) {
                                return 0;
                              }
                              // Show background with animation and hover highlighting
                              return animOpacity * nodeHighlightOpacity;
                            },
                          ),
                        }}
                      />
                    )}

                  <animated.text
                    x={to([(styles as any).width], (width: number) => {
                      // Handle focused view positioning
                      if (isFocusedView) {
                        if (focusedCluster) {
                          // When cluster is selected:
                          // - Root nodes (value chains) → left
                          // - Center node (selected cluster) → underneath (center)
                          // - Leaf nodes (products) → right
                          if (isValueChain) return isMobile ? -8 : -15; // Root nodes to left, closer on mobile
                          if (isCluster && item.id === focusedCluster)
                            return width / 2; // Center node underneath
                          if (isProduct) return width + (isMobile ? 8 : 15); // Leaf nodes to right, closer on mobile
                          return width / 2; // Default center
                        } else if (focusedValueChain) {
                          // When value chain is selected:
                          // - Root node (value chain) → left
                          // - Cluster labels → left
                          // - Leaf nodes (products) → right
                          if (isValueChain) return isMobile ? -8 : -15; // Root node to left, closer on mobile
                          if (isCluster) return isMobile ? -8 : -15; // Cluster labels to left, closer on mobile
                          if (isProduct) return width + (isMobile ? 8 : 15); // Leaf nodes to right, closer on mobile
                          return width / 2; // Default center
                        }
                        return width / 2; // Default center for network view
                      }
                      // Sankey style: original positioning logic
                      if (isValueChain && !focusedCluster && !focusedValueChain)
                        return isMobile ? -8 : -12;
                      if (isCluster && focusedCluster) return width / 2;
                      if (focusedValueChain) {
                        return isValueChain
                          ? isMobile
                            ? -8
                            : -12
                          : width + (isMobile ? 8 : 12);
                      }
                      return width + (isMobile ? 8 : 12);
                    })}
                    y={to([(styles as any).height], (height: number) => {
                      // Handle focused view positioning
                      if (isFocusedView) {
                        if (
                          focusedCluster &&
                          isCluster &&
                          item.id === focusedCluster
                        ) {
                          // Center node (selected cluster) → underneath
                          return height + (isMobile ? 20 : 25);
                        }
                        // All other nodes in focused views get text to the side at vertical center
                        return height / 2;
                      }
                      // Sankey style: original positioning
                      return height / 2;
                    })}
                    style={{
                      textAnchor: (() => {
                        if (isFocusedView) {
                          if (focusedCluster) {
                            // When cluster is selected
                            if (isValueChain) return "end"; // Root nodes (value chains) to left
                            if (isCluster && item.id === focusedCluster)
                              return "middle"; // Center node underneath
                            if (isProduct) return "start"; // Leaf nodes (products) to right
                            return "middle";
                          } else if (focusedValueChain) {
                            // When value chain is selected
                            if (isValueChain || isCluster) return "end"; // Root and cluster labels to left
                            if (isProduct) return "start"; // Leaf nodes to right
                            return "middle";
                          }
                          return "middle";
                        }
                        // Sankey style: original text anchor logic
                        return isValueChain &&
                          !focusedCluster &&
                          !focusedValueChain
                          ? "end"
                          : isCluster && focusedCluster
                            ? "middle"
                            : focusedValueChain && isValueChain
                              ? "end"
                              : "start";
                      })(),
                      fontSize: isMobile ? 10 : 12,
                      fontWeight:
                        themeUtils.chart.typography["chart-data-label"]
                          .fontWeight,
                      fontFamily:
                        themeUtils.chart.typography["chart-data-label"]
                          .fontFamily,
                      fill: themeUtils.chart.colors.text.primary,
                      pointerEvents: "none",
                      dominantBaseline: (() => {
                        if (isFocusedView) {
                          if (
                            focusedCluster &&
                            isCluster &&
                            item.id === focusedCluster
                          ) {
                            return "hanging"; // Text below the selected cluster
                          }
                          return "middle"; // Text at vertical center for all other nodes
                        }
                        return "middle";
                      })(),
                      // Text opacity uses animation, hover highlighting, and subtle product opacity
                      opacity: to(
                        [(styles as any).opacity],
                        (animOpacity: number) => {
                          // Hide text for unrelated nodes when hovering
                          if (
                            hoveredNode &&
                            !isHovered &&
                            !isConnectedToHovered
                          ) {
                            return 0;
                          }
                          // Show text with animation opacity, hover highlighting, and subtle product opacity
                          return (
                            animOpacity *
                            nodeHighlightOpacity *
                            subtleProductOpacity
                          );
                        },
                      ),
                    }}
                  >
                    {(() => {
                      // Truncate text with ellipsis for focused views
                      if (isFocusedView) {
                        const maxLength = (() => {
                          const baseLength = isMobile ? 12 : 18;
                          if (focusedCluster) {
                            if (isValueChain) return baseLength;
                            if (isCluster && item.id === focusedCluster)
                              return baseLength + 7; // Slightly longer for focused cluster
                            if (isProduct) return baseLength + 4;
                            return baseLength + 2;
                          } else if (focusedValueChain) {
                            if (isValueChain || isCluster) return baseLength;
                            if (isProduct) return baseLength + 4;
                            return baseLength + 2;
                          }
                          return baseLength + 2; // Default for network view
                        })();

                        return item.label.length > maxLength
                          ? item.label.substring(0, maxLength - 3) + "..."
                          : item.label;
                      }
                      // Sankey style: use a reasonable max length to prevent overflow
                      const sankeyMaxLength = isMobile ? 18 : 25;
                      return item.label.length > sankeyMaxLength
                        ? item.label.substring(0, sankeyMaxLength - 3) + "..."
                        : item.label;
                    })()}
                  </animated.text>
                </animated.g>
              );
            })}
          </svg>
        </div>

        {/* Legend - only show in Country Specific mode */}
        {coloringMode === "Country Specific" && (
          <Legend countrySelection={countrySelection} />
        )}
      </div>
    </div>
  );
};

// Main export component with ParentSize wrapper
export default function SankeyTree() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <TableWrapper defaultDataType="products">
        <ParentSize>
          {({ width, height }) => {
            if (width === 0 || height === 0) {
              return null;
            }
            return <SankeyTreeInternal width={width} height={height} />;
          }}
        </ParentSize>
      </TableWrapper>
    </div>
  );
}

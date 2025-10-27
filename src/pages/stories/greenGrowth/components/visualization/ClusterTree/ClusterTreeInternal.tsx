/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/prefer-tag-over-role */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import type React from "react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  Typography,
  Box,
  Select,
  MenuItem,
  IconButton,
  Popover,
  Slider,
  Button,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { TooltipWithBounds, useTooltip } from "@visx/tooltip";

import { useGreenGrowthData } from "../../../hooks/useGreenGrowthData";
import { buildHierarchicalData } from ".././SankeyTree/dataUtils";
import { convertToPositions } from "../SankeyTree/layoutUtils";
import { useSupplyChainProductLookup } from "../../../queries/supplyChainProducts";
import { VisualizationLoading } from "../../shared";
import {
  useCountrySelection,
  useYearSelection,
  useClusterSelection,
} from "../../../hooks/useUrlParams";
import { useImageCaptureContext } from "../../../hooks/useImageCaptureContext";
import html2canvas from "html2canvas";
import { useSelectionDataModal } from "../../../hooks/useSelectionDataModal";
import { themeUtils } from "../../../theme";
import { SharedTooltip } from "../../shared";
import type { SharedTooltipPayload } from "../../shared";
import { useProductLookup } from "../../../queries/products";
import { getRCAOpacity } from "../../../utils/rcaConfig";
import GGTooltip from "../../shared/GGTooltip";
import TuneIcon from "@mui/icons-material/Tune";
import { useSidebar } from "../../SidebarContext";

import ClusterRanking from "./ClusterRanking";
import { calculateClusterScores, getPotentialColor } from "./utils";
import {
  getValueChainIcon,
  getValueChainIconComponent,
} from "./valueChainIconMapping";

interface ClusterTreeInternalProps {
  width: number;
  height: number;
}

// Helper: compute spacing that guarantees content fits into availableHeight without scaling text.
// We do not enforce a minimum spacing if it would overflow; instead we reduce spacing as needed.
const calculateDynamicSpacing = (
  itemCount: number,
  availableHeight: number,
  nodeHeight: number = 16,
  _minSpacing: number = 6,
  maxSpacing: number = 100,
) => {
  if (itemCount <= 1)
    return { spacing: 0, startY: Math.max(0, availableHeight / 2) };

  const totalNodeHeight = itemCount * nodeHeight;
  const gapCount = Math.max(1, itemCount - 1);
  const availableSpacingHeight = Math.max(0, availableHeight - totalNodeHeight);

  // spacing chosen to exactly fit into availableHeight (bounded by maxSpacing)
  const fittedSpacing = availableSpacingHeight / gapCount;
  const spacing = Math.min(maxSpacing, fittedSpacing);

  const totalUsedHeight = totalNodeHeight + gapCount * spacing;
  const startY = Math.max(0, (availableHeight - totalUsedHeight) / 2);

  return { spacing, startY };
};

// Internal component that receives dimensions from ParentSize
const ClusterTreeInternal: React.FC<ClusterTreeInternalProps> = ({
  width,
  height,
}) => {
  // Get country, year, and cluster selection from URL params
  const selectedCountry = useCountrySelection();
  const selectedYear = useYearSelection();
  const {
    clusterSelection: selectedCluster,
    setClusterSelection: setSelectedCluster,
  } = useClusterSelection();

  // Track whether the selection came from dropdown
  const [isDropdownSelection, setIsDropdownSelection] = useState(false);

  // Reset dropdown selection flag after it's been used
  useEffect(() => {
    if (isDropdownSelection) {
      const timeoutId = setTimeout(() => {
        setIsDropdownSelection(false);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isDropdownSelection]);

  // Responsive setup
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const { isCondensed } = useSidebar();

  // Calculate responsive dimensions - reserve space for header and cluster ranking
  const rankingHeight = isMobile ? 100 : isTablet ? 110 : 120;
  const verticalSpacing = isMobile ? 16 : 24;

  const dimensions = useMemo(() => {
    // Use nearly full width with minimal padding
    const calculatedWidth = Math.max(width - (isMobile ? 16 : 32), 300);

    const headerHeight = 60 + 32; // Title height (60) + margin bottom (32 from mb: 4)

    // Calculate available tree height dynamically
    const availableTreeHeight = Math.max(
      height - headerHeight - rankingHeight - verticalSpacing * 2,
      200, // minimum tree height
    );

    return {
      width: calculatedWidth,
      height: availableTreeHeight,
      rankingHeight,
    };
  }, [width, height, rankingHeight, isMobile, verticalSpacing]);

  // Dynamic margins so we use available width but keep room for labels/axis/legend
  const layoutMargins = useMemo(() => {
    const w = Math.max(0, dimensions.width);
    const h = Math.max(0, dimensions.height);

    // Left margin: value chain labels and icons
    const leftBase = isMobile ? 140 : 180;
    const left = Math.max(leftBase, Math.round(w * 0.1));

    // Right margin: product labels, axis, and legend
    const rightBase = isMobile ? 280 : 380;
    const rightFactor = isCondensed ? 1.4 : 1.0;
    const right = Math.max(
      Math.round(rightBase * rightFactor),
      Math.min(Math.round(w * 0.25 * rightFactor), Math.round(w * 0.65)),
    );

    // Bottom margin: dropdown and legend (responsive to available height)
    // On short viewports, reduce bottom margin to fit content better
    const bottomBase = isMobile ? 140 : 200;
    const minBottom = isMobile ? 100 : 120;
    const maxBottom = isMobile ? 180 : 260;
    const bottom = Math.min(
      maxBottom,
      Math.max(minBottom, Math.min(bottomBase, Math.round(h * 0.3))),
    );

    return { left, right, bottom };
  }, [dimensions.width, dimensions.height, isMobile, isCondensed]);

  // Product label width and truncation based on available right panel
  const productLabelMetrics = useMemo(() => {
    const availableSpace = layoutMargins.right - 80; // Reserve space for axis/legend
    const maxWidth = Math.max(200, Math.min(600, availableSpace));
    const approxCharPx = isMobile ? 7 : 9;
    const charLimit = Math.max(15, Math.floor(maxWidth / approxCharPx));
    return { maxWidth, charLimit };
  }, [layoutMargins.right, isMobile]);

  // Image capture functionality
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const { registerCaptureFunction, unregisterCaptureFunction } =
    useImageCaptureContext();

  // State
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(
    new Set(),
  );
  const [connectedLinkIds, setConnectedLinkIds] = useState<Set<string>>(
    new Set(),
  );
  const isAnimating = useRef(false);
  const [rcaThreshold, setRcaThreshold] = useState<number>(1.0);
  const [rcaAnchorEl, setRcaAnchorEl] = useState<HTMLElement | null>(null);

  // Tooltip state for shared tooltip
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<SharedTooltipPayload>();

  // Product lookup for tooltip metadata
  const productLookup = useProductLookup();

  // Local currency formatter for tooltip values
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        compactDisplay: "short",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [],
  );

  // Data loading
  const {
    productClusterRows,
    productMappings,
    countryData,
    clustersData,
    supplyChainsData,
    isLoading,
    hasErrors,
  } = useGreenGrowthData(selectedCountry, parseInt(selectedYear), false);

  // Get supply chain product lookup
  const supplyChainProductLookup = useSupplyChainProductLookup();

  // Get cluster data lookup
  const clusterLookup = useMemo(() => {
    if (!clustersData?.gpClusterList) return new Map();
    return new Map(
      clustersData.gpClusterList.map((cluster: any) => [
        cluster.clusterId,
        cluster.clusterName,
      ]),
    );
  }, [clustersData]);

  // Calculate consistent score range for color scaling and cluster color lookup
  const { minScore, maxScore, clusterColorMap } = useMemo(() => {
    if (!countryData?.clusterData) {
      return { minScore: 0, maxScore: 1, clusterColorMap: new Map() };
    }

    const scoredClusters = calculateClusterScores(countryData.clusterData);
    const scores = scoredClusters.map((c) => c.topRightScore);

    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    // Create a map of cluster names to their colors for easy lookup
    const clusterColorMap = new Map();
    scoredClusters.forEach((cluster) => {
      const clusterName =
        clusterLookup.get(cluster.clusterId) || `Cluster ${cluster.clusterId}`;
      const color = getPotentialColor(
        cluster.topRightScore,
        minScore,
        maxScore,
      );
      clusterColorMap.set(clusterName, color);
    });

    return {
      minScore,
      maxScore,
      clusterColorMap,
    };
  }, [countryData?.clusterData, clusterLookup]);

  // Get unique clusters for selection, sorted by potential score
  const availableClusters = useMemo(() => {
    if (!productClusterRows || !countryData?.clusterData) return [];

    // Get unique cluster names
    const clusters = Array.from(
      new Set(productClusterRows.map((row) => row.cluster_name)),
    );

    // Calculate cluster scores to determine ranking
    const scoredClusters = calculateClusterScores(countryData.clusterData);

    // Create a map of cluster names to their scores
    const clusterScoreMap = new Map();
    scoredClusters.forEach((cluster) => {
      const clusterName =
        clusterLookup.get(cluster.clusterId) || `Cluster ${cluster.clusterId}`;
      clusterScoreMap.set(clusterName, cluster.topRightScore);
    });

    // Sort clusters by their potential scores (highest potential first)
    return clusters.sort((a, b) => {
      const scoreA = clusterScoreMap.get(a) || 0;
      const scoreB = clusterScoreMap.get(b) || 0;
      return scoreB - scoreA; // Sort descending (highest potential first)
    });
  }, [productClusterRows, countryData?.clusterData, clusterLookup]);

  // Set default cluster when data loads and no cluster is selected in URL
  useEffect(() => {
    if (availableClusters.length > 0 && !selectedCluster) {
      setSelectedCluster(availableClusters[0]);
    }
  }, [availableClusters, selectedCluster, setSelectedCluster]);

  // Handle cluster selection from beeswarm
  const handleClusterSelect = useCallback(
    (clusterName: string, fromDropdown = false) => {
      setIsDropdownSelection(fromDropdown);
      setSelectedCluster(clusterName);
    },
    [setSelectedCluster],
  );

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

  // Apply layout to hierarchy data - use same cluster focus layout
  const positionedHierarchyData = useMemo(() => {
    if (!hierarchyData || !selectedCluster) return null;

    const visibleNodes = hierarchyData.nodes.filter((n) => n.visible);

    // Get connected value chains (sources) and products (targets)
    const valueChains = visibleNodes.filter((n) => n.type === "value_chain");
    const products = visibleNodes.filter((n) => n.type === "product");

    // Sort products by country-specific RCA (descending order)
    const sortedProducts = products.sort((a, b) => {
      const aProduct = countryData?.productData?.find(
        (p: any) => p.productId.toString() === a.id,
      );
      const bProduct = countryData?.productData?.find(
        (p: any) => p.productId.toString() === b.id,
      );
      const aRCA = aProduct ? Number.parseFloat(aProduct.exportRca || "0") : 0;
      const bRCA = bProduct ? Number.parseFloat(bProduct.exportRca || "0") : 0;

      return bRCA - aRCA; // Descending order (high RCA at top)
    });

    // Precompute vertical layouts for value chains and products
    const nodeWidth = 16; // Fixed width for circles
    const nodeHeight = 16; // Fixed height for circles
    const leftReserved = layoutMargins.left;
    const rightReserved = layoutMargins.right; // room for product labels + axis
    const bottomReserved = layoutMargins.bottom; // room for legend
    const topReserved = isMobile ? 36 : 48;

    const vcLayout = calculateDynamicSpacing(
      valueChains.length,
      Math.max(200, dimensions.height - bottomReserved - topReserved),
      nodeHeight,
      isMobile ? 30 : 40,
      isMobile ? 80 : 100,
    );
    const prLayout = calculateDynamicSpacing(
      sortedProducts.length,
      Math.max(220, dimensions.height - bottomReserved - topReserved),
      nodeHeight,
      isMobile ? 25 : 30,
      isMobile ? 50 : 60,
    );

    // Compute vertical center between the two layers (considering node height)
    const topY = Math.min(vcLayout.startY, prLayout.startY) + topReserved;
    const bottomY = Math.max(
      topReserved +
        vcLayout.startY +
        Math.max(0, valueChains.length - 1) * (nodeHeight + vcLayout.spacing) +
        nodeHeight,
      topReserved +
        prLayout.startY +
        Math.max(0, sortedProducts.length - 1) *
          (nodeHeight + prLayout.spacing) +
        nodeHeight,
    );
    const midCenterY = (topY + bottomY) / 2;

    const valueChainX = leftReserved;
    const productX = dimensions.width - rightReserved;
    const clusterX = valueChainX + 0.33 * (productX - valueChainX);

    const updatedNodes = visibleNodes.map((node) => {
      if (node.id === selectedCluster) {
        return {
          ...node,
          x: clusterX - nodeWidth / 2,
          y: midCenterY - nodeHeight / 2,
          width: nodeWidth,
          height: nodeHeight,
        };
      } else if (node.type === "value_chain") {
        const index = valueChains.findIndex((vc) => vc.id === node.id);
        return {
          ...node,
          x: leftReserved,
          y:
            topReserved +
            vcLayout.startY +
            index * (nodeHeight + vcLayout.spacing),
          width: nodeWidth,
          height: nodeHeight,
        };
      } else if (node.type === "product") {
        const index = sortedProducts.findIndex((p) => p.id === node.id);

        // Get product data for sizing and coloring
        const productData = countryData?.productData?.find(
          (p: any) => p.productId.toString() === node.id,
        );
        const exportValue = productData
          ? Number.parseFloat(productData.exportValue || "0")
          : 0;
        const rca = productData
          ? Number.parseFloat(productData.exportRca || "0")
          : 0;

        // Use uniform node size instead of export-based sizing
        const nodeRadius = 8;

        return {
          ...node,
          x: dimensions.width - rightReserved,
          y:
            topReserved +
            prLayout.startY +
            index * (nodeHeight + prLayout.spacing),
          width: nodeWidth,
          height: nodeHeight,
          exportValue,
          rca,
          radius: nodeRadius,
        };
      }

      return node;
    });

    return {
      ...hierarchyData,
      nodes: updatedNodes,
      links: hierarchyData.links.filter((l) => l.visible),
    };
  }, [
    hierarchyData,
    selectedCluster,
    dimensions,
    countryData,
    isMobile,
    layoutMargins.left,
    layoutMargins.right,
    layoutMargins.bottom,
  ]);

  // Convert hierarchical data to node and link positions for rendering
  const { nodePositions, linkPositions } = useMemo(() => {
    if (!positionedHierarchyData)
      return { nodePositions: [], linkPositions: [] };

    return convertToPositions(
      positionedHierarchyData,
      null, // focusedValueChain
      selectedCluster, // focusedCluster
    );
  }, [positionedHierarchyData, selectedCluster]);

  // We avoid viewBox scaling so text remains at a constant size. Layout is computed
  // directly in the available pixel space defined by `dimensions`.

  // Create lookup maps for supply chain relationships
  const supplyChainLookup = useMemo(() => {
    if (!supplyChainsData?.gpSupplyChainList) return new Map();
    return new Map(
      supplyChainsData.gpSupplyChainList.map((sc: any) => [
        sc.supplyChainId,
        sc.supplyChain,
      ]),
    );
  }, [supplyChainsData]);

  // Event handlers - using supply chain relationships for highlighting
  const handleNodeMouseEnter = useCallback(
    (nodeId: string) => {
      setHoveredNode(nodeId);

      if (
        hierarchyData &&
        productMappings.length > 0 &&
        supplyChainLookup.size > 0
      ) {
        const connectedNodes = new Set<string>();
        const connectedLinks = new Set<string>();

        // Find the hovered node to determine its type
        const hoveredNodeData = hierarchyData.nodes.find(
          (n) => n.id === nodeId,
        );
        if (!hoveredNodeData) return;

        if (hoveredNodeData.type === "value_chain") {
          // When hovering a value chain (supply chain), highlight all products in that supply chain
          const supplyChainName = hoveredNodeData.name || hoveredNodeData.id;

          // Find the supplyChainId for this name
          const supplyChainId = Array.from(supplyChainLookup.entries()).find(
            ([_, name]) => name === supplyChainName,
          )?.[0];

          if (supplyChainId !== undefined) {
            // Find all products that belong to this supply chain using raw mappings
            productMappings.forEach((mapping) => {
              if (mapping.supplyChainId === supplyChainId) {
                connectedNodes.add(mapping.productId.toString());

                // Also connect to the cluster if it's the selected one
                const clusterName = clusterLookup.get(mapping.clusterId);
                if (clusterName === selectedCluster) {
                  connectedNodes.add(selectedCluster);
                }
              }
            });
          }
        } else if (hoveredNodeData.type === "product") {
          // When hovering a product, highlight only the product and its connected value chains
          const productId = parseInt(nodeId);

          // Find all supply chains this product belongs to
          const productSupplyChains = new Set<number>();
          productMappings.forEach((mapping) => {
            if (mapping.productId === productId) {
              productSupplyChains.add(mapping.supplyChainId);
            }
          });

          // For each supply chain this product belongs to:
          productSupplyChains.forEach((supplyChainId) => {
            const supplyChainName = supplyChainLookup.get(supplyChainId);

            // Connect to the value chain node
            const valueChainNode = hierarchyData.nodes.find(
              (n) =>
                n.type === "value_chain" &&
                (n.name === supplyChainName || n.id === supplyChainName),
            );
            if (valueChainNode) {
              connectedNodes.add(valueChainNode.id);
            }

            // Connect to clusters that contain this specific product
            productMappings.forEach((mapping) => {
              if (
                mapping.supplyChainId === supplyChainId &&
                mapping.productId === productId
              ) {
                const clusterName = clusterLookup.get(mapping.clusterId);
                if (clusterName === selectedCluster) {
                  connectedNodes.add(selectedCluster);
                }
              }
            });
          });
        } else if (hoveredNodeData.type === "manufacturing_cluster") {
          // When hovering a cluster, highlight all connected value chains and products
          // This uses the existing hierarchical logic since clusters connect to everything
          hierarchyData.links.forEach((link) => {
            if (link.source === nodeId) {
              connectedNodes.add(link.target);
              connectedLinks.add(link.id);
            } else if (link.target === nodeId) {
              connectedNodes.add(link.source);
              connectedLinks.add(link.id);
            }
          });
        }

        // Find corresponding links for supply chain connections
        if (hoveredNodeData.type !== "manufacturing_cluster") {
          hierarchyData.links.forEach((link) => {
            const sourceConnected =
              nodeId === link.source || connectedNodes.has(link.source);
            const targetConnected =
              nodeId === link.target || connectedNodes.has(link.target);

            if (sourceConnected && targetConnected) {
              connectedLinks.add(link.id);
            }
          });
        }

        setConnectedNodeIds(connectedNodes);
        setConnectedLinkIds(connectedLinks);
      }
    },
    [
      hierarchyData,
      productMappings,
      supplyChainLookup,
      clusterLookup,
      selectedCluster,
    ],
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setConnectedNodeIds(new Set());
    setConnectedLinkIds(new Set());
    hideTooltip();
  }, [hideTooltip]);

  const { openSelectionModal } = useSelectionDataModal();

  const handleNodeClick = useCallback(
    (node: any) => {
      if (isAnimating.current || !node) return;
      if (node.type === "product") {
        const productIdNum = Number(node.refId ?? node.id);
        openSelectionModal({
          type: "product",
          productId: productIdNum,
          title: node.label,
          source: "cluster-tree",
          detailLevel: "full",
        });
      } else if (node.type === "manufacturing_cluster") {
        openSelectionModal({
          type: "cluster",
          clusterId: node.refId ?? node.id,
          title: node.label,
          source: "cluster-tree",
          detailLevel: "full",
        });
      } else if (node.type === "value_chain") {
        // Resolve numeric supplyChainId by matching the node label to the supply chain name
        const targetName = node.label || node.name || String(node.id);
        let resolvedSupplyChainId: number | undefined;
        supplyChainLookup.forEach((name, id) => {
          if (resolvedSupplyChainId === undefined && name === targetName) {
            resolvedSupplyChainId = Number(id);
          }
        });

        openSelectionModal({
          type: "supplyChain",
          supplyChainId: resolvedSupplyChainId,
          title: targetName,
          source: "cluster-tree",
          detailLevel: "full",
        });
      }
    },
    [openSelectionModal, supplyChainLookup],
  );

  // Register image capture function
  useEffect(() => {
    const captureFunction = async (): Promise<void> => {
      if (!chartContainerRef.current) {
        throw new Error("Chart container ref not available");
      }

      try {
        // Temporarily hide non-export elements (click hints, etc.)
        const hiddenElements: HTMLElement[] = [];
        const candidates = chartContainerRef.current.querySelectorAll(
          '[data-export-hide="true"]',
        );
        candidates.forEach((el) => {
          const element = el as HTMLElement;
          if (element.style) {
            hiddenElements.push(element);
            element.setAttribute(
              "data-export-original-display",
              element.style.display || "",
            );
            element.style.display = "none";
          }
        });

        const canvas = await html2canvas(chartContainerRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
          useCORS: true,
        });

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "cluster-tree-chart.png";
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
        console.error("Error capturing chart image:", error);
        throw error;
      }
    };

    registerCaptureFunction(captureFunction);

    return () => {
      unregisterCaptureFunction();
    };
  }, [registerCaptureFunction, unregisterCaptureFunction]);

  if (isLoading) {
    return <VisualizationLoading message="" />;
  }

  if (hasErrors) {
    return <VisualizationLoading message="Error loading data" />;
  }

  if (!hierarchyData) {
    return <VisualizationLoading message="" />;
  }

  return (
    <Box
      ref={chartContainerRef}
      sx={{
        height: "100%",
        width: "100%",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header Section with Title and Instructions */}
      <Box
        sx={{
          flexShrink: 0,
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
            mb: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              ...themeUtils.chart.typography["chart-title"],
            }}
          >
            Cluster Connections
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area - Optimized flex layout */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          gap: isMobile ? 1 : 1.5,
          px: isMobile ? 1 : 2,
          py: isMobile ? 1 : 1.5,
        }}
      >
        {/* Cluster Ranking Section */}
        {countryData?.clusterData && (
          <Box
            sx={{
              flexShrink: 0,
              height: dimensions.rankingHeight,
              width: "100%",
            }}
          >
            <ClusterRanking
              width={dimensions.width}
              height={dimensions.rankingHeight}
              clusterData={countryData.clusterData}
              clusterLookup={clusterLookup}
              countryData={countryData}
              supplyChainProductLookup={supplyChainProductLookup}
              selectedCluster={selectedCluster}
              onClusterSelect={handleClusterSelect}
              isMobile={isMobile}
              minScore={minScore}
              maxScore={maxScore}
              scrollToSelection={isDropdownSelection}
            />
          </Box>
        )}

        {/* Tree Visualization Section - Takes all remaining space */}
        <Box
          sx={{
            mt: 1,
            flex: 1,
            minHeight: 0,
            width: "100%",
            position: "relative",
            overflow: "visible",
          }}
          ref={visualizationRef}
        >
          <svg
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            role="img"
            aria-label="Cluster tree visualization"
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "100%",
              margin: "0 auto",
            }}
          >
            <defs>
              <filter id="tree-cluster-glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Export axis annotation on the right */}
            {(() => {
              // Calculate the actual bounds of the product nodes
              const productNodes = nodePositions.filter(
                (item) => item.type === "product",
              );

              if (productNodes.length === 0) return null;

              // Find the topmost and bottommost product positions
              const topProductY = Math.min(
                ...productNodes.map((node) => node.y),
              );
              const bottomProductY = Math.max(
                ...productNodes.map((node) => node.y),
              );
              const rightProductX = Math.max(
                ...productNodes.map((node) => node.x),
              );

              // Compute a hard stop at the start of the right panel and allow product text to extend up to a max width
              const productLabelMaxRight =
                dimensions.width -
                layoutMargins.right +
                productLabelMetrics.maxWidth;
              const annotationX = Math.min(
                dimensions.width - Math.round(layoutMargins.right * 0.2),
                Math.max(productLabelMaxRight + 20, rightProductX + 60),
              );

              return (
                <g>
                  {/* High Export arrow and rotated text */}
                  <text
                    x={annotationX + 20}
                    y={topProductY}
                    fontSize={"1.125rem"}
                    fill="#000"
                    textAnchor="middle"
                    fontFamily="Source Sans Pro, sans-serif"
                    fontWeight="600"
                    transform={`rotate(-90, ${annotationX + 20}, ${topProductY})`}
                  >
                    High Export
                  </text>
                  {/* Up arrow */}
                  <path
                    d={`M ${annotationX} ${topProductY - 5} L ${annotationX - 3} ${topProductY + 2} L ${annotationX + 3} ${topProductY + 2} Z`}
                    fill="#666"
                    stroke="none"
                  />

                  {/* Vertical dashed line spanning products section */}
                  <line
                    x1={annotationX}
                    y1={topProductY}
                    x2={annotationX}
                    y2={bottomProductY}
                    stroke="#666"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />

                  {/* Low Export arrow and rotated text */}
                  <text
                    x={annotationX + 20}
                    y={bottomProductY + 30}
                    fontSize={"1.125rem"}
                    fill="#000"
                    textAnchor="middle"
                    fontFamily="Source Sans Pro, sans-serif"
                    fontWeight="600"
                    transform={`rotate(-90, ${annotationX + 20}, ${bottomProductY + 30})`}
                  >
                    Low Export
                  </text>
                  {/* Down arrow */}
                  <path
                    d={`M ${annotationX} ${bottomProductY + 5} L ${annotationX - 3} ${bottomProductY - 2} L ${annotationX + 3} ${bottomProductY - 2} Z`}
                    fill="#666"
                    stroke="none"
                  />
                </g>
              );
            })()}

            {/* Legend positioned below products on the right with RCA controls */}
            {(() => {
              const productNodes = nodePositions.filter(
                (item) => item.type === "product",
              );
              if (productNodes.length === 0) return null;

              const bottomProductY = Math.max(
                ...productNodes.map((node) => node.y),
              );
              const rightProductX = Math.max(
                ...productNodes.map((node) => node.x),
              );

              const legendCenterX = Math.max(
                dimensions.width - Math.round(layoutMargins.right * 0.75),
                rightProductX + 60,
              );

              // Improved legend positioning for short viewports
              // Ensure minimum spacing from bottom product and maximum from bottom edge
              const minGapFromProducts = isMobile ? 60 : 80;
              const minGapFromBottom = isMobile ? 100 : 120;
              const idealLegendY = bottomProductY + minGapFromProducts;
              const maxLegendY = dimensions.height - minGapFromBottom;

              // If ideal position would be too low, prioritize fitting in viewport
              // Also ensure legend doesn't go above the bottom product with a minimum offset
              const legendY = Math.max(
                bottomProductY + 40, // Minimum offset from products even on very short viewports
                Math.min(idealLegendY, maxLegendY),
              );

              const thresholdLabel = Number(rcaThreshold).toFixed(1);

              return (
                <g>
                  {/* Legend title */}
                  <text
                    x={legendCenterX - 50}
                    y={legendY}
                    fontSize={"1rem"}
                    fill="#000"
                    textAnchor="middle"
                    fontFamily="Source Sans Pro, sans-serif"
                    fontWeight="600"
                  >
                    Economic Competitiveness
                  </text>

                  {/* High Export legend item - first row */}
                  <circle
                    cx={legendCenterX - 120}
                    cy={legendY + 35}
                    r="6"
                    fill="#888888"
                    stroke="#888888"
                    strokeWidth="1"
                  />
                  <text
                    x={legendCenterX - 100}
                    y={legendY + 40}
                    fontSize={"1rem"}
                    fill="#000"
                    fontFamily="Source Sans Pro, sans-serif"
                    textAnchor="start"
                  >
                    {`High (RCA>${thresholdLabel})`}
                  </text>

                  {/* Low Export legend item - second row */}
                  <circle
                    cx={legendCenterX - 120}
                    cy={legendY + 70}
                    r="6"
                    fill="#ffffff"
                    stroke="#888888"
                    strokeWidth="1.5"
                  />
                  <text
                    x={legendCenterX - 100}
                    y={legendY + 75}
                    fontSize={"1rem"}
                    fill="#000"
                    fontFamily="Source Sans Pro, sans-serif"
                    textAnchor="start"
                  >
                    {`Low (RCA≤${thresholdLabel})`}
                  </text>

                  {/* Tune button anchored via foreignObject for Popover */}
                  <foreignObject
                    x={legendCenterX + 44}
                    y={legendY - 20}
                    width={40}
                    height={40}
                  >
                    <div>
                      <GGTooltip title="Adjust RCA threshold" placement="top">
                        <IconButton
                          size="small"
                          aria-label="Adjust RCA threshold"
                          onClick={(e) =>
                            setRcaAnchorEl(e.currentTarget as HTMLElement)
                          }
                        >
                          <TuneIcon fontSize="small" />
                        </IconButton>
                      </GGTooltip>
                    </div>
                  </foreignObject>
                </g>
              );
            })()}

            {/* Render links with improved styling */}
            {linkPositions.map((item) => {
              const isConnectedToHovered = connectedLinkIds.has(item.id);
              const hasHoveredNode = hoveredNode !== null;
              const flowHighlightOpacity = hasHoveredNode
                ? isConnectedToHovered
                  ? 1.0
                  : 0.3
                : 1.0;

              // Use a standard fixed link thickness
              const strokeWidth = 3;

              // Calculate standard curved path - simpler bezier curve
              const controlPointOffset =
                Math.abs(item.targetX - item.sourceX) * 0.5;
              const controlX1 = item.sourceX + controlPointOffset;
              const controlX2 = item.targetX - controlPointOffset;

              return (
                <path
                  key={item.id}
                  d={`M ${item.sourceX} ${item.sourceY} C ${controlX1} ${item.sourceY}, ${controlX2} ${item.targetY}, ${item.targetX} ${item.targetY}`}
                  stroke="#999"
                  strokeWidth={strokeWidth}
                  fill="none"
                  opacity={flowHighlightOpacity}
                  style={{ strokeLinecap: "round" }}
                />
              );
            })}

            {/* Render nodes */}
            {nodePositions.map((item) => {
              const isValueChain = item.type === "value_chain";
              const isCluster = item.type === "manufacturing_cluster";
              const isProduct = item.type === "product";
              const isFocused = item.id === selectedCluster;
              const isHovered = item.id === hoveredNode;
              const isConnectedToHovered = connectedNodeIds.has(item.id);

              // Calculate node color, size, and styling based on type and data
              let nodeColor = item.color;
              let nodeRadius = 9; // Slightly larger default radius
              let fillColor = nodeColor;
              let strokeColor = "transparent";
              let strokeWidth = 0;
              let rcaOpacity = 1.0;

              if (isCluster && isFocused) {
                strokeColor = "black";
                strokeWidth = 2;
                // Use pre-calculated color from the cluster color map for perfect consistency
                const preCalculatedColor = clusterColorMap.get(selectedCluster);
                if (preCalculatedColor) {
                  nodeColor = preCalculatedColor;
                  fillColor = nodeColor;

                  // Calculate size if we have cluster data
                  if (countryData?.clusterData) {
                    const clusterItem = countryData.clusterData.find(
                      (c: any) =>
                        (clusterLookup.get(c.clusterId) ||
                          `Cluster ${c.clusterId}`) === selectedCluster,
                    );
                    if (clusterItem) {
                      nodeRadius = 16; // Uniform size for tree view
                    }
                  }
                }
              } else if (isProduct) {
                // Re-fetch RCA directly from countryData since convertToPositions doesn't preserve custom properties
                const productData = countryData?.productData?.find(
                  (p: any) => p.productId.toString() === item.id,
                );
                const actualRCA = productData
                  ? Number.parseFloat(productData.exportRca || "0")
                  : 0;

                // Use actual RCA for coloring and sizing
                const rcaForColoring = actualRCA;
                rcaOpacity = getRCAOpacity(rcaForColoring, rcaThreshold);

                // Use slightly larger uniform node radius
                nodeRadius = 9;

                if (rcaForColoring >= rcaThreshold) {
                  // High RCA (RCA > 1): filled grey
                  fillColor = "#888888";
                  strokeColor = "#888888";
                  strokeWidth = 1;
                } else {
                  // Low RCA (RCA < 1): white fill with grey stroke
                  fillColor = "#ffffff";
                  strokeColor = "#888888";
                  strokeWidth = 1.5;
                }
              } else if (isValueChain) {
                // Value chain styling
                fillColor = "#4A90E2"; // Blue for value chains
                nodeRadius = 8;
              } else {
                fillColor = "#808080"; // Grey for other nodes
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
                >
                  {/* Circular nodes - don't show circles for value chains */}
                  {!isValueChain && (
                    <circle
                      cx={item.width / 2}
                      cy={item.height / 2}
                      r={nodeRadius}
                      fill={fillColor}
                      stroke={isHovered ? "#000000" : strokeColor}
                      strokeWidth={isHovered ? 2 : strokeWidth}
                      opacity={
                        nodeHighlightOpacity * (isProduct ? rcaOpacity : 1.0)
                      }
                    />
                  )}

                  {/* Value chain icons */}
                  {isValueChain &&
                    (() => {
                      const IconComponent = getValueChainIconComponent(
                        item.label,
                      );
                      const iconPath = getValueChainIcon(item.label);
                      if (!IconComponent && !iconPath) return null;

                      const iconSize = 35; // Fixed icon size
                      const iconX = (isMobile ? -80 : -100) - iconSize; // Position icon to the left of text, away from links
                      const iconY = item.height / 2 - iconSize / 2;

                      // Prefer inline SVG component for reliable capture; fallback to image href
                      return IconComponent ? (
                        <g
                          transform={`translate(${iconX}, ${iconY})`}
                          opacity={nodeHighlightOpacity}
                        >
                          <IconComponent width={iconSize} height={iconSize} />
                        </g>
                      ) : (
                        <image
                          href={iconPath as string}
                          x={iconX}
                          y={iconY}
                          width={iconSize}
                          height={iconSize}
                          opacity={nodeHighlightOpacity}
                        />
                      );
                    })()}

                  {isValueChain && (
                    <circle
                      cx={item.width / 2}
                      cy={item.height / 2}
                      r={10}
                      fill="transparent"
                      pointerEvents="none"
                    />
                  )}

                  {/* Expanded hover/click target for value chain icon + text + center circle area */}
                  {isValueChain && (
                    <rect
                      {...(() => {
                        const iconSize = 35;
                        const iconX = (isMobile ? -80 : -100) - iconSize;
                        const height = isMobile ? 44 : 48;
                        const y = item.height / 2 - height / 2;
                        const x = iconX;
                        const width = item.width / 2 + nodeRadius - iconX;
                        return { x, y, width, height } as const;
                      })()}
                      fill="transparent"
                      role="button"
                      aria-label={`${item.type} ${item.label}`}
                      tabIndex={0}
                      onClick={() => handleNodeClick(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleNodeClick(item);
                        }
                      }}
                      onMouseEnter={() => handleNodeMouseEnter(item.id)}
                      onMouseLeave={handleNodeMouseLeave}
                    />
                  )}

                  {/* Node labels */}
                  {item.type !== "manufacturing_cluster" && (
                    <text
                      x={(() => {
                        if (isValueChain) return isMobile ? -75 : -95; // Value chain text to right of icon, away from links
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
                        if (isValueChain) return "start"; // Value chain text starts to right of icon
                        if (isCluster && item.id === selectedCluster)
                          return "middle"; // Center node underneath
                        if (isProduct) return "start"; // Leaf nodes to right
                        return "middle";
                      })()}
                      fontSize={isProduct ? 18 : isMobile ? 12 : 16}
                      fontWeight={isProduct ? 600 : 500}
                      fontFamily={'"Source Sans Pro", sans-serif'}
                      fill={isProduct ? "#000" : "#333"}
                      dominantBaseline={(() => {
                        if (isCluster && item.id === selectedCluster) {
                          return "hanging"; // Text below the selected cluster
                        }
                        return "middle";
                      })()}
                      opacity={nodeHighlightOpacity}
                      pointerEvents={isValueChain ? "none" : undefined}
                      style={{ cursor: "pointer" }}
                    >
                      {(() => {
                        const maxLength = (() => {
                          // Expand product text width allowance significantly
                          if (isValueChain) return isMobile ? 12 : 18;
                          if (isCluster && item.id === selectedCluster)
                            return isMobile ? 19 : 25;
                          if (isProduct) return productLabelMetrics.charLimit;
                          return isMobile ? 14 : 20;
                        })();

                        return item.label.length > maxLength
                          ? item.label.substring(0, maxLength - 3) + "..."
                          : item.label;
                      })()}
                    </text>
                  )}

                  {/* Unified hover/click target for product circle + label area */}
                  {isProduct && (
                    <rect
                      {...(() => {
                        const margin = isMobile ? 8 : 15;
                        const textX = item.width + margin;
                        const textH = isMobile ? 28 : 32;
                        const circleLeft = item.width / 2 - nodeRadius;
                        const x = Math.min(circleLeft, textX);
                        const y =
                          item.height / 2 - Math.max(nodeRadius, textH / 2);
                        const right = textX + productLabelMetrics.maxWidth;
                        const width = right - x;
                        const height = Math.max(nodeRadius * 2, textH);
                        return { x, y, width, height } as const;
                      })()}
                      fill="transparent"
                      role="button"
                      aria-label={`${item.type} ${item.label}`}
                      tabIndex={0}
                      onClick={() => handleNodeClick(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleNodeClick(item);
                        }
                      }}
                      onMouseEnter={(e: React.MouseEvent<SVGRectElement>) => {
                        handleNodeMouseEnter(item.id);
                        const productIdNum = Number(item.id);
                        const productMeta = productLookup?.get?.(productIdNum);
                        const productData = countryData?.productData?.find(
                          (p: any) => p.productId === productIdNum,
                        );
                        const containerRect =
                          visualizationRef.current?.getBoundingClientRect();
                        const left = e.clientX - (containerRect?.left || 0);
                        const top = e.clientY - (containerRect?.top || 0);
                        showTooltip({
                          tooltipData: {
                            type: "custom",
                            data: {
                              title: productMeta?.nameShortEn || item.label,
                              rows: [
                                {
                                  label: "Export Value:",
                                  value: currencyFormatter.format(
                                    Number(productData?.exportValue || 0),
                                  ),
                                },
                                {
                                  label: "RCA:",
                                  value: Number(
                                    productData?.exportRca || 0,
                                  ).toFixed(1),
                                },
                              ],
                            },
                          },
                          tooltipLeft: left,
                          tooltipTop: top,
                        });
                      }}
                      onMouseMove={(e: React.MouseEvent<SVGRectElement>) => {
                        if (tooltipOpen) {
                          const containerRect =
                            visualizationRef.current?.getBoundingClientRect();
                          const left = e.clientX - (containerRect?.left || 0);
                          const top = e.clientY - (containerRect?.top || 0);
                          showTooltip({
                            tooltipData:
                              (tooltipData as SharedTooltipPayload) ||
                              undefined,
                            tooltipLeft: left,
                            tooltipTop: top,
                          });
                        }
                      }}
                      onMouseLeave={handleNodeMouseLeave}
                    />
                  )}

                  {/* Unified hover/click target for cluster circle + label area */}
                  {isCluster && (
                    <rect
                      {...(() => {
                        const padding = isMobile ? 20 : 24;
                        const radius = nodeRadius + padding;
                        const x = item.width / 2 - radius;
                        // If focused cluster, text is below; extend height downward
                        const belowTextExtra = isFocused
                          ? (isMobile ? 28 : 32) + (isMobile ? 20 : 25)
                          : 0;
                        const y = item.height / 2 - radius;
                        const width = radius * 2;
                        const height = radius * 2 + belowTextExtra;
                        return { x, y, width, height } as const;
                      })()}
                      fill="transparent"
                      role="button"
                      aria-label={`${item.type} ${item.label}`}
                      tabIndex={0}
                      onClick={() => handleNodeClick(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleNodeClick(item);
                        }
                      }}
                      onMouseEnter={() => handleNodeMouseEnter(item.id)}
                      onMouseLeave={handleNodeMouseLeave}
                    />
                  )}
                </g>
              );
            })}
            {/* Section titles above columns */}
            {(() => {
              const valueChainNodes = nodePositions.filter(
                (item) => item.type === "value_chain",
              );
              const productNodes = nodePositions.filter(
                (item) => item.type === "product",
              );
              const clusterNodes = nodePositions.filter(
                (item) => item.type === "manufacturing_cluster",
              );

              // Topmost y per side
              const topValueChainY =
                valueChainNodes.length > 0
                  ? Math.min(...valueChainNodes.map((node) => node.y))
                  : 50;
              const topProductY =
                productNodes.length > 0
                  ? Math.min(...productNodes.map((node) => node.y))
                  : 50;

              const highestTopY = Math.min(topValueChainY, topProductY);
              const labelGap = 25;

              // X anchors
              const leftReserved = layoutMargins.left;
              const rightReserved = layoutMargins.right;
              const valueChainX =
                valueChainNodes.length > 0
                  ? valueChainNodes[0].x
                  : leftReserved;
              const productX =
                productNodes.length > 0
                  ? productNodes[0].x
                  : dimensions.width - rightReserved;
              const clusterX =
                clusterNodes.length > 0
                  ? clusterNodes[0].x
                  : leftReserved +
                    0.33 * (dimensions.width - leftReserved - rightReserved);

              return (
                <>
                  <text
                    x={valueChainX + 20}
                    y={highestTopY - labelGap}
                    fontSize={20}
                    fill="#000"
                    textAnchor="end"
                    fontFamily="Source Sans Pro, sans-serif"
                    fontWeight={600}
                  >
                    Value Chains
                  </text>
                  <text
                    x={clusterX + 45}
                    y={highestTopY - labelGap}
                    fontSize={20}
                    fill="#000"
                    textAnchor="middle"
                    fontFamily="Source Sans Pro, sans-serif"
                    fontWeight={600}
                  >
                    Industrial Cluster
                  </text>
                  <text
                    x={productX}
                    y={highestTopY - labelGap}
                    fontSize={20}
                    fill="#000"
                    textAnchor="start"
                    fontFamily="Source Sans Pro, sans-serif"
                    fontWeight={600}
                  >
                    Products
                  </text>
                </>
              );
            })()}
            {/* Cluster dropdown positioned under the selected cluster node - HTML overlay, not inside SVG */}
          </svg>
          {selectedCluster &&
            nodePositions.length > 0 &&
            (() => {
              const clusterNode = nodePositions.find(
                (item) =>
                  item.type === "manufacturing_cluster" &&
                  item.id === selectedCluster,
              );
              if (!clusterNode) return null;

              const left = clusterNode.x + clusterNode.width / 2 + 20;
              // Adjust dropdown spacing based on viewport height to prevent overlap with legend
              const dropdownOffset = 30;
              const top = clusterNode.y + clusterNode.height + dropdownOffset;

              return (
                <Box
                  sx={{
                    position: "absolute",
                    left,
                    top,
                    transform: "translateX(-50%)",
                    pointerEvents: "auto",
                    zIndex: 10, // Ensure dropdown is above other elements
                  }}
                >
                  <Select
                    IconComponent={KeyboardArrowDownIcon}
                    value={selectedCluster}
                    onChange={(e) => handleClusterSelect(e.target.value, true)}
                    size="small"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200,
                        },
                      },
                    }}
                    sx={{
                      display: "inline-flex",
                      width: "auto",
                      minWidth: "120px",
                      maxWidth: "240px",
                      bgcolor: "rgba(255, 255, 255, 0.85)",
                      "& .MuiSelect-select": {
                        fontSize: "1rem",
                        color: "#000",
                        fontWeight: 600,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        paddingTop: "4px",
                        paddingLeft: "6px",
                        paddingRight: "4px",
                        paddingBottom: "4px",

                        minWidth: 0,
                        lineHeight: 1.3,
                      },
                      "& .MuiSelect-icon": {
                        top: "50%",
                        transform: "translateY(-50%) rotate(0deg)",
                        transition: "transform 150ms ease",
                        right: 8,
                        position: "absolute",
                      },
                      "& .MuiSelect-icon.MuiSelect-iconOpen": {
                        transform: "translateY(-50%) rotate(180deg)",
                      },
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.6)",
                        alignItems: "flex-start",
                        "& .MuiOutlinedInput-input": {
                          height: "auto",
                          minHeight: "1.4em",
                          paddingTop: "4px",
                          paddingBottom: "4px",
                          paddingLeft: "6px",
                          paddingRight: "4px",
                          width: "100%",
                          boxSizing: "border-box",
                        },
                        "& fieldset": {
                          borderColor: "#e0e0e0",
                        },
                        "&:hover fieldset": {
                          borderColor: "#1976d2",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#1976d2",
                        },
                      },
                    }}
                  >
                    {availableClusters.map((cluster) => (
                      <MenuItem key={cluster} value={cluster}>
                        {cluster}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              );
            })()}
          {tooltipOpen && tooltipData && (
            <TooltipWithBounds
              left={(tooltipLeft || 0) + 12}
              top={(tooltipTop || 0) + 12}
              className="gg-unskinned-tooltip"
            >
              <SharedTooltip payload={tooltipData} />
            </TooltipWithBounds>
          )}
          {/* RCA threshold Popover */}
          <Popover
            open={Boolean(rcaAnchorEl)}
            anchorEl={rcaAnchorEl}
            onClose={() => setRcaAnchorEl(null)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Box sx={{ p: 2, width: 280 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                RCA Threshold
              </Typography>
              <Slider
                min={0}
                max={3}
                step={0.1}
                value={rcaThreshold}
                onChange={(_, v) => setRcaThreshold(Number(v))}
                valueLabelDisplay="auto"
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button size="small" onClick={() => setRcaAnchorEl(null)}>
                  Close
                </Button>
              </Box>
            </Box>
          </Popover>
        </Box>
      </Box>
    </Box>
  );
};

export default ClusterTreeInternal;

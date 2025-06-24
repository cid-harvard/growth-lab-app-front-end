import React, { useState, useMemo, useCallback, useRef } from "react";
import { animated, useTransition, config, to } from "@react-spring/web";
import { tree, hierarchy } from "d3-hierarchy";
import { useTheme, useMediaQuery } from "@mui/material";
import { ParentSize } from "@visx/responsive";
import { useUrlParams, useGreenGrowthData } from "../../../hooks";

// Local imports
import { buildHierarchicalData, buildTreeDataForValueChain } from "./dataUtils";
import { applySankeyLayout, convertToPositions } from "./layoutUtils";
import Legend from "./Legend";
import { SankeyColoringMode } from "./types";

// Helper function to get RCA-based opacity (3 groups)
const getRCAOpacity = (rca?: number): number => {
  if (!rca) return 1;
  if (rca >= 1) return 1; // High RCA group
  if (rca >= 0.5) return 0.6; // Medium RCA group
  return 0.3; // Low RCA group
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
    const calculatedHeight = Math.max(height - (isMobile ? 10 : 20), 400);

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

  const isAnimating = useRef(false);

  // Centralized data loading
  const { countryData, productClusterRows, isLoading, isCountryDataLoading } =
    useGreenGrowthData(countrySelection);

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

  // Apply visibility based on focused cluster or value chain
  const hierarchyData = useMemo(() => {
    if (!baseHierarchyData) return null;

    const nodeMap = new Map(
      baseHierarchyData.nodes.map((node) => [node.id, node]),
    );

    const updatedNodes = baseHierarchyData.nodes.map((node) => {
      if (!focusedCluster && !focusedValueChain) {
        return {
          ...node,
          visible: node.type !== "product",
        };
      } else if (focusedValueChain && !focusedCluster) {
        if (node.id === focusedValueChain) {
          return { ...node, visible: true };
        } else if (node.type === "manufacturing_cluster") {
          const isConnected = baseHierarchyData.links.some(
            (l) => l.source === focusedValueChain && l.target === node.id,
          );
          return { ...node, visible: isConnected };
        } else if (node.type === "product") {
          const connectedClusters = baseHierarchyData.links
            .filter((l) => l.source === focusedValueChain)
            .map((l) => l.target);

          const isConnectedToRelevantCluster = baseHierarchyData.links.some(
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
          const isConnected = baseHierarchyData.links.some(
            (l) => l.source === node.id && l.target === focusedCluster,
          );
          return { ...node, visible: isConnected };
        } else if (node.type === "product") {
          const isConnected = baseHierarchyData.links.some(
            (l) => l.source === focusedCluster && l.target === node.id,
          );
          return { ...node, visible: isConnected };
        } else {
          return { ...node, visible: false };
        }
      }

      return { ...node, visible: node.type !== "product" };
    });

    const nodeVisibility = new Map(
      updatedNodes.map((node) => [node.id, node.visible]),
    );

    const updatedLinks = baseHierarchyData.links.map((link) => {
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
  }, [baseHierarchyData, focusedCluster, focusedValueChain]);

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

      const updatedNodes = hierarchyData.nodes.map((node) => {
        const treeNode = treeNodeMap.get(node.id);

        if (treeNode && node.visible) {
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
        }
        return node;
      });

      return { ...hierarchyData, nodes: updatedNodes };
    }

    // Handle tree layout when focusing on a cluster
    if (focusedCluster) {
      const visibleNodes = hierarchyData.nodes.filter((n) => n.visible);

      // Get connected value chains (sources) and products (targets)
      const valueChains = visibleNodes.filter((n) => n.type === "value_chain");
      const products = visibleNodes.filter((n) => n.type === "product");

      const updatedNodes = hierarchyData.nodes.map((node) => {
        if (!node.visible) return node;

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

      return { ...hierarchyData, nodes: updatedNodes };
    }

    // Otherwise use sankey layout
    if (!sankeyLayoutData) return null;

    const sankeyNodeMap = new Map(
      sankeyLayoutData.nodes.map((n) => [n.name, n]),
    );

    const updatedNodes = hierarchyData.nodes.map((node) => {
      const sankeyNode = sankeyNodeMap.get(node.id);

      if (sankeyNode && node.visible) {
        return {
          ...node,
          x: sankeyNode.x0,
          y: sankeyNode.y0,
          width: (sankeyNode.x1 ?? 0) - (sankeyNode.x0 ?? 0),
          height: (sankeyNode.y1 ?? 0) - (sankeyNode.y0 ?? 0),
        };
      }
      return node;
    });

    return { ...hierarchyData, nodes: updatedNodes };
  }, [
    sankeyLayoutData,
    hierarchyData,
    focusedValueChain,
    treeLayoutData,
    focusedCluster,
    dimensions,
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

  // Animation configurations
  const linkConfig = useMemo(
    () => ({
      enter: { duration: 400, delay: 0 },
      leave: { duration: 50, delay: 0 },
      update: { duration: 300 },
    }),
    [],
  );

  const nodeConfig = useMemo(
    () => ({
      ...config.gentle,
      duration: 300,
    }),
    [],
  );

  // Transitions for links
  const linkTransitions = useTransition(linkPositions, {
    keys: (item) => item.id,
    from: (item) => ({
      sourceX: item.sourceX,
      sourceY: item.sourceY,
      targetX: item.sourceX,
      targetY: item.sourceY,
      opacity: 0,
    }),
    enter: (item) => ({
      sourceX: item.sourceX,
      sourceY: item.sourceY,
      targetX: item.targetX,
      targetY: item.targetY,
      opacity: 0.7,
    }),
    update: (item) => ({
      sourceX: item.sourceX,
      sourceY: item.sourceY,
      targetX: item.targetX,
      targetY: item.targetY,
      opacity: 1,
    }),
    leave: () => ({
      opacity: 0,
    }),
    config: (_, __, phase) => {
      switch (phase) {
        case "enter":
          return linkConfig.enter;
        case "leave":
          return linkConfig.leave;
        default:
          return linkConfig.update;
      }
    },
  });

  // Transitions for nodes
  const nodeTransitions = useTransition(nodePositions, {
    keys: (item) => item.id,
    from: (item) => ({
      x: item.x,
      y: item.y - 20,
      width: item.width,
      height: item.height,
      opacity: 0,
    }),
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
      opacity: 1,
    }),
    leave: () => ({
      opacity: 0,
    }),
    config: nodeConfig,
    trail: 0,
    onStart: () => {
      isAnimating.current = true;
    },
    onRest: () => {
      isAnimating.current = false;
    },
  });

  // Event handlers
  const handleNodeMouseEnter = useCallback(
    (nodeId: string) => {
      if (!focusedCluster && !focusedValueChain) {
        setHoveredNode(nodeId);

        if (hierarchyData) {
          const connectedNodes = new Set<string>();
          const connectedLinks = new Set<string>();

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
      }
    },
    [focusedCluster, focusedValueChain, hierarchyData],
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

  // isLoading is now provided by useGreenGrowthData hook

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#ffffff",
          color: "#333333",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!hierarchyData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#ffffff",
          color: "#333333",
        }}
      >
        Building visualization...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Loading indicator */}
      {isCountryDataLoading && (
        <div style={{ marginBottom: "20px" }}>
          <span style={{ color: "#333333" }}>Loading country data...</span>
        </div>
      )}

      {/* Top-level Controls for Global vs Country Specific */}
      {!focusedCluster && !focusedValueChain && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: isMobile ? "15px" : "20px",
            gap: isMobile ? "8px" : "10px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: isMobile ? "12px" : "14px", color: "#666" }}>
            Display as
          </span>
          <div
            style={{
              display: "flex",
              border: "1px solid #ccc",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setColoringMode("Country Specific")}
              style={{
                padding: isMobile ? "6px 12px" : "8px 16px",
                background:
                  coloringMode === "Country Specific" ? "#007acc" : "#fff",
                color: coloringMode === "Country Specific" ? "#fff" : "#333",
                border: "none",
                cursor: "pointer",
                fontSize: isMobile ? "10px" : "12px",
                fontWeight: "500",
              }}
            >
              Country Specific
            </button>
            <button
              onClick={() => setColoringMode("Global")}
              style={{
                padding: isMobile ? "6px 12px" : "8px 16px",
                background: coloringMode === "Global" ? "#007acc" : "#fff",
                color: coloringMode === "Global" ? "#fff" : "#333",
                border: "none",
                cursor: "pointer",
                fontSize: isMobile ? "10px" : "12px",
                fontWeight: "500",
              }}
            >
              Global
            </button>
          </div>
        </div>
      )}

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

      {/* SVG Visualization */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        style={{
          maxWidth: "100%",
          height: "auto",
          minHeight: isMobile ? "350px" : "400px",
          paddingBottom: isMobile ? "50px" : "60px", // Space for legend
        }}
        viewBox={`0 -30 ${dimensions.width} ${dimensions.height + 30}`}
        preserveAspectRatio={isMobile ? "xMidYMid meet" : undefined}
        aria-labelledby="sankeyTitle"
      >
        <title id="sankeyTitle">
          Value Chains to Manufacturing Clusters Sankey Diagram
        </title>

        {/* Links */}
        {linkTransitions((styles, item) => {
          // Check if we're in a focused view (tree layout or cluster focus)
          const isFocusedView =
            focusedCluster !== null || focusedValueChain !== null;

          // Calculate RCA-based opacity for the link (only in main Sankey view)
          const linkRcaOpacity = isFocusedView
            ? 1
            : coloringMode === "Country Specific"
              ? getRCAOpacity((item as any).rca)
              : 0.8; // Global mode uses consistent opacity

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

          return (
            <animated.path
              key={item.id}
              style={{
                stroke: linkColor,
                fill: "none",
                strokeWidth: isConnectedToHovered && hasHoveredNode ? 3 : 2,
                opacity: to(
                  [(styles as any).opacity],
                  (animOpacity: number) =>
                    animOpacity * linkRcaOpacity * flowHighlightOpacity,
                ),
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
                    const midX = (sx + tx) / 2;
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

          // Calculate RCA-based opacity for cluster nodes in sankey mode (only when no node is selected)
          let nodeRcaOpacity = 1.0;
          if (
            !isFocusedView &&
            isCluster &&
            coloringMode === "Country Specific"
          ) {
            const nodeData = hierarchyData?.nodes.find((n) => n.id === item.id);
            if (nodeData && nodeData.rca !== undefined) {
              nodeRcaOpacity = getRCAOpacity(nodeData.rca);
            }
          }

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
                  cx={to([(styles as any).width], (width: number) => width / 2)}
                  cy={to(
                    [(styles as any).height],
                    (height: number) => height / 2,
                  )}
                  r={8}
                  fill={nodeColor}
                  stroke={isFocused || isHovered ? "#000000" : "transparent"}
                  strokeWidth={isFocused || isHovered ? 2 : 0}
                  style={{
                    opacity: to(
                      [(styles as any).opacity],
                      (animOpacity: number) =>
                        animOpacity * nodeHighlightOpacity * nodeRcaOpacity,
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
                  stroke={isFocused || isHovered ? "#000000" : "transparent"}
                  strokeWidth={isFocused || isHovered ? 2 : 0}
                  style={{
                    opacity: to(
                      [(styles as any).opacity],
                      (animOpacity: number) =>
                        animOpacity * nodeHighlightOpacity * nodeRcaOpacity,
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
                    return isValueChain && !focusedCluster && !focusedValueChain
                      ? "end"
                      : isCluster && focusedCluster
                        ? "middle"
                        : focusedValueChain && isValueChain
                          ? "end"
                          : "start";
                  })(),
                  fontSize: isMobile ? 10 : 12,
                  fontWeight: "normal",
                  fill: "#333333",
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
                  // Text opacity only uses animation and hover highlighting, not RCA
                  opacity: to(
                    [(styles as any).opacity],
                    (animOpacity: number) => {
                      // Hide text for unrelated nodes when hovering
                      if (hoveredNode && !isHovered && !isConnectedToHovered) {
                        return 0;
                      }
                      // Show text with only animation opacity and hover highlighting
                      return animOpacity * nodeHighlightOpacity;
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

        {/* Column Titles */}
        {!focusedCluster && !focusedValueChain && sankeyLayoutData && (
          <>
            {/* Value Chains Title - centered on value chain column */}
            <text
              x={(() => {
                // Find the bounds of value chain nodes
                const valueChainNodes = sankeyLayoutData.nodes.filter((n) =>
                  hierarchyData?.nodes.find(
                    (hn) => hn.id === n.name && hn.type === "value_chain",
                  ),
                );
                if (valueChainNodes.length > 0) {
                  const minX = Math.min(
                    ...valueChainNodes.map((n) => n.x0 ?? 0),
                  );
                  const maxX = Math.max(
                    ...valueChainNodes.map((n) => n.x1 ?? 0),
                  );
                  return (minX + maxX) / 2;
                }
                return leftMargin / 2;
              })()}
              y={0}
              textAnchor="middle"
              fontSize={isMobile ? 10 : 12}
              fontWeight="600"
              fill="#333333"
              style={{ pointerEvents: "none" }}
            >
              VALUE CHAINS
            </text>

            {/* Manufacturing Clusters Title - centered on cluster column */}
            <text
              x={(() => {
                // Find the bounds of cluster nodes
                const clusterNodes = sankeyLayoutData.nodes.filter((n) =>
                  hierarchyData?.nodes.find(
                    (hn) =>
                      hn.id === n.name && hn.type === "manufacturing_cluster",
                  ),
                );
                if (clusterNodes.length > 0) {
                  const minX = Math.min(...clusterNodes.map((n) => n.x0 ?? 0));
                  const maxX = Math.max(...clusterNodes.map((n) => n.x1 ?? 0));
                  return (minX + maxX) / 2;
                }
                return dimensions.width - rightMargin / 2;
              })()}
              y={0}
              textAnchor="middle"
              fontSize={isMobile ? 10 : 12}
              fontWeight="600"
              fill="#333333"
              style={{ pointerEvents: "none" }}
            >
              {isMobile ? "CLUSTERS" : "MANUFACTURING CLUSTERS"}
            </text>
          </>
        )}

        {/* Focus View Titles */}
        {(focusedCluster || focusedValueChain) && (
          <>
            {/* Value Chains Title - centered on actual value chain node positions */}
            <text
              x={(() => {
                // Find value chain nodes in focus view
                const valueChainNodes = nodePositions.filter(
                  (n) => n.type === "value_chain",
                );
                if (valueChainNodes.length > 0) {
                  const minX = Math.min(...valueChainNodes.map((n) => n.x));
                  const maxX = Math.max(
                    ...valueChainNodes.map((n) => n.x + n.width),
                  );
                  return (minX + maxX) / 2;
                }
                return leftMargin / 2;
              })()}
              y={0}
              textAnchor="middle"
              fontSize={isMobile ? 10 : 12}
              fontWeight="600"
              fill="#333333"
              style={{ pointerEvents: "none" }}
            >
              VALUE CHAINS
            </text>

            {/* Manufacturing Clusters Title - centered on actual cluster node positions */}
            <text
              x={(() => {
                // Find cluster nodes in focus view
                const clusterNodes = nodePositions.filter(
                  (n) => n.type === "manufacturing_cluster",
                );
                if (clusterNodes.length > 0) {
                  const minX = Math.min(...clusterNodes.map((n) => n.x));
                  const maxX = Math.max(
                    ...clusterNodes.map((n) => n.x + n.width),
                  );
                  return (minX + maxX) / 2;
                }
                return dimensions.width / 2;
              })()}
              y={0}
              textAnchor="middle"
              fontSize={isMobile ? 10 : 12}
              fontWeight="600"
              fill="#333333"
              style={{ pointerEvents: "none" }}
            >
              {isMobile ? "CLUSTERS" : "MANUFACTURING CLUSTERS"}
            </text>

            {/* Products Title - centered on actual product node positions */}
            <text
              x={(() => {
                // Find product nodes in focus view
                const productNodes = nodePositions.filter(
                  (n) => n.type === "product",
                );
                if (productNodes.length > 0) {
                  const minX = Math.min(...productNodes.map((n) => n.x));
                  const maxX = Math.max(
                    ...productNodes.map((n) => n.x + n.width),
                  );
                  return (minX + maxX) / 2;
                }
                return dimensions.width - rightMargin / 2;
              })()}
              y={0}
              textAnchor="middle"
              fontSize={isMobile ? 10 : 12}
              fontWeight="600"
              fill="#333333"
              style={{ pointerEvents: "none" }}
            >
              PRODUCTS
            </text>
          </>
        )}
      </svg>

      {/* Legend */}
      <Legend countrySelection={countrySelection} />
    </div>
  );
};

// Main export component with ParentSize wrapper
export default function SankeyTree() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ParentSize>
        {({ width, height }) => (
          <SankeyTreeInternal width={width} height={height} />
        )}
      </ParentSize>
    </div>
  );
}

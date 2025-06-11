import React, { useState, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@apollo/client";
import { animated, useTransition, config, to } from "@react-spring/web";
import { tree, hierarchy } from "d3-hierarchy";
import { useUrlParams } from "../../../hooks/useUrlParams";

// Local imports
import { GET_PRODUCTS, GET_CLUSTERS, GET_SUPPLY_CHAINS } from "./queries";
import { buildHierarchicalData, buildTreeDataForValueChain } from "./dataUtils";
import { applySankeyLayout, convertToPositions } from "./layoutUtils";
import {
  useProductMappings,
  useCountryData,
  useProductClusterRows,
} from "./hooks";
import Legend from "./Legend";

export default function SankeyTree() {
  // Get country selection from URL params
  const { countrySelection } = useUrlParams();

  // State
  const [focusedValueChain, setFocusedValueChain] = useState<string | null>(
    null,
  );
  const [focusedCluster, setFocusedCluster] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(
    new Set(),
  );

  const isAnimating = useRef(false);

  // Use fixed dimensions
  const dimensions = useMemo(() => ({ width: 1200, height: 750 }), []);
  const leftMargin = 150;
  const rightMargin = 250;

  // GraphQL queries
  const { data: productsData, loading: productsLoading } =
    useQuery(GET_PRODUCTS);
  const { data: clustersData, loading: clustersLoading } =
    useQuery(GET_CLUSTERS);
  const { data: supplyChainsData, loading: supplyChainsLoading } =
    useQuery(GET_SUPPLY_CHAINS);

  // Custom hooks
  const productMappings = useProductMappings(supplyChainsData);
  const { countryData, isCountryDataLoading } =
    useCountryData(countrySelection);
  const productClusterRows = useProductClusterRows(
    productsData,
    clustersData,
    supplyChainsData,
    productMappings,
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
  }, [sankeyLayoutData, hierarchyData, focusedValueChain, treeLayoutData]);

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
          const connected = new Set<string>();
          hierarchyData.links.forEach((link) => {
            if (link.source === nodeId) {
              connected.add(link.target);
            } else if (link.target === nodeId) {
              connected.add(link.source);
            }
          });
          setConnectedNodeIds(connected);
        }
      }
    },
    [focusedCluster, focusedValueChain, hierarchyData],
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setConnectedNodeIds(new Set());
  }, []);

  const handleBackClick = useCallback(() => {
    if (isAnimating.current) return;

    if (focusedCluster) {
      setFocusedCluster(null);
    } else if (focusedValueChain) {
      setFocusedValueChain(null);
    }
  }, [focusedCluster, focusedValueChain]);

  const handleClusterClick = useCallback((clusterName: string) => {
    if (isAnimating.current) return;
    setFocusedValueChain(null);
    setFocusedCluster(clusterName);
  }, []);

  const handleValueChainClick = useCallback((valueChainName: string) => {
    if (isAnimating.current) return;
    setFocusedCluster(null);
    setFocusedValueChain(valueChainName);
  }, []);

  const isLoading = productsLoading || clustersLoading || supplyChainsLoading;

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#1e1e1e",
          color: "white",
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
          backgroundColor: "#1e1e1e",
          color: "white",
        }}
      >
        Building visualization...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        width: "100%",
        height: "100vh",
        backgroundColor: "#1e1e1e",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Back button */}
      {(focusedCluster || focusedValueChain) && (
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={handleBackClick}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 15px",
              background: "transparent",
              color: "white",
              border: "1px solid white",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ← BACK
          </button>
        </div>
      )}

      {/* Headers */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>VALUE CHAINS</h2>
        <h2 style={{ margin: 0 }}>MANUFACTURING CLUSTERS</h2>
        {(focusedCluster || focusedValueChain) && (
          <h2 style={{ margin: 0 }}>PRODUCTS</h2>
        )}
      </div>

      {/* Loading indicator */}
      {isCountryDataLoading && (
        <div style={{ marginBottom: "20px" }}>
          <span style={{ color: "white" }}>Loading country data...</span>
        </div>
      )}

      {/* SVG Visualization */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        style={{ maxWidth: "100%" }}
        aria-labelledby="sankeyTitle"
      >
        <title id="sankeyTitle">
          Value Chains to Manufacturing Clusters Sankey Diagram
        </title>

        {/* Links */}
        {linkTransitions((styles, item) => (
          <animated.path
            key={item.id}
            style={{
              stroke: item.color,
              fill: "none",
              strokeWidth: 2,
              opacity: (styles as any).opacity,
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
                  const dx = tx - sx;
                  const cpDistance = dx * 0.4;
                  const cp1x = sx + cpDistance;
                  const cp1y = sy;
                  const cp2x = tx - cpDistance;
                  const cp2y = ty;
                  return `M${sx},${sy} C${cp1x},${cp1y} ${cp2x},${cp2y} ${tx},${ty}`;
                } else {
                  const midX = (sx + tx) / 2;
                  return `M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx},${ty}`;
                }
              },
            )}
          />
        ))}

        {/* Nodes */}
        {nodeTransitions((styles, item) => {
          const isValueChain = item.type === "value_chain";
          const isCluster = item.type === "manufacturing_cluster";
          const isProduct = item.type === "product";
          const isFocused =
            item.id === focusedCluster || item.id === focusedValueChain;
          const isHovered = item.id === hoveredNode;
          const isConnectedToHovered = connectedNodeIds.has(item.id);

          return (
            <animated.g
              key={item.id}
              style={{
                transform: to(
                  [(styles as any).x, (styles as any).y],
                  (x: number, y: number) => `translate(${x}px,${y}px)`,
                ),
                opacity: (styles as any).opacity,
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
                fill={isFocused || isHovered ? "#e63946" : item.color}
                stroke={isFocused || isHovered ? "white" : "transparent"}
                strokeWidth={isFocused || isHovered ? 2 : 0}
              />

              <animated.text
                x={to([(styles as any).width], (width: number) => {
                  if (isValueChain && !focusedCluster && !focusedValueChain)
                    return -12;
                  if (isCluster && focusedCluster) return width / 2;
                  if (focusedValueChain) {
                    return isValueChain ? -12 : width + 12;
                  }
                  return width + 12;
                })}
                y={to([(styles as any).height], (height: number) => height / 2)}
                style={{
                  textAnchor:
                    isValueChain && !focusedCluster && !focusedValueChain
                      ? "end"
                      : isCluster && focusedCluster
                        ? "middle"
                        : focusedValueChain && isValueChain
                          ? "end"
                          : "start",
                  fontSize: 14,
                  fontWeight:
                    isFocused || isHovered || isConnectedToHovered
                      ? "bold"
                      : "normal",
                  fill: isConnectedToHovered ? "#ffff00" : "white",
                  pointerEvents: "none",
                  dominantBaseline: "middle",
                }}
              >
                {item.label}
              </animated.text>
            </animated.g>
          );
        })}
      </svg>

      {/* Legend */}
      <Legend countrySelection={countrySelection} />
    </div>
  );
}

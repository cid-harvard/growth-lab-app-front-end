import React from "react";
import type * as d3 from "d3";
import type { Node } from "../loader";

interface SpaceVisualizationContentProps {
  nodes: Node[];
  fieldNames: {
    id: string;
    x: string;
    y: string;
    radius?: string;
    category?: string;
    metaId?: string;
    metaColor?: string;
  };
  showAllLinks: boolean;
  clusterColorMap: Map<string, string>;
  allLinks: { x1: number; y1: number; x2: number; y2: number }[];
  selectedNodeIds: string;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  radiusScale: (value: number) => number;
  onNodeMouseEnter: (node: Node, event: React.MouseEvent) => void;
  onNodeMouseLeave: () => void;
  metadata?: Array<{
    [key: string]: string | number | undefined;
  }>;
  categoryColorScale: d3.ScaleOrdinal<string, string>;
}

export const SpaceVisualizationContent: React.FC<SpaceVisualizationContentProps> =
  React.memo(
    ({
      nodes,
      fieldNames,
      showAllLinks,
      clusterColorMap,
      allLinks,
      selectedNodeIds,
      xScale,
      yScale,
      radiusScale,
      onNodeMouseEnter,
      onNodeMouseLeave,
      metadata,
      categoryColorScale,
    }) => {
      // Get list of selected node IDs
      const selectedNodeIdList = selectedNodeIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      // Function to get node color from metadata
      const getNodeColor = (node: Node) => {
        // First try default coloring method
        if (clusterColorMap.get(node.product_space_cluster_name)) {
          return clusterColorMap.get(node.product_space_cluster_name);
        }

        // Then try node.color property
        if (node.color) {
          return node.color;
        }

        // Then try custom metadata mapping
        if (
          metadata &&
          fieldNames.category &&
          fieldNames.metaId &&
          fieldNames.metaColor
        ) {
          const category = node[fieldNames.category];
          if (category) {
            const meta = metadata.find(
              (m) => String(m[fieldNames.metaId || ""]) === String(category),
            );
            if (meta && fieldNames.metaColor) {
              return String(meta[fieldNames.metaColor]);
            }
          }
        }

        // Last-ditch fallback: use D3 color scale based on category field
        if (fieldNames.category && node[fieldNames.category]) {
          return categoryColorScale(String(node[fieldNames.category]));
        }

        // Default fallback
        return "#999999";
      };

      return (
        <>
          {/* Render links */}
          {showAllLinks
            ? allLinks.map((link, i) => (
                <line
                  key={`link-${link.x1}-${link.y1}-${link.x2}-${link.y2}`}
                  x1={xScale(link.x1)}
                  y1={yScale(link.y1)}
                  x2={xScale(link.x2)}
                  y2={yScale(link.y2)}
                  stroke="grey"
                  strokeOpacity={0.2}
                  strokeWidth={1}
                  style={{ pointerEvents: "none" }}
                />
              ))
            : null}

          {/* Render nodes */}
          {nodes.map((node, i) => {
            const x = Number.parseFloat(String(node[fieldNames.x]));
            const y = Number.parseFloat(String(node[fieldNames.y]));
            if (Number.isNaN(x) || Number.isNaN(y)) return null;

            const nodeId = String(node[fieldNames.id]);
            const radius = fieldNames.radius
              ? (() => {
                  const radiusValue = node[fieldNames.radius];
                  return typeof radiusValue === "number"
                    ? radiusScale(radiusValue)
                    : radiusScale(Number.parseFloat(String(radiusValue)));
                })()
              : radiusScale(0);

            // Check if node is in selected list
            const isSelected =
              selectedNodeIdList.length === 0 ||
              selectedNodeIdList.includes(nodeId);

            return (
              <circle
                key={`node-${nodeId}`}
                cx={xScale(x)}
                cy={yScale(y)}
                r={radius}
                fill={getNodeColor(node)}
                stroke="grey"
                strokeWidth={1}
                style={{
                  cursor: "pointer",
                  pointerEvents: "auto",
                  opacity: isSelected ? 1 : 0.2,
                }}
                onMouseEnter={(e) => onNodeMouseEnter(node, e)}
                onMouseLeave={onNodeMouseLeave}
              />
            );
          })}
        </>
      );
    },
  );

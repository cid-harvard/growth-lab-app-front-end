import React from "react";
import * as d3 from "d3";
import type { Node } from "../loader";

interface SpaceVisualizationHighlightProps {
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
  clusterColorMap: Map<string, string>;
  allLinks: { x1: number; y1: number; x2: number; y2: number }[];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  radiusScale: (value: number) => number;
  highlightedNodeId?: string;
  metadata?: Array<{
    [key: string]: string | number | undefined;
  }>;
  categoryColorScale: d3.ScaleOrdinal<string, string>;
}

export const SpaceVisualizationHighlight: React.FC<SpaceVisualizationHighlightProps> =
  React.memo(
    ({
      nodes,
      fieldNames,
      clusterColorMap,
      allLinks,
      xScale,
      yScale,
      radiusScale,
      highlightedNodeId,
      metadata,
      categoryColorScale,
    }) => {
      if (!highlightedNodeId) return null;

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

      const highlightedNode = nodes.find(
        (node) => String(node[fieldNames.id]) === highlightedNodeId,
      );
      if (!highlightedNode) return null;
      const connectedLinks = allLinks.filter(
        (link) =>
          (xScale(link.x1) ===
            xScale(Number.parseFloat(String(highlightedNode[fieldNames.x]))) &&
            yScale(link.y1) ===
              yScale(
                Number.parseFloat(String(highlightedNode[fieldNames.y])),
              )) ||
          (xScale(link.x2) ===
            xScale(Number.parseFloat(String(highlightedNode[fieldNames.x]))) &&
            yScale(link.y2) ===
              yScale(Number.parseFloat(String(highlightedNode[fieldNames.y])))),
      );

      const connectedNodeIds = new Set<string>();
      for (const link of connectedLinks) {
        if (
          xScale(link.x1) ===
            xScale(Number.parseFloat(String(highlightedNode[fieldNames.x]))) &&
          yScale(link.y1) ===
            yScale(Number.parseFloat(String(highlightedNode[fieldNames.y])))
        ) {
          connectedNodeIds.add(`${link.x2},${link.y2}`);
        } else {
          connectedNodeIds.add(`${link.x1},${link.y1}`);
        }
      }

      const connectedNodes = nodes.filter((node) =>
        connectedNodeIds.has(
          `${Number.parseFloat(String(node[fieldNames.x]))},${Number.parseFloat(
            String(node[fieldNames.y]),
          )}`,
        ),
      );

      return (
        <g>
          {connectedLinks.map((link, i) => (
            <line
              key={`highlight-link-${i}`}
              x1={xScale(link.x1)}
              y1={yScale(link.y1)}
              x2={xScale(link.x2)}
              y2={yScale(link.y2)}
              stroke="grey"
              strokeOpacity={0.6}
              strokeWidth={2}
              style={{ pointerEvents: "none" }}
            />
          ))}
          {connectedNodes.map((node) => {
            const radius = fieldNames.radius
              ? (() => {
                  const radiusValue = node[fieldNames.radius];
                  return typeof radiusValue === "number"
                    ? radiusScale(radiusValue)
                    : radiusScale(Number.parseFloat(String(radiusValue)));
                })()
              : radiusScale(0);

            return (
              <circle
                key={`highlight-node-${node[fieldNames.id]}`}
                cx={xScale(Number.parseFloat(String(node[fieldNames.x])))}
                cy={yScale(Number.parseFloat(String(node[fieldNames.y])))}
                r={radius}
                fill={getNodeColor(node)}
                fillOpacity={0.6}
                stroke="grey"
                strokeWidth={2}
                style={{ pointerEvents: "none" }}
              />
            );
          })}

          {/* Draw highlighted node */}
          {(() => {
            const radius = fieldNames.radius
              ? (() => {
                  const radiusValue = highlightedNode[fieldNames.radius];
                  return typeof radiusValue === "number"
                    ? radiusScale(radiusValue)
                    : radiusScale(Number.parseFloat(String(radiusValue)));
                })()
              : radiusScale(0);

            return (
              <circle
                cx={xScale(
                  Number.parseFloat(String(highlightedNode[fieldNames.x])),
                )}
                cy={yScale(
                  Number.parseFloat(String(highlightedNode[fieldNames.y])),
                )}
                r={radius}
                fill={getNodeColor(highlightedNode)}
                fillOpacity={0.8}
                stroke="grey"
                strokeWidth={3}
                style={{ pointerEvents: "none" }}
              />
            );
          })()}
        </g>
      );
    },
  );

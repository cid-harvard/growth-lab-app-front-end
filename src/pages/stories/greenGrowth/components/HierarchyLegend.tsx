import React, { memo } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

interface HierarchyLegendProps {
  layoutMode: string;
}

const HierarchyLegend: React.FC<HierarchyLegendProps> = memo(
  ({ layoutMode }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // Responsive sizing
    const diagramWidth = 250;
    const diagramHeight = isMobile ? 100 : 120;
    const strokeWidth = isMobile ? 1.5 : 2;
    const fontSize = isMobile ? "12px" : "14px"; // Increased from 14px to 16px

    // Use the same layout structure for both modes - only difference is visibility of cluster layer
    const centerX = diagramHeight / 2;
    const centerY = diagramHeight / 2;
    const valueChainR = diagramHeight * 0.4;
    const clusterR = valueChainR * 0.5;
    const productR = clusterR * 0.3;

    // Position nested circles towards the bottom (same for both modes)
    const clusterCenterX = centerX;
    const clusterCenterY = centerY + valueChainR * 0.4;
    const productCenterX = clusterCenterX;
    const productCenterY = clusterCenterY + clusterR * 0.45;

    // Arrow start positions from the right edge of each circle
    const valueChainArrowStartX = centerX + valueChainR;
    const valueChainArrowStartY = centerY - valueChainR * 0.3;
    const clusterArrowStartX = clusterCenterX + clusterR - 3;
    const clusterArrowStartY = clusterCenterY - 12;
    const productArrowStartX = productCenterX + productR;
    const productArrowStartY = productCenterY;

    // Label positions with proper spacing to avoid overlap
    const labelStartX =
      Math.max(valueChainArrowStartX, clusterArrowStartX, productArrowStartX) +
      15;

    const showCluster = layoutMode === "clustered";
    const isClustersOnly = layoutMode === "clusters-only";

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <svg
          width={diagramWidth}
          height={diagramHeight}
          viewBox={`0 0 ${diagramWidth} ${diagramHeight}`}
          style={{ flexShrink: 0 }}
          aria-label={`Hierarchy diagram showing ${
            isClustersOnly
              ? "industrial cluster and product"
              : showCluster
                ? "value chain, industrial cluster, and product"
                : "value chain and product"
          } relationships`}
        >
          <title>
            {isClustersOnly
              ? "Hierarchy diagram showing industrial cluster and product relationships"
              : showCluster
                ? "Hierarchy diagram showing value chain, industrial cluster, and product relationships"
                : "Hierarchy diagram showing value chain and product relationships"}
          </title>
          {/* Arrows */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
            </marker>
          </defs>

          {/* Value Chain circle (outermost) - only show if not clusters-only */}
          {!isClustersOnly && (
            <circle
              cx={centerX}
              cy={centerY}
              r={valueChainR}
              fill="none"
              stroke="#000"
              strokeWidth={strokeWidth}
            />
          )}

          {/* Industrial Cluster circle (middle) - show in clustered mode or clusters-only mode */}
          {(showCluster || isClustersOnly) && (
            <circle
              cx={isClustersOnly ? centerX : clusterCenterX}
              cy={isClustersOnly ? centerY : clusterCenterY}
              r={isClustersOnly ? valueChainR : clusterR}
              fill="none"
              stroke="#000"
              strokeWidth={isClustersOnly ? strokeWidth : "1"}
            />
          )}

          {/* Product circle (innermost) - always show */}
          <circle
            cx={isClustersOnly ? clusterCenterX : productCenterX}
            cy={isClustersOnly ? clusterCenterY : productCenterY}
            r={productR}
            fill="grey"
            stroke="grey"
            strokeWidth={strokeWidth * 0.8}
          />

          {/* Arrow to Value Chain - only show if not clusters-only */}
          {!isClustersOnly && (
            <line
              x1={valueChainArrowStartX}
              y1={valueChainArrowStartY}
              x2={labelStartX}
              y2={valueChainArrowStartY}
              stroke="#000"
              strokeWidth={1}
              markerEnd="url(#arrowhead)"
            />
          )}

          {/* Arrow to Industrial Cluster - show in clustered mode or clusters-only mode */}
          {(showCluster || isClustersOnly) && (
            <line
              x1={isClustersOnly ? centerX + valueChainR : clusterArrowStartX}
              y1={
                isClustersOnly
                  ? centerY - valueChainR * 0.3
                  : clusterArrowStartY
              }
              x2={labelStartX}
              y2={
                isClustersOnly
                  ? centerY - valueChainR * 0.3
                  : clusterArrowStartY
              }
              stroke="#000"
              strokeWidth={1}
              markerEnd="url(#arrowhead)"
            />
          )}

          {/* Arrow to Product */}
          <line
            x1={productArrowStartX}
            y1={isClustersOnly ? clusterCenterY : productArrowStartY}
            x2={labelStartX}
            y2={isClustersOnly ? clusterCenterY : productArrowStartY}
            stroke="#000"
            strokeWidth={1}
            markerEnd="url(#arrowhead)"
          />

          {/* Value Chain Label - only show if not clusters-only */}
          {!isClustersOnly && (
            <text
              x={labelStartX + 5}
              y={valueChainArrowStartY + 4}
              fontSize={fontSize}
              fontWeight="500" // Increased from 500 to 600
              fill="#000"
            >
              Value Chain
            </text>
          )}

          {/* Industrial Cluster Label - show in clustered mode or clusters-only mode */}
          {(showCluster || isClustersOnly) && (
            <text
              x={labelStartX + 5}
              y={
                isClustersOnly
                  ? centerY - valueChainR * 0.3 + 4
                  : clusterArrowStartY + 4
              }
              fontSize={fontSize}
              fontWeight="500" // Increased from 500 to 600
              fill="#000"
            >
              Industrial Cluster
            </text>
          )}

          {/* Product Label */}
          <text
            x={labelStartX + 5}
            y={isClustersOnly ? clusterCenterY + 4 : productArrowStartY + 4}
            fontSize={fontSize}
            fontWeight="500" // Increased from 500 to 600
            fill="#000"
          >
            Product
          </text>
        </svg>
      </div>
    );
  },
);

export default HierarchyLegend;

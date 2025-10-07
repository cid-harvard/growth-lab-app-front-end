import type React from "react";
import { useMemo, useCallback, useRef, useEffect } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import {
  calculateClusterScores,
  createOrderedRowLayout,
  getPotentialColor,
} from "./utils";
import {
  CLUSTER_RANKING_SPACING,
  CLUSTER_RANKING_MAX_LABEL_CHARS,
  CLUSTER_RANKING_EDGE_PADDING,
  CLUSTER_RANKING_AXIS_SPACE,
} from "./config";

interface ClusterRankingProps {
  width: number;
  height: number;
  clusterData: any[];
  clusterLookup: Map<number, string>;
  countryData: any;
  supplyChainProductLookup: any;
  selectedCluster: string;
  onClusterSelect: (clusterName: string) => void;
  isMobile: boolean;
  minScore: number;
  maxScore: number;
}

// Cluster ranking component
const ClusterRanking: React.FC<ClusterRankingProps> = ({
  width,
  height,
  clusterData,
  clusterLookup,
  countryData,
  supplyChainProductLookup,
  selectedCluster,
  onClusterSelect,
  isMobile: _isMobile,
  minScore,
  maxScore,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Ensure the scroll starts at the far left so the first circle is visible
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, []);
  // Calculate cluster scores and create ordered row layout
  const { rankingData, contentWidth, maxLabelChars } = useMemo(() => {
    if (!clusterData || !clusterData.length)
      return {
        rankingData: [],
        contentWidth: width,
        maxLabelChars: 20,
      };

    const scoredClusters = calculateClusterScores(clusterData);

    // Add cluster names from lookup
    const clustersWithNames = scoredClusters.map((cluster) => ({
      ...cluster,
      clusterName:
        clusterLookup.get(cluster.clusterId) || `Cluster ${cluster.clusterId}`,
    }));

    // Use fixed spacing and label character limits from config
    const spacing = CLUSTER_RANKING_SPACING;
    const maxChars = CLUSTER_RANKING_MAX_LABEL_CHARS;

    // Prefer minimal padding so first circle starts near left; avoid extra right whitespace
    const baseEdgePadding = CLUSTER_RANKING_EDGE_PADDING;
    const count = clustersWithNames.length;
    const requiredWidth = (count - 1) * spacing + baseEdgePadding * 2;
    // Keep a fixed small edge padding; do not add extra left/right spacing
    const edgePadding = baseEdgePadding;
    // Use the minimum required width so content hugs the edges; avoids big side gaps
    const computedContentWidth = requiredWidth;

    const layoutData = createOrderedRowLayout(
      clustersWithNames,
      height - 40,
      countryData,
      supplyChainProductLookup,
      minScore,
      maxScore,
      edgePadding,
    );

    // Estimate max characters that fit into one label slot (very lightweight approx.)

    return {
      rankingData: layoutData,
      contentWidth: computedContentWidth,
      maxLabelChars: maxChars,
    };
  }, [
    clusterData,
    clusterLookup,
    countryData,
    supplyChainProductLookup,
    width,
    height,
    minScore,
    maxScore,
  ]);

  const handleClusterClick = useCallback(
    (clusterName: string) => {
      onClusterSelect(clusterName);
    },
    [onClusterSelect],
  );

  // Split total height between beeswarm area and legend to avoid overlap with the tree below
  const legendSvgHeight = 36; // must match legend rendering below
  const { beeswarmHeight, adjustedRankingData } = useMemo(() => {
    if (!rankingData.length) {
      const beeswarmHeight = Math.max(0, height - legendSvgHeight);
      return { beeswarmHeight, adjustedRankingData: [] };
    }

    // Ensure enough room for labels, but never exceed the allotted container height
    const axisSpace = CLUSTER_RANKING_AXIS_SPACE;
    const minBeeswarm = Math.max(60, 60 + axisSpace - legendSvgHeight);
    const beeswarmHeight = Math.max(minBeeswarm, height - legendSvgHeight);

    return { beeswarmHeight, adjustedRankingData: rankingData };
  }, [rankingData, height]);

  // When a cluster is selected (from dropdown or click), scroll to center it
  useEffect(() => {
    if (!scrollRef.current || !selectedCluster || !adjustedRankingData.length)
      return;

    const container = scrollRef.current;
    const containerWidth = container.clientWidth || 0;
    if (containerWidth <= 0) return;

    const targetItem = adjustedRankingData.find(
      (d: any) => d.name === selectedCluster,
    );
    if (!targetItem) return;

    const centerX = targetItem.x as number;
    const maxScrollLeft = Math.max(0, contentWidth - containerWidth);
    const desiredLeft = Math.max(
      0,
      Math.min(maxScrollLeft, centerX - containerWidth / 2),
    );

    try {
      container.scrollTo({ left: Math.round(desiredLeft), behavior: "smooth" });
    } catch {
      container.scrollLeft = Math.round(desiredLeft);
    }
  }, [selectedCluster, adjustedRankingData, contentWidth]);

  // Compute an axis baseline positioned close to the bubbles to minimize the gap
  const axisBaselineY = useMemo(() => {
    if (!adjustedRankingData.length) return beeswarmHeight - 10;
    const maxRadius = Math.max(
      ...adjustedRankingData.map((d: any) => d.radius),
    );
    const centerY = adjustedRankingData[0].y;
    // Place baseline just below the largest bubble with a small margin
    return centerY + maxRadius + 6;
  }, [adjustedRankingData, beeswarmHeight]);

  // Removed left-aligned axis title; legend will be rendered below the scrollable area

  return (
    <>
      <Typography
        variant="h6"
        sx={{ mb: 1, fontWeight: 600, fontSize: 18, pt: 1, pl: 2 }}
      >
        Industrial Clusters
      </Typography>
      <Box
        ref={scrollRef}
        sx={{
          width: "100%",
          height: beeswarmHeight,
          overflowX: "scroll",
          overflowY: "hidden",
          scrollbarGutter: "stable",
          pb: 2, // space for horizontal scrollbar
          pl: 2,
        }}
      >
        <svg
          width={contentWidth}
          height="100%"
          viewBox={`0 0 ${contentWidth} ${beeswarmHeight + 3}`}
          preserveAspectRatio="xMinYMid meet"
          role="img"
          aria-label="Cluster ranking visualization"
          style={{ display: "block" }}
        >
          <defs>
            <filter id="cluster-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Gradient definitions */}
          <defs>
            {/* Linear gradient for potential color scale (red → white → blue) */}
            <linearGradient
              id="potential-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              {(() => {
                const stops = [0, 0.25, 0.5, 0.75, 1];
                const range = maxScore - minScore || 1;
                return stops.map((t) => {
                  // Reverse the mapping: t=0 should get maxScore (blue), t=1 should get minScore (red)
                  const v = maxScore - t * range;
                  const color = getPotentialColor(v, minScore, maxScore);
                  return (
                    <stop
                      key={t}
                      offset={`${t * 100}%`}
                      stopColor={color as any}
                    />
                  );
                });
              })()}
            </linearGradient>
          </defs>

          {/* Legend removed from inside scrollable SVG; rendered below */}

          {/* Tick marks and cluster name labels */}
          {adjustedRankingData.map((item) => (
            <Tooltip
              key={`rank-${item.rank}-label`}
              title={item.name}
              arrow
              slotProps={{
                tooltip: { sx: { bgcolor: "#ffffff", color: "#000000" } },
                arrow: { sx: { color: "#ffffff" } },
              }}
            >
              <g>
                {/* Tick mark */}
                <line
                  x1={item.x}
                  y1={axisBaselineY}
                  x2={item.x}
                  y2={axisBaselineY + 7}
                  stroke="#666"
                  strokeWidth="1"
                />
                {/* Cluster name (truncated) */}
                <text
                  x={item.x}
                  y={axisBaselineY + 20}
                  fontSize={14}
                  fill="#000"
                  textAnchor="middle"
                  fontFamily="Source Sans Pro, sans-serif"
                  fontWeight={400}
                >
                  {(() => {
                    const name = item.name || "";
                    if (name.length <= maxLabelChars) return name;
                    return `${name.slice(0, Math.max(0, maxLabelChars - 1))}\u2026`;
                  })()}
                </text>
              </g>
            </Tooltip>
          ))}

          {/* Axis title moved under the legend (centered) */}

          {/* Render clusters */}
          {adjustedRankingData.map((item) => {
            const isSelected = selectedCluster === item.name;

            return (
              <Tooltip
                key={`circle-${item.id}`}
                title={item.name}
                arrow
                slotProps={{
                  tooltip: { sx: { bgcolor: "#ffffff", color: "#000000" } },
                  arrow: { sx: { color: "#ffffff" } },
                }}
              >
                <g>
                  {/* Cluster circle */}
                  <circle
                    cx={item.x}
                    cy={item.y}
                    r={item.radius}
                    fill={item.color}
                    stroke={isSelected ? "#000000" : "rgba(0, 0, 0, 0.3)"}
                    strokeWidth={isSelected ? 2.5 : 1}
                    filter={isSelected ? "url(#cluster-glow)" : undefined}
                    style={{
                      cursor: "pointer",
                      opacity: 0.8,
                    }}
                    onClick={() => handleClusterClick(item.name)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleClusterClick(item.name);
                      }
                    }}
                    aria-label={`Select cluster ${item.name} ranked ${item.rank} with opportunity score ${item.score.toFixed(3)} and export value $${(item.exportValue / 1e6).toFixed(1)}M`}
                  />
                </g>
              </Tooltip>
            );
          })}
        </svg>
      </Box>
      {/* Fixed legend below the scrollable area */}
      {adjustedRankingData.length > 0 && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 0,
            height: legendSvgHeight,
          }}
        >
          {(() => {
            const scaleWidth = Math.min(width * 0.6, 560);
            const scaleHeight = 12;
            const marginX = 16;
            // Extra side padding to ensure text labels are not clipped
            const sideLabelPadding = 120; // px on each side
            // Compact height with no title
            const svgHeight = legendSvgHeight;
            const gradientY = 12;
            const labelsY = gradientY + scaleHeight / 2 + 5; // vertically aligned with gradient
            return (
              <svg
                width={scaleWidth + marginX * 2 + sideLabelPadding * 2}
                height={svgHeight}
                viewBox={`0 0 ${scaleWidth + marginX * 2 + sideLabelPadding * 2} ${svgHeight}`}
                role="img"
                aria-label="Potential color legend"
                style={{ display: "block" }}
              >
                <defs>
                  <linearGradient
                    id="potential-gradient-legend"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    {(() => {
                      const stops = [0, 0.25, 0.5, 0.75, 1];
                      const range = maxScore - minScore || 1;
                      return stops.map((t) => {
                        const v = maxScore - t * range;
                        const color = getPotentialColor(v, minScore, maxScore);
                        return (
                          <stop
                            key={t}
                            offset={`${t * 100}%`}
                            stopColor={color as any}
                          />
                        );
                      });
                    })()}
                  </linearGradient>
                </defs>
                <rect
                  x={marginX + sideLabelPadding}
                  y={gradientY}
                  width={scaleWidth}
                  height={scaleHeight}
                  fill="url(#potential-gradient-legend)"
                  stroke="#ccc"
                  rx={3}
                  ry={3}
                />
                <text
                  x={marginX + sideLabelPadding - 10}
                  y={labelsY}
                  fontSize={16}
                  fill="#000"
                  textAnchor="end"
                  fontFamily="Source Sans Pro, sans-serif"
                  fontWeight={600}
                >
                  High Potential
                </text>
                <text
                  x={marginX + sideLabelPadding + scaleWidth + 10}
                  y={labelsY}
                  fontSize={16}
                  fill="#000"
                  textAnchor="start"
                  fontFamily="Source Sans Pro, sans-serif"
                  fontWeight={600}
                >
                  Low Potential
                </text>
              </svg>
            );
          })()}
        </Box>
      )}
    </>
  );
};

export default ClusterRanking;

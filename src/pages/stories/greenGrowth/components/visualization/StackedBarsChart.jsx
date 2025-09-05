import React, { useState, useRef, useMemo } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import { ParentSize } from "@visx/responsive";
import { useTooltip, TooltipWithBounds } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { AxisBottom } from "@visx/axis";
import { scaleLinear } from "@visx/scale";
import { index } from "d3-array";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { VisualizationLoading, SharedTooltip } from "../shared";
import { useImageCaptureContext } from "../../hooks/useImageCaptureContext";
import html2canvas from "html2canvas";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";

// Formatter for currency values
export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  compactDisplay: "short",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// Chart margins - defined outside component to avoid dependency issues
const margin = {
  top: 20,
  bottom: 0,
  left: 60,
  right: 80,
};

// Internal component that receives dimensions from ParentSize
const StackedBarsChartInternal = ({ year, countryId, width, height }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Add ref for SVG
  const svgRef = useRef(null);

  // Image capture functionality
  const chartContainerRef = useRef(null);
  const { registerCaptureFunction, unregisterCaptureFunction } =
    useImageCaptureContext();

  // Use visx tooltip with bounds detection
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  // State for controls - simplified to just show all clusters
  const [showAllClusters, setShowAllClusters] = useState(false);

  // Fixed values for removed controls - always use clusters sorted by difference in descending order

  // Data fetching hooks
  const { countryData, clustersData, isLoading } = useGreenGrowthData(
    Number.parseInt(countryId),
    Number.parseInt(year),
  );
  const supplyChainProductLookup = useSupplyChainProductLookup();

  // Create cluster lookup from shared data
  const clusterLookup = useMemo(() => {
    if (!clustersData?.ggClusterList) return new Map();
    return new Map(
      clustersData.ggClusterList.map((c) => [c.clusterId, c.clusterName]),
    );
  }, [clustersData]);

  // Extract data for compatibility
  const currentData = useMemo(() => {
    if (!countryData?.productData) return null;
    return { ggCpyList: countryData.productData };
  }, [countryData]);

  // Only show loading if we have no data to work with
  const loading = isLoading && !currentData;

  // Calculate dimensions responsively
  const titleHeight = 60;
  // Legend removed – reclaim its space for the chart area
  const legendHeight = 0;
  const stickyAxisHeight = 60;

  const availableHeight =
    height - titleHeight - legendHeight - stickyAxisHeight;

  // Responsive bar sizing
  const minBarHeight = 24;
  const maxBarHeight = 48;
  const barPadding = 12;

  // We'll calculate maxBarsToFit inside useMemo after determining the actual bar height

  // Bar calculation logic (moved from useStackedBars hook)
  const { bars, expectedOverlays, groups, xScale, actualBarHeight } =
    useMemo(() => {
      if (!currentData?.ggCpyList || !width || !height)
        return {
          bars: new Map(),
          expectedOverlays: [],
          groups: [],
          xScale: null,
          actualBarHeight: minBarHeight,
        };

      const ggCpyList = currentData.ggCpyList;
      const chartWidth = width - margin.left - margin.right;

      // Process data - always use clusters
      const processedData = [];
      const clusterToProducts = new Map();

      // Group products by cluster using mappings
      for (const product of ggCpyList) {
        const supplyChains =
          supplyChainProductLookup.get(product.productId) || [];
        const clusterIds = new Set(
          supplyChains.map((sc) => sc.clusterId).filter((id) => id != null),
        );

        for (const clusterId of clusterIds) {
          if (!clusterToProducts.has(clusterId)) {
            clusterToProducts.set(clusterId, []);
          }
          clusterToProducts.get(clusterId).push(product);
        }
      }

      for (const [clusterId, products] of clusterToProducts) {
        const clusterName = clusterLookup.get(clusterId);
        if (!clusterName) continue;

        let totalActual = 0;
        let totalExpected = 0;

        // Calculate totals for the cluster
        products.forEach((product) => {
          const exportValue = Number.parseFloat(product.exportValue) || 0;
          const expectedExports =
            Number.parseFloat(product.expectedExports) || 0;

          if (exportValue > 0) {
            totalActual += exportValue;
            totalExpected += expectedExports;
          }
        });

        if (totalActual > 0) {
          // Calculate total difference and ratio
          const totalDifference = totalActual - totalExpected;
          const ratio = totalExpected > 0 ? totalActual / totalExpected : 1;

          processedData.push({
            groupId: clusterId,
            groupName: clusterName,
            actualProduction: totalActual,
            expectedProduction: totalExpected,
            difference: totalDifference,
            ratio: ratio,
            parentId: clusterId,
          });
        }
      }

      // Always sort by difference for consistent ordering across scale types
      const sortedData = processedData.sort((a, b) => {
        return b.difference - a.difference;
      });

      // Calculate optimal bar height for responsive layout
      // Always use the total number of clusters (sortedData.length) to calculate bar height
      // This ensures consistent smaller bar height regardless of how many bars are actually displayed
      let actualBarHeight = minBarHeight;
      if (availableHeight > 0 && sortedData.length > 0) {
        // Calculate how much space each bar should take based on ALL clusters, not just displayed ones
        const optimalBarHeight = Math.floor(
          (availableHeight - (sortedData.length - 1) * barPadding) /
            sortedData.length,
        );

        // Constrain to our min/max bounds
        actualBarHeight = Math.max(
          minBarHeight,
          Math.min(maxBarHeight, optimalBarHeight),
        );
      }

      // Calculate exactly how many bars can fit with the fixed smaller bar height and padding
      const maxBarsToFit = Math.max(
        1,
        Math.floor(availableHeight / (actualBarHeight + barPadding)),
      );

      // Filter data based on showAllClusters
      let filteredData = sortedData;

      if (!showAllClusters) {
        // Show equal number from top and bottom of the distribution
        // This gives a balanced view of best and worst performers regardless of +/- values
        const halfBars = Math.floor(maxBarsToFit / 2);
        const topPerformers = sortedData.slice(0, halfBars);
        const bottomPerformers = sortedData.slice(-halfBars);

        // Combine and sort by difference (descending) to maintain consistent ordering
        filteredData = [...topPerformers, ...bottomPerformers].sort(
          (a, b) => b.difference - a.difference,
        );

        // If we have an odd number of bars and there are enough clusters, add one more from the top
        const remaining = maxBarsToFit - filteredData.length;
        if (remaining > 0 && sortedData.length > filteredData.length) {
          const additionalTop = sortedData.slice(
            halfBars,
            halfBars + remaining,
          );
          filteredData = [
            ...topPerformers,
            ...additionalTop,
            ...bottomPerformers,
          ].sort((a, b) => b.difference - a.difference);
        }
      }

      // Create linear scale based on differences
      // Calculate scale domain to handle positive and negative differences
      const maxPositiveDifference = Math.max(
        ...filteredData.map((d) => Math.max(0, d.difference)),
        0,
      );
      const maxNegativeDifference = Math.min(
        ...filteredData.map((d) => Math.min(0, d.difference)),
        0,
      );
      const maxAbsoluteDifference = Math.max(
        maxPositiveDifference,
        Math.abs(maxNegativeDifference),
      );

      // Use linear scale
      const xScale = scaleLinear()
        .domain([-maxAbsoluteDifference, maxAbsoluteDifference])
        .range([0, chartWidth]);

      const result = [];
      const expectedPositions = [];

      filteredData.forEach((group, groupIndex) => {
        // Use fixed spacing with the smaller bar height
        const y = margin.top + groupIndex * (actualBarHeight + barPadding);

        // For linear scale, use differences centered around 0
        const zeroPoint = margin.left + xScale(0);
        const difference = group.difference;
        const barWidth = Math.abs(xScale(difference) - xScale(0));
        const x = difference >= 0 ? zeroPoint : zeroPoint - barWidth;
        const fill = difference >= 0 ? "#268fbd" : "#f1b47d"; // Blue for overperforming, orange for underperforming
        const value = difference;

        result.push({
          id: `bar-${group.parentId}`,
          parentId: group.parentId,
          coords: [
            [x, y],
            [x + barWidth, y],
            [x + barWidth, y + actualBarHeight],
            [x, y + actualBarHeight],
          ],
          x: x,
          y: y,
          width: barWidth,
          height: actualBarHeight,
          fill: fill,
          stroke: "#fff",
          strokeWidth: 1,
          strokeOpacity: 1,
          exportValue: group.actualProduction,
          expectedExports: group.expectedProduction,
          difference: group.difference,
          ratio: group.ratio,
          title: group.groupName,
          value: value,
          parent: {
            clusterId: group.groupId,
            clusterName: group.groupName,
          },
          data: {
            group: {
              name: group.groupName,
              difference: group.difference,
              ratio: group.ratio,
              actual: group.actualProduction,
              expected: group.expectedProduction,
            },
          },
        });
      });

      // Baseline reference line that spans from the first row all the way to the x-axis
      const baselineValue = 0; // 0 for linear scale
      const baselinePoint = margin.left + xScale(baselineValue);
      const firstRowY = margin.top;
      // When not showing all clusters, extend the line to the bottom of the scrollable area
      const lastRowY = showAllClusters
        ? margin.top +
          (filteredData.length - 1) * (actualBarHeight + barPadding) +
          actualBarHeight
        : margin.top + availableHeight;

      expectedPositions.push({
        id: "baseline",
        coords: [
          [baselinePoint, firstRowY],
          [baselinePoint, lastRowY],
        ],
        strokeWidth: 2,
      });

      const bars = index(
        result.filter(
          (d) =>
            !d?.coords?.flat()?.flat()?.includes(Number.NaN) &&
            !d.id.includes("undefined"),
        ),
        (d) => d.id,
      );

      return {
        bars: bars,
        expectedOverlays: expectedPositions,
        groups: filteredData,
        xScale: xScale,
        actualBarHeight: actualBarHeight,
      };
    }, [
      currentData,
      width,
      height,
      showAllClusters,
      availableHeight,
      supplyChainProductLookup,
      clusterLookup,
    ]);

  // Calculate chart height based on whether we're showing all clusters or not
  const chartHeight = showAllClusters
    ? // When showing all clusters, calculate actual height needed (enables scrolling)
      groups.length * (actualBarHeight + barPadding) -
      barPadding +
      margin.top +
      margin.bottom
    : // When showing subset, use available height (no scrolling needed)
      availableHeight + margin.top + margin.bottom;

  // Register/unregister image capture function
  React.useEffect(() => {
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
            a.download = `stacked_bars_${countryId}_${year}_clusters_difference.png`;
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
  }, [registerCaptureFunction, unregisterCaptureFunction, countryId, year]);

  if (loading || !xScale) {
    return <VisualizationLoading />;
  }

  // Tooltip definition for the "Expected" x-axis label
  const expectedDefinition =
    "indicates the level of exports a country would have if it exported goods in the same proportion as its overall share of global trade. This is calculated using an RCA (Revealed Comparative Advantage) index value of 1, also known as the Balassa index.";

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Source Sans Pro, sans-serif",
      }}
    >
      {/* Chart Section */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          p: 0,
          m: 0,
        }}
        ref={chartContainerRef}
      >
        {/* Title Section */}
        <Box
          sx={{
            position: "relative",
            height: titleHeight,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            px: 2,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <Typography variant="chart-title">
            Competitiveness in Green Manufacturing Clusters
          </Typography>
        </Box>

        {/* Scrollable Chart Area */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            // In condensed view we do not want scroll; allow a bit more height to
            // accommodate the internal top margin
            overflow: showAllClusters ? "auto" : "hidden",
            height: showAllClusters
              ? availableHeight
              : availableHeight + margin.top,
            borderRadius: "4px 4px 0 0",
            m: 0,
            p: 0,
            position: "relative",
            // Custom scrollbar styling
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: "4px",
              "&:hover": {
                background: "#a8a8a8",
              },
            },
          }}
        >
          <svg
            ref={svgRef}
            width={width - 10}
            height={chartHeight - margin.bottom} // Remove bottom margin from scrollable area
            style={{
              display: "block",
            }}
            role="img"
            aria-label="Competitiveness in Green Manufacturing Clusters"
            aria-describedby="stacked-bars-desc"
          >
            <desc id="stacked-bars-desc">
              Bar chart of clusters showing export value versus expected export
              value; difference indicates performance relative to expectation.
            </desc>
            {/* Background area for overperforming clusters only */}
            {xScale &&
              groups.length > 0 &&
              (() => {
                // Find the extent of positive (overperforming) bars
                const positiveBars = Array.from(bars.values()).filter(
                  (bar) => bar.difference >= 0,
                );

                if (positiveBars.length === 0) return null;

                // Calculate the vertical area that contains overperforming clusters
                const topY = Math.min(...positiveBars.map((bar) => bar.y));
                const bottomY = Math.max(
                  ...positiveBars.map((bar) => bar.y + bar.height),
                );

                return (
                  <rect
                    x={0}
                    y={topY}
                    width={width - 10}
                    height={bottomY - topY}
                    fill="#F3F3F3"
                    fillOpacity={1}
                  />
                );
              })()}

            {/* Vertical grid lines */}
            {xScale && (
              <g>
                {xScale.ticks(isMobile ? 5 : 8).map((tick) => {
                  const x = margin.left + xScale(tick);
                  const firstRowY = margin.top;
                  const lastRowY = showAllClusters
                    ? margin.top +
                      (groups.length - 1) * (actualBarHeight + barPadding) +
                      actualBarHeight
                    : margin.top + availableHeight;

                  return (
                    <line
                      key={`grid-${tick}`}
                      x1={x}
                      y1={firstRowY}
                      x2={x}
                      y2={lastRowY}
                      stroke="rgb(223,223,223)"
                      strokeWidth={1}
                    />
                  );
                })}
              </g>
            )}

            {/* Row background rectangles for hover interaction */}
            {groups.map((group, index) => {
              const y = margin.top + index * (actualBarHeight + barPadding);

              return (
                <rect
                  key={`row-bg-${group.groupId}`}
                  x={0}
                  y={y}
                  width={width - 10}
                  height={actualBarHeight}
                  fill="transparent"
                  className="row-hover-bg"
                  data-row-id={`row-bg-${group.parentId}`}
                />
              );
            })}

            {/* Chart bars with expanded hover areas */}
            {Array.from(bars.values()).map((bar) => {
              const rowIndex = groups.findIndex(
                (g) => g.parentId === bar.parentId,
              );
              const rowY =
                margin.top + rowIndex * (actualBarHeight + barPadding);

              return (
                <g key={`bar-group-${bar.id}`}>
                  {/* Invisible full-width hover area */}
                  <rect
                    x={0}
                    y={rowY}
                    width={width - 10}
                    height={actualBarHeight}
                    fill="transparent"
                    // purely decorative/invisible hover catcher; not focusable
                    onPointerEnter={(event) => {
                      // Use the chart container ref for more accurate positioning with scrolling
                      const coords = localPoint(
                        chartContainerRef.current ||
                          event.target.ownerSVGElement,
                        event,
                      );
                      if (coords) {
                        showTooltip({
                          tooltipLeft: coords.x,
                          tooltipTop: coords.y,
                          tooltipData: bar,
                        });
                      }
                      // Highlight the row
                      const rowBg = svgRef.current?.querySelector(
                        `[data-row-id="row-bg-${bar.parentId}"]`,
                      );
                      if (rowBg) {
                        rowBg.style.fill = "rgba(0, 0, 0, 0.03)";
                      }
                    }}
                    onPointerMove={(event) => {
                      // Use the chart container ref for more accurate positioning with scrolling
                      const coords = localPoint(
                        chartContainerRef.current ||
                          event.target.ownerSVGElement,
                        event,
                      );
                      if (coords) {
                        showTooltip({
                          tooltipLeft: coords.x,
                          tooltipTop: coords.y,
                          tooltipData: bar,
                        });
                      }
                    }}
                    onPointerLeave={() => {
                      hideTooltip();
                      // Remove row highlight
                      const rowBg = svgRef.current?.querySelector(
                        `[data-row-id="row-bg-${bar.parentId}"]`,
                      );
                      if (rowBg) {
                        rowBg.style.fill = "transparent";
                      }
                    }}
                  />

                  {/* Actual bar */}
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    fill={bar.fill}
                    stroke={bar.stroke}
                    strokeWidth={bar.strokeWidth}
                    strokeOpacity={bar.strokeOpacity}
                    style={{ pointerEvents: "none" }}
                  />
                </g>
              );
            })}

            {/* Expected overlay (single zero line) */}
            {expectedOverlays.length > 0 && (
              <rect
                x={expectedOverlays[0].coords[0][0] - 1}
                y={expectedOverlays[0].coords[0][1]}
                width={2}
                height={
                  expectedOverlays[0].coords[1][1] -
                  expectedOverlays[0].coords[0][1]
                }
                fill="rgb(51,51,51)"
                fillOpacity={1}
              />
            )}

            {/* Vertical axis annotations - positioned based on actual data */}
            {groups.length > 0 &&
              Array.from(bars.values()).length > 0 &&
              (() => {
                // Find the boundaries between positive and negative performers
                const positiveBars = Array.from(bars.values()).filter(
                  (bar) => bar.difference >= 0,
                );
                const negativeBars = Array.from(bars.values()).filter(
                  (bar) => bar.difference < 0,
                );

                // Calculate positions based on actual data distribution
                let outperformingPosition = null;
                let underperformingPosition = null;

                if (positiveBars.length > 0) {
                  // Position outperforming arrow in the center of the positive bars area
                  const firstPositiveY = Math.min(
                    ...positiveBars.map((bar) => bar.y),
                  );
                  const lastPositiveY = Math.max(
                    ...positiveBars.map((bar) => bar.y + bar.height),
                  );
                  outperformingPosition = (firstPositiveY + lastPositiveY) / 2;
                }

                if (negativeBars.length > 0) {
                  // Position underperforming arrow in the center of the negative bars area
                  const firstNegativeY = Math.min(
                    ...negativeBars.map((bar) => bar.y),
                  );
                  const lastNegativeY = Math.max(
                    ...negativeBars.map((bar) => bar.y + bar.height),
                  );
                  underperformingPosition =
                    (firstNegativeY + lastNegativeY) / 2;
                }

                // Clamp positions to keep annotations within the visible SVG area
                // Arrow extends ~50px from center in the vertical direction (line + triangle)
                const arrowHalfHeight = 121;
                const svgTopBound = arrowHalfHeight;
                const svgBottomBound =
                  chartHeight - margin.bottom - arrowHalfHeight;

                if (outperformingPosition != null) {
                  // Ensure it doesn't go off the top/bottom of the page
                  outperformingPosition = Math.min(
                    svgBottomBound,
                    Math.max(svgTopBound, outperformingPosition),
                  );
                }

                if (underperformingPosition != null) {
                  underperformingPosition = Math.min(
                    svgBottomBound,
                    Math.max(svgTopBound, underperformingPosition),
                  );
                }

                return (
                  <g>
                    {/* Outperforming Clusters arrow and label */}
                    {outperformingPosition && (
                      <g transform={`translate(40, ${outperformingPosition})`}>
                        <text
                          x={0}
                          y={0}
                          fontSize={18}
                          fontFamily="Source Sans Pro, sans-serif"
                          fontWeight={600}
                          fill="#268fbd"
                          textAnchor="middle"
                          transform="rotate(-90)"
                        >
                          Outperforming Clusters
                        </text>
                        <line
                          x1={15}
                          y1={-40}
                          x2={15}
                          y2={40}
                          stroke="#268fbd"
                          strokeWidth={2}
                        />
                        <polygon points="10,-40 15,-50 20,-40" fill="#268fbd" />
                      </g>
                    )}

                    {/* Underperforming Clusters arrow and label */}
                    {underperformingPosition && (
                      <g
                        transform={`translate(40, ${underperformingPosition})`}
                      >
                        <text
                          x={0}
                          y={0}
                          fontSize={18}
                          fontFamily="Source Sans Pro, sans-serif"
                          fontWeight={600}
                          fill="#f1b47d"
                          textAnchor="middle"
                          transform="rotate(-90)"
                        >
                          Underperforming Clusters
                        </text>
                        <line
                          x1={15}
                          y1={-40}
                          x2={15}
                          y2={40}
                          stroke="#f1b47d"
                          strokeWidth={2}
                        />
                        <polygon points="10,40 15,50 20,40" fill="#f1b47d" />
                      </g>
                    )}
                  </g>
                );
              })()}

            {/* Smart cluster name labels - rendered last to appear on top */}
            {Array.from(bars.values()).map((bar) => {
              const isPositive = bar.difference >= 0;
              const yPosition = bar.y + bar.height / 2;
              const fontSize = 16; // Fixed 16px as per spec
              const charWidth = fontSize * 0.52;

              // Position labels at the start of bars instead of the end
              const outsideLabelX = isPositive
                ? bar.x - 12 // For positive bars, position to the left of the start
                : bar.x + bar.width + 12; // For negative bars, position to the right of the end
              const outsideAvailableSpace = isPositive
                ? bar.x - margin.left // Space from left margin to bar start
                : width - margin.right - (bar.x + bar.width); // Space from bar end to right margin

              // Calculate minimum space needed for readable text
              const minReadableChars = 15; // Minimum characters for readable text
              const minSpaceNeeded = minReadableChars * charWidth;

              // Only move text inside if there's not enough room outside AND bar is wide enough
              const needsInsidePositioning =
                outsideAvailableSpace < minSpaceNeeded &&
                bar.width > minSpaceNeeded;

              let labelX, textAnchor, textColor, availableSpace, maxChars;

              if (needsInsidePositioning) {
                // Position text inside the bar, near the start
                if (isPositive) {
                  labelX = bar.x + 12; // 12px from the start
                  textAnchor = "start";
                } else {
                  labelX = bar.x + bar.width - 12; // 12px from the end
                  textAnchor = "end";
                }
                textColor = "white"; // White text for contrast on colored bars
                availableSpace = bar.width - 24; // Account for padding on both sides
              } else {
                // Position text outside the bar at the start (preferred)
                labelX = outsideLabelX;
                textAnchor = isPositive ? "end" : "start"; // Swapped to align properly with new positioning
                textColor = "black"; // Black text for outside labels as per spec
                availableSpace = outsideAvailableSpace;
              }

              maxChars = Math.floor(Math.max(0, availableSpace / charWidth));

              // Truncate only if necessary
              const truncatedText =
                bar.title.length > maxChars && maxChars > 8
                  ? bar.title.substring(0, Math.max(8, maxChars - 3)) + "..."
                  : bar.title;

              return (
                <text
                  key={`bar-label-${bar.id}`}
                  x={labelX}
                  y={yPosition}
                  fontSize={fontSize}
                  fontFamily="Source Sans Pro, sans-serif"
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  fill={textColor}
                  fontWeight="600" // 600 weight as per spec
                  stroke={needsInsidePositioning ? "rgba(0,0,0,0.3)" : "none"}
                  strokeWidth={needsInsidePositioning ? "0.5" : "0"}
                  style={{ pointerEvents: "none" }}
                >
                  {truncatedText}
                </text>
              );
            })}
          </svg>
          {/* Show All Button - positioned at the boundary between over/underperforming clusters (scroll-aware) */}
          <Box
            sx={{
              position: "absolute",
              right: 16,
              top: (() => {
                const positiveBars = Array.from(bars.values()).filter(
                  (bar) => bar.difference >= 0,
                );
                const negativeBars = Array.from(bars.values()).filter(
                  (bar) => bar.difference < 0,
                );

                let boundaryY = (chartHeight - margin.bottom) / 2; // fallback to center of scroll content

                if (positiveBars.length > 0 && negativeBars.length > 0) {
                  const lastPositiveY = Math.max(
                    ...positiveBars.map((bar) => bar.y + bar.height),
                  );
                  const firstNegativeY = Math.min(
                    ...negativeBars.map((bar) => bar.y),
                  );
                  boundaryY = (lastPositiveY + firstNegativeY) / 2;
                } else if (positiveBars.length > 0) {
                  const lastPositiveY = Math.max(
                    ...positiveBars.map((bar) => bar.y + bar.height),
                  );
                  boundaryY = lastPositiveY;
                } else if (negativeBars.length > 0) {
                  const firstNegativeY = Math.min(
                    ...negativeBars.map((bar) => bar.y),
                  );
                  boundaryY = firstNegativeY;
                }

                return boundaryY;
              })(),
              transform: "translateY(-50%)",
              zIndex: 10,
              pointerEvents: "none", // Allow clicking through the container
            }}
          >
            {(() => {
              const positiveBars = Array.from(bars.values()).filter(
                (bar) => bar.difference >= 0,
              );
              const negativeBars = Array.from(bars.values()).filter(
                (bar) => bar.difference < 0,
              );
              const showAboveAnnotation = positiveBars.length > 0;
              const showBelowAnnotation = negativeBars.length > 0;

              return (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {showAboveAnnotation && (
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#268fbd",
                        textAlign: "center",
                        lineHeight: 1,
                      }}
                    >
                      Outperforming Clusters
                    </Typography>
                  )}

                  <Button
                    onClick={() => setShowAllClusters(!showAllClusters)}
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "2px",
                      px: 1,
                      py: 0.5,
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "black",
                      textTransform: "none",
                      minWidth: "auto",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      pointerEvents: "auto",
                      "&:hover": {
                        backgroundColor: "#f8f8f8",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                        borderColor: "#bbb",
                      },
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      lineHeight: 1,
                      height: "auto",
                    }}
                  >
                    {showAllClusters ? (
                      "Show top & bottom only"
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          lineHeight: 1,
                          textAlign: "center",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "black",
                        }}
                      >
                        <span>↑Click to see</span>
                        <span>↓all clusters</span>
                      </Box>
                    )}
                  </Button>

                  {showBelowAnnotation && (
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#f1b47d",
                        textAlign: "center",
                        lineHeight: 1,
                      }}
                    >
                      Underperforming Clusters
                    </Typography>
                  )}
                </Box>
              );
            })()}
          </Box>
        </Box>

        {/* Sticky X-axis */}
        <Box
          sx={{
            height: 60,
            borderRadius: "0 0 4px 4px",
            display: "flex",
            alignItems: "flex-start",
            m: 0,
            p: 0,
          }}
        >
          <svg
            width={width - 10}
            height={60}
            style={{
              display: "block",
            }}
            role="img"
            aria-label="Difference from expected exports axis"
          >
            <g transform={`translate(${margin.left}, 0)`}>
              <AxisBottom
                scale={xScale}
                tickFormat={(value) => {
                  // For linear scale, format as currency differences
                  if (value === 0) return "Expected";
                  return (value >= 0 ? "+" : "") + formatter.format(value);
                }}
                tickLabelProps={() => ({
                  fill: "rgb(51,51,51)",
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: "Source Sans Pro, sans-serif",
                  textAnchor: "middle",
                })}
                tickLineProps={() => ({
                  stroke: "rgb(51,51,51)",
                  strokeWidth: 2,
                })}
                stroke="rgb(51,51,51)"
                strokeWidth={2}
                numTicks={isMobile ? 5 : 8}
                tickComponent={({ formattedValue, ...tickProps }) => {
                  const isExpected = formattedValue === "Expected";
                  if (isExpected) {
                    // Position precisely using tick's x/y instead of relying on transform
                    const { x = 0, y = 0 } = tickProps;
                    const boxWidth = 120;
                    const boxHeight = 28;
                    return (
                      <g transform={`translate(${x}, ${y})`}>
                        <foreignObject
                          x={-boxWidth / 2}
                          y={-20}
                          width={boxWidth}
                          height={boxHeight}
                          style={{ overflow: "visible" }}
                        >
                          <div
                            xmlns="http://www.w3.org/1999/xhtml"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            <Tooltip
                              title={expectedDefinition}
                              placement="top"
                              arrow
                              slotProps={{
                                tooltip: {
                                  sx: {
                                    bgcolor: "#fff",
                                    color: "#000",
                                    border: "1px solid #ddd",
                                  },
                                },
                                arrow: { sx: { color: "#fff" } },
                              }}
                            >
                              <span
                                style={{
                                  textDecoration: "underline",
                                  cursor: "help",
                                  fontWeight: 600,
                                  fontFamily: "Source Sans Pro, sans-serif",
                                  fontSize: 16,
                                  color: "rgb(51,51,51)",
                                  lineHeight: 1,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Expected
                              </span>
                            </Tooltip>
                          </div>
                        </foreignObject>
                      </g>
                    );
                  }
                  return (
                    <text
                      {...tickProps}
                      fill="rgb(51,51,51)"
                      fontSize={16}
                      fontWeight={600}
                      fontFamily="Source Sans Pro, sans-serif"
                      textAnchor="middle"
                    >
                      {formattedValue}
                    </text>
                  );
                }}
              />

              {/* Axis annotations */}
            </g>
          </svg>
        </Box>

        {/* Legend Section with improved styling */}
      </Box>

      {/* Tooltip with visx bounds detection and custom styling */}
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          top={(tooltipTop || 0) + 14}
          left={(tooltipLeft || 0) + 14}
          className="gg-unskinned-tooltip"
        >
          <SharedTooltip
            payload={{
              type: "custom",
              data: {
                title: tooltipData?.data?.group?.name || "",
                rows: [
                  {
                    label: "Cluster:",
                    value: tooltipData?.data?.group?.name || "-",
                  },
                  {
                    label: "Export Value:",
                    value: formatter.format(tooltipData?.exportValue || 0),
                  },
                  {
                    label: "Expected Export Value:",
                    value: formatter.format(tooltipData?.expectedExports || 0),
                  },
                  {
                    label: "Difference:",
                    value: `${tooltipData?.difference >= 0 ? "+" : ""}${formatter.format(tooltipData?.difference || 0)}`,
                  },
                  {
                    label: "Performance:",
                    value:
                      tooltipData?.difference >= 0
                        ? "Above Expectation"
                        : "Below Expectation",
                  },
                  { label: "Year:", value: Number.parseInt(year) },
                ],
              },
            }}
          />
        </TooltipWithBounds>
      )}
    </Box>
  );
};

const StackedBarsChart = ({ year, countryId }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        fontFamily: "Source Sans Pro, sans-serif",
      }}
    >
      <ParentSize>
        {({ width, height }) => {
          if (width === 0 || height === 0) {
            return null;
          }
          return (
            <StackedBarsChartInternal
              year={year}
              countryId={countryId}
              width={width}
              height={height}
            />
          );
        }}
      </ParentSize>
    </div>
  );
};

export default StackedBarsChart;

import React, { useState, useRef, useMemo, useCallback } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import { ParentSize } from "@visx/responsive";
import { useTooltip, TooltipWithBounds } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { AxisBottom } from "@visx/axis";
import { scaleLinear } from "@visx/scale";
import { scaleSymlog } from "d3-scale";
import { max, index } from "d3-array";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { VisualizationLoading } from "../shared";
import { useImageCaptureContext } from "../../hooks/useImageCaptureContext";
import { themeUtils } from "../../theme";
import html2canvas from "html2canvas";
import StackedBarsLegend from "./StackedBarsLegend";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";

// Formatter for currency values
export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  compactDisplay: "short",
});

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

  // State for scale type (temporary control)
  const [useLogScale, setUseLogScale] = useState(true);

  // Fixed values for removed controls
  const groupBy = "clusters"; // Always show clusters
  const sortBy = "difference"; // Always sort by difference
  const sortDirection = "desc"; // Always descending

  // Data fetching hooks
  const { countryData, clustersData, isLoading, hasErrors } =
    useGreenGrowthData(Number.parseInt(countryId), Number.parseInt(year));
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

  // Calculate dimensions - space for title and legend only (no controls)
  const titleHeight = 60; // Increased for button space
  const legendHeight = isMobile ? 120 : 100;
  const availableHeight = height - titleHeight - legendHeight;

  // Fixed bar height for consistency across all layouts
  const fixedBarHeight = 20;
  const barPadding = 10;
  // Standardized margin - used consistently throughout
  const margin = {
    top: 40,
    bottom: 0,
    left: 200,
    right: 40,
  };

  // Calculate how many bars can fit in the available space
  const stickyAxisHeight = 50; // Space for sticky x-axis
  const scrollPadding = 20; // Some padding for scrolling
  const availableSpaceForBars =
    availableHeight - stickyAxisHeight - scrollPadding;
  const maxBarsToFit = Math.max(
    1,
    Math.floor(availableSpaceForBars / (fixedBarHeight + barPadding)),
  );

  // Bar calculation logic (moved from useStackedBars hook)
  const { bars, expectedOverlays, groups, xScale, actualBarHeight } =
    useMemo(() => {
      if (!currentData?.ggCpyList || !width || !height)
        return {
          bars: new Map(),
          expectedOverlays: [],
          groups: [],
          xScale: null,
          actualBarHeight: fixedBarHeight,
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

      // Filter data based on showAllClusters
      let filteredData = sortedData;

      if (!showAllClusters) {
        if (useLogScale) {
          // In log mode, show top and bottom performers by ratio
          const topPerformers = sortedData
            .filter((d) => d.ratio > 1)
            .slice(0, Math.floor(maxBarsToFit / 2));
          const bottomPerformers = sortedData
            .filter((d) => d.ratio < 1)
            .slice(-Math.floor(maxBarsToFit / 2));
          filteredData = [...topPerformers, ...bottomPerformers].sort(
            (a, b) => b.ratio - a.ratio,
          );
        } else {
          // In linear mode, show top and bottom performers by difference
          const positivePerformers = sortedData
            .filter((d) => d.difference > 0)
            .slice(0, Math.floor(maxBarsToFit / 2));
          const negativePerformers = sortedData
            .filter((d) => d.difference < 0)
            .slice(-Math.floor(maxBarsToFit / 2));
          filteredData = [...positivePerformers, ...negativePerformers].sort(
            (a, b) => b.difference - a.difference,
          );
        }
      }

      // Calculate optimal bar height for better space utilization
      let actualBarHeight = fixedBarHeight;
      if (availableSpaceForBars && filteredData.length > 0) {
        const spaceWithBaseHeight =
          filteredData.length * (fixedBarHeight + barPadding) - barPadding;
        const spaceUtilizationThreshold = 0.7;
        const currentUtilization = spaceWithBaseHeight / availableSpaceForBars;
        const unusedSpace = availableSpaceForBars - spaceWithBaseHeight;

        if (
          currentUtilization < spaceUtilizationThreshold ||
          unusedSpace > 200
        ) {
          const optimalBarHeight =
            Math.floor(
              (availableSpaceForBars + barPadding) / filteredData.length,
            ) -
            (barPadding + 2);

          const minBarHeight = 20;
          const maxBarHeight = 40;

          actualBarHeight = Math.max(
            minBarHeight,
            Math.min(maxBarHeight, optimalBarHeight),
          );
        }
      }

      // Create scale based on selected type
      let xScale;
      if (useLogScale) {
        // For log scale, use ratios (actual/expected)
        const maxRatio = Math.max(...filteredData.map((d) => d.ratio), 1);
        const minRatio = Math.min(...filteredData.map((d) => d.ratio), 1);

        // Create truly symmetric log scale around 1 (where actual = expected)
        // Calculate logarithmic distances from 1 on each side
        const logDistanceAbove = Math.log(maxRatio); // log distance from 1 to maxRatio
        const logDistanceBelow = Math.log(1 / minRatio); // log distance from 1 to 1/minRatio

        // Use the larger logarithmic distance to ensure equal visual space
        const maxLogDistance = Math.max(logDistanceAbove, logDistanceBelow);

        // Convert back to linear scale for symmetric domain
        const domainMin = Math.exp(-maxLogDistance);
        const domainMax = Math.exp(maxLogDistance);

        // Create a custom log scale that's truly symmetric around 1
        xScale = (value) => {
          // Transform to log space where 1 becomes 0
          const logValue = Math.log(value);
          // Scale to 0-1 range where -maxLogDistance maps to 0, +maxLogDistance maps to 1
          const normalizedLog =
            (logValue + maxLogDistance) / (2 * maxLogDistance);
          // Map to chart width
          return normalizedLog * chartWidth;
        };

        // Add domain and other methods that visx expects
        xScale.domain = () => [domainMin, domainMax];
        xScale.range = () => [0, chartWidth];
        xScale.ticks = (count) => {
          // Generate symmetric ticks for the axis
          const ticks = new Set();
          ticks.add(1); // Always include baseline

          const multipliers = [1, 2, 5];
          const powers = [-3, -2, -1, 0, 1, 2, 3];

          for (const power of powers) {
            for (const mult of multipliers) {
              const tick = mult * Math.pow(10, power);
              if (tick >= domainMin && tick <= domainMax && tick !== 1) {
                ticks.add(tick);
              }
              const fracTick = 1 / tick;
              if (
                fracTick >= domainMin &&
                fracTick <= domainMax &&
                fracTick !== 1
              ) {
                ticks.add(fracTick);
              }
            }
          }

          return Array.from(ticks).sort((a, b) => a - b);
        };
      } else {
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
        xScale = scaleLinear()
          .domain([-maxAbsoluteDifference, maxAbsoluteDifference])
          .range([0, chartWidth]);
      }

      const result = [];
      const expectedPositions = [];

      filteredData.forEach((group, groupIndex) => {
        const y = margin.top + groupIndex * (actualBarHeight + barPadding);

        let x, barWidth, fill, value;

        if (useLogScale) {
          // For log scale, use ratios centered around 1 (expected)
          const ratio = group.ratio;
          const baselinePoint = margin.left + xScale(1); // 1 = actual equals expected
          const ratioPoint = margin.left + xScale(ratio);

          if (ratio >= 1) {
            x = baselinePoint;
            barWidth = ratioPoint - baselinePoint;
            fill = "#2E7D32"; // Green for above expectation
          } else {
            x = ratioPoint;
            barWidth = baselinePoint - ratioPoint;
            fill = "#D32F2F"; // Red for below expectation
          }
          value = ratio;
        } else {
          // For linear scale, use differences centered around 0
          const zeroPoint = margin.left + xScale(0);
          const difference = group.difference;
          barWidth = Math.abs(xScale(difference) - xScale(0));
          x = difference >= 0 ? zeroPoint : zeroPoint - barWidth;
          fill = difference >= 0 ? "#2E7D32" : "#D32F2F"; // Green for above, red for below
          value = difference;
        }

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

      // Baseline reference line that spans all rows
      const baselineValue = useLogScale ? 1 : 0; // 1x for log scale, 0 for linear scale
      const baselinePoint = margin.left + xScale(baselineValue);
      const firstRowY = margin.top;
      const lastRowY =
        margin.top +
        (filteredData.length - 1) * (actualBarHeight + barPadding) +
        actualBarHeight;

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
      maxBarsToFit,
      availableSpaceForBars,
      supplyChainProductLookup,
      clusterLookup,
      useLogScale,
    ]);

  // Calculate required height based on actual bar size
  const requiredChartHeight = Math.max(
    groups.length * (actualBarHeight + barPadding) -
      barPadding +
      margin.top +
      margin.bottom,
    200,
  );

  const chartHeight = requiredChartHeight;

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

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Source Sans Pro, sans-serif",
        backgroundColor: "white",
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
          backgroundColor: "white",
          p: 0,
          m: 0,
        }}
        ref={chartContainerRef}
      >
        {/* Title and Button Section */}
        <Box
          sx={{
            position: "relative",
            height: titleHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "18px",
              fontFamily: "Source Sans Pro, sans-serif",
              fontWeight: 600,
              color: "black",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              pl: "100px",
            }}
          >
            PRODUCT CLUSTERS - PERFORMANCE VS EXPECTATION
          </Typography>

          {/* Scale Type Control (Temporary) */}
          <Button
            onClick={() => setUseLogScale(!useLogScale)}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #ddd",
              borderRadius: "4px",
              px: 1.5,
              py: 0.75,
              fontSize: "12px",
              fontWeight: 400,
              color: "#666",
              textTransform: "none",
              minWidth: "auto",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              "&:hover": {
                backgroundColor: "rgba(248, 248, 248, 0.95)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                borderColor: "#ccc",
              },
            }}
          >
            {useLogScale ? "Linear Scale" : "Log Scale"}
          </Button>
        </Box>

        {/* Scrollable Chart Area */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            maxHeight: availableHeight - 80, // Leave space for sticky x-axis
            backgroundColor: "white",
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
              backgroundColor: "white",
            }}
            role="img"
            aria-labelledby="chart-title"
          >
            <title id="chart-title">
              Product Clusters Performance vs Expectation Chart with{" "}
              {useLogScale ? "Log" : "Linear"} Scale
            </title>
            {/* Y-axis labels (group names) */}
            {groups.map((group, index) => {
              const yPosition =
                margin.top +
                index * (actualBarHeight + barPadding) +
                actualBarHeight / 2;

              // Truncate text if too long for the allocated space
              const maxWidth = 240; // Leave 10px padding from margin
              const fontSize = isMobile ? 11 : 14;
              const charWidth = fontSize * 0.6; // Approximate character width
              const maxChars = Math.floor(maxWidth / charWidth);
              const truncatedText =
                group.groupName.length > maxChars
                  ? group.groupName.substring(0, maxChars - 3) + "..."
                  : group.groupName;

              return (
                <text
                  key={`y-label-${group.groupId}`}
                  x={margin.left - 10}
                  y={yPosition}
                  fontSize={isMobile ? "11px" : "14px"}
                  fontFamily="Source Sans Pro, sans-serif"
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="#333"
                  fontWeight="400"
                >
                  {truncatedText}
                </text>
              );
            })}

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
                    style={{ cursor: "pointer" }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${bar.title}: ${bar.difference >= 0 ? "+" : ""}${formatter.format(bar.difference)}`}
                    onMouseEnter={(event) => {
                      const coords = localPoint(
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
                    onMouseMove={(event) => {
                      const coords = localPoint(
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
                    onMouseLeave={() => {
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
                width={1}
                height={
                  expectedOverlays[0].coords[1][1] -
                  expectedOverlays[0].coords[0][1]
                }
                fill="black"
                fillOpacity={0.9}
              />
            )}
          </svg>
        </Box>

        {/* Show All Button - positioned fixed over the chart area */}
        <Box
          sx={{
            position: "absolute",
            right: 16,
            top: titleHeight + (availableHeight - 80) / 2, // Position halfway down the visible chart area
            transform: "translateY(-50%)",
            zIndex: 10,
            pointerEvents: "none", // Allow clicking through the container
          }}
        >
          <Button
            onClick={() => setShowAllClusters(!showAllClusters)}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #ddd",
              borderRadius: "4px",
              px: 1.5,
              py: 0.75,
              fontSize: "11px",
              fontWeight: 400,
              color: "#666",
              textTransform: "none",
              minWidth: "auto",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              pointerEvents: "auto", // Re-enable pointer events for the button
              "&:hover": {
                backgroundColor: "rgba(248, 248, 248, 0.95)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                borderColor: "#ccc",
              },
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              lineHeight: 1.2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                fontSize: "10px",
                color: "#999",
              }}
            >
              ↕
            </Box>
            {showAllClusters ? (
              "Show top & bottom only"
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  lineHeight: 1.1,
                  textAlign: "center",
                }}
              >
                <span>Click to see all</span>
                <span>industries</span>
              </Box>
            )}
          </Button>
        </Box>

        {/* Sticky X-axis */}
        <Box
          sx={{
            height: 40,
            backgroundColor: "white",
            borderRadius: "0 0 4px 4px",
            display: "flex",
            alignItems: "flex-start",
            m: 0,
            p: 0,
          }}
        >
          <svg
            width={width - 10}
            height={40}
            style={{
              display: "block",
              backgroundColor: "white",
            }}
            role="img"
            aria-labelledby="axis-title"
          >
            <title id="axis-title">
              Chart X-Axis showing export value differences
            </title>
            <g transform={`translate(${margin.left}, 20)`}>
              <AxisBottom
                scale={xScale}
                tickValues={useLogScale ? xScale.ticks(10) : undefined}
                tickFormat={(value) => {
                  if (useLogScale) {
                    // For log scale, format as multiplicative ratios
                    if (Math.abs(value - 1) < 0.05) return "Expected";

                    if (value >= 1) {
                      // Values >= 1 (above expectation)
                      if (value >= 1000) {
                        return `${Math.round(value / 1000)}Kx`;
                      } else if (value >= 100) {
                        return `${Math.round(value / 100)}00x`;
                      } else if (value >= 10) {
                        return `${Math.round(value / 10)}0x`;
                      } else {
                        return `${Math.round(value)}x`;
                      }
                    } else if (value > 0) {
                      // Values < 1 (below expectation) - show as fractions
                      const reciprocal = 1 / value;
                      if (reciprocal >= 1000) {
                        return `1/${Math.round(reciprocal / 1000)}Kx`;
                      } else if (reciprocal >= 100) {
                        return `1/${Math.round(reciprocal / 100)}00x`;
                      } else if (reciprocal >= 10) {
                        return `1/${Math.round(reciprocal / 10)}0x`;
                      } else {
                        return `1/${Math.round(reciprocal)}x`;
                      }
                    } else {
                      return "0x";
                    }
                  } else {
                    // For linear scale, format as currency differences
                    if (value === 0) return "Expected";
                    return (value >= 0 ? "+" : "") + formatter.format(value);
                  }
                }}
                tickLabelProps={() => ({
                  fill: themeUtils.chart.colors.text.secondary,
                  fontSize: isMobile ? 10 : 12,
                  fontFamily:
                    themeUtils.chart.typography["chart-axis-tick"].fontFamily,
                  textAnchor: "middle",
                })}
                tickLineProps={() => ({
                  stroke: themeUtils.chart.colors.border.light,
                  strokeWidth: themeUtils.chart.styles.axis.tickStrokeWidth,
                })}
                stroke={themeUtils.chart.colors.border.light}
                strokeWidth={themeUtils.chart.styles.axis.axisStrokeWidth}
                numTicks={useLogScale ? undefined : isMobile ? 5 : 8}
              />
            </g>
          </svg>
        </Box>

        {/* Legend Section with improved styling */}

        <StackedBarsLegend groups={groups} isMobile={isMobile} />
      </Box>

      {/* Tooltip with visx bounds detection and custom styling */}
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <Box>
            <Typography variant="chart-tooltip-title">
              {tooltipData?.data?.group?.name}
            </Typography>

            <Box sx={{ display: "grid", gap: 1.2 }}>
              {useLogScale && (
                <Box>
                  <Typography variant="chart-tooltip-content">
                    <strong>Performance Ratio:</strong>{" "}
                    {tooltipData?.ratio
                      ? tooltipData.ratio >= 1
                        ? `${tooltipData.ratio.toFixed(1)}x expected`
                        : `1/${(1 / tooltipData.ratio).toFixed(1)}x expected`
                      : "N/A"}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="chart-tooltip-content">
                  <strong>Difference:</strong>{" "}
                  {(tooltipData?.difference >= 0 ? "+" : "") +
                    formatter.format(tooltipData?.difference || 0)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="chart-tooltip-content">
                  <strong>Actual Export Value:</strong>{" "}
                  {formatter.format(tooltipData?.exportValue || 0)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="chart-tooltip-content">
                  <strong>Expected Exports:</strong>{" "}
                  {formatter.format(tooltipData?.expectedExports || 0)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="chart-tooltip-content">
                  <strong>Performance:</strong>{" "}
                  {tooltipData?.difference >= 0
                    ? "Above Expectation"
                    : "Below Expectation"}
                </Typography>
              </Box>
            </Box>
          </Box>
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

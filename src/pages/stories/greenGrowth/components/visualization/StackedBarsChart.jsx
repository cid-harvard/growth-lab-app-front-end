/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/mouse-events-have-key-events */
import React, { useState, useRef, useMemo } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import { ParentSize } from "@visx/responsive";
import { useTooltip, TooltipWithBounds } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { AxisBottom } from "@visx/axis";
import { scaleLinear } from "@visx/scale";
import { index } from "d3-array";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { VisualizationLoading, SharedTooltip } from "../shared";
import GGTooltip from "../shared/GGTooltip";
import { getTerm } from "../../utils/terms";
import { useImageCaptureContext } from "../../hooks/useImageCaptureContext";
import html2canvas from "html2canvas";
import ClickHint from "../../../../../components/general/ClickHint";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { useProductLookup } from "../../queries/products";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Routes } from "../../../../../metadata";

// Formatter for currency values
export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  compactDisplay: "short",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// Helper function to determine if a color is light or dark
// Returns true if the color is light (needs black text), false if dark (needs white text)
const isLightColor = (hexColor) => {
  // Convert hex to RGB
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance using the formula from WCAG
  // https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return true if light (luminance > 0.5), false if dark
  return luminance > 0.5;
};

// Responsive margin calculator
const getMargins = (isMobile) => ({
  top: isMobile ? 45 : 50,
  bottom: 0,
  left: isMobile ? 50 : 60,
  right: isMobile ? 60 : 80,
});

// Internal component that receives dimensions from ParentSize
const StackedBarsChartInternal = ({
  year,
  countryId,
  width,
  height,
  mode = "presence",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get selected cluster from URL
  const selectedClusterId = searchParams.get("clusterId")
    ? Number.parseInt(searchParams.get("clusterId"))
    : null;

  // Handler for navigating to a cluster's products
  const handleClusterClick = (clusterId) => {
    const params = new URLSearchParams(searchParams);
    params.set("clusterId", clusterId.toString());
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Handler for going back to cluster view
  const handleBackToCluster = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("clusterId");
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Add ref for SVG
  const svgRef = useRef(null);
  const scrollableAreaRef = useRef(null);

  // Track available height from the scrollable container
  const [availableHeight, setAvailableHeight] = useState(400); // reasonable default

  // Measure the available height once the scrollable area renders
  React.useEffect(() => {
    if (scrollableAreaRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          if (height > 0) {
            setAvailableHeight(height);
          }
        }
      });
      resizeObserver.observe(scrollableAreaRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

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

  // Data fetching hooks
  const { countryData, clustersData, isLoading } = useGreenGrowthData(
    Number.parseInt(countryId),
    Number.parseInt(year),
  );
  const supplyChainProductLookup = useSupplyChainProductLookup();
  const productLookup = useProductLookup();

  // Create cluster lookup from shared data
  const clusterLookup = useMemo(() => {
    if (!clustersData?.gpClusterList) return new Map();
    return new Map(
      clustersData.gpClusterList.map((c) => [c.clusterId, c.clusterName]),
    );
  }, [clustersData]);

  // Create cluster RCA lookup from country cluster data
  const clusterRcaLookup = useMemo(() => {
    const map = new Map();
    if (!countryData?.clusterData) return map;
    for (const row of countryData.clusterData) {
      if (row?.clusterId != null) {
        map.set(row.clusterId, row.exportRcaCluster);
      }
    }
    return map;
  }, [countryData]);

  // Create cluster globalMarketShare lookup from country cluster data
  const clusterGlobalMarketShareLookup = useMemo(() => {
    const map = new Map();
    if (!countryData?.clusterData) return map;
    for (const row of countryData.clusterData) {
      if (row?.clusterId != null && row?.worldShareCluster != null) {
        map.set(row.clusterId, row.worldShareCluster);
      }
    }
    return map;
  }, [countryData]);

  // Create cluster marketShare lookup from country cluster data
  // Uses countryWorldShareCluster per Karan's 2025-01-27 clarification:
  // "country_world_share_cluster (net new) yes - this is what we want the bar length to show"
  const clusterMarketShareLookup = useMemo(() => {
    const map = new Map();
    if (!countryData?.clusterData) return map;
    for (const row of countryData.clusterData) {
      if (row?.clusterId != null && row?.countryWorldShareCluster != null) {
        map.set(row.clusterId, row.countryWorldShareCluster);
      }
    }
    return map;
  }, [countryData]);

  // Only show loading if we have no data to work with
  const loading = isLoading && !countryData?.productData;

  // Get responsive margins
  const margin = useMemo(() => getMargins(isMobile), [isMobile]);

  // Responsive bar sizing
  const minBarHeight = 24;
  const maxBarHeight = 48;
  const barPadding = 12;

  // We'll calculate maxBarsToFit inside useMemo after determining the actual bar height

  // Bar calculation logic (moved from useStackedBars hook)
  const { bars, groups, xScale, actualBarHeight, rcaScale, rcaMin, rcaMax } =
    useMemo(() => {
      if (!countryData?.productData || !width || !height)
        return {
          bars: new Map(),
          groups: [],
          xScale: null,
          actualBarHeight: minBarHeight,
          rcaScale: null,
          rcaMin: null,
          rcaMax: null,
        };

      const gpCpyList = countryData.productData;
      const containerPaddingHorizontal = 16; // 8px left + 8px right padding from outer container
      const chartWidth =
        width - containerPaddingHorizontal - margin.left - margin.right;

      // Process data - check if we're showing products for a specific cluster
      const processedData = [];

      if (selectedClusterId !== null) {
        // PRODUCT VIEW: Show individual products for the selected cluster
        gpCpyList.forEach((product) => {
          const supplyChains =
            supplyChainProductLookup.get(product.productId) || [];
          const belongsToCluster = supplyChains.some(
            (sc) => sc.clusterId === selectedClusterId,
          );

          if (belongsToCluster && product.exportValue > 0) {
            // Get product name from the product lookup
            const productInfo = productLookup?.get(product.productId);
            const productName =
              productInfo?.nameShortEn ||
              productInfo?.nameEn ||
              `Product ${product.productId}`;

            const productMarketShare = product.countryWorldShareProduct;

            processedData.push({
              groupId: product.productId,
              groupName: productName,
              actualProduction: Number.parseFloat(product.exportValue) || 0,
              marketShare: productMarketShare,
              globalMarketShare: product.worldShareProduct,
              rca: product.exportRca, // Use exportRca from API
              parentId: product.productId,
            });
          }
        });
      } else {
        if (!countryData?.clusterData) {
          // No cluster data, return empty
        } else {
          for (const clusterRow of countryData.clusterData) {
            const clusterId = clusterRow.clusterId;
            const clusterName = clusterLookup.get(clusterId);
            if (!clusterName) continue;

            const totalActual = clusterRow.exportValue || 0;

            const clusterMarketShare = clusterMarketShareLookup.get(clusterId);

            const globalMarketShare =
              clusterGlobalMarketShareLookup.get(clusterId);

            if (totalActual > 0 && clusterMarketShare != null) {
              const groupRca = clusterRcaLookup.get(clusterId);

              processedData.push({
                groupId: clusterId,
                groupName: clusterName,
                actualProduction: totalActual,
                marketShare: clusterMarketShare,
                globalMarketShare: globalMarketShare,
                rca: groupRca,
                parentId: clusterId,
              });
            }
          }
        }
      }

      // Sorting: presence by actualProduction desc; comparison by market share desc
      const sortedData = processedData.sort((a, b) => {
        if (mode === "presence") {
          return b.actualProduction - a.actualProduction;
        }
        // Sort by market share value descending for comparison mode
        const aMarketShare = a.marketShare || 0;
        const bMarketShare = b.marketShare || 0;
        return bMarketShare - aMarketShare;
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
      // Account for margin.top in the calculation to ensure all bars fit properly
      const maxBarsToFit = Math.max(
        1,
        Math.floor(
          (availableHeight - margin.top) / (actualBarHeight + barPadding),
        ),
      );

      // Filter data based on showAllClusters
      let filteredData = sortedData;

      if (!showAllClusters) {
        // For both modes, just take the top N
        filteredData = sortedData.slice(0, maxBarsToFit);
      }

      // Create linear scale
      let xScale;
      if (mode === "presence") {
        const maxActual = Math.max(
          0,
          ...filteredData.map((d) => d.actualProduction || 0),
        );
        xScale = scaleLinear().domain([0, maxActual]).range([0, chartWidth]);
      } else {
        // comparison: show market share (percentage values) as simple bars from 0
        const marketShares = filteredData.map((d) => d.marketShare || 0);
        const maxMarketShare = Math.max(...marketShares, 0);
        xScale = scaleLinear()
          .domain([0, maxMarketShare * 1.1]) // Add 10% padding
          .range([0, chartWidth])
          .clamp(true);
      }

      const result = [];

      // Prepare RCA color scale for both modes
      let rcaMin = null;
      let rcaMax = null;
      let rcaScale = null;

      // For clusters, use cluster RCA; for products, use product RCA from processedData
      const rcas =
        selectedClusterId !== null
          ? processedData
              .map((d) => d.rca)
              .filter((v) => v != null && !Number.isNaN(v))
          : processedData
              .map((d) => clusterRcaLookup.get(d.groupId))
              .filter((v) => v != null && !Number.isNaN(v));
      if (rcas.length > 0) {
        rcaMin = Math.min(...rcas);
        rcaMax = Math.max(...rcas);
        if (rcaMin === rcaMax) {
          // Avoid zero range
          rcaMin = Math.max(0, rcaMin - 0.5);
          rcaMax = rcaMax + 0.5;
        }
        rcaScale = scaleLinear()
          .domain([rcaMin, rcaMax])
          .range(["#cfe8f3", "#106496"])
          .clamp(true);
      }

      filteredData.forEach((group, groupIndex) => {
        // Use fixed spacing with the smaller bar height
        const y = margin.top + groupIndex * (actualBarHeight + barPadding);

        let x, barWidth, fill, value;
        // For clusters, use cluster RCA; for products, use product RCA
        const groupRca =
          selectedClusterId !== null
            ? group.rca
            : clusterRcaLookup.get(group.groupId);

        if (mode === "presence") {
          const zeroPoint = margin.left;
          const actual = group.actualProduction;
          barWidth = xScale(actual) - xScale(0);
          x = zeroPoint;
          fill = groupRca != null && rcaScale ? rcaScale(groupRca) : "#268fbd";
          value = actual;
        } else {
          // comparison mode: bars showing market share, colored by RCA
          const zeroPoint = margin.left;
          const marketShareValue = group.marketShare || 0;
          barWidth = xScale(marketShareValue) - xScale(0);
          x = zeroPoint;
          fill = groupRca != null && rcaScale ? rcaScale(groupRca) : "#268fbd";
          value = marketShareValue;
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
          stroke: "none",

          exportValue: group.actualProduction,
          title: group.groupName,
          value: value,
          globalMarketShare: group.globalMarketShare,
          parent: {
            clusterId: group.groupId,
            clusterName: group.groupName,
          },
          data: {
            group: {
              name: group.groupName,
              actual: group.actualProduction,
              rca:
                selectedClusterId !== null
                  ? group.rca
                  : (clusterRcaLookup.get(group.groupId) ?? null),
            },
          },
        });
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
        groups: filteredData,
        xScale: xScale,
        actualBarHeight: actualBarHeight,
        rcaScale,
        rcaMin,
        rcaMax,
      };
    }, [
      countryData,
      width,
      height,
      showAllClusters,
      availableHeight,
      supplyChainProductLookup,
      productLookup,
      clusterLookup,
      mode,
      clusterRcaLookup,
      clusterGlobalMarketShareLookup,
      clusterMarketShareLookup,
      selectedClusterId,
      margin,
    ]);

  // Calculate chart height based on whether we're showing all clusters or not
  const chartHeight = showAllClusters
    ? // When showing all clusters, calculate actual height needed (enables scrolling)
      groups.length * (actualBarHeight + barPadding) -
      barPadding +
      margin.top +
      margin.bottom
    : // When showing subset, calculate based on actual bars rendered (no scrolling needed)
      margin.top +
      groups.length * (actualBarHeight + barPadding) -
      barPadding +
      margin.bottom;

  // Register/unregister image capture function
  React.useEffect(() => {
    const handleCaptureImage = async () => {
      if (!chartContainerRef.current) {
        console.warn("Chart container not found");
        return;
      }

      try {
        // Temporarily hide non-export elements
        const hiddenElements = [];
        const candidates = chartContainerRef.current.querySelectorAll(
          '[data-export-hide="true"]',
        );
        candidates.forEach((el) => {
          const element = el;
          if (element?.style) {
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
            a.download =
              mode === "comparison"
                ? `stacked_bars_${countryId}_${year}_clusters_rca.png`
                : `stacked_bars_${countryId}_${year}_clusters_presence.png`;
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
    countryId,
    year,
    mode,
  ]);

  if (loading || !xScale) {
    return <VisualizationLoading />;
  }

  return (
    <Box
      ref={chartContainerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "white",
      }}
    >
      {/* Title Section */}
      <Box
        sx={{
          flexShrink: 0,
          minHeight: isMobile ? 50 : 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          pb: 0.5,
          mb: 0.5,
        }}
      >
        <Typography variant="chart-title">
          {mode === "presence"
            ? selectedClusterId !== null
              ? "Trade Value in Green Products"
              : "Trade Value in Green Industrial Clusters"
            : selectedClusterId !== null
              ? "Market Share in Green Products"
              : "Market Share in Green Industrial Clusters"}
        </Typography>
      </Box>

      {/* Scrollable Chart Area - will grow to fill space */}
      <Box
        ref={scrollableAreaRef}
        sx={{
          flex: "1 1 auto",
          minHeight: 0,
          overflow: showAllClusters ? "auto" : "hidden",
          borderRadius: "4px 4px 0 0",
          position: "relative",
          fontFamily: "Source Sans Pro, sans-serif",
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
          width={width - 26} // Account for container padding (16px) and spacing (10px)
          height={availableHeight} // Use full available height to ensure grid lines can draw all the way down
          style={{
            display: "block",
          }}
          role="img"
          aria-label="Competitiveness in Green Industrial Clusters"
          aria-describedby="stacked-bars-desc"
        >
          <desc id="stacked-bars-desc">
            {mode === "comparison"
              ? "Bar chart of clusters showing market share (RCA values)."
              : "Bar chart of clusters showing export value."}
          </desc>

          {/* Vertical grid lines */}
          {xScale && (
            <g>
              {xScale
                .ticks(isMobile ? 5 : 8)
                .filter((tick) => tick >= 0)
                .map((tick) => {
                  const x = margin.left + xScale(tick);
                  const firstRowY = margin.top;
                  // Grid lines should extend to the full available height, not just to the last bar
                  // Use availableHeight which is the full container height
                  const lastRowY = availableHeight - margin.bottom;

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

          {/* Click hint - only show when viewing clusters */}
          {selectedClusterId === null && (
            <g transform="translate(0, 5)">
              <ClickHint
                text="Click on a cluster to view its products"
                x={margin.left}
                y={0}
              />
            </g>
          )}

          {/* Back button hint - only show when viewing products */}
          {selectedClusterId !== null && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <g
              transform="translate(0, 5)"
              style={{ cursor: "pointer" }}
              onClick={handleBackToCluster}
            >
              {/* Button background */}
              <rect
                x={margin.left}
                y={0}
                width={130}
                height={30}
                fill="white"
                stroke="black"
                strokeWidth={1}
                rx={2}
              />
              {/* Button text */}
              <text
                x={margin.left + 60}
                y={15}
                fontSize={14}
                fontWeight={600}
                fill="black"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="Source Sans Pro, sans-serif"
              >
                ← Back to Clusters
              </text>
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
                width={width - 26} // Account for container padding (16px) and spacing (10px)
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
            const rowY = margin.top + rowIndex * (actualBarHeight + barPadding);

            // Only make bars clickable when viewing clusters (not products)
            const isClickable = selectedClusterId === null;

            return (
              <g key={`bar-group-${bar.id}`}>
                {/* Invisible full-width hover area */}
                <rect
                  x={0}
                  y={rowY}
                  width={width - 26} // Account for container padding (16px) and spacing (10px)
                  height={actualBarHeight}
                  fill="transparent"
                  style={{ cursor: isClickable ? "pointer" : "default" }}
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  aria-label={
                    isClickable ? `View products in ${bar.title}` : undefined
                  }
                  // purely decorative/invisible hover catcher when not clickable; accessible button when clickable
                  onClick={() => {
                    if (isClickable) {
                      handleClusterClick(bar.parentId);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      isClickable &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      handleClusterClick(bar.parentId);
                    }
                  }}
                  onMouseMove={(event) => {
                    // Use chartContainerRef as the positioning context
                    const point = localPoint(chartContainerRef.current, event);
                    if (point) {
                      showTooltip({
                        tooltipLeft: point.x,
                        tooltipTop: point.y,
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

          {/* No expected overlay or vertical annotations for comparison mode anymore */}

          {/* Smart cluster name labels - rendered last to appear on top */}
          {Array.from(bars.values()).map((bar) => {
            const yPosition = bar.y + bar.height / 2;
            const fontSize = 16; // Fixed 16px as per spec
            const charWidth = fontSize * 0.52;

            // Position labels after the bar
            const referenceX = bar.x + bar.width;

            // Position labels outside the reference point on the right for both modes
            const outsideLabelX = referenceX + 12;
            const outsideAvailableSpace =
              width - 26 - margin.right - referenceX; // Account for container padding and spacing

            // Calculate minimum space needed for readable text
            const minReadableChars = 15; // Minimum characters for readable text
            const minSpaceNeeded = minReadableChars * charWidth;

            // Only move text inside if there's not enough room outside AND bar is wide enough
            const needsInsidePositioning =
              outsideAvailableSpace < minSpaceNeeded &&
              bar.width > minSpaceNeeded;

            let labelX, textAnchor, textColor, availableSpace, maxChars;

            if (needsInsidePositioning) {
              // Align text to the far right inside the bar (before any overlays)
              labelX = bar.x + bar.width - 12; // 12px from the end of the bar
              textAnchor = "end";
              // Determine text color based on bar color for sufficient contrast
              textColor = isLightColor(bar.fill) ? "black" : "white";
              availableSpace = bar.width - 24; // Account for padding on both sides
            } else {
              // Position text outside the reference point at the start (preferred)
              labelX = outsideLabelX;
              textAnchor = "start";
              textColor = "black"; // Black text for outside labels as per spec
              availableSpace = outsideAvailableSpace;
            }

            maxChars = Math.floor(Math.max(0, availableSpace / charWidth));

            // Truncate only if necessary
            const truncatedText =
              bar.title.length > maxChars && maxChars > 8
                ? bar.title.substring(0, Math.max(8, maxChars - 3)) + "..."
                : bar.title;

            // Only add stroke to text when positioned outside the bar
            const textProps = {
              x: labelX,
              y: yPosition,
              fontSize: fontSize,
              fontFamily: "Source Sans Pro, sans-serif",
              textAnchor: textAnchor,
              dominantBaseline: "middle",
              fill: textColor,
              fontWeight: "600", // 600 weight as per spec
              style: { pointerEvents: "none" },
            };

            // Add stroke only for outside labels
            if (!needsInsidePositioning) {
              textProps.stroke = "rgba(255,255,255,0.95)";
              textProps.strokeWidth = "2";
              textProps.paintOrder = "stroke fill";
            }

            return (
              <text key={`bar-label-${bar.id}`} {...textProps}>
                {truncatedText}
              </text>
            );
          })}
        </svg>
        {/* Show All Button - positioned at center, only show when viewing clusters */}
        {selectedClusterId === null && (
          <Box
            sx={{
              position: "absolute",
              right: 16,
              top: (chartHeight - margin.bottom) / 2,
              transform: "translateY(-50%)",
              zIndex: 10,
              pointerEvents: "none", // Allow clicking through the container
            }}
            data-export-hide="true"
          >
            <Button
              onClick={() => setShowAllClusters(!showAllClusters)}
              sx={{
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "2px",
                px: 1,
                py: 0.5,
                fontSize: "0.875rem",
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
                "Show top only"
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    lineHeight: 1,
                    textAlign: "center",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "black",
                  }}
                >
                  <span>↑Click to see</span>
                  <span>↓all clusters</span>
                </Box>
              )}
            </Button>
          </Box>
        )}
      </Box>

      {/* Sticky X-axis */}
      <Box
        sx={{
          flexShrink: 0,
          borderRadius: "0 0 4px 4px",
          display: "flex",
          alignItems: "flex-start",
          backgroundColor: "white",
        }}
      >
        <svg
          width={width - 26} // Account for container padding (16px) and spacing (10px)
          height={30}
          style={{
            display: "block",
          }}
          role="img"
          aria-label={
            mode === "comparison" ? "Cluster RCA axis" : "Export value axis"
          }
        >
          <g transform={`translate(${margin.left}, 0)`}>
            <AxisBottom
              scale={xScale}
              tickFormat={(value) => {
                // Presence: currency format. Comparison: percentage format
                if (mode === "presence") {
                  if (value === 0) return "0";
                  return formatter.format(value);
                }
                // Show market share as percentage with adaptive precision to show actual values
                const percentage = value * 100;
                if (percentage === 0) return "0%";

                // For very small values, use as many decimals as needed to show a meaningful value
                if (percentage < 0.01) {
                  // Find the first non-zero digit and show 2 significant figures
                  return `${percentage.toFixed(5)}%`;
                }
                if (percentage < 0.1) {
                  return `${percentage.toFixed(3)}%`;
                }
                if (percentage < 1) {
                  return `${percentage.toFixed(2)}%`;
                }
                return `${percentage.toFixed(1)}%`;
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
            />

            {/* Axis annotations */}
          </g>
        </svg>
      </Box>

      {/* Chart Type Toggle */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 1, sm: 2 },
          py: { xs: 0.5, sm: 1 },
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
        data-export-hide="true"
      >
        <ButtonGroup variant="outlined" size="small">
          <Button
            onClick={() => {
              const search = location.search || "";
              navigate(`${Routes.GreenGrowthClusterTrade}${search}`);
            }}
            sx={{
              textTransform: "none",
              backgroundColor: mode === "presence" ? "#106496" : "white",
              color: mode === "presence" ? "white" : "#106496",
              borderColor: "#106496",
              fontSize: "0.875rem",
              fontWeight: 600,
              px: 2,
              py: 0.5,
              "&:hover": {
                backgroundColor: mode === "presence" ? "#0e5678" : "#f5f5f5",
                borderColor: "#106496",
              },
            }}
          >
            Trade Value
          </Button>
          <Button
            onClick={() => {
              const search = location.search || "";
              navigate(`${Routes.GreenGrowthClusterMarket}${search}`);
            }}
            sx={{
              textTransform: "none",
              backgroundColor: mode === "comparison" ? "#106496" : "white",
              color: mode === "comparison" ? "white" : "#106496",
              borderColor: "#106496",
              fontSize: "0.875rem",
              fontWeight: 600,
              px: 2,
              py: 0.5,
              "&:hover": {
                backgroundColor: mode === "comparison" ? "#0e5678" : "#f5f5f5",
                borderColor: "#106496",
              },
            }}
          >
            Market Share
          </Button>
        </ButtonGroup>
      </Box>

      {/* RCA legend - shown for both modes */}
      {rcaScale && rcaMin != null && rcaMax != null && (
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: "8px", sm: "10px", md: "15px" },
            px: { xs: 1, sm: 2 },
            py: { xs: 0.5, sm: 1 },
            mb: 2,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <GGTooltip title={getTerm("rca").description} placement="top">
            <Typography
              sx={{
                fontSize: isMobile ? "0.875rem" : "1rem",
                fontWeight: 600,
                color: "#000",
                fontFamily: "Source Sans Pro, sans-serif",
                whiteSpace: "nowrap",
                textDecoration: "underline",
                cursor: "help",
              }}
            >
              Economic Competitiveness
            </Typography>
          </GGTooltip>

          <Typography
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
              fontWeight: 600,
              color: "#000",
              fontFamily: "Source Sans Pro, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            Low
          </Typography>

          <Box
            sx={{
              width: isMobile ? "120px" : "300px",
              height: isMobile ? "12px" : "16px",
              background: "linear-gradient(90deg, #cfe8f3 0%, #106496 100%)",
              border: "1px solid #ccc",
              borderRadius: "3px",
            }}
          />

          <Typography
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
              fontWeight: 600,
              color: "#000",
              fontFamily: "Source Sans Pro, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            High
          </Typography>
        </Box>
      )}

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          left={tooltipLeft}
          top={tooltipTop}
          offsetLeft={12}
          offsetTop={12}
          detectBounds={true}
          className="gg-unskinned-tooltip"
        >
          <SharedTooltip
            payload={{
              type: "custom",
              data: {
                title: tooltipData?.data?.group?.name || "",
                rows:
                  mode === "presence"
                    ? [
                        {
                          label: "Export Value:",
                          value: formatter.format(
                            tooltipData?.exportValue || 0,
                          ),
                        },
                        {
                          label:
                            selectedClusterId !== null
                              ? "Product RCA:"
                              : "Cluster RCA:",
                          value: (() => {
                            const r = tooltipData?.data?.group?.rca;
                            return r != null && !Number.isNaN(r)
                              ? Number(r).toFixed(2)
                              : "-";
                          })(),
                        },
                        { label: "Year:", value: Number.parseInt(year) },
                      ]
                    : [
                        {
                          label:
                            selectedClusterId !== null
                              ? "Product Market Share:"
                              : "Cluster Market Share:",
                          value: (() => {
                            const ms = tooltipData?.value || 0;
                            // Show as percentage with 2 decimal places, or "<0.01%" for very small values
                            const percentage = ms * 100;
                            if (percentage === 0) return "0%";
                            if (percentage < 0.01) {
                              return "<0.01%";
                            }
                            return `${percentage.toFixed(2)}%`;
                          })(),
                        },
                        {
                          label:
                            selectedClusterId !== null
                              ? "Product RCA:"
                              : "Cluster RCA:",
                          value: (() => {
                            const r = tooltipData?.data?.group?.rca;
                            return r != null && !Number.isNaN(r)
                              ? Number(r).toFixed(2)
                              : "-";
                          })(),
                        },
                        {
                          label: "Export Value:",
                          value: formatter.format(
                            tooltipData?.exportValue || 0,
                          ),
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

const StackedBarsChart = ({ year, countryId, mode = "presence" }) => {
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
              mode={mode}
            />
          );
        }}
      </ParentSize>
    </div>
  );
};

export default StackedBarsChart;

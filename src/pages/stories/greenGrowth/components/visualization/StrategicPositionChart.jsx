import React, { useMemo, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { scaleLinear } from "d3-scale";
import { ParentSize } from "@visx/responsive";
import { useTooltip, TooltipWithBounds } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import {
  useYearSelection,
  useCountrySelection,
} from "../../hooks/useUrlParams";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import { useCountryName } from "../../queries/useCountryName";
import { VisualizationLoading } from "../shared";
import {
  STRATEGIC_POSITION_QUADRANTS,
  STRATEGIC_POSITION_COLORS,
  mapPolicyRecommendationToPosition,
  STRATEGIC_POSITION_DESCRIPTIONS,
} from "../../utils/strategicPositionConstants";
import { useImageCaptureContext } from "../../hooks/useImageCaptureContext";
// no theme utils used here
import html2canvas from "html2canvas";

// Colors come from centralized constants (single source of truth)

// Helper to get flag asset path from `src/assets/country_flags`
// Uses webpack's require.context (available in CRA) to dynamically resolve flags
const flagContext = require.context(
  "../../../../../assets/country_flags",
  false,
  /^\.\/Flag-.*\.(svg|png)$/,
);

const getFlagSrc = (iso3Code) => {
  const keys = flagContext.keys();
  const upper = (iso3Code || "").toUpperCase();
  const candidates = [`./Flag-${upper}.svg`, `./Flag-${upper}.png`];

  for (const k of candidates) {
    if (keys.includes(k)) {
      const mod = flagContext(k);
      return mod && (mod.default || mod);
    }
  }

  const fallback = "./Flag-Undeclared.png";
  if (keys.includes(fallback)) {
    const mod = flagContext(fallback);
    return mod && (mod.default || mod);
  }
  return null;
};

// Internal component that receives dimensions from ParentSize
// Updated to use API policy_recommendation field instead of naive quadrant calculation
const StrategicPositionChartInternal = ({ width, height }) => {
  const selectedYear = useYearSelection();
  const selectedCountryId = useCountrySelection();
  const countryName = useCountryName();
  const xVar = "xResid"; // Fixed to use residual variable

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Image capture functionality
  const chartContainerRef = useRef(null);
  const { registerCaptureFunction, unregisterCaptureFunction } =
    useImageCaptureContext();

  // Use visx tooltip state
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  // Container ref for SVG (for mouse coords)
  const containerRef = useRef(null);

  // Use shared hook for all countries metrics
  const { allCountriesMetrics, isLoading, hasErrors } = useGreenGrowthData(
    null, // No specific country selection needed for this chart
    Number.parseInt(selectedYear),
    true, // Fetch all countries metrics
  );

  // Map to expected format for compatibility
  const countryMetrics = allCountriesMetrics;
  // Only show loading if we have no data to display
  const loading = isLoading && allCountriesMetrics.length === 0;
  const error = hasErrors;

  // Calculate responsive dimensions using provided width/height
  const { chartWidth, chartHeight, margin } = useMemo(() => {
    const adjustedWidth = Math.max(width - 50, 300); // Minimal padding

    // Account for fixed elements: title (60px + 8px margin), attribution (~30px), container padding (16px)
    const fixedElementsHeight = isMobile ? 110 : 120;
    const adjustedHeight = Math.max(height - fixedElementsHeight, 300);

    const responsiveMargin = {
      top: isMobile ? 40 : 50,
      right: isMobile ? 20 : 40,
      bottom: isMobile ? 80 : 120, // Increased mobile bottom margin from 50 to 80
      left: isMobile ? 60 : 80,
    };

    return {
      chartWidth: adjustedWidth,
      chartHeight: adjustedHeight,
      margin: responsiveMargin,
    };
  }, [width, height, isMobile]);

  // D3 scales - adjusted to account for circle radius and internal margin
  const xScale = useMemo(() => {
    if (!countryMetrics.length) return null;
    const values = countryMetrics.map((d) => Number(d[xVar]));
    const maxRadius = isMobile ? 12 : 16; // Account for largest halo radius
    const internalMargin = 60; // Add internal margin inside the grid to prevent overlap with labels
    return scaleLinear()
      .domain([Math.min(...values), Math.max(...values)])
      .range([
        margin.left + maxRadius + internalMargin,
        chartWidth - margin.right - maxRadius - internalMargin,
      ]);
  }, [countryMetrics, margin.left, chartWidth, margin.right, isMobile]);

  const yScale = useMemo(() => {
    if (!countryMetrics.length) return null;
    const values = countryMetrics.map((d) => Number(d.coiGreen));
    const maxRadius = isMobile ? 12 : 16; // Account for largest halo radius
    const internalMargin = 60; // Add internal margin inside the grid to prevent overlap with labels
    return scaleLinear()
      .domain([Math.min(...values), Math.max(...values)])
      .range([
        chartHeight - margin.bottom - maxRadius - internalMargin,
        margin.top + maxRadius + internalMargin,
      ]);
  }, [countryMetrics, chartHeight, margin.bottom, margin.top, isMobile]);

  // Shared tooltip styling for quadrant labels (white background, black text)
  const quadrantTooltipProps = useMemo(
    () => ({
      arrow: true,
      enterTouchDelay: 0,
      componentsProps: {
        tooltip: {
          sx: {
            bgcolor: "#FFFFFF",
            color: "#000000",
            border: "1px solid #DBDBDB",
            boxShadow: "0 0 4px 1px rgba(0, 0, 0, 0.10)",
            fontSize: isMobile ? 12 : 14,
            p: 1,
            maxWidth: 420,
            lineHeight: 1.4,
            zIndex: 1000,
          },
        },
        arrow: {
          sx: { color: "#FFFFFF" },
        },
      },
    }),
    [isMobile],
  );

  // Ensure x-axis annotations stay visible regardless of container height
  // Position x-axis annotations relative to the plot frame (just below it)
  const xAxisLabelY = useMemo(() => {
    const plotBottomY = chartHeight - margin.bottom;
    return plotBottomY + (isMobile ? 18 : 26);
  }, [chartHeight, margin.bottom, isMobile]);
  const xAxisArrowY = useMemo(() => {
    const plotBottomY = chartHeight - margin.bottom;
    // Add a bit more space between the centered label and the arrows
    return plotBottomY + (isMobile ? 38 : 48);
  }, [chartHeight, margin.bottom, isMobile]);

  // Precompute point centers for hover detection at the SVG level
  const pointCenters = useMemo(() => {
    if (!xScale || !yScale) return [];
    return countryMetrics.map((country) => ({
      country,
      cx: xScale(Number(country[xVar])),
      cy: yScale(country.coiGreen),
    }));
  }, [countryMetrics, xScale, yScale]);

  // Handle hover on the SVG container to avoid making polygons interactive elements
  const handleMouseMove = useCallback(
    (event) => {
      if (!pointCenters.length) return;
      const coords = localPoint(event.currentTarget, event);
      if (!coords) return;

      let closest = null;
      let minDistSq = Infinity;
      for (const p of pointCenters) {
        const dx = p.cx - coords.x;
        const dy = p.cy - coords.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < minDistSq) {
          minDistSq = d2;
          closest = p;
        }
      }

      const threshold = isMobile ? 196 : 144; // squared pixels (~14px / 12px radius)
      if (closest && minDistSq <= threshold) {
        showTooltip({
          tooltipData: closest.country,
          tooltipLeft: closest.cx,
          tooltipTop: closest.cy,
        });
      } else {
        hideTooltip();
      }
    },
    [pointCenters, isMobile, showTooltip, hideTooltip],
  );

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
            a.download = `strategic_position_${selectedCountryId}_${selectedYear}.png`;
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
  }, [
    registerCaptureFunction,
    unregisterCaptureFunction,
    selectedCountryId,
    selectedYear,
  ]);

  if (loading) {
    return <VisualizationLoading />;
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography color="error">
          Error loading data: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!countryMetrics.length || !xScale || !yScale) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography>No data available for {selectedYear}</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={chartContainerRef}
      sx={{ padding: "8px", width: "100%", height: "100%" }}
    >
      {/* Title */}
      <Box
        sx={{
          height: 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          mb: 1,
        }}
      >
        <Typography variant="chart-title">
          Recommended Strategic Approach
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 1,
          position: "relative",
        }}
      >
        <svg
          ref={containerRef}
          width={chartWidth}
          height={chartHeight}
          style={{ background: "white" }}
          role="img"
          aria-label="Strategic Position in Green Growth"
          aria-describedby="strategic-position-desc"
          onMouseMove={handleMouseMove}
          onMouseLeave={hideTooltip}
        >
          <desc id="strategic-position-desc">
            Scatterplot of countries' strategic position in green growth. Each
            triangle is a country; hover to view policy approach and year.
          </desc>
          {/* Chart background */}
          <rect
            x={margin.left}
            y={margin.top}
            width={chartWidth - margin.left - margin.right}
            height={chartHeight - margin.top - margin.bottom}
            fill="white"
            stroke="none"
          />

          {/* Definitions */}
          <defs>
            <clipPath id="plot-area">
              <rect
                x={margin.left - 10}
                y={margin.top - 10}
                width={chartWidth - margin.left - margin.right + 20}
                height={chartHeight - margin.top - margin.bottom + 20}
              />
            </clipPath>
            <linearGradient id="coiGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#b3e283" />
              <stop offset="100%" stopColor="#1a7f37" />
            </linearGradient>
          </defs>

          {/* Grid lines - 1px solid rgb(223,223,223), every other line removed */}
          <g>
            {/* Vertical grid lines */}
            {Array.from({ length: 6 }, (_, i) => {
              const x =
                margin.left +
                (i * (chartWidth - margin.left - margin.right)) / 5;
              return (
                <line
                  key={`v-grid-${chartWidth}-${margin.left}-${i}`}
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={chartHeight - margin.bottom}
                  stroke="rgb(223,223,223)"
                  strokeWidth="1"
                />
              );
            })}
            {/* Horizontal grid lines */}
            {Array.from({ length: 6 }, (_, i) => {
              const y =
                margin.top +
                (i * (chartHeight - margin.top - margin.bottom)) / 5;
              return (
                <line
                  key={`h-grid-${chartHeight}-${margin.top}-${i}`}
                  x1={margin.left}
                  y1={y}
                  x2={chartWidth - margin.right}
                  y2={y}
                  stroke="rgb(223,223,223)"
                  strokeWidth="1"
                />
              );
            })}
          </g>

          {/* Rectangle frame with 1px rgb(51,51,51) border */}
          <rect
            x={margin.left}
            y={margin.top}
            width={chartWidth - margin.left - margin.right}
            height={chartHeight - margin.top - margin.bottom}
            fill="none"
            stroke="rgb(51,51,51)"
            strokeWidth="1"
          />

          {/* Axis labels */}
          <text
            x={chartWidth / 2}
            y={xAxisLabelY}
            textAnchor="middle"
            fontSize="16"
            fontWeight="600"
            fill="black"
          >
            Country's Economy Complexity
          </text>
          <text
            x={isMobile ? 30 : 50}
            y={chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${isMobile ? 30 : 50} ${chartHeight / 2})`}
            fontSize="16"
            fontWeight="600"
            fill="black"
          >
            Is the Country well-connected to Green Growth Opportunities?
          </text>

          {/* Arrow indicators */}
          <text
            x={chartWidth / 2 - 100}
            y={xAxisArrowY}
            textAnchor="middle"
            fontSize="18"
            fontWeight="600"
            fill="#2685bd"
          >
            ← Less Complex
          </text>
          <text
            x={chartWidth / 2 + 100}
            y={xAxisArrowY}
            textAnchor="middle"
            fontSize="18"
            fontWeight="600"
            fill="#2685bd"
          >
            More Complex →
          </text>

          {/* Y-axis direction indicators - positioned inside y-axis label */}
          <text
            x={16}
            y={chartHeight / 2 - 100}
            textAnchor="middle"
            fontSize="18"
            fontWeight="600"
            fill="#2685bd"
            transform={`rotate(-90 16 ${chartHeight / 2 - 100})`}
          >
            Well Connected →
          </text>
          <text
            x={16}
            y={chartHeight / 2 + 100}
            textAnchor="middle"
            fontSize="18"
            fontWeight="600"
            fill="#2685bd"
            transform={`rotate(-90 16 ${chartHeight / 2 + 100})`}
          >
            ← Not Well Connected
          </text>

          {/* Data points */}
          <g clipPath="url(#plot-area)">
            {/* First draw halos for selected points */}
            {countryMetrics.map((country) => {
              const isSelected = country.countryId === selectedCountryId;
              if (!isSelected) return null;

              const x = Number(country[xVar]);
              const y = country.coiGreen;

              // Use policy colors from spec - map policy recommendation to colors
              const { quadrant } = mapPolicyRecommendationToPosition(
                country.policyRecommendation,
              );
              const fillColor = STRATEGIC_POSITION_COLORS[quadrant] || "#ccc";

              // Create triangle points for halo
              const size = isMobile ? 12 : 16;
              const centerX = xScale(x);
              const centerY = yScale(y);
              const points = `${centerX},${centerY - size} ${centerX - size * 0.866},${centerY + size * 0.5} ${centerX + size * 0.866},${centerY + size * 0.5}`;

              return (
                <polygon
                  key={`halo-${country.countryId}`}
                  points={points}
                  fill={fillColor}
                  opacity={0.5}
                  stroke="none"
                />
              );
            })}

            {/* Then draw all data points as triangles */}
            {countryMetrics.map((country) => {
              const x = Number(country[xVar]);
              const y = country.coiGreen;

              // Use policy colors from spec - map policy recommendation to colors
              const { quadrant } = mapPolicyRecommendationToPosition(
                country.policyRecommendation,
              );
              const fillColor = STRATEGIC_POSITION_COLORS[quadrant] || "#ccc";

              // Create triangle points
              const size = isMobile ? 4 : 6;
              const centerX = xScale(x);
              const centerY = yScale(y);
              const points = `${centerX},${centerY - size} ${centerX - size * 0.866},${centerY + size * 0.5} ${centerX + size * 0.866},${centerY + size * 0.5}`;

              return (
                <polygon
                  key={country.countryId}
                  points={points}
                  fill={fillColor}
                  fillOpacity={0.9}
                  stroke="black"
                  strokeWidth="1"
                  strokeOpacity={1}
                  aria-label={`Data point for ${country.nameEn}`}
                />
              );
            })}
          </g>

          {/* Selected country label */}
          {countryMetrics.find((c) => c.countryId === selectedCountryId) && (
            <g>
              {(() => {
                const selectedCountry = countryMetrics.find(
                  (c) => c.countryId === selectedCountryId,
                );
                const x = xScale(Number(selectedCountry[xVar]));
                const y = yScale(selectedCountry.coiGreen);
                const flagSrc = getFlagSrc(selectedCountry.iso3Code);

                // Position the label centered horizontally above the triangle
                const selectedTriangleSize = isMobile ? 12 : 16; // matches halo size
                const labelPaddingX = 8;
                const flagWidth = isMobile ? 16 : 18;
                const flagHeight = isMobile ? 12 : 12;
                const approxCharWidth = isMobile ? 8 : 9.5;
                const textWidth = countryName.length * approxCharWidth;
                const labelWidth =
                  flagWidth + labelPaddingX + textWidth + labelPaddingX * 2;
                const labelHeight = isMobile ? 20 : 24;
                const rectX = x - labelWidth / 2;
                const rectY = y - selectedTriangleSize - labelHeight - 8;

                return (
                  <>
                    <rect
                      x={rectX}
                      y={rectY}
                      width={labelWidth}
                      height={labelHeight}
                      fill="white"
                      stroke="rgb(51,51,51)"
                      strokeWidth={1}
                      rx={0}
                    />
                    {/* Flag image */}
                    {flagSrc && (
                      <image
                        href={flagSrc}
                        x={rectX + labelPaddingX}
                        y={rectY + (labelHeight - flagHeight) / 2}
                        width={flagWidth}
                        height={flagHeight}
                        preserveAspectRatio="xMidYMid meet"
                      />
                    )}
                    <text
                      x={rectX + labelPaddingX + flagWidth + labelPaddingX}
                      y={rectY + labelHeight / 2 + (isMobile ? 4 : 4)}
                      fontSize="16"
                      fontWeight="600"
                      fill="black"
                    >
                      {countryName}
                    </text>
                  </>
                );
              })()}
            </g>
          )}
        </svg>

        {/* HTML Overlay for Quadrant Labels */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            // Keep container non-interactive; individual labels will enable pointer events
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {(() => {
            // Determine selected country's quadrant for highlighting
            const selectedCountry = countryMetrics.find(
              (c) => c.countryId === selectedCountryId,
            );
            const selectedQuadrant = selectedCountry
              ? mapPolicyRecommendationToPosition(
                  selectedCountry.policyRecommendation,
                ).quadrant
              : null;

            return (
              <>
                {/* Quadrant labels with appropriate styling */}
                {/* Top right - Harness Nearby Opportunities */}
                <Tooltip
                  {...quadrantTooltipProps}
                  title={STRATEGIC_POSITION_DESCRIPTIONS.topRight}
                  sx={{ cursor: "help" }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: `${margin.top + 1}px`,
                      right: `${margin.right + 20}px`,
                      backgroundColor:
                        selectedQuadrant === "topRight"
                          ? STRATEGIC_POSITION_COLORS.topRight
                          : "white",
                      color:
                        selectedQuadrant === "topRight"
                          ? "white"
                          : STRATEGIC_POSITION_COLORS.topRight,
                      padding: isMobile ? "4px 8px" : "6px 12px",
                      borderRadius: "4px",
                      fontSize: isMobile ? "12px" : "16px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      pointerEvents: "auto",
                    }}
                  >
                    <BookmarkIcon
                      sx={{ fontSize: isMobile ? "14px" : "18px" }}
                    />
                    <span
                      style={{
                        borderBottom:
                          selectedQuadrant === "topRight"
                            ? "1px solid white"
                            : `1px solid ${STRATEGIC_POSITION_COLORS.topRight}`,
                        paddingBottom: "1px",
                      }}
                    >
                      {STRATEGIC_POSITION_QUADRANTS.topRight}
                    </span>
                  </div>
                </Tooltip>

                {/* Top left - Climb the Complexity Ladder */}
                <Tooltip
                  {...quadrantTooltipProps}
                  title={STRATEGIC_POSITION_DESCRIPTIONS.topLeft}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: `${margin.top + 1}px`,
                      left: `${margin.left + 20}px`,
                      backgroundColor:
                        selectedQuadrant === "topLeft"
                          ? STRATEGIC_POSITION_COLORS.topLeft
                          : "white",
                      color:
                        selectedQuadrant === "topLeft"
                          ? "white"
                          : STRATEGIC_POSITION_COLORS.topLeft,
                      padding: isMobile ? "4px 8px" : "6px 12px",
                      borderRadius: "4px",
                      fontSize: isMobile ? "12px" : "16px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      pointerEvents: "auto",
                    }}
                  >
                    <BookmarkIcon
                      sx={{ fontSize: isMobile ? "14px" : "18px" }}
                    />
                    <span
                      style={{
                        borderBottom:
                          selectedQuadrant === "topLeft"
                            ? "1px solid white"
                            : `1px solid ${STRATEGIC_POSITION_COLORS.topLeft}`,
                        paddingBottom: "1px",
                      }}
                    >
                      {STRATEGIC_POSITION_QUADRANTS.topLeft}
                    </span>
                  </div>
                </Tooltip>

                {/* Bottom left - Reinvent Industrial Base */}
                <Tooltip
                  {...quadrantTooltipProps}
                  title={STRATEGIC_POSITION_DESCRIPTIONS.bottomLeft}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: `${margin.bottom + 1}px`,
                      left: `${margin.left + 20}px`,
                      backgroundColor:
                        selectedQuadrant === "bottomLeft"
                          ? STRATEGIC_POSITION_COLORS.bottomLeft
                          : "white",
                      color:
                        selectedQuadrant === "bottomLeft"
                          ? "white"
                          : STRATEGIC_POSITION_COLORS.bottomLeft,
                      padding: isMobile ? "4px 8px" : "6px 12px",
                      borderRadius: "4px",
                      fontSize: isMobile ? "12px" : "16px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      pointerEvents: "auto",
                    }}
                  >
                    <BookmarkIcon
                      sx={{ fontSize: isMobile ? "14px" : "18px" }}
                    />
                    <span
                      style={{
                        borderBottom:
                          selectedQuadrant === "bottomLeft"
                            ? "1px solid white"
                            : `1px solid ${STRATEGIC_POSITION_COLORS.bottomLeft}`,
                        paddingBottom: "1px",
                      }}
                    >
                      {STRATEGIC_POSITION_QUADRANTS.bottomLeft}
                    </span>
                  </div>
                </Tooltip>

                {/* Bottom right - Maintain Competitive Edge */}
                <Tooltip
                  {...quadrantTooltipProps}
                  title={STRATEGIC_POSITION_DESCRIPTIONS.bottomRight}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: `${margin.bottom + 1}px`,
                      right: `${margin.right + 20}px`,
                      backgroundColor:
                        selectedQuadrant === "bottomRight"
                          ? STRATEGIC_POSITION_COLORS.bottomRight
                          : "white",
                      color:
                        selectedQuadrant === "bottomRight"
                          ? "white"
                          : STRATEGIC_POSITION_COLORS.bottomRight,
                      padding: isMobile ? "4px 8px" : "6px 12px",
                      borderRadius: "4px",
                      fontSize: isMobile ? "12px" : "16px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      pointerEvents: "auto",
                    }}
                  >
                    <BookmarkIcon
                      sx={{ fontSize: isMobile ? "14px" : "18px" }}
                    />
                    <span
                      style={{
                        borderBottom:
                          selectedQuadrant === "bottomRight"
                            ? "1px solid white"
                            : `1px solid ${STRATEGIC_POSITION_COLORS.bottomRight}`,
                        paddingBottom: "1px",
                      }}
                    >
                      {STRATEGIC_POSITION_QUADRANTS.bottomRight}
                    </span>
                  </div>
                </Tooltip>
              </>
            );
          })()}
        </div>
      </Box>

      {/* Visx Tooltip in Portal */}
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          left={(tooltipLeft || 0) + 14}
          top={(tooltipTop || 0) + 14}
          className="gg-unskinned-tooltip"
          // Ensure this tooltip renders above quadrant label overlay
          style={{ zIndex: 10, position: "absolute" }}
        >
          {/* Shared tooltip: Country name, Policy approach, Year */}
          {/* We keep formatting consistent with other tooltips */}
          {(() => {
            const rows = [
              {
                label: "Policy Approach:",
                value: tooltipData.policyRecommendation || "-",
              },
              { label: "Year:", value: Number.parseInt(selectedYear) },
            ];
            return (
              <Box
                sx={{
                  border: "1px solid #DBDBDB",
                  boxShadow: "0 0 4px 1px rgba(0, 0, 0, 0.10)",
                  backgroundColor: "#FFFFFF",
                  minWidth: 260,
                }}
              >
                <Box sx={{ backgroundColor: "#ECECEC", px: 1, py: 0.5 }}>
                  <Typography
                    sx={{ fontWeight: 600 }}
                    variant="chart-tooltip-title"
                  >
                    {tooltipData.nameEn}
                  </Typography>
                </Box>
                <Box sx={{ px: 1, py: 0.5 }}>
                  {rows.map((r) => (
                    <Box
                      key={String(r.label)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        py: 0.25,
                      }}
                    >
                      <Typography
                        variant="chart-tooltip-content"
                        sx={{ display: "block" }}
                      >
                        {r.label}
                      </Typography>
                      <Typography
                        variant="chart-tooltip-content"
                        sx={{ display: "block", fontWeight: 600 }}
                      >
                        {r.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })()}
        </TooltipWithBounds>
      )}
    </Box>
  );
};

const StrategicPositionChart = () => {
  return (
    <ParentSize>
      {({ width, height }) => {
        if (width === 0 || height === 0) {
          return null;
        }
        return <StrategicPositionChartInternal width={width} height={height} />;
      }}
    </ParentSize>
  );
};

export default StrategicPositionChart;

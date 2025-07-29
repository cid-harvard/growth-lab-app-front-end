import React, { useState, useMemo, useCallback, useRef } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { scaleLinear } from "d3-scale";
import { ParentSize } from "@visx/responsive";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
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
} from "../../utils/strategicPositionConstants";
import { useImageCaptureContext } from "../../hooks/useImageCaptureContext";
import { themeUtils } from "../../theme";
import html2canvas from "html2canvas";

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

  // Use visx tooltip in portal for better positioning and z-index
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

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
    const adjustedHeight = Math.max(height - 20, 300); // Minimal padding

    const responsiveMargin = {
      top: isMobile ? 40 : 50,
      right: isMobile ? 20 : 40,
      bottom: isMobile ? 50 : 120,
      left: isMobile ? 60 : 80,
    };

    return {
      chartWidth: adjustedWidth,
      chartHeight: adjustedHeight,
      margin: responsiveMargin,
    };
  }, [width, height, isMobile]);

  // D3 scales - adjusted to account for circle radius so all points fit within grid
  const xScale = useMemo(() => {
    if (!countryMetrics.length) return null;
    const values = countryMetrics.map((d) => Number(d[xVar]));
    const maxRadius = isMobile ? 12 : 16; // Account for largest halo radius
    return scaleLinear()
      .domain([Math.min(...values), Math.max(...values)])
      .range([margin.left + maxRadius, chartWidth - margin.right - maxRadius]);
  }, [countryMetrics, xVar, margin.left, chartWidth, margin.right, isMobile]);

  const yScale = useMemo(() => {
    if (!countryMetrics.length) return null;
    const values = countryMetrics.map((d) => Number(d.coiGreen));
    const maxRadius = isMobile ? 12 : 16; // Account for largest halo radius
    return scaleLinear()
      .domain([Math.min(...values), Math.max(...values)])
      .range([chartHeight - margin.bottom - maxRadius, margin.top + maxRadius]);
  }, [countryMetrics, chartHeight, margin.bottom, margin.top, isMobile]);

  const handleMouseEnter = useCallback(
    (event, country) => {
      const coords = localPoint(event.target.ownerSVGElement, event);
      showTooltip({
        tooltipData: country,
        tooltipLeft: coords.x,
        tooltipTop: coords.y,
      });
    },
    [showTooltip],
  );

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

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
      sx={{ padding: "8px", width: "100%", height: "100%", overflow: "hidden" }}
    >
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
        >
          {/* Light grid background - no colored quadrants */}
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
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="0.5"
              />
            </pattern>
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

          {/* Light grid background */}
          <rect
            x={margin.left}
            y={margin.top}
            width={chartWidth - margin.left - margin.right}
            height={chartHeight - margin.top - margin.bottom}
            fill="url(#grid)"
          />

          {/* Axis labels */}
          <text
            x={chartWidth / 2}
            y={chartHeight - 40}
            textAnchor="middle"
            fontSize={isMobile ? "12" : "16"}
            fill={themeUtils.chart.colors.text.secondary}
            fontFamily={
              themeUtils.chart.typography["chart-axis-label"].fontFamily
            }
            fontWeight={
              themeUtils.chart.typography["chart-axis-label"].fontWeight
            }
          >
            Is the Country's Economy Complex?
          </text>
          <text
            x={isMobile ? 30 : 50}
            y={chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${isMobile ? 30 : 50} ${chartHeight / 2})`}
            fontSize={isMobile ? "12" : "16"}
            fill={themeUtils.chart.colors.text.secondary}
            fontFamily={
              themeUtils.chart.typography["chart-axis-label"].fontFamily
            }
            fontWeight={
              themeUtils.chart.typography["chart-axis-label"].fontWeight
            }
          >
            Is the Country well-connected to Green Growth Opportunities?
          </text>

          {/* Arrow indicators */}
          <text
            x={chartWidth / 2 - 100}
            y={chartHeight - 20}
            textAnchor="middle"
            fontSize={isMobile ? "10" : "16"}
            fontWeight={
              themeUtils.chart.typography["chart-axis-direction"].fontWeight
            }
            fill={themeUtils.chart.colors.text.secondary}
            fontFamily={
              themeUtils.chart.typography["chart-axis-direction"].fontFamily
            }
          >
            ← Less Complex
          </text>
          <text
            x={chartWidth / 2 + 100}
            y={chartHeight - 20}
            textAnchor="middle"
            fontSize={isMobile ? "10" : "16"}
            fontWeight={
              themeUtils.chart.typography["chart-axis-direction"].fontWeight
            }
            fill={themeUtils.chart.colors.text.secondary}
            fontFamily={
              themeUtils.chart.typography["chart-axis-direction"].fontFamily
            }
          >
            More Complex →
          </text>

          {/* Y-axis direction indicators - positioned inside y-axis label */}
          <text
            x={10}
            y={chartHeight / 2 - (isMobile ? 60 : 100)}
            textAnchor="middle"
            fontSize={isMobile ? "10" : "16"}
            transform={`rotate(-90 10 ${chartHeight / 2 - (isMobile ? 60 : 100)})`}
            fontWeight={
              themeUtils.chart.typography["chart-axis-direction"].fontWeight
            }
            fill={themeUtils.chart.colors.text.secondary}
            fontFamily={
              themeUtils.chart.typography["chart-axis-direction"].fontFamily
            }
          >
            Well Connected →
          </text>
          <text
            x={10}
            y={chartHeight / 2 + (isMobile ? 60 : 100)}
            textAnchor="middle"
            fontSize={isMobile ? "10" : "16"}
            transform={`rotate(-90 10 ${chartHeight / 2 + (isMobile ? 60 : 100)})`}
            fontWeight={
              themeUtils.chart.typography["chart-axis-direction"].fontWeight
            }
            fill={themeUtils.chart.colors.text.secondary}
            fontFamily={
              themeUtils.chart.typography["chart-axis-direction"].fontFamily
            }
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

              // Use API policy recommendation for classification
              const { fillColor } = mapPolicyRecommendationToPosition(
                country.policyRecommendation,
              );

              return (
                <circle
                  key={`halo-${country.countryId}`}
                  cx={xScale(x)}
                  cy={yScale(y)}
                  r={isMobile ? 12 : 16}
                  fill={fillColor}
                  opacity={0.5}
                  stroke="none"
                />
              );
            })}

            {/* Then draw all data points */}
            {countryMetrics.map((country) => {
              const isSelected = country.countryId === selectedCountryId;
              const x = Number(country[xVar]);
              const y = country.coiGreen;

              // Use API policy recommendation for classification
              const { fillColor } = mapPolicyRecommendationToPosition(
                country.policyRecommendation,
              );

              return (
                <circle
                  key={country.countryId}
                  cx={xScale(x)}
                  cy={yScale(y)}
                  r={isMobile ? 4 : 6}
                  fill={fillColor}
                  stroke="#333"
                  strokeWidth={1}
                  opacity={isSelected ? 1 : 0.8}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(event) => handleMouseEnter(event, country)}
                  onMouseLeave={handleMouseLeave}
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

                return (
                  <>
                    <rect
                      x={x + 15}
                      y={y - 20}
                      width={countryName.length * (isMobile ? 6 : 8) + 10}
                      height={isMobile ? 16 : 20}
                      fill="white"
                      stroke="#333"
                      strokeWidth={1}
                      rx={3}
                    />
                    <text
                      x={x + 20}
                      y={y - (isMobile ? 8 : 6)}
                      fontSize={isMobile ? "10" : "12"}
                      fontWeight="bold"
                      fill="#333"
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
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          {/* Top right - Green Growth Leaders */}
          <div
            style={{
              position: "absolute",
              top: `${margin.top}px`,
              right: `${margin.right + (isMobile ? 0 : 0)}px`,
              backgroundColor: STRATEGIC_POSITION_COLORS.topRight,
              color: "white",
              padding: isMobile ? "4px 8px" : "6px 12px",
              borderRadius: "4px",
              fontSize: isMobile ? "12px" : "16px",
              fontWeight: "600",
              whiteSpace: "nowrap",

              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <BookmarkIcon sx={{ fontSize: isMobile ? "14px" : "18px" }} />
            <span style={{ textDecoration: "underline" }}>
              {STRATEGIC_POSITION_QUADRANTS.topRight}
            </span>
          </div>

          {/* Top left - Well Connected, Low Complexity */}
          <div
            style={{
              position: "absolute",
              top: `${margin.top}px`,
              left: `${margin.left}px`,
              backgroundColor: STRATEGIC_POSITION_COLORS.topLeft,
              color: "white",
              padding: isMobile ? "4px 8px" : "6px 12px",
              borderRadius: "4px",
              fontSize: isMobile ? "12px" : "16px",
              fontWeight: "600",
              whiteSpace: "nowrap",

              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <BookmarkIcon sx={{ fontSize: isMobile ? "14px" : "18px" }} />
            <span style={{ textDecoration: "underline" }}>
              {STRATEGIC_POSITION_QUADRANTS.topLeft}
            </span>
          </div>

          {/* Bottom left - Emerging Opportunities */}
          <div
            style={{
              position: "absolute",
              bottom: `${margin.bottom - 40}px`,
              left: `${margin.left}px`,
              backgroundColor: STRATEGIC_POSITION_COLORS.bottomLeft,
              color: "white",
              padding: isMobile ? "4px 8px" : "6px 12px",
              borderRadius: "4px",
              fontSize: isMobile ? "12px" : "16px",
              fontWeight: "600",
              whiteSpace: "nowrap",

              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <BookmarkIcon sx={{ fontSize: isMobile ? "14px" : "18px" }} />
            <span style={{ textDecoration: "underline" }}>
              {STRATEGIC_POSITION_QUADRANTS.bottomLeft}
            </span>
          </div>

          {/* Bottom right - High Complexity, Not Well Connected */}
          <div
            style={{
              position: "absolute",
              bottom: `${margin.bottom - 40}px`,
              right: `${margin.right + (isMobile ? 0 : 0)}px`,
              backgroundColor: STRATEGIC_POSITION_COLORS.bottomRight,
              color: "white",
              padding: isMobile ? "4px 8px" : "6px 12px",
              borderRadius: "4px",
              fontSize: isMobile ? "12px" : "16px",
              fontWeight: "600",
              whiteSpace: "nowrap",

              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <BookmarkIcon sx={{ fontSize: isMobile ? "14px" : "18px" }} />
            <span style={{ textDecoration: "underline" }}>
              {STRATEGIC_POSITION_QUADRANTS.bottomRight}
            </span>
          </div>
        </div>
      </Box>

      {/* Visx Tooltip in Portal */}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          key={Math.random()}
          left={tooltipLeft}
          top={tooltipTop}
          zIndex={100}
        >
          <Box
            sx={{
              ...themeUtils.chart.getTooltipSx(),
              maxWidth: isMobile ? "200px" : "250px",
              textAlign: "left",
              zIndex: 10,
            }}
          >
            <Typography variant="chart-tooltip-title">
              {tooltipData.nameEn}
            </Typography>
            <Typography
              variant="chart-tooltip-content"
              sx={{ display: "block", mb: 0.5 }}
            >
              COI Green: {Number(tooltipData.coiGreen).toFixed(3)}
            </Typography>
            <Typography
              variant="chart-tooltip-content"
              sx={{ display: "block", mb: 0.5 }}
            >
              {xVar}: {Number(tooltipData[xVar]).toFixed(3)}
            </Typography>
            <Typography
              variant="chart-tooltip-content"
              sx={{ display: "block", mb: 0.5 }}
            >
              X Residual: {Number(tooltipData.xResid || 0).toFixed(3)}
            </Typography>
            {tooltipData.policyRecommendation && (
              <Typography
                variant="chart-tooltip-content"
                sx={{
                  display: "block",
                  fontWeight: "bold",
                }}
              >
                Policy: {tooltipData.policyRecommendation}
              </Typography>
            )}
          </Box>
        </TooltipInPortal>
      )}

      <Typography
        variant="chart-attribution"
        sx={{
          display: "block",
          textAlign: "right",
          mb: 1,
          mr: 2,
        }}
      >
        Source: Growth Lab research
      </Typography>
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

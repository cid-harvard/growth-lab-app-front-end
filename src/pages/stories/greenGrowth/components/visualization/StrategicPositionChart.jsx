import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useQuery, useApolloClient } from "@apollo/client";
import { scaleLinear } from "d3-scale";
import { ParentSize } from "@visx/responsive";
import {
  useYearSelection,
  useCountrySelection,
} from "../../hooks/useUrlParams";
import { GET_COUNTRIES, GET_COUNTRY_YEAR_METRICS } from "../../queries/shared";
import { useCountryName } from "../../queries/useCountryName";

const quadrantLabels = {
  topRight: "Green Growth Leaders",
  topLeft: "Well Connected, Low Complexity",
  bottomRight: "High Complexity, Not Well Connected",
  bottomLeft: "Emerging Opportunities",
};

const quadrantColors = {
  topLeft: "#4A90E2", // Blue
  topRight: "#7ED321", // Green
  bottomLeft: "#F5A623", // Orange
  bottomRight: "#FFD700", // Yellow/Gold
};

// Internal component that receives dimensions from ParentSize
const StrategicPositionChartInternal = ({ width, height }) => {
  const selectedYear = useYearSelection();
  const selectedCountryId = useCountrySelection();
  const countryName = useCountryName();
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const xVar = "xResid"; // Fixed to use residual variable
  const [countryMetrics, setCountryMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const client = useApolloClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Calculate responsive dimensions using provided width/height
  const { chartWidth, chartHeight, margin } = useMemo(() => {
    const calculatedWidth = Math.max(width - 40, 300); // Account for padding
    const calculatedHeight = Math.max(height - 40, 300); // Account for padding

    const responsiveMargin = {
      top: isMobile ? 60 : 80,
      right: isMobile ? 30 : 60,
      bottom: isMobile ? 60 : 80,
      left: isMobile ? 80 : 140,
    };

    return {
      chartWidth: calculatedWidth,
      chartHeight: calculatedHeight,
      margin: responsiveMargin,
    };
  }, [width, height, isMobile]);

  // Fetch countries data
  const { data: countriesData } = useQuery(GET_COUNTRIES);

  // Fetch metrics data for all countries individually
  useEffect(() => {
    if (!countriesData?.ggLocationCountryList || !selectedYear) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchAllCountryMetrics = async () => {
      try {
        const countries = countriesData.ggLocationCountryList;

        // Fetch data for each country in parallel
        const promises = countries.map(async (country) => {
          try {
            const { data } = await client.query({
              query: GET_COUNTRY_YEAR_METRICS,
              variables: {
                year: parseInt(selectedYear),
                countryId: country.countryId,
              },
            });

            const metrics = data.ggCountryYearList?.[0];
            if (metrics) {
              return {
                ...metrics,
                ...country,
              };
            }
            return null;
          } catch (err) {
            // Silently skip countries without data
            console.warn(
              `No data for country ${country.countryId}:`,
              err.message,
            );
            return null;
          }
        });

        const results = await Promise.all(promises);
        const validResults = results
          .filter(Boolean)
          .filter(
            (d) =>
              d.nameEn &&
              !isNaN(d.coiGreen) &&
              !isNaN(d[xVar]) &&
              d.coiGreen !== null &&
              d[xVar] !== null,
          );

        if (isMounted) {
          setCountryMetrics(validResults);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchAllCountryMetrics();

    return () => {
      isMounted = false;
    };
  }, [countriesData, selectedYear, xVar, client]);

  // D3 scales
  const xScale = useMemo(() => {
    if (!countryMetrics.length) return null;
    const values = countryMetrics.map((d) => Number(d[xVar]));
    return scaleLinear()
      .domain([Math.min(...values), Math.max(...values)])
      .range([margin.left, chartWidth - margin.right]);
  }, [countryMetrics, xVar, margin.left, chartWidth, margin.right]);

  const yScale = useMemo(() => {
    if (!countryMetrics.length) return null;
    const values = countryMetrics.map((d) => Number(d.coiGreen));
    return scaleLinear()
      .domain([Math.min(...values), Math.max(...values)])
      .range([chartHeight - margin.bottom, margin.top]);
  }, [countryMetrics, chartHeight, margin.bottom, margin.top]);

  // Calculate midpoints
  const { xMidPx, yMidPx } = useMemo(() => {
    if (!xScale || !yScale || !countryMetrics.length)
      return { xMidPx: 0, yMidPx: 0 };

    const xValues = countryMetrics.map((d) => Number(d[xVar]));
    const yValues = countryMetrics.map((d) => Number(d.coiGreen));
    const xMidData = (Math.min(...xValues) + Math.max(...xValues)) / 2;
    const yMidData = (Math.min(...yValues) + Math.max(...yValues)) / 2;

    return {
      xMidPx: xScale(xMidData),
      yMidPx: yScale(yMidData),
    };
  }, [xScale, yScale, countryMetrics, xVar]);

  const handleMouseEnter = useCallback((country) => {
    setHoveredCountry(country);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCountry(null);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography>Loading strategic position data...</Typography>
      </Box>
    );
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
      sx={{ px: 2, py: 1, width: "100%", height: "100%", overflow: "hidden" }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <svg
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

          {/* Main axis lines */}
          <line
            x1={margin.left}
            x2={chartWidth - margin.right}
            y1={yMidPx}
            y2={yMidPx}
            stroke="#000"
            strokeWidth="2"
          />
          <line
            x1={xMidPx}
            x2={xMidPx}
            y1={margin.top}
            y2={chartHeight - margin.bottom}
            stroke="#000"
            strokeWidth="2"
          />

          {/* Axis labels */}
          <text
            x={chartWidth / 2}
            y={chartHeight - 20}
            textAnchor="middle"
            fontSize={isMobile ? "12" : "14"}
            fill="#333"
            fontWeight="500"
          >
            Is the Country's Economy Complex?
          </text>
          <text
            x={isMobile ? 30 : 50}
            y={chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${isMobile ? 30 : 50} ${chartHeight / 2})`}
            fontSize={isMobile ? "12" : "14"}
            fill="#333"
            fontWeight="500"
          >
            Is the Country well-connected to Green Growth Opportunities?
          </text>

          {/* Arrow indicators */}
          <text
            x={margin.left + (isMobile ? 40 : 80)}
            y={chartHeight - 40}
            textAnchor="middle"
            fontSize={isMobile ? "10" : "12"}
            fill="#666"
          >
            ← Less Complex
          </text>
          <text
            x={chartWidth - margin.right - (isMobile ? 40 : 80)}
            y={chartHeight - 40}
            textAnchor="middle"
            fontSize={isMobile ? "10" : "12"}
            fill="#666"
          >
            More Complex →
          </text>

          {/* Y-axis direction indicators - positioned inside y-axis label */}
          <text
            x={10}
            y={chartHeight / 2 - (isMobile ? 60 : 100)}
            textAnchor="middle"
            fontSize={isMobile ? "10" : "12"}
            fill="#666"
            transform={`rotate(-90 10 ${chartHeight / 2 - (isMobile ? 60 : 100)})`}
          >
            Well Connected →
          </text>
          <text
            x={10}
            y={chartHeight / 2 + (isMobile ? 60 : 100)}
            textAnchor="middle"
            fontSize={isMobile ? "10" : "12"}
            fill="#666"
            transform={`rotate(-90 10 ${chartHeight / 2 + (isMobile ? 60 : 100)})`}
          >
            ← Not Well Connected
          </text>

          {/* Quadrant labels positioned at corners */}
          {/* Top right - Green Growth Leaders */}
          <g>
            <rect
              x={chartWidth - margin.right - (isMobile ? 130 : 170)}
              y={margin.top}
              width={isMobile ? 130 : 170}
              height={isMobile ? 20 : 25}
              fill={quadrantColors.topRight}
              rx={4}
            />
            <text
              x={chartWidth - margin.right - (isMobile ? 65 : 85)}
              y={margin.top + (isMobile ? 13 : 17)}
              textAnchor="middle"
              fontSize={isMobile ? "10" : "12"}
              fill="white"
              fontWeight="bold"
            >
              {quadrantLabels.topRight}
            </text>
          </g>

          {/* Top left - Well Connected, Low Complexity */}
          <g>
            <rect
              x={margin.left}
              y={margin.top}
              width={isMobile ? 160 : 200}
              height={isMobile ? 20 : 25}
              fill={quadrantColors.topLeft}
              rx={4}
            />
            <text
              x={margin.left + (isMobile ? 80 : 100)}
              y={margin.top + (isMobile ? 13 : 17)}
              textAnchor="middle"
              fontSize={isMobile ? "10" : "12"}
              fill="white"
              fontWeight="bold"
            >
              {quadrantLabels.topLeft}
            </text>
          </g>

          {/* Bottom left - Emerging Opportunities */}
          <g>
            <rect
              x={margin.left}
              y={chartHeight - margin.bottom - (isMobile ? 20 : 25)}
              width={isMobile ? 130 : 160}
              height={isMobile ? 20 : 25}
              fill={quadrantColors.bottomLeft}
              rx={4}
            />
            <text
              x={margin.left + (isMobile ? 65 : 80)}
              y={chartHeight - margin.bottom - (isMobile ? 7 : 8)}
              textAnchor="middle"
              fontSize={isMobile ? "10" : "12"}
              fill="white"
              fontWeight="bold"
            >
              {quadrantLabels.bottomLeft}
            </text>
          </g>

          {/* Bottom right - High Complexity, Not Well Connected */}
          <g>
            <rect
              x={chartWidth - margin.right - (isMobile ? 185 : 245)}
              y={chartHeight - margin.bottom - (isMobile ? 20 : 25)}
              width={isMobile ? 185 : 245}
              height={isMobile ? 20 : 25}
              fill={quadrantColors.bottomRight}
              rx={4}
            />
            <text
              x={chartWidth - margin.right - (isMobile ? 92 : 122)}
              y={chartHeight - margin.bottom - (isMobile ? 7 : 8)}
              textAnchor="middle"
              fontSize={isMobile ? "10" : "12"}
              fill="black"
              fontWeight="bold"
            >
              {quadrantLabels.bottomRight}
            </text>
          </g>

          {/* Data points */}
          <g clipPath="url(#plot-area)">
            {countryMetrics.map((country) => {
              const isSelected = country.countryId === selectedCountryId;
              const x = Number(country[xVar]);
              const y = country.coiGreen;

              // Determine quadrant and color
              let fillColor;
              const isAboveMidY =
                y > (yScale.domain()[0] + yScale.domain()[1]) / 2;
              const isRightOfMidX =
                x > (xScale.domain()[0] + xScale.domain()[1]) / 2;

              if (isAboveMidY && !isRightOfMidX) {
                fillColor = quadrantColors.topLeft; // Blue
              } else if (isAboveMidY && isRightOfMidX) {
                fillColor = quadrantColors.topRight; // Green
              } else if (!isAboveMidY && !isRightOfMidX) {
                fillColor = quadrantColors.bottomLeft; // Orange
              } else {
                fillColor = quadrantColors.bottomRight; // Orange/Yellow
              }

              return (
                <circle
                  key={country.countryId}
                  cx={xScale(x)}
                  cy={yScale(y)}
                  r={isSelected ? (isMobile ? 6 : 8) : isMobile ? 4 : 6}
                  fill={fillColor}
                  stroke={isSelected ? "#000" : "#333"}
                  strokeWidth={isSelected ? (isMobile ? 2 : 3) : 1}
                  opacity={isSelected ? 1 : 0.8}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => handleMouseEnter(country)}
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

          {/* Tooltip */}
          {hoveredCountry && (
            <g>
              <rect
                x={xScale(Number(hoveredCountry[xVar])) + 10}
                y={yScale(hoveredCountry.coiGreen) - (isMobile ? 70 : 80)}
                width={isMobile ? 160 : 200}
                height={isMobile ? 70 : 90}
                fill="#fff"
                stroke="#333"
                rx={6}
                opacity={0.95}
              />
              <text
                x={xScale(Number(hoveredCountry[xVar])) + 20}
                y={yScale(hoveredCountry.coiGreen) - (isMobile ? 55 : 60)}
                fontSize={isMobile ? "10" : "12"}
                fontWeight="bold"
                fill="#333"
              >
                {hoveredCountry.nameEn}
              </text>
              <text
                x={xScale(Number(hoveredCountry[xVar])) + 20}
                y={yScale(hoveredCountry.coiGreen) - (isMobile ? 42 : 45)}
                fontSize={isMobile ? "9" : "11"}
                fill="#666"
              >
                COI Green: {Number(hoveredCountry.coiGreen).toFixed(3)}
              </text>
              <text
                x={xScale(Number(hoveredCountry[xVar])) + 20}
                y={yScale(hoveredCountry.coiGreen) - (isMobile ? 29 : 30)}
                fontSize={isMobile ? "9" : "11"}
                fill="#666"
              >
                {xVar}: {Number(hoveredCountry[xVar]).toFixed(3)}
              </text>
              <text
                x={xScale(Number(hoveredCountry[xVar])) + 20}
                y={yScale(hoveredCountry.coiGreen) - (isMobile ? 16 : 15)}
                fontSize={isMobile ? "9" : "11"}
                fill="#666"
              >
                X Residual: {Number(hoveredCountry.xResid || 0).toFixed(3)}
              </text>
            </g>
          )}
        </svg>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          textAlign: "right",
          mb: 1,
          mr: 2,
          fontSize: isMobile ? "10px" : "12px",
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
      {({ width, height }) => (
        <StrategicPositionChartInternal width={width} height={height} />
      )}
    </ParentSize>
  );
};

export default StrategicPositionChart;

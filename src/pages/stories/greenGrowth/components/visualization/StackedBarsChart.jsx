import React, { useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import { ParentSize } from "@visx/responsive";
import { Tooltip, useTooltip } from "@visx/tooltip";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import { useStackedBars } from "./useStackedBars";

// Formatter for currency values
export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  compactDisplay: "short",
});

// Simple Expected Overlay component
const SimpleExpectedOverlay = ({ overlay, bars, isMobile }) => {
  const actualValue = Array.from(bars.values())
    .filter((bar) => bar.parentId === overlay.parentId)
    .reduce((sum, bar) => sum + bar.exportValue, 0);

  return (
    <g key={`supply-chain-${overlay.parentId}`}>
      <rect
        x={overlay.coords[0][0]}
        y={overlay.coords[0][1]}
        width={5}
        height={overlay.coords[1][1] - overlay.coords[0][1]}
        fill="black"
        fillOpacity={0.7}
      />

      <text
        x={isMobile ? 10 : 60}
        y={overlay.coords[0][1] - 8}
        fontSize={isMobile ? "12px" : "14px"}
        textAnchor="start"
        fontWeight="600"
        fill="#333"
      >
        {overlay.name} Actual: {formatter.format(actualValue)} | World Avg:{" "}
        {formatter.format(overlay.expectedTotal)}
      </text>
    </g>
  );
};

// Toggle Button Component
const ToggleButton = ({ active, onClick, children }) => (
  <Button
    variant={active ? "contained" : "outlined"}
    onClick={onClick}
    size="small"
    sx={{
      fontSize: "12px",
      textTransform: "none",
      minWidth: "auto",
      padding: "4px 8px",
    }}
  >
    {children}
  </Button>
);

// Sort Button Component
const SortButton = ({ options, selected, direction, onChange, label }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <Typography variant="caption" sx={{ color: "#666", fontWeight: "500" }}>
      {label}
    </Typography>
    <ButtonGroup size="small" sx={{ height: "32px" }}>
      {options.map((option) => (
        <Button
          key={option.value}
          onClick={() => onChange(option.value)}
          sx={{
            backgroundColor: selected === option.value ? "#007acc" : "#fff",
            color: selected === option.value ? "#fff" : "#333",
            border: "1px solid #ddd",
            fontSize: "12px",
            textTransform: "none",
            padding: "4px 12px",
            "&:hover": {
              backgroundColor:
                selected === option.value ? "#005c99" : "#f8f9fa",
            },
          }}
        >
          {option.label}{" "}
          {selected === option.value && (direction === "desc" ? "↓" : "↑")}
        </Button>
      ))}
    </ButtonGroup>
  </Box>
);

// Internal component that receives dimensions from ParentSize
const StackedBarsChartInternal = ({ year, countryId, width, height }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Use visx tooltip
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  // State for controls
  const [groupBy, setGroupBy] = useState("clusters");
  const [sortBy, setSortBy] = useState("actual");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showAllGroups, setShowAllGroups] = useState(false);

  // Calculate dimensions - use available space with padding for controls
  const chartHeight = Math.max(height - 160, 300); // Account for controls at top

  // Get data from hook
  const { bars, expectedOverlays, groups, loading } = useStackedBars({
    year,
    countryId,
    width,
    height: chartHeight,
    legendHeight: 0,
    isMobile,
    groupBy,
    sortBy,
    sortDirection,
    showAllGroups,
  });

  // Handle sort option change
  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortBy(newSortBy);
      setSortDirection("desc");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Controls */}
      <Box
        sx={{
          padding: isMobile ? "16px 20px 12px" : "20px 40px 16px",
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          gap: isMobile ? "24px" : "40px",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "flex-start",
          position: "relative",
          zIndex: 10,
        }}
      >
        <ToggleButton
          active={groupBy === "clusters"}
          onClick={() => setGroupBy("clusters")}
        >
          Manufacturing Clusters
        </ToggleButton>

        <ToggleButton
          active={groupBy === "value-chains"}
          onClick={() => setGroupBy("value-chains")}
        >
          Value Chains
        </ToggleButton>

        <SortButton
          label="Sort by"
          options={[
            { value: "actual", label: "Actual Export Value" },
            { value: "world-average", label: "World Average" },
            { value: "missing-link", label: "Missing Link" },
          ]}
          selected={sortBy}
          direction={sortDirection}
          onChange={handleSortChange}
        />
      </Box>

      {/* Chart */}
      <Box sx={{ position: "relative" }}>
        <svg width={width} height={height} style={{ display: "block" }}>
          {/* Render bars */}
          {Array.from(bars.values()).map((bar) => (
            <path
              key={`${bar.id}-${bar.parentId}`}
              d={`M${bar.coords[0][0]},${bar.coords[0][1]} 
                  L${bar.coords[1][0]},${bar.coords[1][1]} 
                  L${bar.coords[2][0]},${bar.coords[2][1]} 
                  L${bar.coords[3][0]},${bar.coords[3][1]} Z`}
              fill={bar.fill}
              stroke="#fff"
              strokeWidth={1}
              onMouseEnter={(event) => {
                const svgElement = event.currentTarget.ownerSVGElement;
                const rect = svgElement.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                showTooltip({
                  tooltipData: bar,
                  tooltipLeft: x,
                  tooltipTop: y,
                });
              }}
              onMouseLeave={() => {
                hideTooltip();
              }}
              style={{ cursor: "pointer" }}
            />
          ))}

          {/* Render expected overlays */}
          {expectedOverlays.map((overlay) => (
            <SimpleExpectedOverlay
              key={overlay.parentId}
              overlay={overlay}
              bars={bars}
              isMobile={isMobile}
            />
          ))}
        </svg>

        {/* Show All button */}
        {!showAllGroups && groups && groups.length >= 10 && (
          <Box
            sx={{
              position: "absolute",
              bottom: "60px",
              left: isMobile ? "20px" : "40px",
              zIndex: 10,
            }}
          >
            <Button
              onClick={() => setShowAllGroups(true)}
              sx={{
                padding: "8px 16px",
                backgroundColor: "transparent",
                border: "1px solid #ddd",
                borderRadius: "4px",
                color: "#333",
                fontSize: "14px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                },
              }}
            >
              ↓ Show All {groupBy === "clusters" ? "Clusters" : "Value Chains"}
            </Button>
          </Box>
        )}
      </Box>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <Tooltip left={tooltipLeft} top={tooltipTop}>
          <Box sx={{ maxWidth: 300, padding: "8px" }}>
            <Typography
              sx={{
                fontSize: "16px",
                mb: 1,
                color: "black",
                fontWeight: "bold",
              }}
            >
              {tooltipData?.data?.product?.nameShortEn} (
              {tooltipData?.data?.product?.code})
            </Typography>

            <Box sx={{ display: "grid", gap: 1 }}>
              <Box>
                <Typography sx={{ color: "black", fontSize: "14px" }}>
                  <strong>Export Value:</strong>{" "}
                  {formatter.format(tooltipData?.exportValue || 0)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ color: "black", fontSize: "14px" }}>
                  <strong>Expected Exports:</strong>{" "}
                  {formatter.format(tooltipData?.expectedExports || 0)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ color: "black", fontSize: "14px" }}>
                  <strong>RCA:</strong>{" "}
                  {(tooltipData?.exportRca || 0).toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ color: "black", fontSize: "14px" }}>
                  <strong>Cluster:</strong> {tooltipData?.parent?.clusterName}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

const StackedBarsChart = ({ year, countryId }) => {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: "600px" }}>
      <ParentSize>
        {({ width, height }) => (
          <StackedBarsChartInternal
            year={year}
            countryId={countryId}
            width={width}
            height={height}
          />
        )}
      </ParentSize>
    </div>
  );
};

export default StackedBarsChart;

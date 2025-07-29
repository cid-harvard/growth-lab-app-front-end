import { useState, useMemo, useEffect, useRef } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ParentSize } from "@visx/responsive";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import { useVisualizationControls } from "../../hooks/useVisualizationControls";
import { useStrategicPosition } from "../../hooks/useStrategicPosition";
import { useImageCaptureContext } from "../../hooks/useImageCaptureContext";

import {
  Typography,
  Box,
  Paper,
  Tooltip as MuiTooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";

import TableWrapper from "../shared/TableWrapper";
import { VisualizationControls } from "../shared";
import { themeUtils } from "../../theme";
import html2canvas from "html2canvas";

const createUniqueProductKey = (product) => {
  return `${product}`;
};

const getProductColor = (product) => {
  let hash = 0;
  for (let i = 0; i < product.length; i++) {
    hash = product.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `#${((hash & 0x00ffffff) | 0x1000000).toString(16).slice(1)}`;
  return color;
};

const CustomAxisLabel = ({ viewBox, value, axis }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isShort = useMediaQuery("(max-height:700px)");
  const { x, y, width, height } = viewBox;
  const isYAxis = axis === "y";

  if (isYAxis) {
    return (
      <g>
        <MuiTooltip
          title="Measures how valuable a product is based on the capabilities it will help a location develop"
          placement="right"
        >
          <text
            x={isMobile ? 30 : 50}
            y={y + height / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${isMobile ? 30 : 50} ${y + height / 2})`}
            fontSize={isMobile ? "12" : "16"}
            fill={themeUtils.chart.colors.text.secondary}
            textDecoration="underline"
            fontFamily={
              themeUtils.chart.typography["chart-axis-label"].fontFamily
            }
            fontWeight={
              themeUtils.chart.typography["chart-axis-label"].fontWeight
            }
          >
            ATTRACTIVENESS
          </text>
        </MuiTooltip>
        {!isShort && (
          <>
            <text
              x={10}
              y={y + height / 2 - (isMobile ? 60 : 100)}
              textAnchor="middle"
              transform={`rotate(-90 10 ${y + height / 2 - (isMobile ? 60 : 110)})`}
              fontSize={isMobile ? "10" : "16"}
              fill={themeUtils.chart.colors.text.secondary}
              fontWeight={
                themeUtils.chart.typography["chart-axis-direction"].fontWeight
              }
              fontFamily={
                themeUtils.chart.typography["chart-axis-direction"].fontFamily
              }
            >
              MORE ATTRACTIVE →
            </text>
            <text
              x={10}
              y={y + height / 2 + (isMobile ? 60 : 100)}
              textAnchor="middle"
              transform={`rotate(-90 10 ${y + height / 2 + (isMobile ? 60 : 90)})`}
              fontSize={isMobile ? "10" : "16"}
              fill={themeUtils.chart.colors.text.secondary}
              fontWeight={
                themeUtils.chart.typography["chart-axis-direction"].fontWeight
              }
              fontFamily={
                themeUtils.chart.typography["chart-axis-direction"].fontFamily
              }
            >
              ← LESS ATTRACTIVE
            </text>
          </>
        )}
      </g>
    );
  }

  return (
    <g>
      <MuiTooltip
        title="Measures the share of capabilities, skills, and know-how present in a location that is necessary to jumpstart a specific activity"
        placement="top"
      >
        <text
          x={x + width / 2}
          y={y + height}
          textAnchor="middle"
          fontSize={isMobile ? "12" : "16"}
          fill={themeUtils.chart.colors.text.secondary}
          textDecoration="underline"
          fontFamily={
            themeUtils.chart.typography["chart-axis-label"].fontFamily
          }
          fontWeight={
            themeUtils.chart.typography["chart-axis-label"].fontWeight
          }
        >
          FEASIBILITY
        </text>
      </MuiTooltip>
      {!isMobile && (
        <>
          <text
            x={x + width / 2 - 100}
            y={y + height + 30}
            textAnchor="middle"
            fontSize={isMobile ? "10" : "16"}
            fill={themeUtils.chart.colors.text.secondary}
            fontWeight={
              themeUtils.chart.typography["chart-axis-direction"].fontWeight
            }
            fontFamily={
              themeUtils.chart.typography["chart-axis-direction"].fontFamily
            }
          >
            ← LESS FEASIBLE
          </text>
          <text
            x={x + width / 2 + 100}
            y={y + height + 30}
            textAnchor="middle"
            fontSize={isMobile ? "10" : "16"}
            fill={themeUtils.chart.colors.text.secondary}
            fontWeight={
              themeUtils.chart.typography["chart-axis-direction"].fontWeight
            }
            fontFamily={
              themeUtils.chart.typography["chart-axis-direction"].fontFamily
            }
          >
            MORE FEASIBLE →
          </text>
        </>
      )}
    </g>
  );
};

// Helper function to format numbers with abbreviations
const formatValueWithAbbreviation = (value) => {
  if (value === 0) return "0";

  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1e12) {
    return `${sign}${(absValue / 1e12).toFixed(1)}T`;
  } else if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(1)}K`;
  } else {
    return `${sign}${absValue.toFixed(0)}`;
  }
};

// Helper function to calculate node size based on export value
const calculateNodeSize = (
  exportValue,
  minSize = 5,
  maxSize = 40,
  allExportValues = [],
) => {
  if (!exportValue || exportValue <= 0) return minSize;

  // If we have all export values, use relative scaling
  if (allExportValues.length > 0) {
    const validValues = allExportValues.filter((v) => v > 0);
    if (validValues.length > 1) {
      const minValue = Math.min(...validValues);
      const maxValue = Math.max(...validValues);

      // Use square root scaling for better visual distribution
      const normalizedValue =
        (Math.sqrt(exportValue) - Math.sqrt(minValue)) /
        (Math.sqrt(maxValue) - Math.sqrt(minValue));
      return minSize + normalizedValue * (maxSize - minSize);
    }
  }

  // Fallback to log scale for better visualization of export values
  const logValue = Math.log10(exportValue + 1);
  const normalizedSize = minSize + (logValue / 10) * (maxSize - minSize);
  return Math.max(minSize, Math.min(maxSize, normalizedSize));
};

// Legend component for ProductScatter
const ProductScatterLegend = ({ viewMode, nodeSizing, isMobile }) => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "800px",
        mx: "auto",
        px: isMobile ? 2 : 3,
        py: isMobile ? 1 : 1.5,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 1,
        fontSize: isMobile ? "10px" : "12px",
        color: "#333333",
        flexWrap: "nowrap",
      }}
    >
      {/* Left side: Type description with circle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "8px" : "12px",
          minWidth: "160px",
        }}
      >
        <div
          style={{
            width: isMobile ? "15px" : "20px",
            height: isMobile ? "15px" : "20px",
            borderRadius: "50%",
            backgroundColor: "#F59280",
            border: "1px solid rgba(0, 0, 0, 0.7)",
            flexShrink: 0,
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="chart-legend-title">
            {viewMode === "product" ? "Products" : "Clusters"}
          </Typography>
          {viewMode === "cluster" && (
            <Typography
              variant="chart-legend-item-small"
              sx={{ color: themeUtils.chart.colors.text.muted }}
            >
              Groups of related products
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right side: Size legend with circles (only if export sizing is enabled) */}
      {nodeSizing === "export" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 3 : 6,

            flex: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "8px" : "12px",
              marginLeft: "16px",
            }}
          >
            <div
              style={{
                width: isMobile ? "8px" : "12px",
                height: isMobile ? "8px" : "12px",
                borderRadius: "50%",
                backgroundColor: "#F59280",
                border: "1px solid rgba(0, 0, 0, 0.7)",
              }}
            />
            <Typography
              variant="chart-legend-item"
              sx={{ whiteSpace: "nowrap" }}
            >
              Lower Global Export Value
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "8px" : "12px",
            }}
          >
            <div
              style={{
                width: isMobile ? "18px" : "24px",
                height: isMobile ? "18px" : "24px",
                borderRadius: "50%",
                backgroundColor: "#F59280",
                border: "1px solid rgba(0, 0, 0, 0.7)",
              }}
            />
            <Typography
              variant="chart-legend-item"
              sx={{ whiteSpace: "nowrap" }}
            >
              Higher Global Export Value
            </Typography>
          </Box>
        </Box>
      )}

      {/* Spacer when no export sizing to maintain layout */}
      {nodeSizing !== "export" && <Box sx={{ flex: 1 }} />}
    </Box>
  );
};

const ProductScatterInternal = ({ width, height }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const selectedCountry = useCountrySelection();
  const selectedYear = useYearSelection();

  // Use visualization controls hook for URL parameter management
  const { getControlValue, setControlValue } = useVisualizationControls();

  // Image capture functionality
  const chartContainerRef = useRef(null);
  const { registerCaptureFunction, unregisterCaptureFunction } =
    useImageCaptureContext();

  // Register/unregister image capture function
  useEffect(() => {
    if (registerCaptureFunction && chartContainerRef.current) {
      const captureFunction = async () => {
        if (chartContainerRef.current) {
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
                const link = document.createElement("a");
                link.href = url;
                link.download = `product_scatter_${selectedCountry}_${selectedYear}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }
            }, "image/png");
          } catch (error) {
            console.error("Error capturing image:", error);
          }
        }
      };

      registerCaptureFunction(captureFunction);

      return () => {
        if (unregisterCaptureFunction) {
          unregisterCaptureFunction();
        }
      };
    }
  }, [
    registerCaptureFunction,
    unregisterCaptureFunction,
    selectedCountry,
    selectedYear,
  ]);

  // Get strategic position for the selected country
  const strategicPosition = useStrategicPosition(
    Number.parseInt(selectedCountry),
    Number.parseInt(selectedYear),
  );

  // Use the comprehensive shared data fetching hook
  const { countryData, clustersData } = useGreenGrowthData(
    Number.parseInt(selectedCountry),
    Number.parseInt(selectedYear),
  );

  // Extract country product data from shared hook
  const currentData = useMemo(() => {
    if (!countryData?.productData) return null;
    return { ggCpyList: countryData.productData };
  }, [countryData]);

  // Clusters lookup for names
  const clusterLookup = useMemo(() => {
    if (!clustersData?.ggClusterList) return new Map();
    return new Map(
      clustersData.ggClusterList.map((cluster) => [
        cluster.clusterId,
        cluster.clusterName,
      ]),
    );
  }, [clustersData]);

  const productLookup = useProductLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();
  const supplyChainLookup = useSupplyChainLookup();

  // Get control values from URL params with defaults
  const viewMode = getControlValue("viewmode", "cluster");
  const nodeSizing = getControlValue("nodesize", "export");

  // Calculate responsive layout
  const controlsHeight = 90;
  const legendHeight = 60; // Space for legend
  const strategicPositionHeight = 50; // Space for strategic position
  const chartHeight = Math.max(
    height - controlsHeight - legendHeight - strategicPositionHeight - 40,
    300,
  );
  const padding = isMobile ? 8 : 16;

  // Define control groups for VisualizationControls
  const controlGroups = [
    {
      label: "Display as",
      options: [
        { value: "product", label: "Products" },
        { value: "cluster", label: "Clusters" },
      ],
      selected: viewMode,
      onChange: (value) => setControlValue("viewmode", value, "cluster"),
      defaultValue: "cluster",
      paramKey: "viewmode",
    },
    {
      label: "Size by",
      options: [
        { value: "fixed", label: "Fixed Size" },
        { value: "export", label: "By Global Export" },
      ],
      selected: nodeSizing,
      onChange: (value) => setControlValue("nodesize", value, "export"),
      defaultValue: "export",
      paramKey: "nodesize",
    },
  ];

  const scatterData = useMemo(() => {
    if (viewMode === "product") {
      if (!currentData || !currentData.ggCpyList) return [];

      // Filter products (RCA < 1) first
      const filteredProducts = currentData.ggCpyList;
      // .filter(
      //   (item) => Number.parseFloat(item.exportRca) < 1,
      // );

      // Collect export values from filtered products for relative scaling within product view
      const productExportValues = filteredProducts
        .map((item) => Number.parseFloat(item.exportValue) || 0)
        .filter((value) => value > 0);

      return filteredProducts.map((item) => {
        const productDetails = productLookup.get(item.productId);
        const supplyChains = supplyChainProductLookup.get(item.productId) || [];
        const attractiveness =
          0.6 * Number.parseFloat(item.normalizedCog) +
          0.4 * Number.parseFloat(item.normalizedPci);

        // Parse export value for sizing
        const exportValue = Number.parseFloat(item.exportValue) || 0;

        return {
          product: item.productId,
          productName: productDetails?.nameShortEn,
          density: Number.parseFloat(item.exportRca),
          rca: Number.parseFloat(item.exportRca),
          color: getProductColor(item.productId),
          supplyChains: supplyChains.map((sc) => sc.supplyChainId),
          uniqueKey: createUniqueProductKey(item.productId),
          attractiveness,
          exportValue,
          nodeSize:
            nodeSizing === "export"
              ? calculateNodeSize(exportValue, 3, 30, productExportValues)
              : 6,
        };
      });
    } else {
      // Cluster mode
      if (!countryData?.clusterData) return [];

      const allClusterData = countryData.clusterData;

      // Filter clusters (RCA < 1) first
      const filteredClusters = allClusterData;
      // .filter(
      //   (item) => Number.parseFloat(item.rca) < 1,
      // );

      // Calculate export values for filtered clusters only
      const clusterExportData = filteredClusters.map((clusterItem) => {
        // Find products that belong to this cluster and sum their export values
        if (!currentData?.ggCpyList)
          return { clusterItem, exportValue: 0, products: [] };

        const clusterProducts = currentData.ggCpyList.filter((productItem) => {
          const mappings =
            supplyChainProductLookup.get(productItem.productId) || [];
          return mappings.some(
            (mapping) => mapping.clusterId === clusterItem.clusterId,
          );
        });

        const exportValue = clusterProducts.reduce((sum, product) => {
          return sum + (Number.parseFloat(product.exportValue) || 0);
        }, 0);

        return { clusterItem, exportValue, products: clusterProducts };
      });

      // Collect export values from filtered clusters for relative scaling within cluster view
      const clusterExportValues = clusterExportData
        .map((data) => data.exportValue)
        .filter((value) => value > 0);

      return clusterExportData.map((data) => {
        const { clusterItem, exportValue, products } = data;
        const clusterName = clusterLookup.get(clusterItem.clusterId);
        const attractiveness =
          0.6 * Number.parseFloat(clusterItem.cog) +
          0.4 * Number.parseFloat(clusterItem.pci);

        // Get product names for the tooltip
        const productNames = products
          .map((product) => {
            const productDetails = productLookup.get(product.productId);
            return productDetails?.nameShortEn || product.productId;
          })
          .sort();

        return {
          clusterId: clusterItem.clusterId,
          clusterName: clusterName || `Cluster ${clusterItem.clusterId}`,
          density: Number.parseFloat(clusterItem.rca),
          rca: Number.parseFloat(clusterItem.rca),
          color: getProductColor(`cluster_${clusterItem.clusterId}`),
          uniqueKey: `cluster_${clusterItem.clusterId}`,
          attractiveness,
          exportValue,
          productNames,
          nodeSize:
            nodeSizing === "export"
              ? calculateNodeSize(exportValue, 4, 30, clusterExportValues)
              : 8,
        };
      });
    }
  }, [
    viewMode,
    currentData,
    countryData,
    productLookup,
    supplyChainProductLookup,
    clusterLookup,
    nodeSizing,
  ]);

  const allSupplyChains = useMemo(() => {
    if (viewMode !== "product") return [];
    const chains = new Set();
    for (const item of scatterData) {
      if (item.supplyChains) {
        for (const chainId of item.supplyChains) {
          chains.add(chainId);
        }
      }
    }
    return Array.from(chains).sort();
  }, [scatterData, viewMode]);

  const getSupplyChainName = (chainId) => {
    return supplyChainLookup.get(chainId)?.supplyChain || `Chain ${chainId}`;
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        padding: `${padding}px`,
        overflow: "hidden",
      }}
    >
      {/* Controls */}
      <VisualizationControls
        controlGroups={controlGroups}
        sx={{
          mb: 2,
          minHeight: "auto",
          flexShrink: 0,
        }}
      />

      {/* Strategic Position Display */}
      {strategicPosition.quadrant && (
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: isMobile ? "14px" : "16px",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            Your Strategic Approach:
          </Typography>
          <div
            style={{
              backgroundColor: strategicPosition.color,
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
              {strategicPosition.label}
            </span>
          </div>
        </Box>
      )}

      {/* Chart, Legend, and Attribution Container for Image Capture */}
      <Box
        ref={chartContainerRef}
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff", // Ensure white background for export
        }}
      >
        {/* Chart Container */}
        <Box
          sx={{
            height: `${chartHeight}px`,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {scatterData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: isMobile ? 10 : 20,
                  bottom: isMobile ? 20 : 30,
                  left: isMobile ? 10 : 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="density"
                  name="Feasibility"
                  label={<CustomAxisLabel axis="x" />}
                  tick={{ fontSize: 0 }}
                  tickSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="attractiveness"
                  name="Attractiveness"
                  label={<CustomAxisLabel axis="y" />}
                  tick={{ fontSize: 0 }}
                  tickSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (payload && payload.length > 0) {
                      const props = payload[0].payload;
                      if (viewMode === "cluster") {
                        return (
                          <Paper
                            elevation={3}
                            sx={themeUtils.chart.getTooltipSx()}
                          >
                            <Typography variant="chart-tooltip-title">
                              {props.clusterName}
                            </Typography>
                            <hr style={{ width: "95%", margin: "10px 0" }} />
                            <Box sx={{ display: "grid", gap: 1 }}>
                              <Box>
                                <Typography variant="chart-tooltip-content">
                                  Attractiveness:{" "}
                                  <b>{props.attractiveness.toFixed(1)}</b>
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="chart-tooltip-content">
                                  Feasibility: <b>{props.density.toFixed(1)}</b>
                                </Typography>
                              </Box>
                              {nodeSizing === "export" && (
                                <Box>
                                  <Typography variant="chart-tooltip-content">
                                    Export Value:{" "}
                                    <b>
                                      $
                                      {formatValueWithAbbreviation(
                                        props.exportValue,
                                      )}
                                    </b>
                                  </Typography>
                                </Box>
                              )}
                              {props.productNames &&
                                props.productNames.length > 0 && (
                                  <Box>
                                    <Typography
                                      variant="chart-tooltip-content"
                                      sx={{ mb: 0.5 }}
                                    >
                                      Product List:
                                    </Typography>
                                    <Box
                                      sx={{
                                        maxHeight: "100px",
                                        overflowY: "auto",
                                        fontSize: isMobile ? "11px" : "12px",
                                      }}
                                    >
                                      <ul
                                        style={{
                                          margin: 0,
                                          paddingLeft: "16px",
                                        }}
                                      >
                                        {props.productNames.map(
                                          (productName, index) => (
                                            <li
                                              key={index}
                                              style={{ marginBottom: "2px" }}
                                            >
                                              {productName}
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    </Box>
                                  </Box>
                                )}
                            </Box>
                          </Paper>
                        );
                      }

                      return (
                        <Paper
                          elevation={3}
                          sx={{
                            ...themeUtils.chart.getTooltipSx(),
                            minWidth: isMobile ? 150 : 200,
                            maxWidth: isMobile ? 150 : 200,
                          }}
                        >
                          <Typography variant="chart-tooltip-title">
                            {props.productName} ({props.product})
                          </Typography>
                          <hr style={{ width: "95%", margin: "10px 0" }} />
                          <Box sx={{ display: "grid", gap: 1 }}>
                            <Box>
                              <Typography variant="chart-tooltip-content">
                                Attractiveness:{" "}
                                <b>{props.attractiveness.toFixed(1)}</b>
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="chart-tooltip-content">
                                RCA: <b>{props.density.toFixed(1)}</b>
                              </Typography>
                            </Box>
                            {nodeSizing === "export" && (
                              <Box>
                                <Typography variant="chart-tooltip-content">
                                  Export Value:{" "}
                                  <b>
                                    $
                                    {formatValueWithAbbreviation(
                                      props.exportValue,
                                    )}
                                  </b>
                                </Typography>
                              </Box>
                            )}
                            {props.supplyChains && (
                              <Box>
                                <Typography variant="chart-tooltip-content">
                                  Value Chains:{" "}
                                  <b>
                                    {(() => {
                                      // Map to names and deduplicate
                                      const uniqueChainNames = [
                                        ...new Set(
                                          props.supplyChains?.map((chainId) =>
                                            getSupplyChainName(chainId),
                                          ) || [],
                                        ),
                                      ];
                                      const displayNames =
                                        uniqueChainNames.slice(0, 2);
                                      return (
                                        displayNames.join(", ") +
                                        (uniqueChainNames.length > 2
                                          ? "..."
                                          : "")
                                      );
                                    })()}
                                  </b>
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  data={scatterData}
                  dataKey="uniqueKey"
                  isAnimationActive={false}
                  shape={(props) => {
                    const { cx, cy, payload } = props;
                    const radius = payload.nodeSize || 6;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        stroke="rgba(0, 0, 0, 0.7)"
                        strokeWidth={1}
                        fill="#F59280"
                        fillOpacity={0.6}
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </Box>

        {/* Legend - included in export area */}
        <Box sx={{ mt: 2 }}>
          <ProductScatterLegend
            viewMode={viewMode}
            nodeSizing={nodeSizing}
            isMobile={isMobile}
          />
        </Box>

        {/* Attribution - included in export area */}
        <Typography
          variant="chart-attribution"
          sx={{
            display: "block",
            textAlign: "right",
            mt: 1,
          }}
        >
          Source: Growth Lab research
        </Typography>
      </Box>
    </Box>
  );
};

const ProductScatter = () => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <TableWrapper defaultDataType="products">
        <ParentSize>
          {({ width, height }) => {
            if (width === 0 || height === 0) {
              return null;
            }
            return <ProductScatterInternal width={width} height={height} />;
          }}
        </ParentSize>
      </TableWrapper>
    </div>
  );
};

export default ProductScatter;

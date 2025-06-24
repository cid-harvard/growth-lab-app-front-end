import { useState, useMemo, useEffect } from "react";
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
import { useQuery } from "@apollo/react-hooks";
import { ParentSize } from "@visx/responsive";
import { GET_COUNTRY_PRODUCT_DATA } from "../../queries/shared";
import { useProductLookup } from "../../queries/products";
import {
  useSupplyChainProductLookup,
  useClusterToSupplyChains,
} from "../../queries/supplyChainProducts";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import { useCountryName } from "../../queries/useCountryName";
import {
  Typography,
  Button,
  Box,
  Paper,
  Tooltip as MuiTooltip,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
} from "@mui/material";
import { useQuery as useApolloQuery, useApolloClient } from "@apollo/client";
import { GET_CLUSTERS, GET_COUNTRY_CLUSTER_DATA } from "../../queries/shared";

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
  const isNarrow = useMediaQuery("(max-width:600px)");
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
            x={x}
            y={y + height / 2}
            textAnchor="middle"
            transform={`rotate(-90, ${x}, ${y + height / 2})`}
            style={{
              fontSize: "16px",
              fill: "black",
              textDecoration: "underline",
            }}
          >
            ATTRACTIVENESS
          </text>
        </MuiTooltip>
        {!isShort && (
          <>
            <text
              x={x}
              y={y + height * 0.2}
              textAnchor="middle"
              transform={`rotate(-90, ${x}, ${y + height * 0.2})`}
              style={{ fontSize: "12px", fill: "black", fontWeight: 600 }}
            >
              MORE ATTRACTIVE →
            </text>
            <text
              x={x}
              y={y + height * 0.8}
              textAnchor="middle"
              transform={`rotate(-90, ${x}, ${y + height * 0.8})`}
              style={{ fontSize: "12px", fill: "black", fontWeight: 600 }}
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
          y={y + height + 15}
          textAnchor="middle"
          style={{
            fontSize: "16px",
            fill: "black",
            textDecoration: "underline",
          }}
        >
          FEASIBILITY
        </text>
      </MuiTooltip>
      {!isNarrow && (
        <>
          <text
            x={x + width * 0.2}
            y={y + height + 15}
            textAnchor="middle"
            style={{ fontSize: "12px", fill: "black", fontWeight: 600 }}
          >
            ← LESS FEASIBLE
          </text>
          <text
            x={x + width * 0.8}
            y={y + height + 15}
            textAnchor="middle"
            style={{ fontSize: "12px", fill: "black", fontWeight: 600 }}
          >
            MORE FEASIBLE →
          </text>
        </>
      )}
    </g>
  );
};

// Using shared queries from ../../queries/shared.ts

const ProductScatterInternal = ({ width, height }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const selectedCountry = useCountrySelection();
  const selectedYear = useYearSelection();
  const countryName = useCountryName();
  const { loading, error, data, previousData } = useQuery(
    GET_COUNTRY_PRODUCT_DATA,
    {
      variables: {
        year: Number.parseInt(selectedYear),
        countryId: Number.parseInt(selectedCountry),
      },
    },
  );
  const currentData = useMemo(() => data || previousData, [data, previousData]);
  const productLookup = useProductLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();
  const supplyChainLookup = useSupplyChainLookup();
  const clusterToSupplyChains = useClusterToSupplyChains();

  const [viewMode, setViewMode] = useState("product");
  const [selectedSupplyChains, setSelectedSupplyChains] = useState([]);

  // Calculate responsive layout
  const controlsHeight = isMobile ? 100 : 140;
  const chartHeight = Math.max(height - controlsHeight - 40, 300);
  const padding = isMobile ? 8 : 16;

  const scatterData = useMemo(() => {
    if (!currentData || !currentData.ggCpyList) return [];

    return currentData.ggCpyList
      .map((item) => {
        const productDetails = productLookup.get(item.productId);
        const supplyChains = supplyChainProductLookup.get(item.productId) || [];
        const attractiveness =
          0.6 * Number.parseFloat(item.normalizedCog) +
          0.4 * Number.parseFloat(item.normalizedPci);

        return {
          product: item.productId,
          productName: productDetails?.nameShortEn,
          density: Number.parseFloat(item.feasibilityStd),
          rca: Number.parseFloat(item.exportRca),
          color: getProductColor(item.productId),
          supplyChains: supplyChains.map((sc) => sc.supplyChainId),
          uniqueKey: createUniqueProductKey(item.productId),
          attractiveness,
        };
      })
      .filter((d) => d.rca < 1);
  }, [currentData, productLookup, supplyChainProductLookup]);

  const allSupplyChains = useMemo(() => {
    const chains = new Set();
    for (const item of scatterData) {
      for (const chainId of item.supplyChains) {
        chains.add(chainId);
      }
    }
    return Array.from(chains).sort();
  }, [scatterData]);

  const getSupplyChainName = (chainId) => {
    return supplyChainLookup.get(chainId)?.nameEn || `Chain ${chainId}`;
  };

  const toggleSupplyChain = (chain) => {
    setSelectedSupplyChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  };

  const filteredScatterData = useMemo(() => {
    if (selectedSupplyChains.length === 0) return scatterData;
    return scatterData.filter((item) =>
      item.supplyChains.some((chain) => selectedSupplyChains.includes(chain)),
    );
  }, [scatterData, selectedSupplyChains]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        padding: `${padding}px`,
        overflow: "auto",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: isMobile ? 1 : 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontSize: isMobile ? "20px" : "28px",
            fontWeight: 600,
            mb: 1,
          }}
        >
          {countryName}'s Green Opportunities
        </Typography>
        <Typography
          sx={{
            fontSize: isMobile ? "14px" : "16px",
            lineHeight: 1.4,
            mb: 2,
          }}
        >
          Explore products where {countryName} has revealed comparative
          disadvantage (RCA {"<"} 1) but potential for growth.
        </Typography>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          mb: 2,
          minHeight: controlsHeight - 40,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
          sx={{ mb: 1 }}
        >
          <ToggleButton value="product">Products</ToggleButton>
          <ToggleButton value="cluster">Clusters</ToggleButton>
        </ToggleButtonGroup>

        {viewMode === "product" && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {allSupplyChains.slice(0, isMobile ? 6 : 12).map((chain) => (
              <Button
                key={chain}
                variant={
                  selectedSupplyChains.includes(chain)
                    ? "contained"
                    : "outlined"
                }
                onClick={() => toggleSupplyChain(chain)}
                size="small"
                sx={{
                  fontSize: isMobile ? "11px" : "12px",
                  color: "black",
                  borderColor: "black",
                  "&.MuiButton-contained": {
                    backgroundColor: "#E4F3F6",
                    "&:hover": {
                      backgroundColor: "#c9e8ed",
                    },
                  },
                  "&.MuiButton-outlined": {
                    "&:hover": {
                      backgroundColor: "rgba(228, 243, 246, 0.1)",
                    },
                  },
                }}
              >
                {getSupplyChainName(chain)}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {/* Chart */}
      <Box
        sx={{
          height: `${chartHeight}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {filteredScatterData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: isMobile ? 10 : 20,
                bottom: isMobile ? 60 : 70,
                left: isMobile ? 10 : 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="density"
                name="Feasibility"
                label={<CustomAxisLabel axis="x" />}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis
                type="number"
                dataKey="attractiveness"
                name="Attractiveness"
                label={<CustomAxisLabel axis="y" />}
                tick={{ fontSize: isMobile ? 10 : 12 }}
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
                          sx={{
                            p: 1,
                            minWidth: isMobile ? 150 : 200,
                            maxWidth: isMobile ? 150 : 200,
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        >
                          <Typography
                            sx={{ fontSize: isMobile ? "14px" : "16px", mb: 1 }}
                          >
                            {props.clusterName}
                          </Typography>
                          <hr style={{ width: "95%", margin: "10px 0" }} />
                          <Box sx={{ display: "grid", gap: 1 }}>
                            <Box>
                              <Typography
                                sx={{ fontSize: isMobile ? "12px" : "14px" }}
                              >
                                Attractiveness:{" "}
                                <b>{props.attractiveness.toFixed(1)}</b>
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                sx={{ fontSize: isMobile ? "12px" : "14px" }}
                              >
                                Feasibility: <b>{props.density.toFixed(1)}</b>
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      );
                    }
                    return (
                      <Paper
                        elevation={3}
                        sx={{
                          p: 1,
                          minWidth: isMobile ? 150 : 200,
                          maxWidth: isMobile ? 150 : 200,
                          backgroundColor: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                        }}
                      >
                        <Typography
                          sx={{ fontSize: isMobile ? "14px" : "16px", mb: 1 }}
                        >
                          {props.productName} ({props.product})
                        </Typography>
                        <hr style={{ width: "95%", margin: "10px 0" }} />
                        <Box sx={{ display: "grid", gap: 1 }}>
                          <Box>
                            <Typography
                              sx={{ fontSize: isMobile ? "12px" : "14px" }}
                            >
                              Attractiveness:{" "}
                              <b>{props.attractiveness.toFixed(1)}</b>
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              sx={{ fontSize: isMobile ? "12px" : "14px" }}
                            >
                              Feasibility: <b>{props.density.toFixed(1)}</b>
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              sx={{ fontSize: isMobile ? "12px" : "14px" }}
                            >
                              Value Chains:{" "}
                              <b>
                                {props.supplyChains
                                  ?.map((chainId) =>
                                    getSupplyChainName(chainId),
                                  )
                                  .slice(0, 2)
                                  .join(", ")}
                                {props.supplyChains?.length > 2 ? "..." : ""}
                              </b>
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                data={filteredScatterData}
                dataKey="uniqueKey"
                isAnimationActive={false}
              >
                {filteredScatterData.map((entry) => (
                  <Cell
                    key={entry.uniqueKey}
                    stroke="#0F8A8F"
                    strokeWidth={1}
                    fill="#0F8A8F"
                    fillOpacity={0.5}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          textAlign: "right",
          mt: 1,
          fontSize: isMobile ? "10px" : "12px",
        }}
      >
        Source: Growth Lab research
      </Typography>
    </Box>
  );
};

const ProductScatter = () => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ParentSize>
        {({ width, height }) => (
          <ProductScatterInternal width={width} height={height} />
        )}
      </ParentSize>
    </div>
  );
};

export default ProductScatter;

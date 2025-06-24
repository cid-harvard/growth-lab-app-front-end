import React, { useState, useMemo, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Paper,
  Button,
  Tooltip as MuiTooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@apollo/client";
import { ParentSize } from "@visx/responsive";
import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import { GET_COUNTRY_PRODUCT_DATA } from "../../queries/shared";
import { useProductLookup } from "../../queries/products";
import { useCountryName } from "../../queries/useCountryName";
import { Close as CloseIcon } from "@mui/icons-material";

const dimensionObject = {
  "Product Complexity": "normalizedPci",
  "Complexity Outlook Gain": "normalizedCog",
  Feasibility: "feasibility",
  "Effective Exporters": "effectiveNumberOfExporters",
  "Market Growth": "marketGrowth",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ px: 1, py: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2">Score: {payload[0].value}</Typography>
      </Paper>
    );
  }
  return null;
};

const CustomPolarAngleAxis = ({
  payload,
  x,
  y,
  textAnchor,
  stroke,
  radius,
}) => {
  const tooltipContent = {
    "Product Complexity":
      "Measures the amount of diversity of knowhow required to make a product.",
    "Complexity Outlook Gain":
      "Measures opportunities for future diversification in entering a product, by opening new links to complex products.",
    Feasibility:
      "Measures the share of capabilities, skills, and know-how present in a location that is necessary to jumpstart a specific activity.",
    "Effective Exporters":
      "Measures the concentration of an industry, by estimating the number of countries that compete in the industry (assuming each country has an equal market share).",
    "Market Growth":
      "The rate of increase in this product's market size from 2013 to 2022. A higher number indicates faster growth in this market.",
  };

  return (
    <g className="recharts-layer recharts-polar-angle-axis-tick">
      <MuiTooltip title={tooltipContent[payload.value]} placement="top">
        <text
          radius={radius}
          stroke={stroke}
          x={x}
          y={y}
          className="recharts-text recharts-polar-angle-axis-tick-value"
          textAnchor={textAnchor}
          style={{
            fontSize: "12px",
            fill: "black",
            textDecoration: "underline",
          }}
        >
          <tspan x={x} dy="-4px">
            {payload.value}
          </tspan>
        </text>
      </MuiTooltip>
    </g>
  );
};

const ProductRadarInternal = ({ width, height }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const countryName = useCountryName();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const selectedYear = useYearSelection();
  const selectedCountry = useCountrySelection();
  const productLookup = useProductLookup();
  const products = useMemo(
    () => Array.from(productLookup.values()),
    [productLookup],
  );

  const { data, previousData } = useQuery(GET_COUNTRY_PRODUCT_DATA, {
    variables: {
      year: parseInt(selectedYear),
      countryId: parseInt(selectedCountry),
    },
  });

  const currentData = useMemo(() => data || previousData, [data, previousData]);

  const productData = useMemo(() => {
    if (!currentData?.ggCpyList || selectedProducts.length === 0) return [];

    return selectedProducts.map((product) => {
      const cpyData = currentData.ggCpyList.find(
        (cpy) => cpy?.productId === product?.productId,
      );
      if (!cpyData) return {};
      return {
        ...product,
        rca: cpyData?.exportRca || 0,
        complexity: cpyData?.normalizedPci || 0,
        opportunity: cpyData?.attractiveness || 0,
        sustainability: cpyData?.feasibility || 0,
        ...cpyData,
      };
    });
  }, [currentData?.ggCpyList, selectedProducts]);

  useEffect(() => {
    if (currentData?.ggCpyList) {
      const productsWithScores = currentData.ggCpyList
        .filter((d) => d.exportRca < 1)
        .map((d) => ({
          ...d,
          score: d.pciCogFeasibilityComposite,
        }));

      const topProducts = productsWithScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map((p) => productLookup.get(p.productId));

      setSelectedProducts(topProducts);
    }
  }, [currentData?.ggCpyList, productLookup]);

  const handleProductSelect = (event, newValue) => {
    setSelectedProducts(newValue);
  };

  const handleDelete = (productToDelete) => {
    setSelectedProducts(
      selectedProducts.filter((product) => product !== productToDelete),
    );
  };

  const radarData = useMemo(() => {
    const dimensions = [
      "Product Complexity",
      "Complexity Outlook Gain",
      "Feasibility",
      "Effective Exporters",
      "Market Growth",
    ];

    if (productData.length === 0 || !currentData?.ggCpyList) return [];

    const dimensionBreakpoints = dimensions.reduce((acc, dimension) => {
      const valueKey = dimensionObject[dimension];
      const values = currentData.ggCpyList
        .map((product) => product[valueKey])
        .filter((v) => v != null)
        .sort((a, b) => a - b);

      const groupSize = values.length / 11;
      acc[dimension] = Array(10)
        .fill(0)
        .map((_, i) => {
          const index = Math.min(
            Math.floor((i + 1) * groupSize),
            values.length - 1,
          );
          return values[index];
        });

      return acc;
    }, {});

    const scaleValue = (value, dimension) => {
      const breakpoints = dimensionBreakpoints[dimension];
      const score = breakpoints.findIndex((b) => value < b);
      return score === -1 ? 10 : score;
    };

    return dimensions.map((dimension) => {
      const valueKey = dimensionObject[dimension];
      return {
        dimension,
        ...productData.reduce((acc, product) => {
          const originalValue = product[valueKey] || 0;
          const scaledValue = scaleValue(originalValue, dimension);
          acc[product?.productId] = scaledValue;
          return acc;
        }, {}),
      };
    });
  }, [productData, currentData?.ggCpyList]);

  // Calculate responsive layout
  const controlsHeight = isMobile ? 120 : 160;
  const availableHeight = height - controlsHeight;
  const padding = isMobile ? 8 : 16;

  // Calculate grid layout for charts
  const chartsPerRow = isMobile ? 1 : Math.min(2, productData.length);
  const chartRows = Math.ceil(productData.length / chartsPerRow);
  const chartWidth = Math.max((width - padding * 2) / chartsPerRow - 20, 300);
  const chartHeight = Math.max(availableHeight / chartRows - 40, 200);

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
          sx={{ fontSize: isMobile ? "18px" : "23px", fontWeight: 600 }}
        >
          Dimensions of {countryName}'s Opportunities in Green Value Chains
        </Typography>
        <Typography
          sx={{
            mt: 1,
            mb: isMobile ? 2 : 3,
            fontSize: isMobile ? "14px" : "16px",
            lineHeight: 1.4,
          }}
        >
          These diagrams compare green value chain opportunities across five key
          dimensions, to provide more perspective on the feasibility and
          attractiveness of different opportunities.
        </Typography>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
          minHeight: controlsHeight - 40,
        }}
      >
        <Autocomplete
          sx={{ width: isMobile ? "100%" : "300px" }}
          size="small"
          multiple
          options={products}
          getOptionLabel={(option) => `${option.nameShortEn} (${option.code})`}
          disableClearable
          blurOnSelect
          renderInput={(params) => (
            <TextField
              size="small"
              {...params}
              label="Search a product name"
              variant="outlined"
            />
          )}
          onChange={handleProductSelect}
          value={selectedProducts}
          renderTags={() => null}
        />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {selectedProducts.map((product) => (
            <Box
              key={product?.productId}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Button
                variant="contained"
                size="small"
                sx={{
                  color: "black",
                  backgroundColor: "#E4F3F6",
                  "&:hover": {
                    backgroundColor: "#c9e8ed",
                  },
                  pr: 4,
                  cursor: "default",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              >
                {`${product?.nameShortEn} (${product?.code})`}
                <CloseIcon
                  onClick={() => handleDelete(product)}
                  sx={{
                    position: "absolute",
                    right: 8,
                    fontSize: isMobile ? 16 : 18,
                    cursor: "pointer",
                    opacity: 0.7,
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                />
              </Button>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Charts Grid */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: isMobile ? "center" : "flex-start",
          gap: 2,
          minHeight: availableHeight - 60,
        }}
      >
        {productData.map((product) => (
          <Box
            key={product?.productId}
            sx={{
              width: isMobile ? "100%" : `${chartWidth}px`,
              height: `${chartHeight}px`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              align="center"
              sx={{
                color: "black",
                fontWeight: 600,
                fontSize: isMobile ? "14px" : "16px",
                mb: 1,
              }}
            >
              {product?.nameShortEn}
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={radarData}
                margin={{ left: 50, right: 50, top: 10, bottom: 10 }}
              >
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={<CustomPolarAngleAxis />}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fill: "black", fontSize: isMobile ? 8 : 10 }}
                  ticks={[0, 2, 4, 6, 8, 10]}
                />
                <Radar
                  name={product?.nameEn}
                  dataKey={product?.productId}
                  stroke="#1F6584"
                  fill="#1F6584"
                  fillOpacity={0.6}
                  dot={{ stroke: "rgb(77, 112, 130)", fill: "none", r: 3 }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        ))}
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

const ProductRadar = () => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ParentSize>
        {({ width, height }) => (
          <ProductRadarInternal width={width} height={height} />
        )}
      </ParentSize>
    </div>
  );
};

export default ProductRadar;

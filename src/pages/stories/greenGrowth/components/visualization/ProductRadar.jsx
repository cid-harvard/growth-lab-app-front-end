import React, { useState, useMemo, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Paper,
  Button,
  Tooltip as MuiTooltip,
} from "@mui/material";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { useQuery } from "@apollo/client";
import { countrySelectionState } from "../ScollamaStory";
import { yearSelectionState } from "../ScollamaStory";
import { useRecoilValue } from "recoil";
import { GG_CPY_LIST_QUERY } from "../../queries/cpy";
import { useProductLookup } from "../../queries/products";
import { useCountryName } from "../../queries/useCountryName";
import { Close as CloseIcon } from "@mui/icons-material";

const dimensionObject = {
  "Global Market Share": "globalMarketShare",
  "Complexity Outlook Gain": "normalizedCog",
  Attractiveness: "attractiveness",
  "Effective Exporters": "effectiveNumberOfExporters",
  "Market Growth": "marketGrowth",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const originalValue = payload[0].payload[`${payload[0].dataKey}_original`];
    return (
      <Paper sx={{ px: 1, py: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2">
          Score: {payload[0].value}
          <br />
          Actual: {originalValue}
        </Typography>
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
    "Global Market Share": "The share of global exports in this product",
    "Complexity Outlook Gain":
      "How much this product would contribute to future diversification opportunities",
    Attractiveness: "How attractive this product is to the market",
    "Effective Exporters":
      "Number of countries that effectively export this product",
    "Market Growth": "Growth rate of global trade in this product",
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

const ProductRadar = () => {
  const countryName = useCountryName();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const selectedYear = useRecoilValue(yearSelectionState);
  const selectedCountry = useRecoilValue(countrySelectionState);
  const productLookup = useProductLookup();
  const products = useMemo(
    () => Array.from(productLookup.values()),
    [productLookup],
  );

  const { data, previousData } = useQuery(GG_CPY_LIST_QUERY, {
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
        (cpy) => cpy.productId === product.productId,
      );
      return {
        ...product,
        rca: cpyData?.normalizedExportRca || 0,
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
          score: 0.625 * d.normalizedPci + 0.375 * d.normalizedCog,
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
      "Global Market Share",
      "Complexity Outlook Gain",
      "Attractiveness",
      "Effective Exporters",
      "Market Growth",
    ];

    if (productData.length === 0 || !currentData?.ggCpyList) return [];

    const dimensionRanges = dimensions.reduce((acc, dimension) => {
      const valueKey = dimensionObject[dimension];

      const values = currentData.ggCpyList
        .map((product) => product[valueKey])
        .filter((v) => v != null)
        .sort((a, b) => a - b);

      // Calculate quantile breakpoints
      const quantileSize = values.length / 10;
      const quantiles = Array.from({ length: 9 }, (_, i) => {
        const index = Math.floor((i + 1) * quantileSize);
        return values[Math.min(index, values.length - 1)];
      });

      acc[dimension] = {
        quantiles: quantiles,
        min: values[0],
        max: values[values.length - 1],
      };
      return acc;
    }, {});

    const scaleValue = (value, dimension) => {
      const { quantiles, min } = dimensionRanges[dimension];
      if (value <= min) return 1;

      for (let i = 0; i < quantiles.length; i++) {
        if (value <= quantiles[i]) return i + 2;
      }
      return 10;
    };

    return dimensions.map((dimension) => {
      const valueKey = dimensionObject[dimension];

      const entry = {
        dimension,
        ...productData.reduce((acc, product) => {
          const originalValue = product[valueKey] || 0;
          const scaledValue = scaleValue(originalValue, dimension);

          acc[product.productId] = scaledValue;
          acc[`${product.productId}_original`] = originalValue;
          return acc;
        }, {}),
      };
      return entry;
    });
  }, [productData, currentData?.ggCpyList]);

  return (
    <Box sx={{ px: 4, py: 2, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Typography sx={{ fontSize: "23px", fontWeight: 600 }}>
          Dimensions of {countryName}'s Opportunities in Green Value Chains
        </Typography>
      </Box>

      <Typography type="p" sx={{ mt: 2, mb: 8, fontSize: "22px" }}>
        There are many dimensions to consider when evaluating an opportunity in
        green value chains. These spider diagrams help compare and prioritize
        opportunities in green value chains across 5 impactful dimensions.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 2 }}>
        <Autocomplete
          sx={{ width: "300px" }}
          size="small"
          multiple
          options={products}
          getOptionLabel={(option) => `${option.nameEn} (${option.code})`}
          renderInput={(params) => (
            <TextField
              size="sm"
              {...params}
              label="Search a product name"
              variant="outlined"
            />
          )}
          onChange={handleProductSelect}
          value={selectedProducts}
          renderTags={() => null}
        />
        {selectedProducts.map((product) => (
          <Box
            key={product.productId}
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
              }}
            >
              {`${product.nameShortEn} (${product.code})`}
              <CloseIcon
                onClick={() => handleDelete(product)}
                sx={{
                  position: "absolute",
                  right: 8,
                  fontSize: 18,
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

      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {productData.map((product) => (
          <Box
            key={product.productId}
            sx={{ m: 2, width: "45%", minWidth: 320 }}
          >
            <Typography
              variant="h6"
              align="center"
              sx={{ color: "black", fontWeight: 600 }}
            >
              {product.nameShortEn}
            </Typography>
            <RadarChart
              width={480}
              height={250}
              data={radarData}
              margin={{ left: 100, right: 100, top: 0, bottom: 0 }}
              style={{ margin: "auto" }}
            >
              <PolarGrid />
              <PolarAngleAxis
                dataKey="dimension"
                tick={<CustomPolarAngleAxis />}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tick={{ fill: "black", fontSize: 10 }}
                ticks={[0, 2, 4, 6, 8, 10]}
              />
              <Radar
                name={product.nameEn}
                dataKey={product.productId}
                stroke="#1F6584"
                fill="#1F6584"
                fillOpacity={0.6}
                dot={{ stroke: "rgb(77, 112, 130)", fill: "none", r: 3 }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProductRadar;

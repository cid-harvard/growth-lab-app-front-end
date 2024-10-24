import React, { useState, useMemo } from "react";
import {
  Autocomplete,
  Chip,
  TextField,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useRecoilValue } from "recoil";
import hs4Selector from "../../atoms/hs92-4";

const ProductRadar = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const hs4Data = useRecoilValue(hs4Selector);

  const productOptions = useMemo(() => {
    return Array.from(hs4Data.entries()).map(([key, value]) => ({
      id: key,
      name: key,
      hsCode: value.hsCode,
      topic: value.topic[0],
    }));
  }, [hs4Data]);

  const generateRandomData = () => {
    const dimensions = [
      "Sustainability",
      "Innovation",
      "Market Potential",
      "Competitiveness",
    ];
    return dimensions.reduce((acc, dimension) => {
      acc[dimension] = Math.floor(Math.random() * 10) + 1;
      return acc;
    }, {});
  };

  const dataLookup = useMemo(() => {
    return productOptions.reduce((acc, product) => {
      acc[product.id] = generateRandomData();
      return acc;
    }, {});
  }, [productOptions]);

  const handleProductSelect = (event, newValue) => {
    setSelectedProducts(newValue);
  };

  const handleDelete = (productToDelete) => {
    setSelectedProducts(
      selectedProducts.filter((product) => product !== productToDelete),
    );
  };

  // Transform data for RadarChart
  const radarData = useMemo(() => {
    const dimensions = [
      "Sustainability",
      "Innovation",
      "Market Potential",
      "Competitiveness",
    ];

    if (selectedProducts.length === 0) return [];

    return dimensions.map((dimension) => ({
      dimension,
      ...selectedProducts.reduce((acc, product) => {
        acc[product.id] = dataLookup[product.id][dimension];
        return acc;
      }, {}),
    }));
  }, [dataLookup, selectedProducts]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Different Dimensions Of [Country's] Opportunities In Green Supply Chains
        (MOCK DATA)
      </Typography>

      <Autocomplete
        multiple
        options={productOptions}
        getOptionLabel={(option) => `${option.name} (${option.hsCode})`}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search a product name to draw its chart"
            variant="outlined"
          />
        )}
        onChange={handleProductSelect}
        value={selectedProducts}
        renderTags={() => null}
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 2 }}>
        {selectedProducts.map((product) => (
          <Chip
            key={product.id}
            label={`${product.name} (${product.hsCode})`}
            onDelete={() => handleDelete(product)}
            sx={{ backgroundColor: "#E6EEF2", color: "#333" }}
          />
        ))}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {selectedProducts.map((product) => (
          <Box key={product.id} sx={{ m: 2, width: "45%", minWidth: 320 }}>
            <Typography variant="h6" align="center" sx={{ color: "#0066cc" }}>
              {product.name}
            </Typography>
            <RadarChart
              width={380}
              height={350}
              data={radarData}
              style={{ margin: "auto" }}
            >
              <PolarGrid />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "#666", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={45}
                domain={[0, 10]}
                tick={{ fill: "#666" }}
              />
              <Radar
                name={product.name}
                dataKey={product.id}
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <RechartsTooltip />
            </RadarChart>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProductRadar;

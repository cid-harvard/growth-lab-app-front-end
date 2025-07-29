import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Stack,
  Slider,
} from "@mui/material";
import { useQuery, gql } from "@apollo/client";
import styled from "styled-components";
import {
  FullWidthContent,
  FullWidthContentContainer,
} from "../../../../styling/Grid";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import { stratify, tree, hierarchy } from "d3-hierarchy";
import { scaleSqrt, scaleLinear } from "d3-scale";
import { linkRadial } from "d3-shape";

import {
  GET_PRODUCTS,
  GET_COUNTRIES,
  GET_SUPPLY_CHAINS,
  GET_COUNTRY_PRODUCT_DATA,
} from "../queries/shared";

// Define the supply chain mappings query locally since it's not exported
const GET_ALL_SUPPLY_CHAIN_MAPPINGS = gql`
  query GetAllSupplyChainMappings {
    supplyChain0: ggSupplyChainClusterProductMemberList(supplyChainId: 0) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain1: ggSupplyChainClusterProductMemberList(supplyChainId: 1) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain2: ggSupplyChainClusterProductMemberList(supplyChainId: 2) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain3: ggSupplyChainClusterProductMemberList(supplyChainId: 3) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain4: ggSupplyChainClusterProductMemberList(supplyChainId: 4) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain5: ggSupplyChainClusterProductMemberList(supplyChainId: 5) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain6: ggSupplyChainClusterProductMemberList(supplyChainId: 6) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain7: ggSupplyChainClusterProductMemberList(supplyChainId: 7) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain8: ggSupplyChainClusterProductMemberList(supplyChainId: 8) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain9: ggSupplyChainClusterProductMemberList(supplyChainId: 9) {
      supplyChainId
      productId
      clusterId
    }
  }
`;

const theme = createTheme({
  typography: {
    fontFamily: '"Source Sans Pro", "Source Sans", sans-serif',
  },
});

const PageContainer = styled(FullWidthContentContainer)`
  padding: 40px 20px;
  font-family: "Source Sans Pro", sans-serif;
`;

// Types for the tree data structure
interface TreeProductData {
  id: string;
  productName: string;
  hsCode: string;
  hs4Code: string;
  hs2Code: string;
  chain: string;
  chainId: string;
  parentId: string;
  value: number;
  actualValue: number;
  expectedValue: number;
}

interface TreeNodeData {
  id: string;
  parentId: string | null;
  productName?: string;
  chain?: string;
  value?: number;
  actualValue?: number;
  expectedValue?: number;
  hsCode?: string;
}

const TreeGrowthExperiment: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("USA"); // Use country code like original
  const [selectedYear, setSelectedYear] = useState<number>(2022);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredNodePosition, setHoveredNodePosition] = useState<any>(null);

  // Available years for the visualization (same as original)
  const availableYears = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => 2022 - i);
  }, []);

  // Get country ID
  const countryId = useMemo(() => {
    return parseInt(selectedCountry === "USA" ? "840" : selectedCountry);
  }, [selectedCountry]);

  // GraphQL Queries for static data
  const { data: productsData, loading: productsLoading } =
    useQuery(GET_PRODUCTS);
  const { data: countriesData, loading: countriesLoading } =
    useQuery(GET_COUNTRIES);
  const { data: supplyChainsData, loading: supplyChainsLoading } =
    useQuery(GET_SUPPLY_CHAINS);
  const { data: mappingsData, loading: mappingsLoading } = useQuery(
    GET_ALL_SUPPLY_CHAIN_MAPPINGS,
  );

  // Preload data for all years
  const yearlyDataQueries = availableYears.map((year) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery(GET_COUNTRY_PRODUCT_DATA, {
      variables: { year, countryId },
      skip: !selectedCountry,
      notifyOnNetworkStatusChange: true,
    });
  });

  // Check if all yearly data is loaded
  const allYearlyDataLoaded = useMemo(() => {
    return yearlyDataQueries.every((query) => !query.loading && query.data);
  }, [yearlyDataQueries]);

  // Create a map of year to data
  const yearlyDataMap = useMemo(() => {
    const map = new Map();
    yearlyDataQueries.forEach((query, index) => {
      const year = availableYears[index];
      if (query.data) {
        map.set(year, query.data);
      }
    });
    return map;
  }, [yearlyDataQueries, availableYears]);

  const loading =
    productsLoading ||
    countriesLoading ||
    supplyChainsLoading ||
    mappingsLoading ||
    !allYearlyDataLoaded;

  // Create lookups from the data
  const {
    productLookup,
    countryLookup,
    supplyChainLookup,
    productMappingsLookup,
  } = useMemo(() => {
    const productLookup = new Map();
    const countryLookup: Record<string, string> = {};
    const supplyChainLookup = new Map();
    const productMappingsLookup = new Map();

    // Build product lookup
    if (productsData?.ggProductList) {
      productsData.ggProductList.forEach((product: any) => {
        productLookup.set(product.productId, product);
      });
    }

    // Build country lookup
    if (countriesData?.ggLocationCountryList) {
      countriesData.ggLocationCountryList.forEach((country: any) => {
        countryLookup[country.countryId.toString()] = country.nameShortEn;
      });
    }

    // Build supply chain lookup
    if (supplyChainsData?.ggSupplyChainList) {
      supplyChainsData.ggSupplyChainList.forEach((chain: any) => {
        supplyChainLookup.set(chain.supplyChainId, chain);
      });
    }

    // Build product mappings lookup
    if (mappingsData) {
      const allMappings: any[] = [];
      Object.keys(mappingsData).forEach((key) => {
        if (mappingsData[key]) {
          allMappings.push(...mappingsData[key]);
        }
      });

      allMappings.forEach((mapping: any) => {
        if (!productMappingsLookup.has(mapping.productId)) {
          productMappingsLookup.set(mapping.productId, []);
        }
        productMappingsLookup.get(mapping.productId).push(mapping);
      });
    }

    return {
      productLookup,
      countryLookup,
      supplyChainLookup,
      productMappingsLookup,
    };
  }, [productsData, countriesData, supplyChainsData, mappingsData]);

  // Create the tree data structure for the selected year
  const { greenSupplyChainTree, maxValue } = useMemo(() => {
    const countryProductData = yearlyDataMap.get(selectedYear);

    if (
      !countryProductData?.ggCpyList ||
      !productLookup.size ||
      !supplyChainLookup.size ||
      !productMappingsLookup.size
    ) {
      return { greenSupplyChainTree: null, maxValue: 0 };
    }

    let maxValue = 0;
    const supplyChainProducts: TreeProductData[] = [];
    let totalProductsProcessed = 0;
    let productsFilteredByRCA = 0;

    // Process country product data to create tree structure
    countryProductData.ggCpyList.forEach((cpyItem: any) => {
      totalProductsProcessed++;
      const product = productLookup.get(cpyItem.productId);
      const mappings = productMappingsLookup.get(cpyItem.productId) || [];

      if (
        !product ||
        !mappings.length ||
        !cpyItem.exportValue ||
        cpyItem.exportValue <= 0
      ) {
        return;
      }

      const actualValue = parseFloat(cpyItem.exportValue) || 0;
      const expectedValue = parseFloat(cpyItem.expectedExports) || 0;

      // Calculate RCA (Revealed Comparative Advantage)
      const rca = expectedValue > 0 ? actualValue / expectedValue : 0;

      // Only include products with RCA >= 1
      if (rca < 1) {
        productsFilteredByRCA++;
        return;
      }

      if (actualValue <= 0) return; // Skip zero/negative values

      const hsCode = product.code;
      const productName = product.nameShortEn || product.nameEn;

      // Create entries for each supply chain this product belongs to
      mappings.forEach((mapping: any) => {
        const supplyChain = supplyChainLookup.get(mapping.supplyChainId);
        if (!supplyChain) return;

        maxValue = Math.max(maxValue, actualValue);

        supplyChainProducts.push({
          id: `${hsCode}-${supplyChain.supplyChain}`,
          productName,
          hsCode: hsCode,
          hs4Code: hsCode.slice(0, -2),
          hs2Code: hsCode.slice(0, -4),
          chain: supplyChain.supplyChain,
          chainId: supplyChain.supplyChain.split(" ").join("-"),
          parentId:
            hsCode.slice(0, -2) +
            "-" +
            supplyChain.supplyChain.split(" ").join("-"),
          value: actualValue,
          actualValue: actualValue,
          expectedValue: expectedValue,
        });
      });
    });

    if (supplyChainProducts.length === 0) {
      return { greenSupplyChainTree: null, maxValue: 0 };
    }

    // Create HS4 level aggregations
    const hs4Map = new Map();
    supplyChainProducts.forEach((d) => {
      const key = d.hs4Code + "-" + d.chainId;
      if (!hs4Map.has(key)) {
        hs4Map.set(key, {
          ...d,
          id: d.hs4Code + "-" + d.chainId,
          hsCode: d.hs4Code,
          parentId: d.hs2Code + "-" + d.chainId,
          value: 0,
          actualValue: 0,
          expectedValue: 0,
        });
      }
      const hs4Item = hs4Map.get(key);
      hs4Item.value += d.value;
      hs4Item.actualValue += d.actualValue;
      hs4Item.expectedValue += d.expectedValue;
    });
    const hs4Arr = Array.from(hs4Map.values());

    // Create HS2 level aggregations
    const hs2Map = new Map();
    supplyChainProducts.forEach((d) => {
      const key = d.hs2Code + "-" + d.chainId;
      if (!hs2Map.has(key)) {
        hs2Map.set(key, {
          ...d,
          id: d.hs2Code + "-" + d.chainId,
          hsCode: d.hs2Code,
          parentId: d.chainId,
          value: 0,
          actualValue: 0,
          expectedValue: 0,
        });
      }
      const hs2Item = hs2Map.get(key);
      hs2Item.value += d.value;
      hs2Item.actualValue += d.actualValue;
      hs2Item.expectedValue += d.expectedValue;
    });
    const hs2Arr = Array.from(hs2Map.values());

    // Create supply chain level
    const chainMap = new Map();
    supplyChainProducts.forEach((d) => {
      if (!chainMap.has(d.chainId)) {
        chainMap.set(d.chainId, {
          id: d.chainId,
          parentId: "root",
          value: 0,
          actualValue: 0,
          expectedValue: 0,
        });
      }
      const chainItem = chainMap.get(d.chainId);
      chainItem.value += d.value;
      chainItem.actualValue += d.actualValue;
      chainItem.expectedValue += d.expectedValue;
    });
    const chainArr = Array.from(chainMap.values());

    const root: TreeNodeData = {
      id: "root",
      parentId: null,
    };

    try {
      const greenSupplyChainTree = stratify()([
        root,
        ...chainArr,
        ...hs2Arr,
        ...hs4Arr,
        ...supplyChainProducts,
      ]);

      console.log("Tree Data Summary:", {
        year: selectedYear,
        maxValue,
        totalProductsProcessed,
        productsFilteredByRCA,
        finalProductsShown: supplyChainProducts.length,
        rcaFilterPercentage:
          ((productsFilteredByRCA / totalProductsProcessed) * 100).toFixed(1) +
          "%",
        sampleValues: supplyChainProducts.slice(0, 5).map((p) => ({
          id: p.id,
          value: p.value,
          rca: p.expectedValue > 0 ? p.actualValue / p.expectedValue : 0,
        })),
      });

      return { greenSupplyChainTree, maxValue };
    } catch (error) {
      console.error("Error creating tree:", error);
      return { greenSupplyChainTree: null, maxValue: 0 };
    }
  }, [
    selectedYear,
    yearlyDataMap,
    productLookup,
    supplyChainLookup,
    productMappingsLookup,
  ]);

  const minYear = Math.min(...availableYears);
  const maxYear = Math.max(...availableYears);

  const advanceYear = useCallback(() => {
    setSelectedYear((prevYear) => {
      if (prevYear >= maxYear) {
        return minYear;
      }
      return prevYear + 1;
    });
  }, [minYear, maxYear]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPlaying) {
      intervalId = setInterval(advanceYear, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, advanceYear]);

  // Prepare country options for controls
  const countryOptions = Object.entries(countryLookup).map(([code, name]) => ({
    value: code,
    label: name,
  }));

  // Handle control changes
  const handleCountryChange = (event: SelectChangeEvent) => {
    setSelectedCountry(event.target.value);
  };

  const handleYearChange = (_event: Event, newValue: number | number[]) => {
    setSelectedYear(newValue as number);
  };

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  const { nodes, links, colorScale, opacityScale } = useMemo(() => {
    if (!greenSupplyChainTree) {
      return {
        nodes: [],
        links: [],
        colorScale: null,
        sizeScale: null,
        linkWidthScale: null,
        opacityScale: null,
      };
    }

    const width = 1200;
    const height = 1200;
    const radius = Math.min(width, height) / 2;

    const root = hierarchy(greenSupplyChainTree)
      .sum((d: any) => d.data.value || 0)
      .sort((a: any, b: any) => b.value - a.value);

    const uniqueHS2Codes = new Set(
      root
        .descendants()
        .map((node: any) => node.data.data?.hs2Code)
        .filter(Boolean),
    );
    const colorScale = scaleOrdinal(schemeCategory10).domain(
      Array.from(uniqueHS2Codes),
    );

    const sizeScale = scaleSqrt().domain([0, maxValue]).range([1, 8]); // Smaller range to prevent overlap

    // Calculate node sizes and store them for separation function
    root.descendants().forEach((node: any) => {
      node.nodeSize = node.depth === 0 ? 8 : sizeScale(node.value || 0);
    });

    // Standard d3 tidy tree radial layout with custom separation for node sizes
    const treeLayout = tree()
      .size([2 * Math.PI, radius * 0.8])
      .separation((a: any, b: any) => {
        return (a.nodeSize + b.nodeSize) / 8 + 0.3; // Prevent overlap based on node sizes
      });

    treeLayout(root);

    const linkWidthScale = scaleLinear().domain([0, maxValue]).range([0.5, 3]); // Standard range for link widths

    const opacityScale = scaleLinear().domain([0, root.height]).range([1, 0.5]);

    return {
      nodes: root.descendants(),
      links: root.links(),
      colorScale,
      sizeScale,
      linkWidthScale,
      opacityScale,
    };
  }, [greenSupplyChainTree, maxValue]);

  const linkPathGenerator = linkRadial()
    .angle((d: any) => d.x)
    .radius((d: any) => d.y);

  const maxLabelLength = 15;

  if (loading) {
    const loadedQueries = yearlyDataQueries.filter(
      (q) => !q.loading && q.data,
    ).length;
    const totalQueries = yearlyDataQueries.length;

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullWidthContent>
          <PageContainer>
            <Typography variant="h6" gutterBottom>
              Loading TreeGrowth experiment...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Loaded {loadedQueries} of {totalQueries} years of data
            </Typography>
          </PageContainer>
        </FullWidthContent>
      </ThemeProvider>
    );
  }

  return (
    <FullWidthContent>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Minimal Controls */}
        <Box sx={{ padding: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Stack direction="row" spacing={3} alignItems="center">
            {/* Country Selector */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="country-select-label">Country</InputLabel>
              <Select
                labelId="country-select-label"
                id="country-select"
                value={selectedCountry}
                label="Country"
                onChange={handleCountryChange}
              >
                {countryOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Year Slider */}
            <Box sx={{ minWidth: 300 }}>
              <Typography variant="body2" gutterBottom>
                Year: {selectedYear}
              </Typography>
              <Slider
                value={selectedYear}
                onChange={handleYearChange}
                min={minYear}
                max={maxYear}
                step={1}
                marks={availableYears.map((year) => ({
                  value: year,
                  label: year.toString(),
                }))}
                valueLabelDisplay="auto"
                disabled={isPlaying}
              />
            </Box>

            {/* Animation Control */}
            <Button
              variant={isPlaying ? "contained" : "outlined"}
              onClick={toggleAnimation}
              size="small"
            >
              {isPlaying ? "Pause" : "Play"} Animation
            </Button>
          </Stack>
        </Box>

        {/* Title */}
        <Box sx={{ padding: 2 }}>
          <Typography variant="h5" component="h2" sx={{ textAlign: "center" }}>
            Green Supply Chain Tree for{" "}
            {countryLookup[selectedCountry] || "Unknown Country"} in{" "}
            {selectedYear}
          </Typography>
          {!greenSupplyChainTree && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 1 }}
            >
              No data available for the selected country and year
            </Typography>
          )}
        </Box>

        {greenSupplyChainTree && (
          <svg
            width="100%"
            height="80%"
            viewBox="-500 -500 1000 1000"
            preserveAspectRatio="xMidYMid meet"
            style={{ maxHeight: "100vh" }}
          >
            <g>
              {links.map((link: any, index: number) => (
                <path
                  key={index}
                  d={linkPathGenerator(link) ?? ""}
                  fill="none"
                  stroke="#999"
                  opacity={opacityScale ? opacityScale(link.target.depth) : 0.6}
                  strokeWidth={1}
                />
              ))}
              {nodes.map((node: any, index: number) => (
                <g
                  key={index}
                  transform={`
                      rotate(${(node.x * 180) / Math.PI - 90})
                      translate(${node.y},0)
                    `}
                  onMouseEnter={(e) => {
                    setHoveredNode(node);
                    const svgRect =
                      e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    const nodeRect = e.currentTarget.getBoundingClientRect();
                    if (svgRect && nodeRect) {
                      setHoveredNodePosition({
                        x: nodeRect.left - svgRect.left + nodeRect.width / 2,
                        y: nodeRect.top - svgRect.top + nodeRect.height / 2,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredNode(null);
                    setHoveredNodePosition(null);
                  }}
                >
                  <circle
                    r={Math.min(
                      node.depth === 0
                        ? 6
                        : hoveredNode === node
                          ? (node.nodeSize || 2) * 1.2
                          : node.nodeSize || 2,
                      12,
                    )}
                    fill={
                      node.data.data?.hs2Code && colorScale
                        ? colorScale(node.data.data.hs2Code)
                        : "#ccc"
                    }
                    opacity={opacityScale ? opacityScale(node.depth) : 0.7}
                  />
                  {node.depth === 1 && (
                    <text
                      dy=".31em"
                      x={node.x < Math.PI === !node.children ? 6 : -6}
                      textAnchor={
                        node.x < Math.PI === !node.children ? "start" : "end"
                      }
                      transform={`${node.x >= Math.PI ? "rotate(180)" : ""}`}
                      fontSize="8px"
                      fontWeight={hoveredNode === node ? "bold" : "normal"}
                    >
                      {(node.data.data?.id || "")
                        .slice(0, maxLabelLength)
                        .trim() +
                        (node.data.data?.id?.length > maxLabelLength
                          ? "..."
                          : "")}
                    </text>
                  )}
                </g>
              ))}
              {hoveredNode && hoveredNodePosition && (
                <g
                  transform={`translate(${hoveredNodePosition.x}, ${hoveredNodePosition.y})`}
                >
                  <rect
                    x="5"
                    y="-20"
                    width="200"
                    height="40"
                    fill="white"
                    opacity="0.9"
                    rx="5"
                    ry="5"
                  />
                  <text x="10" y="0" fontSize="14px" fill="black">
                    {hoveredNode.data.data?.productName ||
                      hoveredNode.data.data?.id ||
                      "Node"}
                  </text>
                  <text x="10" y="20" fontSize="12px" fill="gray">
                    Value: {hoveredNode.value?.toLocaleString() || "N/A"}
                  </text>
                </g>
              )}
            </g>
          </svg>
        )}
      </Box>
    </FullWidthContent>
  );
};

export default TreeGrowthExperiment;

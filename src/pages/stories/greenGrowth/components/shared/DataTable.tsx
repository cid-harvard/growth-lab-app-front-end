import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import { useCountryName } from "../../queries/useCountryName";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import VisualizationLoading from "./VisualizationLoading";

export type DataTableType = "products" | "country" | "nested";

interface DataTableProps {
  defaultDataType: DataTableType;
  height?: number;
  selectedProducts?: any[];
}

const formatNumber = (
  value: number | null | undefined,
  decimals = 2,
): string => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return value.toFixed(decimals);
};

const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return `${(value * 100).toFixed(1)}%`;
};

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 1e6 ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(value);
};

interface ColumnDef {
  field: string;
  header: string;
  width: number;
  format?: (value: any) => string;
  tooltip?: string;
}

const ProductsTable = ({
  data,
  clustersData,
}: {
  data: any[];
  clustersData?: any;
  selectedProducts?: any[];
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const productLookup = useProductLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();
  const supplyChainLookup = useSupplyChainLookup();

  // Create cluster lookup for enriching data
  const clusterLookup = useMemo(() => {
    if (!clustersData?.ggClusterList) return new Map();
    return new Map(
      clustersData.ggClusterList.map((cluster: any) => [
        cluster.clusterId,
        cluster,
      ]),
    );
  }, [clustersData]);

  const processedData = useMemo(() => {
    if (!data || !productLookup) return [];

    // Show ALL products data with relationships
    return data
      .map((item) => {
        const product = productLookup.get(item.productId);
        const supplyChainMappings =
          supplyChainProductLookup?.get(item.productId) || [];
        const firstMapping = supplyChainMappings[0];
        const supplyChain = firstMapping
          ? supplyChainLookup?.get(firstMapping.supplyChainId)
          : null;
        const cluster = firstMapping
          ? clusterLookup?.get(firstMapping.clusterId)
          : null;

        return {
          ...item,
          productName: product?.nameShortEn || "Unknown Product",
          productCode: product?.code || "N/A",
          productLevel: product?.productLevel || "N/A",
          parentId: product?.parentId || "N/A",
          supplyChainName: supplyChain?.supplyChain || "N/A",
          clusterName: cluster?.clusterName || "N/A",
        };
      })
      .sort(
        (a, b) =>
          (b.pciCogFeasibilityComposite || 0) -
          (a.pciCogFeasibilityComposite || 0),
      );
  }, [
    data,
    productLookup,
    supplyChainProductLookup,
    supplyChainLookup,
    clusterLookup,
  ]);

  const columns: ColumnDef[] = [
    // Basic Product Information & Hierarchy
    { field: "productCode", header: "Code", width: isMobile ? 80 : 100 },
    { field: "productName", header: "Product", width: isMobile ? 150 : 200 },
    {
      field: "productLevel",
      header: "Level",
      width: 80,
      tooltip: "Product hierarchy level in classification system",
    },

    // Relationships
    {
      field: "clusterName",
      header: "Industry Cluster",
      width: isMobile ? 140 : 180,
      tooltip: "Industry cluster this product belongs to",
    },
    {
      field: "supplyChainName",
      header: "Supply Chain",
      width: isMobile ? 120 : 150,
      tooltip: "Green supply chain this product is part of",
    },

    // Export Performance (Current State)
    {
      field: "exportRca",
      header: "Export RCA",
      width: 100,
      format: formatNumber,
      tooltip:
        "Revealed Comparative Advantage - measures a country's relative export performance",
    },
    {
      field: "exportValue",
      header: "Export Value",
      width: 120,
      format: formatCurrency,
      tooltip: "Total export value for this product",
    },
    {
      field: "expectedExports",
      header: "Expected Exports",
      width: 130,
      format: formatCurrency,
      tooltip: "Expected export value based on the country's capabilities",
    },

    // Complexity Dimensions (ProductRadar focus)
    {
      field: "normalizedPci",
      header: "Product Complexity",
      width: 130,
      format: formatNumber,
      tooltip: "Measures the diversity of knowhow required to make a product",
    },
    {
      field: "normalizedCog",
      header: "Opportunity Gain",
      width: 150,
      format: formatNumber,
      tooltip: "Measures opportunities for future diversification",
    },

    // Market Dynamics (ProductScatter focus)
    {
      field: "marketGrowth",
      header: "Market Growth",
      width: 120,
      format: formatPercent,
      tooltip:
        "Rate of increase in this product's market size from 2013 to 2022",
    },
    {
      field: "productMarketShareGrowth",
      header: "Market Share Growth",
      width: 150,
      format: formatPercent,
      tooltip: "Growth in this product's market share over time",
    },

    // Statistical Measures
    {
      field: "pciStd",
      header: "PCI Std Dev",
      width: 110,
      format: formatNumber,
      tooltip: "Standard deviation of Product Complexity Index",
    },
    {
      field: "cogStd",
      header: "COG Std Dev",
      width: 110,
      format: formatNumber,
      tooltip: "Standard deviation of Complexity Outlook Gain",
    },
    {
      field: "feasibilityStd",
      header: "Feasibility Std Dev",
      width: 140,
      format: formatNumber,
      tooltip: "Standard deviation of Feasibility score",
    },

    // Composite Score (Key for all visualizations)
    {
      field: "pciCogFeasibilityComposite",
      header: "Composite Score",
      width: 130,
      format: formatNumber,
      tooltip: "Combined score of complexity, outlook gain, and feasibility",
    },
  ];

  return (
    <TableContainer
      component={Paper}
      sx={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Table stickyHeader size={isMobile ? "small" : "medium"} sx={{ flex: 1 }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.field}
                sx={{
                  minWidth: col.width,
                  fontWeight: theme.typography.fontWeightMedium,
                  backgroundColor: theme.palette.grey[50],
                  fontSize: isMobile
                    ? theme.typography.caption.fontSize
                    : theme.typography.body2.fontSize,
                }}
              >
                <Tooltip title={col.tooltip || ""} placement="top">
                  <span style={{ cursor: "help", textDecoration: "underline" }}>
                    {col.header}
                  </span>
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {processedData.map((row, index) => (
            <TableRow key={`${row.productId}-${index}`} hover>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  sx={{
                    fontSize: isMobile
                      ? theme.typography.caption.fontSize
                      : theme.typography.body2.fontSize,
                  }}
                >
                  {col.format ? col.format(row[col.field]) : row[col.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const CountryTable = ({
  data,
  selectedCountryId,
  countryLookup,
}: {
  data: any[];
  selectedCountryId: number;
  countryLookup: Map<number, any>;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Process data to add country names and organize with selected country first
  const processedData = useMemo(() => {
    if (!data || !countryLookup) return [];

    const dataWithNames = data.map((item) => {
      const country = countryLookup.get(item.countryId);
      return {
        ...item,
        countryName: country?.nameShortEn || "Unknown Country",
        countryCode: country?.iso3Code || "N/A",
        isSelected: item.countryId === selectedCountryId,
      };
    });

    // Sort: selected country first, then by country name
    return dataWithNames.sort((a, b) => {
      if (a.isSelected && !b.isSelected) return -1;
      if (!a.isSelected && b.isSelected) return 1;
      return b.coiGreen - a.coiGreen;
    });
  }, [data, countryLookup, selectedCountryId]);

  const columns: ColumnDef[] = [
    {
      field: "countryName",
      header: "Country",
      width: isMobile ? 120 : 150,
      tooltip: "Country name",
    },
    {
      field: "countryCode",
      header: "Code",
      width: 80,
      tooltip: "ISO3 country code",
    },
    {
      field: "year",
      header: "Year",
      width: 80,
      tooltip: "Data year",
    },
    {
      field: "coiGreen",
      header: "Green COI",
      width: 120,
      format: formatNumber,
      tooltip:
        "Green Complexity Outlook Index - measures green diversification potential",
    },
    {
      field: "lntotnetnrexpPc",
      header: "Ln Total Net NR Exp PC",
      width: 180,
      format: formatNumber,
      tooltip: "Log of total net natural resource exports per capita",
    },
    {
      field: "lnypc",
      header: "Ln GDP Per Capita",
      width: 150,
      format: formatNumber,
      tooltip: "Log of GDP per capita",
    },
    {
      field: "xResid",
      header: "Export Residual",
      width: 130,
      format: formatNumber,
      tooltip: "Export complexity residual after controlling for income",
    },
  ];

  return (
    <TableContainer
      component={Paper}
      sx={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Table stickyHeader size={isMobile ? "small" : "medium"} sx={{ flex: 1 }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.field}
                sx={{
                  minWidth: col.width,
                  fontWeight: theme.typography.fontWeightMedium,
                  backgroundColor: theme.palette.grey[50],
                  fontSize: isMobile
                    ? theme.typography.caption.fontSize
                    : theme.typography.body2.fontSize,
                }}
              >
                <Tooltip title={col.tooltip || ""} placement="top">
                  <span
                    style={{
                      cursor: "help",
                      textDecoration: col.tooltip ? "underline" : "none",
                    }}
                  >
                    {col.header}
                  </span>
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {processedData.map((row, index) => (
            <TableRow
              key={`${row.countryId}-${row.year}-${index}`}
              hover
              sx={{
                backgroundColor: "white",
                position: row.isSelected ? "sticky" : "static",
                top: row.isSelected ? 48 : "auto", // Below the header
                zIndex: row.isSelected ? 100 : "auto",
              }}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  sx={{
                    fontSize: isMobile
                      ? theme.typography.caption.fontSize
                      : theme.typography.body2.fontSize,
                    fontWeight: row.isSelected
                      ? theme.typography.fontWeightMedium
                      : theme.typography.fontWeightRegular,
                  }}
                >
                  {col.format ? col.format(row[col.field]) : row[col.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const NestedProductsTable = ({
  data,
  clustersData,
  showAllProducts,
  productClusterRows,
  selectedYear,
  selectedCountry,
}: {
  data: any[];
  clustersData?: any;
  selectedProducts?: any[];
  showAllProducts?: boolean;
  productClusterRows?: any[];
  selectedYear?: string;
  selectedCountry?: number;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const productLookup = useProductLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();
  const supplyChainLookup = useSupplyChainLookup();

  // Create cluster lookup for enriching data
  const clusterLookup = useMemo(() => {
    if (!clustersData?.ggClusterList) return new Map();
    return new Map(
      clustersData.ggClusterList.map((cluster: any) => [
        cluster.clusterId,
        cluster,
      ]),
    );
  }, [clustersData]);

  // Get additional data needed for complete taxonomy

  // Process and group data hierarchically
  const hierarchicalData = useMemo(() => {
    if (showAllProducts) {
      // SHOW ALL MODE: Use productClusterRows for complete taxonomy structure
      if (!productClusterRows || !productClusterRows.length) return [];

      // Build the hierarchy using the same approach as SankeyTree
      // Extract unique value chains and clusters from the complete product data
      const valueChains = Array.from(
        new Set(productClusterRows.map((r: any) => r.supply_chain)),
      );
      const clusters = Array.from(
        new Set(productClusterRows.map((r: any) => r.cluster_name)),
      ).sort();

      // Value chain name to supply chain ID mapping for ordering
      const valueChainNameToSupplyChainId: Record<string, number> = {
        "Heat Pumps": 0,
        "Critical Metals and Minerals": 1,
        "Fuel Cells And Green Hydrogen": 2,
        "Wind Power": 3,
        "Electric Vehicles": 4,
        "Nuclear Power": 5,
        "Electric Grid": 6,
        "Solar Power": 7,
        "Hydroelectric Power": 8,
        Batteries: 9,
      };

      // Sort value chains by their supply chain ID for consistent ordering
      valueChains.sort((a, b) => {
        const idA = valueChainNameToSupplyChainId[a] ?? 999;
        const idB = valueChainNameToSupplyChainId[b] ?? 999;
        return idA - idB;
      });

      // Build the complete hierarchy structure
      const completeHierarchy: any = {};

      // Initialize all supply chains
      valueChains.forEach((supplyChainName) => {
        const supplyChainId =
          valueChainNameToSupplyChainId[supplyChainName] ?? 999;
        completeHierarchy[supplyChainId] = {
          supplyChainName,
          supplyChainId,
          clusters: {},
          totalProducts: 0,
        };
      });

      // Add all clusters to their appropriate supply chains
      clusters.forEach((clusterName) => {
        // Find which supply chains this cluster belongs to
        const clustersForSupplyChains = productClusterRows
          .filter((r: any) => r.cluster_name === clusterName)
          .map((r: any) => r.supply_chain);

        const uniqueSupplyChains = Array.from(new Set(clustersForSupplyChains));

        uniqueSupplyChains.forEach((supplyChainName) => {
          const supplyChainId =
            valueChainNameToSupplyChainId[supplyChainName] ?? 999;
          if (completeHierarchy[supplyChainId]) {
            // Use cluster name as key to handle clusters that appear in multiple supply chains
            const clusterKey = `${clusterName}_${supplyChainId}`;
            completeHierarchy[supplyChainId].clusters[clusterKey] = {
              clusterName,
              clusterId: clusterKey,
              products: [],
            };
          }
        });
      });

      // Now populate with actual product data if available
      if (data && productLookup) {
        // Create a map of product data for quick lookup
        const countryProductMap = new Map();
        data.forEach((item) => {
          countryProductMap.set(item.productId, item);
        });

        // Add all products from productClusterRows
        productClusterRows.forEach((row: any) => {
          const supplyChainId =
            valueChainNameToSupplyChainId[row.supply_chain] ?? 999;
          const clusterKey = `${row.cluster_name}_${supplyChainId}`;

          if (completeHierarchy[supplyChainId]?.clusters[clusterKey]) {
            // Get country-specific data if available, otherwise create synthetic entry
            const countryProductData = countryProductMap.get(row.product_id);

            const product = productLookup.get(row.product_id);
            const processedProduct = {
              // Use country data if available, otherwise null values
              ...(countryProductData || {
                year: selectedYear ? parseInt(selectedYear) : 2021,
                countryId: selectedCountry || 0,
                productId: row.product_id,
                exportRca: null,
                exportValue: null,
                expectedExports: null,
                normalizedPci: null,
                normalizedCog: null,
                density: null,
                globalMarketShare: null,
                productMarketShare: null,
                productMarketShareGrowth: null,
                pciStd: null,
                cogStd: null,
                feasibilityStd: null,
                strategyBalancedPortfolio: null,
                strategyLongJump: null,
                strategyLowHangingFruit: null,
                strategyFrontier: null,
                pciCogFeasibilityComposite: null,
              }),
              productName: product?.nameShortEn || row.name_short_en,
              productCode: product?.code || row.HS2012_4dg,
              supplyChainName: row.supply_chain,
              clusterName: row.cluster_name,
              clusterId: clusterKey,
              supplyChainId,
            };

            completeHierarchy[supplyChainId].clusters[clusterKey].products.push(
              processedProduct,
            );
            completeHierarchy[supplyChainId].totalProducts++;
          }
        });

        // Sort products within each cluster by composite score (nulls last)
        Object.values(completeHierarchy).forEach((supplyChain: any) => {
          Object.values(supplyChain.clusters).forEach((cluster: any) => {
            cluster.products.sort((a: any, b: any) => {
              const aScore = a.pciCogFeasibilityComposite;
              const bScore = b.pciCogFeasibilityComposite;
              if (aScore === null && bScore === null) return 0;
              if (aScore === null) return 1;
              if (bScore === null) return -1;
              return bScore - aScore;
            });
          });
        });
      }

      return Object.values(completeHierarchy) as any[];
    } else {
      // COUNTRY MODE: Only show hierarchy for products that the country actually exports
      if (
        !data ||
        !productLookup ||
        !supplyChainProductLookup ||
        !supplyChainLookup
      )
        return [];

      // Filter data to only include products the country actually exports (with valid export data)
      const countryExportedProducts = data.filter((item) => {
        return (
          item.exportValue !== null &&
          item.exportValue !== undefined &&
          item.exportValue > 0
        );
      });

      if (countryExportedProducts.length === 0) return [];

      const processedData = countryExportedProducts
        .map((item) => {
          const product = productLookup.get(item.productId);
          const supplyChainMappings =
            supplyChainProductLookup?.get(item.productId) || [];
          const firstMapping = supplyChainMappings[0];
          const supplyChain = firstMapping
            ? supplyChainLookup?.get(firstMapping.supplyChainId)
            : null;
          const cluster = firstMapping
            ? clusterLookup?.get(firstMapping.clusterId)
            : null;

          return {
            ...item,
            productName: product?.nameShortEn || "Unknown Product",
            productCode: product?.code || "N/A",
            supplyChainName: supplyChain?.supplyChain || "Uncategorized",
            clusterName: cluster?.clusterName || "Uncategorized",
            clusterId: firstMapping?.clusterId || "uncategorized",
            supplyChainId: firstMapping?.supplyChainId || "uncategorized",
          };
        })
        .filter(
          (product) =>
            // Only include products that have valid supply chain and cluster mappings
            product.supplyChainName !== "Uncategorized" &&
            product.clusterName !== "Uncategorized",
        )
        .sort(
          (a, b) =>
            (b.pciCogFeasibilityComposite || 0) -
            (a.pciCogFeasibilityComposite || 0),
        );

      // Group by supply chain first, then by cluster within each supply chain
      const grouped = processedData.reduce((acc, product) => {
        const supplyChainKey = product.supplyChainId;
        if (!acc[supplyChainKey]) {
          acc[supplyChainKey] = {
            supplyChainName: product.supplyChainName,
            supplyChainId: product.supplyChainId,
            clusters: {},
            totalProducts: 0,
          };
        }

        const clusterKey = product.clusterId;
        if (!acc[supplyChainKey].clusters[clusterKey]) {
          acc[supplyChainKey].clusters[clusterKey] = {
            clusterName: product.clusterName,
            clusterId: product.clusterId,
            products: [],
          };
        }

        acc[supplyChainKey].clusters[clusterKey].products.push(product);
        acc[supplyChainKey].totalProducts++;
        return acc;
      }, {} as any);

      return Object.values(grouped) as any[];
    }
  }, [
    data,
    productLookup,
    supplyChainProductLookup,
    supplyChainLookup,
    clusterLookup,
    clustersData,
    showAllProducts,
    productClusterRows,
    selectedYear,
    selectedCountry,
  ]);

  const productColumns = [
    { field: "productCode", header: "Code", width: isMobile ? 80 : 100 },
    { field: "productName", header: "Product", width: isMobile ? 150 : 200 },
    {
      field: "exportRca",
      header: "Export RCA",
      width: 100,
      format: formatNumber,
      tooltip: "Revealed Comparative Advantage",
    },
    {
      field: "exportValue",
      header: "Export Value",
      width: 120,
      format: formatCurrency,
      tooltip: "Total export value for this product",
    },
    {
      field: "normalizedPci",
      header: "Complexity",
      width: 100,
      format: formatNumber,
      tooltip: "Product Complexity Index",
    },

    {
      field: "pciCogFeasibilityComposite",
      header: "Composite Score",
      width: 120,
      format: formatNumber,
      tooltip: "Combined complexity, outlook, and feasibility score",
    },
  ];

  // Calculate header heights for sticky positioning
  const mainHeaderHeight = isMobile ? 48 : 56; // Standard Material-UI table header height
  const supplyChainHeaderHeight = isMobile ? 40 : 48;
  const clusterHeaderHeight = isMobile ? 36 : 40;

  return (
    <TableContainer
      component={Paper}
      sx={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Table stickyHeader size={isMobile ? "small" : "medium"} sx={{ flex: 1 }}>
        <TableHead>
          <TableRow>
            {productColumns.map((col) => (
              <TableCell
                key={col.field}
                sx={{
                  minWidth: col.width,
                  fontWeight: theme.typography.fontWeightMedium,
                  backgroundColor: theme.palette.grey[50],
                  fontSize: isMobile
                    ? theme.typography.caption.fontSize
                    : theme.typography.body2.fontSize,
                  position: "sticky",
                  top: 0,
                  zIndex: 4,
                }}
              >
                <Tooltip title={col.tooltip || ""} placement="top">
                  <span
                    style={{
                      cursor: "help",
                      textDecoration: col.tooltip ? "underline" : "none",
                    }}
                  >
                    {col.header}
                  </span>
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {hierarchicalData.map((supplyChain) => (
            <React.Fragment key={supplyChain.supplyChainId}>
              {/* Supply Chain Header Row */}
              <TableRow
                sx={{
                  fontWeight: "bold",
                  position: "sticky",
                  top: mainHeaderHeight,
                  zIndex: 3,
                  backgroundColor: theme.palette.grey[50],
                  "& .MuiTableCell-root": {
                    backgroundColor: theme.palette.grey[50],
                    color: theme.palette.text.primary,
                    borderBottom: `2px solid ${theme.palette.grey[300]}`,
                  },
                }}
              >
                <TableCell
                  colSpan={productColumns.length}
                  sx={{
                    height: supplyChainHeaderHeight,
                    backgroundColor: "inherit",
                    color: "inherit",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="700"
                    sx={{ color: "inherit" }}
                  >
                    Value Chain: {supplyChain.supplyChainName}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Clusters and Products */}
              {(Object.values(supplyChain.clusters) as any[]).map(
                (cluster: any) => (
                  <React.Fragment key={cluster.clusterId}>
                    {/* Cluster Header Row */}
                    <TableRow
                      sx={{
                        backgroundColor: theme.palette.grey[100],
                        fontWeight: "600",
                        position: "sticky",
                        top: mainHeaderHeight + supplyChainHeaderHeight,
                        zIndex: 2,
                        "& .MuiTableCell-root": {
                          backgroundColor: theme.palette.grey[100],
                          borderBottom: `1px solid ${theme.palette.grey[300]}`,
                        },
                      }}
                    >
                      <TableCell
                        colSpan={productColumns.length}
                        sx={{
                          height: clusterHeaderHeight,
                          backgroundColor: "inherit",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight="600"
                          sx={{ pl: 2 }}
                        >
                          Cluster: {cluster.clusterName}
                        </Typography>
                      </TableCell>
                    </TableRow>

                    {/* Product Rows */}
                    {cluster.products.map((product: any, index: number) => (
                      <TableRow
                        key={`${product.productId}-${index}`}
                        hover
                        sx={{
                          pl: 4,
                          "& .MuiTableCell-root": {
                            backgroundColor: theme.palette.background.paper,
                          },
                        }}
                      >
                        {productColumns.map((col) => (
                          <TableCell
                            key={col.field}
                            sx={{
                              fontSize: isMobile
                                ? theme.typography.caption.fontSize
                                : theme.typography.body2.fontSize,
                              minWidth: col.width,
                              pl: col.field === productColumns[0].field ? 4 : 2,
                              backgroundColor: "inherit",
                            }}
                          >
                            {col.format
                              ? col.format(product[col.field])
                              : product[col.field]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ),
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const DataTable: React.FC<DataTableProps> = ({
  defaultDataType,
  height = 600,
  selectedProducts,
}) => {
  const selectedYear = useYearSelection();
  const selectedCountry = useCountrySelection();
  const countryName = useCountryName();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for currently selected data type
  const [currentDataType, setCurrentDataType] =
    useState<DataTableType>(defaultDataType);

  // State for showing all products vs country products in nested view
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Use shared data fetching hook for all data types
  const {
    countryData,
    clustersData,
    allCountriesMetrics,
    countryLookup,
    productClusterRows,
    isLoading,
    hasErrors,
  } = useGreenGrowthData(
    selectedCountry,
    parseInt(selectedYear),
    true, // Fetch all countries metrics for country table
  );

  // Get product lookup for all products data
  const productLookup = useProductLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();

  // Extract product data for compatibility
  const productData = useMemo(() => {
    if (!countryData?.productData) return null;
    return { ggCpyList: countryData.productData };
  }, [countryData]);

  // Create synthetic all-products data when showAllProducts is enabled
  const allProductsData = useMemo(() => {
    if (!productLookup || !supplyChainProductLookup) return null;

    // Create a lookup map of existing country data for quick access
    const countryDataMap = new Map();
    if (productData?.ggCpyList) {
      productData.ggCpyList.forEach((item: any) => {
        countryDataMap.set(item.productId, item);
      });
    }

    const allProducts = Array.from(productLookup.values());
    const syntheticProductData = allProducts
      .map((product) => {
        // Check if this product has supply chain mappings (is part of green growth)
        const supplyChainMappings =
          supplyChainProductLookup.get(product.productId) || [];

        // Only include products that are part of green supply chains
        if (supplyChainMappings.length === 0) return null;

        // Check if we have real country data for this product
        const existingCountryData = countryDataMap.get(product.productId);

        return {
          year: parseInt(selectedYear),
          countryId: selectedCountry,
          productId: product.productId,
          // Use real country data if available, otherwise null
          exportRca: existingCountryData?.exportRca || null,
          exportValue: existingCountryData?.exportValue || null,
          expectedExports: existingCountryData?.expectedExports || null,
          normalizedPci: existingCountryData?.normalizedPci || null,
          normalizedCog: existingCountryData?.normalizedCog || null,
          density: existingCountryData?.density || null,
          globalMarketShare: existingCountryData?.globalMarketShare || null,
          productMarketShare: existingCountryData?.productMarketShare || null,

          productMarketShareGrowth:
            existingCountryData?.productMarketShareGrowth || null,
          marketGrowth: existingCountryData?.marketGrowth || null,
          pciStd: existingCountryData?.pciStd || null,
          cogStd: existingCountryData?.cogStd || null,
          feasibilityStd: existingCountryData?.feasibilityStd || null,
          strategyBalancedPortfolio:
            existingCountryData?.strategyBalancedPortfolio || null,
          strategyLongJump: existingCountryData?.strategyLongJump || null,
          strategyLowHangingFruit:
            existingCountryData?.strategyLowHangingFruit || null,
          strategyFrontier: existingCountryData?.strategyFrontier || null,
          pciCogFeasibilityComposite:
            existingCountryData?.pciCogFeasibilityComposite || null,
        };
      })
      .filter(Boolean); // Remove null entries

    return { ggCpyList: syntheticProductData };
  }, [
    productLookup,
    supplyChainProductLookup,
    selectedYear,
    selectedCountry,
    productData,
  ]);

  // Format data to match expected structure
  const countryYearData = useMemo(() => {
    if (!allCountriesMetrics.length) return null;
    return { ggCountryYearList: allCountriesMetrics };
  }, [allCountriesMetrics]);

  // Get the appropriate data based on currentDataType and showAllProducts toggle
  const tableData = useMemo(() => {
    if (currentDataType === "products") {
      return productData?.ggCpyList || [];
    } else if (currentDataType === "nested") {
      // Use all products data if toggle is enabled and data is available
      if (showAllProducts && allProductsData?.ggCpyList) {
        return allProductsData.ggCpyList;
      }
      return productData?.ggCpyList || [];
    } else if (currentDataType === "country") {
      return countryYearData?.ggCountryYearList || [];
    }
    return [];
  }, [
    currentDataType,
    showAllProducts,
    productData,
    allProductsData,
    countryYearData,
  ]);

  // Use unified loading and error states
  // Only show loading if we have no data to display at all
  const hasAnyData =
    productData?.ggCpyList?.length > 0 || allCountriesMetrics.length > 0;
  const loading = isLoading && !hasAnyData;
  const error = hasErrors;

  if (loading) {
    return <VisualizationLoading />;
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height,
        }}
      >
        <Typography color="error">
          Error loading data: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: height !== 600 ? height : undefined,
        flex: height === 600 ? 1 : undefined,
        display: "flex",
        flexDirection: "column",
        minHeight: height === 600 ? 0 : undefined,
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "grey.200" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" component="h2">
              {getTableTitle(currentDataType)} - {countryName} ({selectedYear})
            </Typography>
          </Box>

          {/* Data Type Selector */}
          <ToggleButtonGroup
            value={currentDataType}
            exclusive
            onChange={(_, newDataType) => {
              if (newDataType !== null) {
                setCurrentDataType(newDataType);
              }
            }}
            aria-label="data type selector"
            size={isMobile ? "small" : "medium"}
            sx={{
              flexShrink: 0,
              ml: 2,
            }}
          >
            <ToggleButton value="products" aria-label="products">
              {isMobile ? "Flat" : "Flat Products"}
            </ToggleButton>
            <ToggleButton value="nested" aria-label="nested">
              {isMobile ? "Nested" : "Nested Products"}
            </ToggleButton>
            <ToggleButton value="country" aria-label="country">
              {isMobile ? "Country" : "Country Metrics"}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Show All Products Toggle - only for nested view */}
        {currentDataType === "nested" && (
          <Box sx={{ mb: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showAllProducts}
                  onChange={(e) => setShowAllProducts(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2">
                  Show all products (not just {countryName} exports)
                </Typography>
              }
              sx={{ ml: 0 }}
            />
          </Box>
        )}
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {currentDataType === "products" && (
          <ProductsTable
            data={tableData}
            clustersData={clustersData}
            selectedProducts={selectedProducts}
          />
        )}
        {currentDataType === "nested" && (
          <NestedProductsTable
            data={tableData}
            clustersData={clustersData}
            selectedProducts={selectedProducts}
            showAllProducts={showAllProducts}
            productClusterRows={productClusterRows}
            selectedYear={selectedYear}
            selectedCountry={selectedCountry}
          />
        )}
        {currentDataType === "country" && (
          <CountryTable
            data={tableData}
            selectedCountryId={selectedCountry}
            countryLookup={countryLookup}
          />
        )}
      </Box>
    </Box>
  );
};

const getTableTitle = (dataType: DataTableType): string => {
  const titles: Record<DataTableType, string> = {
    products: "Products & Relationships",
    nested: "Nested Product Hierarchy",
    country: "Country Metrics",
  };
  return titles[dataType];
};

export default DataTable;

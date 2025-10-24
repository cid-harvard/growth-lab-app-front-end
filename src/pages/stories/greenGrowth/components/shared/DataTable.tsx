/* eslint-disable react/no-array-index-key */
import React, { useMemo, useState, useCallback, useEffect } from "react";
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
  useTheme,
  useMediaQuery,
  Button,
  ButtonGroup,
  TableSortLabel,
  Tooltip,
  IconButton,
} from "@mui/material";
import GGTooltip from "./GGTooltip";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import VisualizationLoading from "./VisualizationLoading";
import DisplayAsSwitch from "./DisplayAsSwitch";
import { columnTooltips } from "../shared/columnTooltips";
import AtlasIcon from "../../../../../assets/GL_Atlas_favicon.png";

export type DataTableType = "products" | "nested";

interface DataTableProps {
  defaultDataType: DataTableType;
  height?: number;
  selectedProducts?: any[];
}

const formatNumber = (
  value: number | null | undefined,
  decimals = 2,
): string => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(typeof value === "number" ? value : Number(value))
  )
    return "N/A";
  return Number(value).toFixed(decimals);
};

const formatPercent = (value: number | null | undefined): string => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(typeof value === "number" ? value : Number(value))
  )
    return "N/A";
  return `${Number(value).toFixed(2)}%`;
};

const formatCurrency = (value: number | null | undefined): string => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(typeof value === "number" ? value : Number(value))
  )
    return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 1e6 ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(Number(value));
};

interface ColumnDef {
  field: string;
  header: string;
  width: number;
  format?: (value: any) => string;
  render?: (row: any) => React.ReactNode;
  tooltip?: React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: any) => any;
  defaultOrder?: "asc" | "desc";
}

const ProductsTable = ({
  data,
  clustersData,
  selectedYear,
}: {
  data: any[];
  clustersData?: any;
  selectedProducts?: any[];
  selectedYear?: string | number;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const productLookup = useProductLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();
  const supplyChainLookup = useSupplyChainLookup();
  const selectedCountry = useCountrySelection();

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("defaultComposite");
  const defaultOrderByField = useMemo(
    () =>
      ({
        productCode: "asc",
        productName: "asc",
        clusterName: "asc",
        supplyChainName: "asc",
        exportValue: "desc",
        marketSize: "desc",
        marketGrowth: "desc",
        exportRca: "desc",
        normalizedCog: "desc",
        normalizedPci: "desc",
        density: "desc",
        defaultComposite: "desc",
      }) as Record<string, "asc" | "desc">,
    [],
  );

  const handleRequestSort = useCallback(
    (property: string) => {
      if (orderBy !== property) {
        const firstOrder = defaultOrderByField[property] ?? "desc";
        setOrder(firstOrder);
        setOrderBy(property);
        return;
      }
      setOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    },
    [orderBy, defaultOrderByField],
  );

  // Helper: compute 1-5 diamond rating based on deciles
  const computeDiamondRatings = useCallback(
    (values: Array<number | null | undefined>) => {
      const valid = values
        .filter((v) => typeof v === "number" && !Number.isNaN(Number(v)))
        .map((v) => Number(v as number))
        .sort((a, b) => a - b);
      if (valid.length === 0) {
        return {
          getRating: (_v: number | null | undefined) => 0,
        };
      }

      const getRating = (v: number | null | undefined): number => {
        if (v === null || v === undefined || Number.isNaN(Number(v))) return 0;
        const value = Number(v);
        // Find rank index (last index <= value)
        let lo = 0;
        let hi = valid.length - 1;
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          if (valid[mid] <= value) lo = mid + 1;
          else hi = mid - 1;
        }
        const rankIndex = Math.max(0, Math.min(valid.length - 1, lo - 1));
        const percentile =
          valid.length === 1 ? 1 : (rankIndex + 1) / valid.length; // 0..1
        const decile = Math.min(10, Math.max(1, Math.floor(percentile * 10)));
        const rating = Math.min(5, Math.max(1, Math.ceil(decile / 2)));
        return rating;
      };

      return { getRating };
    },
    [],
  );

  const DiamondRow = useCallback(
    ({ count }: { count: number }) => {
      const total = 5;
      const size = isMobile ? 10 : 12;
      const gap = isMobile ? 6 : 8;
      const diamondIds = ["d1", "d2", "d3", "d4", "d5"];
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: `${gap}px` }}>
          {diamondIds.slice(0, total).map((id, idx) => {
            const filled = idx < count;
            // eslint-disable-next-line react/no-array-index-key
            return (
              <Box
                key={id}
                component="span"
                sx={{
                  width: `${size}px`,
                  height: `${size}px`,
                  transform: "rotate(45deg)",
                  borderRadius: "2px",
                  border: `2px solid ${theme.palette.grey[500]}`,
                  backgroundColor: filled
                    ? theme.palette.grey[600]
                    : "transparent",
                  boxSizing: "border-box",
                  display: "inline-block",
                }}
              />
            );
          })}
        </Box>
      );
    },
    [isMobile, theme],
  );

  const buildDiamondLegend = useCallback(
    (content: React.ReactNode): React.ReactNode => (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}>
          {content}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DiamondRow count={5} />
          <Typography variant="caption">Strong</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DiamondRow count={0} />
          <Typography variant="caption">Weak</Typography>
        </Box>
      </Box>
    ),
    [isMobile, DiamondRow],
  );

  // Create cluster lookup for enriching data
  const clusterLookup = useMemo(() => {
    if (!clustersData?.gpClusterList) return new Map();
    return new Map(
      clustersData.gpClusterList.map((cluster: any) => [
        cluster.clusterId,
        cluster,
      ]),
    );
  }, [clustersData?.gpClusterList]);

  // Stable getters to satisfy lint rules about dependencies
  const getSupplyChainMappings = useCallback(
    (productId: number) => supplyChainProductLookup?.get(productId) || [],
    [supplyChainProductLookup],
  );
  const getSupplyChainById = useCallback(
    (supplyChainId: number) => supplyChainLookup?.get(supplyChainId) || null,
    [supplyChainLookup],
  );
  const getClusterById = useCallback(
    (clusterId: number) => clusterLookup?.get(clusterId) || null,
    [clusterLookup],
  );

  const processedData = useMemo(() => {
    if (!data || !productLookup) return [];

    // Show ALL products data with relationships
    return data.map((item) => {
      const product = productLookup.get(item.productId);
      const supplyChainMappings = getSupplyChainMappings(item.productId);
      const firstMapping = supplyChainMappings[0];
      const supplyChain = firstMapping
        ? getSupplyChainById(firstMapping.supplyChainId)
        : null;
      const cluster = firstMapping
        ? getClusterById(firstMapping.clusterId)
        : null;

      const marketSize =
        item && typeof item.productMarketShare === "number"
          ? item.productMarketShare
          : null;

      return {
        ...item,
        productName: product?.nameShortEn || "Unknown Product",
        productCode: product?.code || "N/A",
        supplyChainName: supplyChain?.supplyChain || "N/A",
        clusterName: cluster?.clusterName || "N/A",
        marketSize,
        // Ensure table uses a consistent key for growth
        marketGrowth: item.productMarketShareGrowth,
      };
    });
  }, [
    data,
    productLookup,
    getSupplyChainMappings,
    getSupplyChainById,
    getClusterById,
  ]);

  const computeCompositeScore = useCallback((row: any) => {
    if (typeof row?.pciCogFeasibilityComposite === "number") {
      return row.pciCogFeasibilityComposite as number;
    }
    const parts = [row?.normalizedPci, row?.normalizedCog, row?.density];
    return parts
      .map((v) => (typeof v === "number" ? (v as number) : 0))
      .reduce((s, v) => s + v, 0);
  }, []);

  // Build decile-based rating functions for three dimensions
  const { getRating: getCogRating } = useMemo(
    () => computeDiamondRatings(processedData.map((d: any) => d.normalizedCog)),
    [processedData, computeDiamondRatings],
  );
  const { getRating: getPciRating } = useMemo(
    () => computeDiamondRatings(processedData.map((d: any) => d.normalizedPci)),
    [processedData, computeDiamondRatings],
  );
  const { getRating: getDensityRating } = useMemo(
    () => computeDiamondRatings(processedData.map((d: any) => d.density)),
    [processedData, computeDiamondRatings],
  );

  const buildAtlasUrl = useCallback(
    (productId: number | string | undefined | null) => {
      const pid = String(productId ?? "").replace(/\D/g, "");
      const countryId = String(selectedCountry || "");
      if (!pid || !countryId) return null;
      return `https://atlas.hks.harvard.edu/explore/treemap?exporter=country-${countryId}&view=markets&product=product-HS12-${pid}&productClass=HS12`;
    },
    [selectedCountry],
  );

  const columns: ColumnDef[] = useMemo(
    () => [
      // Basic Product Information
      {
        field: "productCode",
        header: "HS Code",
        width: isMobile ? 90 : 110,
        format: (value: any) => (value ? `HS ${value}` : "N/A"),
        sortable: true,
        sortValue: (row: any) => String(row.productCode ?? ""),
        defaultOrder: "asc",
      },
      {
        field: "productName",
        header: "Product",
        width: isMobile ? 150 : 220,
        sortable: true,
        sortValue: (row: any) => String(row.productName ?? ""),
        defaultOrder: "asc",
        render: (row: any) => {
          const atlasUrl = buildAtlasUrl(row.productId);
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {atlasUrl && (
                <Tooltip title="View in Atlas" placement="top">
                  <IconButton
                    component="a"
                    href={atlasUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open in Atlas treemap (markets view)"
                    size="small"
                    sx={{
                      width: 28,
                      height: 28,
                      p: 0,
                      borderRadius: 1,
                      backgroundColor: (t) => t.palette.grey[200],
                      "&:hover": {
                        backgroundColor: (t) => t.palette.grey[300],
                      },
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      component="img"
                      src={AtlasIcon as any}
                      alt="Atlas"
                      sx={{ width: 16, height: 16, display: "block" }}
                    />
                  </IconButton>
                </Tooltip>
              )}
              <span>{row.productName}</span>
            </Box>
          );
        },
      },

      // Relationships
      {
        field: "clusterName",
        header: "Green Industrial Cluster",
        width: isMobile ? 160 : 220,
        tooltip: columnTooltips["Green Industrial Cluster"],
        sortable: true,
        sortValue: (row: any) => String(row.clusterName ?? ""),
        defaultOrder: "asc",
      },
      {
        field: "supplyChainName",
        header: "Green Value Chain",
        width: isMobile ? 150 : 200,
        tooltip: columnTooltips["Green Value Chain"],
        sortable: true,
        sortValue: (row: any) => String(row.supplyChainName ?? ""),
        defaultOrder: "asc",
      },

      // Export performance and market size
      {
        field: "exportValue",
        header: `Product Export Value (USD, ${selectedYear ?? "year"})`,
        width: 160,
        format: formatCurrency,
        sortable: true,
        sortValue: (row: any) => row.exportValue ?? null,
        defaultOrder: "desc",
      },
      {
        field: "marketSize",
        header: "Product Market Size (%)",
        width: 170,
        format: formatPercent,
        sortable: true,
        sortValue: (row: any) => row.marketSize ?? null,
        defaultOrder: "desc",
      },
      {
        field: "marketGrowth",
        header: "Product Market Growth",
        tooltip:
          "Relative percentage change in a product's global market share compared to its average market share over the previous 3 years.",
        width: 210,
        format: formatPercent,
        sortable: true,
        sortValue: (row: any) => row.marketGrowth ?? null,
        defaultOrder: "desc",
      },

      // Capability dimensions
      {
        field: "exportRca",
        header: "Export RCA",
        width: 120,
        format: formatNumber,
        tooltip: columnTooltips["Export RCA"],
        sortable: true,
        sortValue: (row: any) => row.exportRca ?? null,
        defaultOrder: "desc",
      },
      {
        field: "normalizedCog",
        header: "Opportunity Gain",
        width: 160,
        render: (row: any) => (
          <DiamondRow count={getCogRating(row.normalizedCog)} />
        ),
        tooltip: buildDiamondLegend(columnTooltips["Opportunity Gain"]),
        sortable: true,
        sortValue: (row: any) => row.normalizedCog ?? null,
        defaultOrder: "desc",
      },
      {
        field: "normalizedPci",
        header: "Product Complexity",
        width: 160,
        render: (row: any) => (
          <DiamondRow count={getPciRating(row.normalizedPci)} />
        ),
        tooltip: buildDiamondLegend(columnTooltips["Product Complexity"]),
        sortable: true,
        sortValue: (row: any) => row.normalizedPci ?? null,
        defaultOrder: "desc",
      },
      {
        field: "density",
        header: "Product Feasibility",
        width: 160,
        render: (row: any) => (
          <DiamondRow count={getDensityRating(row.density)} />
        ),
        tooltip: buildDiamondLegend(columnTooltips["Product Feasibility"]),
        sortable: true,
        sortValue: (row: any) => row.density ?? null,
        defaultOrder: "desc",
      },
    ],
    [
      isMobile,
      selectedYear,
      getCogRating,
      getPciRating,
      getDensityRating,
      DiamondRow,
      buildAtlasUrl,
      buildDiamondLegend,
    ],
  );

  const getSortValueForField = useCallback(
    (row: any, field: string) => {
      if (field === "defaultComposite") return computeCompositeScore(row);
      const col = columns.find((c) => c.field === field);
      if (!col) return null;
      if (col.sortValue) return col.sortValue(row);
      return (row as any)[field];
    },
    [columns, computeCompositeScore],
  );

  const sortedData = useMemo(() => {
    const arr = processedData.slice();
    const comparator = (a: any, b: any) => {
      const va = getSortValueForField(a, orderBy);
      const vb = getSortValueForField(b, orderBy);
      const aNull =
        va === null ||
        va === undefined ||
        (typeof va === "number" && Number.isNaN(va));
      const bNull =
        vb === null ||
        vb === undefined ||
        (typeof vb === "number" && Number.isNaN(vb));
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;
      if (typeof va === "string" || typeof vb === "string") {
        const res = String(va).localeCompare(String(vb));
        return order === "asc" ? res : -res;
      }
      const na = Number(va);
      const nb = Number(vb);
      const res = na < nb ? -1 : na > nb ? 1 : 0;
      return order === "asc" ? res : -res;
    };
    return arr.sort(comparator);
  }, [processedData, order, orderBy, getSortValueForField]);

  return (
    <TableContainer
      component={Paper}
      sx={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        mr: 2,
        mb: 2,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
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
                {col.sortable ? (
                  col.tooltip ? (
                    <GGTooltip title={col.tooltip} placement="top">
                      <TableSortLabel
                        active={orderBy === col.field}
                        direction={
                          orderBy === col.field
                            ? order
                            : (defaultOrderByField[col.field] ?? "desc")
                        }
                        onClick={() => handleRequestSort(col.field)}
                      >
                        {col.header}
                      </TableSortLabel>
                    </GGTooltip>
                  ) : (
                    <TableSortLabel
                      active={orderBy === col.field}
                      direction={
                        orderBy === col.field
                          ? order
                          : (defaultOrderByField[col.field] ?? "desc")
                      }
                      onClick={() => handleRequestSort(col.field)}
                    >
                      {col.header}
                    </TableSortLabel>
                  )
                ) : col.tooltip ? (
                  <GGTooltip title={col.tooltip} placement="top">
                    <span
                      style={{ cursor: "help", textDecoration: "underline" }}
                    >
                      {col.header}
                    </span>
                  </GGTooltip>
                ) : (
                  <span>{col.header}</span>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row, index) => (
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
                  {col.render
                    ? col.render(row)
                    : col.format
                      ? col.format(row[col.field])
                      : row[col.field]}
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
  productClusterRows,
  selectedYear,
}: {
  data: any[];
  selectedProducts?: any[];
  productClusterRows?: any[];
  selectedYear?: string;
  selectedCountry?: number;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const productLookup = useProductLookup();
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("defaultComposite");
  const defaultOrderByField = useMemo(
    () =>
      ({
        productCode: "asc",
        productName: "asc",
        exportRca: "desc",
        exportValue: "desc",
        marketSize: "desc",
        marketGrowth: "desc",
        normalizedPci: "desc",
        normalizedCog: "desc",
        density: "desc",
        defaultComposite: "desc",
      }) as Record<string, "asc" | "desc">,
    [],
  );
  const handleRequestSort = useCallback(
    (property: string) => {
      if (orderBy !== property) {
        const firstOrder = defaultOrderByField[property] ?? "desc";
        setOrder(firstOrder);
        setOrderBy(property);
        return;
      }
      setOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    },
    [orderBy, defaultOrderByField],
  );

  // Helper: compute 1-5 diamond rating based on deciles (nested scope)
  const computeDiamondRatings = useCallback(
    (values: Array<number | null | undefined>) => {
      const valid = values
        .filter((v) => typeof v === "number" && !Number.isNaN(Number(v)))
        .map((v) => Number(v as number))
        .sort((a, b) => a - b);
      if (valid.length === 0) {
        return {
          getRating: (_v: number | null | undefined) => 0,
        };
      }

      const getRating = (v: number | null | undefined): number => {
        if (v === null || v === undefined || Number.isNaN(Number(v))) return 0;
        const value = Number(v);
        let lo = 0;
        let hi = valid.length - 1;
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          if (valid[mid] <= value) lo = mid + 1;
          else hi = mid - 1;
        }
        const rankIndex = Math.max(0, Math.min(valid.length - 1, lo - 1));
        const percentile =
          valid.length === 1 ? 1 : (rankIndex + 1) / valid.length;
        const decile = Math.min(10, Math.max(1, Math.floor(percentile * 10)));
        const rating = Math.min(5, Math.max(1, Math.ceil(decile / 2)));
        return rating;
      };

      return { getRating };
    },
    [],
  );

  const DiamondRow = useCallback(
    ({ count }: { count: number }) => {
      const total = 5;
      const size = isMobile ? 10 : 12;
      const gap = isMobile ? 6 : 8;
      const diamondIds = ["d1", "d2", "d3", "d4", "d5"];
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: `${gap}px` }}>
          {diamondIds.slice(0, total).map((id, idx) => {
            const filled = idx < count;
            // eslint-disable-next-line react/no-array-index-key
            return (
              <Box
                key={id}
                component="span"
                sx={{
                  width: `${size}px`,
                  height: `${size}px`,
                  transform: "rotate(45deg)",
                  borderRadius: "2px",
                  border: `2px solid ${theme.palette.grey[500]}`,
                  backgroundColor: filled
                    ? theme.palette.grey[600]
                    : "transparent",
                  boxSizing: "border-box",
                  display: "inline-block",
                }}
              />
            );
          })}
        </Box>
      );
    },
    [isMobile, theme],
  );

  const buildDiamondLegend = useCallback(
    (content: React.ReactNode): React.ReactNode => (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}>
          {content}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DiamondRow count={5} />
          <Typography variant="caption">Strong</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DiamondRow count={0} />
          <Typography variant="caption">Weak</Typography>
        </Box>
      </Box>
    ),
    [isMobile, DiamondRow],
  );

  // No cluster lookup needed for nested full-taxonomy view

  // Get additional data needed for complete taxonomy

  // Process and group data hierarchically (API-backed products only)
  const hierarchicalData = useMemo(() => {
    if (!productClusterRows || !productClusterRows.length) return [];

    const valueChainNameToSortOrder: Record<string, number> = {
      "Electric Vehicles": 0,
      "Heat Pumps": 1,
      "Fuel Cells And Green Hydrogen": 2,
      "Wind Power": 3,
      "Solar Power": 4,
      "Hydroelectric Power": 5,
      "Nuclear Power": 6,
      Batteries: 7,
      "Electric Grid": 8,
      "Critical Metals and Minerals": 9,
    };

    const completeHierarchy: any = {};

    if (data && productLookup) {
      const countryProductMap = new Map();
      data.forEach((item) => {
        countryProductMap.set(item.productId, item);
      });

      productClusterRows.forEach((row: any) => {
        // Only include products that exist in API-provided country data
        const countryProductData = countryProductMap.get(row.product_id);
        if (!countryProductData) return;

        const supplyChainId =
          valueChainNameToSortOrder[row.supply_chain] ?? 999;
        if (!completeHierarchy[supplyChainId]) {
          completeHierarchy[supplyChainId] = {
            supplyChainName: row.supply_chain,
            supplyChainId,
            clusters: {},
            totalProducts: 0,
          };
        }

        const clusterKey = `${row.cluster_name}_${supplyChainId}`;
        if (!completeHierarchy[supplyChainId].clusters[clusterKey]) {
          completeHierarchy[supplyChainId].clusters[clusterKey] = {
            clusterName: row.cluster_name,
            clusterId: clusterKey,
            products: [],
          };
        }

        const product = productLookup.get(row.product_id);
        const processedProduct: any = {
          ...countryProductData,
          productName: product?.nameShortEn || row.name_short_en,
          productCode: product?.code || row.HS2012_4dg,
          supplyChainName: row.supply_chain,
          clusterName: row.cluster_name,
          clusterId: clusterKey,
          supplyChainId,
        };

        if (typeof processedProduct.productMarketShare === "number") {
          processedProduct.marketSize = processedProduct.productMarketShare;
        } else {
          processedProduct.marketSize = null;
        }

        completeHierarchy[supplyChainId].clusters[clusterKey].products.push(
          processedProduct,
        );
        completeHierarchy[supplyChainId].totalProducts++;
      });
    }

    // Convert to array and prune any empty clusters or supply chains
    const result = Object.values(completeHierarchy)
      .map((sc: any) => {
        const prunedClusters = Object.fromEntries(
          Object.entries(sc.clusters).filter(
            ([, cl]: any) => (cl.products || []).length > 0,
          ),
        );
        return { ...sc, clusters: prunedClusters };
      })
      .filter((sc: any) => Object.keys(sc.clusters).length > 0)
      .sort((a: any, b: any) => a.supplyChainId - b.supplyChainId);

    return result as any[];
  }, [data, productLookup, productClusterRows]);

  // Flatten all nested products for ratings
  const allNestedProducts = useMemo(() => {
    const items: any[] = [];
    (hierarchicalData || []).forEach((sc: any) => {
      Object.values(sc.clusters).forEach((cl: any) => {
        items.push(...(cl as any).products);
      });
    });
    return items;
  }, [hierarchicalData]);

  const { getRating: getNestedCogRating } = useMemo(
    () =>
      computeDiamondRatings(allNestedProducts.map((p: any) => p.normalizedCog)),
    [computeDiamondRatings, allNestedProducts],
  );
  const { getRating: getNestedPciRating } = useMemo(
    () =>
      computeDiamondRatings(allNestedProducts.map((p: any) => p.normalizedPci)),
    [computeDiamondRatings, allNestedProducts],
  );
  const { getRating: getNestedDensityRating } = useMemo(
    () => computeDiamondRatings(allNestedProducts.map((p: any) => p.density)),
    [computeDiamondRatings, allNestedProducts],
  );

  const selectedCountry = useCountrySelection();
  const buildAtlasUrl = useCallback(
    (productId: number | string | undefined | null) => {
      const pid = String(productId ?? "").replace(/\D/g, "");
      const countryId = String(selectedCountry || "");
      if (!pid || !countryId) return null;
      return `https://atlas.hks.harvard.edu/explore/treemap?exporter=country-${countryId}&view=markets&product=product-HS12-${pid}&productClass=HS12`;
    },
    [selectedCountry],
  );

  const productColumns: ColumnDef[] = useMemo(
    () => [
      {
        field: "productCode",
        header: "HS Code",
        width: isMobile ? 90 : 110,
        format: (value: any) => (value ? `HS ${value}` : "N/A"),
        sortable: true,
        sortValue: (row: any) => String(row.productCode ?? ""),
      },
      {
        field: "productName",
        header: "Product",
        width: isMobile ? 150 : 220,
        sortable: true,
        sortValue: (row: any) => String(row.productName ?? ""),
        render: (row: any) => {
          const atlasUrl = buildAtlasUrl(row.productId);
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {atlasUrl && (
                <Tooltip title="View in Atlas" placement="top">
                  <IconButton
                    component="a"
                    href={atlasUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open in Atlas treemap (markets view)"
                    size="small"
                    sx={{
                      width: 28,
                      height: 28,
                      p: 0,
                      borderRadius: 1,
                      backgroundColor: (t) => t.palette.grey[200],
                      "&:hover": {
                        backgroundColor: (t) => t.palette.grey[300],
                      },
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      component="img"
                      src={AtlasIcon as any}
                      alt="Atlas"
                      sx={{ width: 16, height: 16, display: "block" }}
                    />
                  </IconButton>
                </Tooltip>
              )}
              <span>{row.productName}</span>
            </Box>
          );
        },
      },
      {
        field: "exportRca",
        header: "Export RCA",
        width: 120,
        format: formatNumber,
        tooltip: columnTooltips["Export RCA"],
        sortable: true,
        sortValue: (row: any) => row.exportRca ?? null,
      },
      {
        field: "exportValue",
        header: `Product Export Value (USD, ${selectedYear ?? "year"})`,
        width: 160,
        format: formatCurrency,
        sortable: true,
        sortValue: (row: any) => row.exportValue ?? null,
      },
      {
        field: "marketSize",
        header: "Product Market Size (%)",
        width: 170,
        format: formatPercent,
        sortable: true,
        sortValue: (row: any) => row.marketSize ?? null,
      },
      {
        field: "marketGrowth",
        header: "Product Market Growth",
        tooltip:
          "Relative percentage change in a product's global market share compared to its average market share over the previous 3 years.",
        width: 160,
        format: formatPercent,
        sortable: true,
        sortValue: (row: any) => row.marketGrowth ?? null,
      },
      {
        field: "normalizedPci",
        header: "Product Complexity",
        width: 160,
        render: (row: any) => (
          <DiamondRow count={getNestedPciRating(row.normalizedPci)} />
        ),
        tooltip: buildDiamondLegend(columnTooltips["Product Complexity"]),
        sortable: true,
        sortValue: (row: any) => row.normalizedPci ?? null,
      },
      {
        field: "normalizedCog",
        header: "Opportunity Gain",
        width: 160,
        render: (row: any) => (
          <DiamondRow count={getNestedCogRating(row.normalizedCog)} />
        ),
        tooltip: buildDiamondLegend(columnTooltips["Opportunity Gain"]),
        sortable: true,
        sortValue: (row: any) => row.normalizedCog ?? null,
      },
      {
        field: "density",
        header: "Product Feasibility",
        width: 160,
        render: (row: any) => (
          <DiamondRow count={getNestedDensityRating(row.density)} />
        ),
        tooltip: buildDiamondLegend(columnTooltips["Product Feasibility"]),
        sortable: true,
        sortValue: (row: any) => row.density ?? null,
      },
    ],
    [
      isMobile,
      selectedYear,
      getNestedPciRating,
      getNestedCogRating,
      getNestedDensityRating,
      DiamondRow,
      buildAtlasUrl,
      buildDiamondLegend,
    ],
  );

  const computeCompositeScore = useCallback((row: any) => {
    if (typeof row?.pciCogFeasibilityComposite === "number") {
      return row.pciCogFeasibilityComposite as number;
    }
    const parts = [row?.normalizedPci, row?.normalizedCog, row?.density];
    return parts
      .map((v) => (typeof v === "number" ? (v as number) : 0))
      .reduce((s, v) => s + v, 0);
  }, []);

  const getSortValueForField = useCallback(
    (row: any, field: string) => {
      if (field === "defaultComposite") return computeCompositeScore(row);
      const col = (productColumns as any[]).find((c: any) => c.field === field);
      if (!col) return null;
      if (col.sortValue) return col.sortValue(row);
      return (row as any)[field];
    },
    [productColumns, computeCompositeScore],
  );

  const compareRows = useCallback(
    (a: any, b: any) => {
      const va = getSortValueForField(a, orderBy);
      const vb = getSortValueForField(b, orderBy);
      const aNull =
        va === null ||
        va === undefined ||
        (typeof va === "number" && Number.isNaN(va));
      const bNull =
        vb === null ||
        vb === undefined ||
        (typeof vb === "number" && Number.isNaN(vb));
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;
      if (typeof va === "string" || typeof vb === "string") {
        const res = String(va).localeCompare(String(vb));
        return order === "asc" ? res : -res;
      }
      const na = Number(va);
      const nb = Number(vb);
      const res = na < nb ? -1 : na > nb ? 1 : 0;
      return order === "asc" ? res : -res;
    },
    [order, orderBy, getSortValueForField],
  );

  // Calculate header heights for sticky positioning (measure actual header)
  const tableHeadRef = React.useRef<HTMLTableSectionElement | null>(null);
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = React.useState(56);
  const supplyChainHeaderHeight = isMobile ? 40 : 48;
  const clusterHeaderHeight = isMobile ? 36 : 40;

  useEffect(() => {
    if (!tableHeadRef.current) return;
    const target = tableHeadRef.current;
    const update = () => {
      // Sum heights of header rows to get accurate sticky offset
      const rect = target.getBoundingClientRect();
      if (rect && rect.height) setMeasuredHeaderHeight(Math.ceil(rect.height));
    };
    update();
    const ro = new (window as any).ResizeObserver(() => update());
    if (ro) ro.observe(target);
    window.addEventListener("resize", update);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <TableContainer
      component={Paper}
      sx={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        mr: 2,
        mb: 2,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Table stickyHeader size={isMobile ? "small" : "medium"} sx={{ flex: 1 }}>
        <TableHead ref={tableHeadRef}>
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
                  zIndex: 50,
                }}
              >
                {col.sortable ? (
                  col.tooltip ? (
                    <GGTooltip title={col.tooltip} placement="top">
                      <TableSortLabel
                        active={orderBy === col.field}
                        direction={orderBy === col.field ? order : "desc"}
                        onClick={() => handleRequestSort(col.field)}
                      >
                        {col.header}
                      </TableSortLabel>
                    </GGTooltip>
                  ) : (
                    <TableSortLabel
                      active={orderBy === col.field}
                      direction={orderBy === col.field ? order : "desc"}
                      onClick={() => handleRequestSort(col.field)}
                    >
                      {col.header}
                    </TableSortLabel>
                  )
                ) : col.tooltip ? (
                  <GGTooltip title={col.tooltip} placement="top">
                    <span
                      style={{ cursor: "help", textDecoration: "underline" }}
                    >
                      {col.header}
                    </span>
                  </GGTooltip>
                ) : (
                  <span>{col.header}</span>
                )}
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
                  top: measuredHeaderHeight,
                  zIndex: 40,
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
                    position: "sticky",
                    top: measuredHeaderHeight,
                    zIndex: 40,
                    borderBottom: `2px solid ${theme.palette.grey[300]}`,
                    boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
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
                        top: measuredHeaderHeight + supplyChainHeaderHeight,
                        zIndex: 30,
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
                          position: "sticky",
                          top: measuredHeaderHeight + supplyChainHeaderHeight,
                          zIndex: 30,
                          boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
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
                    {cluster.products
                      .slice()
                      .sort(compareRows)
                      .map((product: any, index: number) => (
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
                                pl:
                                  col.field === productColumns[0].field ? 4 : 2,
                                backgroundColor: "inherit",
                              }}
                            >
                              {col.render
                                ? col.render(product)
                                : col.format
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for currently selected data type
  const [currentDataType, setCurrentDataType] =
    useState<DataTableType>(defaultDataType);

  // Always show all products in both flat and nested views

  // Use shared data fetching hook for all data types
  const {
    countryData,
    clustersData,
    productClusterRows,
    isLoading,
    hasErrors,
  } = useGreenGrowthData(selectedCountry, parseInt(selectedYear), false);

  // Get product lookup for all products data (not needed in this scope)

  // Extract product data for compatibility
  const productData = useMemo(() => {
    if (!countryData?.productData) return null;
    return { gpCpyList: countryData.productData };
  }, [countryData]);

  // Synthetic all-products data removed; use only API-provided rows

  // Country metrics view removed

  // Get the appropriate data based on currentDataType (always use all-products where applicable)
  const tableData = useMemo(() => {
    return productData?.gpCpyList || [];
  }, [productData]);

  // Use unified loading and error states
  // Only show loading if we have no data to display at all
  const hasAnyData = (productData?.gpCpyList?.length || 0) > 0;
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
            gap: 3,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Match visualization controls: DisplayAs leftmost */}
          <DisplayAsSwitch />

          {/* Table Type control */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: isMobile ? "0.75rem" : "0.875rem",
                color: "#000",
              }}
            >
              Table Type
            </Typography>
            <ButtonGroup size={isMobile ? "small" : "medium"}>
              <Button
                aria-pressed={currentDataType === "products"}
                onClick={() => setCurrentDataType("products")}
              >
                Product List
              </Button>
              <Button
                aria-pressed={currentDataType === "nested"}
                onClick={() => setCurrentDataType("nested")}
              >
                {isMobile ? "Nested" : "Nested Products"}
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
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
            selectedYear={selectedYear}
          />
        )}
        {currentDataType === "nested" && (
          <NestedProductsTable
            data={tableData}
            selectedProducts={selectedProducts}
            productClusterRows={productClusterRows}
            selectedYear={selectedYear}
            selectedCountry={selectedCountry}
          />
        )}
      </Box>
    </Box>
  );
};

export default DataTable;

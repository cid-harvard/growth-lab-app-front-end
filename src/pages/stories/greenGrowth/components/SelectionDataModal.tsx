import React, { useMemo, useRef, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSelectionDataModal } from "../hooks/useSelectionDataModal";
import { useGreenGrowthData } from "../hooks/useGreenGrowthData";
import { useCountrySelection, useYearSelection } from "../hooks/useUrlParams";
import { useProductLookup } from "../queries/products";
import { columnTooltips } from "./shared/columnTooltips";
import { computeDiamondRatings, DiamondRow } from "./shared/DiamondRating";
import AtlasIcon from "../../../../assets/GL_Atlas_favicon.png";

const formatCurrency = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 1e6 ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(value);
};

const SelectionDataModal: React.FC = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { state, closeSelectionModal } = useSelectionDataModal();

  const selectedCountry = useCountrySelection();
  const selectedYear = useYearSelection();
  const productLookup = useProductLookup();

  // Auto-scroll support for highlighted product rows
  const highlightedRowRef = useRef<HTMLTableRowElement | null>(null);
  useEffect(() => {
    if (state.payload?.type === "product") {
      // Wait for table to render
      const t = setTimeout(() => {
        try {
          highlightedRowRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } catch (_) {}
      }, 60);
      return () => clearTimeout(t);
    }
  }, [state.payload]);

  // Pull all supporting datasets once
  const { countryData, clustersData, productClusterRows } = useGreenGrowthData(
    selectedCountry,
    parseInt(selectedYear),
  );

  const title = useMemo(() => {
    if (!state.payload) return "Details";
    if (state.payload.title) return state.payload.title;
    switch (state.payload.type) {
      case "product":
        return "Product Details";
      case "cluster":
        return "Industrial Cluster";
      case "supplyChain":
        return "Green Value Chain";
      default:
        return "Details";
    }
  }, [state.payload]);

  // Build contextual rows per type; hierarchical nested table similar to DataTable nested mode
  const content = useMemo(() => {
    if (!state.payload) return null;
    const productList: any[] = countryData?.productData || [];
    const productById = new Map<number, any>(
      productList.map((p: any) => [p.productId, p]),
    );

    // Consistent headers with main table
    const baseHeaders = [
      { key: "productCode", label: "HS Code", width: 100 },
      { key: "productName", label: "Product", width: 240 },
      {
        key: "exportRca",
        label: "Export RCA",
        width: 120,
        tooltip: columnTooltips["Export RCA"],
      },
      {
        key: "exportValue",
        label: `Product Export Value (USD, ${selectedYear})`,
        width: 150,
      },
    ];
    const ratingHeaders = [
      {
        key: "normalizedCog",
        label: "Opportunity Gain",
        width: 160,
        tooltip: columnTooltips["Opportunity Gain"],
      },
      {
        key: "normalizedPci",
        label: "Product Complexity",
        width: 160,
        tooltip: columnTooltips["Product Complexity"],
      },
      {
        key: "density",
        label: "Product Feasibility",
        width: 160,
        tooltip: columnTooltips["Product Feasibility"],
      },
    ];
    const headers = [...baseHeaders, ...ratingHeaders];

    // Sticky header heights similar to DataTable
    const mainHeaderHeight = fullScreen ? 48 : 56;
    const supplyChainHeaderHeight = fullScreen ? 40 : 48;
    const clusterHeaderHeight = fullScreen ? 36 : 40;

    const buildAtlasUrl = (productId: number | string | null | undefined) => {
      const pid = String(productId ?? "").replace(/\D/g, "");
      const countryId = String(selectedCountry || "");
      if (!pid || !countryId) return null;
      return `https://atlas.hks.harvard.edu/explore/treemap?exporter=country-${countryId}&view=markets&product=product-HS12-${pid}&productClass=HS12`;
    };

    const renderNested = (rows: any[], forceClusterName?: string) => {
      // Group rows by value chain then cluster; dedupe product ids
      const groups = new Map<string, Map<string, Set<number>>>();
      rows.forEach((r: any) => {
        const scName = r.supply_chain;
        const clName = forceClusterName ?? r.cluster_name;
        if (!groups.has(scName)) groups.set(scName, new Map());
        const clMap = groups.get(scName)!;
        if (!clMap.has(clName)) clMap.set(clName, new Set());
        clMap.get(clName)!.add(r.product_id);
      });

      // Collect values for rating scales from visible products
      const allProducts: any[] = [];
      groups.forEach((clMap) => {
        clMap.forEach((set) =>
          set.forEach((pid) => {
            const p = productById.get(pid);
            if (p) allProducts.push(p);
          }),
        );
      });
      const { getRating: getCog } = computeDiamondRatings(
        allProducts.map((p) => p?.normalizedCog),
      );
      const { getRating: getPci } = computeDiamondRatings(
        allProducts.map((p) => p?.normalizedPci),
      );
      const { getRating: getDen } = computeDiamondRatings(
        allProducts.map((p) => p?.density),
      );

      // Attach scroll ref only to the first matching highlighted row
      let firstHighlightAttached = false;

      const renderProductRow = (
        pid: number,
        idx: number,
        highlightId?: number,
      ) => {
        const p = productById.get(pid) || { productId: pid };
        const meta = productLookup.get(pid);
        const productName = meta?.nameShortEn || p.nameShortEn || "N/A";
        const productCode = meta?.code || p.code || pid;
        const isHighlighted = highlightId != null && pid === highlightId;
        const attachRef = isHighlighted && !firstHighlightAttached;
        if (attachRef) firstHighlightAttached = true;
        const atlasUrl = buildAtlasUrl(pid);
        return (
          <TableRow
            key={`p-${pid}-${idx}`}
            hover
            selected={isHighlighted}
            ref={attachRef ? highlightedRowRef : undefined}
            sx={
              isHighlighted
                ? {
                    backgroundColor: "rgba(38,133,189,0.12)",
                    "& td": { fontWeight: 700 },
                    borderLeft: "3px solid #2685BD",
                  }
                : undefined
            }
          >
            <TableCell
              sx={{ pl: 6, fontWeight: isHighlighted ? 700 : undefined }}
            >
              {String(productCode)}
            </TableCell>
            <TableCell
              sx={{ pl: 6, fontWeight: isHighlighted ? 700 : undefined }}
            >
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
                <span>{productName}</span>
              </Box>
            </TableCell>
            <TableCell>
              {p.exportRca != null ? p.exportRca.toFixed?.(2) : "N/A"}
            </TableCell>
            <TableCell>{formatCurrency(Number(p.exportValue))}</TableCell>
            {/* Diamond ratings consistent with main table */}
            <TableCell>
              <DiamondRow count={getCog(p?.normalizedCog)} size="small" />
            </TableCell>
            <TableCell>
              <DiamondRow count={getPci(p?.normalizedPci)} size="small" />
            </TableCell>
            <TableCell>
              <DiamondRow count={getDen(p?.density)} size="small" />
            </TableCell>
          </TableRow>
        );
      };

      return (
        <Paper
          variant="outlined"
          sx={{
            width: "100%",
            maxHeight: "60vh",
            overflow: "auto",
            position: "relative",
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 4,
                backgroundColor: "white",
                "& .MuiTableCell-root": {
                  backgroundColor: "white",
                  borderBottom: (themeArg) =>
                    `2px solid ${themeArg.palette.grey[300]}`,
                  fontWeight: 700,
                },
              }}
            >
              <TableRow sx={{ height: mainHeaderHeight }}>
                {headers.map((h) => (
                  <TableCell key={h.key} sx={{ minWidth: h.width }}>
                    {h.tooltip ? (
                      <Tooltip title={h.tooltip} placement="top">
                        <span
                          style={{
                            cursor: "help",
                            textDecoration: "underline",
                          }}
                        >
                          {h.label}
                        </span>
                      </Tooltip>
                    ) : (
                      h.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from(groups.entries()).map(([scName, clMap]) => (
                <React.Fragment key={`sc-${scName}`}>
                  <TableRow
                    sx={{
                      backgroundColor: theme.palette.grey[100],
                      position: "sticky",
                      top: mainHeaderHeight,
                      zIndex: 3,
                      height: supplyChainHeaderHeight,
                      boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.08)",
                      "& .MuiTableCell-root": {
                        backgroundColor: theme.palette.grey[100],
                        borderBottom: `2px solid ${theme.palette.grey[300]}`,
                        fontWeight: 700,
                      },
                    }}
                  >
                    <TableCell colSpan={headers.length}>
                      Value Chain: {scName}
                    </TableCell>
                  </TableRow>
                  {Array.from(clMap.entries()).map(([clName, pids]) => (
                    <React.Fragment key={`cl-${scName}-${clName}`}>
                      <TableRow
                        sx={{
                          backgroundColor: theme.palette.grey[50],
                          position: "sticky",
                          top: mainHeaderHeight + supplyChainHeaderHeight,
                          zIndex: 2,
                          height: clusterHeaderHeight,
                          boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.06)",
                          "& .MuiTableCell-root": {
                            backgroundColor: theme.palette.grey[50],
                            borderBottom: `1px solid ${theme.palette.grey[300]}`,
                            fontWeight: 600,
                          },
                        }}
                      >
                        <TableCell colSpan={headers.length} sx={{ pl: 2 }}>
                          Cluster: {clName}
                        </TableCell>
                      </TableRow>
                      {Array.from(pids.values()).map((pid, i) =>
                        renderProductRow(
                          pid,
                          i,
                          state.payload?.type === "product"
                            ? (state.payload.productId as number)
                            : undefined,
                        ),
                      )}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </Paper>
      );
    };
    if (state.payload.type === "product" && state.payload.productId) {
      const pid = state.payload.productId as number;
      const rowsForProduct = (productClusterRows || []).filter(
        (r: any) => r.product_id === pid,
      );
      if (!rowsForProduct.length) {
        return (
          <Typography>
            No hierarchy mapping available for this product.
          </Typography>
        );
      }
      const chains = Array.from(
        new Set(rowsForProduct.map((r: any) => r.supply_chain)),
      );
      const fullRows = (productClusterRows || []).filter((r: any) =>
        chains.includes(r.supply_chain),
      );
      return renderNested(fullRows);
    }

    if (state.payload.type === "cluster" && state.payload.clusterId != null) {
      const clusterId = state.payload.clusterId;
      const name = (() => {
        if (!clustersData?.ggClusterList) return String(clusterId);
        const match = clustersData.ggClusterList.find(
          (c: any) =>
            String(c.clusterId) === String(clusterId) ||
            c.clusterName === clusterId,
        );
        return match?.clusterName || String(clusterId);
      })();
      // Get ALL products belonging to this cluster from taxonomy (productClusterRows)
      const taxonomyRows = (productClusterRows || []).filter((r: any) =>
        name
          ? r.cluster_name === name
          : String(r.cluster_id) === String(clusterId),
      );
      // Build synthetic rows that ensure every product in the cluster appears even if country data missing
      const fullRows = taxonomyRows.map((r: any) => {
        const meta = productLookup.get(r.product_id);
        const country = productById.get(r.product_id);
        return {
          supply_chain: r.supply_chain,
          cluster_name: r.cluster_name,
          product_id: r.product_id,
          // attach country stats if exists; otherwise nulls handled in renderer
          exportRca: country?.exportRca ?? null,
          exportValue: country?.exportValue ?? null,
          expectedExports: country?.expectedExports ?? null,
          normalizedPci: country?.normalizedPci ?? null,
          normalizedCog: country?.normalizedCog ?? null,
          density: country?.density ?? null,
          code: meta?.code,
          nameShortEn: meta?.nameShortEn,
        };
      });
      const valueChains = Array.from(
        new Set(fullRows.map((r: any) => r.supply_chain)),
      ).sort();
      return (
        <Box>
          <Typography sx={{ mb: 2 }}>
            Value Chains: {valueChains.join(", ")}
          </Typography>
          {renderNested(fullRows)}
        </Box>
      );
    }

    if (
      state.payload.type === "supplyChain" &&
      state.payload.supplyChainId != null
    ) {
      const chainName = state.payload.title;
      const filtered = (productClusterRows || []).filter((r: any) =>
        chainName ? r.supply_chain === chainName : true,
      );
      return (
        <Box>
          {chainName && (
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Value Chain: {chainName}
            </Typography>
          )}
          {renderNested(filtered)}
        </Box>
      );
    }
    return null;
  }, [
    state.payload,
    countryData,
    clustersData,
    productClusterRows,
    fullScreen,
    theme,
    productLookup,
    selectedYear,
    selectedCountry,
  ]);

  return (
    <Dialog
      open={state.isOpen}
      onClose={closeSelectionModal}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{ pr: 6 }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={closeSelectionModal}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box>{content}</Box>
      </DialogContent>
    </Dialog>
  );
};

export default SelectionDataModal;

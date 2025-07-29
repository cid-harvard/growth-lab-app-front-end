import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  TextField,
  Box,
  Typography,
  Paper,
  Tooltip as MuiTooltip,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Modal,
  ClickAwayListener,
  IconButton,
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
import { ParentSize } from "@visx/responsive";
import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import TableWrapper from "../shared/TableWrapper";
import { useImageCaptureContext } from "../../hooks/useImageCaptureContext";
import { themeUtils } from "../../theme";
import html2canvas from "html2canvas";

const dimensionObject = {
  "Product Complexity": "normalizedPci",
  "Opportunity Gain": "normalizedCog",
  Feasibility: "density",
  "Market Share Growth": "productMarketShareGrowth",
  "Global Market Share": "globalMarketShare",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={themeUtils.chart.getTooltipSx()}>
        <Typography variant="chart-tooltip-title">{label}</Typography>
        <Typography variant="chart-tooltip-content">
          Score: {payload[0].value}
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
    "Product Complexity":
      "Measures the amount of diversity of knowhow required to make a product.",
    "Opportunity Gain":
      "Measures opportunities for future diversification in entering a product, by opening new links to complex products.",
    Feasibility:
      "Measures the share of capabilities, skills, and know-how present in a location that is necessary to jumpstart a specific activity.",
    "Market Share Growth":
      "Measures the growth rate of a country's market share in this product over time, indicating competitive positioning improvements.",
    "Global Market Share":
      "Measures the country's share of the global market for this specific product, indicating the country's competitive position worldwide.",
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
          style={themeUtils.chart.typography["chart-axis-label"]}
        >
          <tspan x={x} dy="-4px">
            {payload.value}
          </tspan>
        </text>
      </MuiTooltip>
    </g>
  );
};

const NestedProductSelector = ({
  groupedProducts,
  selectedProducts,
  onSelectionChange,
  isMobile,
  firstSelectedCluster, // New prop for the first selected cluster
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClusters, setExpandedClusters] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputRef, setInputRef] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const modalSetupRef = useRef(false);
  const scrollContainerRef = useRef(null);
  const clusterRefs = useRef(new Map());
  const previousFocusedIndex = useRef(-1);

  // Filter groups and products based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedProducts;

    const query = searchQuery.toLowerCase();
    return groupedProducts
      .map((group) => {
        // Filter products based only on product name/code, not cluster name
        const matchingProducts = group.products.filter(
          (product) =>
            product.nameShortEn.toLowerCase().includes(query) ||
            product.code.toLowerCase().includes(query),
        );

        return {
          ...group,
          products: matchingProducts,
        };
      })
      .filter((group) => {
        // Show cluster if:
        // 1. It has matching products, OR
        // 2. The cluster name itself matches the search
        return (
          group.products.length > 0 ||
          group.groupName.toLowerCase().includes(query)
        );
      });
  }, [groupedProducts, searchQuery]);

  // Create flattened list of all selectable items for keyboard navigation
  const selectableItems = useMemo(() => {
    const items = [];
    filteredGroups.forEach((group) => {
      // Add cluster header
      items.push({
        type: "cluster",
        data: group,
        key: `cluster-${group.groupName}`,
      });

      // Add products if cluster is expanded
      if (expandedClusters.has(group.groupName)) {
        group.products.forEach((product) => {
          items.push({
            type: "product",
            data: product,
            group: group,
            key: `product-${product.productId}`,
          });
        });
      }
    });
    return items;
  }, [filteredGroups, expandedClusters]);

  // Set up initial state when modal opens
  useEffect(() => {
    if (isModalOpen && !modalSetupRef.current) {
      modalSetupRef.current = true;

      // Capture the first selected cluster at modal open time (don't update on selection changes)
      const initialFirstSelectedCluster = firstSelectedCluster;

      // Reset search and focus state
      setSearchQuery("");
      // Find the index of the first selected cluster in selectableItems
      let initialFocusIndex = -1;
      if (initialFirstSelectedCluster && selectableItems.length > 0) {
        initialFocusIndex = selectableItems.findIndex(
          (item) =>
            item.type === "cluster" &&
            item.data.groupName === initialFirstSelectedCluster,
        );
      }
      setFocusedIndex(initialFocusIndex >= 0 ? initialFocusIndex : 0);

      // Set expanded clusters based on current selections at modal open time
      if (selectedProducts.length && groupedProducts.length) {
        const selectedProductIds = new Set(
          selectedProducts.map((p) => p.productId),
        );
        const clustersWithSelectedProducts = new Set();

        groupedProducts.forEach((group) => {
          const hasSelectedProducts = group.products.some((product) =>
            selectedProductIds.has(product.productId),
          );
          if (hasSelectedProducts) {
            clustersWithSelectedProducts.add(group.groupName);
          }
        });

        setExpandedClusters(clustersWithSelectedProducts);

        // Scroll to first selected cluster (only on initial modal open)
        if (initialFirstSelectedCluster) {
          setTimeout(() => {
            const clusterElement = clusterRefs.current.get(
              initialFirstSelectedCluster,
            );
            if (clusterElement && scrollContainerRef.current) {
              const containerRect =
                scrollContainerRef.current.getBoundingClientRect();
              const elementRect = clusterElement.getBoundingClientRect();
              const scrollTop = scrollContainerRef.current.scrollTop;
              const targetScrollTop =
                scrollTop + elementRect.top - containerRect.top;

              scrollContainerRef.current.scrollTo({
                top: targetScrollTop,
                behavior: "smooth",
              });
            }
          }, 100);
        }
      } else {
        // No selected products, start with no clusters expanded
        setExpandedClusters(new Set());
      }
    } else if (!isModalOpen) {
      // Reset setup flag when modal closes
      modalSetupRef.current = false;
    }
  }, [isModalOpen]);

  // Preserve focus when selectableItems change (like when making selections)
  useEffect(() => {
    if (isModalOpen && focusedIndex >= 0 && selectableItems.length > 0) {
      const currentFocusedItem = selectableItems[focusedIndex];

      if (!currentFocusedItem) {
        // Current index is out of bounds, clamp it
        setFocusedIndex(Math.min(focusedIndex, selectableItems.length - 1));
      }
    }
  }, [selectableItems, isModalOpen, focusedIndex]);

  // Auto-expand clusters with search results
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setExpandedClusters((prev) => {
        const clustersToExpand = new Set(prev);

        // Check each group to see if it has matching products
        groupedProducts.forEach((group) => {
          const hasMatchingProducts = group.products.some(
            (product) =>
              product.nameShortEn.toLowerCase().includes(query) ||
              product.code.toLowerCase().includes(query),
          );

          // Expand cluster if it has matching products OR if the cluster name matches
          if (
            hasMatchingProducts ||
            group.groupName.toLowerCase().includes(query)
          ) {
            clustersToExpand.add(group.groupName);
          }
        });

        return clustersToExpand;
      });
    }
  }, [searchQuery, groupedProducts]);

  // Reset focused index when search changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery]);

  // Scroll focused item into view - only when focus actually changes
  useEffect(() => {
    // Only scroll if focus index actually changed (not just selectableItems)
    if (
      focusedIndex >= 0 &&
      focusedIndex !== previousFocusedIndex.current &&
      selectableItems.length > 0
    ) {
      const focusedItem = selectableItems[focusedIndex];
      let element = null;

      if (focusedItem?.type === "cluster") {
        element = clusterRefs.current.get(focusedItem.data.groupName);
      } else if (focusedItem?.type === "product") {
        element = clusterRefs.current.get(
          `product-${focusedItem.data.productId}`,
        );
      }

      if (element && scrollContainerRef.current) {
        // Use native scrollIntoView for cleaner, more accessible behavior
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }

    // Update the previous focused index
    previousFocusedIndex.current = focusedIndex;
  }, [focusedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (!isModalOpen) {
      // Open modal on arrow keys or Enter
      if (["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
        event.preventDefault();
        setIsModalOpen(true);
        // Focus on the first selected cluster if available
        let initialFocusIndex = -1;
        if (firstSelectedCluster && selectableItems.length > 0) {
          initialFocusIndex = selectableItems.findIndex(
            (item) =>
              item.type === "cluster" &&
              item.data.groupName === firstSelectedCluster,
          );
        }
        setFocusedIndex(initialFocusIndex >= 0 ? initialFocusIndex : 0);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev < selectableItems.length - 1 ? prev + 1 : prev,
        );
        break;

      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;

      case "Enter":
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < selectableItems.length) {
          const item = selectableItems[focusedIndex];
          if (item.type === "cluster") {
            toggleClusterSelection(item.data, event);
          } else if (item.type === "product") {
            toggleProductSelection(item.data, event);
          }
        }
        break;

      case " ": // Space key
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < selectableItems.length) {
          const item = selectableItems[focusedIndex];
          if (item.type === "cluster") {
            // Space expands/collapses cluster instead of selecting it
            toggleClusterExpansion(item.data.groupName);
          } else if (item.type === "product") {
            toggleProductSelection(item.data, event);
          }
        }
        break;

      case "Escape":
        event.preventDefault();
        setIsModalOpen(false);
        inputRef?.blur();
        break;

      case "Home":
        event.preventDefault();
        setFocusedIndex(0);
        break;

      case "End":
        event.preventDefault();
        setFocusedIndex(selectableItems.length - 1);
        break;

      case "Tab":
        // Allow default tab behavior to close modal
        setIsModalOpen(false);
        break;
    }
  };

  // Get selected product IDs for easy lookup
  const selectedProductIds = useMemo(
    () => new Set(selectedProducts.map((p) => p.productId)),
    [selectedProducts],
  );

  // Check if entire cluster is selected
  const isClusterSelected = (group) => {
    // Find the original unfiltered group to check ALL products, not just filtered ones
    const originalGroup = groupedProducts.find(
      (g) => g.groupName === group.groupName,
    );
    const productsToCheck = originalGroup
      ? originalGroup.products
      : group.products;

    if (productsToCheck.length === 0) return false;
    return productsToCheck.every((product) =>
      selectedProductIds.has(product.productId),
    );
  };

  // Check if cluster is partially selected (some but not all products selected)
  const isClusterPartiallySelected = (group) => {
    // Find the original unfiltered group to check ALL products, not just filtered ones
    const originalGroup = groupedProducts.find(
      (g) => g.groupName === group.groupName,
    );
    const productsToCheck = originalGroup
      ? originalGroup.products
      : group.products;

    if (productsToCheck.length === 0) return false;

    const selectedCount = productsToCheck.filter((product) =>
      selectedProductIds.has(product.productId),
    ).length;

    // Partially selected if some (but not all) products are selected
    return selectedCount > 0 && selectedCount < productsToCheck.length;
  };

  // Toggle cluster expansion
  const toggleClusterExpansion = (groupName) => {
    const newExpanded = new Set(expandedClusters);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedClusters(newExpanded);
  };

  // Toggle entire cluster selection
  const toggleClusterSelection = (group, event) => {
    event.stopPropagation();

    // Find the original unfiltered group to get ALL products, not just filtered ones
    const originalGroup = groupedProducts.find(
      (g) => g.groupName === group.groupName,
    );
    const productsToUse = originalGroup
      ? originalGroup.products
      : group.products;

    const isSelected = isClusterSelected(group);
    let newSelection;

    if (isSelected) {
      // Remove all products from this cluster (using original group's products)
      newSelection = selectedProducts.filter(
        (product) =>
          !productsToUse.some((p) => p.productId === product.productId),
      );
    } else {
      // Add all products from this cluster (using original group's products)
      const clusterProductIds = new Set(productsToUse.map((p) => p.productId));
      const existingOtherProducts = selectedProducts.filter(
        (product) => !clusterProductIds.has(product.productId),
      );
      newSelection = [...existingOtherProducts, ...productsToUse];
    }

    onSelectionChange(newSelection);
  };

  // Toggle individual product selection
  const toggleProductSelection = (product, event) => {
    event.stopPropagation();
    const isSelected = selectedProductIds.has(product.productId);
    let newSelection;

    if (isSelected) {
      newSelection = selectedProducts.filter(
        (p) => p.productId !== product.productId,
      );
    } else {
      newSelection = [...selectedProducts, product];
    }

    onSelectionChange(newSelection);
  };

  // Get input position for modal positioning
  const getModalPosition = () => {
    if (!inputRef) return { top: 100, left: 0, width: 300 };

    const rect = inputRef.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    };
  };

  const modalPosition = getModalPosition();

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        sx={{
          mb: 2,
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        Add a product or cluster to display
      </Typography>

      {/* Search Input */}
      <Box
        sx={{
          position: "relative",
          mb: 2,
          maxWidth: "450px",
        }}
      >
        <TextField
          ref={setInputRef}
          fullWidth
          placeholder="Search a product or cluster"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={() => setIsModalOpen(true)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          size="small"
          role="combobox"
          aria-expanded={isModalOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                border: "1px solid #000",
                borderRadius: "8px",
              },
              "&:hover fieldset": {
                border: "1px solid #333",
              },
              "&.Mui-focused fieldset": {
                border: "1px solid #000",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#000", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Modal Overlay */}
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sx={{
            "& .MuiBackdrop-root": {
              backgroundColor: "transparent",
            },
          }}
        >
          <ClickAwayListener
            onClickAway={(event) => {
              // Don't close if clicking on the input field
              if (inputRef && inputRef.contains(event.target)) {
                return;
              }
              setIsModalOpen(false);
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: modalPosition.top,
                left: modalPosition.left,
                width: modalPosition.width,
                maxWidth: isMobile ? "90vw" : "600px",
                maxHeight: "400px",
                border: "1px solid #000",
                borderRadius: "8px",
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                zIndex: 1300,
                overflow: "hidden",
              }}
            >
              {/* Nested List */}
              <Box
                ref={scrollContainerRef}
                role="listbox"
                aria-multiselectable="true"
                sx={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  p: 1,
                }}
              >
                {filteredGroups.map((group, groupIndex) => {
                  const isExpanded = expandedClusters.has(group.groupName);
                  const clusterSelected = isClusterSelected(group);
                  const clusterPartiallySelected =
                    isClusterPartiallySelected(group);

                  // Find the index of this cluster in selectableItems
                  const clusterItemIndex = selectableItems.findIndex(
                    (item) =>
                      item.type === "cluster" &&
                      item.data.groupName === group.groupName,
                  );
                  const isClusterFocused = focusedIndex === clusterItemIndex;

                  return (
                    <Box key={group.groupName}>
                      {/* Cluster Header */}
                      <Box
                        ref={(el) => {
                          if (el) {
                            clusterRefs.current.set(group.groupName, el);
                          }
                        }}
                        onClick={(e) => toggleClusterSelection(group, e)}
                        role="option"
                        aria-selected={clusterSelected}
                        data-keyboard-focus={`cluster-${group.groupName}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          p: 0,
                          cursor: "pointer",
                          backgroundColor: isClusterFocused
                            ? "#e3f2fd"
                            : clusterSelected
                              ? "#f0f0f0"
                              : clusterPartiallySelected
                                ? "#f8f8f8"
                                : "transparent",
                          "&:hover": {
                            backgroundColor: isClusterFocused
                              ? "#e3f2fd"
                              : "#f8f8f8",
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "14px",
                            color: "#000",
                            fontWeight: clusterSelected
                              ? 600
                              : clusterPartiallySelected
                                ? 500
                                : 400,
                          }}
                        >
                          {group.groupName}
                        </Typography>
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleClusterExpansion(group.groupName);
                          }}
                          sx={{
                            ml: 1,
                            fontSize: "18px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            minWidth: "20px",
                            userSelect: "none",
                          }}
                        >
                          {isExpanded ? "−" : "+"}
                        </Box>
                      </Box>

                      {/* Products */}
                      {isExpanded && (
                        <Box>
                          {group.products.map((product) => {
                            // Find the index of this product in selectableItems
                            const productItemIndex = selectableItems.findIndex(
                              (item) =>
                                item.type === "product" &&
                                item.data.productId === product.productId,
                            );
                            const isProductFocused =
                              focusedIndex === productItemIndex;

                            return (
                              <Box
                                key={product.productId}
                                ref={(el) => {
                                  if (el) {
                                    clusterRefs.current.set(
                                      `product-${product.productId}`,
                                      el,
                                    );
                                  }
                                }}
                                onClick={(e) =>
                                  toggleProductSelection(product, e)
                                }
                                role="option"
                                aria-selected={selectedProductIds.has(
                                  product.productId,
                                )}
                                data-keyboard-focus={`product-${product.productId}`}
                                sx={{
                                  pl: 5,
                                  pr: 2,
                                  py: 0,
                                  cursor: "pointer",
                                  backgroundColor: isProductFocused
                                    ? "#e3f2fd"
                                    : selectedProductIds.has(product.productId)
                                      ? "#f0f0f0"
                                      : "transparent",
                                  "&:hover": {
                                    backgroundColor: isProductFocused
                                      ? "#e3f2fd"
                                      : "#f8f8f8",
                                  },
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                    color: "black",
                                    fontWeight: selectedProductIds.has(
                                      product.productId,
                                    )
                                      ? 600
                                      : 400,
                                  }}
                                >
                                  {product.nameShortEn}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </ClickAwayListener>
        </Modal>
      )}
    </Box>
  );
};

const ProductRadarInternal = ({
  width,
  height,
  selectedProducts,
  setSelectedProducts,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const selectedYear = useYearSelection();
  const selectedCountry = useCountrySelection();
  const productLookup = useProductLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();

  // Image capture functionality
  const chartContainerRef = useRef(null);
  const { registerCaptureFunction, unregisterCaptureFunction } =
    useImageCaptureContext();

  // Use comprehensive shared data fetching hook
  const { clustersData, countryData } = useGreenGrowthData(
    Number.parseInt(selectedCountry),
    Number.parseInt(selectedYear),
  );

  // Get cluster data lookup
  const clusterLookup = useMemo(() => {
    if (!clustersData?.ggClusterList) return new Map();
    return new Map(
      clustersData.ggClusterList.map((cluster) => [
        cluster.clusterId,
        cluster.clusterName,
      ]),
    );
  }, [clustersData]);

  // Group products by clusters
  const groupedProducts = useMemo(() => {
    const products = Array.from(productLookup.values());
    const groups = new Map();

    // Initialize with "No Cluster" group
    groups.set("No Cluster", []);

    // Initialize known clusters
    if (clustersData?.ggClusterList) {
      clustersData.ggClusterList.forEach((cluster) => {
        groups.set(cluster.clusterName, []);
      });
    }

    // Group products by their clusters
    products.forEach((product) => {
      const mappings = supplyChainProductLookup.get(product.productId) || [];

      if (mappings.length === 0) {
        // No cluster mapping found
        groups.get("No Cluster").push(product);
      } else {
        // Add to each cluster the product belongs to
        const clusterIds = new Set(mappings.map((m) => m.clusterId));
        let addedToCluster = false;

        clusterIds.forEach((clusterId) => {
          const clusterName = clusterLookup.get(clusterId);
          if (clusterName && groups.has(clusterName)) {
            groups.get(clusterName).push(product);
            addedToCluster = true;
          }
        });

        // If no valid cluster found, add to "No Cluster"
        if (!addedToCluster) {
          groups.get("No Cluster").push(product);
        }
      }
    });

    // Convert to array format for Autocomplete and filter out empty groups
    return Array.from(groups.entries())
      .filter(([, products]) => products.length > 0)
      .map(([groupName, products]) => ({
        groupName,
        products: products.sort((a, b) =>
          a.nameShortEn.localeCompare(b.nameShortEn),
        ),
      }));
  }, [productLookup, supplyChainProductLookup, clusterLookup, clustersData]);

  // Group selected products by clusters for chart display
  const selectedProductsByCluster = useMemo(() => {
    if (!selectedProducts.length) return [];

    const clusterGroups = new Map();
    const clusterLastAddedIndex = new Map(); // Track when each cluster was last updated

    selectedProducts.forEach((product, index) => {
      const mappings = supplyChainProductLookup.get(product.productId) || [];
      let clusterName = "No Cluster";

      if (mappings.length > 0) {
        const clusterId = mappings[0].clusterId;
        clusterName = clusterLookup.get(clusterId) || "No Cluster";
      }

      if (!clusterGroups.has(clusterName)) {
        clusterGroups.set(clusterName, []);
      }
      clusterGroups.get(clusterName).push(product);

      // Update the last added index for this cluster
      // Use the highest index among products in this cluster
      const currentLastIndex = clusterLastAddedIndex.get(clusterName) || -1;
      clusterLastAddedIndex.set(clusterName, Math.max(currentLastIndex, index));
    });

    // Convert to array and sort by last added index (descending) so newest clusters appear first
    return Array.from(clusterGroups.entries())
      .map(([clusterName, products]) => ({
        clusterName,
        products: products.sort((a, b) =>
          a.nameShortEn.localeCompare(b.nameShortEn),
        ),
        lastAddedIndex: clusterLastAddedIndex.get(clusterName),
      }))
      .sort((a, b) => b.lastAddedIndex - a.lastAddedIndex); // Sort by last added index, newest first
  }, [selectedProducts, supplyChainProductLookup, clusterLookup]);

  // Get the first selected cluster for scroll positioning (based on render order)
  const firstSelectedCluster = useMemo(() => {
    if (selectedProducts.length === 0 || groupedProducts.length === 0)
      return null;

    const selectedProductIds = new Set(
      selectedProducts.map((p) => p.productId),
    );

    // Find the first cluster in render order that has selected products
    for (const group of groupedProducts) {
      const hasSelectedProducts = group.products.some((product) =>
        selectedProductIds.has(product.productId),
      );
      if (hasSelectedProducts) {
        return group.groupName;
      }
    }

    return null;
  }, [selectedProducts, groupedProducts]);

  // Extract country product data from shared hook
  const currentData = useMemo(() => {
    if (!countryData?.productData) return null;
    return { ggCpyList: countryData.productData };
  }, [countryData]);

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
        sustainability: cpyData?.density || 0,
        ...cpyData,
      };
    });
  }, [currentData?.ggCpyList, selectedProducts]);

  // Track the country/year combination that was last used for initialization
  const lastInitialized = useRef({ country: null, year: null });

  // Calculate default products declaratively
  const defaultProducts = useMemo(() => {
    if (
      !countryData?.clusterData ||
      !currentData?.ggCpyList ||
      !supplyChainProductLookup ||
      !productLookup
    ) {
      return [];
    }

    const allClusterData = countryData.clusterData;

    // Filter clusters with RCA < 1 (not currently specialized) - same logic as ProductScatter
    const filteredClusters = allClusterData.filter(
      (item) => Number.parseFloat(item.rca) < 1,
    );

    // Calculate cluster positions (same as ProductScatter cluster mode)
    const clustersWithPositions = filteredClusters.map((clusterItem) => {
      const attractiveness =
        0.6 * Number.parseFloat(clusterItem.cog) +
        0.4 * Number.parseFloat(clusterItem.pci);
      const density = Number.parseFloat(clusterItem.rca);

      return {
        ...clusterItem,
        attractiveness,
        density,
      };
    });

    // Find the range of values to normalize for better "top right" detection
    const attractivenessValues = clustersWithPositions.map(
      (c) => c.attractiveness,
    );
    const densityValues = clustersWithPositions.map((c) => c.density);

    const minAttractiveness = Math.min(...attractivenessValues);
    const maxAttractiveness = Math.max(...attractivenessValues);
    const minDensity = Math.min(...densityValues);
    const maxDensity = Math.max(...densityValues);

    // Normalize values to 0-1 range for fair comparison
    const clustersWithNormalizedScores = clustersWithPositions.map(
      (cluster) => {
        const normalizedAttractiveness =
          attractivenessValues.length > 1
            ? (cluster.attractiveness - minAttractiveness) /
              (maxAttractiveness - minAttractiveness)
            : 0.5;
        const normalizedDensity =
          densityValues.length > 1
            ? (cluster.density - minDensity) / (maxDensity - minDensity)
            : 0.5;

        // Calculate distance from top-right corner (1, 1) - smaller distance means closer to top-right
        const distanceFromTopRight = Math.sqrt(
          Math.pow(1 - normalizedDensity, 2) +
            Math.pow(1 - normalizedAttractiveness, 2),
        );

        // Alternative scoring methods for robust top-right detection:
        // 1. Geometric mean of normalized values (emphasizes balance)
        const geometricMean = Math.sqrt(
          normalizedAttractiveness * normalizedDensity,
        );

        // 2. Minimum of the two dimensions (ensures both are reasonably high)
        const minScore = Math.min(normalizedAttractiveness, normalizedDensity);

        // 3. Weighted product (emphasizes having both dimensions high)
        const productScore = normalizedAttractiveness * normalizedDensity;

        // Use distance-based approach as primary, with geometric mean as tiebreaker
        const topRightScore = 1 - distanceFromTopRight + geometricMean * 0.1;

        return {
          ...cluster,
          normalizedAttractiveness,
          normalizedDensity,
          distanceFromTopRight,
          geometricMean,
          minScore,
          productScore,
          topRightScore,
        };
      },
    );

    // Sort by top-right score (higher is better) and take top 2
    const topClusters = clustersWithNormalizedScores
      .sort((a, b) => {
        // Primary sort by topRightScore
        if (Math.abs(a.topRightScore - b.topRightScore) > 0.01) {
          return b.topRightScore - a.topRightScore;
        }
        // Tiebreaker: prefer higher geometric mean
        return b.geometricMean - a.geometricMean;
      })
      .slice(0, 2);

    // Get all products belonging to the top 2 clusters
    const selectedProductsFromClusters = [];

    // Reverse the order so the best cluster gets added last and appears first in UI
    // (since UI displays newest clusters first)
    topClusters.reverse().forEach((cluster) => {
      // Find products that belong to this cluster
      const clusterProducts = currentData.ggCpyList.filter((productItem) => {
        const mappings =
          supplyChainProductLookup.get(productItem.productId) || [];
        return mappings.some(
          (mapping) => mapping.clusterId === cluster.clusterId,
        );
      });

      // Convert to product objects and add to selection
      clusterProducts.forEach((productItem) => {
        const productDetails = productLookup.get(productItem.productId);
        if (productDetails) {
          selectedProductsFromClusters.push(productDetails);
        }
      });
    });

    return selectedProductsFromClusters;
  }, [
    countryData?.clusterData,
    currentData?.ggCpyList,
    productLookup,
    supplyChainProductLookup,
  ]);

  // Initialize with default products when country/year changes or on first load
  useEffect(() => {
    const currentCountry = selectedCountry;
    const currentYear = selectedYear;
    const hasCountryOrYearChanged =
      lastInitialized.current.country !== currentCountry ||
      lastInitialized.current.year !== currentYear;
    const isFirstLoad =
      lastInitialized.current.country === null &&
      lastInitialized.current.year === null;

    if (
      defaultProducts.length > 0 &&
      (hasCountryOrYearChanged ||
        (isFirstLoad && selectedProducts.length === 0))
    ) {
      lastInitialized.current = { country: currentCountry, year: currentYear };
      setSelectedProducts(defaultProducts);
    }
  }, [
    defaultProducts,
    selectedProducts.length,
    setSelectedProducts,
    selectedCountry,
    selectedYear,
  ]);

  const radarData = useMemo(() => {
    const dimensions = [
      "Product Complexity",
      "Opportunity Gain",
      "Feasibility",
      "Market Share Growth",
      "Global Market Share",
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
      // Special handling for Global Market Share due to small values and many 0s
      if (dimension === "Global Market Share") {
        if (value === 0) return 0;

        // Get all non-zero values for this dimension
        const nonZeroValues = currentData.ggCpyList
          .map((product) => product.globalMarketShare)
          .filter((v) => v != null && v > 0)
          .sort((a, b) => a - b);

        if (nonZeroValues.length === 0) return 0;

        // Use logarithmic percentiles for non-zero values
        const logValues = nonZeroValues.map((v) => Math.log10(v));
        const logValue = Math.log10(value);

        // Find percentile position
        let percentile = 0;
        for (let i = 0; i < logValues.length; i++) {
          if (logValue <= logValues[i]) {
            percentile = i / logValues.length;
            break;
          }
        }
        if (percentile === 0 && logValue > logValues[logValues.length - 1]) {
          percentile = 1;
        }

        // Convert percentile to 1-10 scale (0 is reserved for actual 0 values)
        return Math.max(1, Math.min(10, Math.ceil(percentile * 10)));
      }

      // Standard scaling for other dimensions
      const breakpoints = dimensionBreakpoints[dimension];

      // Find the first breakpoint where value < breakpoint
      const score = breakpoints.findIndex((b) => value < b);

      // If no breakpoint found (value is greater than all breakpoints), return 10
      // If value is less than first breakpoint, return 0
      // Otherwise return the index (1-10)
      if (score === -1) return 10; // Greater than all breakpoints
      if (score === 0) return 0; // Less than first breakpoint
      return score;
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
  const chartHeight = Math.max(availableHeight / chartRows, 300);

  // Register/unregister image capture function
  useEffect(() => {
    const handleCaptureImage = async () => {
      if (!chartContainerRef.current) {
        console.warn("Chart container not found");
        return;
      }

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
            const a = document.createElement("a");
            a.href = url;
            a.download = `product_radar_${selectedCountry}_${selectedYear}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, "image/png");
      } catch (error) {
        console.error("Error capturing image:", error);
      }
    };

    registerCaptureFunction(handleCaptureImage);

    return () => {
      unregisterCaptureFunction();
    };
  }, [
    registerCaptureFunction,
    unregisterCaptureFunction,
    selectedCountry,
    selectedYear,
    width,
    height,
  ]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        padding: `${padding}px`,
        overflow: "auto",
      }}
    >
      {/* Custom Nested Selector */}
      <NestedProductSelector
        groupedProducts={groupedProducts}
        selectedProducts={selectedProducts}
        onSelectionChange={setSelectedProducts}
        isMobile={isMobile}
        firstSelectedCluster={firstSelectedCluster}
      />

      {/* Chart + Legend Container for Image Capture */}
      <Box
        ref={chartContainerRef}
        sx={{
          minHeight: availableHeight - 60,
        }}
      >
        {selectedProductsByCluster.map((cluster, clusterIndex) => (
          <Box key={cluster.clusterName} sx={{ mb: 4 }}>
            {/* Cluster Header */}
            <Box
              sx={{
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
                "&:hover .cluster-remove-btn": {
                  opacity: 1,
                },
              }}
            >
              {/* Cluster Remove Button */}
              <IconButton
                className="cluster-remove-btn"
                size="small"
                onClick={() => {
                  // Remove all products from this cluster
                  const productsToRemove = new Set(
                    cluster.products.map((p) => p.productId),
                  );
                  const newSelection = selectedProducts.filter(
                    (product) => !productsToRemove.has(product.productId),
                  );
                  setSelectedProducts(newSelection);
                }}
                sx={{
                  opacity: 0,
                  transition: "opacity 0.2s ease",
                  flexShrink: 0,
                }}
              >
                <CloseIcon />
              </IconButton>
              <Typography
                variant="h5"
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  fontSize: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  whiteSpace: "nowrap",
                }}
              >
                CLUSTER NAME: {cluster.clusterName}
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "black",
                }}
              />
            </Box>

            {/* Products Grid for this Cluster */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: isMobile ? "center" : "flex-start",
                gap: 1,
                mb: clusterIndex < selectedProductsByCluster.length - 1 ? 4 : 0,
              }}
            >
              {cluster.products.map((product) => {
                const productWithData = productData.find(
                  (p) => p?.productId === product?.productId,
                );
                if (!productWithData) return null;

                return (
                  <Box
                    key={product?.productId}
                    sx={{
                      width: isMobile ? "100%" : `${chartWidth}px`,
                      height: `${chartHeight}px`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                      border: "1px solid transparent",
                      borderRadius: "8px",
                      padding: "8px",
                      transition: "border-color 0.2s ease",
                      "&:hover": {
                        border: "1px dashed black",
                      },
                      "&:hover .product-remove-btn": {
                        opacity: 1,
                      },
                    }}
                  >
                    {/* Product Remove Button */}
                    <IconButton
                      className="product-remove-btn"
                      size="small"
                      onClick={() => {
                        // Remove this specific product
                        const newSelection = selectedProducts.filter(
                          (p) => p.productId !== product.productId,
                        );
                        setSelectedProducts(newSelection);
                      }}
                      sx={{
                        position: "absolute",
                        right: "8px",
                        top: "8px",
                        opacity: 0,
                        transition: "opacity 0.2s ease",
                        zIndex: 10,
                        backgroundColor: "white",
                        "&:hover": {
                          backgroundColor: "rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
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
                        margin={{ left: 0, right: 0, top: 15, bottom: 0 }}
                      >
                        <PolarGrid />
                        <PolarAngleAxis
                          dataKey="dimension"
                          tick={<CustomPolarAngleAxis />}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 10]}
                          tick={{
                            fill: themeUtils.chart.colors.text.primary,
                            fontSize: isMobile ? 8 : 10,
                            fontFamily:
                              themeUtils.chart.typography["chart-axis-tick"]
                                .fontFamily,
                          }}
                          ticks={[0, 2, 4, 6, 8, 10]}
                        />
                        <Radar
                          name={product?.nameEn}
                          dataKey={product?.productId}
                          stroke="#F59280"
                          fill="#F59280"
                          fillOpacity={0.6}
                          dot={{
                            stroke: "rgb(77, 112, 130)",
                            fill: "none",
                            r: 3,
                          }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}

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

const ProductRadar = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <TableWrapper
        defaultDataType="products"
        selectedProducts={selectedProducts}
      >
        <ParentSize>
          {({ width, height }) => {
            if (width === 0 || height === 0) {
              return null;
            }
            return (
              <ProductRadarInternal
                width={width}
                height={height}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
              />
            );
          }}
        </ParentSize>
      </TableWrapper>
    </div>
  );
};

export default ProductRadar;

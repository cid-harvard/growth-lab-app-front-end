import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  TextField,
  Box,
  Typography,
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
import { useSupplyChainLookup } from "../../queries/supplyChains";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import TableWrapper from "../shared/TableWrapper";
import { DisplayAsSwitch } from "../shared";
import { useImageCaptureContext } from "../../hooks/useImageCaptureContext";
import { themeUtils } from "../../theme";
import html2canvas from "html2canvas";
import { getValueChainIcon } from "./ClusterTree/valueChainIconMapping";
import { getValueChainColor } from "../../utils/colors";
import { useSelectionDataModal } from "../../hooks/useSelectionDataModal";
import SharedTooltip from "../shared/SharedTooltip";
import {
  calculateClusterScores,
  calculateAttractiveness,
} from "../../utils/rankings";

const dimensionObject = {
  "Product Complexity": "normalizedPci",
  "Opportunity Gain": "normalizedCog",
  Feasibility: "density",
  // Updated labels and canonical keys
  "Product Market Growth": "product_market_growth",
  "Product Market Size": "market_size",
};

// Always display full axis labels; no short label variant

// Component to display value chain icons for a product
const ValueChainIcons = ({
  product,
  supplyChainProductLookup,
  supplyChainLookup,
  selectedValueChains = [],
  onValueChainClick,
}) => {
  const mappings = supplyChainProductLookup.get(product.productId) || [];

  // Get unique supply chain names for this product
  const supplyChainNames = [
    ...new Set(
      mappings
        .map((mapping) => {
          const supplyChainData = supplyChainLookup.get(mapping.supplyChainId);
          return supplyChainData?.supplyChain;
        })
        .filter(Boolean), // Remove any undefined values
    ),
  ];

  if (supplyChainNames.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0.5,
        mt: 0.5,
        alignItems: "center",
      }}
    >
      {supplyChainNames.map((chainName) => {
        const iconPath = getValueChainIcon(chainName);
        if (!iconPath) return null;

        const isSelected = selectedValueChains.includes(chainName);
        const valueChainColor = getValueChainColor(chainName);

        return (
          <MuiTooltip
            key={chainName}
            title={chainName}
            placement="top"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: "#FFFFFF",
                  color: "#000000",
                  fontSize: { xs: "12px", sm: "14px" },
                  maxWidth: 320,
                  p: 1.5,
                  border: "1px solid #DBDBDB",
                  boxShadow: "0 0 4px 1px rgba(0, 0, 0, 0.10)",
                },
              },
              arrow: {
                sx: { color: "#FFFFFF" },
              },
            }}
          >
            <Box
              component="img"
              src={iconPath}
              alt={chainName}
              onClick={() => onValueChainClick?.(chainName)}
              sx={{
                width: 25,
                height: 25,
                opacity: isSelected ? 1 : 0.7,
                cursor: onValueChainClick ? "pointer" : "default",
                filter: isSelected
                  ? `drop-shadow(0px 0px 1px ${valueChainColor}) drop-shadow(0px 0px 3px ${valueChainColor}) drop-shadow(0px 0px 5px ${valueChainColor})`
                  : "none",
                "&:hover": {
                  opacity: 1,
                  transform: onValueChainClick ? "scale(1.1)" : "none",
                  filter: isSelected
                    ? `drop-shadow(0px 0px 2px ${valueChainColor}) drop-shadow(0px 0px 5px ${valueChainColor}) drop-shadow(0px 0px 8px ${valueChainColor})`
                    : `drop-shadow(0px 0px 2px rgba(0,0,0,0.3))`,
                },
                transition: "all 0.2s ease-in-out",
              }}
            />
          </MuiTooltip>
        );
      })}
    </Box>
  );
};

const CustomTooltip = ({ active, payload, productData, radarData }) => {
  if (!active || !payload || !payload.length || !productData) {
    return null;
  }

  // Find the product data for the current product
  const productId = payload[0]?.dataKey;
  const product = productData.find((p) => p?.productId === productId);

  if (!product) {
    return null;
  }

  // No raw values needed; tooltip shows scaled 0–10 scores

  // Map from dimension label to display label for consistency
  const dimensionLabelMap = {
    normalizedPci: "Product Complexity:",
    normalizedCog: "Opportunity Gain:",
    density: "Feasibility:",
    product_market_growth: "Product Market Growth:",
    market_size: "Product Market Size:",
  };

  // Build rows: show raw values for Product Market Growth and Product Market Size; scaled scores for others
  const rows = (radarData || []).map((entry) => {
    const dimension = entry.dimension;
    const valueKey = dimensionObject[dimension];
    const label = dimensionLabelMap[valueKey] || dimension;

    // Decide value to display
    let displayValue;
    if (dimension === "Product Market Growth") {
      const rawValue = product.worldShareProductRelativepct;
      if (rawValue != null && !Number.isNaN(rawValue)) {
        const absValue = Math.abs(rawValue);
        // For small values (under 1.0), use 2 significant figures
        if (absValue < 1.0 && absValue > 0) {
          displayValue = `${Number(rawValue).toPrecision(2)}%`;
        } else {
          displayValue = `${Number(rawValue).toFixed(2)}%`;
        }
      } else {
        displayValue = "N/A";
      }
    } else if (dimension === "Product Market Size") {
      const rawValue =
        typeof product.worldShareProduct === "number"
          ? product.worldShareProduct
          : null;
      if (rawValue != null && !Number.isNaN(rawValue)) {
        const percentage = Number(rawValue) * 100;
        if (percentage === 0) {
          displayValue = "0%";
        } else if (percentage < 0.01) {
          // For very small values, use more decimal places or scientific notation
          displayValue =
            percentage < 0.001
              ? `${percentage.toExponential(2)}%`
              : `${percentage.toFixed(3)}%`;
        } else if (percentage < 0.1) {
          displayValue = `${percentage.toFixed(3)}%`;
        } else {
          displayValue = `${percentage.toFixed(2)}%`;
        }
      } else {
        displayValue = "N/A";
      }
    } else {
      const score = entry[productId];
      displayValue = score != null ? Number(score).toFixed(0) : "N/A";
    }

    return {
      label,
      value: displayValue,
    };
  });

  // Create tooltip data in SharedTooltip format
  const tooltipData = {
    type: "custom",
    data: {
      title: product.nameShortEn || "Unknown Product",
      rows,
    },
  };

  return <SharedTooltip payload={tooltipData} />;
};

const CustomPolarAngleAxis = ({
  payload,
  x,
  y,
  textAnchor,
  stroke,
  radius,
  fontSize = 14,
}) => {
  const isTopLabel = textAnchor === "middle"; // top tick is centered by Recharts
  const words = String(payload?.value ?? "")
    .split(" ")
    .filter(Boolean);
  const dx = textAnchor === "end" ? -2 : textAnchor === "start" ? 2 : 0;

  return (
    <g className="recharts-layer recharts-polar-angle-axis-tick">
      <text
        radius={radius}
        stroke={stroke}
        x={x + dx}
        y={y}
        className="recharts-text recharts-polar-angle-axis-tick-value"
        textAnchor={textAnchor}
        style={{
          ...themeUtils.chart.typography["chart-axis-label"],
          fontSize: `${fontSize}px`,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {isTopLabel ? (
          <tspan x={x} dy="-4px">
            {payload.value}
          </tspan>
        ) : (
          words.map((w, i) => (
            <tspan
              key={`${w}-${i}`}
              x={x + dx}
              dy={i === 0 ? "-4px" : "1.15em"}
            >
              {w}
            </tspan>
          ))
        )}
      </text>
    </g>
  );
};

const NestedProductSelector = ({
  groupedProducts,
  selectedProducts,
  onSelectionChange,
  isMobile,
  firstSelectedCluster, // New prop for the first selected cluster
  leftControls,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClusters, setExpandedClusters] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputRef, setInputRef] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
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

  // Handle modal opening - setup initial state
  // Using event handler instead of useEffect follows Dan Abramov's "You Might Not Need an Effect"
  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);

    // Reset search state
    setSearchQuery("");

    // Find the index of the first selected cluster in selectableItems
    let initialFocusIndex = -1;
    if (firstSelectedCluster && selectableItems.length > 0) {
      initialFocusIndex = selectableItems.findIndex(
        (item) =>
          item.type === "cluster" &&
          item.data.groupName === firstSelectedCluster,
      );
    }
    setFocusedIndex(initialFocusIndex >= 0 ? initialFocusIndex : 0);

    // Set expanded clusters based on current selections
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

      // Scroll to first selected cluster after render
      if (firstSelectedCluster) {
        setTimeout(() => {
          const clusterElement = clusterRefs.current.get(firstSelectedCluster);
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
  }, [
    firstSelectedCluster,
    selectableItems,
    selectedProducts,
    groupedProducts,
  ]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        handleOpenModal();
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

      default:
        // Ignore other keys
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
      {/* Controls row: Display switch + search */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 3,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        {leftControls}
        <Box
          sx={{
            position: "relative",
            maxWidth: "450px",
            flex: "1 1 360px",
            minWidth: 260,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Typography
            sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem", color: "#000" }}
          >
            Add a product or cluster
          </Typography>
          <TextField
            ref={setInputRef}
            fullWidth
            placeholder="Search a product or cluster"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={handleOpenModal}
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
                maxHeight: "500px",
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
                            fontSize: isMobile ? "0.75rem" : "0.875rem",
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
                            fontSize: "1.125rem",
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
                                    fontSize: isMobile ? "0.75rem" : "0.875rem",
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
  const { openSelectionModal } = useSelectionDataModal();

  const selectedYear = useYearSelection();
  const selectedCountry = useCountrySelection();
  const productLookup = useProductLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();
  const supplyChainLookup = useSupplyChainLookup();

  // Value chain filtering state
  const [selectedValueChains, setSelectedValueChains] = useState([]);

  // Track if initial render has completed to disable animations on reflow
  const [hasRendered, setHasRendered] = useState(false);

  // Handle value chain icon clicks
  const handleValueChainClick = (valueChainName) => {
    setSelectedValueChains((prev) => {
      if (prev.includes(valueChainName)) {
        // Deselect value chain
        return prev.filter((name) => name !== valueChainName);
      } else {
        // Select value chain
        return [...prev, valueChainName];
      }
    });
  };

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
    if (!clustersData?.gpClusterList) return new Map();
    return new Map(
      clustersData.gpClusterList.map((cluster) => [
        cluster.clusterId,
        cluster.clusterName,
      ]),
    );
  }, [clustersData]);

  // Group products by clusters
  const groupedProducts = useMemo(() => {
    // Helper function to check if a product belongs to any selected value chain
    const productMatchesSelectedValueChains = (product) => {
      if (selectedValueChains.length === 0) {
        return true; // Show all if no filter
      }

      const mappings = supplyChainProductLookup.get(product.productId) || [];
      const productValueChains = mappings
        .map((mapping) => {
          const supplyChainData = supplyChainLookup.get(mapping.supplyChainId);
          return supplyChainData?.supplyChain;
        })
        .filter(Boolean);

      return selectedValueChains.some((selectedChain) =>
        productValueChains.includes(selectedChain),
      );
    };

    const products = Array.from(productLookup.values());
    const groups = new Map();

    // Initialize with "No Cluster" group
    groups.set("No Cluster", []);

    // Initialize known clusters
    if (clustersData?.gpClusterList) {
      clustersData.gpClusterList.forEach((cluster) => {
        groups.set(cluster.clusterName, []);
      });
    }

    // Group products by their clusters, filtering by selected value chains
    products.forEach((product) => {
      // Skip products that don't match selected value chains
      if (!productMatchesSelectedValueChains(product)) {
        return;
      }

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
  }, [
    productLookup,
    supplyChainProductLookup,
    clusterLookup,
    clustersData,
    selectedValueChains,
    supplyChainLookup,
  ]);

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

  // Filter radar charts based on selected value chains (hide non-matching but keep products selected)
  const visibleProductsByCluster = useMemo(() => {
    if (selectedValueChains.length === 0) {
      // No value chain filter active, show all selected products
      return selectedProductsByCluster;
    }

    // Filter each cluster to only show products that match selected value chains
    return selectedProductsByCluster
      .map((cluster) => {
        const visibleProducts = cluster.products.filter((product) => {
          const mappings =
            supplyChainProductLookup.get(product.productId) || [];
          const productValueChains = mappings
            .map((mapping) => {
              const supplyChainData = supplyChainLookup.get(
                mapping.supplyChainId,
              );
              return supplyChainData?.supplyChain;
            })
            .filter(Boolean);

          return selectedValueChains.some((selectedChain) =>
            productValueChains.includes(selectedChain),
          );
        });

        return {
          ...cluster,
          products: visibleProducts,
        };
      })
      .filter((cluster) => cluster.products.length > 0); // Remove clusters with no visible products
  }, [
    selectedProductsByCluster,
    selectedValueChains,
    supplyChainProductLookup,
    supplyChainLookup,
  ]);

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
    return { gpCpyList: countryData.productData };
  }, [countryData]);

  const productData = useMemo(() => {
    if (!currentData?.gpCpyList || selectedProducts.length === 0) return [];

    return selectedProducts.map((product) => {
      const cpyData = currentData.gpCpyList.find(
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
  }, [currentData?.gpCpyList, selectedProducts]);

  // Track if we've initialized products for current country/year to avoid re-initializing
  const initKey = `${selectedCountry}-${selectedYear}`;
  const lastInitKey = useRef(null);

  // Calculate default products declaratively (always fresh for current country/year)
  const defaultProducts = useMemo(() => {
    if (
      !countryData?.clusterData ||
      !currentData?.gpCpyList ||
      !supplyChainProductLookup ||
      !productLookup
    ) {
      return [];
    }

    const allClusterData = countryData.clusterData;

    // Filter clusters with RCA < 1 (not currently specialized) - same logic as ProductScatter
    const filteredClusters = allClusterData.filter(
      (item) => Number.parseFloat(item.exportRcaCluster) < 1,
    );

    // Calculate cluster positions (same as ProductScatter cluster mode)
    const clustersWithPositions = filteredClusters.map((clusterItem) => {
      const attractiveness = calculateAttractiveness(
        Number.parseFloat(clusterItem.cog),
        Number.parseFloat(clusterItem.pci),
      );
      const density = Number.parseFloat(clusterItem.density);

      return {
        ...clusterItem,
        attractiveness,
        density,
      };
    });

    // Use shared ranking function to calculate scores and sort
    const clustersWithScores = calculateClusterScores(clustersWithPositions);

    // Take top 2 clusters
    const topClusters = clustersWithScores.slice(0, 2);

    // Get all products belonging to the top 2 clusters
    const selectedProductsFromClusters = [];

    // Reverse the order so the best cluster gets added last and appears first in UI
    // (since UI displays newest clusters first)
    topClusters.reverse().forEach((cluster) => {
      // Find products that belong to this cluster
      const clusterProducts = currentData.gpCpyList.filter((productItem) => {
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
    currentData?.gpCpyList,
    productLookup,
    supplyChainProductLookup,
  ]);

  // Initialize with default products when country/year changes
  // This effect is necessary because:
  // 1. selectedProducts is controlled by parent component
  // 2. defaultProducts depends on async data that may not be ready on mount
  // 3. We need to reset selection when country/year changes
  useEffect(() => {
    const hasKeyChanged = lastInitKey.current !== initKey;

    if (hasKeyChanged && defaultProducts.length > 0) {
      // Reset selections for new country/year and set defaults
      lastInitKey.current = initKey;
      setSelectedProducts(defaultProducts);
      setSelectedValueChains([]);
    }
  }, [initKey, defaultProducts, setSelectedProducts]);

  const radarData = useMemo(() => {
    const dimensions = [
      "Product Complexity",
      "Opportunity Gain",
      "Feasibility",
      "Product Market Growth",
      "Product Market Size",
    ];

    if (productData.length === 0 || !currentData?.gpCpyList) return [];

    const dimensionBreakpoints = dimensions.reduce((acc, dimension) => {
      const valueKey = dimensionObject[dimension];
      const values = currentData.gpCpyList
        .map((product) => {
          if (dimension === "Product Market Growth") {
            let v = product.worldShareProductRelativepct;
            return v;
          }
          if (dimension === "Product Market Size") {
            const v =
              typeof product.worldShareProduct === "number"
                ? product.worldShareProduct
                : null;
            return v;
          }
          return product[valueKey] ?? null;
        })
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
      // Standard scaling for all dimensions using decile breakpoints
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
          let originalValue = 0;
          if (dimension === "Product Market Growth") {
            originalValue = product.worldShareProductRelativepct ?? 0;
          } else if (dimension === "Product Market Size") {
            originalValue =
              typeof product.worldShareProduct === "number"
                ? product.worldShareProduct
                : 0;
          } else {
            originalValue = product[valueKey] ?? 0;
          }
          const scaledValue = scaleValue(originalValue, dimension);
          acc[product?.productId] = scaledValue;
          return acc;
        }, {}),
      };
    });
  }, [productData, currentData?.gpCpyList]);

  // Reset animation state when country or year changes
  useEffect(() => {
    setHasRendered(false);
  }, [selectedCountry, selectedYear]);

  // Disable animations after data has loaded and initial animation completes
  useEffect(() => {
    if (productData.length > 0 && radarData.length > 0 && !hasRendered) {
      const timer = setTimeout(() => {
        setHasRendered(true);
      }, 1000); // Wait for initial animation to complete
      return () => clearTimeout(timer);
    }
  }, [productData.length, radarData.length, hasRendered]);

  // Simplified responsive layout
  const isSingleColumn = isMobile || width < 700;
  const angleAxisFontSize = isMobile ? 11 : 13;

  // Simple margins - let ResponsiveContainer handle most sizing
  const chartMargins = {
    left: isSingleColumn ? 20 : 20,
    right: isSingleColumn ? 50 : 50,
    top: 20,
    bottom: 20,
  };

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
        padding: "0px",
        overflow: "auto",
        overflowX: "hidden", // Prevent horizontal scroll
      }}
    >
      {/* Controls + Nested Selector */}
      <NestedProductSelector
        groupedProducts={groupedProducts}
        selectedProducts={selectedProducts}
        onSelectionChange={setSelectedProducts}
        isMobile={isMobile}
        firstSelectedCluster={firstSelectedCluster}
        leftControls={<DisplayAsSwitch />}
      />

      {/* Chart + Legend Container for Image Capture */}
      <Box
        ref={chartContainerRef}
        sx={{
          minHeight: height - 160,
        }}
      >
        {visibleProductsByCluster.map((cluster, clusterIndex) => (
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
                  fontWeight: 600,
                  fontSize: isMobile ? "1rem" : "1.25rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  whiteSpace: isMobile ? "normal" : "nowrap",
                  wordBreak: isMobile ? "break-word" : "normal",
                }}
              >
                {isMobile
                  ? cluster.clusterName
                  : `CLUSTER NAME: ${cluster.clusterName}`}
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "black",
                }}
              />
            </Box>

            {/* Products Grid for this Cluster - CSS Grid based layout */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: isSingleColumn ? "1fr" : "repeat(2, 1fr)",
                gap: 2,
                mb: clusterIndex < visibleProductsByCluster.length - 1 ? 4 : 0,
                minWidth: 0, // Allow grid to shrink below content size
              }}
            >
              {cluster.products.map((product) => {
                const productWithData = productData.find(
                  (p) => p?.productId === product?.productId,
                );
                if (!productWithData) return null;

                const clusterColor = "#FABEB4"; // Default color

                return (
                  <Box
                    key={product?.productId}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      border: "1px solid transparent",
                      borderRadius: "8px",
                      padding: "8px",
                      transition: "border-color 0.2s ease",
                      minWidth: 0, // Allow grid item to shrink
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

                    {/* Product Title */}
                    <Typography
                      variant="h6"
                      align="center"
                      sx={{
                        color: "black",
                        fontWeight: 600,
                        fontSize: isMobile ? "1rem" : "1.125rem",
                        mb: 1,
                        cursor: "pointer",
                        textDecoration: "underline",
                        flexShrink: 0,
                      }}
                      onClick={() =>
                        openSelectionModal({
                          type: "product",
                          productId: product?.productId,
                          title: product?.nameShortEn,
                          source: "product-radar",
                          detailLevel: "full",
                        })
                      }
                    >
                      {product?.nameShortEn}
                    </Typography>

                    {/* Radar Chart - flexible height with aspect ratio */}
                    <Box
                      sx={{
                        width: "100%",
                        aspectRatio: isSingleColumn ? "1 / 1.1" : "1 / 1",
                        minHeight: "280px",
                        maxHeight: "380px",
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          data={radarData}
                          margin={chartMargins}
                          outerRadius="72%"
                        >
                          <PolarGrid />
                          <PolarAngleAxis
                            dataKey="dimension"
                            tick={
                              <CustomPolarAngleAxis
                                fontSize={angleAxisFontSize}
                              />
                            }
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 10]}
                            tick={{
                              fill: themeUtils.chart.colors.text.primary,
                              fontSize: isMobile ? 9 : 11,
                              fontFamily:
                                themeUtils.chart.typography["chart-axis-tick"]
                                  .fontFamily,
                            }}
                            ticks={[0, 2, 4, 6, 8, 10]}
                          />
                          <Radar
                            name={product?.nameEn}
                            dataKey={product?.productId}
                            stroke={clusterColor}
                            fill={clusterColor}
                            fillOpacity={0.6}
                            dot={{
                              stroke: "rgb(77, 112, 130)",
                              fill: "none",
                              r: 3,
                            }}
                            isAnimationActive={!hasRendered}
                          />
                          <Tooltip
                            position={{ x: 12, y: 12 }}
                            allowEscapeViewBox={{ x: true, y: true }}
                            wrapperStyle={{ pointerEvents: "none" }}
                            content={
                              <CustomTooltip
                                productData={productData}
                                radarData={radarData}
                              />
                            }
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Value Chain Footer */}
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          color: "black",
                        }}
                      >
                        Belongs to Value Chains:
                      </Typography>
                      <ValueChainIcons
                        product={product}
                        supplyChainProductLookup={supplyChainProductLookup}
                        supplyChainLookup={supplyChainLookup}
                        selectedValueChains={selectedValueChains}
                        onValueChainClick={handleValueChainClick}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
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

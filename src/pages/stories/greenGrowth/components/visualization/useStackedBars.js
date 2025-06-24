import { useMemo } from "react";
import { useQuery } from "@apollo/react-hooks";
import { GET_COUNTRY_PRODUCT_DATA } from "../../queries/shared";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import { max, index } from "d3-array";
import { useCallback } from "react";
import { scaleLinear } from "d3-scale";
import { scaleSequential } from "d3-scale";
import { interpolateBlues } from "d3-scale-chromatic";
import { useQuery as useApolloQuery } from "@apollo/client";
import { GET_CLUSTERS } from "../../queries/shared";

const useClusterLookup = () => {
  const { data } = useApolloQuery(GET_CLUSTERS);
  return useMemo(
    () =>
      new Map(
        (data?.ggClusterList || []).map((c) => [c.clusterId, c.clusterName]),
      ),
    [data?.ggClusterList],
  );
};

// RCA-based color function using D3 blues scale
const getBlueColorFromRca = (rca) => {
  const bluesScale = scaleSequential(interpolateBlues);
  // Clamp RCA values to a reasonable range for better color distribution
  const clampedRca = Math.min(Math.max(rca, 0), 3);

  // Map RCA values to different parts of the blues scale for more variety
  // Use a more dramatic range from 0.1 (light) to 0.9 (dark)
  let scalePosition;
  if (clampedRca >= 3.0)
    scalePosition = 0.9; // Very dark blue
  else if (clampedRca >= 2.0)
    scalePosition = 0.75; // Dark blue
  else if (clampedRca >= 1.0)
    scalePosition = 0.6; // Medium-dark blue
  else if (clampedRca >= 0.7)
    scalePosition = 0.45; // Medium blue
  else if (clampedRca >= 0.4)
    scalePosition = 0.3; // Light-medium blue
  else scalePosition = 0.15; // Light blue

  return bluesScale(scalePosition);
};

export const useStackedBars = ({
  year,
  countryId,
  width,
  height,
  legendHeight,
  isMobile,
  groupBy = "clusters", // "clusters" or "value-chains"
  sortBy = "actual", // "actual", "world-average", "missing-link"
  sortDirection = "desc", // "asc" or "desc"
  showAllGroups = false, // show all or limit to top 10
}) => {
  const { loading, error, data, previousData } = useQuery(
    GET_COUNTRY_PRODUCT_DATA,
    {
      variables: {
        year: Number.parseInt(year),
        countryId: Number.parseInt(countryId),
      },
    },
  );
  const currentData = data || previousData;
  const productLookup = useProductLookup();
  const clusterLookup = useClusterLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();
  const supplyChainLookup = useSupplyChainLookup();

  const createLayout = useCallback(
    (ggCpyList) => {
      if (!ggCpyList || !width || !height)
        return { bars: [], expectedOverlays: [], groups: [] };

      // Work with the container height directly - the component handles layout spacing
      const adjustedHeight = height - 60; // Small adjustment for padding and margins

      const margin = {
        top: 40, // More top margin for text clearance
        right: 20,
        bottom: 60, // More bottom margin for show all button
        left: isMobile ? 10 : 60,
      };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = adjustedHeight - margin.top - margin.bottom;
      const barPadding = 30;

      // Create product data map for quick lookup
      const productDataMap = new Map(ggCpyList.map((pd) => [pd.productId, pd]));

      // Process data based on groupBy option
      const processedData = [];

      if (groupBy === "clusters") {
        // Group by manufacturing clusters
        const clusterToProducts = new Map();

        // Group products by cluster using mappings
        for (const product of ggCpyList) {
          const supplyChains =
            supplyChainProductLookup.get(product.productId) || [];
          const clusterIds = new Set(
            supplyChains.map((sc) => sc.clusterId).filter((id) => id != null),
          );

          for (const clusterId of clusterIds) {
            if (!clusterToProducts.has(clusterId)) {
              clusterToProducts.set(clusterId, []);
            }
            clusterToProducts.get(clusterId).push(product);
          }
        }

        for (const [clusterId, products] of clusterToProducts) {
          const clusterName = clusterLookup.get(clusterId);
          if (!clusterName) continue;

          let totalActual = 0;
          let totalExpected = 0;
          const segments = [];

          // Create segments for each product in the cluster
          products.forEach((product) => {
            const productDetails = productLookup.get(product.productId);
            const exportValue = Number.parseFloat(product.exportValue) || 0;
            const expectedExports =
              Number.parseFloat(product.expectedExports) || 0;
            const exportRca = Number.parseFloat(product.exportRca) || 0;

            if (exportValue > 0 && productDetails) {
              totalActual += exportValue;
              totalExpected += expectedExports;

              segments.push({
                id: productDetails.code,
                productId: product.productId,
                productName: productDetails.nameShortEn,
                exportValue: exportValue,
                expectedExports: expectedExports,
                exportRca: exportRca,
                logtfExportValue:
                  Number.parseFloat(product.logtfExportValue) || 0,
                logtfExpectedExports:
                  Number.parseFloat(product.logtfExpectedExports) || 0,
                color: getBlueColorFromRca(exportRca),
                title: `${clusterName}-${productDetails.nameShortEn}`,
              });
            }
          });

          if (segments.length > 0) {
            // Calculate world average (using expected exports as proxy)
            const worldAverage = totalExpected * 0.8; // Simplified calculation

            processedData.push({
              groupId: clusterId,
              groupName: clusterName,
              actualProduction: totalActual,
              expectedProduction: totalExpected,
              worldAverage,
              segments: segments.sort((a, b) => b.exportValue - a.exportValue),
              parentId: clusterId, // For consistency with existing structure
            });
          }
        }
      } else {
        // Group by value chains (supply chains)
        const supplyChainToProducts = new Map();

        // Group products by supply chain using mappings
        for (const product of ggCpyList) {
          const supplyChains =
            supplyChainProductLookup.get(product.productId) || [];
          const supplyChainIds = new Set(
            supplyChains
              .map((sc) => sc.supplyChainId)
              .filter((id) => id != null),
          );

          for (const supplyChainId of supplyChainIds) {
            if (!supplyChainToProducts.has(supplyChainId)) {
              supplyChainToProducts.set(supplyChainId, []);
            }
            supplyChainToProducts.get(supplyChainId).push(product);
          }
        }

        for (const [supplyChainId, products] of supplyChainToProducts) {
          const supplyChainName =
            supplyChainLookup.get(supplyChainId)?.supplyChain;
          if (!supplyChainName) continue;

          let totalActual = 0;
          let totalExpected = 0;
          const segments = [];

          // Create segments for each product in the supply chain
          products.forEach((product) => {
            const productDetails = productLookup.get(product.productId);
            const exportValue = Number.parseFloat(product.exportValue) || 0;
            const expectedExports =
              Number.parseFloat(product.expectedExports) || 0;
            const exportRca = Number.parseFloat(product.exportRca) || 0;

            if (exportValue > 0 && productDetails) {
              totalActual += exportValue;
              totalExpected += expectedExports;

              segments.push({
                id: productDetails.code,
                productId: product.productId,
                productName: productDetails.nameShortEn,
                exportValue: exportValue,
                expectedExports: expectedExports,
                exportRca: exportRca,
                logtfExportValue:
                  Number.parseFloat(product.logtfExportValue) || 0,
                logtfExpectedExports:
                  Number.parseFloat(product.logtfExpectedExports) || 0,
                color: getBlueColorFromRca(exportRca),
                title: `${supplyChainName}-${productDetails.nameShortEn}`,
              });
            }
          });

          if (segments.length > 0) {
            // Calculate world average (using expected exports as proxy)
            const worldAverage = totalExpected * 0.8; // Simplified calculation

            processedData.push({
              groupId: supplyChainId,
              groupName: supplyChainName,
              actualProduction: totalActual,
              expectedProduction: totalExpected,
              worldAverage,
              segments: segments.sort((a, b) => b.exportValue - a.exportValue),
              parentId: supplyChainId, // For consistency with existing structure
            });
          }
        }
      }

      // Sort based on selected option and direction
      const sortedData = processedData.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "actual":
            comparison = b.actualProduction - a.actualProduction;
            break;
          case "world-average":
            comparison = b.worldAverage - a.worldAverage;
            break;
          case "missing-link":
            comparison =
              b.worldAverage -
              b.actualProduction -
              (a.worldAverage - a.actualProduction);
            break;
          default:
            comparison = 0;
        }

        // Apply sort direction
        return sortDirection === "desc" ? comparison : -comparison;
      });

      // Limit to top 10 unless "Show All" is enabled
      const limitedData = showAllGroups ? sortedData : sortedData.slice(0, 10);

      const barHeight =
        (chartHeight - (limitedData.length - 1) * barPadding) /
        limitedData.length;

      const maxTotalValue = max(limitedData, (group) => {
        return Math.max(group.actualProduction, group.worldAverage);
      });

      const xScale = scaleLinear()
        .domain([0, maxTotalValue])
        .range([0, chartWidth]);

      const result = [];
      const expectedPositions = [];

      limitedData.forEach((group, groupIndex) => {
        let cumulativeWidth = 0;

        for (const segment of group.segments) {
          const x = margin.left + xScale(cumulativeWidth);
          const segmentWidth = xScale(segment.exportValue);
          const y = margin.top + groupIndex * (barHeight + barPadding);

          result.push({
            id: `${segment.id}-${group.parentId}`,
            parentId: group.parentId,
            coords: [
              [x, y],
              [x + segmentWidth, y],
              [x + segmentWidth, y + barHeight],
              [x, y + barHeight],
            ],
            exportValue: segment.exportValue,
            expectedExports: segment.expectedExports,
            exportRca: segment.exportRca,
            logtfExportValue: segment.logtfExportValue,
            logtfExpectedExports: segment.logtfExpectedExports,
            title: segment.title,
            value: segment.exportValue,
            parent: {
              clusterId: group.groupId,
              clusterName: group.groupName,
            },
            data: {
              product: {
                code: segment.id,
                nameShortEn: segment.productName,
              },
            },
            fill: segment.color,
            strokeWidth: 1,
          });

          cumulativeWidth += segment.exportValue;
        }

        // World Average line position
        const x = margin.left + xScale(group.worldAverage);
        const y = margin.top + groupIndex * (barHeight + barPadding);

        expectedPositions.push({
          parentId: group.parentId,
          name: group.groupName,
          coords: [
            [x, y],
            [x, y + barHeight],
          ],
          expectedTotal: group.worldAverage,
          actualTotal: group.actualProduction,
          strokeWidth: 1,
        });
      });

      const bars = index(
        result.filter(
          (d) =>
            !d?.coords?.flat()?.flat()?.includes(Number.NaN) &&
            !d.id.includes("undefined"),
        ),
        (d) => d.id,
      );

      return {
        bars: bars,
        expectedOverlays: expectedPositions,
        groups: limitedData,
      };
    },
    [
      productLookup,
      supplyChainProductLookup,
      clusterLookup,
      supplyChainLookup,
      width,
      height,
      legendHeight,
      isMobile,
      groupBy,
      sortBy,
      sortDirection,
      showAllGroups,
    ],
  );

  const layout = useMemo(
    () => createLayout(currentData?.ggCpyList),
    [currentData, createLayout],
  );

  return { loading, error, ...layout };
};

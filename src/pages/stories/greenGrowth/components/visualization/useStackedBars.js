import { useMemo } from "react";
import { useQuery } from "@apollo/react-hooks";
import { GG_CPY_LIST_QUERY } from "../../queries/cpy";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import { max, index } from "d3-array";
import { useCallback } from "react";
import { colorScale } from "../../utils";
import { scaleLinear } from "d3-scale";
import { useQuery as useApolloQuery, gql } from "@apollo/client";

const CLUSTERS_QUERY = gql`
  query Clusters {
    ggClusterList {
      clusterId
      clusterName
    }
  }
`;

const useClusterLookup = () => {
  const { data } = useApolloQuery(CLUSTERS_QUERY);
  return useMemo(
    () =>
      new Map(
        (data?.ggClusterList || []).map((c) => [c.clusterId, c.clusterName]),
      ),
    [data?.ggClusterList],
  );
};

export const useStackedBars = ({
  year,
  countryId,
  width,
  height,
  legendHeight,
  isMobile,
}) => {
  const { loading, error, data, previousData } = useQuery(GG_CPY_LIST_QUERY, {
    variables: {
      year: Number.parseInt(year),
      countryId: Number.parseInt(countryId),
    },
  });
  const currentData = data || previousData;
  const productLookup = useProductLookup();
  const clusterLookup = useClusterLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();

  const createLayout = useCallback(
    (ggCpyList) => {
      if (!ggCpyList || !width || !height)
        return { bars: [], expectedOverlays: [] };

      const margin = {
        top: 40 + legendHeight,
        right: 20,
        bottom: 40,
        left: isMobile ? 10 : 60,
      };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom - 100;
      const barPadding = 30;

      const clusterArray = ggCpyList.reduce((arr, product) => {
        const productDetails = productLookup.get(product.productId);
        const supplyChains =
          supplyChainProductLookup.get(product.productId) || [];
        const clusters = new Set(
          supplyChains.map((sc) => sc.clusterId).filter((id) => id != null),
        );
        if (clusters.size === 0) return arr;
        for (const clusterId of clusters) {
          arr.push({
            id: productDetails?.code,
            parentId: clusterId,
            exportValue: Number.parseFloat(product.exportValue) || 0,
            expectedExports: Number.parseFloat(product.expectedExports) || 0,
            logtfExportValue: Number.parseFloat(product.logtfExportValue) || 0,
            logtfExpectedExports:
              Number.parseFloat(product.logtfExpectedExports) || 0,
            title: `${clusterLookup.get(clusterId) || clusterId}-${productDetails?.nameShortEn}`,
            value: Number.parseFloat(product.exportValue) || 0,
            parent: { clusterId, clusterName: clusterLookup.get(clusterId) },
          });
        }
        return arr;
      }, []);

      const groupedData = clusterArray.reduce((acc, item) => {
        if (!acc[item.parentId]) {
          acc[item.parentId] = [];
        }
        acc[item.parentId].push(item);
        return acc;
      }, {});

      const sortedParents = Object.keys(groupedData)
        .map((parentId) => ({
          parentId: Number.parseInt(parentId),
          totalExports: groupedData[parentId].reduce(
            (sum, child) => sum + child.exportValue,
            0,
          ),
        }))
        .sort((a, b) => b.totalExports - a.totalExports)
        .slice(0, 10)
        .map((item) => item.parentId);

      const barHeight =
        (chartHeight - (sortedParents.length - 1) * barPadding) /
        sortedParents.length;

      const expectedTotals = sortedParents.reduce((acc, parentId) => {
        acc[parentId] = {
          absolute: groupedData[parentId].reduce(
            (sum, child) => sum + child.expectedExports,
            0,
          ),
        };
        return acc;
      }, {});

      const maxTotalValue = max(sortedParents, (parentId) => {
        const actualTotal = groupedData[parentId].reduce(
          (sum, child) => sum + child.exportValue,
          0,
        );
        const expectedTotal = groupedData[parentId].reduce(
          (sum, child) => sum + child.expectedExports,
          0,
        );
        return Math.max(actualTotal, expectedTotal);
      });

      const xScale = scaleLinear()
        .domain([0, maxTotalValue])
        .range([0, chartWidth]);

      const result = [];
      const expectedPositions = [];

      sortedParents.forEach((parentId, parentIndex) => {
        const children = groupedData[parentId];
        let cumulativeWidth = 0;

        for (const item of children) {
          const x = margin.left + xScale(cumulativeWidth);
          const itemWidth = xScale(item.exportValue);
          const y = margin.top + parentIndex * (barHeight + barPadding);

          result.push({
            id: `${item.id}-${item.parentId}`,
            parentId: item.parentId,
            coords: [
              [x, y],
              [x + itemWidth, y],
              [x + itemWidth, y + barHeight],
              [x, y + barHeight],
            ],
            exportValue: item.exportValue,
            expectedExports: item.expectedExports,
            logtfExportValue: item.logtfExportValue,
            logtfExpectedExports: item.logtfExpectedExports,
            title: item.title,
            value: item.value,
            parent: item.parent,
            data: {
              product: { code: item.id, nameShortEn: item.title },
            },
            fill: colorScale(item.parentId),
            strokeWidth: 1,
          });

          cumulativeWidth += item.exportValue;
        }

        const x = margin.left + xScale(expectedTotals[parentId].absolute);
        const y = margin.top + parentIndex * (barHeight + barPadding);

        expectedPositions.push({
          parentId: parentId,
          name: clusterLookup.get(Number.parseInt(parentId)) || parentId,
          coords: [
            [x, y],
            [x, y + barHeight],
          ],
          expectedTotal: expectedTotals[parentId].absolute,
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
        bars,
        expectedOverlays: expectedPositions,
      };
    },
    [
      productLookup,
      supplyChainProductLookup,
      clusterLookup,
      width,
      height,
      legendHeight,
      isMobile,
    ],
  );

  const layout = useMemo(
    () => createLayout(currentData?.ggCpyList),
    [currentData, createLayout],
  );

  return { loading, error, ...layout };
};

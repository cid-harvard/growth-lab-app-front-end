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

export const useStackedBars = ({ year, countryId, width, height }) => {
  const { loading, error, data, previousData } = useQuery(GG_CPY_LIST_QUERY, {
    variables: { year: parseInt(year), countryId: parseInt(countryId) },
  });
  const currentData = data || previousData;
  const productLookup = useProductLookup();
  const supplyChainLookup = useSupplyChainLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();

  const createLayout = useCallback(
    (ggCpyList) => {
      if (!ggCpyList || !width || !height)
        return { bars: [], expectedOverlays: [] };

      const margin = { top: 40, right: 20, bottom: 40, left: 60 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom - 100;
      const barPadding = 30;

      const sectorArray = ggCpyList.reduce((arr, product) => {
        const productDetails = productLookup.get(product.productId);
        const supplyChains =
          supplyChainProductLookup.get(product.productId) || [];

        supplyChains.forEach((sc) => {
          const supplyChainId = sc.supplyChainId;
          const supplyChainDetails = supplyChainLookup.get(supplyChainId);
          const supplyChainName = supplyChainDetails
            ? supplyChainDetails.supplyChain
            : supplyChainId;

          arr.push({
            id: productDetails?.code,
            parentId: supplyChainDetails.supplyChainId,
            exportValue: parseFloat(product.exportValue) || 0,
            expectedExports: parseFloat(product.expectedExports) || 0,
            logtfExportValue: parseFloat(product.logtfExportValue) || 0,
            logtfExpectedExports: parseFloat(product.logtfExpectedExports) || 0,
            title: `${supplyChainName}-${productDetails?.nameShortEn}`,
            value: parseFloat(product.exportValue) || 0,
            parent: supplyChainDetails,
          });
        });
        return arr;
      }, []);

      const groupedData = sectorArray.reduce((acc, item) => {
        if (!acc[item.parentId]) {
          acc[item.parentId] = [];
        }
        acc[item.parentId].push(item);
        return acc;
      }, {});

      Object.keys(groupedData).forEach((parentId) => {
        groupedData[parentId].sort((a, b) => b.exportValue - a.exportValue);
      });

      const sortedParents = Object.keys(groupedData)
        .map((parentId) => ({
          parentId: parseInt(parentId),
          totalExports: groupedData[parentId].reduce(
            (sum, child) => sum + child.exportValue,
            0,
          ),
        }))
        .sort((a, b) => b.totalExports - a.totalExports)
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

      let result = [];
      let expectedPositions = [];

      sortedParents.forEach((parentId, parentIndex) => {
        const children = groupedData[parentId];
        let cumulativeWidth = 0;

        children.forEach((item) => {
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
        });

        const x = margin.left + xScale(expectedTotals[parentId].absolute);
        const y = margin.top + parentIndex * (barHeight + barPadding);

        expectedPositions.push({
          parentId: parentId,
          name: groupedData[parentId][0].parent.supplyChain,
          coords: [
            [x, y],
            [x, y + barHeight],
          ],
          expectedTotal: expectedTotals[parentId].absolute,
          logtfExpectedTotal: expectedTotals[parentId].log,
          strokeWidth: 1,
        });
      });
      const bars = index(
        result.filter(
          (d) =>
            !d.coords.flat().flat().includes(NaN) &&
            !d.id.includes("undefined"),
        ),
        (d) => d.id,
      );
      return {
        bars,
        expectedOverlays: expectedPositions,
      };
    },
    [productLookup, supplyChainProductLookup, supplyChainLookup, width, height],
  );

  const layout = useMemo(
    () => createLayout(currentData?.ggCpyList),
    [currentData, createLayout],
  );

  return { loading, error, ...layout };
};

import { selectorFamily } from "recoil";
import hs4Selector from "./hs92-4";
import expectedActualProductSelector from "./expectedActualProduct";
import { max } from "d3-array";
import { sortByStringId } from "../utils";

export const stackedBarChartSelector = selectorFamily({
  key: "stackedBarChartSelector",
  get:
    ({ width, height, countrySelection, yearSelection }) =>
    ({ get }) => {
      if (!width || !height) return [];

      const margin = { top: 40, right: 20, bottom: 40, left: 60 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom - 100;
      const barPadding = 20;

      const data = get(hs4Selector);
      const { dataLookup } = get(expectedActualProductSelector);
      if (!data) return [];

      const sectorArray = data?.values().reduce((arr, datum) => {
        datum.topic.forEach((topic) => {
          const productData = dataLookup
            .get(countrySelection)
            ?.get(yearSelection)
            ?.get(datum.Id[0])?.[0];
          const exportValue = productData
            ? parseFloat(productData?.export_value)
            : 0;
          const expectedExports = productData
            ? parseFloat(productData?.expected_exports)
            : 0;
          if (
            datum.hsCode !== "2701" &&
            datum.hsCode !== "7108" &&
            datum.hsCode !== "7106"
          ) {
            arr.push({
              id: datum.hsCode,
              parentId: topic,
              exportValue: exportValue,
              expectedExports: expectedExports,
              title: datum.Id[0],
              value: exportValue,
            });
          }
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

      const sortedParents = Object.keys(groupedData).sort();
      const barHeight =
        (chartHeight - (sortedParents.length - 1) * barPadding) /
        sortedParents.length;

      const expectedTotals = sortedParents.reduce((acc, parentId) => {
        acc[parentId] = groupedData[parentId].reduce(
          (sum, child) => sum + child.expectedExports,
          0,
        );
        return acc;
      }, {});

      const maxTotalValue = max(sortedParents, (parentId) =>
        Math.max(
          groupedData[parentId].reduce(
            (sum, child) => sum + child.exportValue,
            0,
          ),
          expectedTotals[parentId],
        ),
      );

      let result = [];
      let expectedPositions = [];

      sortedParents.forEach((parentId, parentIndex) => {
        const children = groupedData[parentId];
        let cumulativeWidth = 0;

        children.forEach((item) => {
          const itemWidth = (item.exportValue / maxTotalValue) * chartWidth;
          const y = margin.top + parentIndex * (barHeight + barPadding);
          const x = margin.left + cumulativeWidth;

          result.push({
            id: item.id,
            parentId: item.parentId,
            coords: [
              [x, y],
              [x + itemWidth, y],
              [x + itemWidth, y + barHeight],
              [x, y + barHeight],
            ],
            exportValue: item.exportValue,
            expectedExports: item.expectedExports,
            title: item.title,
            value: item.value,
          });

          cumulativeWidth += itemWidth;
        });

        const expectedWidth =
          (expectedTotals[parentId] / maxTotalValue) * chartWidth;
        const y = margin.top + parentIndex * (barHeight + barPadding);
        const x = margin.left + expectedWidth;

        expectedPositions.push({
          parentId: parentId,
          coords: [
            [x, y],
            [x, y + barHeight],
          ],
          expectedTotal: expectedTotals[parentId],
        });
      });

      return {
        bars: result
          .sort(sortByStringId)
          .map((d, i) => ({ ...d, i }))
          .filter((d) => !d.coords.flat().flat().includes(NaN)),
        expectedOverlays: expectedPositions,
      };
    },
});

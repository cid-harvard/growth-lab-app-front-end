import { useMemo, useCallback } from "react";
import "./scrollyCanvas.css";
import { useQuery } from "@apollo/react-hooks";
import { GET_COUNTRY_PRODUCT_DATA } from "../../queries/shared";
import { pack, hierarchy } from "d3-hierarchy";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import { colorScale } from "../../utils";
import { index } from "d3";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const getRCAOpacity = (rca) => {
  if (rca >= 1) return 1;
  if (rca > 0.2) return 0.6;
  return 0.15;
};

const BUBBLE_SIZES = {
  TINY: 0.3,
  SMALL: 0.6,
  MEDIUM: 0.9,
  LARGE: 1.1,
  HUGE: 1.4,
};

const getDiscreteRanking = (ranking, minRank, maxRank) => {
  const percentile = (ranking - minRank) / (maxRank - minRank);
  if (percentile <= 0.2) return BUBBLE_SIZES.TINY;
  if (percentile <= 0.4) return BUBBLE_SIZES.SMALL;
  if (percentile <= 0.6) return BUBBLE_SIZES.MEDIUM;
  if (percentile <= 0.8) return BUBBLE_SIZES.LARGE;
  return BUBBLE_SIZES.HUGE;
};

const SUPPLY_CHAIN_LAYOUT_WIDE = {
  ROW_1: [3, 5, 4, 9, 8], // EVs, Heat Pumps, Fuel Cells, Wind, Solar
  ROW_2: [6, 7, 0, 2, 1], // Hydro, Nuclear, Batteries, Grid, Minerals
};

const SUPPLY_CHAIN_LAYOUT_TALL = {
  ROW_1: [3, 5], // EVs, Heat Pumps
  ROW_2: [4, 9], // Fuel Cells, Wind
  ROW_3: [8, 6], // Solar, Hydro
  ROW_4: [7, 0], // Nuclear, Batteries
  ROW_5: [2, 1], // Grid, Minerals
};

export const useSupplyChainBubbles = ({
  year,
  countryId,
  width,
  height,
  fill,
  stroke = null,
}) => {
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up("sm"));

  const { loading, error, data, previousData } = useQuery(
    GET_COUNTRY_PRODUCT_DATA,
    {
      variables: { year: parseInt(year), countryId: parseInt(countryId) },
    },
  );
  const currentData = data || previousData;
  const productLookup = useProductLookup();
  const supplyChainLookup = useSupplyChainLookup();

  const createLayout = useCallback(
    (ggCpyList, ggCpyscList) => {
      if (!ggCpyList || !ggCpyscList || !width || !height)
        return { childBubbles: [], parentCircles: [] };

      const SUPPLY_CHAIN_LAYOUT = isWide
        ? SUPPLY_CHAIN_LAYOUT_WIDE
        : SUPPLY_CHAIN_LAYOUT_TALL;
      const numRows = isWide ? 2 : 5;

      const margin = isWide ? 60 : 10;
      const padding = 0;
      const groupSpacing = isWide ? 40 : 6;
      const rowSpacing = isWide ? 60 : 7;

      const legendOffset = isWide ? 0 : 50; // Reduced from 80 to prevent overflow
      const topMargin = isWide ? margin : 20 + legendOffset;
      const bottomMargin = isWide ? margin : 20; // Reduced from 40 to prevent overflow

      const availableHeight = isWide
        ? height - margin * 1.2 - rowSpacing * numRows
        : height - topMargin - bottomMargin - rowSpacing * (numRows - 1);
      const rowHeights = Array(numRows).fill(availableHeight / numRows);

      const supplyChainMap = new Map();
      ggCpyscList.forEach((item) => {
        const { supplyChainId, productId, productRanking } = item;
        if (!supplyChainMap.has(supplyChainId)) {
          supplyChainMap.set(supplyChainId, new Map());
        }
        supplyChainMap.get(supplyChainId).set(productId, productRanking);
      });

      supplyChainMap.forEach((products, supplyChainId) => {
        const rankings = Array.from(products.values());
        const minRank = Math.min(...rankings);
        const maxRank = Math.max(...rankings);
        products.forEach((ranking, productId) => {
          const discreteRanking =
            maxRank === minRank
              ? BUBBLE_SIZES.MEDIUM
              : getDiscreteRanking(ranking, minRank, maxRank);
          products.set(productId, discreteRanking);
        });
      });

      const hierarchyData = {
        id: "root",
        children: Array.from(supplyChainMap.entries()).map(
          ([supplyChainId, products]) => {
            const supplyChainDetails = supplyChainLookup.get(supplyChainId);
            return {
              id: supplyChainId,
              name: supplyChainDetails
                ? supplyChainDetails.supplyChain
                : supplyChainId,
              children: ggCpyList
                .filter((product) => products.has(product.productId))
                .map((product) => {
                  const productDetails = productLookup.get(product.productId);
                  return {
                    id: product.code,
                    parentId: supplyChainId,
                    scaledRanking: products.get(product.productId),
                    ...product,
                    product: productDetails,
                  };
                }),
            };
          },
        ),
      };

      const sectorTree = hierarchy(hierarchyData)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value);

      const packedSectorTree = pack().size([width, height]).padding(padding)(
        sectorTree,
      );

      const groups = packedSectorTree.children || [];

      const maxBubblesPerGroup = Math.max(
        ...groups.map((g) => g.children?.length || 0),
      );

      const parentCircles = [];
      const childBubbles = [];

      groups.forEach((group) => {
        const supplyChainId = group.data.id;
        let row, col, totalColsInRow;

        for (let i = 1; i <= numRows; i++) {
          const rowKey = `ROW_${i}`;
          const rowArray = SUPPLY_CHAIN_LAYOUT[rowKey];
          const colIndex = rowArray?.indexOf(supplyChainId);
          if (colIndex !== -1) {
            row = i - 1;
            col = colIndex;
            totalColsInRow = rowArray.length;
            break;
          }
        }

        if (row === undefined) return;

        const rowHeight = rowHeights[row];
        const cellWidth = isWide
          ? (width - margin * 2 - groupSpacing * (totalColsInRow - 1)) /
            totalColsInRow
          : (width - margin * 2 - groupSpacing) / 2;

        const rowY = isWide
          ? margin +
            rowHeights.slice(0, row).reduce((a, b) => a + b, 0) +
            row * rowSpacing
          : topMargin +
            rowHeights.slice(0, row).reduce((a, b) => a + b, 0) +
            row * rowSpacing;

        const groupX =
          margin + (cellWidth + groupSpacing) * col + cellWidth / 2;
        const groupY = rowY + rowHeight / 2;

        const groupPack = pack()
          .size([
            cellWidth * (isWide ? 0.9 : 0.85),
            rowHeight * (isWide ? 0.9 : 0.25),
          ])
          .padding(isWide ? 2 : 1)
          .radius((d) => {
            const baseRadius =
              Math.min(cellWidth, rowHeight) /
              (isWide ? 2 : 3) /
              Math.sqrt(maxBubblesPerGroup);
            return baseRadius * d.data.data.scaledRanking * (isWide ? 1 : 1);
          });

        const packedGroup = groupPack(hierarchy(group).sum((d) => d.value));

        const parentRadius = Math.max(
          ...packedGroup.children.map(
            (child) =>
              Math.sqrt(
                Math.pow(child.x - packedGroup.x, 2) +
                  Math.pow(child.y - packedGroup.y, 2),
              ) + child.r,
          ),
        );

        parentCircles.push({
          id: group.data.id,
          name: group.data.name,
          x: groupX,
          y: groupY,
          radius: parentRadius,
        });

        packedGroup.children.forEach((leaf) => {
          const x = groupX + (leaf.x - packedGroup.x);
          const y = groupY + (leaf.y - packedGroup.y);

          childBubbles.push({
            parentId: group.data.id,
            radius: leaf.r,
            ...leaf.data,
            x,
            y,
            r: leaf.r,
          });
        });
      });

      const bubblesArray = childBubbles.map((d, i) => ({
        ...d,
        i,
        title: d?.data?.product?.nameShortEn,
        opacity: fill === "rca" ? getRCAOpacity(d.data.exportRca) : 1,
        stroke: "white",
        strokeWidth: 0,
        strokeOpacity: 0,
        rca: d.data.exportRca,
        fill: colorScale(d.parentId),
        id: `${d?.data?.product?.code}-${d?.parent?.data?.id}`,
        scaledRanking: d.data.scaledRanking,
      }));

      const bubbles = index(
        bubblesArray.filter((d) => d && !d?.id?.includes("undefined")),
        (d) => d.id,
      );

      return {
        childBubbles: bubbles,
        parentCircles,
      };
    },
    [width, height, isWide, supplyChainLookup, productLookup, fill],
  );

  const layout = useMemo(
    () => createLayout(currentData?.ggCpyList, currentData?.ggCpyscList),
    [currentData, createLayout],
  );

  return { loading, error, ...layout };
};

import { useMemo, useCallback } from "react";
import "./scrollyCanvas.css";
import { useQuery } from "@apollo/react-hooks";
import { GG_CPY_LIST_QUERY } from "../../queries/cpy";
import { pack, hierarchy } from "d3-hierarchy";
import { toCircle } from "flubber";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import { colorScale } from "../../utils";
import { index } from "d3";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const circlePath = (x, y, r) => `
  M ${x},${y}
  m -${r},0
  a ${r},${r} 0 1,0 ${2 * r},0
  a ${r},${r} 0 1,0 -${2 * r},0
  z
`;

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
  stroke,
}) => {
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up("sm"));

  const { loading, error, data, previousData } = useQuery(GG_CPY_LIST_QUERY, {
    variables: { year: parseInt(year), countryId: parseInt(countryId) },
  });
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

      const margin = isWide ? 100 : 100;
      const padding = 0;
      const groupSpacing = isWide ? 40 : 0;
      const rowSpacing = isWide ? 80 : 45;

      const availableHeight = height - margin * 1.5 - rowSpacing * numRows;
      const rowHeights = Array(numRows).fill(availableHeight / numRows);

      const supplyChainMap = new Map();
      ggCpyscList.forEach((item) => {
        const { supplyChainId, productId, productRanking } = item;
        if (!supplyChainMap.has(supplyChainId)) {
          supplyChainMap.set(supplyChainId, new Map());
        }
        supplyChainMap.get(supplyChainId).set(productId, productRanking);
      });
      const criticalMinerals = Array.from(supplyChainMap.get(1).keys());

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
        const cellWidth =
          (width - margin * 2 - groupSpacing * (totalColsInRow - 1)) /
          totalColsInRow;

        const rowY =
          margin +
          rowHeights.slice(0, row).reduce((a, b) => a + b, 0) +
          row * rowSpacing;

        const groupX =
          margin + (cellWidth + groupSpacing) * col + cellWidth / 2;
        const groupY = rowY + rowHeight / 2;

        const groupPack = pack()
          .size([cellWidth * 0.9, rowHeight * 0.9])
          .padding(2)
          .radius((d) => {
            const baseRadius =
              Math.min(cellWidth, rowHeight) /
              (2 * Math.sqrt(maxBubblesPerGroup));
            return baseRadius * d.data.data.scaledRanking;
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
          const radius = leaf.r;

          childBubbles.push({
            id: `${leaf.data.data.id}-${leaf.parent.id}`,
            parentId: group.data.id,
            coords: toCircle(
              circlePath(
                groupX + leaf.x - packedGroup.x,
                groupY + leaf.y - packedGroup.y,
                leaf.r,
              ),
              groupX + leaf.x - packedGroup.x,
              groupY + leaf.y - packedGroup.y,
              leaf.r,
            )(1),
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
        stroke:
          stroke === "minerals" && criticalMinerals.includes(d.data.productId)
            ? "black"
            : "white",
        strokeWidth:
          stroke === "minerals" && criticalMinerals.includes(d.data.productId)
            ? 1
            : 0,
        strokeOpacity:
          stroke === "minerals" && criticalMinerals.includes(d.data.productId)
            ? 1
            : 0,
        type: "circle",
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
    [width, height, isWide, supplyChainLookup, productLookup, fill, stroke],
  );

  const layout = useMemo(
    () => createLayout(currentData?.ggCpyList, currentData?.ggCpyscList),
    [currentData, createLayout],
  );

  return { loading, error, ...layout };
};

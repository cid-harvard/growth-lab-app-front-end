import { useMemo, useCallback } from "react";
import "./scrollyCanvas.css";
import { useQuery } from "@apollo/react-hooks";
import { GG_CPY_LIST_QUERY } from "../../queries/cpy";
import { pack, hierarchy } from "d3-hierarchy";
import { toCircle } from "flubber";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import { colorScale } from "../../utils";
import { index } from "d3";

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

export const useSupplyChainBubbles = ({
  year,
  countryId,
  width,
  height,
  fill,
  stroke,
}) => {
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
        return { childBubbles: [], parentCircles: [] };

      const margin = 60;
      const padding = 50;
      const groupSpacing = 40;

      // Create a map of supply chains
      const supplyChainMap = new Map();
      ggCpyList.forEach((product) => {
        const productDetails = productLookup.get(product.productId);
        const supplyChains =
          supplyChainProductLookup.get(product.productId) || [];

        supplyChains.forEach((sc) => {
          const supplyChainId = sc.supplyChainId;
          const supplyChainDetails = supplyChainLookup.get(supplyChainId);
          const supplyChainName = supplyChainDetails
            ? supplyChainDetails.supplyChain
            : supplyChainId;

          if (!supplyChainMap.has(supplyChainId)) {
            supplyChainMap.set(supplyChainId, {
              id: supplyChainId,
              name: supplyChainName,
              children: [],
            });
          }

          supplyChainMap.get(supplyChainId).children.push({
            id: product.code,
            parentId: supplyChainId,
            value: 1,
            ...product,
            product: productDetails,
          });
        });
      });

      const hierarchyData = {
        id: "root",
        children: Array.from(supplyChainMap.values()),
      };

      const sectorTree = hierarchy(hierarchyData)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value);

      const packedSectorTree = pack().size([width, height]).padding(padding)(
        sectorTree,
      );

      const groups = packedSectorTree.children || [];

      // Update grid layout for 10 categories
      let gridCols, gridRows;
      if (width > height) {
        gridCols = 5;
        gridRows = 2;
      } else {
        gridCols = 2;
        gridRows = 5;
      }

      const cellWidth =
        (width - margin * 2 - groupSpacing * (gridCols - 1)) / gridCols;
      const cellHeight =
        (height - margin * 2 - groupSpacing * (gridRows - 1)) / gridRows;

      const maxBubblesPerGroup = Math.max(
        ...groups.map((g) => g.children.length),
      );

      const parentCircles = [];
      const childBubbles = [];

      groups.forEach((group, groupIndex) => {
        const col = groupIndex % gridCols;
        const row = Math.floor(groupIndex / gridCols);

        const groupX =
          margin + (cellWidth + groupSpacing) * col + cellWidth / 2;
        const groupY =
          margin + (cellHeight + groupSpacing) * row + cellHeight / 2;

        const groupPack = pack()
          .size([cellWidth * 0.9, cellHeight * 0.9])
          .padding(3)
          .radius((d) => {
            const hash = d.data.data.id
              .split("")
              .reduce(
                (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc),
                0,
              );
            const normalizedValue = (Math.abs(hash) % 3) + 1;
            return (
              (normalizedValue * Math.min(cellWidth, cellHeight)) /
              (2 * Math.sqrt(maxBubblesPerGroup) * 3)
            );
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
          });
        });
      });

      const bubblesArray = childBubbles.map((d, i) => ({
        ...d,
        i,
        title: d?.data?.product?.nameShortEn,
        opacity: fill === "rca" ? getRCAOpacity(d.data.exportRca) : 1,
        stroke:
          stroke === "minerals" && d.data.sector === "71" ? "black" : "white",
        strokeWidth: stroke === "minerals" && d.sector === "71" ? 1 : 0,
        strokeOpacity: stroke === "minerals" && d.sector === "71" ? 1 : 0,
        type: "circle",
        rca: d.data.exportRca,
        fill: colorScale(d.parentId),
        id: `${d?.data?.product?.code}-${d?.parent?.data?.id}`,
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
    [
      productLookup,
      supplyChainProductLookup,
      supplyChainLookup,
      width,
      height,
      fill,
      stroke,
    ],
  );

  const layout = useMemo(
    () => createLayout(currentData?.ggCpyList),
    [currentData, createLayout],
  );

  return { loading, error, ...layout };
};

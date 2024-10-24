import { stratify, pack, hierarchy } from "d3-hierarchy";
import { toCircle } from "flubber";
import { selectorFamily } from "recoil";
import hs4Selector from "./hs92-4";
import { sortByStringId } from "../utils";
import { productScatterplotSelector } from "./productScatterplot";

const circlePath = (x, y, r) => `
  M ${x},${y}
  m -${r},0
  a ${r},${r} 0 1,0 ${2 * r},0
  a ${r},${r} 0 1,0 -${2 * r},0
  z
`;

const getRCAOpacity = (rca) => {
  if (rca > 0.5) {
    return 1;
  } else if (rca > 0.1) {
    return 0.75;
  } else if (rca > 0.01) {
    return 0.5;
  } else {
    return 0.4;
  }
};

export const supplyChainBubblesSelector = selectorFamily({
  key: "supplyChainBubblesSelector",
  get:
    ({ width, height, countrySelection, yearSelection, fill, stroke }) =>
    ({ get }) => {
      const { dataLookup } = get(productScatterplotSelector);
      const margin = 80;
      const padding = 10;
      const groupSpacing = 40;

      if (!width || !height) return [];
      const data = get(hs4Selector);
      const sectorArray = data.values().reduce((arr, datum) => {
        datum.topic.forEach((topic) => {
          arr.push({ id: datum.hsCode, parentId: topic, value: 1 });
        });
        return arr;
      }, []);
      const parents = Array.from(
        new Set(sectorArray.map((d) => d.parentId)),
      ).map((d) => ({ id: d, parentId: "root" }));
      parents.push({ id: "root", parentId: null });
      const sectorTree = stratify()
        .id((d) => d.id)
        .parentId((d) => d.parentId)([...parents, ...sectorArray])
        .sum((d) => d.value);

      const packedSectorTree = pack().size([width, height]).padding(padding)(
        sectorTree,
      );

      const groups = packedSectorTree.children;

      let gridCols, gridRows;
      if (width < height) {
        gridCols = Math.floor(Math.sqrt(groups.length * 0.8));
        gridRows = Math.ceil((groups.length / gridCols) * 0.8);
      } else {
        gridRows = Math.floor(Math.sqrt(groups.length * 0.8));
        gridCols = Math.ceil((groups.length / gridRows) * 0.8);
      }

      const cellWidth =
        (width - margin * 2 - groupSpacing * (gridCols - 1)) / gridCols;
      const cellHeight =
        (height - margin * 2 - groupSpacing * (gridRows - 1)) / gridRows;

      const maxBubblesPerGroup = Math.max(
        ...groups.map((g) => g.children.length),
      );

      const parentCircles = new Map();

      const criticalMetalsMineralsHsCodes = new Set(
        sectorArray
          .filter((item) => item.parentId === "Critical Metals and Minerals")
          .map((item) => item.id),
      );

      const result = {
        childBubbles: groups
          .flatMap((group, groupIndex) => {
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
                // Use a hash function to generate a consistent value based on the item's id
                const hash = d.data.id.split("").reduce((acc, char) => {
                  return char.charCodeAt(0) + ((acc << 5) - acc);
                }, 0);
                // Normalize the hash value to a range between 1 and 3
                const normalizedValue = (Math.abs(hash) % 3) + 1;
                return (
                  (normalizedValue * Math.min(cellWidth, cellHeight)) /
                  (2 * Math.sqrt(maxBubblesPerGroup) * 3)
                );
              });

            const packedGroup = groupPack(hierarchy(group).sum(() => 1));

            const parentRadius = Math.max(
              ...packedGroup.children.map(
                (child) =>
                  Math.sqrt(
                    Math.pow(child.x - packedGroup.x, 2) +
                      Math.pow(child.y - packedGroup.y, 2),
                  ) + child.r,
              ),
            );

            if (!parentCircles.has(group.data.id)) {
              parentCircles.set(group.data.id, {
                id: group.data.id,
                x: groupX,
                y: groupY,
                radius: parentRadius,
              });
            }

            return packedGroup.children.map((leaf) => ({
              id: leaf.data.data.id,
              parentId: leaf.data.data.parentId,
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
            }));
          })
          .sort(sortByStringId)
          .map((d, i) => {
            const [datum] =
              dataLookup
                ?.get(countrySelection)
                ?.get(yearSelection)
                ?.get(d.id + "") || [];
            const showStroke =
              stroke === "minerals" && criticalMetalsMineralsHsCodes.has(d.id);
            return {
              ...d,
              i,
              title: datum?.product_name || d.id,
              ...datum,
              opacity: fill === "rca" ? getRCAOpacity(datum?.rca) || 0.3 : 1,
              stroke: showStroke ? "black" : "white",
              strokeWidth: showStroke ? 1 : 0,
              strokeOpacity: showStroke ? 1 : 0,
            };
          }),
        parentCircles: Array.from(parentCircles.values()),
      };

      return result;
    },
});

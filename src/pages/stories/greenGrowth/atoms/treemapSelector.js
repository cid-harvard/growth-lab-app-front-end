import { selectorFamily } from "recoil";
import hs4Selector from "./hs92-4";
import { stratify, treemap, treemapResquarify } from "d3-hierarchy";
import { sortByStringId } from "../utils";

export const treemapSelector = selectorFamily({
  key: "treemapSelector",
  get:
    ({ width, height }) =>
    ({ get }) => {
      if (!width || !height) return [];

      const data = get(hs4Selector);
      const sectorArray = data.values().reduce((arr, datum) => {
        datum.topic.map((topic) => {
          arr.push({ id: datum.hsCode, parentId: topic, value: Math.random() });
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

      const treemapLayout = treemap()
        .size([width, height])
        .padding(1)
        .round(true)
        .tile(treemapResquarify);

      treemapLayout(sectorTree);

      return sectorTree
        .leaves()
        .map((d, i) => ({
          id: d.id,
          parentId: d.data.parentId,
          coords: [
            [d.x0, d.y0],
            [d.x1, d.y0],
            [d.x1, d.y1],
            [d.x0, d.y1],
          ],
          i,
        }))
        .sort(sortByStringId);
    },
});

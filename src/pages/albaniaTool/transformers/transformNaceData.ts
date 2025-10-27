import { TreeNode } from "react-dropdown-tree-select";
import { NACEIndustry, NACELevel } from "../graphql/graphQLTypes";

const transformNaceData = (rawNaceData: NACEIndustry[]): TreeNode[] => {
  const transformedData: TreeNode[] = [];
  rawNaceData.forEach((rawDatum) => {
    if (rawDatum && rawDatum.name && rawDatum.naceId) {
      if (rawDatum.level === NACELevel.section) {
        transformedData.push({
          label: rawDatum.name,
          value: rawDatum.naceId,
          className: "no-select-parent",
          disabled: true,
          children: [],
        });
      } else if (rawDatum.level === NACELevel.division) {
        const parentIndex = transformedData.findIndex(
          ({ value }) => value === rawDatum.parentId + "",
        );
        if (parentIndex !== -1) {
          transformedData[parentIndex].children.push({
            label: rawDatum.name,
            value: rawDatum.naceId,
            className: "no-select-parent",
            disabled: true,
            children: [],
          });
        }
      } else if (rawDatum.level === NACELevel.group) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transformedData.forEach((item: any) => {
          const { children } = item;
          const parentIndex = children.findIndex(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ({ value }: { value: any }) => value === rawDatum.parentId + "",
          );
          if (parentIndex !== -1) {
            children[parentIndex].children.push({
              label: rawDatum.name,
              value: rawDatum.naceId,
              disabled: false,
            });
          }
        });
      }
    }
  });
  return transformedData;
};

export default transformNaceData;

import { TreeNode } from 'react-dropdown-tree-select';
import { NACEIndustryEdge, NACELevel } from '../../graphql/graphQLTypes';

export interface RawNaceDatum {
  Level: string;
  Code: string;
  Parent: string;
  Description: string;
}

const transformNaceData = (rawNaceData: (NACEIndustryEdge | null)[]): TreeNode[] => {
  const transformedData: TreeNode[] = [];
  rawNaceData.forEach((rawDatum) => {
    const node = rawDatum && rawDatum.node ? rawDatum.node : null;
    if (node && node.name && node.naceId) {
      if (node.level === NACELevel.section) {
        transformedData.push({
          label: node.name,
          value: node.naceId,
          className: 'no-select-parent',
          disabled: true,
          children: [],
        });
      } else if (node.level === NACELevel.division) {
        const parentIndex = transformedData.findIndex(({value}) => value === node.parentId);
        if (parentIndex !== -1) {
          transformedData[parentIndex].children.push({
            label: node.name,
            value: node.naceId,
            className: 'no-select-parent',
            disabled: true,
            children: [],
          });
        }
      } else if (node.level === NACELevel.group) {
        transformedData.forEach(({children}: TreeNode & {children: TreeNode[]}) => {
          const parentIndex = children.findIndex(({value}) => value === node.parentId);
          if (parentIndex !== -1) {
            children[parentIndex].children.push({
              label: node.name,
              value: node.naceId,
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

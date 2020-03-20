import { TreeNode } from 'react-dropdown-tree-select';

export interface RawNaceDatum {
  Level: string;
  Code: string;
  Parent: string;
  Description: string;
}

const transformNaceData = (rawNaceData: RawNaceDatum[]): TreeNode[] => {
  const transformedData: TreeNode[] = [];
  rawNaceData.forEach(rawDatum => {
    if (rawDatum.Level === '1') {
      transformedData.push({
        label: rawDatum.Description,
        value: rawDatum.Code,
        className: 'no-select-parent',
        disabled: true,
        children: [],
      });
    } else if (rawDatum.Level === '2') {
      const parentIndex = transformedData.findIndex(({value}) => value === rawDatum.Parent);
      if (parentIndex !== -1) {
        transformedData[parentIndex].children.push({
          label: rawDatum.Description,
          value: rawDatum.Code,
          className: 'no-select-parent',
          disabled: true,
          children: [],
        });
      }
    } else if (rawDatum.Level === '3') {
      transformedData.forEach(({children}: TreeNode & {children: TreeNode[]}) => {
        const parentIndex = children.findIndex(({value}) => value === rawDatum.Parent);
        if (parentIndex !== -1) {
          children[parentIndex].children.push({
            label: rawDatum.Description,
            value: rawDatum.Code,
            disabled: false,
          });
        }
      });
    }
  });
  return transformedData;
};

export default transformNaceData;

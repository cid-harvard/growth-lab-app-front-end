import raw from 'raw.macro';
import { TreeNode } from 'react-dropdown-tree-select';

export const testSearchBarData: TreeNode[] = [
  {
    label: 'Agriculture',
    value: 'A',
    className: 'no-select-parent',
    disabled: true,
    children: [
      {
        label: 'Corn',
        value: 'A1',
        disabled: false,
      },
      {
        label: 'Potatoes',
        value: 'A2',
        disabled: false,
      },
      {
        label: 'Lettuce',
        value: 'A3',
        disabled: false,
      },
    ],
  },
  {
    label: 'Technology',
    value: 'B',
    className: 'no-select-parent',
    disabled: true,
    children: [
      {
        label: 'Computers',
        value: 'B1',
        disabled: false,
      },
      {
        label: 'Cars',
        value: 'B2',
        disabled: false,
      },
      {
        label: 'Phones',
        value: 'B3',
        disabled: false,
      },
    ],
  },
  {
    label: 'Minerals',
    value: 'C',
    className: 'no-select-parent',
    disabled: true,
    children: [
      {
        label: 'Gold',
        value: 'C1',
        disabled: false,
      },
      {
        label: 'Diamonds',
        value: 'C2',
        disabled: false,
      },
      {
        label: 'Coal',
        value: 'C3',
        disabled: false,
      },
    ],
  },
  {
    label: 'Services',
    value: 'D',
    className: 'no-select-parent',
    disabled: true,
    children: [
      {
        label: 'Tourism',
        value: 'D1',
        disabled: false,
      },
      {
        label: 'Consulting',
        value: 'D2',
        disabled: false,
      },
      {
        label: 'Other',
        value: 'D3',
        disabled: false,
      },
    ],
  },
];

interface RawNaceDatum {
  Level: string;
  Code: string;
  Parent: string;
  Description: string;
}

const rawNaceData: RawNaceDatum[] = JSON.parse(raw('./nace-industries.json'));

const transformNaceData = (): TreeNode[] => {
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

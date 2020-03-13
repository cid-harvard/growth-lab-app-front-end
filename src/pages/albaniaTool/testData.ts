import { Datum as ScatterPlotDatum } from '../../components/dataViz/scatterPlot';
import { Datum as BarChartDatum } from '../../components/dataViz/barChart';
import { Datum as RadarChartDatum } from '../../components/dataViz/radarChart';
import { TreeNode } from 'react-dropdown-tree-select';
import { lightBorderColor } from '../../styling/styleUtils';

export const colorScheme = {
  primary: '#F1A189',
  secondary: '#F8CCBF',
  tertiary: '#FCEEEB',
  quaternary: '#D75037',
};

export const testCountryListData: TreeNode[] = [
  {
    label: 'Europe',
    value: 'Europe',
  },
  {
    label: 'Asia',
    value: 'Asia',
  },
  {
    label: 'North America',
    value: 'North America',
  },
];
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

export const scatterPlotData: ScatterPlotDatum[] = [
  {
    label: 'Boston',
    x: 7,
    y: 4,
    tooltipContent: 'Tooltip Content',
    fill: 'red',
  },
  {
    label: 'Cambridge',
    x: 5,
    y: 8,
    tooltipContent: 'Tooltip Content about Cambridge MA where we work right now test long content length',
    radius: 10,
  },
  {
    label: 'Somerville',
    x: 2,
    y: 11,
    tooltipContent: 'Tooltip Content',
    fill: 'blue',
    radius: 5,
  },
  {
    label: 'Acton',
    x: 6,
    y: 3,
    tooltipContent: 'Tooltip Content',
  },
  {
    label: 'Stow',
    x: 10,
    y: 4,
    tooltipContent: 'Tooltip Content',
    radius: 6,
  },
];

export const spiderPlotTestData2: RadarChartDatum[][] = [
  [
    {label: 'Value 1', value: 70},
    {label: 'Value 2', value: 40},
    {label: 'Value 3', value: 50},
    {label: 'Value 4', value: 90},
    {label: 'Value 5', value: 20},
  ],
];

export const spiderPlotTestData3: RadarChartDatum[][] = [
  [
    {label: 'Value 1', value: 67},
    {label: 'Value 2', value: 13},
    {label: 'Value 3', value: 89},
    {label: 'Value 4', value: 78},
    {label: 'Value 5', value: 91},
  ],
];

export const barChartData: BarChartDatum[] = [
  {
    x: 'Boston',
    y: 4,
    tooltipContent: 'Tooltip Content',
    fill: lightBorderColor,
  },
  {
    x: 'Cambridge',
    y: 8,
    tooltipContent: 'Tooltip Content about Cambridge MA where we work right now test long content length',
    fill: lightBorderColor,
  },
  {
    x: 'Somerville',
    y: 11,
    tooltipContent: 'Tooltip Content',
    fill: lightBorderColor,
  },
  {
    x: 'Acton',
    y: 3,
    tooltipContent: 'Tooltip Content',
    fill: lightBorderColor,
  },
  {
    x: 'Stow',
    y: 4,
    fill: lightBorderColor,
  },
];

export const barChartOverlayData: BarChartDatum[] = [
  {
    x: 'Boston',
    y: 2,
    tooltipContent: 'Tooltip Content',
    fill: colorScheme.primary,
  },
  {
    x: 'Cambridge',
    y: 4,
    tooltipContent: 'Tooltip Content about Cambridge MA where we work right now test long content length',
    fill: colorScheme.primary,
  },
  {
    x: 'Somerville',
    y: 7,
    tooltipContent: 'Tooltip Content',
    fill: colorScheme.primary,
  },
  {
    x: 'Acton',
    y: 1,
    tooltipContent: 'Tooltip Content',
    fill: colorScheme.primary,
  },
  {
    x: 'Stow',
    y: 3,
    fill: colorScheme.primary,
  },
];

export const getBarChartOverlayData: (id: string) => BarChartDatum[] = (id) => {
  if (id === 'Europe') {
    return barChartOverlayData;
  } else if (id === 'Asia') {
    const newData = barChartOverlayData.map(d => ({...d, y: d.y + 1}));
    return newData;
  } else {
    return barChartOverlayData.map(d => ({...d, y: d.y - 1}));
  }
};

export const barChartOverlayData2: BarChartDatum[] = [
  {
    x: 'Boston',
    y: 8,
    tooltipContent: 'Tooltip Content',
    fill: 'none',
    stroke: colorScheme.quaternary,
  },
  {
    x: 'Cambridge',
    y: 5,
    tooltipContent: 'Tooltip Content about Cambridge MA where we work right now test long content length',
    fill: 'none',
    stroke: colorScheme.quaternary,
  },
  {
    x: 'Somerville',
    y: 9,
    tooltipContent: 'Tooltip Content',
    fill: 'none',
    stroke: colorScheme.quaternary,
  },
  {
    x: 'Acton',
    y: 5,
    tooltipContent: 'Tooltip Content',
    fill: 'none',
    stroke: colorScheme.quaternary,
  },
  {
    x: 'Stow',
    y: 3,
    fill: 'none',
    stroke: colorScheme.quaternary,
  },
];
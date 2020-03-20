import { Datum as ScatterPlotDatum } from '../../components/dataViz/scatterPlot';
import { Datum as BarChartDatum } from '../../components/dataViz/barChart';
import { Datum as RadarChartDatum } from '../../components/dataViz/radarChart';
import {
  Datum as DynamicTableDatum,
  Column as DynamicTableColumn,
} from '../../components/text/DynamicTable';
import { TreeNode } from 'react-dropdown-tree-select';
import { lightBorderColor } from '../../styling/styleUtils';
import { RawNaceDatum } from './transformNaceData';
import {rgba} from 'polished';

export const colorScheme = {
  primary: '#F1A189',
  secondary: '#F8CCBF',
  tertiary: '#FCEEEB',
  quaternary: '#D75037',
  quinary: '#A72F2F',
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

export const testQueryBuilderDataCountry: TreeNode[] = [
  {
    label: 'All Countries',
    value: 'All Countries',
  },
  {
    label: 'China',
    value: 'China',
  },
  {
    label: 'United States',
    value: 'United States',
  },
  {
    label: 'France',
    value: 'France',
  },
  {
    label: 'Chile',
    value: 'Chile',
  },
];

export const testQueryBuilderDataCity: TreeNode[] = [
  {
    label: 'All Cities',
    value: 'All Cities',
    parentValue: null,
  },
  {
    label: 'Beijing',
    value: 'Beijing',
    parentValue: 'China',
  },
  {
    label: 'Shanghai',
    value: 'Shanghai',
    parentValue: 'China',
  },
  {
    label: 'Hong Kong',
    value: 'Hong Kong',
    parentValue: 'China',
  },
  {
    label: 'Guangzhou',
    value: 'Guangzhou',
    parentValue: 'China',
  },
  {
    label: 'Boston',
    value: 'Boston',
    parentValue: 'United States',
  },
  {
    label: 'New York',
    value: 'New York',
    parentValue: 'United States',
  },
  {
    label: 'Atlanta',
    value: 'Atlanta',
    parentValue: 'United States',
  },
  {
    label: 'Portland',
    value: 'Portland',
    parentValue: 'United States',
  },
  {
    label: 'Paris',
    value: 'Paris',
    parentValue: 'France',
  },
  {
    label: 'Marseille',
    value: 'Marseille',
    parentValue: 'France',
  },
  {
    label: 'Lyon',
    value: 'Lyon',
    parentValue: 'France',
  },
  {
    label: 'Toulouse',
    value: 'Toulouse',
    parentValue: 'France',
  },
  {
    label: 'Santiago',
    value: 'Santiago',
    parentValue: 'Chile',
  },
  {
    label: 'Puente Alto',
    value: 'Puente Alto',
    parentValue: 'Chile',
  },
  {
    label: 'Antofagasta',
    value: 'Antofagasta',
    parentValue: 'Chile',
  },
  {
    label: 'Viña del Mar',
    value: 'Viña del Mar',
    parentValue: 'Chile',
  },
];

export const generateScatterPlotData = (rawNaceDatum: RawNaceDatum[]): ScatterPlotDatum[] => {
  const transformedData: ScatterPlotDatum[] = [];
  rawNaceDatum.forEach(({Level, Description}) => {
    if (Level === '3') {
      transformedData.push({
        label: Description,
        x: Math.floor((Math.random() * 100) + 1),
        y: Math.floor((Math.random() * 100) + 1),
        fill: rgba(colorScheme.primary, 0.8),
      });
    }
  });
  return transformedData;
};

export const updateScatterPlotData = (scatterPlotData: ScatterPlotDatum[], selectedIndustry: TreeNode | undefined) => {
  return scatterPlotData.map(datum => {
    const fill = selectedIndustry && selectedIndustry.label === datum.label
        ? 'rgba(137,178,176, 0.8)' : rgba(colorScheme.primary, 0.7);
    const highlighted = selectedIndustry && selectedIndustry.label === datum.label
        ? true : false;
    return { ...datum, fill, highlighted };
  });
};

export const spiderPlotTestData2: RadarChartDatum[][] = [
  [
    {label: 'RCA Albania', value: 70},
    {label: 'RCA Peers', value: 40},
    {label: 'Water Intensity', value: 50},
    {label: 'Electricity Intensity', value: 90},
    {label: 'Avail. of Inputs', value: 20},
  ],
];

export const spiderPlotTestData3: RadarChartDatum[][] = [
  [
    {label: 'RCA Albania', value: 67},
    {label: 'RCA Peers', value: 13},
    {label: 'Water Intensity', value: 89},
    {label: 'Electricity Intensity', value: 78},
    {label: 'Avail. of Inputs', value: 91},
  ],
];

export const barChartData: BarChartDatum[] = [
  {
    x: '\'04-\'05',
    y: 4,
    tooltipContent: '$4 Million',
    fill: lightBorderColor,
  },
  {
    x: '\'07-\'09',
    y: 8,
    tooltipContent: '$8 Million',
    fill: lightBorderColor,
  },
  {
    x: '\'10-\'12',
    y: 11,
    tooltipContent: '$11 Million',
    fill: lightBorderColor,
  },
  {
    x: '\'13-\'15',
    y: 3,
    tooltipContent: '$3 Million',
    fill: lightBorderColor,
  },
  {
    x: '\'16-\'18',
    y: 4,
    tooltipContent: '$4 Million',
    fill: lightBorderColor,
  },
];

export const barChartOverlayData: BarChartDatum[] = [
  {
    x: '\'04-\'05',
    y: 2,
    tooltipContent: '$4 Million',
    fill: colorScheme.primary,
  },
  {
    x: '\'07-\'09',
    y: 4,
    tooltipContent: '$8 Million',
    fill: colorScheme.primary,
  },
  {
    x: '\'10-\'12',
    y: 7,
    tooltipContent: '$11 Million',
    fill: colorScheme.primary,
  },
  {
    x: '\'13-\'15',
    y: 1,
    tooltipContent: '$3 Million',
    fill: colorScheme.primary,
  },
  {
    x: '\'16-\'18',
    y: 3,
    tooltipContent: '$4 Million',
    fill: colorScheme.primary,
  },
];

export const getBarChartOverlayData: (id: string) => BarChartDatum[] = (id) => {
  if (id === 'Europe') {
    return barChartOverlayData;
  } else if (id === 'Asia') {
    const newData = barChartOverlayData.map(d => ({...d, y: d.y + 1, tooltipContent: `$${d.y + 1}Million`}));
    return newData;
  } else {
    return barChartOverlayData.map(d => ({...d, y: d.y - 1, tooltipContent: `$${d.y - 1}Million`}));
  }
};

export const barChartOverlayData2: BarChartDatum[] = [
  {
    x: '\'04-\'05',
    y: 8,
    tooltipContent: '$8 Million',
    fill: 'rgba(0, 0, 0, 0)',
    stroke: colorScheme.quaternary,
  },
  {
    x: '\'07-\'09',
    y: 5,
    tooltipContent: '$5 Million',
    fill: 'rgba(0, 0, 0, 0)',
    stroke: colorScheme.quaternary,
  },
  {
    x: '\'10-\'12',
    y: 9,
    tooltipContent: '$9 Million',
    fill: 'rgba(0, 0, 0, 0)',
    stroke: colorScheme.quaternary,
  },
  {
    x: '\'13-\'15',
    y: 5,
    tooltipContent: '$5 Million',
    fill: 'rgba(0, 0, 0, 0)',
    stroke: colorScheme.quaternary,
  },
  {
    x: '\'16-\'18',
    y: 3,
    tooltipContent: '$3 Million',
    fill: 'rgba(0, 0, 0, 0)',
    stroke: colorScheme.quaternary,
  },
];

export const testTableColumns1: DynamicTableColumn[] = [
  {label: 'Schooling', key: 'schooling'},
  {label: 'Women', key: 'women'},
  {label: 'Men', key: 'men'},
];
export const testTableData1: DynamicTableDatum[] = [
  {schooling: 'Below ES', women: '5%', men: '18%'},
  {schooling: 'Below BE', women: '0.7%', men: '1.8%'},
  {schooling: 'Basic Education', women: '0.7%', men: '8%'},
  {schooling: 'HS or Apprenticeship', women: '0.5%', men: '0.8%'},
  {schooling: 'Intermediate diploma', women: '1.5%', men: '0.1%'},
  {schooling: 'University and more', women: '15%', men: '1%'},
];

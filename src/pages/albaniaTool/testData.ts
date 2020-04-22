import { Datum as BarChartDatum } from '../../components/dataViz/barChart';
import {
  Datum as DynamicTableDatum,
  Column as DynamicTableColumn,
} from '../../components/text/DynamicTable';
import { lightBorderColor } from '../../styling/styleUtils';
import { colorScheme } from './Utils';

export const barChartData: BarChartDatum[] = [
  {
    x: '\'04-\'05',
    y: 4,
    tooltipContent: 'Industry: $4 Million<br />Country: $2 Million',
    fill: lightBorderColor,
  },
  {
    x: '\'07-\'09',
    y: 8,
    tooltipContent: 'Industry: $8 Million<br />Country: $5 Million',
    fill: lightBorderColor,
  },
  {
    x: '\'10-\'12',
    y: 11,
    tooltipContent: 'Industry: $11 Million<br />Country: $9 Million',
    fill: lightBorderColor,
  },
  {
    x: '\'13-\'15',
    y: 3,
    tooltipContent: 'Industry: $3 Million<br />Country: $5 Million',
    fill: lightBorderColor,
  },
  {
    x: '\'16-\'18',
    y: 4,
    tooltipContent: 'Industry: $4 Million<br />Country: $3 Million',
    fill: lightBorderColor,
  },
];

export const barChartOverlayData2: BarChartDatum[] = [
  {
    x: '\'04-\'05',
    y: 8,
    tooltipContent: 'Industry: $4 Million<br />Country: $8 Million',
    fill: 'rgba(0, 0, 0, 0)',
    stroke: colorScheme.quaternary,
  },
  {
    x: '\'07-\'09',
    y: 5,
    tooltipContent: 'Industry: $8 Million<br />Country: $5 Million',
    fill: 'rgba(0, 0, 0, 0)',
    stroke: colorScheme.quaternary,
  },
  {
    x: '\'10-\'12',
    y: 9,
    tooltipContent: 'Industry: $11 Million<br />Country: $9 Million',
    fill: 'rgba(0, 0, 0, 0)',
    stroke: colorScheme.quaternary,
  },
  {
    x: '\'13-\'15',
    y: 5,
    tooltipContent: 'Industry: $3 Million<br />Country: $5 Million',
    fill: 'rgba(0, 0, 0, 0)',
    stroke: colorScheme.quaternary,
  },
  {
    x: '\'16-\'18',
    y: 3,
    tooltipContent: 'Industry: $4 Million<br />Country: $3 Million',
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


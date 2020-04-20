import { Datum as BarChartDatum } from '../../components/dataViz/barChart';
import { Datum as RadarChartDatum } from '../../components/dataViz/radarChart';
import { Datum as ClusterBarChartDatum } from '../../components/dataViz/clusterBarChart';
import {
  Datum as DynamicTableDatum,
  Column as DynamicTableColumn,
} from '../../components/text/DynamicTable';
import { TreeNode } from 'react-dropdown-tree-select';
import { lightBorderColor } from '../../styling/styleUtils';
import { colorScheme } from './Utils';

export const testCountryListData: TreeNode[] = [
  {
    label: 'World',
    value: 'World',
  },
  {
    label: 'Europe',
    value: 'Europe',
  },
  {
    label: 'Balkans',
    value: 'Balkans',
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
    {label: 'Avail. of Inputs', value: 91},
  ],
];

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

export const barChartOverlayData: BarChartDatum[] = [
  {
    x: '\'04-\'05',
    y: 2,
    tooltipContent: 'Industry: $4 Million<br />Country: $2 Million',
    fill: colorScheme.quaternary,
  },
  {
    x: '\'07-\'09',
    y: 4,
    tooltipContent: '$8 Million',
    fill: colorScheme.quaternary,
  },
  {
    x: '\'10-\'12',
    y: 7,
    tooltipContent: '$11 Million',
    fill: colorScheme.quaternary,
  },
  {
    x: '\'13-\'15',
    y: 1,
    tooltipContent: '$3 Million',
    fill: colorScheme.quaternary,
  },
  {
    x: '\'16-\'18',
    y: 3,
    tooltipContent: '$4 Million',
    fill: colorScheme.quaternary,
  },
];

export const getBarChartOverlayData: (id: string) => BarChartDatum[] = (id) => {
  if (id === 'World') {
    return barChartOverlayData;
  } else if (id === 'Europe') {
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

export const testFDIColumns1: DynamicTableColumn[] = [
  {label: 'Company', key: 'company'},
  {label: 'Source Country', key: 'country'},
  {label: 'Source City', key: 'city'},
  {label: 'Value 1', key: 'val1'},
  {label: 'Value 2', key: 'val2'},
  {label: 'Value 3', key: 'val3'},
  {label: 'Value 4', key: 'val4'},
  {label: 'Value 5', key: 'val5'},
];
export const testFDIData1: DynamicTableDatum[] = [
  {company: 'ParentCompany', country: 'Germany', city: 'Vilsbiburg', val1: 12, val2: 234, val3: 9.2, val4: 234, val5: 234},
  {company: 'Draexlmaier', country: 'South Korea', city: 'Cheongju', val1: 65, val2: 53, val3: 43, val4: 53, val5: 53},
  {company: 'Yura Corporation', country: 'Japan', city: 'Tokyo', val1: 34, val2: 864, val3: 53, val4: 864, val5: 864},
  {company: 'Sewon (ECS)', country: 'Germany', city: 'Grundau', val1: 32, val2: 23, val3: 962, val4: 23, val5: 23},
  {company: 'Yazaki Group', country: 'Germany', city: 'Stuttgart', val1: 17, val2: 975, val3: 72, val4: 975, val5: 975},
  {company: 'IG Bauerhin', country: 'Germany', city: 'Hannover', val1: 23, val2: 123, val3: 9, val4: 123, val5: 123},
  {company: 'Daimler AG', country: 'Germany', city: 'Lippstadt', val1: 76, val2: 24, val3: 659.2, val4: 24, val5: 24},
  {company: 'Continental', country: 'China', city: 'Ningbo', val1: 186, val2: 234, val3: 9.286, val4: 234, val5: 234},
  {company: 'ParentCompany', country: 'Germany', city: 'Vilsbiburg', val1: 98, val2: 34, val3: 809.2, val4: 34, val5: 34},
  {company: 'Draexlmaier', country: 'South Korea', city: 'Cheongju', val1: 14, val2: 94, val3: 94.2, val4: 94, val5: 94},
];

export const clusterBarGrapphTestData: ClusterBarChartDatum[] = [{
    'groupName': 'World',
    'y': 76,
    'x': "'04-'05",
    'fill': colorScheme.primary,
    'tooltipContent': '$76 Million USD',
  }, {
    'groupName': 'Europe',
    'y': 50,
    'x': "'04-'05",
    'fill': colorScheme.quaternary,
    'tooltipContent': '$50 Million USD',
  },  {
    'groupName': 'Balkans',
    'y': 21,
    'x': "'04-'05",
    'fill': colorScheme.header,
    'tooltipContent': '$21 Million USD',
  }, {
    'groupName': 'World',
    'y': 67,
    'x': "'07-'09",
    'fill': colorScheme.primary,
    'tooltipContent': '$67 Million USD',
  }, {
    'groupName': 'Europe',
    'y': 52,
    'x': "'07-'09",
    'fill': colorScheme.quaternary,
    'tooltipContent': '$52 Million USD',
  }, {
    'groupName': 'Balkans',
    'y': 28,
    'x': "'07-'09",
    'fill': colorScheme.header,
    'tooltipContent': '$28 Million USD',
  }, {
    'groupName': 'World',
    'y': 97,
    'x': "'10-'12",
    'fill': colorScheme.primary,
    'tooltipContent': '$97 Million USD',
  }, {
    'groupName': 'Europe',
    'y': 36,
    'x': "'10-'12",
    'fill': colorScheme.quaternary,
    'tooltipContent': '$36 Million USD',
  }, {
    'groupName': 'Balkans',
    'y': 51,
    'x': "'10-'12",
    'fill': colorScheme.header,
    'tooltipContent': '$51 Million USD',
  }, {
    'groupName': 'World',
    'y': 54,
    'x': "'13-'15",
    'fill': colorScheme.primary,
    'tooltipContent': '$54 Million USD',
  }, {
    'groupName': 'Europe',
    'y': 26,
    'x': "'13-'15",
    'fill': colorScheme.quaternary,
    'tooltipContent': '$26 Million USD',
  }, {
    'groupName': 'Balkans',
    'y': 15,
    'x': "'13-'15",
    'fill': colorScheme.header,
    'tooltipContent': '$15 Million USD',
  }, {
    'groupName': 'World',
    'y': 69,
    'x': "'16-'18",
    'fill': colorScheme.primary,
    'tooltipContent': '$69 Million USD',
  }, {
    'groupName': 'Europe',
    'y': 52,
    'x': "'16-'18",
    'fill': colorScheme.quaternary,
    'tooltipContent': '$52 Million USD',
  }, {
    'groupName': 'Balkans',
    'y': 40,
    'x': "'16-'18",
    'fill': colorScheme.header,
    'tooltipContent': '$40 Million USD',
  },
  ];

export const tripleStackBarChartTestData: BarChartDatum[][] = [
  [
    {
      'y': 76,
      'x': "'03-'06",
      'fill': colorScheme.primary,
      'tooltipContent':
        'Total for World: $76 Million USD' +
        '<br />' +
        '<strong>Difference for World:</strong> $40 Million USD',
    }, {
      'y': 67,
      'x': "'07-'10",
      'fill': colorScheme.primary,
      'tooltipContent':
        '<strong>Total for World:</strong> $67 Million USD' +
        '<br />' +
        '<strong>Difference for World:</strong> $10 Million USD',
    }, {
      'y': 97,
      'x': "'11-'14",
      'fill': colorScheme.primary,
      'tooltipContent':
        '<strong>Total for World:</strong> $97 Million USD' +
        '<br />' +
        '<strong>Difference for World:</strong> $70 Million USD',
    }, {
      'y': 54,
      'x': "'15-'18",
      'fill': colorScheme.primary,
      'tooltipContent':
        '<strong>Total for World:</strong> $54 Million USD' +
        '<br />' +
        '<strong>Difference for World:</strong> $20 Million USD',
    },
  ],[
    {
      'y': 36,
      'x': "'03-'06",
      'fill': colorScheme.quaternary,
      'tooltipContent':
        '<strong>Total for Europe:</strong> $36 Million USD' +
        '<br />' +
        '<strong>Difference for Europe:</strong> $20 Million USD',
    }, {
      'y': 57,
      'x': "'07-'10",
      'fill': colorScheme.quaternary,
      'tooltipContent':
        '<strong>Total for Europe:</strong> $57 Million USD' +
        '<br />' +
        '<strong>Difference for Europe:</strong> $30 Million USD',
    }, {
      'y': 27,
      'x': "'11-'14",
      'fill': colorScheme.quaternary,
      'tooltipContent':
        '<strong>Total for Europe:</strong> $27 Million USD' +
        '<br />' +
        '<strong>Difference for Europe:</strong> $14 Million USD',
    }, {
      'y': 34,
      'x': "'15-'18",
      'fill': colorScheme.quaternary,
      'tooltipContent':
        '<strong>Total for Europe:</strong> $34 Million USD' +
        '<br />' +
        '<strong>Difference for Europe:</strong> $11 Million USD',
    },
  ], [
   {
      'y': 16,
      'x': "'03-'06",
      'fill': colorScheme.header,
      'tooltipContent': '<strong>Total for Balkans:</strong> $16 Million USD',
    },  {
      'y': 27,
      'x': "'07-'10",
      'fill': colorScheme.header,
      'tooltipContent': '<strong>Total for Balkans:</strong> $27 Million USD',
    }, {
      'y': 13,
      'x': "'11-'14",
      'fill': colorScheme.header,
      'tooltipContent': '<strong>Total for Balkans:</strong> $13 Million USD',
    },  {
      'y': 23,
      'x': "'15-'18",
      'fill': colorScheme.header,
      'tooltipContent': '<strong>Total for Balkans:</strong> $23 Million USD',
    },
  ],
];


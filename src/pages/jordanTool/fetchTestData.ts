/* tslint:disable:await-promise */
import raw from 'raw.macro';
import {useEffect, useState} from 'react';
import csv from 'csvtojson';
import { TreeNode } from 'react-dropdown-tree-select';
import { Datum as ScatterPlotDatum } from '../../components/dataViz/scatterPlot';
import { Datum as RadarChartDatum } from '../../components/dataViz/radarChart';
import { Datum as BarChartDatum } from '../../components/dataViz/barChart';
import {rgba} from 'polished';
import {
  Datum as DynamicTableDatum,
  Column as DynamicTableColumn,
} from '../../components/text/DynamicTable';

interface RawIndustryDatum {
  Code: string;
  Title: string;
  Theme: string;
  SubTheme: string;
  Description: string;
  Keywords: string;
}

interface Input {
  variables: {
    id: string | null,
  };
}


const generateScatterPlotData = (rawIndustryDatum: RawIndustryDatum[], id: string): ScatterPlotDatum[] => {
  const transformedData: ScatterPlotDatum[] = [];
  rawIndustryDatum.forEach(({Code, Title}) => {
    const color = Math.round(Math.random()) === 0 ? '#5387b1' : '#FF996E';
    transformedData.push({
      label: Title,
      x: Math.floor((Math.random() * 100) + 1),
      y: Math.floor((Math.random() * 100) + 1),
      fill: rgba(color, 0.5),
      highlighted: (Code === id),
    });
  });
  return transformedData;
};

const generateViabilityData = () => {
  return [
    [
      {label: 'RCA Jordan', value: Math.floor((Math.random() * 100) + 1)},
      {label: 'RCA Peers', value: Math.floor((Math.random() * 100) + 1)},
      {label: 'Water Intensity', value: Math.floor((Math.random() * 100) + 1)},
      {label: 'Electricity Intensity', value: Math.floor((Math.random() * 100) + 1)},
      {label: 'Avail. of Inputs', value: Math.floor((Math.random() * 100) + 1)},
    ],
  ];
};
const generateAttractivenessData = () => {
  return [
    [
      {label: 'Female Employment', value: Math.floor((Math.random() * 100) + 1)},
      {label: 'H. Skill Employ.', value: Math.floor((Math.random() * 100) + 1)},
      {label: 'FDI World', value: Math.floor((Math.random() * 100) + 1)},
      {label: 'FDI Region', value: Math.floor((Math.random() * 100) + 1)},
      {label: 'Exp. Propen.', value: Math.floor((Math.random() * 100) + 1)},
    ],
  ];
};

const generateBarChartData = () => {
  return [
    [
      {
        x: '2004-2006',
        y: 12000000,
        fill: '#E0E0E0',
      },
      {
        x: '2007-2009',
        y: 38000000,
        fill: '#E0E0E0',
      },
      {
        x: '2010-2012',
        y: 22000000,
        fill: '#E0E0E0',
      },
      {
        x: '2013-2015',
        y: 9000000,
        fill: '#E0E0E0',
      },
      {
        x: '2016-2018',
        y: 34000000,
        fill: '#E0E0E0',
      },
    ],
    [
      {
        x: '2004-2006',
        y: Math.floor((Math.random() * 10000000) + 1),
        fill: '#5387b1',
      },
      {
        x: '2007-2009',
        y: Math.floor((Math.random() * 30000000) + 1),
        fill: '#5387b1',
      },
      {
        x: '2010-2012',
        y: Math.floor((Math.random() * 20000000) + 1),
        fill: '#5387b1',
      },
      {
        x: '2013-2015',
        y: Math.floor((Math.random() * 8000000) + 1),
        fill: '#5387b1',
      },
      {
        x: '2016-2018',
        y: Math.floor((Math.random() * 30000000) + 1),
        fill: '#5387b1',
      },
    ],
  ];
};
const generateBarChartData2 = () => {
  return [
    [
      {
        x: '2004-2006',
        y: 12000000,
        fill: '#E0E0E0',
      },
      {
        x: '2007-2009',
        y: 38000000,
        fill: '#E0E0E0',
      },
      {
        x: '2010-2012',
        y: 22000000,
        fill: '#E0E0E0',
      },
      {
        x: '2013-2015',
        y: 9000000,
        fill: '#E0E0E0',
      },
      {
        x: '2016-2018',
        y: 34000000,
        fill: '#E0E0E0',
      },
    ],
    [
      {
        x: '2004-2006',
        y: Math.floor((Math.random() * 10000000) + 1),
        fill: 'transparent',
        stroke: '#5387b1',
      },
      {
        x: '2007-2009',
        y: Math.floor((Math.random() * 30000000) + 1),
        fill: 'transparent',
        stroke: '#5387b1',
      },
      {
        x: '2010-2012',
        y: Math.floor((Math.random() * 20000000) + 1),
        fill: 'transparent',
        stroke: '#5387b1',
      },
      {
        x: '2013-2015',
        y: Math.floor((Math.random() * 8000000) + 1),
        fill: 'transparent',
        stroke: '#5387b1',
      },
      {
        x: '2016-2018',
        y: Math.floor((Math.random() * 30000000) + 1),
        fill: 'transparent',
        stroke: '#5387b1',
      },
    ],
  ];
};

const tableColumns: DynamicTableColumn[] = [
  {label: 'Schooling', key: 'schooling'},
  {label: 'Women', key: 'women'},
  {label: 'Men', key: 'men'},
];
const tableData: DynamicTableDatum[] = [
  {schooling: 'Below ES', women: '5%', men: '18%'},
  {schooling: 'Below BE', women: '0.7%', men: '1.8%'},
  {schooling: 'Basic Education', women: '0.7%', men: '8%'},
  {schooling: 'HS or Apprenticeship', women: '0.5%', men: '0.8%'},
  {schooling: 'Intermediate diploma', women: '1.5%', men: '0.1%'},
  {schooling: 'University and more', women: '15%', men: '1%'},
];

export default ({variables: {id}}: Input) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<undefined | string>(undefined);
  const [industryData, setIndustryData] = useState<undefined | TreeNode[]>(undefined);
  const [scatterPlotData, setScatterPlotData] = useState<ScatterPlotDatum[]>([]);
  const [viabilityData, setViabilityData] = useState<RadarChartDatum[][]>([]);
  const [attractivenessData, setAttractivenessData] = useState<RadarChartDatum[][]>([]);
  const [barChartData, setBarChartData] = useState<BarChartDatum[][]>([]);
  const [barChartData2, setBarChartData2] = useState<BarChartDatum[][]>([]);

  const jordanMapData = JSON.parse(raw('./data/jordanmap.json'));
  const featuresWithValues = jordanMapData.features.map((feature: any, i: number) => {
    const percent = (i + 1) * 7;
    const properties = {...feature.properties, percent, tooltipContent: `${percent}%`};
    return {...feature, properties};
  });
  const jordanGeoJson = {...jordanMapData, features: featuresWithValues};

  useEffect(() => {
    const getIndustryData = async () => {
      try {
        const industryJson: RawIndustryDatum[] = await csv().fromString(raw('./data/industry.csv'));
        const transformedData: TreeNode[] = [];
        industryJson.forEach(({Code, Title, Description}) => {
          const parentIndex = transformedData.length
            ? transformedData.findIndex(({value}) => value === Description) : -1;
          if (parentIndex === -1) {
            // parent does not exist, create new entry
            transformedData.push({
              label: Description,
              value: Description,
              className: 'no-select-parent',
              disabled: true,
              children: [{
                label: Title,
                value: Code,
                disabled: false,
              }],
            });
          } else {
            // parent already exists, push to existing parent
            transformedData[parentIndex].children.push({
              label: Title,
              value: Code,
              disabled: false,
            });
          }
        });
        setIndustryData(transformedData);
        if (id !== null) {
          setScatterPlotData(generateScatterPlotData(industryJson, id));
          setViabilityData(generateViabilityData());
          setAttractivenessData(generateAttractivenessData());
          setBarChartData(generateBarChartData());
          setBarChartData2(generateBarChartData2());
        }
        setLoading(false);
      } catch (e) {
        setError(e);
        setLoading(false);
      }
    };
    getIndustryData();
  }, [id]);

  return {
    error,
    loading,
    data: {
      industryData, scatterPlotData, viabilityData, attractivenessData, barChartData,
      jordanGeoJson, barChartData2, tableColumns, tableData,
    },
  };
};
import raw from 'raw.macro';
import { TreeNode } from 'react-dropdown-tree-select';
import { Datum as ScatterPlotDatum } from '../../components/dataViz/scatterPlot';
import { Datum as RadarChartDatum } from '../../components/dataViz/radarChart';
import { Datum as BarChartDatum } from '../../components/dataViz/barChart';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {
  Datum as DynamicTableDatum,
  Column as DynamicTableColumn,
} from '../../components/text/DynamicTable';
import {
  JordanIndustry,
} from './graphql/graphQLTypes';
import {rgba} from 'polished';

const GET_JORDAN_INDUSTRIES_DATA = gql`
  query GetJordanData($industryCode: Int!) {
    jordanIndustryList {
      industryCode
      title
      description
      keywords
      factors {
        edges {
          node {
            attractiveness
            viability
            rca
          }
        }
      }
    }
    jordanIndustry(industryCode: $industryCode) {
      industryCode
      factors {
        edges {
          node {
            rcaJordan
            rcaPeers
            waterIntensity
            electricityIntensity
            availabilityInputs
            femaleEmployment
            highSkillEmployment
            fdiWorld
            fdiRegion
            exportPropensity
          }
        }
      }
    }
  }
`;

interface SuccessResponse {
  jordanIndustryList: {
    industryCode: JordanIndustry['industryCode'];
    title: JordanIndustry['title'];
    description: JordanIndustry['description'];
    keywords: JordanIndustry['keywords'];
    factors: JordanIndustry['factors'];
  }[];
  jordanIndustry: {
    industryCode: JordanIndustry['industryCode'];
    factors: JordanIndustry['factors'];
  };
}

interface Variables {
  industryCode: number;
}

const generateScatterPlotData = (rawDatum: SuccessResponse['jordanIndustryList'], id: string): ScatterPlotDatum[] => {
  const transformedData: ScatterPlotDatum[] = [];
  rawDatum.forEach((datum) => {
    const { industryCode, title, keywords, description, factors } = datum;
    if (industryCode && title && keywords && description &&
        factors && factors.edges && factors.edges[0] && factors.edges[0].node &&
        factors.edges[0].node.viability !== null && factors.edges[0].node.attractiveness !== null &&
        factors.edges[0].node.rca !== null
      ) {
      const color = factors.edges[0].node.rca < 1 ? '#46899F' : '#E0B04E';
      const x = factors.edges[0].node.viability;
      const y = factors.edges[0].node.attractiveness;
      transformedData.push({
        label: title,
        x,
        y,
        fill: rgba(color, 0.5),
        highlighted: (industryCode === id),
        tooltipContent:
          '<strong>Theme:</strong> ' + description +
          '<br /><strong>SubTheme:</strong> ' + keywords +
          '<br /><strong>Description:</strong> ' + title +
          '<br /><strong>Viability:</strong> ' + x +
          '<br /><strong>Attractiveness:</strong> ' + y,
        tooltipContentOnly: true,
      });
    }
  });
  return transformedData;
};

interface Input {
  variables: {
    id: string,
  };
}

interface ReturnValue {
  error: undefined | any;
  loading: boolean;
  data: undefined | {
    industryData: undefined | TreeNode[];
    scatterPlotData: ScatterPlotDatum[];
    viabilityData: RadarChartDatum[][];
    attractivenessData: RadarChartDatum[][];
    barChartData: BarChartDatum[][];
    barChartData2: BarChartDatum[][];
    jordanGeoJson: any;
    tableColumns: DynamicTableColumn[]
    tableData: DynamicTableDatum[];
  };
}

export default ({variables: {id}}: Input): ReturnValue => {
  const jordanMapData = JSON.parse(raw('./data/jordanmap.json'));
  const featuresWithValues = jordanMapData.features.map((feature: any, i: number) => {
    const percent = (i + 1) * 7;
    const properties = {...feature.properties, percent, tooltipContent: `${percent}%`};
    return {...feature, properties};
  });
  const jordanGeoJson = {...jordanMapData, features: featuresWithValues};

  const {loading, error, data: rawDatum} = useQuery<SuccessResponse, Variables>(GET_JORDAN_INDUSTRIES_DATA, {
    variables: {industryCode: parseInt(id, 10)},
  });
  let data: undefined | ReturnValue['data'];
  if (rawDatum !== undefined) {
    const { jordanIndustryList, jordanIndustry: {factors} } = rawDatum;
    const factorsNode = factors.edges !== null && factors.edges[0] ? factors.edges[0].node : null;
    const industryData: TreeNode[] = [];
    jordanIndustryList.forEach(({industryCode, title, description}) => {
      if (title && description) {
        const parentIndex = industryData.length
          ? industryData.findIndex(({value}) => value === description) : -1;
        if (parentIndex === -1) {
          // parent does not exist, create new entry
          industryData.push({
            label: description,
            value: description,
            className: 'no-select-parent',
            disabled: true,
            children: [{
              label: title,
              value: industryCode,
              disabled: false,
            }],
          });
        } else {
          // parent already exists, push to existing parent
          industryData[parentIndex].children.push({
            label: title,
            value: industryCode,
            disabled: false,
          });
        }
      }
    });

    const viabilityData: RadarChartDatum[] = [];
    const attractivenessData: RadarChartDatum[] = [];
    if (factorsNode !== null) {
      const {
        // Viability Factors:
        rcaJordan, rcaPeers, waterIntensity,
        electricityIntensity, availabilityInputs,

        // Attractiveness Factors:
        femaleEmployment, highSkillEmployment,
        fdiWorld, fdiRegion, exportPropensity,
      } = factorsNode;

      if (rcaJordan !== null) {
        viabilityData.push({label: 'RCA Jordan', value: rcaJordan});
      }
      if (rcaPeers !== null) {
        viabilityData.push({label: 'RCA Peers', value: rcaPeers});
      }
      if (waterIntensity !== null) {
        viabilityData.push({label: 'Water Intensity', value: waterIntensity});
      }
      if (electricityIntensity !== null) {
        viabilityData.push({label: 'Electricity Intensity', value: electricityIntensity});
      }
      if (availabilityInputs !== null) {
        viabilityData.push({label: 'Avail. of Inputs', value: availabilityInputs});
      }

      if (femaleEmployment !== null) {
        attractivenessData.push({label: 'RCA Jordan', value: femaleEmployment});
      }
      if (highSkillEmployment !== null) {
        attractivenessData.push({label: 'RCA Peers', value: highSkillEmployment});
      }
      if (fdiWorld !== null) {
        attractivenessData.push({label: 'Water Intensity', value: fdiWorld});
      }
      if (fdiRegion !== null) {
        attractivenessData.push({label: 'Electricity Intensity', value: fdiRegion});
      }
      if (exportPropensity !== null) {
        attractivenessData.push({label: 'Avail. of Inputs', value: exportPropensity});
      }
    }

    data = {
      industryData,
      scatterPlotData: generateScatterPlotData(jordanIndustryList, id),
      viabilityData: [viabilityData],
      attractivenessData: [attractivenessData],
      barChartData: [],
      barChartData2: [],
      jordanGeoJson,
      tableColumns: [],
      tableData: [],
    };
  } else {
    data = undefined;
  }

  return {
    error,
    loading,
    data,
  };
};
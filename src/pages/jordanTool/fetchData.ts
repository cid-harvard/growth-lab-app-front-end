import {
  ScatterPlotDatum,
  RadarChartDatum,
  BarChartDatum,
} from 'react-fast-charts';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import {
  Datum as DynamicTableDatum,
  Column as DynamicTableColumn,
} from '../../components/text/DynamicTable';
import {
  JordanIndustry,
  Text,
} from './graphql/graphQLTypes';
import generateScatterPlotData, {
  CSVDatum as ScatterPlotCsvDatum,
} from './transformers/transformScatterplotData';
import generateRadarChartData from './transformers/transformRadarChartData';
import generateIndustryNowTableData from './transformers/transformIndustryNowTableData';
import generateGeoJsonData from './transformers/transformGeoJsonData';
import generateWageHistogramData from './transformers/transformWageHistogramData';
import generateOverTimeHistogramData from './transformers/transformOverTimeHistogramData';
import { TreeNode } from 'react-dropdown-tree-select';

export const colorScheme = {
  primary: '#46899F',
  secondary: '#E0B04E',
  teriary: '#9ac5d3',
  quaternary: '#ecf0f2',
  lightGray: '#E0E0E0',
};

const GET_JORDAN_INDUSTRY_DATA = gql`
  query GetJordanIndustryData($industryCode: Int!) {
    jordanIndustry(industryCode: $industryCode) {
      industryCode
      title
      description
      keywords
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
      nationality {
        edges {
          node {
            nationality
            men
            women
            meanwage
            medianwage
          }
        }
      }
      schooling {
        edges {
          node {
            schooling
            men
            women
          }
        }
      }
      occupation {
        edges {
          node {
            occupation
            men
            women
          }
        }
      }
      mapLocation {
        edges {
          node {
            govCode
            governorate
            shareState
            shareCountry
          }
        }
      }
      wageHistogram {
        edges {
          node {
            facet
            range0100
            range100200
            range200300
            range300400
            range400500
            range500600
            range600Plus
          }
        }
      }
      overTime {
        edges {
          node {
            visualization
            variable
            years20042006
            years20072009
            years20102012
            years20132015
            years20162018
          }
        }
      }
      text {
        edges {
          node {
            occupation
            demographic
            location
            avgWage
            wageHist
            scatter
            schooling
            percentFemale
            percentHighSkill
            female
            highSkill
          }
        }
      }
      control {
        edges {
          node {
            labor
            women
            fdi
          }
        }
      }
    }
  }
`;

interface SuccessResponse {
  jordanIndustry: {
    industryCode: JordanIndustry['industryCode'];
    title: JordanIndustry['title'];
    description: JordanIndustry['description'];
    keywords: JordanIndustry['keywords'];
    factors: JordanIndustry['factors'];
    nationality: JordanIndustry['nationality'];
    schooling: JordanIndustry['schooling'];
    occupation: JordanIndustry['occupation'];
    mapLocation: JordanIndustry['mapLocation'];
    wageHistogram: JordanIndustry['wageHistogram'];
    overTime: JordanIndustry['overTime'];
    text: JordanIndustry['text'];
    control: JordanIndustry['control'];
  };
}

interface Variables {
  industryCode: number;
}

interface Input {
  rawIndustryList: JordanIndustry[];
  variables: {
    id: string,
  };
  setSelectedIndustry: (value: TreeNode) => void;
}

interface Control {
  fdi: boolean;
  women: boolean;
  labor: boolean;
}

interface ReturnValue {
  error: undefined | any;
  loading: boolean;
  data: undefined | {
    text: Text;
    scatterPlotData: ScatterPlotDatum[];
    scatterPlotCsvData: ScatterPlotCsvDatum[];
    viabilityData: RadarChartDatum[][];
    viabilityCsvData: object;
    attractivenessData: RadarChartDatum[][];
    attractivenessCsvData: object;
    wageHistogramData: BarChartDatum[][];
    overTimeHistogramData: BarChartDatum[][];
    overTimeHistogramCsvData: object[];
    jordanGeoJson: any;
    jordanMapMinVal: number;
    jordanMapMaxVal: number;
    sectorTableColumns: DynamicTableColumn[];
    sectorTableData: DynamicTableDatum[];
    wagesTableColumns: DynamicTableColumn[];
    wagesTableData: DynamicTableDatum[];
    schoolTableColumns: DynamicTableColumn[];
    schoolTableData: DynamicTableDatum[];
    occupationTableColumns: DynamicTableColumn[];
    occupationTableData: DynamicTableDatum[];
    control: Control;
  };
}

export default ({variables: {id}, rawIndustryList, setSelectedIndustry}: Input): ReturnValue => {

  const {loading, error, data: rawDatum} = useQuery<SuccessResponse, Variables>(GET_JORDAN_INDUSTRY_DATA, {
    variables: {industryCode: parseInt(id, 10)},
  });
  let data: undefined | ReturnValue['data'];
  if (rawDatum !== undefined) {
    const {
      jordanIndustry: {
        industryCode, title, description, keywords,
        factors,
        nationality: {edges: nationalityEdges}, schooling: {edges: schoolingEdges},
        occupation: {edges: occupationEdges}, mapLocation: {edges: mapLocationEdges},
        wageHistogram: {edges: wageHistogramEdges}, overTime: {edges: overTimeHistogramEdges},
        text: {edges: textEdges}, control: {edges: controlEdges},
      },
    } = rawDatum;

    /*****
      Flatten Text into single non-null object
    ******/
    const text: Text = textEdges && textEdges[0] && textEdges[0].node ? textEdges[0].node : {
      occupation: null,
      demographic: null,
      location: null,
      avgWage: null,
      wageHist: null,
      scatter: null,
      schooling: null,
      percentFemale: null,
      percentHighSkill: null,
      female: null,
      highSkill: null,
    };

    /*****
      Transform Viability and Attractiveness Factors
    ******/
    const basicCsvDatum = {
      'Industry Code': industryCode,
      'Theme': description,
      'SubTheme': keywords,
      'Description': title,
    };
    const {
      viabilityData, viabilityCsvData,
      attractivenessData, attractivenessCsvData,
    } = generateRadarChartData(factors);

    /*****
      Transform data for Industry Now Tables
    ******/
    const {
      sectorTableColumns, sectorTableData,
      wagesTableColumns, wagesTableData,
      schoolTableColumns, schoolTableData,
      occupationTableColumns, occupationTableData,
    } = generateIndustryNowTableData({nationalityEdges, schoolingEdges, occupationEdges});

    /*****
      Transform data for Jordan Map - Location of Workers
    ******/
    const {geoJsonWithValues, minValue, maxValue} = generateGeoJsonData(mapLocationEdges);

    /*****
      Transform data for Wages Histogram
    ******/
    const wageHistogramData = generateWageHistogramData(wageHistogramEdges);

    /*****
      Transform data for OverTime Histogram
    ******/
    const {overTimeHistogramData, overTimeHistogramCsvData} = generateOverTimeHistogramData(overTimeHistogramEdges);

    /****
      Get Control data
    ****/
    const control: Control = controlEdges && controlEdges[0] && controlEdges[0].node ? {
      fdi: !!(controlEdges[0].node.fdi),
      women: !!(controlEdges[0].node.women),
      labor: !!(controlEdges[0].node.labor),
    } : {
      fdi: false,
      women: false,
      labor: false,
    };

    const {scatterPlotData, csvData: scatterPlotCsvData} = generateScatterPlotData({
      rawDatum: rawIndustryList, id, setSelectedIndustry,
    });

    data = {
      text,
      scatterPlotData,
      scatterPlotCsvData,
      viabilityData: [viabilityData],
      viabilityCsvData: {...basicCsvDatum, ...viabilityCsvData},
      attractivenessData: [attractivenessData],
      attractivenessCsvData: {...basicCsvDatum, ...attractivenessCsvData},
      wageHistogramData,
      jordanGeoJson: geoJsonWithValues,
      jordanMapMinVal: minValue,
      jordanMapMaxVal: maxValue,
      sectorTableColumns,
      sectorTableData,
      wagesTableColumns,
      wagesTableData,
      schoolTableColumns,
      schoolTableData,
      occupationTableColumns,
      occupationTableData,
      overTimeHistogramData,
      overTimeHistogramCsvData,
      control,
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
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
import sortBy from 'lodash/sortBy';
import generateScatterPlotData from './transformers/transformScatterplotData';
import generateRadarChartData from './transformers/transformRadarChartData';
import generateFdiListsData, {FdiListDatum} from './transformers/transformFdiListsData';
import generateIndustryNowTableData from './transformers/transformIndustryNowTableData';
import generateGeoJsonData from './transformers/transformGeoJsonData';
import generateWageHistogramData from './transformers/transformWageHistogramData';
import generateOverTimeHistogramData from './transformers/transformOverTimeHistogramData';

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
      globalTopFdi {
        edges {
          node {
            rank
            company
            sourceCountry
            capitalInvestment
          }
        }
      }
      regionTopFdi {
        edges {
          node {
            rank
            company
            sourceCountry
            capitalInvestment
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
    }
  }
`;

interface SuccessResponse {
  jordanIndustry: {
    industryCode: JordanIndustry['industryCode'];
    factors: JordanIndustry['factors'];
    globalTopFdi: JordanIndustry['globalTopFdi'];
    regionTopFdi: JordanIndustry['regionTopFdi'];
    nationality: JordanIndustry['nationality'];
    schooling: JordanIndustry['schooling'];
    occupation: JordanIndustry['occupation'];
    mapLocation: JordanIndustry['mapLocation'];
    wageHistogram: JordanIndustry['wageHistogram'];
    overTime: JordanIndustry['overTime'];
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
}

interface ReturnValue {
  error: undefined | any;
  loading: boolean;
  data: undefined | {
    scatterPlotData: ScatterPlotDatum[];
    viabilityData: RadarChartDatum[][];
    attractivenessData: RadarChartDatum[][];
    fdiBarChartData: BarChartDatum[][];
    globalTopFdiList: FdiListDatum[];
    regionTopFdiList: FdiListDatum[];
    wageHistogramData: BarChartDatum[][];
    overTimeHistogramData: BarChartDatum[][];
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
  };
}

export default ({variables: {id}, rawIndustryList}: Input): ReturnValue => {

  const {loading, error, data: rawDatum} = useQuery<SuccessResponse, Variables>(GET_JORDAN_INDUSTRY_DATA, {
    variables: {industryCode: parseInt(id, 10)},
  });
  let data: undefined | ReturnValue['data'];
  if (rawDatum !== undefined) {
    const {
      jordanIndustry: {
        factors, globalTopFdi: {edges: globalTopFdiEdges}, regionTopFdi: {edges: regionTopFdiEdges},
        nationality: {edges: nationalityEdges}, schooling: {edges: schoolingEdges},
        occupation: {edges: occupationEdges}, mapLocation: {edges: mapLocationEdges},
        wageHistogram: {edges: wageHistogramEdges}, overTime: {edges: overTimeHistogramEdges},
      },
    } = rawDatum;

    /*****
      Transform Viability and Attractiveness Factors
    ******/
    const {viabilityData, attractivenessData} = generateRadarChartData(factors);

    /*****
      Transform data for Top FDI Lists (Global and Regional)
    ******/
    const {globalTopFdiList, regionTopFdiList} = generateFdiListsData({globalTopFdiEdges, regionTopFdiEdges});

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
    const overTimeHistogramData = generateOverTimeHistogramData(overTimeHistogramEdges);

    data = {
      scatterPlotData: generateScatterPlotData(rawIndustryList, id),
      viabilityData: [viabilityData],
      attractivenessData: [attractivenessData],
      fdiBarChartData: [],
      globalTopFdiList: sortBy(globalTopFdiList, ['rank']),
      regionTopFdiList: sortBy(regionTopFdiList, ['rank']),
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
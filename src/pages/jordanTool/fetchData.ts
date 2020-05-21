import raw from 'raw.macro';
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
  WageHistogramFacet,
} from './graphql/graphQLTypes';
import {rgba} from 'polished';
import sortBy from 'lodash/sortBy';
import {min, max} from 'd3-array';
import { lightBorderColor } from '../../styling/styleUtils';

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
  };
}

interface Variables {
  industryCode: number;
}

interface FdiListDatum {
  rank: number;
  company: string;
  sourceCountry: string;
  capitalInvestment: number;
}

enum wageHistogramXValues {
  range0100 = '0-100',
  range100200 = '100-200',
  range200300 = '200-300',
  range300400 = '300-400',
  range400500 = '400-500',
  range500600 = '500-600',
  range600Plus = '600+',
}

const generateScatterPlotData = (rawDatum: JordanIndustry[], id: string): ScatterPlotDatum[] => {
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

const jordanMapData = JSON.parse(raw('./data/jordanmap.json'));

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
        wageHistogram: {edges: wageHistogramEdges},
      },
    } = rawDatum;

    /*****
      Transform Viability and Attractiveness Factors
    ******/
    const factorsNode = factors.edges !== null && factors.edges[0] ? factors.edges[0].node : null;

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

      // Viability Radar Chart:
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

      // Attractiveness Radar Chart:
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

    /*****
      Transform data for Top FDI Lists (Global and Regional)
    ******/
    const globalTopFdiList: FdiListDatum[] = [];
    globalTopFdiEdges.forEach(edge => {
      if (edge && edge.node) {
        const { rank, company, sourceCountry, capitalInvestment } = edge.node;
        if (company !== null && sourceCountry !== null && capitalInvestment !== null) {
          globalTopFdiList.push({
            rank: parseInt(rank, 10),
            company, sourceCountry, capitalInvestment,
          });
        }
      }
    });
    const regionTopFdiList: FdiListDatum[] = [];
    regionTopFdiEdges.forEach(edge => {
      if (edge && edge.node) {
        const { rank, company, sourceCountry, capitalInvestment } = edge.node;
        if (company !== null && sourceCountry !== null && capitalInvestment !== null) {
          regionTopFdiList.push({
            rank: parseInt(rank, 10),
            company, sourceCountry, capitalInvestment,
          });
        }
      }
    });

    /*****
      Transform data for Sector Demographics Table
                     AND Industry Wages Table
                     (both use same endpoint)
    ******/
    const sectorTableColumns: DynamicTableColumn[] = [
      {label: 'Nationality', key: 'nationality'},
      {label: 'Women', key: 'women'},
      {label: 'Men', key: 'men'},
    ];
    const sectorTableData: DynamicTableDatum[] = [];
    const wagesTableColumns: DynamicTableColumn[] = [
      {label: 'Nationality', key: 'nationality'},
      {label: 'Mean Wage (JD)', key: 'meanwage'},
      {label: 'Median Wage (JD)', key: 'medianwage'},
    ];
    const wagesTableData: DynamicTableDatum[] = [];
    nationalityEdges.forEach(datum => {
      if (datum !== null && datum.node !== null) {
        const { nationality, men, women, meanwage, medianwage } = datum.node;
        if (men !== null && women !== null) {
          sectorTableData.push({men, women, nationality});
        }
        if (meanwage !== null && medianwage !== null) {
          wagesTableData.push({nationality, meanwage, medianwage});
        }
      }
    });

    /*****
      Transform data for Schooling Distribution Table
    ******/
    const schoolTableColumns: DynamicTableColumn[] = [
      {label: 'Schooling', key: 'schooling'},
      {label: 'Women', key: 'women'},
      {label: 'Men', key: 'men'},
    ];
    const schoolTableData: DynamicTableDatum[] = [];
    schoolingEdges.forEach(datum => {
      if (datum !== null && datum.node !== null) {
        const { schooling, men, women } = datum.node;
        if (men !== null && women !== null) {
          schoolTableData.push({men, women, schooling});
        }
      }
    });

    /*****
      Transform data for Occupation Distribution Table
    ******/
    const occupationTableColumns: DynamicTableColumn[] = [
      {label: 'occupation', key: 'occupation'},
      {label: 'Women', key: 'women'},
      {label: 'Men', key: 'men'},
    ];
    const occupationTableData: DynamicTableDatum[] = [];
    occupationEdges.forEach(datum => {
      if (datum !== null && datum.node !== null) {
        const { occupation, men, women } = datum.node;
        if (men !== null && women !== null) {
          occupationTableData.push({men, women, occupation});
        }
      }
    });


    /*****
      Transform data for Jordan Map - Location of Workers
    ******/
    const featuresWithValues = jordanMapData.features.map((feature: any) => {
      const edge = mapLocationEdges.find(e => (e && e.node && e.node.govCode === feature.properties.DPTO));
      const percent: number | null = edge !== null && edge !== undefined && edge.node && edge.node.shareCountry
        ? parseFloat(edge.node.shareCountry) : null;
      const adjustedPercent = percent ? percent.toFixed(2) : 0;
      const governorate = edge !== null && edge !== undefined && edge.node && edge.node.governorate
        ? edge.node.governorate : '';
      const properties = {...feature.properties, percent, tooltipContent: `
        <strong>Governorate:</strong> ${governorate}
        <br /><strong>Share Country:</strong> ${adjustedPercent}%
        `};
      return {...feature, properties};
    });
    const geoJsonWithValues = {...jordanMapData, features: featuresWithValues};

    const allValues: number[] = geoJsonWithValues.features.map((node: any) => node.properties.percent);

    const rawMinValue = min(allValues);
    const rawMaxValue = max(allValues);

    const minValue = rawMinValue ? Math.floor(rawMinValue) : 0;
    const maxValue = rawMaxValue ? Math.floor(rawMaxValue) : 0;


    /*****
      Transform data for Wages Histogram
    ******/
    const wageHistogramData: BarChartDatum[][] = [];
    const industryWageData = wageHistogramEdges.find(e => e && e.node && e.node.facet.includes(WageHistogramFacet.Industry));
    const countryWageData = wageHistogramEdges.find(e => e && e.node && e.node.facet.includes(WageHistogramFacet.Country));
    if (industryWageData !== null && industryWageData !== undefined && industryWageData.node !== null &&
        countryWageData !== null && countryWageData !== undefined && countryWageData.node !== null) {
      const industryrange0100 = industryWageData.node.range0100 !== null ? industryWageData.node.range0100 : 0;
      const industryrange100200 = industryWageData.node.range100200 !== null ? industryWageData.node.range100200 : 0;
      const industryrange200300 = industryWageData.node.range200300 !== null ? industryWageData.node.range200300 : 0;
      const industryrange300400 = industryWageData.node.range300400 !== null ? industryWageData.node.range300400 : 0;
      const industryrange400500 = industryWageData.node.range400500 !== null ? industryWageData.node.range400500 : 0;
      const industryrange500600 = industryWageData.node.range500600 !== null ? industryWageData.node.range500600 : 0;
      const industryrange600Up = industryWageData.node.range600Plus !== null ? industryWageData.node.range600Plus : 0;
      const countryrange0100 = countryWageData.node.range0100 !== null ? countryWageData.node.range0100 : 0;
      const countryrange100200 = countryWageData.node.range100200 !== null ? countryWageData.node.range100200 : 0;
      const countryrange200300 = countryWageData.node.range200300 !== null ? countryWageData.node.range200300 : 0;
      const countryrange300400 = countryWageData.node.range300400 !== null ? countryWageData.node.range300400 : 0;
      const countryrange400500 = countryWageData.node.range400500 !== null ? countryWageData.node.range400500 : 0;
      const countryrange500600 = countryWageData.node.range500600 !== null ? countryWageData.node.range500600 : 0;
      const countryrange600Up = countryWageData.node.range600Plus !== null ? countryWageData.node.range600Plus : 0;

      const industryData: BarChartDatum[] = [
        {
          x: wageHistogramXValues.range0100,
          y: industryrange0100,
          tooltipContent: `Industry: ${industryrange0100}%<br />Country: ${countryrange0100}%`,
          fill: lightBorderColor,
        },
        {
          x: wageHistogramXValues.range100200,
          y: industryrange100200,
          tooltipContent: `Industry: ${industryrange100200}%<br />Country: ${countryrange100200}%`,
          fill: lightBorderColor,
        },
        {
          x: wageHistogramXValues.range200300,
          y: industryrange200300,
          tooltipContent: `Industry: ${industryrange200300}%<br />Country: ${countryrange200300}%`,
          fill: lightBorderColor,
        },
        {
          x: wageHistogramXValues.range300400,
          y: industryrange300400,
          tooltipContent: `Industry: ${industryrange300400}%<br />Country: ${countryrange300400}%`,
          fill: lightBorderColor,
        },
        {
          x: wageHistogramXValues.range400500,
          y: industryrange400500,
          tooltipContent: `Industry: ${industryrange400500}%<br />Country: ${countryrange400500}%`,
          fill: lightBorderColor,
        },
        {
          x: wageHistogramXValues.range500600,
          y: industryrange500600,
          tooltipContent: `Industry: ${industryrange500600}%<br />Country: ${countryrange500600}%`,
          fill: lightBorderColor,
        },
        {
          x: wageHistogramXValues.range600Plus,
          y: industryrange600Up,
          tooltipContent: `Industry: ${industryrange600Up}%<br />Country: ${countryrange600Up}%`,
          fill: lightBorderColor,
        },
      ];

      const countryData: BarChartDatum[] = [
        {
          x: wageHistogramXValues.range0100,
          y: countryrange0100,
          tooltipContent: `Industry: ${industryrange0100}%<br />Country: ${countryrange0100}%`,
          fill: 'rgba(0, 0, 0, 0)',
          stroke: colorScheme.primary,
        },
        {
          x: wageHistogramXValues.range100200,
          y: countryrange100200,
          tooltipContent: `Industry: ${industryrange100200}%<br />Country: ${countryrange100200}%`,
          fill: 'rgba(0, 0, 0, 0)',
          stroke: colorScheme.primary,
        },
        {
          x: wageHistogramXValues.range200300,
          y: countryrange200300,
          tooltipContent: `Industry: ${industryrange200300}%<br />Country: ${countryrange200300}%`,
          fill: 'rgba(0, 0, 0, 0)',
          stroke: colorScheme.primary,
        },
        {
          x: wageHistogramXValues.range300400,
          y: countryrange300400,
          tooltipContent: `Industry: ${industryrange300400}%<br />Country: ${countryrange300400}%`,
          fill: 'rgba(0, 0, 0, 0)',
          stroke: colorScheme.primary,
        },
        {
          x: wageHistogramXValues.range400500,
          y: countryrange400500,
          tooltipContent: `Industry: ${industryrange400500}%<br />Country: ${countryrange400500}%`,
          fill: 'rgba(0, 0, 0, 0)',
          stroke: colorScheme.primary,
        },
        {
          x: wageHistogramXValues.range500600,
          y: countryrange500600,
          tooltipContent: `Industry: ${industryrange500600}%<br />Country: ${countryrange500600}%`,
          fill: 'rgba(0, 0, 0, 0)',
          stroke: colorScheme.primary,
        },
        {
          x: wageHistogramXValues.range600Plus,
          y: countryrange600Up,
          tooltipContent: `Industry: ${industryrange600Up}%<br />Country: ${countryrange600Up}%`,
          fill: 'rgba(0, 0, 0, 0)',
          stroke: colorScheme.primary,
        },
      ];
      wageHistogramData.push(industryData);
      wageHistogramData.push(countryData);
    }

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
import {
  IndustryNowWage,
} from '../../../graphql/graphQLTypes';
import { Datum as BarChartDatum } from '../../../components/dataViz/barChart';
import { colorScheme } from '../Utils';
import { lightBorderColor } from '../../../styling/styleUtils';

enum xValues {
  _010k = '0 - 10k',
  _10k25k = '10k - 25k',
  _25k50k = '25k - 50k',
  _50k75k = '50k - 75k',
  _75k100k = '75k - 100k',
  _100kUp = '100k +',
}

export default (wageData: IndustryNowWage) => {
  const ind010k = wageData.ind010k !== null ? wageData.ind010k : 0;
  const ind10k25k = wageData.ind10k25k !== null ? wageData.ind10k25k : 0;
  const ind25k50k = wageData.ind25k50k !== null ? wageData.ind25k50k : 0;
  const ind50k75k = wageData.ind50k75k !== null ? wageData.ind50k75k : 0;
  const ind75k100k = wageData.ind75k100k !== null ? wageData.ind75k100k : 0;
  const ind100kUp = wageData.ind100kUp !== null ? wageData.ind100kUp : 0;
  const national010k = wageData.national010k !== null ? wageData.national010k : 0;
  const national10k25k = wageData.national10k25k !== null ? wageData.national10k25k : 0;
  const national25k50k = wageData.national25k50k !== null ? wageData.national25k50k : 0;
  const national50k75k = wageData.national50k75k !== null ? wageData.national50k75k : 0;
  const national75k100k = wageData.national75k100k !== null ? wageData.national75k100k : 0;
  const national100kUp = wageData.national100kUp !== null ? wageData.national100kUp : 0;

  const industryData: BarChartDatum[] = [
    {
      x: xValues._010k,
      y: ind010k,
      tooltipContent: `Industry: ${ind010k.toFixed(2)}%<br />Country: ${national010k.toFixed(2)}%`,
      fill: lightBorderColor,
    },
    {
      x: xValues._10k25k,
      y: ind10k25k,
      tooltipContent: `Industry: ${ind10k25k.toFixed(2)}%<br />Country: ${national10k25k.toFixed(2)}%`,
      fill: lightBorderColor,
    },
    {
      x: xValues._25k50k,
      y: ind25k50k,
      tooltipContent: `Industry: ${ind25k50k.toFixed(2)}%<br />Country: ${national25k50k.toFixed(2)}%`,
      fill: lightBorderColor,
    },
    {
      x: xValues._50k75k,
      y: ind50k75k,
      tooltipContent: `Industry: ${ind50k75k.toFixed(2)}%<br />Country: ${national50k75k.toFixed(2)}%`,
      fill: lightBorderColor,
    },
    {
      x: xValues._75k100k,
      y: ind75k100k,
      tooltipContent: `Industry: ${ind75k100k.toFixed(2)}%<br />Country: ${national75k100k.toFixed(2)}%`,
      fill: lightBorderColor,
    },
    {
      x: xValues._100kUp,
      y: ind100kUp,
      tooltipContent: `Industry: ${ind100kUp.toFixed(2)}%<br />Country: ${national100kUp.toFixed(2)}%`,
      fill: lightBorderColor,
    },
  ];

  const countryData: BarChartDatum[] = [
    {
      x: xValues._010k,
      y: national010k,
      tooltipContent: `Industry: ${ind010k.toFixed(2)}%<br />Country: ${national010k.toFixed(2)}%`,
      fill: 'rgba(0, 0, 0, 0)',
      stroke: colorScheme.quaternary,
    },
    {
      x: xValues._10k25k,
      y: national10k25k,
      tooltipContent: `Industry: ${ind10k25k.toFixed(2)}%<br />Country: ${national10k25k.toFixed(2)}%`,
      fill: 'rgba(0, 0, 0, 0)',
      stroke: colorScheme.quaternary,
    },
    {
      x: xValues._25k50k,
      y: national25k50k,
      tooltipContent: `Industry: ${ind25k50k.toFixed(2)}%<br />Country: ${national25k50k.toFixed(2)}%`,
      fill: 'rgba(0, 0, 0, 0)',
      stroke: colorScheme.quaternary,
    },
    {
      x: xValues._50k75k,
      y: national50k75k,
      tooltipContent: `Industry: ${ind50k75k.toFixed(2)}%<br />Country: ${national50k75k.toFixed(2)}%`,
      fill: 'rgba(0, 0, 0, 0)',
      stroke: colorScheme.quaternary,
    },
    {
      x: xValues._75k100k,
      y: national75k100k,
      tooltipContent: `Industry: ${ind75k100k.toFixed(2)}%<br />Country: ${national75k100k.toFixed(2)}%`,
      fill: 'rgba(0, 0, 0, 0)',
      stroke: colorScheme.quaternary,
    },
    {
      x: xValues._100kUp,
      y: national100kUp,
      tooltipContent: `Industry: ${ind100kUp.toFixed(2)}%<br />Country: ${national100kUp.toFixed(2)}%`,
      fill: 'rgba(0, 0, 0, 0)',
      stroke: colorScheme.quaternary,
    },
  ];
  return [
    industryData,
    countryData,
  ];

};
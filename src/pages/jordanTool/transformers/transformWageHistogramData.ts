import {
  WageHistogramConnection,
  WageHistogramFacet,
} from '../graphql/graphQLTypes';
import {colorScheme} from '../fetchData';
import { BarChartDatum } from 'react-fast-charts';
import {lightBorderColor} from '../../../styling/styleUtils';

enum WageHistogramXValues {
  range0100 = '0-100',
  range100200 = '100-200',
  range200300 = '200-300',
  range300400 = '300-400',
  range400500 = '400-500',
  range500600 = '500-600',
  range600Plus = '600+',
}

export default (wageHistogramEdges: WageHistogramConnection['edges']) => {
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
        x: WageHistogramXValues.range0100,
        y: industryrange0100,
        tooltipContent: `Industry: ${industryrange0100}%<br />Country: ${countryrange0100}%`,
        fill: lightBorderColor,
      },
      {
        x: WageHistogramXValues.range100200,
        y: industryrange100200,
        tooltipContent: `Industry: ${industryrange100200}%<br />Country: ${countryrange100200}%`,
        fill: lightBorderColor,
      },
      {
        x: WageHistogramXValues.range200300,
        y: industryrange200300,
        tooltipContent: `Industry: ${industryrange200300}%<br />Country: ${countryrange200300}%`,
        fill: lightBorderColor,
      },
      {
        x: WageHistogramXValues.range300400,
        y: industryrange300400,
        tooltipContent: `Industry: ${industryrange300400}%<br />Country: ${countryrange300400}%`,
        fill: lightBorderColor,
      },
      {
        x: WageHistogramXValues.range400500,
        y: industryrange400500,
        tooltipContent: `Industry: ${industryrange400500}%<br />Country: ${countryrange400500}%`,
        fill: lightBorderColor,
      },
      {
        x: WageHistogramXValues.range500600,
        y: industryrange500600,
        tooltipContent: `Industry: ${industryrange500600}%<br />Country: ${countryrange500600}%`,
        fill: lightBorderColor,
      },
      {
        x: WageHistogramXValues.range600Plus,
        y: industryrange600Up,
        tooltipContent: `Industry: ${industryrange600Up}%<br />Country: ${countryrange600Up}%`,
        fill: lightBorderColor,
      },
    ];

    const countryData: BarChartDatum[] = [
      {
        x: WageHistogramXValues.range0100,
        y: countryrange0100,
        tooltipContent: `Industry: ${industryrange0100}%<br />Country: ${countryrange0100}%`,
        fill: 'rgba(0, 0, 0, 0)',
        stroke: colorScheme.primary,
      },
      {
        x: WageHistogramXValues.range100200,
        y: countryrange100200,
        tooltipContent: `Industry: ${industryrange100200}%<br />Country: ${countryrange100200}%`,
        fill: 'rgba(0, 0, 0, 0)',
        stroke: colorScheme.primary,
      },
      {
        x: WageHistogramXValues.range200300,
        y: countryrange200300,
        tooltipContent: `Industry: ${industryrange200300}%<br />Country: ${countryrange200300}%`,
        fill: 'rgba(0, 0, 0, 0)',
        stroke: colorScheme.primary,
      },
      {
        x: WageHistogramXValues.range300400,
        y: countryrange300400,
        tooltipContent: `Industry: ${industryrange300400}%<br />Country: ${countryrange300400}%`,
        fill: 'rgba(0, 0, 0, 0)',
        stroke: colorScheme.primary,
      },
      {
        x: WageHistogramXValues.range400500,
        y: countryrange400500,
        tooltipContent: `Industry: ${industryrange400500}%<br />Country: ${countryrange400500}%`,
        fill: 'rgba(0, 0, 0, 0)',
        stroke: colorScheme.primary,
      },
      {
        x: WageHistogramXValues.range500600,
        y: countryrange500600,
        tooltipContent: `Industry: ${industryrange500600}%<br />Country: ${countryrange500600}%`,
        fill: 'rgba(0, 0, 0, 0)',
        stroke: colorScheme.primary,
      },
      {
        x: WageHistogramXValues.range600Plus,
        y: countryrange600Up,
        tooltipContent: `Industry: ${industryrange600Up}%<br />Country: ${countryrange600Up}%`,
        fill: 'rgba(0, 0, 0, 0)',
        stroke: colorScheme.primary,
      },
    ];
    wageHistogramData.push(industryData);
    wageHistogramData.push(countryData);
  }
  return wageHistogramData;
};
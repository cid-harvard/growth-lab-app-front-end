import {
  OverTimeHistogramConnection,
  OverTimeTarget,
} from '../graphql/graphQLTypes';
import {colorScheme} from '../fetchData';
import { formatNumber, BarChartDatum } from 'react-fast-charts';
import {lightBorderColor} from '../../../styling/styleUtils';

enum OverTimeHistogramXValues {
  years20042006 = '2004-2006',
  years20072009 = '2007-2009',
  years20102012 = '2010-2012',
  years20132015 = '2013-2015',
  years20162018 = '2016-2018',
}

export default (overTimeHistogramEdges: OverTimeHistogramConnection['edges']) => {
  const overTimeHistogramData: BarChartDatum[][] = [];
  let overTimeHistogramCsvData: object[] = [];
  const menaData = overTimeHistogramEdges.find(e => e && e.node && e.node.variable === OverTimeTarget.Mena);
  const globalData = overTimeHistogramEdges.find(e => e && e.node && e.node.variable === OverTimeTarget.Global);
  const multiplier = 1000000;
  if (menaData !== null && menaData !== undefined && menaData.node !== null &&
      globalData !== null && globalData !== undefined && globalData.node !== null) {
    const menaYears20042006 = menaData.node.years20042006 !== null
      ? menaData.node.years20042006 * multiplier : 0;
    const menaYears20072009 = menaData.node.years20072009 !== null
      ? menaData.node.years20072009 * multiplier : 0;
    const menaYears20102012 = menaData.node.years20102012 !== null
      ? menaData.node.years20102012 * multiplier : 0;
    const menaYears20132015 = menaData.node.years20132015 !== null
      ? menaData.node.years20132015 * multiplier : 0;
    const menaYears20162018 = menaData.node.years20162018 !== null
      ? menaData.node.years20162018 * multiplier : 0;
    const globalYears20042006 = globalData.node.years20042006 !== null
      ? globalData.node.years20042006 * multiplier : 0;
    const globalYears20072009 = globalData.node.years20072009 !== null
      ? globalData.node.years20072009 * multiplier : 0;
    const globalYears20102012 = globalData.node.years20102012 !== null
      ? globalData.node.years20102012 * multiplier : 0;
    const globalYears20132015 = globalData.node.years20132015 !== null
      ? globalData.node.years20132015 * multiplier : 0;
    const globalYears20162018 = globalData.node.years20162018 !== null
      ? globalData.node.years20162018 * multiplier : 0;

    const menaBarChartData: BarChartDatum[] = [
      {
        x: OverTimeHistogramXValues.years20042006,
        y: menaYears20042006,
        tooltipContent:
          `Industry: $${formatNumber(menaYears20042006)}
           <br />Country: $${formatNumber(globalYears20042006)}`,
        fill: lightBorderColor,
      },
      {
        x: OverTimeHistogramXValues.years20072009,
        y: menaYears20072009,
        tooltipContent:
          `Industry: $${formatNumber(menaYears20072009)}
           <br />Country: $${formatNumber(globalYears20072009)}`,
        fill: lightBorderColor,
      },
      {
        x: OverTimeHistogramXValues.years20102012,
        y: menaYears20102012,
        tooltipContent:
          `Industry: $${formatNumber(menaYears20102012)}
           <br />Country: $${formatNumber(globalYears20102012)}`,
        fill: lightBorderColor,
      },
      {
        x: OverTimeHistogramXValues.years20132015,
        y: menaYears20132015,
        tooltipContent:
          `Industry: $${formatNumber(menaYears20132015)}
           <br />Country: $${formatNumber(globalYears20132015)}`,
        fill: lightBorderColor,
      },
      {
        x: OverTimeHistogramXValues.years20162018,
        y: menaYears20162018,
        tooltipContent:
          `Industry: $${formatNumber(menaYears20162018)}
           <br />Country: $${formatNumber(globalYears20162018)}`,
        fill: lightBorderColor,
      },
    ];

    const globalBarChartData: BarChartDatum[] = [
      {
        x: OverTimeHistogramXValues.years20042006,
        y: globalYears20042006,
        tooltipContent:
          `Industry: $${formatNumber(menaYears20042006)}
           <br />Country: $${formatNumber(globalYears20042006)}`,
        fill: colorScheme.primary,
      },
      {
        x: OverTimeHistogramXValues.years20072009,
        y: globalYears20072009,
        tooltipContent:
          `Industry: $${formatNumber(menaYears20072009)}
           <br />Country: $${formatNumber(globalYears20072009)}`,
        fill: colorScheme.primary,
      },
      {
        x: OverTimeHistogramXValues.years20102012,
        y: globalYears20102012,
        tooltipContent:
          `Industry: $${formatNumber(menaYears20102012)}
           <br />Country: $${formatNumber(globalYears20102012)}`,
        fill: colorScheme.primary,
      },
      {
        x: OverTimeHistogramXValues.years20132015,
        y: globalYears20132015,
        tooltipContent:
          `Industry: $${formatNumber(menaYears20132015)}
           <br />Country: $${formatNumber(globalYears20132015)}`,
        fill: colorScheme.primary,
      },
      {
        x: OverTimeHistogramXValues.years20162018,
        y: globalYears20162018,
        tooltipContent:
          `Industry: $${formatNumber(menaYears20162018)}
           <br />Country: $${formatNumber(globalYears20162018)}`,
        fill: colorScheme.primary,
      },
    ];
    overTimeHistogramData.push(menaBarChartData);
    overTimeHistogramData.push(globalBarChartData);
    overTimeHistogramCsvData = [
      {
        'For': 'MENA',
        '2004-2006': menaYears20042006,
        '2007-2009': menaYears20072009,
        '2010-2012': menaYears20102012,
        '2013-2015': menaYears20132015,
        '2016-2018': menaYears20162018,
      },
      {
        'For': 'Global',
        '2004-2006': globalYears20042006,
        '2007-2009': globalYears20072009,
        '2010-2012': globalYears20102012,
        '2013-2015': globalYears20132015,
        '2016-2018': globalYears20162018,
      },
    ];
  }
  return {overTimeHistogramData, overTimeHistogramCsvData};
};

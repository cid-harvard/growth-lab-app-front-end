import React from 'react';
import { Datum as RadarChartDatum } from '../../../components/dataViz/radarChart';
import DataViz, {VizType} from '../../../components/dataViz';
import {
    Factors,
} from '../../../graphql/graphQLTypes';
import { colorScheme } from '../Utils';

interface Props {
  industryName: string;
  factors: Factors | null;
}

export default (props: Props) => {
  const {
    industryName, factors,
  } = props;
  if (factors) {
    let attractivenessData: RadarChartDatum[] = [];
    const attractivenessCsvData: any = { 'Industry': industryName };
    if (factors.aWage !== null) {
      attractivenessData.push({ label: 'High Relative\nWages', value: factors.aWage });
      attractivenessCsvData['High Relative Wages'] = factors.aWage;
    }
    if (factors.aYouth !== null) {
      attractivenessData.push({ label: 'High {{SPACE_OR_LINE}}Youth\nEmployment', value: factors.aYouth });
      attractivenessCsvData['High Youth Employment'] = factors.aYouth;
    }
    if (factors.aFdiworld !== null) {
      attractivenessData.push({ label: 'High Global\nFDI Flows', value: factors.aFdiworld });
      attractivenessCsvData['High Global FDI Flows'] = factors.aFdiworld;
    }
    if (factors.aExport !== null) {
      attractivenessData.push({ label: 'High {{SPACE_OR_LINE}}Export\nPropensity', value: factors.aExport });
      attractivenessCsvData['High Export Propensity'] = factors.aExport;
    }
    if (attractivenessData.length === 4) {
      attractivenessData = attractivenessData.map(({label, value}) => ({
        label: label.replace('{{SPACE_OR_LINE}}', '\n'), value,
      }));
    } else {
      attractivenessData = attractivenessData.map(({label, value}) => ({
        label: label.replace('{{SPACE_OR_LINE}}', ' '), value,
      }));
    }
    if (attractivenessData.length > 2) {
      return (
        <DataViz
          id={'albania-attractiveness-radar-chart'}
          vizType={VizType.RadarChart}
          data={[attractivenessData]}
          color={{start: colorScheme.quaternary, end: colorScheme.quaternary}}
          maxValue={10}
          enablePNGDownload={true}
          enableSVGDownload={true}
          chartTitle={'Attractiveness Factors - ' + industryName}
          jsonToDownload={[attractivenessCsvData]}
          key={'albania-attractiveness-radar-chart' + industryName}
        />
      );
    } else {
      return (
        <DataViz
          id={'albania-attractiveness-radar-chart'}
          vizType={VizType.Error}
          message={'There are not enough data points for this chart'}
        />
      );
    }
  } else {
    return null;
  }
};
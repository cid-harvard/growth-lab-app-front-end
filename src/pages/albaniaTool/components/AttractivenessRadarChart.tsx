import React from 'react';
import { Datum as RadarChartDatum } from '../../../components/dataViz/radarChart';
import DataViz, {VizType} from '../../../components/dataViz';
import {
    Factors,
    NACEIndustry,
} from '../../../graphql/graphQLTypes';
import { colorScheme } from '../Utils';

interface Props {
  industryName: string;
  naceId: string;
  factors: Factors | null;
  rawNaceData: NACEIndustry[];
}

export default (props: Props) => {
  const {
    industryName, factors, naceId, rawNaceData,
  } = props;
  if (factors) {
    let attractivenessData: RadarChartDatum[] = [];
    const attractivenessCsvData: any = {'3-Digit Industry Name': industryName};
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
    const targetNaceIndustry = rawNaceData.find(node => node && node.naceId === naceId);
    if (targetNaceIndustry) {
      if (targetNaceIndustry.code) {
        attractivenessCsvData['3-Digit Industry NACE Code'] = targetNaceIndustry.code;
      }
      const parentTarget = rawNaceData.find(
        (datum) =>
          targetNaceIndustry.parentId !== null && datum.naceId === targetNaceIndustry.parentId.toString());
      let grandparentTarget: NACEIndustry | undefined;
      if (parentTarget && parentTarget.parentId !== null) {
        grandparentTarget = rawNaceData.find(
          (datum) =>parentTarget.parentId !== null && datum.naceId === parentTarget.parentId.toString());
      } else {
        grandparentTarget = undefined;
      }

      attractivenessCsvData['2-Digit Industry Name'] =
        parentTarget && parentTarget.name !== null ? parentTarget.name : '';
      attractivenessCsvData['2-Digit Industry NACE Code'] =
        parentTarget && parentTarget.code !== null ? parentTarget.code : '';
      attractivenessCsvData['Sector Name'] =
        grandparentTarget && grandparentTarget.name !== null ? grandparentTarget.name : '';
      attractivenessCsvData['Sector NACE Code'] =
        grandparentTarget && grandparentTarget.code !== null? grandparentTarget.code : '';
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
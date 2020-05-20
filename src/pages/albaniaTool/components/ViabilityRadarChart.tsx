import React from 'react';
import { Datum as RadarChartDatum } from '../../../components/dataViz/radarChart';
import DataViz, {VizType} from '../../../components/dataViz';
import {
    Factors,
    NACEIndustry,
} from '../graphql/graphQLTypes';
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
    let viabilityData: RadarChartDatum[] = [];
    const viabilityCsvData: any = { '3-Digit Industry Name': industryName };
    if (factors.vRca !== null) {
      viabilityData.push({ label: 'RCA in Albania', value: factors.vRca });
      viabilityCsvData['RCA in Albania'] = factors.vRca;
    }
    if (factors.vDist !== null) {
      viabilityData.push({ label: 'Low {{SPACE_OR_LINE}}Distance\nto Industry', value: factors.vDist });
      viabilityCsvData['Low Distance to Industry'] = factors.vDist;
    }
    if (factors.vFdipeers !== null) {
      viabilityData.push({ label: 'High FDI to\nPeer Countries', value: factors.vFdipeers });
      viabilityCsvData['High FDI to Peer Countries'] = factors.vFdipeers;
    }
    if (factors.vContracts !== null) {
      viabilityData.push({ label: 'Low Contract\nIntensity', value: factors.vContracts });
      viabilityCsvData['Low Contract Intensity'] = factors.vContracts;
    }
    if (factors.vElect !== null) {
      viabilityData.push({ label: 'High {{SPACE_OR_LINE}}Electricity\nIntensity', value: factors.vElect });
      viabilityCsvData['High Electricity Intensity'] = factors.vElect;
    }
    if (viabilityData.length === 4) {
      viabilityData = viabilityData.map(({label, value}) => ({
        label: label.replace('{{SPACE_OR_LINE}}', '\n'), value,
      }));
    } else {
      viabilityData = viabilityData.map(({label, value}) => ({
        label: label.replace('{{SPACE_OR_LINE}}', ' '), value,
      }));
    }
    const targetNaceIndustry = rawNaceData.find(node => node && node.naceId === naceId);
    if (targetNaceIndustry) {
      if (targetNaceIndustry.code) {
        viabilityCsvData['3-Digit Industry NACE Code'] = targetNaceIndustry.code;
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

      viabilityCsvData['2-Digit Industry Name'] =
        parentTarget && parentTarget.name !== null ? parentTarget.name : '';
      viabilityCsvData['2-Digit Industry NACE Code'] =
        parentTarget && parentTarget.code !== null ? parentTarget.code : '';
      viabilityCsvData['Sector Name'] =
        grandparentTarget && grandparentTarget.name !== null ? grandparentTarget.name : '';
      viabilityCsvData['Sector NACE Code'] =
        grandparentTarget && grandparentTarget.code !== null? grandparentTarget.code : '';
    }
    if (viabilityData.length > 2) {
      return (
        <DataViz
          id={'albania-viability-radar-chart'}
          vizType={VizType.RadarChart}
          data={[viabilityData]}
          color={{start: colorScheme.quaternary, end: colorScheme.quaternary}}
          maxValue={10}
          enablePNGDownload={true}
          enableSVGDownload={true}
          chartTitle={'Viability Factors - ' + industryName}
          jsonToDownload={[viabilityCsvData]}
        />
      );
    } else {
      return (
        <DataViz
          id={'albania-viability-radar-chart'}
          vizType={VizType.Error}
          message={'There are not enough data points for this chart'}
        />
      );
    }
  } else {
    return null;
  }
};
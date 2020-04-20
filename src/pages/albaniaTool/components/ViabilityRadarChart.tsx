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
    let viabilityData: RadarChartDatum[] = [];
    const viabilityCsvData: any = { 'Industry': industryName };
    if (factors.vRca !== null) {
      viabilityData.push({ label: 'RCA in Albania', value: factors.vRca });
      viabilityCsvData['RCA in Albania'] = factors.vRca;
    }
    if (factors.vDist !== null) {
      viabilityData.push({ label: 'Low \0Distance\nto Industry', value: factors.vDist });
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
      viabilityData.push({ label: 'High \0Electricity\nIntensity', value: factors.vElect });
      viabilityCsvData['High Electricity Intensity'] = factors.vElect;
    }
    if (viabilityData.length === 4) {
      viabilityData = viabilityData.map(({label, value}) => ({
        label: label.replace('\0', '\n'), value,
      }));
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
import React from 'react';
import DataViz, {VizType, RadarChartDatum} from 'react-fast-charts';
import {
    Factor,
} from '../graphql/graphQLTypes';
import { colorScheme } from '../Utils';

interface Props {
  industryName: string;
  code: string;
  factors: Factor;
}

export default (props: Props) => {
  const {
    industryName, factors, code,
  } = props;
  if (factors) {
    let viabilityData: RadarChartDatum[] = [];
    const viabilityCsvData: any = { 'Name': industryName, 'Code': code };
    if (factors.fPortPropensity !== null) {
      viabilityData.push({ label: 'Port Propensity', value: parseFloat(factors.fPortPropensity.toFixed(3)) });
      viabilityCsvData['Port Propensity'] = factors.fPortPropensity;
    }
    if (factors.fExistingPresence !== null) {
      viabilityData.push({ label: 'Existing\nPresence', value: parseFloat(factors.fExistingPresence.toFixed(3)) });
      viabilityCsvData['Existing Presence'] = factors.fExistingPresence;
    }
    if (factors.fRemoteness !== null) {
      viabilityData.push({ label: 'Remoteness ', value: parseFloat(factors.fRemoteness.toFixed(3)) });
      viabilityCsvData['Remoteness '] = factors.fRemoteness;
    }
    if (factors.fScarceFactors !== null) {
      viabilityData.push({ label: 'Scarce Factors', value: parseFloat(factors.fScarceFactors.toFixed(3)) });
      viabilityCsvData['Scarce Factors'] = factors.fScarceFactors;
    }
    if (factors.fInputAvailability !== null) {
      viabilityData.push({ label: 'Input\nAvailability', value: parseFloat(factors.fInputAvailability.toFixed(3)) });
      viabilityCsvData['Input Availability'] = factors.fInputAvailability;
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
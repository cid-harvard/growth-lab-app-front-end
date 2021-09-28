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
    const viabilityData: RadarChartDatum[] = [];
    const viabilityCsvData: any = { 'Name': industryName, 'Code': code };
    if (factors.fPortPropensity !== null) {
      viabilityData.push({ label: 'Intensive Use of Strategic Resources', value: parseFloat(factors.fPortPropensity.toFixed(3)) });
      viabilityCsvData['Intensive Use of Strategic Resources'] = factors.fPortPropensity;
    }
    if (factors.fExistingPresence !== null) {
      viabilityData.push({ label: 'Existing\nPresence\nin Namibia', value: parseFloat(factors.fExistingPresence.toFixed(3)) });
      viabilityCsvData['Existing Presence in Namibia'] = factors.fExistingPresence;
    }
    if (factors.fRemoteness !== null) {
      viabilityData.push({ label: 'Likelihood to Thrive\nin Remote Places ', value: parseFloat(factors.fRemoteness.toFixed(3)) });
      viabilityCsvData['Likelihood to Thrive in Remote Places '] = factors.fRemoteness;
    }
    if (factors.fScarceFactors !== null) {
      viabilityData.push({ label: 'Intensive Use\nof Scarce Inputs', value: parseFloat(factors.fScarceFactors.toFixed(3)) });
      viabilityCsvData['Intensive Use of Scarce Inputs'] = factors.fScarceFactors;
    }
    if (factors.fInputAvailability !== null) {
      viabilityData.push({ label: 'Implied\nAvailability\nof Inputs', value: parseFloat(factors.fInputAvailability.toFixed(3)) });
      viabilityCsvData['Implied Availability of Inputs'] = factors.fInputAvailability;
    }

    if (viabilityData.length > 2) {
      return (
        <DataViz
          id={'namibia-feasibility-radar-chart'}
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
          id={'namibia-feasibility-radar-chart'}
          vizType={VizType.Error}
          message={'There are not enough data points for this chart'}
        />
      );
    }
  } else {
    return null;
  }
};
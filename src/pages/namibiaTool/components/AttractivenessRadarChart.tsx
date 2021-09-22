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
    if (factors.aRelativeDemand !== null) {
      viabilityData.push({ label: 'Relative Demand', value: parseFloat(factors.aRelativeDemand.toFixed(3)) });
      viabilityCsvData['Relative Demand'] = factors.aRelativeDemand;
    }
    if (factors.aResiliency !== null) {
      viabilityData.push({ label: 'Resiliency', value: parseFloat(factors.aResiliency.toFixed(3)) });
      viabilityCsvData.Resiliency = factors.aResiliency;
    }
    if (factors.aEmploymentGroupsInterest !== null) {
      viabilityData.push({ label: 'Employment\nGroups Interest', value: parseFloat(factors.aEmploymentGroupsInterest.toFixed(3)) });
      viabilityCsvData['Employment Groups Interest'] = factors.aEmploymentGroupsInterest;
    }
    if (factors.aFdi !== null) {
      viabilityData.push({ label: 'FDI', value: parseFloat(factors.aFdi.toFixed(3)) });
      viabilityCsvData.FDI = factors.aFdi;
    }
    if (factors.aExportPropensity !== null) {
      viabilityData.push({ label: 'Export\nPropensity', value: parseFloat(factors.aExportPropensity.toFixed(3)) });
      viabilityCsvData['Export Propensity'] = factors.aExportPropensity;
    }

    if (viabilityData.length > 2) {
      return (
        <DataViz
          id={'namibia-attractiveness-radar-chart'}
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
          id={'namibia-attractiveness-radar-chart'}
          vizType={VizType.Error}
          message={'There are not enough data points for this chart'}
        />
      );
    }
  } else {
    return null;
  }
};
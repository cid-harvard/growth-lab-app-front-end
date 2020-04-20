import React from 'react';
import DataViz, {VizType} from '../../../components/dataViz';
import {
    FDIMarketOvertimeConnection,
} from '../../../graphql/graphQLTypes';
import transformStackedBarChartData from '../transformers/transformStackedBarChartData';

interface Props {
  selectedIndustry: {label: string, value: string};
  destination: string;
  fdiMarketsOvertimeEdges: FDIMarketOvertimeConnection['edges'];
}

export default (props: Props) => {
  const {
    selectedIndustry, destination, fdiMarketsOvertimeEdges,
  } = props;
  const {
    stackedBarChartData, stackedBarChartCSVData,
  } = transformStackedBarChartData(fdiMarketsOvertimeEdges, selectedIndustry.value);
  const stackedBarChart = stackedBarChartData.length ? (
    <DataViz
      id={'albania-company-bar-chart' + destination}
      vizType={VizType.BarChart}
      data={stackedBarChartData}
      axisLabels={{left: 'Totals by Capex'}}
      enablePNGDownload={true}
      enableSVGDownload={true}
      chartTitle={'Identifying Companies - ' + selectedIndustry.label}
      jsonToDownload={stackedBarChartCSVData}
    />
  ) : (
    <DataViz
      id={'albania-company-bar-chart' + destination}
      vizType={VizType.Error}
      message={'There are not enough data points for this chart'}
    />
  );
  return stackedBarChart;
}
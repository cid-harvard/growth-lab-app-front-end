import React from 'react';
import DataViz, {VizType} from '../../../components/dataViz';
import {
  IndustryNowWageEdge,
} from '../../../graphql/graphQLTypes';
import transformIndustryNowWageData from '../transformers/transformIndustryNowWageData';

interface Props {
  industryWageEdge: IndustryNowWageEdge | null;
}

export default (props: Props) => {
  const { industryWageEdge } = props;
  if (industryWageEdge === null || industryWageEdge.node === null) {
    return (
      <DataViz
        id={'albania-industry-wages-bar-chart'}
        vizType={VizType.Error}
        message={'There are not enough data points for this chart'}
      />
    );
  }
  const tableData = transformIndustryNowWageData(industryWageEdge.node);
  return (
    <DataViz
      id={'albania-industry-wages-bar-chart'}
      vizType={VizType.BarChart}
      data={tableData}
      axisLabels={{left: 'Percentage of Workers', bottom: 'Industry Wages'}}
    />
  );
};

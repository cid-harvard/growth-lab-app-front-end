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
  if (
    industryWageEdge === null ||
    industryWageEdge.node === null ||
    (
      !industryWageEdge.node.ind010k &&
      !industryWageEdge.node.ind10k25k &&
      !industryWageEdge.node.ind25k50k &&
      !industryWageEdge.node.ind50k75k &&
      !industryWageEdge.node.ind75k100k &&
      !industryWageEdge.node.ind100kUp &&
      !industryWageEdge.node.national010k &&
      !industryWageEdge.node.national10k25k &&
      !industryWageEdge.node.national25k50k &&
      !industryWageEdge.node.national50k75k &&
      !industryWageEdge.node.national75k100k &&
      !industryWageEdge.node.national100kUp
      )
    ) {
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
      axisLabels={{left: 'Percentage of Workers', bottom: 'Industry Wages (Lek/Month)'}}
    />
  );
};

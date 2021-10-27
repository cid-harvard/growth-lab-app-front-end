import React from 'react';
import {
  TwoColumnSection,
  SectionHeaderSecondary,
} from '../../../styling/styleUtils';
import {
  colorScheme,
  useProductClass,
  ProductClass,
} from '../Utils';
import DataViz, {
  VizType,
} from 'react-fast-charts';
import DynamicTable, {Column, Datum, Align} from '../../../components/text/DynamicTable';

export interface TableDatum extends Datum {
  occupation: string;
  percent: string;
}

interface Props {
  sharedData: TableDatum[];
  missingData: TableDatum[];
}

const SharedAndMissingOccupations = (props: Props) => {
  const {sharedData, missingData} = props;
  const sharedColumns: Column[] = [
    { label: 'Relatively Present Occupations', key: 'occupation'},
    { label: 'Employment Shares', key: 'percent', align: Align.Center},
  ];
  const missingColumns: Column[] = [
    { label: 'Relatively Underrepresented Occupations', key: 'occupation'},
    { label: 'Employment Shares', key: 'percent', align: Align.Center },
  ];
  const productClass = useProductClass();
  const productOrIndustry = productClass === ProductClass.HS ? 'product' : 'industry';
  const productOrIndustryPlural = productClass === ProductClass.HS ? 'products' : 'industries';
  const sharedTable = sharedData.length ? (
    <DynamicTable
      columns={sharedColumns}
      data={sharedData}
      color={colorScheme.quaternary}
    />
  ) : (
    <DataViz
      id={'namibia-missing-shared-table'}
      vizType={VizType.Error}
      message={'There are not enough data points for this chart'}
    />
  );
  const missingTable = missingData.length ? (
    <DynamicTable
      columns={missingColumns}
      data={missingData}
      color={colorScheme.quaternary}
    />
  ) : (
    <DataViz
      id={'namibia-missing-missing-table'}
      vizType={VizType.Error}
      message={'There are not enough data points for this chart'}
    />
  );
  return (
    <>
      <SectionHeaderSecondary color={colorScheme.quaternary}>Availability of Occupations</SectionHeaderSecondary>
      <p>The tables below display two lists of occupations: the first table shows the top 10 occupations associated with the production of this {productOrIndustry} that are relatively present in Namibia or are present in the production of {productOrIndustryPlural} that serve as inputs to it; the second table shows the top 10 occupations associated with the production of this {productOrIndustry} that are relatively underrepresented in Namibia or with respect to the production of inputs to the {productOrIndustry}. Each list is ranked by the share of overall employment in that {productOrIndustry} that each occupation represents. Occupations with small shares represent small proportions of overall employment in that {productOrIndustry}.</p>
      <TwoColumnSection>
        {sharedTable}
        {missingTable}
      </TwoColumnSection>
    </>
  );
};

export default SharedAndMissingOccupations;

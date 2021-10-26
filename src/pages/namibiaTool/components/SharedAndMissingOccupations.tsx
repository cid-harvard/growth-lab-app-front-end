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
    { label: 'Existing Occupations', key: 'occupation'},
    { label: 'Share of Employment', key: 'percent', align: Align.Center},
  ];
  const missingColumns: Column[] = [
    { label: 'Missing Occupations', key: 'occupation'},
    { label: 'Share of Employment', key: 'percent', align: Align.Center },
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
      <SectionHeaderSecondary color={colorScheme.quaternary}>Shared And Missing Occupations</SectionHeaderSecondary>
        <p>The tables below display the top 10 existing and missing occupations present in Namibia that are associated with the {productOrIndustryPlural} or other inputs used in the production of the {productOrIndustry}. Occupations related to this activity are ranked by those that comprise the biggest share of occupations in the activity and the tables show the top 10 for those occupations that exist and those that are missing in Namibia for this {productOrIndustry}.</p>
      <TwoColumnSection>
        {sharedTable}
        {missingTable}
      </TwoColumnSection>
    </>
  );
};

export default SharedAndMissingOccupations;

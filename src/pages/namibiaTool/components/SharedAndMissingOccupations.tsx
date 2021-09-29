import React from 'react';
import {
  TwoColumnSection,
  SectionHeaderSecondary,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import {colorScheme} from '../Utils';
import DataViz, {
  VizType,
} from 'react-fast-charts';
import DynamicTable, {Column, Datum} from '../../../components/text/DynamicTable';

export interface MissingSharedDatum extends Datum {
  shared: string | null;
  missing: string | null;
}

interface Props {
  data: MissingSharedDatum[];
}

const SharedAndMissingOccupations = (props: Props) => {
  const {data} = props;
  const columns: Column[] = [
    {label: 'Existing Occuptions', key: 'shared'},
    {label: 'Missing Occuptions', key: 'missing'},
  ];

  const table = data.length ? (
    <DynamicTable
      columns={columns}
      data={data}
      color={colorScheme.quaternary}
    />
  ) : (
    <DataViz
      id={'namibia-missing-shared-table'}
      vizType={VizType.Error}
      message={'There are not enough data points for this chart'}
    />
  );
  return (
    <>
      <SectionHeaderSecondary color={colorScheme.quaternary}>Shared And Missing Occupations</SectionHeaderSecondary>
      <TwoColumnSection>
        {table}
        <TextBlock>
          <div>
            <p>The table to the left displays the top 10 existing and missing occupations present in Namibia that are associated with the products or other inputs used in the production of the product. Occupations related to this activity are ranked by those that comprise the biggest share of occupations in the activity and the table shows the top 10 for those occupations that exist and those that are missing in Namibia for this product.</p>
          </div>
        </TextBlock>
      </TwoColumnSection>
    </>
  );
};

export default SharedAndMissingOccupations;
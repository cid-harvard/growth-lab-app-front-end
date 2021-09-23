import React from 'react';
import {
  SectionHeader,
  TwoColumnSection,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import DynamicTable, {Column, Datum} from '../../../components/text/DynamicTable';
import {
  colorScheme,
  ProductClass,
} from '../Utils';
import DataViz, {VizType} from 'react-fast-charts';

export interface ProximityDatum extends Datum {
  name: string;
  proximity: number;
  rank: number;
}

interface Props {
  productClass: ProductClass;
  data: ProximityDatum[];
}

const NearbyIndustries = (props: Props) => {
  const {productClass, data} = props;
  const columns: Column[] = [
    {label: 'Rank', key: 'rank'},
    {label: productClass === ProductClass.HS ? 'Product' : 'Industry', key: 'name'},
    {label: 'Proximity', key: 'proximity'},
  ];

  const table = data.length ? (
    <DynamicTable
      columns={columns}
      data={data}
      color={colorScheme.quaternary}
    />
  ) : (
    <DataViz
      id={'namibia-proximity-table'}
      vizType={VizType.Error}
      message={'There are not enough data points for this chart'}
    />
  );

  return (
    <>
      <div id={'nearby-industries'}>
        <SectionHeader>Nearby Industries</SectionHeader>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <TwoColumnSection>
          {table}
          <TextBlock>
            <div>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </div>
          </TextBlock>
        </TwoColumnSection>
      </div>
    </>
  );
};

export default NearbyIndustries;

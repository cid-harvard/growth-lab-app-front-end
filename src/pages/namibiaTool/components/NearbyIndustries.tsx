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
      </div>
      <TwoColumnSection>
        {table}
        <TextBlock>
          <div>
            <p>This table shows the “nearest” 10 products to {'<<description>>'} based on shared knowhow and capabilities and indicates whether or not Namibia currently has a revealed comparative advantage in those products. In order to explore any of these related products, please use the search bar at the top of this page.</p>
          </div>
        </TextBlock>
      </TwoColumnSection>
    </>
  );
};

export default NearbyIndustries;

import React from 'react';
import {
  SectionHeader,
} from '../../../styling/styleUtils';
import GeoMap, {Datum} from './GeoMap';
import SharedAndMissingOccupations, {MissingSharedDatum} from './SharedAndMissingOccupations';
import GroupsOfInterest, {BarDatum} from './GroupsOfInterest';

interface Props {
  heatMapData: Datum[];
  barData: BarDatum[];
  sharedMissingData: MissingSharedDatum[];
}

const IndustryNow = (props: Props) => {
  const {heatMapData, barData, sharedMissingData} = props;
  return (
    <>
      <div id={'industry-now'}>
        <SectionHeader>Industry Now</SectionHeader>
        <p>
          This section provides more information on the current presence of {'<<description>>'} in Namibia, including: the demand and market for this product in the region, the occupations that are present and missing in Namibia that are related to the product, and the employment of certain groups of interest within this product. Where data limitations do not allow for a description of this specific product, the information reflects the broader product classification of {'<<parent>>'}.
        </p>
      </div>
      <GeoMap
        heatMapData={heatMapData}
      />
      <SharedAndMissingOccupations
        data={sharedMissingData}
      />
      <GroupsOfInterest
        barData={barData}
      />
    </>
  );
};

export default IndustryNow;

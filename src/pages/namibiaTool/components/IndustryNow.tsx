import React from 'react';
import {
  SectionHeader,
} from '../../../styling/styleUtils';
import GeoMap, {Datum} from './GeoMap';
import SharedAndMissingOccupations from './SharedAndMissingOccupations';
import GroupsOfInterest, {BarDatum} from './GroupsOfInterest';

interface Props {
  heatMapData: Datum[];
  barData: BarDatum[];
}

const IndustryNow = (props: Props) => {
  const {heatMapData, barData} = props;
  return (
    <>
      <div id={'industry-now'}>
        <SectionHeader>Industry Now</SectionHeader>
      </div>
      <SharedAndMissingOccupations />
      <GroupsOfInterest
        barData={barData}
      />
      <GeoMap
        heatMapData={heatMapData}
      />
    </>
  );
};

export default IndustryNow;

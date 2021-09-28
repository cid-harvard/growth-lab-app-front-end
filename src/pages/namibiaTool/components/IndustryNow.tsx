import React from 'react';
import {
  SectionHeader,
} from '../../../styling/styleUtils';
import GeoMap, {Datum} from './GeoMap';
import SharedAndMissingOccupations from './SharedAndMissingOccupations';
import GroupsOfInterest from './GroupsOfInterest';

interface Props {
  heatMapData: Datum[];
}

const IndustryNow = (props: Props) => {
  const {heatMapData} = props;
  return (
    <>
      <div id={'industry-now'}>
        <SectionHeader>Industry Now</SectionHeader>
      </div>
      <SharedAndMissingOccupations />
      <GroupsOfInterest />
      <GeoMap
        heatMapData={heatMapData}
      />
    </>
  );
};

export default IndustryNow;

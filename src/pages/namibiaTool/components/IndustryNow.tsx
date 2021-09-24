import React from 'react';
import {
  SectionHeader,
} from '../../../styling/styleUtils';
import GeoMap, {Datum} from './GeoMap';

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
      <GeoMap
        heatMapData={heatMapData}
      />
    </>
  );
};

export default IndustryNow;

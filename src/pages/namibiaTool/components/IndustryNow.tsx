import React from 'react';
import {
  SectionHeader,
} from '../../../styling/styleUtils';
import GeoMap from './GeoMap';

const IndustryNow = () => {
  return (
    <>
      <div id={'industry-now'}>
        <SectionHeader>Industry Now</SectionHeader>
      </div>
      <GeoMap
      />
    </>
  );
};

export default IndustryNow;

import DefaultMap from '../../../components/mapbox';
import React from 'react';
import { albaniaBounds } from './PrimaryMap';

const MapboxMap = () => {
  return (
    <DefaultMap
      allowPan={false}
      allowZoom={false}
      fitBounds={albaniaBounds}
    />
  );
};

export default MapboxMap;

import DefaultMap from '../../../components/mapbox';
import React from 'react';
import { euBounds } from './PrimaryMap';

const MapboxMap = () => {
  return (
    <DefaultMap
      allowPan={false}
      allowZoom={false}
      fitBounds={euBounds}
    />
  );
};

export default MapboxMap;

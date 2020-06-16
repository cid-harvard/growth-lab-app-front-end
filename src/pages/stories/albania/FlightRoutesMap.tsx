import DefaultMap, {Coordinate} from '../../../components/mapbox';
import React from 'react';

const euZoomedCoordinates: [Coordinate, Coordinate] = [[-7.1631, 62.6338], [28.5645, 38.6512]];

const MapboxMap = () => {
  return (
    <DefaultMap
      allowPan={false}
      allowZoom={false}
      fitBounds={euZoomedCoordinates}
    />
  );
};

export default MapboxMap;

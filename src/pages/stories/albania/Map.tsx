import DefaultMap, {Coordinate} from '../../../components/mapbox';
import React from 'react';

const albaniaBounds: [Coordinate, Coordinate] = [[18.5394, 42.8236], [21.4508, 39.4277]];
const euBounds: [Coordinate, Coordinate] = [[-30.7617, 75.8021], [48.8672, 32.6949]];

interface Props {
  section: number | null;
}

const MapboxMap = (props: Props) => {
  const {section} = props;
  let fitBounds: [Coordinate, Coordinate];
  if (section === 8) {
    fitBounds = euBounds;
  } else {
    fitBounds = albaniaBounds;
  }
  return (
    <DefaultMap
      allowPan={false}
      allowZoom={false}
      fitBounds={fitBounds}
    />
  );
};

export default MapboxMap;

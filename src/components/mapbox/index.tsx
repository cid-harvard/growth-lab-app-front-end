import ReactMapboxGl, {
  MapContext,
} from 'react-mapbox-gl';
import React from 'react';
import SettingsComponent, {Settings} from './MapSettingsComponent';

const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ? process.env.REACT_APP_MAPBOX_ACCESS_TOKEN : '';

const Mapbox = ReactMapboxGl({
  accessToken,
  maxZoom: 16,
  scrollZoom: false,
  dragPan: false,
  dragRotate: false,
  doubleClickZoom: false,
});

type Latitude = number;
type Longitude = number;
export type Coordinate = [Longitude, Latitude];

interface Props extends Settings {
  children?: React.ReactElement<any>;
  center?: Coordinate;
  zoom?: [number];
  maxBounds?: [Coordinate, Coordinate];
  fitBounds?: [Coordinate, Coordinate];
}

const DefaultMap = (props: Props) => {
  const {
    children, center, zoom,
    maxBounds, fitBounds,
    ...settings
  } = props;

  const mapRenderProps = (mapEl: any) => {
    return (
      <SettingsComponent
        map={mapEl}
        {...settings}
      />
    );
  };

  return (
    <Mapbox
      // eslint-disable-next-line
      style={'mapbox://styles/wsoeltz/ck41nop7o0t7d1cqdtokuavwk'}
      containerStyle={{
        height: '100%',
        width: '100%',
      }}
      center={center}
      zoom={zoom}
      maxBounds={maxBounds}
      fitBounds={fitBounds}
    >
      {children}
      <MapContext.Consumer children={mapRenderProps} />
    </Mapbox>
  );
};

export default DefaultMap;

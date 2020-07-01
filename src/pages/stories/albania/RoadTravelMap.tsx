import DefaultMap, {Coordinate} from '../../../components/mapbox';
import React from 'react';
import { albaniaBounds } from './PrimaryMap';
import raw from 'raw.macro';
import {
  Feature,
  Layer,
} from 'react-mapbox-gl';
import {scaleLinear} from 'd3-scale';

const colorScale = scaleLinear<string>()
                    .domain([-0.417, 0, 0.34])
                    .range(['forestgreen', 'yellow', 'red']);

interface RawDatum {
  'Origin': string;
  'Destination': string;
  'Time': number;
  'Path ID': 1 | 2;
  'Path': string;
  'Lat': number;
  'Long': number;
}
const rawData: RawDatum[] = JSON.parse(raw('./data/travel_times.json'));

interface LineDatum {
  id: string;
  origin: string;
  destination: string;
  time: number;
  coordinates: [Coordinate, Coordinate];
}
const lines: LineDatum[] = [];
rawData.forEach(o => {
  if (o['Path ID'] === 1) {
    const d = rawData.find(dest => dest.Path === o.Path && dest['Path ID'] === 2);
    if (d) {
      lines.push({
        id: o.Path,
        origin: o.Origin,
        destination: o.Destination,
        time: o.Time,
        coordinates: [
          [o.Long, o.Lat],
          [d.Long, d.Lat],
        ],
      });
    }
  }
});

const MapboxMap = () => {
  const lineFeatures: React.ReactElement[] = [];
  const circleFeatures: React.ReactElement[] = [];
  const textFeatures: React.ReactElement[] = [
    (
      <Feature
        key={'text travel times tirana'}
        coordinates={[lines[0].coordinates[0][0] + 0.25, lines[0].coordinates[0][1] + 0.2]}
        properties={{
          'text-field': lines[0].origin,
        }}
      />
    ),
  ];
  lines.forEach(({id, coordinates, time, destination}) => {
    lineFeatures.push(
      <Feature
        key={'line travel times ' + id}
        coordinates={coordinates}
        properties={{
          'line-color': colorScale(time),
        }}
      />,
    );
    circleFeatures.push(
      <Feature
        key={'circle travel times ' + id}
        coordinates={coordinates[1]}
        properties={{
          'circle-color': colorScale(time),
        }}
      />,
    );
    textFeatures.push(
      <Feature
        key={'text travel times ' + id}
        coordinates={coordinates[1]}
        properties={{
          'text-field': destination,
        }}
      />,
    );
  });

  return (
    <DefaultMap
      allowPan={false}
      allowZoom={false}
      fitBounds={albaniaBounds}
    >
      <>
        <Layer
         type='line'
         id={'travel-times-feature-lines'}
         key={'travel-times-feature-lines'}
         layout={{ 'line-cap': 'round', 'line-join': 'round' }}
         paint={{ 'line-color': ['get', 'line-color'], 'line-width': 3}}
       >
          {lineFeatures}
        </Layer>
        <Layer
         type='circle'
         id={'travel-times-feature-circles'}
         key={'travel-times-feature-circles'}
         paint={{
            'circle-color': ['get', 'circle-color'],
            'circle-radius': {
              base: 5,
              stops: [
                [1, 7],
                [10, 10],
              ],
            },
          }}
        >
          {circleFeatures}
        </Layer>
        <Layer
         type='symbol'
         id={'travel-times-feature-text'}
         key={'travel-times-feature-text'}
          layout={{
            'text-field': ['get', 'text-field'],
            'text-size': 11,
            'text-letter-spacing': 0.05,
            'text-offset': [0, 2],
            'text-allow-overlap': true,
          }}
        >
          {textFeatures}
        </Layer>
      </>
    </DefaultMap>
  );
};

export default MapboxMap;

import DefaultMap, {Coordinate} from '../../../components/mapbox';
import React from 'react';
import raw from 'raw.macro';
import {
  Feature,
  Layer,
} from 'react-mapbox-gl';
import styled from 'styled-components/macro';
import {
  secondaryFont,
} from '../../../styling/styleUtils';

const Root = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 1rem;
  height: 100%;
`;

const Column = styled.div`
  position: relative;
`;
const YearTitle = styled.div`
  position: absolute;
  top: 0.5rem;
  margin: auto;
  z-index: 10;
  font-family: ${secondaryFont};
  font-size: 2rem;
`;

interface RawDatum {
  year: 2017 | 2019;
  path_id: string;
  new: 0 | 1;
  type: 'Origin' | 'Destination';
  code: string;
  airport: string;
  city: string;
  country: string;
  lat: number;
  long: number;
}
const rawData: RawDatum[] = JSON.parse(raw('./data/flight_destinations_data.json'));

interface LineDatum {
  id: string;
  origin: string;
  destination: string;
  year: 2017 | 2019;
  coordinates: [Coordinate, Coordinate];
}
const lines: LineDatum[] = [];
rawData.forEach(o => {
  if (o.type === 'Origin') {
    const d = rawData.find(dest => dest.path_id === o.path_id && dest.type === 'Destination');
    if (d && d.lat && d.long && o.lat && o.long && !(o.new === 0 && o.year === 2019)) {
      lines.push({
        id: o.path_id,
        origin: o.city,
        destination: d.city,
        year: o.year,
        coordinates: [
          [o.long, o.lat],
          [d.long, d.lat],
        ],
      });
    }
  }
});

const euZoomedCoordinates: [Coordinate, Coordinate] = [[-7.1631, 62.6338], [30.5645, 38.6512]];
const MapboxMap = () => {
  const lineFeatures_2017: React.ReactElement[] = [];
  const circleFeatures_2017: React.ReactElement[] = [];
  const lineFeatures_2019: React.ReactElement[] = [];
  const circleFeatures_2019: React.ReactElement[] = [];
  lines.forEach(({id, coordinates, year}) => {
    const lineArr = year === 2017 ? lineFeatures_2017 : lineFeatures_2019;
    const circleArr = year === 2017 ? circleFeatures_2017 : circleFeatures_2019;
    lineArr.push(
      <Feature
        key={'line flight paths ' + id + year}
        coordinates={coordinates}
        properties={{
          'line-color': year === 2017 ? '#346bbf' : '#c73000',
        }}
      />,
    );
    circleArr.push(
      <Feature
        key={'circle flight paths ' + id + year}
        coordinates={coordinates[1]}
        properties={{
          'circle-color': year === 2017 ? '#346bbf' : '#c73000',
        }}
      />,
    );
  });


  return (
    <Root>
      <Column>
        <YearTitle style={{left: '0.7rem'}}>2017</YearTitle>
        <DefaultMap
          allowPan={false}
          allowZoom={false}
          fitBounds={euZoomedCoordinates}
        >
          <>
            <Layer
             type='line'
             id={'flight-paths-feature-lines-2017'}
             key={'flight-paths-feature-lines-2017'}
             layout={{ 'line-cap': 'round', 'line-join': 'round' }}
             paint={{ 'line-color': ['get', 'line-color'], 'line-width': 2}}
           >
              {lineFeatures_2017}
            </Layer>
            <Layer
             type='circle'
             id={'flight-paths-feature-circles-2017'}
             key={'flight-paths-feature-circles-2017'}
             paint={{
                'circle-color': ['get', 'circle-color'],
                'circle-radius': {
                  base: 3,
                  stops: [
                    [1, 3],
                    [10, 3],
                  ],
                },
              }}
            >
              {circleFeatures_2017}
            </Layer>
          </>
        </DefaultMap>
      </Column>
      <Column>
        <YearTitle style={{right: '0.7rem'}}>2019</YearTitle>
        <DefaultMap
          allowPan={false}
          allowZoom={false}
          fitBounds={euZoomedCoordinates}
        >
          <>
            <Layer
             type='line'
             id={'flight-paths-feature-lines-2017'}
             key={'flight-paths-feature-lines-2017'}
             layout={{ 'line-cap': 'round', 'line-join': 'round' }}
             paint={{
               'line-color': ['get', 'line-color'],
               'line-opacity': 0.45,
               'line-width': 2,
             }}
           >
              {lineFeatures_2017}
            </Layer>
            <Layer
             type='circle'
             id={'flight-paths-feature-circles-2017'}
             key={'flight-paths-feature-circles-2017'}
             paint={{
                'circle-color': ['get', 'circle-color'],
                'circle-opacity': 0.45,
                'circle-radius': {
                  base: 3,
                  stops: [
                    [1, 3],
                    [10, 3],
                  ],
                },
              }}
            >
              {circleFeatures_2017}
            </Layer>
            <Layer
             type='line'
             id={'flight-paths-feature-lines-2019'}
             key={'flight-paths-feature-lines-2019'}
             layout={{ 'line-cap': 'round', 'line-join': 'round' }}
             paint={{ 'line-color': ['get', 'line-color'], 'line-width': 2}}
           >
              {lineFeatures_2019}
            </Layer>
            <Layer
             type='circle'
             id={'flight-paths-feature-circles-2019'}
             key={'flight-paths-feature-circles-2019'}
             paint={{
                'circle-color': ['get', 'circle-color'],
                'circle-radius': {
                  base: 3,
                  stops: [
                    [1, 3],
                    [10, 3],
                  ],
                },
              }}
            >
              {circleFeatures_2019}
            </Layer>
          </>
        </DefaultMap>
      </Column>
    </Root>
  );
};

export default MapboxMap;

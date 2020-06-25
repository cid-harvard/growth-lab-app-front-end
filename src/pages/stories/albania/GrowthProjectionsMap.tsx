import DefaultMap from '../../../components/mapbox';
import React, {useState} from 'react';
import { euBounds, worldData } from './PrimaryMap';
import raw from 'raw.macro';
import { scaleQuantile } from 'd3-scale';
import { schemeRdYlBu } from 'd3-scale-chromatic';
import max from 'lodash/max';
import min from 'lodash/min';
import {
  getProperty,
} from '../../../Utils';
import { GeoJSONLayer, Layer, Feature } from 'react-mapbox-gl';
import mapboxgl from 'mapbox-gl';

const growthProjectionsData = JSON.parse(raw('./data/growth_projections_2017.json'));

// Color scale for the map:
export const getGrowthRateColorScale = <T extends {growth: number}>(data: T[]) => {
  const growthRates = data.map(getProperty<T, 'growth'>('growth'));
  return scaleQuantile<string>()
    .domain([min(growthRates)!, max(growthRates)!])
    .range(schemeRdYlBu[9].slice().reverse());
};

const colorScale = getGrowthRateColorScale(growthProjectionsData);

const growthProjectionsFeatures: any[] = [];

worldData.features.forEach((f: any) => {
  const targetCountry =
    growthProjectionsData.find(({abbr}: {abbr: string}) => abbr === f.properties.iso_alpha3);
  if (targetCountry) {
    growthProjectionsFeatures.push({...f, properties: {
      ...f.properties,
      fill: colorScale(targetCountry.growth),
      description: `<strong>${f.properties.name}:</strong> ${targetCountry.growth}`,
      code: f.properties.iso_alpha3,
    }});
  }
});

const growthProjectionsGeoJson = {...worldData, features: growthProjectionsFeatures};

const getHighlightedGeoJson = (code: string) => {
  const targetFeature = worldData.features.find((f: any) => f.properties.iso_alpha3 === code);
  if (targetFeature) {
   return {...worldData, features: [targetFeature]};
  } else {
    return null;
  }
};

const MapboxMap = () => {
  const defaultHighlighted = getHighlightedGeoJson('ALB');
  const [highlightedGeoJson, setHighlightedGeoJson] = useState<any | null>(defaultHighlighted);


  const features = growthProjectionsGeoJson.features.map((point: any) => {
    const description: string = point.properties.description;
    const code: string = point.properties.code;
    return (
      <Feature
        coordinates={point.geometry.coordinates}
        properties={{
          'description': description,
          'code': code,
          'fill': point.properties.fill,
        }}
        key={'' + point.latitude + point.longitude}
      />
    );
  });

  const highlighted = highlightedGeoJson ? (
    <GeoJSONLayer
      data={highlightedGeoJson}
      linePaint={{
        'line-color': '#2F6BC2',
        'line-width': 2.5,
      }}
    />
  ) : <></>;

  const displayTooltip = (map: any) => {
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    map.on('mousemove', 'growth-projections-map-geojson-layer', function(e: any) {
      const {lng, lat} = e.lngLat;
      const coordinates: [number, number] = [lng, lat];
      const description = e.features[0].properties.description;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      // Populate the popup and set its coordinates
      // based on the feature found.
      if (!isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
        popup
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map);
      }
      if (e && e.features && e.features[0] && e.features[0].properties && e.features[0].properties.code) {
          setHighlightedGeoJson(getHighlightedGeoJson(e.features[0].properties.code));
        } else {
          setHighlightedGeoJson(defaultHighlighted);
        }
      });
      map.on('mouseleave', 'growth-projections-map-geojson-layer', function() {
      popup.remove();
          setHighlightedGeoJson(defaultHighlighted);

    });
  };

  return (
    <DefaultMap
      allowPan={false}
      allowZoom={false}
      fitBounds={euBounds}
      mapCallback={displayTooltip}
    >
      <>
        <Layer
          type='fill'
          id={'growth-projections-map-geojson-layer'}
          paint={{
            'fill-color': ['get', 'fill'],
            'fill-outline-color': '#999',
          }}
        >
          {features}
        </Layer>
        {highlighted}
      </>
    </DefaultMap>
  );
};

export default MapboxMap;

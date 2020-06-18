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
import { GeoJSONLayer } from 'react-mapbox-gl';

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
      ...f.properties, fill: colorScale(targetCountry.growth),
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

  const onMouseEnter = (e: any) => {
    if (e && e.features && e.features[0] && e.features[0].properties && e.features[0].properties.iso_alpha3) {
      setHighlightedGeoJson(getHighlightedGeoJson(e.features[0].properties.iso_alpha3));
    } else {
      setHighlightedGeoJson(defaultHighlighted);
    }
  };
  const onMouseLeave = () => {
    setHighlightedGeoJson(defaultHighlighted);
  };

  const highlighted = highlightedGeoJson ? (
    <GeoJSONLayer
      data={highlightedGeoJson}
      linePaint={{
        'line-color': '#2F6BC2',
        'line-width': 2.5,
      }}
      lineOnMouseLeave={onMouseLeave}
    />
  ) : <></>;

  return (
    <DefaultMap
      allowPan={false}
      allowZoom={false}
      fitBounds={euBounds}
    >
      <>
        <GeoJSONLayer
          data={growthProjectionsGeoJson}
          fillPaint={{
            'fill-color': ['get', 'fill'],
            'fill-outline-color': '#999',
          }}
          fillOnMouseEnter={onMouseEnter}
          fillOnMouseLeave={onMouseLeave}
        />
        {highlighted}
      </>
    </DefaultMap>
  );
};

export default MapboxMap;

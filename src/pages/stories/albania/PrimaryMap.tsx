import DefaultMap, {Coordinate} from '../../../components/mapbox';
import React from 'react';
import { GeoJSONLayer } from 'react-mapbox-gl';
import raw from 'raw.macro';
import {scaleLinear} from 'd3-scale';

const populationColorScale = scaleLinear<string>()
                    .domain([-15782, -7891, 0, 3000, 65936])
                    .range(['#ce325f', '#f97965', '#fff', '#88d981', '#3a8860']);
const gdpColorScale = scaleLinear<string>()
                    .domain([-14.92, -7, 0, 1.2, 26.03])
                    .range(['#ce325f', '#f97965', '#fff', '#88d981', '#3a8860']);

const albaniaHeatMapData = JSON.parse(raw('./data/albania_heatmap_data.json'));
const albaniaMapData = JSON.parse(raw('../../albaniaTool/assets/albania-geojson.geojson'));
const popultaionChangeFeatures: any[] = [];
const gdpGrowthFeatures: any[] = [];

albaniaMapData.features.forEach((f: any) => {
  const targetRegion = albaniaHeatMapData.find(({region: r}: {region: string}) => r === f.properties.ADM1_SQ);

  popultaionChangeFeatures.push({...f, properties: {
    ...f.properties, fill: populationColorScale(targetRegion.change_2013_2017),
  }});

  gdpGrowthFeatures.push({...f, properties: {
    ...f.properties, fill: gdpColorScale(targetRegion.cumulative_growth_rate),
  }});

});

const popultaionChangeGeoJson = {...albaniaMapData, features: popultaionChangeFeatures};
const gdpGrowthGeoJson = {...albaniaMapData, features: gdpGrowthFeatures};

export const albaniaBounds: [Coordinate, Coordinate] = [[18.5394, 42.8236], [21.4508, 39.4277]];
export const euBounds: [Coordinate, Coordinate] = [[-30.7617, 75.8021], [48.8672, 32.6949]];

interface Props {
  section: number | null;
}

const MapboxMap = (props: Props) => {
  const {section} = props;
  let fitBounds: [Coordinate, Coordinate];
  let data: any;
  if (section && section >= 8) {
    fitBounds = euBounds;
    data = [];
  } else {
    fitBounds = albaniaBounds;
    if (section && section <= 6) {
      data = popultaionChangeGeoJson;
    } else {
      data = gdpGrowthGeoJson;
    }
  }
  return (
    <DefaultMap
      allowPan={false}
      allowZoom={false}
      fitBounds={fitBounds}
    >
      <GeoJSONLayer
        data={data}
        fillPaint={{
          'fill-color': ['get', 'fill'],
          'fill-outline-color': '#999',
        }}
      />
    </DefaultMap>
  );
};

export default MapboxMap;

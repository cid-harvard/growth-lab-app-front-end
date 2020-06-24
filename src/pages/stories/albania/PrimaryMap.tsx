import DefaultMap, {Coordinate} from '../../../components/mapbox';
import React from 'react';
import { GeoJSONLayer } from 'react-mapbox-gl';
import raw from 'raw.macro';
import {scaleLinear} from 'd3-scale';
import ColorScaleLegend from '../../../components/dataViz/ColorScaleLegend';
import styled from 'styled-components/macro';

const ScaleContainer = styled.div`
  width: 350px;
  max-width: 100%;
  margin: 0 auto;
  font-size: 0.75rem;
  text-align: center;
`;

const populationMin = -15782;
const populationMax = 65936;
const populationColorScale = scaleLinear<string>()
                    .domain([populationMin, -7891, 0, 3000, populationMax])
                    .range(['#ce325f', '#f97965', '#dcf7e0', '#88d981', '#3a8860']);
// TOTAL range = 81718
// stops = 0, 7891, 15782, 18782, 81718
// stops = 0, 9.66, 19.31, 23, 100
const cssGradientPopulation = `
  linear-gradient(
    90deg,
    #ce325f 0%,
    #f97965 9.66%,
    #dcf7e0 19.31%,
    #88d981 23%,
    #3a8860 100%
  )
`;
const populationColorScaleTitle = 'Change in population';

const gdpMin = -14.92;
const gdpMax = 26.03;
const gdpColorScale = scaleLinear<string>()
                    .domain([gdpMin, -7, 0, 1.2, gdpMax])
                    .range(['#ce325f', '#f97965', '#dcf7e0', '#88d981', '#3a8860']);

// stops = 0, 7.92, 14.92, 16.12, 40.95
const cssGradientGdp = `
  linear-gradient(
    90deg,
    #ce325f 0%,
    #f97965 19.34%,
    #dcf7e0 36.43%,
    #88d981 39.37%,
    #3a8860 100%
  )
`;
const gdpColorScaleTitle = 'GDP Growth';

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

const euMin = 2000;
const euMax = 100000;
const gdpEuropeColorScale = scaleLinear<string>()
                    .domain([euMin, 49000, euMax])
                    .range(['#face55', '#f97502', '#b63d21']);
// stops = 0, 7.92, 14.92, 16.12, 40.95
const cssGradientEu = `
  linear-gradient(
    90deg,
    #face55 0%,
    #f97502 50%,
    #b63d21 100%
  )
`;
const euColorScaleTitle = 'GDP per capita';

export const worldData = JSON.parse(raw('../../../components/dataViz/assets/world-geojson.json'));
const europeGdpData = JSON.parse(raw('./data/europe_gdp.json'));
const euGdpFeatures: any[] = [];
worldData.features.forEach((f: any) => {
  const targetCountry =
    europeGdpData.find(({country_code: c}: {country_code: string}) => c === f.properties.iso_alpha3);
  if (targetCountry) {
    euGdpFeatures.push({...f, properties: {
      ...f.properties, fill: gdpEuropeColorScale(targetCountry.gdp_2018),
    }});
  }
});
const euGeoJson = {...worldData, features: euGdpFeatures};

export const albaniaBounds: [Coordinate, Coordinate] = [[18.5394, 42.8236], [21.4508, 39.4277]];
export const euBounds: [Coordinate, Coordinate] = [[-30.7617, 75.8021], [48.8672, 32.6949]];

interface Props {
  section: number | null;
}

const MapboxMap = (props: Props) => {
  const {section} = props;
  let fitBounds: [Coordinate, Coordinate];
  let data: any;
  let gradientString: string;
  let scaleTitle: string;
  let scaleMin: number;
  let scaleMax: number;
  if (section && section >= 8) {
    fitBounds = euBounds;
    data = euGeoJson;
    gradientString = cssGradientEu;
    scaleTitle = euColorScaleTitle;
    scaleMin = euMin;
    scaleMax = euMax;
  } else {
    fitBounds = albaniaBounds;
    if (section && section <= 6) {
      data = popultaionChangeGeoJson;
      gradientString = cssGradientPopulation;
      scaleTitle = populationColorScaleTitle;
      scaleMin = populationMin;
      scaleMax = populationMax;
    } else {
      data = gdpGrowthGeoJson;
      gradientString = cssGradientGdp;
      scaleTitle = gdpColorScaleTitle;
      scaleMin = gdpMin;
      scaleMax = gdpMax;
    }
  }
  return (
    <>
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
      <ScaleContainer>
        <ColorScaleLegend
          title={scaleTitle}
          minLabel={scaleMin}
          maxLabel={scaleMax}
          gradientString={gradientString}
        />
      </ScaleContainer>
    </>
  );
};

export default MapboxMap;

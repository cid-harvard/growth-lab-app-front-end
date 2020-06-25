import DefaultMap, {Coordinate} from '../../../components/mapbox';
import React from 'react';
import { Layer, Feature } from 'react-mapbox-gl';
import raw from 'raw.macro';
import {scaleLinear} from 'd3-scale';
import ColorScaleLegend from '../../../components/dataViz/ColorScaleLegend';
import styled from 'styled-components/macro';
import mapboxgl from 'mapbox-gl';
import {
  VizSource,
} from '../../../styling/styleUtils';

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
    ...f.properties,
    fill: populationColorScale(targetRegion.change_2013_2017),
    description: `<strong>${f.properties.ADM1_SQ}:</strong> ${targetRegion.change_2013_2017}`,
  }});

  gdpGrowthFeatures.push({...f, properties: {
    ...f.properties,
    fill: gdpColorScale(targetRegion.cumulative_growth_rate),
    description: `<strong>${f.properties.ADM1_SQ}:</strong> ${targetRegion.cumulative_growth_rate}`,
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
  if (targetCountry && targetCountry.gdp_2018) {
    euGdpFeatures.push({...f, properties: {
      ...f.properties,
      fill: gdpEuropeColorScale(targetCountry.gdp_2018),
      description: `<strong>${f.properties.name}:</strong> ${parseFloat(parseFloat(targetCountry.gdp_2018).toFixed(2))}`,
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

  // const [hovered, setHovered] = useState<string | undefined>(undefined);

  let fitBounds: [Coordinate, Coordinate];
  let data: any;
  let gradientString: string;
  let scaleTitle: string;
  let scaleMin: number;
  let scaleMax: number;
  let source: string;
  if (section && section >= 8) {
    fitBounds = euBounds;
    data = euGeoJson;
    gradientString = cssGradientEu;
    scaleTitle = euColorScaleTitle;
    scaleMin = euMin;
    scaleMax = euMax;
    source = 'WDI';
  } else {
    fitBounds = albaniaBounds;
    source = 'INSTAT';
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
  const features = data.features.map((point: any) => {
    const description: string = point.properties.description;
    return (
      <Feature
        coordinates={point.geometry.coordinates}
        properties={{
          'description': description,
          'fill': point.properties.fill,
        }}
        key={'' + point.latitude + point.longitude}
      />
    );
  });

  const displayTooltip = (map: any) => {
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    map.on('mousemove', 'primary-map-geojson-layer', function(e: any) {
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
    });
    map.on('mouseleave', 'primary-map-geojson-layer', function() {
      popup.remove();
    });
  };
  return (
    <>
      <DefaultMap
        allowPan={false}
        allowZoom={false}
        fitBounds={fitBounds}
        mapCallback={displayTooltip}
      >
        <Layer
          type='fill'
          id={'primary-map-geojson-layer'}
          paint={{
            'fill-color': ['get', 'fill'],
            'fill-outline-color': '#999',
          }}
        >
          {features}
        </Layer>
      </DefaultMap>
      <VizSource>Source: <em>{source}</em></VizSource>
      <ScaleContainer>
        <ColorScaleLegend
          title={scaleTitle}
          minLabel={scaleMin}
          maxLabel={scaleMax}
          gradientString={gradientString}
          rootStyles={{marginTop: '0'}}
        />
      </ScaleContainer>
    </>
  );
};

export default MapboxMap;

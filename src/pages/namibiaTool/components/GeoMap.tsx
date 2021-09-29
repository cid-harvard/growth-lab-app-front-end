import React from 'react';
import {
  TwoColumnSection,
  SectionHeaderSecondary,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import {colorScheme} from '../Utils';
import DataViz, {
  VizType,
  ColorScaleLegend,
} from 'react-fast-charts';
import raw from 'raw.macro';
import {lighten} from 'polished';

const includedCountries = [
  'NAM',
  'LSO',
  'SWZ',
  'ZMB',
  'BWA',
  'AGO',
  'ZAF',
];

const worldMap = JSON.parse(raw('../../../assets/world-geojson.json'));
const filteredCountries = worldMap.features.filter((f: any) => includedCountries.includes(f.properties.iso_alpha3));
const mapSouthernAfrica = {...worldMap, features: filteredCountries};

export interface Datum {
  locationCode: string;
  countryDemandPcAvg: number;
}

interface Props {
  heatMapData: Datum[];
}

const GeoMap = ({heatMapData}: Props) => {

  const featuresWithValues = mapSouthernAfrica.features
    .map((f: any) => {
      const target = heatMapData.find(d => d.locationCode === f.properties.iso_alpha3);
      const percent = target ? target.countryDemandPcAvg : 0;
      const properties = {
        ...f.properties,
        percent,
        tooltipContent: `${f.properties.name}: ${percent.toFixed(2)}`,
      };
      return {...f, properties};
    });
  const data = {...mapSouthernAfrica, features: featuresWithValues};

  return (
    <>
      <SectionHeaderSecondary color={colorScheme.quaternary}>Demand for the Product</SectionHeaderSecondary>
      <TwoColumnSection>
        <DataViz
          id={'namibia-geo-map'}
          vizType={VizType.GeoMap}
          data={data}
          minColor={lighten(0.55, colorScheme.quaternary)}
          maxColor={colorScheme.quaternary}
        />
        <TextBlock>
          <div>
            <p>The map to the left shows the relative intensity of imports of this product in the region. Darker colored countries import more per capita of this product and are likely to be attractive market opportunities to export the product from Namibia. Hover over the map to see the imports per capita of the product for each country.
            </p>
          </div>
          <ColorScaleLegend
            minLabel={'← Less'}
            maxLabel={'More →'}
            minColor={lighten(0.55, colorScheme.quaternary)}
            maxColor={colorScheme.quaternary}
            title={'Imports Per Capita'}
          />
        </TextBlock>
      </TwoColumnSection>
    </>
  );
};

export default GeoMap;
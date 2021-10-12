import React from 'react';
import {
  TwoColumnSection,
  SectionHeaderSecondary,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import {
  colorScheme,
  useProductClass,
  ProductClass,
} from '../Utils';
import DataViz, {
  VizType,
  ColorScaleLegend,
} from 'react-fast-charts';
import raw from 'raw.macro';
import {lighten} from 'polished';
import {extent} from 'd3-array';

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
        tooltipContent: `${f.properties.name}: $${percent} USD`,
      };
      return {...f, properties};
    });
  const data = {...mapSouthernAfrica, features: featuresWithValues};
  const [min, max] = extent(heatMapData.map(d => d.countryDemandPcAvg));
  const productClass = useProductClass();
  const productOrIndustry = productClass === ProductClass.HS ? 'product' : 'industry';
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
            <p>The map to the left shows the relative intensity of imports of this {productOrIndustry} in the region. Darker colored countries import more per capita of this {productOrIndustry} and are likely to be attractive market opportunities to export the {productOrIndustry} from Namibia. Hover over the map to see the imports per capita of the {productOrIndustry} for each country.
            </p>
          </div>
          <ColorScaleLegend
            minLabel={`$${min ? min : 0}`}
            maxLabel={`$${max ? max : 0}`}
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

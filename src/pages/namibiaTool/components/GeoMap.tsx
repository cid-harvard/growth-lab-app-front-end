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
  formatNumber,
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

const subSaharanAfrica = [
  'BEN',
  'BFA',
  'BDI',
  'CMR',
  'CAF',
  'TCD',
  'COG',
  'COD',
  'CIV',
  'GNQ',
  'ERI',
  'ETH',
  'GAB',
  'GMB',
  'GHA',
  'GIN',
  'GNB',
  'KEN',
  'LBR',
  'MDG',
  'MWI',
  'MLI',
  'MRT',
  'MUS',
  'MOZ',
  'NER',
  'NGA',
  'RWA',
  'SEN',
  'SLE',
  'SOM',
  'SDS',
  'SDN',
  'TZA',
  'TGO',
  'UGA',
  'ZWE',
];

const worldMap = JSON.parse(raw('../../../assets/world-geojson.json'));
const filteredCountries = worldMap.features.filter((f: any) => includedCountries.includes(f.properties.iso_alpha3));
const filteredSubSaharanCountries = worldMap.features
  .filter((f: any) => subSaharanAfrica.includes(f.properties.iso_alpha3))
  .map((f: any) => ({...f, properties: {percent: 0, void: true}}));
const mapSouthernAfrica = {...worldMap, features: filteredCountries};

export interface Datum {
  locationCode: string;
  countryDemandPcAvg: number;
  countryDemandAvg: number;
}

interface Props {
  heatMapData: Datum[];
}

const GeoMap = ({heatMapData}: Props) => {

  const featuresWithValues = mapSouthernAfrica.features
    .map((f: any) => {
      const target = heatMapData.find(d => d.locationCode === f.properties.iso_alpha3);
      const imports = target ? target.countryDemandAvg : 0;
      const perCapita = target ? target.countryDemandPcAvg : 0;
      const properties = {
        ...f.properties,
        percent: perCapita,
        tooltipContent: `
          <div>
            <strong>${f.properties.name}:</strong><br />
            Imports: $${formatNumber(imports)} USD<br />
            Imports per capita: $${perCapita} USD
          </div>
          `,
      };
      return {...f, properties};
    });
  const data = { ...mapSouthernAfrica, features: [...filteredSubSaharanCountries, ...featuresWithValues]};
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

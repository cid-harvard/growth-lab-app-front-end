import React from 'react';
import {
  TwoColumnSection,
  SectionHeaderSecondary,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import {colorScheme} from '../Utils';
import DataViz, {
  VizType,
} from 'react-fast-charts';
import raw from 'raw.macro';

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
const featuresWithValues = worldMap.features
  .filter((f: any) => includedCountries.includes(f.properties.iso_alpha3))
  .map((f: any) => {
    const percent = Math.random() * 100;
    const properties = {
      ...f.properties,
      percent,
      tooltipContent: `${f.properties.name}: ${percent.toFixed(2)}%`,
    };
    return {...f, properties};
  });
const data = {...worldMap, features: featuresWithValues};

const GeoMap = () => {

  return (
    <>
      <SectionHeaderSecondary color={colorScheme.quaternary}>Relative Demand</SectionHeaderSecondary>
      <TwoColumnSection>
        <DataViz
          id={'namibia-geo-map'}
          vizType={VizType.GeoMap}
          data={data}
          minColor={'yellow'}
          maxColor={'red'}
        />
        <TextBlock>
          <div>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
        </TextBlock>
      </TwoColumnSection>
    </>
  );
};

export default GeoMap;

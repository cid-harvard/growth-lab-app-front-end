import React from 'react';
import { Content } from '../../../styling/Grid';
import {
  TwoColumnSection,
  SectionHeader,
  Code,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import DataViz, {VizType} from '../../../components/dataViz';
import raw from 'raw.macro';

const worldData = JSON.parse(raw('../../../components/dataViz/assets/world-geojson.json'));

const featuresWithValues = worldData.features.map((feature: any) => {
  const percent = Math.random() * 100;
  const properties = {...feature.properties, percent, tooltipContent: `
      <strong>${feature.properties.name}:</strong> ${percent}
  `};
  return {...feature, properties};
});

const geoJsonWithValues = {...worldData, features: featuresWithValues};

const codeAsString = `<DataViz
  id={'sandbox-geo-map-chart'}
  vizType={VizType.GeoMap}
  data={geoJsonWithValues}
  minColor={'red'}
  maxColor={'green'}
/>
`;

const GeoMap = () => {
  return (
    <Content>
      <TwoColumnSection>
        <SectionHeader>Line Chart</SectionHeader>
        <DataViz
          id={'sandbox-geo-map-chart'}
          vizType={VizType.GeoMap}
          data={geoJsonWithValues}
          minColor={'red'}
          maxColor={'green'}
        />
        <TextBlock>
          <Code>
            {codeAsString}
          </Code>
        </TextBlock>
      </TwoColumnSection>
    </Content>
  );
};

export default GeoMap;

import React from 'react';
import DataViz, {VizType} from '../../../components/dataViz';
import raw from 'raw.macro';
import {lighten} from 'polished';
import { colorScheme } from '../Utils';
import {
    IndustryNowLocation as IndustryNowLocationNode,
} from '../../../graphql/graphQLTypes';
import TextBlock from '../../../components/text/TextBlock';
import ColorScaleLegend from '../../../components/dataViz/ColorScaleLegend';
import {min, max} from 'd3-array';

const albaniaMapData = JSON.parse(raw('../assets/albania-geojson.geojson'));

interface Props {
  locationNode: IndustryNowLocationNode | null;
  sectionHtml: string;
}

const IndustryNowLocation = (props: Props) => {
  const {
    locationNode, sectionHtml,
  } = props;

  if (locationNode === null) {
    return (
      <>
        <DataViz
          id={'albania-geo-map'}
          vizType={VizType.Error}
          message={'There are not enough data points for this chart'}
        />
        <TextBlock>
          <p
            dangerouslySetInnerHTML={{__html: sectionHtml}}
          />
        </TextBlock>
      </>
    );
  }

  const featuresWithValues = albaniaMapData.features.map((feature: any) => {
    const percent: number | null =
      locationNode[((feature.properties.ADM1_EN as string).toLowerCase() as keyof IndustryNowLocationNode)] as number | null;
    const adjustedPercent = percent ? percent.toFixed(2) : 0;
    const properties = {...feature.properties, percent, tooltipContent: `
      <strong>${feature.properties.ADM1_SQ}</strong>: ${adjustedPercent}%`};
    return {...feature, properties};
  });
  const geoJsonWithValues = {...albaniaMapData, features: featuresWithValues};

  const allValues: number[] = geoJsonWithValues.features.map((node: any) => node.properties.percent);

  const rawMinValue = min(allValues);
  const rawMaxValue = max(allValues);

  const minValue = rawMinValue ? Math.floor(rawMinValue) : 0;
  const maxValue = rawMaxValue ? Math.floor(rawMaxValue) : 0;

  return (
    <>
      <DataViz
        id={'albania-geo-map'}
        vizType={VizType.GeoMap}
        data={geoJsonWithValues}
        minColor={lighten(0.55, colorScheme.quaternary)}
        maxColor={colorScheme.quaternary}
      />
      <TextBlock>
        <p
          dangerouslySetInnerHTML={{__html: sectionHtml}}
        />
        <ColorScaleLegend
          minLabel={Math.floor(minValue) + '%'}
          maxLabel={Math.ceil(maxValue) + '%'}
          minColor={lighten(0.55, colorScheme.quaternary)}
          maxColor={colorScheme.quaternary}
          title={'Percentage of industry workers in each region'}
        />
      </TextBlock>
    </>
  );
};

export default IndustryNowLocation;

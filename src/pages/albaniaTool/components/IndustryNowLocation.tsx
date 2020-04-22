import React from 'react';
import DataViz, {VizType} from '../../../components/dataViz';
import raw from 'raw.macro';
import {lighten} from 'polished';
import { colorScheme } from '../Utils';
import {
    IndustryNowLocation as IndustryNowLocationNode,
} from '../../../graphql/graphQLTypes';

const albaniaMapData = JSON.parse(raw('../assets/albania-geojson.geojson'));

interface Props {
  locationNode: IndustryNowLocationNode | null;
}

const IndustryNowLocation = (props: Props) => {
  const {
    locationNode,
  } = props;

  if (locationNode === null) {
    return (
      <DataViz
        id={'albania-geo-map'}
        vizType={VizType.Error}
        message={'There are not enough data points for this chart'}
      />
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

  return (
    <DataViz
      id={'albania-geo-map'}
      vizType={VizType.GeoMap}
      data={geoJsonWithValues}
      minColor={lighten(0.55, colorScheme.quaternary)}
      maxColor={colorScheme.quaternary}
    />
  );
};

export default IndustryNowLocation;

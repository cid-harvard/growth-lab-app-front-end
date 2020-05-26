import {min, max} from 'd3-array';
import raw from 'raw.macro';
import {
  MapLocationConnection,
} from '../graphql/graphQLTypes';

const jordanMapData = JSON.parse(raw('../data/jordanmap.json'));

export default (mapLocationEdges: MapLocationConnection['edges']) => {
  const featuresWithValues = jordanMapData.features.map((feature: any) => {
    const edge = mapLocationEdges.find(e => (e && e.node && e.node.govCode === feature.properties.DPTO));
    const percent: number | null = edge !== null && edge !== undefined && edge.node && edge.node.shareCountry
      ? parseFloat(edge.node.shareCountry) : null;
    const adjustedPercent = percent ? percent.toFixed(2) : 0;
    const governorate = edge !== null && edge !== undefined && edge.node && edge.node.governorate
      ? edge.node.governorate : '';
    const properties = {...feature.properties, percent, tooltipContent: `
      <strong>Governorate:</strong> ${governorate}
      <br /><strong>Share Country:</strong> ${adjustedPercent}%
      `};
    return {...feature, properties};
  });
  const geoJsonWithValues = {...jordanMapData, features: featuresWithValues};

  const allValues: number[] = geoJsonWithValues.features.map((node: any) => node.properties.percent);

  const rawMinValue = min(allValues);
  const rawMaxValue = max(allValues);

  const minValue = rawMinValue ? Math.floor(rawMinValue) : 0;
  const maxValue = rawMaxValue ? Math.floor(rawMaxValue) : 0;

  return {
    geoJsonWithValues, minValue, maxValue,
  };
};
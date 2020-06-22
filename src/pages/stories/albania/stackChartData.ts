import {Datum, Config} from '../../../components/dataViz/stackChart';
import raw from 'raw.macro';

const rawData = JSON.parse(raw('./data/fdi_stack_chart_data.json'));

const config: Config = {
  primaryKey: 'quarter',
  groups: [],
};

const transformedData: Datum[] = [];

rawData.forEach((d: any) => {
  const targetIndex = transformedData.findIndex(t => t.quarter === d.quarter);
  const category = (d.category as string).replace(/,|-|;/gi, '').replace(/ /gi, '_').toLowerCase();
  if (targetIndex === -1) {
    transformedData.push({
      quarter: d.quarter,
      [category]: d.value,
    });
  } else {
    transformedData[targetIndex][category] = d.value;
  }
  if (!config.groups.find(({key}) => key === category)) {
    config.groups.push({
      key: category,
      label: d.category,
    });
  }
});

export const stackConfig = config;
export const stackData = transformedData;

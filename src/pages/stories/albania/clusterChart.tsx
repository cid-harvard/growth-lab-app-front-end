import React from 'react';
import DataViz, {VizType} from '../../../components/dataViz';
import {Datum} from '../../../components/dataViz/clusterChart';

const data: Datum[] = [
  {
    name: 'Godzilla',
    label: 'Godzilla',
    value: 78,
    fill: 'green',
  },
  {
    name: 'King Ghidorah',
    label: 'King Ghidorah',
    value: 67,
    fill: 'yellow',
  },
  {
    name: 'Mothra',
    label: 'Mothra',
    value: 48,
    fill: 'pink',
  },
  {
    name: 'Rodan',
    label: 'Rodan',
    value: 39,
    fill: 'red',
  },
  {
    name: 'King Kong',
    label: 'King Kong',
    value: 69,
    fill: 'brown',
  },
  {
    name: 'Ebirah',
    label: 'Ebirah',
    value: 24,
    fill: 'salmon',
  },
];


const ClusterChart = () => {
  return (
    <DataViz
      id={'albania-story-cluster-chart-1'}
      vizType={VizType.ClusterChart}
      data={data}
      hideLabels={true}
    />
  );
};

export default ClusterChart;

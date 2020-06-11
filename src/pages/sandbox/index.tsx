import React from 'react';
import {useParams} from 'react-router';
import { SandboxSection, DataVizSections } from '../../routing/routes';
import LineChart from './dataViz/LineChart';
import GeoMap from './dataViz/GeoMap';

const Sandbox = () => {
  const params = useParams<{section?: string, detail?: string}>();
  if (params.section === SandboxSection.DataViz) {
    if (params.detail === DataVizSections.LineChart) {
      return (
        <LineChart />
      );
    } else if (params.detail === DataVizSections.GeoMap) {
      return (
        <GeoMap />
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default Sandbox;

import React from 'react';
import {useParams} from 'react-router';
import { SandboxSection, DataVizSections } from '../../routing/routes';
import LineChart from './dataViz/LineChart';

const Sandbox = () => {
  const params = useParams<{section?: string, detail?: string}>();
  if (params.section === SandboxSection.DataViz) {
    if (params.detail === DataVizSections.LineChart) {
      return (
        <LineChart />
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default Sandbox;

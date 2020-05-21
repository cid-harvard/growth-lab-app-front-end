import {
  FactorsConnection,
} from '../graphql/graphQLTypes';
import { Datum as RadarChartDatum } from '../../../components/dataViz/radarChart';

export default (factors: FactorsConnection) => {
  const factorsNode = factors.edges !== null && factors.edges[0] ? factors.edges[0].node : null;

  const viabilityData: RadarChartDatum[] = [];
  const attractivenessData: RadarChartDatum[] = [];
  if (factorsNode !== null) {
    const {
      // Viability Factors:
      rcaJordan, rcaPeers, waterIntensity,
      electricityIntensity, availabilityInputs,

      // Attractiveness Factors:
      femaleEmployment, highSkillEmployment,
      fdiWorld, fdiRegion, exportPropensity,
    } = factorsNode;

    // Viability Radar Chart:
    if (rcaJordan !== null) {
      viabilityData.push({label: 'RCA Jordan', value: rcaJordan});
    }
    if (rcaPeers !== null) {
      viabilityData.push({label: 'RCA Peers', value: rcaPeers});
    }
    if (waterIntensity !== null) {
      viabilityData.push({label: 'Water Intensity', value: waterIntensity});
    }
    if (electricityIntensity !== null) {
      viabilityData.push({label: 'Electricity Intensity', value: electricityIntensity});
    }
    if (availabilityInputs !== null) {
      viabilityData.push({label: 'Avail. of Inputs', value: availabilityInputs});
    }

    // Attractiveness Radar Chart:
    if (femaleEmployment !== null) {
      attractivenessData.push({label: 'RCA Jordan', value: femaleEmployment});
    }
    if (highSkillEmployment !== null) {
      attractivenessData.push({label: 'RCA Peers', value: highSkillEmployment});
    }
    if (fdiWorld !== null) {
      attractivenessData.push({label: 'Water Intensity', value: fdiWorld});
    }
    if (fdiRegion !== null) {
      attractivenessData.push({label: 'Electricity Intensity', value: fdiRegion});
    }
    if (exportPropensity !== null) {
      attractivenessData.push({label: 'Avail. of Inputs', value: exportPropensity});
    }
  }

  return {
    viabilityData, attractivenessData,
  };
};
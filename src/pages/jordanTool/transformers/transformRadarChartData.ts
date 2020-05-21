import {
  FactorsConnection,
} from '../graphql/graphQLTypes';
import { Datum as RadarChartDatum } from '../../../components/dataViz/radarChart';

export default (factors: FactorsConnection) => {
  const factorsNode = factors.edges !== null && factors.edges[0] ? factors.edges[0].node : null;

  const viabilityData: RadarChartDatum[] = [];
  const viabilityCsvData: {[key: string]: number} = {};
  const attractivenessData: RadarChartDatum[] = [];
  const attractivenessCsvData: {[key: string]: number} = {};
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
      viabilityCsvData['RCA Jordan'] = rcaJordan;
    }
    if (rcaPeers !== null) {
      viabilityData.push({label: 'RCA Peers', value: rcaPeers});
      viabilityCsvData['RCA Peers'] = rcaPeers;
    }
    if (waterIntensity !== null) {
      viabilityData.push({label: 'Water Intensity', value: waterIntensity});
      viabilityCsvData['Water Intensity'] = waterIntensity;
    }
    if (electricityIntensity !== null) {
      viabilityData.push({label: 'Electricity Intensity', value: electricityIntensity});
      viabilityCsvData['Electricity Intensity'] = electricityIntensity;
    }
    if (availabilityInputs !== null) {
      viabilityData.push({label: 'Availability\nof Inputs', value: availabilityInputs});
      viabilityCsvData['Availability of Inputs'] = availabilityInputs;
    }

    // Attractiveness Radar Chart:
    if (femaleEmployment !== null) {
      attractivenessData.push({label: 'Female Employment Potential', value: femaleEmployment});
      attractivenessCsvData['Female Employment Potential'] = femaleEmployment;
    }
    if (highSkillEmployment !== null) {
      attractivenessData.push({label: 'High Skill\nEmployment\nPotential', value: highSkillEmployment});
      attractivenessCsvData['High Skill Employment Potential'] = highSkillEmployment;
    }
    if (fdiWorld !== null) {
      attractivenessData.push({label: 'FDI in the World', value: fdiWorld});
      attractivenessCsvData['FDI in the World'] = fdiWorld;
    }
    if (fdiRegion !== null) {
      attractivenessData.push({label: 'FDI in the Region', value: fdiRegion});
      attractivenessCsvData['FDI in the Region'] = fdiRegion;
    }
    if (exportPropensity !== null) {
      attractivenessData.push({label: 'Export\nPropensity', value: exportPropensity});
      attractivenessCsvData['Export Propensity'] = exportPropensity;
    }
  }

  return {
    viabilityData, viabilityCsvData,
    attractivenessData, attractivenessCsvData,
  };
};
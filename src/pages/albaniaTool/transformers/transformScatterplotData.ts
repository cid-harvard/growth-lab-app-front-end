import {
  Factors,
  NACEIndustry,
  RCADirection,
} from '../../../graphql/graphQLTypes';
import { Datum as ScatterPlotDatum } from '../../../components/dataViz/scatterPlot';
import { TreeNode } from 'react-dropdown-tree-select';
import {rgba} from 'polished';
import { colorScheme } from '../Utils';

export interface CSVDatum {
  ['Industry Name']: string;
  ['NACE Code']: string;
  ['Average Viability']: number;
  ['Average Attractiveness']: number;
  ['RCA Direction']: string;
  ['Parent Industry Name']: string;
  ['Parent Industry NACE Code']: string;
  ['Grandparent Industry Name']: string;
  ['Grandparent Industry NACE Code']: string;
}

export interface NaceIdEnhancedScatterPlotDatum extends ScatterPlotDatum {
  naceId: string;
}

export default (rawFactors: Factors[], rawNaceData: NACEIndustry[]) => {
  const scatterPlotData: NaceIdEnhancedScatterPlotDatum[] = [];
  const csvData: CSVDatum[] = [];
  rawFactors.forEach((rawDatum) => {
    if (rawDatum) {
      const {
        naceId, avgViability, avgAttractiveness, rca,
      } = rawDatum;
      if (naceId !== null && avgViability !== null && avgAttractiveness !== null && rca !== null) {
        const targetNaceIndustry = rawNaceData.find(node => node && node.naceId === naceId);
        if (targetNaceIndustry && targetNaceIndustry.name && targetNaceIndustry.code) {
          const parentTarget = rawNaceData.find(
            (datum) =>
              targetNaceIndustry.parentId !== null && datum.naceId === targetNaceIndustry.parentId.toString());
          let grandparentTarget: NACEIndustry | undefined;
          if (parentTarget && parentTarget.parentId !== null) {
            grandparentTarget = rawNaceData.find(
              (datum) =>parentTarget.parentId !== null && datum.naceId === parentTarget.parentId.toString());
          } else {
            grandparentTarget = undefined;
          }
          csvData.push({
            'NACE Code': targetNaceIndustry.code,
            'Industry Name': targetNaceIndustry.name,
            'Average Viability': avgViability,
            'Average Attractiveness': avgAttractiveness,
            'RCA Direction': rca,
            'Parent Industry Name': parentTarget && parentTarget.name !== null
                                ? parentTarget.name : '',
            'Parent Industry NACE Code': parentTarget && parentTarget.code !== null
                                ? parentTarget.code : '',
            'Grandparent Industry Name': grandparentTarget && grandparentTarget.name !== null
                                ? grandparentTarget.name : '',
            'Grandparent Industry NACE Code': grandparentTarget && grandparentTarget.code !== null
                                ? grandparentTarget.code : '',
          });
          scatterPlotData.push({
            label: targetNaceIndustry.name,
            x: avgViability,
            y: avgAttractiveness,
            tooltipContent: `
              <strong>Viability:</strong> ${avgViability.toFixed(2)}
              <br />
              <strong>Attractiveness:</strong> ${avgAttractiveness.toFixed(2)}
            `,
            fill: rca === RCADirection.LessThanOne ? colorScheme.dataSecondary : colorScheme.data,
            naceId,
          });
        }
      }
    }
  });
  return {scatterPlotData, csvData};
};

export const updateScatterPlotData = (
  scatterPlotData: NaceIdEnhancedScatterPlotDatum[],
  selectedIndustry: TreeNode | undefined,
  setSelectedIndustry: (value: TreeNode) => void) => {
    return scatterPlotData.map(datum => {
      const existingFill = datum.fill ? datum.fill : colorScheme.data;
      const fill = selectedIndustry && selectedIndustry.label === datum.label
          ? rgba(existingFill, 0.4) : rgba(existingFill, 0.5);
      const highlighted = selectedIndustry && selectedIndustry.label === datum.label
          ? true : false;
      const onClick = () => setSelectedIndustry({value: datum.naceId, label: datum.label });
      return { ...datum, fill, highlighted, onClick };
    });
  };

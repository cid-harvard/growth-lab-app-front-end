import {
  FactorsEdge,
  NACEIndustryEdge,
  RCADirection,
} from '../../graphql/graphQLTypes';
import { Datum as ScatterPlotDatum } from '../../components/dataViz/scatterPlot';
import { colorScheme } from './testData';
import { TreeNode } from 'react-dropdown-tree-select';
import {rgba} from 'polished';

export interface CSVDatum {
  industryName: string;
  naceId: string;
  avgViability: string;
  avgAttractiveness: string;
  rcaDirection: string;
}

export default (rawFactors: (FactorsEdge | null)[], rawNaceData: (NACEIndustryEdge | null)[]) => {
  const scatterPlotData: ScatterPlotDatum[] = [];
  const csvData: CSVDatum[] = [];
  rawFactors.forEach((rawDatum) => {
    if (rawDatum && rawDatum.node) {
      const {
        naceId, avgViability, avgAttractiveness, rca,
      } = rawDatum.node;
      if (naceId !== null && avgViability !== null && avgAttractiveness !== null && rca !== null) {
        const targetNaceIndustry = rawNaceData.find(edge => edge && edge.node && edge.node.naceId === naceId);
        if (targetNaceIndustry && targetNaceIndustry.node && targetNaceIndustry.node.name) {
          csvData.push({
            naceId,
            industryName: targetNaceIndustry.node.name,
            avgViability, avgAttractiveness,
            rcaDirection: rca,
          });
          scatterPlotData.push({
            label: targetNaceIndustry.node.name,
            x: parseFloat(avgViability),
            y: parseFloat(avgAttractiveness),
            tooltipContent: `
              <strong>Viability:</strong> ${avgViability}
              <br />
              <strong>Attractiveness:</strong> ${avgAttractiveness}
            `,
            fill: rca === RCADirection.LessThanOne ? colorScheme.dataSecondary : colorScheme.data,
          });
        }
      }
    }
  });
  return {scatterPlotData, csvData};
};

export const updateScatterPlotData = (scatterPlotData: ScatterPlotDatum[], selectedIndustry: TreeNode | undefined) => {
  return scatterPlotData.map(datum => {
    const existingFill = datum.fill ? datum.fill : colorScheme.data;
    const fill = selectedIndustry && selectedIndustry.label === datum.label
        ? rgba(existingFill, 0.4) : rgba(existingFill, 0.5);
    const highlighted = selectedIndustry && selectedIndustry.label === datum.label
        ? true : false;
    return { ...datum, fill, highlighted };
  });
};

import {
  FactorsEdge,
  NACEIndustryEdge,
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
}

export default (rawFactors: (FactorsEdge | null)[], rawNaceData: (NACEIndustryEdge | null)[]) => {
  const scatterPlotData: ScatterPlotDatum[] = [];
  const csvData: CSVDatum[] = [];
  rawFactors.forEach((rawDatum) => {
    if (rawDatum && rawDatum.node) {
      const {
        naceId, avgViability, avgAttractiveness,
      } = rawDatum.node;
      if (naceId !== null && avgViability !== null && avgAttractiveness !== null) {
        const targetNaceIndustry = rawNaceData.find(edge => edge && edge.node && edge.node.naceId === naceId);
        if (targetNaceIndustry && targetNaceIndustry.node && targetNaceIndustry.node.name) {
          csvData.push({naceId, industryName: targetNaceIndustry.node.name, avgViability, avgAttractiveness});
          scatterPlotData.push({
            label: targetNaceIndustry.node.name,
            x: parseFloat(avgViability),
            y: parseFloat(avgAttractiveness),
            tooltipContent: `
              <strong>Viability:</strong> ${avgViability}
              <br />
              <strong>Attractiveness:</strong> ${avgAttractiveness}
            `,
          });
        }
      }
    }
  });
  return {scatterPlotData, csvData};
};

export const updateScatterPlotData = (scatterPlotData: ScatterPlotDatum[], selectedIndustry: TreeNode | undefined) => {
  return scatterPlotData.map(datum => {
    const fill = selectedIndustry && selectedIndustry.label === datum.label
        ? rgba(colorScheme.data, 0.4) : rgba(colorScheme.data, 0.5);
    const highlighted = selectedIndustry && selectedIndustry.label === datum.label
        ? true : false;
    return { ...datum, fill, highlighted };
  });
};

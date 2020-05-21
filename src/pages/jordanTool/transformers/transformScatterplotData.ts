import {
  JordanIndustry,
} from '../graphql/graphQLTypes';
import {rgba} from 'polished';
import { Datum as ScatterPlotDatum } from '../../../components/dataViz/scatterPlot';
import { TreeNode } from 'react-dropdown-tree-select';


export interface CSVDatum {
  ['Industry Code']: string;
  ['Theme']: string;
  ['SubTheme']: string;
  ['Description']: string;
  ['Average Viability']: number;
  ['Average Attractiveness']: number;
  ['RCA']: number;
}

interface Input {
  rawDatum: JordanIndustry[];
  id: string;
  setSelectedIndustry: (value: TreeNode) => void;
}

export default (input: Input): {scatterPlotData: ScatterPlotDatum[], csvData: CSVDatum[]} => {
  const {
    rawDatum, id, setSelectedIndustry,
  } = input;
  const transformedData: ScatterPlotDatum[] = [];
  const csvData: CSVDatum[] = [];
  rawDatum.forEach((datum) => {
    const { industryCode, title, keywords, description, factors } = datum;
    if (industryCode && title && keywords && description &&
        factors && factors.edges && factors.edges[0] && factors.edges[0].node &&
        factors.edges[0].node.viability !== null && factors.edges[0].node.attractiveness !== null &&
        factors.edges[0].node.rca !== null
      ) {
      const color = factors.edges[0].node.rca < 1 ? '#46899F' : '#E0B04E';
      const x = factors.edges[0].node.viability;
      const y = factors.edges[0].node.attractiveness;
      const onClick = () => setSelectedIndustry({value: industryCode, label: title });
      transformedData.push({
        label: title,
        x,
        y,
        fill: rgba(color, 0.5),
        highlighted: (industryCode === id),
        tooltipContent:
          '<strong>Theme:</strong> ' + description +
          '<br /><strong>SubTheme:</strong> ' + keywords +
          '<br /><strong>Description:</strong> ' + title +
          '<br /><strong>Viability:</strong> ' + x +
          '<br /><strong>Attractiveness:</strong> ' + y,
        tooltipContentOnly: true,
        onClick,
      });
      csvData.push({
        'Industry Code': industryCode,
        'Theme': description,
        'SubTheme': keywords,
        'Description': title,
        'Average Viability': x,
        'Average Attractiveness': y,
        'RCA': factors.edges[0].node.rca,
      });
    }
  });
  return {scatterPlotData: transformedData, csvData};
};

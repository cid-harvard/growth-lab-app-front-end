import {
  TopFDIConnection,
} from '../graphql/graphQLTypes';

export interface FdiListDatum {
  rank: number;
  company: string;
  sourceCountry: string;
  capitalInvestment: number;
}

interface Input {
  globalTopFdiEdges: TopFDIConnection['edges'];
  regionTopFdiEdges: TopFDIConnection['edges'];
}

export default ({globalTopFdiEdges, regionTopFdiEdges}: Input) => {
  const globalTopFdiList: FdiListDatum[] = [];
  globalTopFdiEdges.forEach(edge => {
    if (edge && edge.node) {
      const { rank, company, sourceCountry, capitalInvestment } = edge.node;
      if (company !== null && sourceCountry !== null && capitalInvestment !== null) {
        globalTopFdiList.push({
          rank: parseInt(rank, 10),
          company, sourceCountry, capitalInvestment,
        });
      }
    }
  });
  const regionTopFdiList: FdiListDatum[] = [];
  regionTopFdiEdges.forEach(edge => {
    if (edge && edge.node) {
      const { rank, company, sourceCountry, capitalInvestment } = edge.node;
      if (company !== null && sourceCountry !== null && capitalInvestment !== null) {
        regionTopFdiList.push({
          rank: parseInt(rank, 10),
          company, sourceCountry, capitalInvestment,
        });
      }
    }
  });

  return {
    globalTopFdiList, regionTopFdiList,
  };
};
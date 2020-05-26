import {
  FDIMarketConnection,
  FDIMarketOvertimeDestination,
} from '../graphql/graphQLTypes';
import sortBy from 'lodash/sortBy';

interface Input {
  fdiMarketsEdges: FDIMarketConnection['edges'];
  destination: FDIMarketOvertimeDestination;
  showZeroValues?: boolean;
}

export default (input: Input) => {
  const {
    fdiMarketsEdges, destination, showZeroValues,
  } = input;
  const sortedMarkets = sortBy(fdiMarketsEdges, (edge) => {
    if (edge && edge.node) {
      if (destination === FDIMarketOvertimeDestination.Balkans) {
        return edge.node.projectsBalkans;
      } else if (destination === FDIMarketOvertimeDestination.RestOfEurope) {
        return edge.node.projectsEurope;
      } else if (destination === FDIMarketOvertimeDestination.RestOfWorld) {
        return edge.node.projectsWorld;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  });
  const topList = sortedMarkets.reverse().slice(0, 10);
  const transformedList: {company: string, country: string, city: string}[] = [];
  topList.forEach(edge => {
    if (edge && edge.node) {
      if (
        (destination === FDIMarketOvertimeDestination.Balkans && edge.node.projectsBalkans) ||
        (destination === FDIMarketOvertimeDestination.RestOfEurope && edge.node.projectsEurope) ||
        (destination === FDIMarketOvertimeDestination.RestOfWorld && edge.node.projectsWorld) ||
        showZeroValues
      ) {
        transformedList.push({
          company: edge.node.parentCompany,
          country: edge.node.sourceCountry,
          city: edge.node.sourceCity,
        });
      }
    }
  });
  return transformedList;
};
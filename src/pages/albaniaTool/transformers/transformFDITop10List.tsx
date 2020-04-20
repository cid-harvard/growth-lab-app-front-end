import {
  FDIMarketConnection,
  FDIMarketOvertimeDestination,
} from '../../../graphql/graphQLTypes';
import sortBy from 'lodash/sortBy';

export default (fdiMarketsEdges: FDIMarketConnection['edges'], destination: FDIMarketOvertimeDestination) => {
  const sortedMarkets = sortBy(fdiMarketsEdges, (edge) => {
    if (edge && edge.node) {
      if (destination === FDIMarketOvertimeDestination.Balkans) {
        return edge.node.capexBalkans;
      } else if (destination === FDIMarketOvertimeDestination.RestOfEurope) {
        return edge.node.capexEurope;
      } else if (destination === FDIMarketOvertimeDestination.RestOfWorld) {
        return edge.node.capexWorld;
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
        (destination === FDIMarketOvertimeDestination.Balkans && edge.node.capexBalkans) ||
        (destination === FDIMarketOvertimeDestination.RestOfEurope && edge.node.capexEurope) ||
        (destination === FDIMarketOvertimeDestination.RestOfWorld && edge.node.capexWorld)
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
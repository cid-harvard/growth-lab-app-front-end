import { Datum as BarChartDatum } from '../../../components/dataViz/barChart';
import {
    FDIMarketOvertimeDestination,
    FDIMarketOvertime,
    FDIMarketOvertimeEdge,
} from '../../../graphql/graphQLTypes';
import { colorScheme } from '../Utils';

export default (edgeData: (FDIMarketOvertimeEdge | null)[], naceId: string) => {
  const stackedBarChartData: BarChartDatum[][] = [];
  let stackedBarChartCSVData: object[] = [];
  if (edgeData && edgeData.length) {
    const balkansEdge = edgeData.find(
      datum => datum && datum.node !== null && datum.node.destination === FDIMarketOvertimeDestination.Balkans);
    const balkansNode: FDIMarketOvertime = balkansEdge && balkansEdge.node ? balkansEdge.node
      : {
          naceId, destination: FDIMarketOvertimeDestination.Balkans,
          projects0306: 0, projects0710: 0, projects1114: 0, projects1518: 0,
      };
    const europeEdge =edgeData.find(
      datum => datum && datum.node !== null && datum.node.destination === FDIMarketOvertimeDestination.RestOfEurope);
    const europeNode: FDIMarketOvertime = europeEdge && europeEdge.node ? europeEdge.node
      : {
          naceId, destination: FDIMarketOvertimeDestination.RestOfEurope,
          projects0306: 0, projects0710: 0, projects1114: 0, projects1518: 0,
      };
    const worldEdge = edgeData.find(
      datum => datum && datum.node !== null && datum.node.destination === FDIMarketOvertimeDestination.RestOfWorld);
    const worldNode: FDIMarketOvertime = worldEdge && worldEdge.node ? worldEdge.node
      : {
          naceId, destination: FDIMarketOvertimeDestination.RestOfWorld,
          projects0306: 0, projects0710: 0, projects1114: 0, projects1518: 0,
      };
    const balkansProjects = {
      projects0306: balkansNode.projects0306 ? balkansNode.projects0306 : 0,
      projects0710: balkansNode.projects0710 ? balkansNode.projects0710 : 0,
      projects1114: balkansNode.projects1114 ? balkansNode.projects1114 : 0,
      projects1518: balkansNode.projects1518 ? balkansNode.projects1518 : 0,
    };
    const europeProjects = {
      projects0306: europeNode.projects0306 ? europeNode.projects0306 : 0,
      projects0710: europeNode.projects0710 ? europeNode.projects0710 : 0,
      projects1114: europeNode.projects1114 ? europeNode.projects1114 : 0,
      projects1518: europeNode.projects1518 ? europeNode.projects1518 : 0,
    };
    const worldProjects = {
      projects0306: worldNode.projects0306 ? worldNode.projects0306 : 0,
      projects0710: worldNode.projects0710 ? worldNode.projects0710 : 0,
      projects1114: worldNode.projects1114 ? worldNode.projects1114 : 0,
      projects1518: worldNode.projects1518 ? worldNode.projects1518 : 0,
    };
    stackedBarChartData.push([
      {
       y: worldProjects.projects0306 + europeProjects.projects0306 + balkansProjects.projects0306,
       x: "'03-'06",
       fill: colorScheme.primary,
       tooltipContent:
        `<strong>Total for World:</strong> ${
          worldProjects.projects0306 + europeProjects.projects0306 + balkansProjects.projects0306
        }
        <br />
        <strong>Difference for World:</strong> ${worldProjects.projects0306}`,
      },
      {
       y: worldProjects.projects0710 + europeProjects.projects0710 + balkansProjects.projects0710,
       x: "'07-'10",
       fill: colorScheme.primary,
       tooltipContent:
        `<strong>Total for World:</strong> ${
          worldProjects.projects0710 + europeProjects.projects0710 + balkansProjects.projects0710
        }
        <br />
        <strong>Difference for World:</strong> ${worldProjects.projects0710}`,
      },
      {
       y: worldProjects.projects1114 + europeProjects.projects1114 + balkansProjects.projects1114,
       x: "'11-'14",
       fill: colorScheme.primary,
       tooltipContent:
        `<strong>Total for World:</strong> ${
          worldProjects.projects1114 + europeProjects.projects1114 + balkansProjects.projects1114
        }
        <br />
        <strong>Difference for World:</strong> ${worldProjects.projects1114}`,
      },
      {
       y: worldProjects.projects1518 + europeProjects.projects1518 + balkansProjects.projects1518,
       x: "'15-'18",
       fill: colorScheme.primary,
       tooltipContent:
        `<strong>Total for World:</strong> ${
          worldProjects.projects1518 + europeProjects.projects1518 + balkansProjects.projects1518
        }
        <br />
        <strong>Difference for World:</strong> ${worldProjects.projects1518}`,
      },
    ]);
    stackedBarChartData.push([
      {
       y: europeProjects.projects0306 + balkansProjects.projects0306,
       x: "'03-'06",
       fill: colorScheme.quaternary,
       tooltipContent:
        `<strong>Total for Europe:</strong> ${europeProjects.projects0306 + balkansProjects.projects0306}
        <br />
        <strong>Difference for Europe:</strong> ${worldProjects.projects0306}`,
      },
      {
       y: europeProjects.projects0710 + balkansProjects.projects0710,
       x: "'07-'10",
       fill: colorScheme.quaternary,
       tooltipContent:
        `<strong>Total for Europe:</strong> ${europeProjects.projects0710 + balkansProjects.projects0710}
        <br />
        <strong>Difference for Europe:</strong> ${worldProjects.projects0710}`,
      },
      {
       y: europeProjects.projects1114 + balkansProjects.projects1114,
       x: "'11-'14",
       fill: colorScheme.quaternary,
       tooltipContent:
        `<strong>Total for Europe:</strong> ${europeProjects.projects1114 + balkansProjects.projects1114}
        <br />
        <strong>Difference for Europe:</strong> ${worldProjects.projects1114}`,
      },
      {
       y: europeProjects.projects1518 + balkansProjects.projects1518,
       x: "'15-'18",
       fill: colorScheme.quaternary,
       tooltipContent:
        `<strong>Total for Europe:</strong> ${europeProjects.projects1518 + balkansProjects.projects1518}
        <br />
        <strong>Difference for Europe:</strong> ${worldProjects.projects1518}`,
      },
    ]);
    stackedBarChartData.push([
      {
       y: balkansProjects.projects0306,
       x: "'03-'06",
       fill: colorScheme.header,
       tooltipContent:
        `<strong>Total for Balkans:</strong> ${balkansProjects.projects0306}`,
      },
      {
       y: balkansProjects.projects0710,
       x: "'07-'10",
       fill: colorScheme.header,
       tooltipContent:
        `<strong>Total for Balkans:</strong> ${balkansProjects.projects0710}`,
      },
      {
       y: balkansProjects.projects1114,
       x: "'11-'14",
       fill: colorScheme.header,
       tooltipContent:
        `<strong>Total for Balkans:</strong> ${balkansProjects.projects1114}`,
      },
      {
       y: balkansProjects.projects1518,
       x: "'15-'18",
       fill: colorScheme.header,
       tooltipContent:
        `<strong>Total for Balkans:</strong> ${balkansProjects.projects1518}`,
      },
    ]);
    stackedBarChartCSVData = [
      {
        'location': 'Balkans',
        "'03-'06": balkansProjects.projects0306,
        "'07-'10": balkansProjects.projects0710,
        "'11-'14": balkansProjects.projects1114,
        "'15-'18": balkansProjects.projects1518,
      },
      {
        'location': 'Rest of Europe',
        "'03-'06": europeProjects.projects0306,
        "'07-'10": europeProjects.projects0710,
        "'11-'14": europeProjects.projects1114,
        "'15-'18": europeProjects.projects1518,
      },
      {
        'location': 'Rest of World',
        "'03-'06": worldProjects.projects0306,
        "'07-'10": worldProjects.projects0710,
        "'11-'14": worldProjects.projects1114,
        "'15-'18": worldProjects.projects1518,
      },
    ];
  }
  return {stackedBarChartData, stackedBarChartCSVData};
};
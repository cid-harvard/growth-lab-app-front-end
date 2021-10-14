import React from 'react';
import {
  ProductClass,
  generateStringId,
  colorScheme,
} from './Utils';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import ContentWrapper from './Content';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {
  HSProduct,
  Factor,
} from './graphql/graphQLTypes';
import {rgba} from 'polished';
import {Datum} from 'react-panel-search';
import sortBy from 'lodash/sortBy';
import partition from 'lodash/partition';
import {TableDatum} from './components/SharedAndMissingOccupations';

const GET_HS_PRODUCT = gql`
  query GetHSProduct($hsId: Int!) {
    datum: namibiaHs(hsId: $hsId) {
      id
      hsId
      name
      code
      factors {
        edges {
          node {
            aRelativeDemand
            aResiliency
            aEmploymentGroupsInterest
            aFdi
            aExportPropensity
            fPortPropensity
            fExistingPresence
            fRemoteness
            fScarceFactors
            fInputAvailability
            attractiveness
            feasibility
            shareFemale
            shareYouth
            shareLskill
            rca
            id
          }
        }
      }
      proximity {
        edges {
          node {
            partnerId
            proximity
            rank
            id
            factors {
              edges {
                node {
                  rca
                }
              }
            }
          }
        }
      }
      relativeDemand {
        edges {
          node {
            locationCode
            countryDemandAvg
            countryDemandPcAvg
            id
          }
        }
      }
      occupation {
        edges {
          node {
            occupation
            isAvailable
            rank
            pctShare
            id
          }
        }
      }
    }
    scatterPlotData: namibiaHsList(complexityReport: true) {
      hsId
      name
      code
      id
      factors {
        edges {
          node {
            attractiveness
            feasibility
            id
          }
        }
      }
    }
  }
`;

interface SuccessResponse {
  datum: {
    hsId: HSProduct['hsId'],
    name: HSProduct['name'],
    code: HSProduct['code'],
    factors: HSProduct['factors'],
    proximity: HSProduct['proximity'],
    relativeDemand: HSProduct['relativeDemand'],
    occupation: HSProduct['occupation'],
  };
  scatterPlotData: {
    hsId: HSProduct['hsId'];
    name: HSProduct['name'];
    code: HSProduct['code'];
    id: HSProduct['id'];
    factors: {
      edges: {
        node: {
          attractiveness: Factor['attractiveness'];
          feasibility: Factor['feasibility'];
        },
      }[],
    }
  }[];
}

interface Props {
  id: string;
  setStickyHeaderHeight: (h: number) => void;
  onNodeClick: (id: string) => void;
  allData: Datum[];
  averageFeasibility: number;
  averageAttractiveness: number;
  medianFeasibility: number;
  medianAttractiveness: number;
}

const QueryHS = (props: Props) => {
  const {
    id, setStickyHeaderHeight, onNodeClick, allData,
    averageFeasibility, averageAttractiveness,
    medianFeasibility, medianAttractiveness,
  } = props;

  const {loading, error, data} = useQuery<SuccessResponse, {hsId: number}>(GET_HS_PRODUCT, {
    variables: {hsId: parseInt(id, 10)},
  });

  if (loading === true) {
    return <Loading />;
  } else if (error !== undefined) {
    return (
      <FullPageError
        message={error.message}
      />
    );
  } else if (data) {
    const scatterPlotJsonData: {
      Name: string,
      Code: string,
      Feasibility: number,
      Attractiveness: number,
    }[] = [];
    const scatterPlotData = data.scatterPlotData.map(d => {
      const {attractiveness, feasibility} = d.factors.edges[0].node;
      scatterPlotJsonData.push({
        Name: d.name,
        Code: 'HS ' + d.code,
        Feasibility: feasibility,
        Attractiveness: attractiveness,
      });
      return {
        label: d.name,
        x: feasibility,
        y: attractiveness,
        tooltipContent: `
          <strong>Feasibility:</strong> ${feasibility.toFixed(2)}
          <br />
          <strong>Attractiveness:</strong> ${attractiveness.toFixed(2)}
        `,
        fill: d.code === data.datum.code ? rgba(colorScheme.dataSecondary, 0) : rgba(colorScheme.data, 0.5),
        highlighted: false,
        onClick: () => onNodeClick(generateStringId(ProductClass.HS, d.hsId)),
      };
    });
    scatterPlotData.push({
      label: data.datum.name,
      x: data.datum.factors.edges[0].node.feasibility,
      y: data.datum.factors.edges[0].node.attractiveness,
      tooltipContent: `
        <strong>Feasibility:</strong> ${data.datum.factors.edges[0].node.feasibility.toFixed(2)}
        <br />
        <strong>Attractiveness:</strong> ${data.datum.factors.edges[0].node.attractiveness.toFixed(2)}
      `,
      fill: rgba(colorScheme.dataSecondary, 0.5),
      highlighted: true,
      onClick: () => onNodeClick(generateStringId(ProductClass.HS, data.datum.hsId)),
    });
    const proximityData = sortBy(data.datum.proximity.edges.map(({node: {partnerId, rank, factors}}) => {
      const target = allData.find(d => d.id === generateStringId(ProductClass.HS, partnerId));
      const name = target && target.title ? target.title : '---';
      const rca = factors && factors.edges && factors.edges[0] && factors.edges[0].node && factors.edges[0].node.rca && factors.edges[0].node.rca >= 1
        ? 'Yes'
        : 'No';
      return { name, rank, rca};
    }), ['rank']);
    const heatMapData = data.datum.relativeDemand.edges.map(({node}) => node);
    const [shared, missing] = partition(data.datum.occupation.edges, ({node}) => node.isAvailable);
    const sharedData: TableDatum[] = sortBy(shared, ['rank']).map(d => {
      return {
        occupation: d.node.occupation,
        percent: d.node.pctShare.toFixed(2) + '%',
      };
    });
    const missingData: TableDatum[] = sortBy(missing, ['rank']).map(d => {
      return {
        occupation: d.node.occupation,
        percent: d.node.pctShare.toFixed(2) + '%',
      };
    });
    return (
      <ContentWrapper
        id={generateStringId(ProductClass.HS, data.datum.hsId)}
        name={data.datum.name}
        code={data.datum.code}
        factors={data.datum.factors.edges[0].node}
        productClass={ProductClass.HS}
        setStickyHeaderHeight={setStickyHeaderHeight}
        scatterPlotData={scatterPlotData}
        scatterPlotJsonData={scatterPlotJsonData}
        proximityData={proximityData}
        heatMapData={heatMapData}
        sharedData={sharedData}
        missingData={missingData}
        averageFeasibility={averageFeasibility}
        averageAttractiveness={averageAttractiveness}
        medianFeasibility={medianFeasibility}
        medianAttractiveness={medianAttractiveness}
      />
    );
  } else {
    return null;
  }

};

export default QueryHS;

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
  NAICSIndustry,
  Factor,
} from './graphql/graphQLTypes';
import {rgba} from 'polished';
import {Datum} from 'react-panel-search';
import sortBy from 'lodash/sortBy';
import partition from 'lodash/partition';
import {MissingSharedDatum} from './components/SharedAndMissingOccupations';

const GET_NAICS_PRODUCT = gql`
  query GetNAICSIndustry($naicsId: Int!) {
    datum: namibiaNaics(naicsId: $naicsId) {
      id
      naicsId
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
            id
            rca
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
            id
          }
        }
      }
    }
    scatterPlotData: namibiaNaicsList(complexityReport: true) {
      naicsId
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
    naicsId: NAICSIndustry['naicsId'],
    name: NAICSIndustry['name'],
    code: NAICSIndustry['code'],
    factors: NAICSIndustry['factors'],
    proximity: NAICSIndustry['proximity'],
    relativeDemand: NAICSIndustry['relativeDemand'],
    occupation: NAICSIndustry['occupation'],
  };
  scatterPlotData: {
    naicsId: NAICSIndustry['naicsId'];
    name: NAICSIndustry['name'];
    code: NAICSIndustry['code'];
    id: NAICSIndustry['id'];
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
}

const QueryNAICS = (props: Props) => {
  const {
    id, setStickyHeaderHeight, onNodeClick, allData,
    averageFeasibility, averageAttractiveness,
  } = props;

  const {loading, error, data} = useQuery<SuccessResponse, {naicsId: number}>(GET_NAICS_PRODUCT, {
    variables: {naicsId: parseInt(id, 10)},
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
        Code: 'NAICS ' + d.code,
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
        onClick: () => onNodeClick(generateStringId(ProductClass.NAICS, d.naicsId)),
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
      onClick: () => onNodeClick(generateStringId(ProductClass.NAICS, data.datum.naicsId)),
    });
    const proximityData = sortBy(data.datum.proximity.edges.map(({node: {partnerId, rank, factors}}) => {
      const target = allData.find(d => d.id === generateStringId(ProductClass.NAICS, partnerId));
      const name = target && target.title ? target.title : '---';
      const rca = factors && factors.edges && factors.edges[0] && factors.edges[0].node && factors.edges[0].node.rca && factors.edges[0].node.rca >= 1
        ? 'Yes'
        : 'No';
      return {name, rank, rca};
    }), ['rank']);
    const heatMapData = data.datum.relativeDemand.edges.map(({node}) => node);
    const [shared, missing] = partition(data.datum.occupation.edges, ({node}) => node.isAvailable);
    const sortedShared = sortBy(shared, ['rank']);
    const sortedMissing = sortBy(missing, ['rank']);
    const sharedMissingData: MissingSharedDatum[] = [];
    for(let i = 0; i < 10; i++) {
      const targetShared = sortedShared[i] ? shared[i].node.occupation : null;
      const targetMissing = sortedMissing[i] ? missing[i].node.occupation : null;
      if (targetMissing || targetShared) {
        sharedMissingData.push({
          shared: targetShared,
          missing: targetMissing,
        });
      }
    }
    return (
      <ContentWrapper
        id={generateStringId(ProductClass.NAICS, data.datum.naicsId)}
        name={data.datum.name}
        code={data.datum.code}
        factors={data.datum.factors.edges[0].node}
        productClass={ProductClass.NAICS}
        setStickyHeaderHeight={setStickyHeaderHeight}
        scatterPlotData={scatterPlotData}
        scatterPlotJsonData={scatterPlotJsonData}
        proximityData={proximityData}
        heatMapData={heatMapData}
        sharedMissingData={sharedMissingData}
        averageFeasibility={averageFeasibility}
        averageAttractiveness={averageAttractiveness}
      />
    );
  } else {
    return null;
  }

};

export default QueryNAICS;

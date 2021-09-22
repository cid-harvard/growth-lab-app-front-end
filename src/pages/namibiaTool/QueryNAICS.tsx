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
        }
      }[],
    }
  }[];
}

interface Props {
  id: string;
  setStickyHeaderHeight: (h: number) => void;
}

const QueryNAICS = (props: Props) => {
  const {
    id, setStickyHeaderHeight,
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
    const scatterPlotJsonData: Array<{
      Name: string,
      Code: string,
      Feasibility: number,
      Attractiveness: number,
    }> = [];
    const scatterPlotData = data.scatterPlotData.map(d => {
      const {attractiveness, feasibility} = d.factors.edges[0].node;
      scatterPlotJsonData.push({
        Name: d.name,
        Code: 'NAICS ' + d.code,
        Feasibility: feasibility,
        Attractiveness: attractiveness,
      })
      return {
        label: d.name,
        x: feasibility,
        y: attractiveness,
        tooltipContent: `
          <strong>Feasibility:</strong> ${feasibility.toFixed(2)}
          <br />
          <strong>Attractiveness:</strong> ${attractiveness.toFixed(2)}
        `,
        fill: rgba(colorScheme.data, 0.5),
        highlighted: false,
      }
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
      fill: rgba(colorScheme.data, 0.5),
      highlighted: true,
    })
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
      />
    );
  } else {
    return null;
  }

};

export default QueryNAICS;

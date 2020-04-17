import React from 'react';
import Content from './Content';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {
  NACEIndustryConnection,
  FactorsConnection,
  ScriptsConnection,
  Script,
} from '../../graphql/graphQLTypes';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import transformNaceData from './transformNaceData';
import transformScatterplotData from './transformScatterplotData';

const GET_ALL_INDUSTRIES = gql`
  query GetAllIndustries {
    naceIndustryList {
      edges {
        node {
          naceId
          level
          code
          name
          parentId
          id
        }
      }
    }
    factorsList {
      edges {
        node {
          naceId
          avgViability
          avgAttractiveness
          rca
          id
        }
      }
    }
    script {
      edges {
        node {
          section
          subsection
          text
          id
        }
      }
    }
  }
`;

interface SuccessResponse {
  naceIndustryList: NACEIndustryConnection;
  factorsList: FactorsConnection;
  script: ScriptsConnection;
}

const AlbaniaTool = () => {
  const {loading, error, data} = useQuery<SuccessResponse, never>(GET_ALL_INDUSTRIES);
  if (loading) {
    return <Loading />;
  } else if (error) {
    return (
      <FullPageError
        message={error.message}
      />
    );
  } else if (data !== undefined) {
    const {
      naceIndustryList: {edges: naceEdges},
      factorsList: {edges: factorsEdges},
      script: {edges: scriptEdges},
    } = data;
    const scripts: Script[] = []
    scriptEdges.forEach(edge => {
      if (edge !== null && edge.node !== null) {
        scripts.push({...edge.node});
      }
    })
    const naceData = transformNaceData(naceEdges);
    const { scatterPlotData, csvData } = transformScatterplotData(factorsEdges, naceEdges);
    return (
      <>
        <Content
          naceData={naceData}
          scatterPlotData={scatterPlotData}
          scatterPlotDataForDownload={csvData}
          scripts={scripts}
        />
      </>
    );
  } else {
    return null;
  }
};

export default AlbaniaTool;
import React from 'react';
import Content from './Content';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import {
  Factors,
  Script,
  NACEIndustry,
} from './graphql/graphQLTypes';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import transformNaceData from './transformers/transformNaceData';
import transformScatterplotData from './transformers/transformScatterplotData';

const GET_ALL_INDUSTRIES = gql`
  query GetAllIndustries {
    naceIndustryList: albaniaNaceIndustryList {
      naceId
      level
      code
      name
      parentId
    }
    factors {
      naceId
      avgViability
      avgAttractiveness
      rca
    }
    script {
      section
      subsection
      text
    }
  }
`;

interface SuccessResponse {
  naceIndustryList: NACEIndustry[];
  factors: Factors[];
  script: Script[];
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
      naceIndustryList,
      factors,
      script,
    } = data;
    const naceData = transformNaceData(naceIndustryList);
    const { scatterPlotData, csvData } = transformScatterplotData(factors, naceIndustryList);
    return (
      <>
        <Content
          naceData={naceData}
          rawNaceData={naceIndustryList}
          scatterPlotData={scatterPlotData}
          scatterPlotDataForDownload={csvData}
          scripts={script}
        />
      </>
    );
  } else {
    return null;
  }
};

export default AlbaniaTool;
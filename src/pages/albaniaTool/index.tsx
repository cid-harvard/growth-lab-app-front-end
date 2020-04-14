import React from 'react';
import Content from './Content';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { NACEIndustryConnection } from '../../graphql/graphQLTypes';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import transformNaceData from './transformNaceData';

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
  }
`;

interface SuccessResponse {
  naceIndustryList: NACEIndustryConnection;
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
    const { naceIndustryList: {edges} } = data;
    const naceData = transformNaceData(edges);
    return (
      <>
        <Content
          naceData={naceData}
        />
      </>
    );
  } else {
    return null;
  }
};

export default AlbaniaTool;
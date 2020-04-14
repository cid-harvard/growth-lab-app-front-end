import React from 'react';
import Content from './Content';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { NACEIndustryConnection } from '../../graphql/graphQLTypes';


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
  const {loading, error, data} = useQuery<SuccessResponse, {}>(GET_ALL_INDUSTRIES);
  console.log({loading, error, data});
  return (
    <>
      <Content />
    </>
  );
};

export default AlbaniaTool;
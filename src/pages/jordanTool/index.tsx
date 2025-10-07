import React from 'react';
import Content from './Content';
import {
  JordanIndustry,
} from './graphql/graphQLTypes';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { TreeNode } from 'react-dropdown-tree-select';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';

const GET_ALL_JORDAN_INDUSTRIES_DATA = gql`
  query GetAllJordanIndustries {
    jordanIndustryList {
      industryCode
      title
      description
      keywords
      factors {
        edges {
          node {
            attractiveness
            viability
            rca
          }
        }
      }
    }
  }
`;

interface SuccessResponse {
  jordanIndustryList: JordanIndustry[];
}

const JordanToolEntry = () => {
  const {loading, error, data} = useQuery<SuccessResponse, never>(GET_ALL_JORDAN_INDUSTRIES_DATA);

  if (loading) {
    return <Loading />;
  } else if (error) {
    return (
      <FullPageError
        message={error.message}
      />
    );
  } else if (data !== undefined) {
    const {jordanIndustryList} = data;
    const industryData: TreeNode[] = [];
    jordanIndustryList.forEach(({industryCode, title, description}) => {
      if (title && description) {
        const parentIndex = industryData.length
          ? industryData.findIndex(({value}) => value === description) : -1;
        if (parentIndex === -1) {
          // parent does not exist, create new entry
          industryData.push({
            label: description,
            value: description,
            className: 'no-select-parent',
            disabled: true,
            children: [{
              label: title,
              value: industryCode,
              disabled: false,
            }],
          });
        } else {
          // parent already exists, push to existing parent
          industryData[parentIndex].children.push({
            label: title,
            value: industryCode,
            disabled: false,
          });
        }
      }
    });
    return (
      <Content
        industryList={industryData}
        rawIndustryList={jordanIndustryList}
      />
    );
  } else {
    return null;
  }
};

export default JordanToolEntry;

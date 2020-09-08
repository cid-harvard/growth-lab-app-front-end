import React, {useState} from 'react';
import Content from './Content';
import PasswordProtectedPage from '../../components/text/PasswordProtectedPage';
import {colorScheme} from './fetchData';
import {
  JordanIndustry,
} from './graphql/graphQLTypes';
import { useQuery } from '@apollo/react-hooks';
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

const numDaysBetween = function(d1: Date, d2: Date) {
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return diff / (1000 * 60 * 60 * 24);
};

const JordanToolEntry = () => {

  let initialLockedState: boolean = true;

  const localStorageKey = process.env.REACT_APP_JORDAN_LOCALSTORAGE_KEY;
  const localStorageTimestampKey = process.env.REACT_APP_JORDAN_LOCALSTORAGE_TIMESTAMP_KEY;
  if (localStorageKey && localStorageTimestampKey) {
    const storedKeyVal = localStorage.getItem(localStorageKey);
    const storedKeyTimestamp = localStorage.getItem(localStorageTimestampKey);
    if (storedKeyVal === process.env.REACT_APP_JORDAN_PASSWORD && storedKeyTimestamp) {
      const d1 = new Date();
      const d2 = new Date(storedKeyTimestamp);
      if (numDaysBetween(d1, d2) < 30) {
        initialLockedState = false;
      }
    }
  }

  const [locked, setLocked] = useState<boolean>(initialLockedState);

  const checkPassword = (val: string) => {
    if (val === process.env.REACT_APP_JORDAN_PASSWORD) {
      setLocked(false);
      if (localStorageKey && localStorageTimestampKey) {
        localStorage.setItem(localStorageKey, val);
        localStorage.setItem(localStorageTimestampKey, new Date().toString());
      }
    }
  };

  const {loading, error, data} = useQuery<SuccessResponse, never>(GET_ALL_JORDAN_INDUSTRIES_DATA);

  if (locked) {
    return (
      <PasswordProtectedPage
        title={'Please enter your password to enter the tool'}
        onPasswordSubmit={checkPassword}
        buttonColor={colorScheme.primary}
      />
    );
  } else {
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
  }
};

export default JordanToolEntry;

import React from 'react';
import { ProductClass, generateStringId } from './Utils';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import ContentWrapper from './Content';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {
  NAICSIndustry,
} from './graphql/graphQLTypes';

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
  }
`;

interface SuccessResponse {
  datum: {
    naicsId: NAICSIndustry['naicsId'],
    name: NAICSIndustry['name'],
    code: NAICSIndustry['code'],
    factors: NAICSIndustry['factors'],
  };
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
    return (
      <ContentWrapper
        id={generateStringId(ProductClass.NAICS, data.datum.naicsId)}
        name={data.datum.name}
        code={data.datum.code}
        factors={data.datum.factors.edges[0].node}
        productClass={ProductClass.NAICS}
        setStickyHeaderHeight={setStickyHeaderHeight}
      />
    );
  } else {
    return null;
  }

};

export default QueryNAICS;

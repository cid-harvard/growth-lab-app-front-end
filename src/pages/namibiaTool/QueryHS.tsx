import React from 'react';
import { ProductClass, generateStringId } from './Utils';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import ContentWrapper from './Content';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {
  HSProduct,
} from './graphql/graphQLTypes';

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
  };
}

interface Props {
  id: string;
  setStickyHeaderHeight: (h: number) => void;
}

const QueryHS = (props: Props) => {
  const {
    id, setStickyHeaderHeight,
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
    return (
      <ContentWrapper
        id={generateStringId(ProductClass.HS, data.datum.hsId)}
        name={data.datum.name}
        code={data.datum.code}
        factors={data.datum.factors.edges[0].node}
        productClass={ProductClass.HS}
        setStickyHeaderHeight={setStickyHeaderHeight}
      />
    );
  } else {
    return null;
  }

};

export default QueryHS;

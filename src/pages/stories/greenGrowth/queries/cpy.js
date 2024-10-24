import { gql } from '@apollo/client';

export const GG_CPY_LIST_QUERY = gql`
  query ggCpyList($year: Int!, $countryId: Int!) {
    ggCpyList(year: $year, countryId: $countryId) {
      year
      countryId
      productId
      exportRca
      normalizedExportRca
      productRanking
      exportValue
      expectedExports
      feasibility
      attractiveness
      id
    }
  }
`;


import { gql } from "@apollo/client";

export const GG_CPY_LIST_QUERY = gql`
  query ggCpyList($year: Int!, $countryId: Int!) {
    ggCpyList(year: $year, countryId: $countryId) {
      year
      countryId
      productId
      exportRca
      normalizedExportRca
      exportValue
      expectedExports
      normalizedPci
      normalizedCog
      feasibility
      effectiveNumberOfExporters
      marketGrowth
      pciStd
      cogStd
      feasibilityStd
      pciCogFeasibilityComposite
    }
    ggCpyscList(year: $year, countryId: $countryId) {
      year
      countryId
      productId
      supplyChainId
    }
  }
`;

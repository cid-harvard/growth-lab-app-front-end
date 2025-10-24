import { gql } from "@apollo/client";

export const GET_COUNTRIES = gql`
  query GetCountries {
    gpLocationCountryList {
      countryId
      nameEn
      nameShortEn
      nameEs
      nameShortEs
      iso3Code
      iso2Code
      legacyLocationId
      nameAbbrEn
      thePrefix
      formerCountry
      rankingsOverride
      cpOverride
      incomelevelEnum
      countryProject
    }
  }
`;

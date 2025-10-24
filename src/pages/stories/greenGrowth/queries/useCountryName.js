import { useCountrySelection } from "../hooks/useUrlParams";
import { GET_COUNTRIES } from "./shared";
import { useQuery } from "@apollo/react-hooks";

export const useCountryName = () => {
  const selectedCountryId = useCountrySelection();
  const { data: countryData } = useQuery(GET_COUNTRIES);
  const selectedCountry = countryData?.gpLocationCountryList.find(
    (country) => country.countryId === selectedCountryId,
  );
  return selectedCountry?.nameEn || "the selected country";
};

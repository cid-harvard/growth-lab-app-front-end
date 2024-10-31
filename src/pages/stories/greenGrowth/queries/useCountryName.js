import { useRecoilValue } from "recoil";
import { countrySelectionState } from "../components/ScollamaStory";
import { GET_COUNTRIES } from "./countries";
import { useQuery } from "@apollo/react-hooks";

export const useCountryName = () => {
  const selectedCountryId = useRecoilValue(countrySelectionState);
  const { data: countryData } = useQuery(GET_COUNTRIES);
  const selectedCountry = countryData?.ggLocationCountryList.find(
    (country) => country.countryId === selectedCountryId,
  );
  return selectedCountry?.nameEn || "the selected country";
};

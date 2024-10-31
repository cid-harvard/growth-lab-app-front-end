import {
  AppBar,
  Box,
  MenuItem,
  Select,
  styled,
  Toolbar,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useRecoilState } from "recoil";

import { countrySelectionState, yearSelectionState } from "./ScollamaStory";
import { useQuery } from "@apollo/client";
import { GET_COUNTRIES } from "../queries/countries";
import GrowthLabLogoPNG from "../../../../assets/GL_logo_white.png";

const StyledAppBar = styled(AppBar)({
  background: "linear-gradient(135deg, #0a78b8 0%, #7de6de 100%)",
  boxShadow: "none",
});

const Logo = styled("img")({
  maxHeight: "40px",
});

const StyledSelect = styled(Select)({
  color: "white",
  "& .MuiSelect-icon": {
    color: "white",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
});

export const HeaderControls = () => {
  const [countrySelection, setCountrySelection] = useRecoilState(
    countrySelectionState,
  );
  const [yearSelection, setYearSelection] = useRecoilState(yearSelectionState);
  const { data } = useQuery(GET_COUNTRIES);
  const countries = data?.ggLocationCountryList || [];
  const availableYears = Array.from({ length: 11 }, (_, i) => 2022 - i);

  return (
    <StyledAppBar
      position="static"
      sx={{ position: "sticky", top: 0, zIndex: 1000 }}
    >
      <Toolbar>
        <Box display="flex" alignItems="center" width="100%">
          <Box flexGrow={1} display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center">
              <Autocomplete
                disableClearable
                value={
                  countries.find(
                    (country) => country.countryId === countrySelection,
                  ) || null
                }
                onChange={(event, newValue) => {
                  setCountrySelection(newValue ? newValue.countryId : null);
                }}
                options={countries}
                getOptionLabel={(option) => option.nameEn}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Select a country"
                    size="small"
                  />
                )}
                sx={{
                  width: 200,
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                    "&:hover fieldset": { borderColor: "white" },
                  },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiAutocomplete-popupIndicator": { color: "white" },
                  "& .MuiAutocomplete-clearIndicator": { color: "white" },
                }}
              />
            </Box>
            <Box display="flex" alignItems="center">
              <StyledSelect
                value={yearSelection}
                onChange={(e) => setYearSelection(e.target.value)}
                size="small"
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </StyledSelect>
            </Box>
          </Box>
          <Logo src={GrowthLabLogoPNG} alt="Growth Lab" />
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default HeaderControls;

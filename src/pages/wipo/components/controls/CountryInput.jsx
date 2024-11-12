import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { countries } from "../utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const CountryInput = () => {
  const { countryId } = useParams();

  const location = useLocation();
  const pathArr = location.pathname.split("/");
  const leafRoute = pathArr[4];
  const navigate = useNavigate();
  return (
    <FormControl fullWidth>
      <InputLabel
        sx={{ backgroundColor: "#F1F0EA", paddingLeft: 1, paddingRight: 1 }}
        id="country-select-label"
      >
        Country
      </InputLabel>
      <Select
        labelId="country-select-label"
        aria-label="Select country"
        id="country-select"
        value={countryId}
        label="Age"
        onChange={(d) =>
          navigate(`/wipo/country/${d.target.value}/${leafRoute}`)
        }
        IconComponent={ExpandMoreIcon}
      >
        {Object.entries(countries).map(([countryId, info]) => (
          <MenuItem key={countryId} value={countryId}>
            {info.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default CountryInput;

import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";

const SortControl = ({ sort, setSort }) => {
  return (
    <FormControl>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <FormLabel sx={{ pr: 2 }} id="sort-control-label">
          Sort by:
        </FormLabel>
        <RadioGroup
          row
          aria-labelledby="sort-control-label"
          name="sort-control-button-group"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <FormControlLabel
            value="value"
            control={<Radio />}
            label="Actual Production"
          />
          <FormControlLabel
            value="expected_value"
            control={<Radio />}
            label="Potential"
          />
          <FormControlLabel
            value="missing"
            control={<Radio />}
            label="Missing Link ? (Difference)"
          />
        </RadioGroup>
      </Box>
    </FormControl>
  );
};
export default SortControl;

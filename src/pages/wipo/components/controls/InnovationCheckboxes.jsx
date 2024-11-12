import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

const InnovationCheckboxes = ({
  setVisibleInnovations,
  visibleInnovations,
}) => {
  return (
    <FormGroup sx={{ display: "flex", flexDirection: "row" }}>
      <FormControlLabel
        componentsProps={{
          typography: { sx: { transform: "translate(-9px)" } },
        }}
        control={<Checkbox checked={visibleInnovations.includes("trade")} />}
        onChange={(e) =>
          e.target.checked
            ? setVisibleInnovations((i) => [...i, "trade"])
            : setVisibleInnovations(
                visibleInnovations.filter((d) => d !== "trade"),
              )
        }
        label="Trade"
      />
      <FormControlLabel
        componentsProps={{
          typography: { sx: { transform: "translate(-9px)" } },
        }}
        control={<Checkbox checked={visibleInnovations.includes("science")} />}
        onChange={(e) =>
          e.target.checked
            ? setVisibleInnovations((i) => [...i, "science"])
            : setVisibleInnovations((i) => i.filter((d) => d !== "science"))
        }
        label="Science"
      />
      <FormControlLabel
        componentsProps={{
          typography: { sx: { transform: "translate(-9px)" } },
        }}
        control={
          <Checkbox checked={visibleInnovations.includes("technology")} />
        }
        label="Technology"
        onChange={(e) =>
          e.target.checked
            ? setVisibleInnovations((i) => [...i, "technology"])
            : setVisibleInnovations((i) => i.filter((d) => d !== "technology"))
        }
      />
    </FormGroup>
  );
};
export default InnovationCheckboxes;

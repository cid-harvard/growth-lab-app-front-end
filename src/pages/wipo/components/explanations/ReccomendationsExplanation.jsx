import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { countries } from "../utils";

const ReccomendationsExplanation = () => {
  const { countryId } = useParams();
  const country = countries[countryId];

  return (
    <Box p={2}>
      <Typography
        sx={{ fontSize: 16, color: "#124E66", fontWeight: 700 }}
        gutterBottom
      >
        {`Are there missing links between the innovation dimensions of ${country.name}?`}
      </Typography>
      <Typography variant="body1" paragraph>
        This section examines the connection between the various dimensions of
        innovation on the global scale and identifies the potential of an
        innovation ecosystem for every technological field. Areas with high
        potential can highlight missing links between the ecosystem actors where
        integration could result in the appearance of new capabilities.
      </Typography>
    </Box>
  );
};
export default ReccomendationsExplanation;

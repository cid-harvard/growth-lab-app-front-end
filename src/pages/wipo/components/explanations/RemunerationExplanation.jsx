import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { countries } from "../utils";

const RemunerationExplanation = ({ stats }) => {
  const { countryId } = useParams();
  const country = countries[countryId];

  const capabilities = stats.capabilities_by_type;
  return (
    <Box p={2}>
      <Typography
        sx={{ fontSize: 16, color: "#124E66", fontWeight: 700 }}
        gutterBottom
      >
        {`How many countries often compete with ${country.name}? Diversity vs. Average Ubiquity`}
      </Typography>
      <Typography variant="body1" paragraph>
        {`This section evaluates the economic and strategic value of ${country.name}'s innovation capabilities. By analyzing the uniqueness of capabilities, it provides insights into which areas offer the greatest rewards, helping to prioritize efforts and resources to maximize benefits.`}
      </Typography>
      <Typography variant="body1" paragraph>
        {`${country.name} masters ${capabilities.science.value}%, ${capabilities.technology.value}%, and ${capabilities.trade.value}% of the total capabilities in the scientific, technological, and productive dimensions, respectively. On average, its innovation capabilities are present in ${capabilities.science.out_of}, ${capabilities.technology.out_of}, and ${capabilities.trade.out_of} countries within these dimensions.`}
      </Typography>
    </Box>
  );
};

export default RemunerationExplanation;

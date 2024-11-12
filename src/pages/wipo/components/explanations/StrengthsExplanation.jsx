import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { addOrdinalSuffix, countries, dimensions } from "../utils";

const StrengthsExplanation = ({ stats }) => {
  const { countryId } = useParams();
  const country = countries[countryId];

  return (
    <Box p={2}>
      <Typography
        sx={{ fontSize: 16, color: "#124E66", fontWeight: 700 }}
        gutterBottom
      >
        {`How does ${country.name} contribute to the global innovation landscape?`}
      </Typography>
      <Typography variant="body1" paragraph>
        {`This section identifies areas where ${country.name} contributes the most to the global innovation landscape. It highlights its strengths and competitive advantages across three dimensions of innovation: science, technology, and production.`}
      </Typography>
      <Typography variant="body1" paragraph>
        {`${country.name} belongs to the ${addOrdinalSuffix(stats.total_capabilities.percentile.toFixed(2) * 100)} percentile of the distribution of countries by innovation capabilities. Its main contributions to the global innovation landscape are concentrated in the ${dimensions[stats.max_contribution.type].adjective} dimension.`}
      </Typography>
      <Box
        component="img"
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "2rem",
          width: "100%",
        }}
        src="/venn.png"
        alt="Innovation capabilities diagram"
      />
    </Box>
  );
};

export default StrengthsExplanation;

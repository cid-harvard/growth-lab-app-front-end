import { Box, Typography } from "@mui/material";

import { useParams } from "react-router-dom";
import { countries } from "../utils";

const CapabilitiesExplanation = () => {
  const { countryId } = useParams();
  const country = countries[countryId];

  return (
    <Box p={2}>
      <Typography
        sx={{ fontSize: 16, color: "#124E66", fontWeight: 700 }}
        gutterBottom
      >
        {`Where can ${country.name} find promising capabilities?`}
      </Typography>
      <Typography variant="body1" paragraph>
        {`This section uncovers emerging opportunities to develop new capabilities that are related to ${country.name}’s current ones. In addition, it reveals the potential risks of losing capabilities due to insufficient nurturing, guiding efforts to safeguard and enhance critical assets.`}
      </Typography>
      <Typography variant="body1" paragraph>
        Countries can enhance their economic development by diversifying into
        more complex capabilities. While expanding into related capabilities is
        easier, accessing highly complex ones requires mastering multiple,
        sometimes unrelated, capabilities.{" "}
      </Typography>
    </Box>
  );
};

export default CapabilitiesExplanation;

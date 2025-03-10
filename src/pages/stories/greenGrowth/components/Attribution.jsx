import { Box, Typography } from "@mui/material";

const Attribution = () => (
  <Box
    sx={{
      bgcolor: "#f5deb3",
      py: 1,
      textAlign: "center",
      width: "100%",
    }}
  >
    <Typography sx={{ fontSize: 14 }}>
      <span style={{ fontWeight: 600 }}>Growth Lab's Research Team:</span>{" "}
      Muhammed Yildirim, Tim Cheston, Ketan Ahuja, Karan Daryanani, Lucas Lamby
      <br />
      <span style={{ fontWeight: 600 }}>
        Growth Lab's Digital Development & Design Team:
      </span>{" "}
      Annie White, Robert Christie, Nil Tuzcu, Brendan Leonard, Ellie Jackson
    </Typography>
  </Box>
);

export default Attribution;

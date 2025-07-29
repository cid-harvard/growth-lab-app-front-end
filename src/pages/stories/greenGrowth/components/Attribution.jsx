import { Box, Typography } from "@mui/material";

const Attribution = () => (
  <Box
    sx={(theme) => ({
      bgcolor: theme.palette.custom?.footerBg || "rgba(0, 0, 0, 0.10)",
      py: 1,
      textAlign: "center",
      width: "100%",
    })}
  >
    <Typography variant="footer-text">
      <Typography component="span" sx={{ fontWeight: 600 }}>
        Growth Lab's Research Team:
      </Typography>{" "}
      Muhammed Yildirim, Tim Cheston, Ketan Ahuja, Karan Daryanani, Lucas Lamby
      <br />
      <Typography component="span" sx={{ fontWeight: 600 }}>
        Growth Lab's Digital Development & Design Team:
      </Typography>{" "}
      Annie White, Robert Christie, Nil Tuzcu, Brendan Leonard, Ellie Jackson
    </Typography>
  </Box>
);

export default Attribution;

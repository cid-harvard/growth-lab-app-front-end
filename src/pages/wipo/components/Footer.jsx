import { Box, Typography } from "@mui/material";
import StandardFooter from "../../../components/text/StandardFooter";

const Footer = () => {
  return (
    <>
      <Box
        sx={{
          bgcolor: "#f5deb3",
          py: 1,
          textAlign: "center",
          width: "100%",
        }}
      >
        <Typography sx={{ fontSize: 14 }}>
          <span style={{ fontWeight: 600 }}>WIPO Team:</span> Julio Raffo,
          Federico Moscatelli
          <br />
          <span style={{ fontWeight: 600 }}>
            Growth Lab's Research Team:
          </span>{" "}
          Muhammed Yıldırım, Shreyas Gadgin Matha, Matte Hartog, Christian
          Chacua
          <br />
          <span style={{ fontWeight: 600 }}>
            Growth Lab's Digital Development & Design Team:
          </span>{" "}
          Annie White, Robert Christie, Nil Tuzcu, Brendan Leonard, Ellie
          Jackson
        </Typography>
      </Box>
      <StandardFooter />
    </>
  );
};

export default Footer;

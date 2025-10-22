import { useState } from "react";
import styled from "@emotion/styled";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

const BannerContainer = styled.div`
  position: absolute;
  top: 0;
  z-index: 1;
  width: 100%;
  background-color: rgb(84, 163, 198);
  padding: 10px;
  text-align: center;
  color: white;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default function Banner() {
  const [showBanner, setShowBanner] = useState(true);
  const dismissBanner = () => {
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <BannerContainer>
      <span style={{ flexGrow: 1 }}>
        Greenplexity 2.0 is coming soon with bold new visuals and richer tools
        for green growth analysis 🌿🌐
      </span>

      <IconButton onClick={dismissBanner} size="small" aria-label="dismiss">
        <CloseIcon />
      </IconButton>
    </BannerContainer>
  );
}

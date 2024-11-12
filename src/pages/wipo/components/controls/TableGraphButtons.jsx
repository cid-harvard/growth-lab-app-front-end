import { Button, ButtonGroup } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const TableGraphButtons = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const urlArr = location.pathname.split("/");
  const urlLeaf = urlArr[urlArr.length - 1];

  return (
    <ButtonGroup
      sx={{ mr: 2, boxShadow: "none" }}
      variant="contained"
      aria-label="Toggle Graph and Table"
    >
      <Button
        variant={urlLeaf !== "table" ? "contained" : "outlined"}
        onClick={() => navigate("")}
      >
        Graph View
      </Button>
      <Button
        variant={urlLeaf === "table" ? "contained" : "outlined"}
        onClick={() => navigate("table")}
      >
        Table View
      </Button>
    </ButtonGroup>
  );
};
export default TableGraphButtons;

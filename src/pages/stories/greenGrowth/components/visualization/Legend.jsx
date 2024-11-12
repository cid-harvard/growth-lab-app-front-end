import Box from "@mui/material/Box";
import { useMediaQuery, useTheme } from "@mui/material";

const Legend = ({ mode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!mode) return null;
  const getItems = () => {
    switch (mode) {
      case "rca":
        return [
          { label: "High (RCA>1)", color: "black", shape: "circle" },
          { label: "Mid (0.2<RCA<1)", color: "grey", shape: "circle" },
          { label: "Low (RCA<0.2)", color: "lightgrey", shape: "circle" },
        ];
      case "production":
        return [
          { label: "Actual Export Value", color: "grey", shape: "rect" },
          {
            label: "World Average",
            color: "black",
            shape: "line",
          },
        ];
      case "minerals":
        return [
          { label: "Critical Minerals", color: "black", shape: "circle" },
        ];
      default:
        return [];
    }
  };

  const renderShape = (item) => {
    const shapeContainer = {
      width: "30px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "10px",
      height: isMobile ? "15px" : "20px",
    };

    switch (item.shape) {
      case "circle":
        if (mode === "minerals") {
          return (
            <div
              style={{
                ...shapeContainer,
              }}
            >
              <div
                style={{
                  width: isMobile ? "15px" : "20px",
                  height: isMobile ? "15px" : "20px",
                  borderRadius: "50%",
                  border: "2px solid black",
                  backgroundColor: "transparent",
                }}
              />
            </div>
          );
        }
        return (
          <div
            style={{
              ...shapeContainer,
            }}
          >
            <div
              style={{
                width: isMobile ? "15px" : "20px",
                height: isMobile ? "15px" : "20px",
                borderRadius: "50%",
                backgroundColor: item.color,
              }}
            />
          </div>
        );
      case "rect":
        return (
          <div style={shapeContainer}>
            <div
              style={{
                width: "30px",
                height: isMobile ? "15px" : "20px",
                backgroundColor: item.color,
              }}
            />
          </div>
        );
      case "line":
        return (
          <div style={shapeContainer}>
            <div
              style={{
                width: "2px",
                height: isMobile ? "15px" : "20px",
                backgroundColor: item.color,
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const items = getItems();

  return (
    <Box
      sx={{
        position: isMobile ? "relative" : "absolute",
        bottom: isMobile ? "auto" : "50%",
        right: isMobile ? "auto" : "2%",
        transform: isMobile ? "none" : "translateY(50%)",
        width: isMobile ? "100%" : "160px",
        px: isMobile ? 2 : 0,
        py: isMobile ? 1 : 0,
        display: "flex",
        flexDirection: "column",
        alignItems: isMobile ? "center" : "flex-start",
      }}
    >
      {mode === "rca" && (
        <h3 style={{ margin: "0 0 10px 0" }}>Economic Competitiveness</h3>
      )}
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "5px",
            fontSize: isMobile ? "0.875rem" : "1rem",
            ...(item.style || {}),
          }}
        >
          {renderShape(item)}
          <span>{item.label}</span>
        </div>
      ))}
    </Box>
  );
};
export default Legend;

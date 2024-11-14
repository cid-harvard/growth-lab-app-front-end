import Box from "@mui/material/Box";
import { useMediaQuery, useTheme } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

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
      case "size":
        return [
          {
            label: "More Important",
            color: "black",
            shape: "circle",
            size: "large",
          },
          {
            label: "Less Important",
            color: "black",
            shape: "circle",
            size: "small",
          },
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
        if (mode === "size") {
          const circleSize =
            item.size === "large"
              ? isMobile
                ? "15px"
                : "20px"
              : isMobile
                ? "8px"
                : "10px";
          return (
            <div style={{ ...shapeContainer }}>
              <div
                style={{
                  width: circleSize,
                  height: circleSize,
                  borderRadius: "50%",
                  backgroundColor: item.color,
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
                width: "4px",
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
      {mode === "size" && (
        <Tooltip
          title="The size of each product reflects its importance within a network of exported products, based on how often it is co-exported with other green value chain products in international trade data."
          arrow
          placement="top"
        >
          <h3
            style={{
              margin: "0 0 10px 0",
              textDecoration: "underline",
              cursor: "help",
              display: "flex",
            }}
          >
            Product Importance
          </h3>
        </Tooltip>
      )}
      {mode === "production" && (
        <Tooltip
          title="The world average of exports here indicates the level of exports a country would have if it exported goods in the same proportion as its overall share of global trade. This is calculated using an RCA (Revealed Comparative Advantage) index value of 1, also known as the Balassa index."
          arrow
          placement="top"
        >
          <h3
            style={{
              margin: "0 0 10px 0",
              textDecoration: "underline",
              cursor: "help",
              display: "flex",
            }}
          >
            Export Value
          </h3>
        </Tooltip>
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

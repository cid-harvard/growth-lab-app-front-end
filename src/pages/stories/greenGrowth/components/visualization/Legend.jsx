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
          { label: "High (RCA>1)", color: "rgba(0, 0, 0, 1)", shape: "circle" },
          {
            label: "Mid (0.2<RCA<1)",
            color: "rgba(0, 0, 0, 0.6)",
            shape: "circle",
          },
          {
            label: "Low (RCA<0.2)",
            color: "rgba(0, 0, 0, 0.15)",
            shape: "circle",
          },
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
        position: "absolute",
        bottom: isMobile ? "10px" : "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "auto",
        px: 2,
        py: 1,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: isMobile ? 2 : 3,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 1,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        flexWrap: "nowrap",
      }}
    >
      {mode === "rca" && (
        <Box
          sx={{
            fontWeight: "bold",
            fontSize: "14px",
            mr: 2,
            mb: 0,
            whiteSpace: "nowrap",
          }}
        >
          Economic Competitiveness:
        </Box>
      )}
      {mode === "size" && (
        <Tooltip
          title="The size of each product reflects its importance within a network of exported products, based on how often it is co-exported with other green value chain products in international trade data."
          arrow
          placement="top"
        >
          <Box
            sx={{
              fontWeight: "bold",
              fontSize: "14px",
              textDecoration: "underline",
              cursor: "help",
              mr: 2,
              mb: 0,
              whiteSpace: "nowrap",
            }}
          >
            Product Importance:
          </Box>
        </Tooltip>
      )}
      {mode === "production" && (
        <Tooltip
          title="The world average of exports here indicates the level of exports a country would have if it exported goods in the same proportion as its overall share of global trade. This is calculated using an RCA (Revealed Comparative Advantage) index value of 1, also known as the Balassa index."
          arrow
          placement="top"
        >
          <Box
            sx={{
              fontWeight: "bold",
              fontSize: "14px",
              textDecoration: "underline",
              cursor: "help",
              mr: 2,
              mb: 0,
              whiteSpace: "nowrap",
            }}
          >
            Export Value:
          </Box>
        </Tooltip>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: isMobile ? 1 : 2,
          alignItems: "center",
          flexWrap: "nowrap",
        }}
      >
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
              ...(item.style || {}),
            }}
          >
            {renderShape(item)}
            <span>{item.label}</span>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
export default Legend;

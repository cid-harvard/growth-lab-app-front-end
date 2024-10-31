const Legend = ({ mode }) => {
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
      width: "30px", // Fixed width for all shape containers
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "10px",
    };

    switch (item.shape) {
      case "circle":
        if (mode === "minerals") {
          return (
            <div
              style={{
                ...shapeContainer,
                height: "20px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
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
              height: "20px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
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
                height: "20px",
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
                height: "20px",
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
    <div
      className="parent-circle"
      style={{
        position: "absolute",
        right: "20px",
        top: "50%",
        background: "rgba(255, 255, 255, 0.8)",
        padding: "10px",
        borderRadius: "5px",
        width: "150px",
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
            ...(item.style || {}),
          }}
        >
          {renderShape(item)}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
export default Legend;

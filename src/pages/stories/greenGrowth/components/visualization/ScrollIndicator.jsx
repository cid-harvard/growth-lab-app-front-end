import { useSpring, animated, config } from "@react-spring/web";

const ScrollIndicator = ({ progress, direction }) => {
  const props = useSpring({
    height: `${progress * 5}vh`,
    opacity: progress * 0.1,
    from: { height: "0vh", opacity: 0 },
    config: {
      tension: 700,
      friction: 20,
      mass: 1,
    },
  });

  return (
    <animated.div
      style={{
        ...props,
        position: "fixed",
        top: direction === "up" ? 0 : "auto",
        bottom: direction === "down" ? 0 : "auto",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        backgroundColor: "#007bff",
        borderRadius: direction === "up" ? "0 0 50% 50%" : "50% 50% 0 0",
        maxHeight: "10vh",
      }}
    />
  );
};

export default ScrollIndicator;

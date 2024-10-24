import { Box, ClickAwayListener } from "@mui/material";
import { useSpring, animated } from "@react-spring/web";

const ScrollyText = ({ open, onClose, children }) => {
  const props = useSpring({
    opacity: open ? 1 : 0,
    transform: open ? "translateY(0)" : "translateY(-50px)",
    config: { tension: 300, friction: 30 },
    delay: open ? 500 : 0,
  });

  if (!open) return null;

  return (
    <ClickAwayListener onClickAway={onClose}>
      <animated.div
        style={{
          ...props,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            width: "90vw",
            maxWidth: 600,
            maxHeight: "80vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {children}
        </Box>
      </animated.div>
    </ClickAwayListener>
  );
};

export default ScrollyText;

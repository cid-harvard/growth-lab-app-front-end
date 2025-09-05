import Tooltip from "@mui/material/Tooltip";

type GGTooltipProps = React.ComponentProps<typeof Tooltip> & {
  children: React.ReactElement;
};

function GGTooltip({ children, ...props }: GGTooltipProps) {
  return (
    <Tooltip
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: "#FFFFFF",
            color: "#000000",
            fontSize: { xs: "12px", sm: "14px" },
            maxWidth: 320,
            p: 1.5,
            border: "1px solid #DBDBDB",
            boxShadow: "0 0 4px 1px rgba(0, 0, 0, 0.10)",
          },
        },
        arrow: {
          sx: { color: "#FFFFFF" },
        },
      }}
      {...props}
    >
      {children}
    </Tooltip>
  );
}

export default GGTooltip;

import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

type TooltipKind = "product" | "cluster" | "custom";

type ClusterData = {
  clusterName: string;
  clusterId?: number | string;
  productCount?: number;
};

type ProductData = {
  product?: { nameShortEn?: string; code?: string } | null;
  nameShortEn?: string;
  code?: string;
  exportValue?: number | null;
  exportRca?: number | null;
  year?: number | string;
  clusterName?: string;
  clusterId?: number | string;
};

type CustomRow = { label: React.ReactNode; value: React.ReactNode };
type CustomData = { title: string; rows: CustomRow[] };

export interface SharedTooltipPayload {
  type?: TooltipKind;
  data?: ProductData | ClusterData | CustomData;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  compactDisplay: "short",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const Row = ({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      py: 0.25,
    }}
  >
    <Typography variant="chart-tooltip-content" sx={{ display: "block" }}>
      {label}
    </Typography>
    <Typography
      variant="chart-tooltip-content"
      sx={{ display: "block", fontWeight: 600 }}
    >
      {value}
    </Typography>
  </Box>
);

const formatNumberOneDecimal = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(Number(value)))
    return "-";
  return Number(value as number).toFixed(1);
};

function SharedTooltip({ payload }: { payload: SharedTooltipPayload }) {
  const isCluster = Boolean(
    (payload?.data as ClusterData | undefined)?.clusterName &&
      payload?.type !== "product",
  );
  const type: TooltipKind =
    (payload?.type as TooltipKind) || (isCluster ? "cluster" : "product");
  const data = payload?.data as ProductData & ClusterData & CustomData;

  if (!data) return null;

  if (type === "cluster") {
    return (
      <Box
        sx={{
          border: "1px solid #DBDBDB",
          boxShadow: "0 0 4px 1px rgba(0, 0, 0, 0.10)",
          backgroundColor: "#FFFFFF",
          minWidth: 260,
        }}
      >
        <Box sx={{ backgroundColor: "#ECECEC", px: 1, py: 0.5 }}>
          <Typography sx={{ fontWeight: 600 }} variant="chart-tooltip-title">
            {data.clusterName}
          </Typography>
        </Box>
        <Box sx={{ px: 1, py: 0.5 }}>
          <Row label="Products:" value={data.productCount ?? 0} />
        </Box>
      </Box>
    );
  }

  if (type === "custom") {
    const custom = data as CustomData;
    return (
      <Box
        sx={{
          border: "1px solid #DBDBDB",
          boxShadow: "0 0 4px 1px rgba(0, 0, 0, 0.10)",
          backgroundColor: "#FFFFFF",
          minWidth: 260,
        }}
      >
        <Box sx={{ backgroundColor: "#ECECEC", px: 1, py: 0.5 }}>
          <Typography sx={{ fontWeight: 600 }} variant="chart-tooltip-title">
            {custom.title}
          </Typography>
        </Box>
        <Box sx={{ px: 1, py: 0.5 }}>
          {custom.rows.map((r) => (
            <Row key={String(r.label)} label={r.label} value={r.value} />
          ))}
        </Box>
      </Box>
    );
  }

  // product
  const productName =
    data?.product?.nameShortEn || data?.nameShortEn || "Unknown Product";
  const code = data?.product?.code || data?.code || "-";
  const exportValue = currencyFormatter.format(
    (data?.exportValue as number) || 0,
  );
  const rca = formatNumberOneDecimal((data?.exportRca as number) ?? null);
  const year = data?.year as number | string | undefined;
  const clusterName = data?.clusterName as string | undefined;

  return (
    <Box
      sx={{
        border: "1px solid #DBDBDB",
        boxShadow: "0 0 4px 1px rgba(0, 0, 0, 0.10)",
        backgroundColor: "#FFFFFF",
        minWidth: 280,
      }}
    >
      <Box sx={{ backgroundColor: "#ECECEC", px: 1, py: 0.5 }}>
        <Typography sx={{ fontWeight: 600 }} variant="chart-tooltip-title">
          {productName}
        </Typography>
      </Box>
      <Box sx={{ px: 1, py: 0.5 }}>
        {clusterName && <Row label="Cluster:" value={clusterName} />}
        <Row label="HS Code:" value={code} />
        <Row label="Export Value:" value={exportValue} />
        <Row label="RCA:" value={rca} />
        {year && <Row label="Year:" value={year} />}
      </Box>
    </Box>
  );
}

export default SharedTooltip;

import { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  IconButton,
  FormLabel,
  TextField,
  Divider,
  Slider,
  FormControlLabel,
  Checkbox,
  ListItemText,
  Modal,
  Tooltip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import { useLoaderData } from "react-router-dom";
import type { LoaderData } from "./loader";
import { Link } from "react-router-dom";

interface FieldNames {
  id: string;
  x: string;
  y: string;
  source: string;
  target: string;
  radius?: string;
  tooltip?: string[];
  category?: string;
  metaId?: string;
  metaName?: string;
  metaColor?: string;
}

interface RadiusConfig {
  min: number;
  max: number;
  scale: string;
  fixedSize: number;
}

interface ConfiguratorProps {
  nodeKeys: string[];
  linkKeys: string[];
  metaKeys: string[];
  fieldNames: FieldNames;
  setFieldNames: React.Dispatch<React.SetStateAction<FieldNames>>;
  radiusConfig: RadiusConfig;
  setRadiusConfig: React.Dispatch<React.SetStateAction<RadiusConfig>>;
  showAllLinks: boolean;
  setShowAllLinks: React.Dispatch<React.SetStateAction<boolean>>;
}

const SCALE_TYPES = ["linear", "log", "sqrt", "pow"];

// Utility function to convert JSON array to CSV
const convertToCSV = (data: Record<string, unknown>[]): string => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const rawValue = row[header];
          // Handle values that contain commas, newlines, or quotes
          if (rawValue === null || rawValue === undefined) {
            return "";
          }
          let value = String(rawValue);
          if (
            value.includes(",") ||
            value.includes("\n") ||
            value.includes('"')
          ) {
            // Escape quotes and wrap in quotes
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(","),
    ),
  ].join("\n");

  return csvContent;
};

export function inferFieldNames(
  nodeKeys: string[],
  linkKeys?: string[],
  metaKeys?: string[],
): Partial<FieldNames> {
  const id = nodeKeys.find(
    (k) =>
      k.toLowerCase().includes("id") ||
      k.toLowerCase().includes("code") ||
      k.toLowerCase().includes("uuid") ||
      k.toLowerCase().includes("name"),
  );

  const x = nodeKeys.find((k) => k.toLowerCase().includes("x"));

  const y = nodeKeys.find((k) => k.toLowerCase().includes("y"));

  const radius = nodeKeys.find(
    (k) =>
      k.toLowerCase().includes("radius") ||
      k.toLowerCase().includes("size") ||
      k.toLowerCase().includes("value") ||
      k.toLowerCase().includes("weight"),
  );

  const tooltip = nodeKeys.filter(
    (k) =>
      k.toLowerCase().includes("label") || k.toLowerCase().includes("name"),
  );

  let source: string | undefined;
  let target: string | undefined;
  if (linkKeys) {
    source = linkKeys.find(
      (k) =>
        k.toLowerCase().includes("from") || k.toLowerCase().includes("source"),
    );
    target = linkKeys.find(
      (k) =>
        k.toLowerCase().includes("to") || k.toLowerCase().includes("target"),
    );
  }

  const category = nodeKeys.find(
    (k) =>
      k.toLowerCase().includes("category") ||
      k.toLowerCase().includes("type") ||
      k.toLowerCase().includes("group") ||
      k.toLowerCase().includes("cluster"),
  );

  let metaId: string | undefined;
  let metaName: string | undefined;
  let metaColor: string | undefined;

  if (metaKeys && metaKeys.length > 0) {
    metaId = metaKeys.find(
      (k) =>
        k.toLowerCase().includes("id") ||
        k.toLowerCase().includes("code") ||
        k.toLowerCase() === "category" ||
        k.toLowerCase() === "key",
    );

    metaName = metaKeys.find(
      (k) =>
        k.toLowerCase().includes("name") ||
        k.toLowerCase().includes("label") ||
        k.toLowerCase().includes("title") ||
        k.toLowerCase() === "category",
    );

    metaColor = metaKeys.find(
      (k) =>
        k.toLowerCase().includes("color") ||
        k.toLowerCase().includes("fill") ||
        k.toLowerCase().includes("rgb") ||
        k.toLowerCase().includes("col"),
    );
  }

  return {
    id,
    x,
    y,
    radius,
    tooltip,
    source,
    target,
    category,
    metaId,
    metaName,
    metaColor,
  };
}

export default function Configurator({
  nodeKeys,
  linkKeys,
  metaKeys,
  fieldNames,
  setFieldNames,
  radiusConfig,
  setRadiusConfig,
  showAllLinks,
  setShowAllLinks,
}: ConfiguratorProps) {
  const [open, setOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { nodes, links, metadata, defaultMetadata } =
    useLoaderData() as LoaderData;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePreviewClick = (tabIndex: number) => {
    setPreviewTab(tabIndex);
    setPreviewOpen(true);
  };

  const handleDownload = () => {
    // Download nodes data as CSV
    const nodesCsv = convertToCSV(nodes);
    const nodesBlob = new Blob([nodesCsv], {
      type: "text/csv",
    });
    const nodesUrl = URL.createObjectURL(nodesBlob);
    const nodesLink = document.createElement("a");
    nodesLink.href = nodesUrl;
    nodesLink.download = "nodes.csv";
    document.body.appendChild(nodesLink);
    nodesLink.click();
    document.body.removeChild(nodesLink);
    URL.revokeObjectURL(nodesUrl);

    // Download links data as CSV
    const linksCsv = convertToCSV(links);
    const linksBlob = new Blob([linksCsv], {
      type: "text/csv",
    });
    const linksUrl = URL.createObjectURL(linksBlob);
    const linksLink = document.createElement("a");
    linksLink.href = linksUrl;
    linksLink.download = "links.csv";
    document.body.appendChild(linksLink);
    linksLink.click();
    document.body.removeChild(linksLink);
    URL.revokeObjectURL(linksUrl);

    // Download metadata - use defaultMetadata if available, otherwise use regular metadata
    let metadataToDownload = null;
    if (defaultMetadata && defaultMetadata.length > 0) {
      // For products dataset, use the display metadata that's actually used for visualization
      // Use cluster_name (full name) to match the product_space_cluster_name field in nodes
      metadataToDownload = defaultMetadata.map((meta) => ({
        category: meta.cluster_name,
        color: meta.cluster_col,
      }));
    } else if (metadata && metadata.length > 0) {
      // For other datasets, use the uploaded metadata
      metadataToDownload = metadata;
    }

    if (metadataToDownload) {
      const metadataCsv = convertToCSV(metadataToDownload);
      const metadataBlob = new Blob([metadataCsv], {
        type: "text/csv",
      });
      const metadataUrl = URL.createObjectURL(metadataBlob);
      const metadataLink = document.createElement("a");
      metadataLink.href = metadataUrl;
      metadataLink.download = "metadata.csv";
      document.body.appendChild(metadataLink);
      metadataLink.click();
      document.body.removeChild(metadataLink);
      URL.revokeObjectURL(metadataUrl);
    }
  };

  return (
    <>
      {!open && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            top: 24,
            left: 24,
            zIndex: 1301,
            bgcolor: "background.paper",
            boxShadow: 2,
            borderRadius: 2,
            p: 1,
            "&:hover": { bgcolor: "grey.800", color: "white" },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        PaperProps={{
          sx: {
            width: { xs: "80vw", sm: 320, md: 340 },
            maxWidth: 400,
            // bgcolor: "#232733",
            // color: "grey.100",
            p: 0,
            borderRight: "1px solid #222",
            boxShadow: 4,
            zIndex: 1300,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1,
            borderBottom: "1px solid #333",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => setOpen(false)}
              sx={{ color: "grey.600", mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Link
              to="/space-viewer"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Growth Lab Space Viewer</Typography>
              <svg
                width="28"
                height="28"
                viewBox="0 0 95.6 93.3"
                style={{ marginLeft: "4px" }}
              >
                <title>Growth Lab Logo</title>
                <path
                  fill="#ed3f4b"
                  d="M84.7,58.5c-4.7,0-8.9,3.2-10.1,7.7h-7.1V50.5h3.3c9.5,0,17.1-7.6,17.1-17c0-9.4-7.7-17-17.1-17c-1.2,0-2.5,0.2-3.7,0.4
	C61.3,5.3,47.3,0.7,35.8,6.5c-6.1,3.1-10.6,8.7-12.2,15.3c-0.6-0.1-1.3-0.2-1.9-0.2c-8,0-14.5,6.5-14.5,14.5c0,8,6.5,14.5,14.5,14.5
	h5.9v15.8h-7.1c-1.4-5.5-7.1-8.9-12.7-7.4c-5.6,1.4-8.9,7.1-7.5,12.6s7.1,8.9,12.7,7.4c3.7-0.9,6.5-3.8,7.5-7.4h9.7
	c1.5,0,2.6-1.1,2.7-2.6V50.5h12.1v18.7c-5.6,1.4-8.9,7.1-7.5,12.6c1.4,5.5,7.1,8.9,12.7,7.4c5.6-1.4,8.9-7.1,7.5-12.6
	c-0.9-3.7-3.8-6.5-7.5-7.4V50.5h12.1v18.4c0,1.4,1.2,2.6,2.6,2.6h9.8c1.4,5.6,7.1,8.9,12.7,7.5c5.6-1.4,8.9-7.1,7.5-12.6
	C93.7,61.7,89.5,58.5,84.7,58.5L84.7,58.5z M10.4,74c-2.9,0-5.2-2.3-5.2-5.2c0-2.9,2.3-5.2,5.2-5.2s5.2,2.3,5.2,5.2c0,0,0,0,0,0
	C15.7,71.7,13.4,74,10.4,74C10.5,74,10.4,74,10.4,74L10.4,74z M52.8,79.2c0,2.9-2.3,5.2-5.2,5.2c-2.9,0-5.2-2.3-5.2-5.2
	c0-2.9,2.3-5.2,5.2-5.2c0,0,0,0,0,0C50.4,74,52.8,76.3,52.8,79.2C52.8,79.2,52.8,79.2,52.8,79.2L52.8,79.2z M84.7,74
	c-2.9,0-5.2-2.3-5.2-5.2s2.3-5.2,5.2-5.2c2.9,0,5.2,2.3,5.2,5.2c0,0,0,0,0,0C89.9,71.7,87.6,74,84.7,74L84.7,74z"
                />
              </svg>
            </Link>
          </Box>
        </Box>
        <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FormLabel>
                <b>Nodes:</b>
              </FormLabel>
              <Tooltip title="Preview Nodes Data">
                <IconButton onClick={() => handlePreviewClick(0)} size="small">
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <FormControl fullWidth>
              <InputLabel>ID Field</InputLabel>
              <Select
                value={fieldNames.id}
                label="ID Field"
                onChange={(e) =>
                  setFieldNames((prev) => ({ ...prev, id: e.target.value }))
                }
              >
                {nodeKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>X Field</InputLabel>
              <Select
                value={fieldNames.x}
                label="X Field"
                onChange={(e) =>
                  setFieldNames((prev) => ({ ...prev, x: e.target.value }))
                }
              >
                {nodeKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Y Field</InputLabel>
              <Select
                value={fieldNames.y}
                label="Y Field"
                onChange={(e) =>
                  setFieldNames((prev) => ({ ...prev, y: e.target.value }))
                }
              >
                {nodeKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Radius Field (Optional)</InputLabel>
              <Select
                value={fieldNames.radius || ""}
                label="Radius Field (Optional)"
                onChange={(e) =>
                  setFieldNames((prev) => ({
                    ...prev,
                    radius: e.target.value || undefined,
                  }))
                }
              >
                <MenuItem value="">None (Fixed Size)</MenuItem>
                {nodeKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {fieldNames.radius ? (
              <>
                <FormLabel>Node Radius:</FormLabel>
                <TextField
                  label="Min Radius"
                  type="number"
                  value={radiusConfig.min}
                  onChange={(e) =>
                    setRadiusConfig((prev) => ({
                      ...prev,
                      min: Number.parseFloat(e.target.value),
                    }))
                  }
                  inputProps={{ min: 0, step: 0.1 }}
                />
                <TextField
                  label="Max Radius"
                  type="number"
                  value={radiusConfig.max}
                  onChange={(e) =>
                    setRadiusConfig((prev) => ({
                      ...prev,
                      max: Number.parseFloat(e.target.value),
                    }))
                  }
                  inputProps={{ min: 0, step: 0.1 }}
                />
                <FormControl fullWidth>
                  <InputLabel>Scale Type</InputLabel>
                  <Select
                    value={radiusConfig.scale}
                    label="Scale Type"
                    onChange={(e) =>
                      setRadiusConfig((prev) => ({
                        ...prev,
                        scale: e.target.value,
                      }))
                    }
                  >
                    {SCALE_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            ) : (
              <>
                <FormLabel>Fixed Node Size:</FormLabel>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={radiusConfig.fixedSize || 10}
                    onChange={(_, value) =>
                      setRadiusConfig((prev) => ({
                        ...prev,
                        fixedSize: value as number,
                      }))
                    }
                    min={1}
                    max={50}
                    step={1}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 1, label: "1" },
                      { value: 25, label: "25" },
                      { value: 50, label: "50" },
                    ]}
                  />
                </Box>
              </>
            )}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Tooltip Fields</InputLabel>
              <Select
                multiple
                value={fieldNames.tooltip || []}
                label="Tooltip Fields"
                onChange={(e) => {
                  const value = e.target.value as string[];
                  setFieldNames((prev) => ({ ...prev, tooltip: value }));
                }}
                renderValue={(selected) => (selected as string[]).join(", ")}
              >
                {nodeKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    <Checkbox
                      checked={(fieldNames.tooltip || []).includes(key)}
                    />
                    <ListItemText primary={key} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Divider sx={{ my: 2 }} />

            {/* LINKS SECTION */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FormLabel>
                <b>Links:</b>
              </FormLabel>
              <Tooltip title="Preview Links Data">
                <IconButton onClick={() => handlePreviewClick(1)} size="small">
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Source Field</InputLabel>
              <Select
                value={fieldNames.source}
                label="Source Field"
                onChange={(e) =>
                  setFieldNames((prev) => ({ ...prev, source: e.target.value }))
                }
              >
                {linkKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Target Field</InputLabel>
              <Select
                value={fieldNames.target}
                label="Target Field"
                onChange={(e) =>
                  setFieldNames((prev) => ({ ...prev, target: e.target.value }))
                }
              >
                {linkKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={showAllLinks}
                  onChange={(e) => setShowAllLinks(e.target.checked)}
                />
              }
              label="Show All Links"
              sx={{
                mt: 1,
                bgcolor: "rgba(255,255,255,0.7)",
                borderRadius: 1,
                px: 1,
              }}
            />
            <Divider sx={{ my: 2 }} />

            {/* METADATA SECTION */}
            {(metadata && metadata.length > 0 && !defaultMetadata) ||
            (defaultMetadata && defaultMetadata.length > 0) ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FormLabel>
                    <b>Metadata:</b>
                  </FormLabel>
                  <Tooltip title="Preview Metadata">
                    <IconButton
                      onClick={() => handlePreviewClick(2)}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Only show configuration options for custom metadata, not defaultMetadata */}
                {metadata && metadata.length > 0 && !defaultMetadata && (
                  <>
                    <FormControl fullWidth>
                      <InputLabel>Node Category Field</InputLabel>
                      <Select
                        value={fieldNames.category || ""}
                        label="Node Category Field"
                        onChange={(e) =>
                          setFieldNames((prev) => ({
                            ...prev,
                            category: e.target.value || undefined,
                          }))
                        }
                      >
                        <MenuItem value="">None</MenuItem>
                        {nodeKeys.map((key) => (
                          <MenuItem key={key} value={key}>
                            {key}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {fieldNames.category && (
                      <>
                        <FormControl fullWidth>
                          <InputLabel>Metadata ID Field</InputLabel>
                          <Select
                            value={fieldNames.metaId || ""}
                            label="Metadata ID Field"
                            onChange={(e) =>
                              setFieldNames((prev) => ({
                                ...prev,
                                metaId: e.target.value || undefined,
                              }))
                            }
                          >
                            {metaKeys.map((key) => (
                              <MenuItem key={key} value={key}>
                                {key}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel>Metadata Name Field</InputLabel>
                          <Select
                            value={fieldNames.metaName || ""}
                            label="Metadata Name Field"
                            onChange={(e) =>
                              setFieldNames((prev) => ({
                                ...prev,
                                metaName: e.target.value || undefined,
                              }))
                            }
                          >
                            {metaKeys.map((key) => (
                              <MenuItem key={key} value={key}>
                                {key}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel>Metadata Color Field</InputLabel>
                          <Select
                            value={fieldNames.metaColor || ""}
                            label="Metadata Color Field"
                            onChange={(e) =>
                              setFieldNames((prev) => ({
                                ...prev,
                                metaColor: e.target.value || undefined,
                              }))
                            }
                          >
                            {metaKeys.map((key) => (
                              <MenuItem key={key} value={key}>
                                {key}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </>
                    )}
                  </>
                )}

                {/* Show information about products dataset metadata */}
                {defaultMetadata && defaultMetadata.length > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontStyle: "italic", mt: 1 }}
                  >
                    This dataset uses predefined category metadata with{" "}
                    {defaultMetadata.length} categories.
                  </Typography>
                )}
              </>
            ) : null}
          </Box>
        </Box>
      </Drawer>

      {/* Data Preview Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        aria-labelledby="data-preview-modal"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "90vw",
            maxHeight: "80vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Data Preview</Typography>
            <Tooltip title="Download All Data">
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                size="small"
              >
                Download
              </Button>
            </Tooltip>
          </Box>
          <Tabs
            value={previewTab}
            onChange={(_, newValue) => setPreviewTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Nodes Data" />
            <Tab label="Links Data" />
            {((metadata && metadata.length > 0) ||
              (defaultMetadata && defaultMetadata.length > 0)) && (
              <Tab label="Metadata" />
            )}
          </Tabs>
          <Box sx={{ overflow: "auto" }}>
            <TableContainer component={Paper}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {(() => {
                      if (previewTab === 0) return nodeKeys;
                      if (previewTab === 1) return linkKeys;
                      // For metadata tab, show appropriate keys based on data source
                      if (defaultMetadata && defaultMetadata.length > 0) {
                        return ["category", "color"]; // Display metadata format
                      }
                      return metaKeys; // Regular metadata format
                    })().map((key) => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    if (previewTab === 0) return nodes;
                    if (previewTab === 1) return links;
                    // For metadata tab, show appropriate data based on source
                    if (defaultMetadata && defaultMetadata.length > 0) {
                      return defaultMetadata.map((meta) => ({
                        category: meta.cluster_name,
                        color: meta.cluster_col,
                      }));
                    }
                    return metadata || [];
                  })()
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const keys =
                        previewTab === 0
                          ? nodeKeys
                          : previewTab === 1
                            ? linkKeys
                            : defaultMetadata && defaultMetadata.length > 0
                              ? ["category", "color"]
                              : metaKeys;
                      const idKey = keys[0];
                      const idValue = row[idKey as keyof typeof row];
                      return (
                        <TableRow key={`${String(idValue)}-${index}`}>
                          {keys.map((key) => (
                            <TableCell key={key}>
                              {String(row[key as keyof typeof row] || "")}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={(() => {
                  if (previewTab === 0) return nodes.length;
                  if (previewTab === 1) return links.length;
                  // For metadata tab, return appropriate count
                  if (defaultMetadata && defaultMetadata.length > 0) {
                    return defaultMetadata.length;
                  }
                  return metadata?.length || 0;
                })()}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

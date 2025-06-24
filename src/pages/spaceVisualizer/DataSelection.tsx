import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Divider,
  TextField,
  ThemeProvider,
  IconButton,
  Modal,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import BusinessIcon from "@mui/icons-material/Business";
import ScienceIcon from "@mui/icons-material/Science";
import UploadIcon from "@mui/icons-material/Upload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LinkIcon from "@mui/icons-material/Link";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import { useDropzone } from "react-dropzone";
import GrowthLabLogo from "../../assets/GL_logo_black.png";
import { Link } from "react-router-dom";
import { theme } from "./index";

const FileDropzone = ({
  type,
  onFileUpload,
  isUploaded,
  fileName,
}: {
  type: "nodes" | "links" | "meta" | "clusters";
  onFileUpload: (
    file: File,
    type: "nodes" | "links" | "meta" | "clusters",
  ) => void;
  isUploaded: boolean;
  fileName?: string;
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0], type);
      }
    },
    [type, onFileUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      type === "clusters"
        ? {
            "application/json": [".json"],
          }
        : {
            "text/csv": [".csv"],
          },
    multiple: false,
  });

  const getTypeLabel = () => {
    switch (type) {
      case "nodes":
        return "Nodes Data";
      case "links":
        return "Links Data";
      case "meta":
        return "Metadata (Optional)";
      case "clusters":
        return "Cluster Boundaries (Optional)";
    }
  };

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: "2px dashed",
        borderColor: isUploaded
          ? "success.main"
          : isDragActive
            ? "primary.main"
            : "grey.300",
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        cursor: "pointer",
        backgroundColor: isDragActive ? "action.hover" : "background.paper",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "action.hover",
          borderColor: isUploaded ? "success.main" : "primary.main",
        },
      }}
    >
      <input {...getInputProps()} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        {isUploaded ? (
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {getTypeLabel()}
            </Typography>
            <Typography variant="caption" color="success.main">
              {fileName}
            </Typography>
          </>
        ) : (
          <>
            <UploadIcon
              color={isDragActive ? "primary" : "action"}
              sx={{ fontSize: 40 }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {getTypeLabel()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isDragActive
                ? "Drop CSV file here"
                : "Drag & drop or click to upload"}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default function DataSelection() {
  const navigate = useNavigate();
  const [modalTab, setModalTab] = useState(0);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<{
    nodes: File | null;
    links: File | null;
    meta: File | null;
    clusters: File | null;
  }>({ nodes: null, links: null, meta: null, clusters: null });

  const [remoteUrls, setRemoteUrls] = useState<{
    nodes: string;
    links: string;
    meta: string;
    clusters: string;
  }>({ nodes: "", links: "", meta: "", clusters: "" });

  // Utility function to transform Dropbox URLs for CORS compatibility
  const transformDropboxUrl = (url: string): string => {
    if (!url.includes("dropbox.com")) {
      return url; // Not a Dropbox URL, return as-is
    }

    let transformedUrl = url;

    // Replace dropbox.com domain with dl.dropboxusercontent.com
    if (url.includes("www.dropbox.com")) {
      transformedUrl = url.replace(
        "www.dropbox.com",
        "dl.dropboxusercontent.com",
      );
    } else if (
      url.includes("dropbox.com") &&
      !url.includes("dl.dropboxusercontent.com")
    ) {
      transformedUrl = url.replace("dropbox.com", "dl.dropboxusercontent.com");
    }

    // Replace dl=0 with dl=1 to get raw file
    if (transformedUrl.includes("dl=0")) {
      transformedUrl = transformedUrl.replace("dl=0", "dl=1");
    } else if (
      transformedUrl.includes("?") &&
      !transformedUrl.includes("dl=")
    ) {
      // Add dl=1 if no dl parameter exists but there are other parameters
      transformedUrl += "&dl=1";
    } else if (
      !transformedUrl.includes("?") &&
      !transformedUrl.includes("dl=")
    ) {
      // Add dl=1 if no parameters exist at all
      transformedUrl += "?dl=1";
    }

    return transformedUrl;
  };

  // Default dataset options
  const defaultDatasets = [
    {
      key: "product",
      label: "Product Space",
      description: "Visualize the global product space network.",
      icon: <WorkspacesIcon color="primary" sx={{ fontSize: 36 }} />,
    },
    {
      key: "industry",
      label: "Industry Space",
      description: "Visualize the global industry space network.",
      icon: <BusinessIcon color="secondary" sx={{ fontSize: 36 }} />,
    },
    // {
    //   key: "technology",
    //   label: "Technology Space",
    //   description: "Visualize the global technology space network.",
    //   icon: <ScienceIcon color="success" sx={{ fontSize: 36 }} />,
    // },
  ];

  const handleLoadDefault = async (key: string) => {
    if (key === "industry") {
      // For industry space, load the local CSV files with cluster boundaries
      const params = new URLSearchParams();
      params.append("remote", "true");
      params.append(
        "nodesUrl",
        encodeURIComponent("/static/industry_space_nodes.csv"),
      );
      params.append(
        "linksUrl",
        encodeURIComponent("/static/industry_space_links.csv"),
      );
      params.append(
        "metaUrl",
        encodeURIComponent("/static/industry_space_metadata.csv"),
      );
      params.append(
        "clustersUrl",
        encodeURIComponent("/static/industry_space_clusters.json"),
      );
      navigate(`/space-viewer/visualization?${params.toString()}`);
    } else if (key === "technology") {
      // For technology space, load the local CSV files we created
      const params = new URLSearchParams();
      params.append("remote", "true");
      params.append(
        "nodesUrl",
        encodeURIComponent("/static/technology_space_nodes.csv"),
      );
      params.append(
        "linksUrl",
        encodeURIComponent("/static/technology_space_links.csv"),
      );
      navigate(`/space-viewer/visualization?${params.toString()}`);
    } else {
      // For other datasets, use the default behavior
      navigate(`/space-viewer/visualization?dataset=${key}`);
    }
  };

  const handleCustomUpload = async (
    file: File,
    type: "nodes" | "links" | "meta" | "clusters",
  ) => {
    try {
      const text = await file.text();
      let storageKey: string;
      if (type === "meta") {
        storageKey = "custom_meta";
      } else if (type === "clusters") {
        storageKey = "custom_clusters";
      } else {
        storageKey = `custom_${type}`;
      }
      localStorage.setItem(storageKey, text);
      setUploadedFiles((prev) => ({
        ...prev,
        [type]: file,
      }));
    } catch (error) {
      console.error(`Error reading ${type} file:`, error);
      throw error;
    }
  };

  const handleRemoteUrlChange = (
    type: "nodes" | "links" | "meta" | "clusters",
    url: string,
  ) => {
    setRemoteUrls((prev) => ({ ...prev, [type]: url }));
  };

  const handleLoadRemote = () => {
    if (!remoteUrls.nodes || !remoteUrls.links) {
      return; // Don't proceed if required URLs are missing
    }

    // Transform Dropbox URLs to handle CORS restrictions
    const transformedNodesUrl = transformDropboxUrl(remoteUrls.nodes);
    const transformedLinksUrl = transformDropboxUrl(remoteUrls.links);
    const transformedMetaUrl = remoteUrls.meta
      ? transformDropboxUrl(remoteUrls.meta)
      : "";
    const transformedClustersUrl = remoteUrls.clusters
      ? transformDropboxUrl(remoteUrls.clusters)
      : "";

    // Encode the transformed URLs for the query parameters
    const params = new URLSearchParams();
    params.append("remote", "true");
    params.append("nodesUrl", encodeURIComponent(transformedNodesUrl));
    params.append("linksUrl", encodeURIComponent(transformedLinksUrl));
    if (transformedMetaUrl) {
      params.append("metaUrl", encodeURIComponent(transformedMetaUrl));
    }
    if (transformedClustersUrl) {
      params.append("clustersUrl", encodeURIComponent(transformedClustersUrl));
    }

    navigate(`/space-viewer/visualization?${params.toString()}`);
  };

  const handleInfoModalOpen = () => {
    setInfoModalOpen(true);
  };

  const handleInfoModalClose = () => {
    setInfoModalOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          minWidth: "100vw",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, sm: 4 },
            maxWidth: 500,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            borderRadius: 4,
            boxShadow: 6,
            mt: 6,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Link to="/">
              <img
                src={GrowthLabLogo}
                alt="Growth Lab Logo"
                style={{
                  height: "45px",
                  width: "auto",
                }}
              />
            </Link>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 400, fontSize: "2rem" }}
            >
              Space Viewer
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ textAlign: "center" }}
          >
            Select a dataset to visualize the product, industry, or technology
            space network.
          </Typography>
          <Tabs
            value={modalTab}
            onChange={(_, newValue) => setModalTab(newValue)}
            centered
            sx={{ mb: 1 }}
          >
            <Tab label="Default Datasets" />
            <Tab label="Custom Upload" />
            <Tab label="Remote URLs" />
          </Tabs>
          <Divider sx={{ mb: 2 }} />
          {modalTab === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {defaultDatasets.map((dataset) => (
                <Button
                  key={dataset.key}
                  onClick={() => handleLoadDefault(dataset.key)}
                  sx={{
                    width: "100%",
                    display: "flex",
                    p: 0,
                    m: 0,
                    textTransform: "none",
                    backgroundColor: "transparent",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <Paper
                    sx={{
                      p: 2.5,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                      borderRadius: 3,
                      boxShadow: 2,
                      transition: "box-shadow 0.2s",
                      width: "100%",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
                      {dataset.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {dataset.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dataset.description}
                      </Typography>
                    </Box>
                  </Paper>
                </Button>
              ))}
            </Box>
          )}

          {modalTab === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body1" sx={{ textAlign: "center" }}>
                  Upload your CSV files
                </Typography>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleInfoModalOpen}
                  sx={{ ml: 1 }}
                >
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Box>

              <FileDropzone
                type="nodes"
                onFileUpload={handleCustomUpload}
                isUploaded={!!uploadedFiles.nodes}
                fileName={uploadedFiles.nodes?.name}
              />

              <FileDropzone
                type="links"
                onFileUpload={handleCustomUpload}
                isUploaded={!!uploadedFiles.links}
                fileName={uploadedFiles.links?.name}
              />

              <FileDropzone
                type="meta"
                onFileUpload={handleCustomUpload}
                isUploaded={!!uploadedFiles.meta}
                fileName={uploadedFiles.meta?.name}
              />

              <FileDropzone
                type="clusters"
                onFileUpload={handleCustomUpload}
                isUploaded={!!uploadedFiles.clusters}
                fileName={uploadedFiles.clusters?.name}
              />

              <Button
                variant="contained"
                color="primary"
                sx={{ alignSelf: "flex-start", mt: 2 }}
                onClick={() =>
                  navigate("/space-viewer/visualization?custom=true")
                }
                disabled={!uploadedFiles.nodes || !uploadedFiles.links}
              >
                View Visualization
              </Button>
            </Box>
          )}

          {modalTab === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                Enter URLs to your CSV files
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleInfoModalOpen}
                  sx={{ ml: 1 }}
                >
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Typography>

              <TextField
                label="Nodes Data URL"
                value={remoteUrls.nodes}
                onChange={(e) => handleRemoteUrlChange("nodes", e.target.value)}
                fullWidth
                placeholder="https://example.com/nodes.csv"
                sx={{ mb: 2 }}
              />

              <TextField
                label="Links Data URL"
                value={remoteUrls.links}
                onChange={(e) => handleRemoteUrlChange("links", e.target.value)}
                fullWidth
                placeholder="https://example.com/links.csv"
                sx={{ mb: 2 }}
              />

              <TextField
                label="Metadata URL (Optional)"
                value={remoteUrls.meta}
                onChange={(e) => handleRemoteUrlChange("meta", e.target.value)}
                fullWidth
                placeholder="https://example.com/metadata.csv"
                sx={{ mb: 2 }}
              />

              <TextField
                label="Cluster Boundaries URL (Optional)"
                value={remoteUrls.clusters}
                onChange={(e) =>
                  handleRemoteUrlChange("clusters", e.target.value)
                }
                fullWidth
                placeholder="https://example.com/clusters.json"
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                color="primary"
                startIcon={<LinkIcon />}
                onClick={handleLoadRemote}
                disabled={!remoteUrls.nodes || !remoteUrls.links}
                sx={{ alignSelf: "flex-start", mt: 2 }}
              >
                Load Remote Data
              </Button>
            </Box>
          )}
        </Paper>

        {/* CSV Format Info Modal */}
        <Modal
          open={infoModalOpen}
          onClose={handleInfoModalClose}
          aria-labelledby="csv-format-modal-title"
        >
          <Paper
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 500 },
              maxHeight: "80vh",
              overflow: "auto",
              p: 4,
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                id="csv-format-modal-title"
                variant="h6"
                component="h2"
              >
                Recommended CSV Formats
              </Typography>
              <IconButton onClick={handleInfoModalClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <List disablePadding>
              <ListItem sx={{ pb: 2 }}>
                <ListItemText
                  primary="Nodes Data (Required)"
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        CSV file with node properties. Must include:
                      </Typography>
                      <Typography
                        variant="body2"
                        component="ul"
                        sx={{ pl: 2, mt: 1 }}
                      >
                        <li>
                          A unique identifier column (e.g., "id", "code", or
                          "name")
                        </li>
                        <li>X-coordinate column (e.g., "x", "xpos")</li>
                        <li>Y-coordinate column (e.g., "y", "ypos")</li>
                        <li>
                          Optional: Category/group/cluster field for coloring
                          nodes
                        </li>
                        <li>Optional: Size/value field for node radius</li>
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Example: id,x,y,category,value
                        <br />
                        1,0.5,0.3,Group A,10
                        <br />
                        2,0.7,0.8,Group B,15
                      </Typography>
                    </>
                  }
                />
              </ListItem>

              <Divider component="li" />

              <ListItem sx={{ py: 2 }}>
                <ListItemText
                  primary="Links Data (Required)"
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        CSV file defining connections between nodes. Must
                        include:
                      </Typography>
                      <Typography
                        variant="body2"
                        component="ul"
                        sx={{ pl: 2, mt: 1 }}
                      >
                        <li>
                          Source node ID column (must match IDs in the nodes
                          file)
                        </li>
                        <li>
                          Target node ID column (must match IDs in the nodes
                          file)
                        </li>
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Example: source,target
                        <br />
                        1,2
                        <br />
                        2,3
                      </Typography>
                    </>
                  }
                />
              </ListItem>

              <Divider component="li" />

              <ListItem sx={{ pt: 2 }}>
                <ListItemText
                  primary="Metadata (Optional)"
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Additional data associated with categories or nodes.
                        Must include:
                      </Typography>
                      <Typography
                        variant="body2"
                        component="ul"
                        sx={{ pl: 2, mt: 1 }}
                      >
                        <li>
                          Category/cluster ID that matches category values in
                          nodes file
                        </li>
                        <li>
                          Optional: Name or label column for display purposes
                        </li>
                        <li>
                          Optional: Color column for custom category colors
                        </li>
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Example: category,name,color
                        <br />
                        Group A,Category One,#ff0000
                        <br />
                        Group B,Category Two,#0000ff
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}

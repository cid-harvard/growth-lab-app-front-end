import { memo, useState, useMemo } from "react";
import { colorScale } from "../../utils";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import {
  Modal,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";

const SupplyChainCircle = memo(({ circle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const productLookup = useProductLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();

  const products = useMemo(() => {
    // Flatten all product arrays
    const allProducts = Array.from(supplyChainProductLookup.values()).flat();
    // Filter by supplyChainId (circle.id)
    const filtered = allProducts.filter(
      (item) => item.supplyChainId === circle.id,
    );

    // Deduplicate by productId since the same product can appear in multiple clusters
    const uniqueProducts = new Map();
    filtered.forEach((item) => {
      if (!uniqueProducts.has(item.productId)) {
        uniqueProducts.set(item.productId, item);
      }
    });

    // Optionally, if you want to filter by clusterId, add: && item.clusterId === someClusterId
    return Array.from(uniqueProducts.values())
      .map((item) => {
        const productDetails = productLookup.get(item.productId);
        return {
          id: item.productId,
          name: productDetails?.nameShortEn || productDetails?.nameEn,
          code: productDetails?.code,
        };
      })
      .filter((product) => product.name);
  }, [circle.id, productLookup, supplyChainProductLookup]);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    maxWidth: "80%",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  return (
    <>
      <g
        key={circle.id}
        className="parent-circle"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
        style={{ cursor: "pointer" }}
      >
        <rect
          x={circle.x - circle.radius - 5}
          y={circle.y - circle.radius - (isMobile ? 20 : 65)}
          width={circle.radius * 2 + 10}
          height={circle.radius * 2 + (isMobile ? 20 : 70)}
          fill="rgba(255,255,255,0)"
          stroke={colorScale(circle.id)}
          strokeWidth={2}
          strokeDasharray="5,5"
          strokeOpacity={isHovered ? 1 : 0}
          cursor="pointer"
        />
        <circle
          id={`parent-circle-${circle.id}`}
          cx={circle.x}
          cy={circle.y}
          r={circle.radius + 2}
          fill={colorScale(circle.id)}
          fillOpacity={0.1}
          strokeWidth={2}
          stroke={colorScale(circle.id)}
          strokeOpacity={0.3}
          pointerEvents="none"
        />
      </g>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            {circle.name} Products
          </Typography>
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              "& .MuiTableHead-root": {
                position: "sticky",
                top: 0,
                backgroundColor: "background.paper",
                zIndex: 1,
              },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Product Code</TableCell>
                  <TableCell>Product Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>
    </>
  );
});

export default SupplyChainCircle;

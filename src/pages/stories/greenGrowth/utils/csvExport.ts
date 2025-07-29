import {
  ProcessedProductData,
  ProcessedCountryData,
} from "../hooks/useProcessedTableData";

// Utility functions for CSV generation
const formatNumber = (
  value: number | null | undefined,
  decimals = 2,
): string => {
  if (value === null || value === undefined || isNaN(value)) return "";
  return value.toFixed(decimals);
};

const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "";
  return (value * 100).toFixed(1);
};

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "";
  return value.toString();
};

const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // If the value contains commas, quotes, or newlines, wrap in quotes and escape internal quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const downloadCSV = (data: string, filename: string) => {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateProductsCSV = (
  data: ProcessedProductData[],
  countryName: string,
  year: string,
): void => {
  if (!data.length) return;

  const headers = [
    "Product Code",
    "Product Name",
    "Product Level",
    "Industry Cluster",
    "Supply Chain",
    "Export RCA",
    "Export Value (USD)",
    "Expected Exports (USD)",
    "Product Complexity",
    "Opportunity Gain",
    "Density",
    "Global Market Share",
    "Product Market Share",
    "Market Growth (%)",
    "Market Share Growth (%)",
    "PCI Std Dev",
    "COG Std Dev",
    "Feasibility Std Dev",
    "Strategy Balanced Portfolio",
    "Strategy Long Jump",
    "Strategy Low Hanging Fruit",
    "Strategy Frontier",
    "Composite Score",
  ];

  const rows = data.map((row: ProcessedProductData) => [
    escapeCSV(row.productCode),
    escapeCSV(row.productName),
    escapeCSV(row.productLevel),
    escapeCSV(row.clusterName),
    escapeCSV(row.supplyChainName),
    escapeCSV(formatNumber(row.exportRca)),
    escapeCSV(formatCurrency(row.exportValue)),
    escapeCSV(formatCurrency(row.expectedExports)),
    escapeCSV(formatNumber(row.normalizedPci)),
    escapeCSV(formatNumber(row.normalizedCog)),
    escapeCSV(formatNumber(row.density)),
    escapeCSV(formatNumber(row.globalMarketShare)),
    escapeCSV(formatNumber(row.productMarketShare)),
    escapeCSV(formatPercent(row.marketGrowth)),
    escapeCSV(formatPercent(row.productMarketShareGrowth)),
    escapeCSV(formatNumber(row.pciStd)),
    escapeCSV(formatNumber(row.cogStd)),
    escapeCSV(formatNumber(row.feasibilityStd)),
    escapeCSV(formatNumber(row.strategyBalancedPortfolio)),
    escapeCSV(formatNumber(row.strategyLongJump)),
    escapeCSV(formatNumber(row.strategyLowHangingFruit)),
    escapeCSV(formatNumber(row.strategyFrontier)),
    escapeCSV(formatNumber(row.pciCogFeasibilityComposite)),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");
  const filename = `greenplexity_products_${countryName}_${year}.csv`;

  downloadCSV(csvContent, filename);
};

export const generateCountryCSV = (
  data: ProcessedCountryData[],
  year: string,
): void => {
  if (!data.length) return;

  const headers = [
    "Country Name",
    "Country Code",
    "Year",
    "Green COI",
    "Ln Total Net NR Exp PC",
    "Ln GDP Per Capita",
    "Export Residual",
  ];

  const rows = data.map((row: ProcessedCountryData) => [
    escapeCSV(row.countryName),
    escapeCSV(row.countryCode),
    escapeCSV(row.year),
    escapeCSV(formatNumber(row.coiGreen)),
    escapeCSV(formatNumber(row.lntotnetnrexpPc)),
    escapeCSV(formatNumber(row.lnypc)),
    escapeCSV(formatNumber(row.xResid)),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");
  const filename = `greenplexity_countries_${year}.csv`;

  downloadCSV(csvContent, filename);
};

export const downloadBothCSVs = (
  productsData: ProcessedProductData[],
  countryData: ProcessedCountryData[],
  countryName: string,
  year: string,
): void => {
  // Download both CSVs with a small delay to avoid browser blocking
  generateProductsCSV(productsData, countryName, year);

  setTimeout(() => {
    generateCountryCSV(countryData, year);
  }, 100);
};

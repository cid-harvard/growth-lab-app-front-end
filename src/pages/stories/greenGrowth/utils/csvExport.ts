import type {
  ProcessedProductData,
  ProcessedCountryData,
} from "../hooks/useProcessedTableData";

// Utility functions for CSV generation
const formatNumber = (
  value: number | null | undefined,
  decimals = 2,
): string => {
  const num = typeof value === "number" ? value : Number(value);
  if (value === null || value === undefined || Number.isNaN(num)) return "";
  return num.toFixed(decimals);
};

const formatPercent = (value: number | null | undefined): string => {
  const num = typeof value === "number" ? value : Number(value);
  if (value === null || value === undefined || Number.isNaN(num)) return "";
  return (num * 100).toFixed(1);
};

const formatCurrency = (value: number | null | undefined): string => {
  const num = typeof value === "number" ? value : Number(value);
  if (value === null || value === undefined || Number.isNaN(num)) return "";
  return num.toString();
};

const escapeCSV = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const str = String(value as string);
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
    "HS Code",
    "Product",
    "Green Industrial Cluster",
    "Green Value Chain",
    `Product Export Value (USD, ${year})`,
    `Product Market Size (USD, ${year})`,
    "Product Market Growth (%)",
    "Export RCA",
    "Opportunity Gain",
    "Product Complexity",
    "Product Feasibility",
  ];

  const rows = data.map((row: ProcessedProductData) => [
    escapeCSV(row.productCode ? `HS #${row.productCode}` : ""),
    escapeCSV(row.productName),
    escapeCSV(row.clusterName),
    escapeCSV(row.supplyChainName),
    escapeCSV(formatCurrency(row.exportValue)),
    escapeCSV(formatCurrency(row.marketSize ?? null)),
    escapeCSV(formatPercent(row.marketGrowth)),
    escapeCSV(formatNumber(row.exportRca)),
    escapeCSV(formatNumber(row.normalizedCog)),
    escapeCSV(formatNumber(row.normalizedPci)),
    escapeCSV(formatNumber(row.density)),
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(","),
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
    headers.map(escapeCSV).join(","),
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

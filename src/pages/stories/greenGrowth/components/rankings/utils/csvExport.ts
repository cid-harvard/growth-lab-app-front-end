import type { RankedRow } from "../types";

export const downloadTableAsCSV = (
  sortedRanked: RankedRow[],
  year: number,
  prevRankByIso3: Map<string, number>,
) => {
  const headers = [
    "Year",
    "ISO3 Code",
    "Rank",
    "Country",
    "Greenplexity Index",
    "Change in 5yrs",
  ];

  const escapeCSV = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = sortedRanked.map((row) => {
    const prevRank = prevRankByIso3.get(row.iso3);
    const delta = typeof prevRank === "number" ? prevRank - row.rank : null;
    return [
      escapeCSV(year),
      escapeCSV(row.iso3),
      escapeCSV(row.rank),
      escapeCSV(row.name),
      escapeCSV(row.rankingMetric.toFixed(2)),
      escapeCSV(delta !== null ? delta : "N/A"),
    ];
  });

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `greenplexity_country_index_${year}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const fs = require("fs");

function convertJsonToCsv(jsonFile, csvFile) {
  const jsonData = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
  const headers = Object.keys(jsonData[0]);
  const csvContent = [
    headers.join(","),
    ...jsonData.map((row) => headers.map((header) => row[header]).join(",")),
  ].join("\n");

  fs.writeFileSync(csvFile, csvContent);
  console.log(`Converted ${jsonFile} to ${csvFile}`);
}

// Convert nodes
convertJsonToCsv("nodes_test.json", "nodes_test.csv");
// Convert links
convertJsonToCsv("links_test.json", "links_test.csv");

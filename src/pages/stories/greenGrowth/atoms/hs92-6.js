import { selector } from "recoil";
import { loadParquetDataAndSchema } from "../utils";
import { index } from "d3-array";

export const parseJsonString = (jsonString) => {
  const regex = /'([^']*)'|"([^"]*)"/g;
  const matches = [];
  let match;
  while ((match = regex.exec(jsonString)) !== null) {
    matches.push(match[1] || match[2]);
  }
  // Ensure the string is properly formatted as JSON
  const jsonStringFormatted = `[${matches.map((m) => `"${m}"`).join(",")}]`;
  return JSON.parse(jsonStringFormatted);
};

export default selector({
  key: "hs92-6Selector",
  get: async () => {
    const url = import.meta.env.BASE_URL + "HS1992_6_snappy.parquet";
    try {
      const { data, schema } = await loadParquetDataAndSchema(url);

      const [_, z, ...schemaNames] = schema.schema;
      const dataLookup = index(
        data.map(([hsCode, ...rest]) => {
          const processed = Object.values(rest).map(parseJsonString);

          const processedObject = processed.reduce((acc, d, i) => {
            acc[schemaNames[i].name] = d;
            return acc;
          }, {});
          return { hsCode, ...processedObject };
        }),
        (d) => d.hsCode,
      );
      return dataLookup;
    } catch (error) {
      console.error("Error loading Parquet data:", error);
      throw error;
    }
  },
});

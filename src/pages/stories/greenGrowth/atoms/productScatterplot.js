import { selector } from "recoil";
import { loadParquetDataAndSchema } from "../utils";
import { group } from "d3-array";

export const productScatterplotSelector = selector({
  key: "productScatterplotSelector",
  get: async () => {
    const url = import.meta.env.BASE_URL + "product_scatterplot_snappy.parquet";
    try {
      const { data, schema } = await loadParquetDataAndSchema(url);

      const [_, ...schemaNames] = schema.schema;

      const dataLookup = group(
        data.map(([year, exportValue, importValue, ...rest]) => {
          const processedObject = rest.reduce((acc, d, i) => {
            acc[schemaNames[i + 3].name] = d;
            return acc;
          }, {});
          return {
            ...processedObject,
            year: year.slice(0, 4),
            export_value: exportValue,
            import_value: importValue.endsWith("n")
              ? importValue.slice(0, -1)
              : importValue,
          };
        }),
        (d) => d.iso3_code,
        (d) => d.year.slice(0, 4),
        (d) => `${d.HS2012}`,
      );
      console.log(dataLookup);
      const productLookup = Object.fromEntries(
        data.map(([, , , , , , , , , , , product_name, HS2012]) => [
          HS2012,
          product_name,
        ]),
      );

      return { dataLookup, productLookup };
    } catch (error) {
      console.error("Error loading Parquet data:", error);
      throw error;
    }
  },
});

import { selector } from "recoil";
import { loadParquetDataAndSchema } from "../utils";
import { group } from "d3-array";

export default selector({
  key: "expectedActualProductSelector",
  get: async () => {
    const url =
      import.meta.env.BASE_URL + "expected_actual_product_snappy.parquet";
    try {
      const { data, schema } = await loadParquetDataAndSchema(url);

      const [_, ...schemaNames] = schema.schema;

      const dataLookup = group(
        data.map(([year, country, product, countryCode, ...rest]) => {
          const processedObject = rest.reduce((acc, d, i) => {
            acc[schemaNames[i + 4].name] = d;
            return acc;
          }, {});
          return {
            year: year.slice(0, -1),
            country,
            product,
            id: countryCode,
            ...processedObject,
          };
        }),
        (d) => d.id,
        (d) => d.year,
        (d) => d.product,
      );

      const countryLookup = Object.fromEntries(
        data.map(([, country, , countryCode]) => [countryCode, country]),
      );

      return { dataLookup, countryLookup };
    } catch (error) {
      console.error("Error loading Parquet data:", error);
      throw error;
    }
  },
});

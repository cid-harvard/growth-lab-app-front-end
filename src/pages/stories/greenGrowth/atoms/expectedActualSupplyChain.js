import { selector } from "recoil";
import { loadParquetDataAndSchema } from "../utils";

export default selector({
  key: "parquetDataSelector",
  get: async () => {
    const url =
      import.meta.env.BASE_URL + "expected_actual_supplychain_snappy.parquet";
    try {
      const { data, schema } = await loadParquetDataAndSchema(url);
      return { data, schema };
    } catch (error) {
      console.error("Error loading Parquet data:", error);
      throw error;
    }
  },
});

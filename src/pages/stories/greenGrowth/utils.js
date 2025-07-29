import { asyncBufferFromUrl, parquetRead, parquetMetadata } from "hyparquet";
function serializeBigInt(key, value) {
  if (typeof value === "bigint") {
    return value.toString() + "n";
  }
  return value;
}
export async function loadParquetDataAndSchema(url) {
  const [data, schema] = await Promise.all([
    loadParquetData(url),
    loadParquetSchema(url),
  ]);
  return { data, schema };
}

export async function loadParquetSchema(url) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const metadata = parquetMetadata(arrayBuffer);
  return JSON.parse(JSON.stringify(metadata, serializeBigInt));
}

async function loadParquetData(url) {
  let data;
  await parquetRead({
    file: await asyncBufferFromUrl(url),
    onComplete: (d) => (data = JSON.parse(JSON.stringify(d, serializeBigInt))),
  });

  return data;
}

const generateId = (d) => `${d.id}-${d.parentId}`;

export const sortByStringId = (a, b) => {
  return generateId(a).localeCompare(generateId(b));
};

// Re-export color utilities
export {
  colorScale,
  getSupplyChainColor,
  getValueChainColor,
} from "./utils/colors";

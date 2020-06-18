import raw from 'raw.macro';

enum Category {
  Food = 'Food',
  Beverages = 'Beverages',
  CrudeMaterials = 'Crude Materials',
  Fuels = 'Fuels',
  VegetableOils = 'Vegetable Oils',
  Chemicals = 'Chemicals',
  MaterialManufacturers = 'Material Manufacturers',
  MachineryAndVehicles = 'Machinery and Vehicles',
  OtherManufacturers = 'Other Manufacturers',
  Unspecified = 'Unspecified',
  Services = 'Services',
}

const sectors: {name: Category, id: number, fill: string}[] = [
  {id: 0,  fill: '#F5BD7D', name: Category.Food},
  {id: 1,  fill: '#537DAA', name: Category.Beverages},
  {id: 2,  fill: '#F08D34', name: Category.CrudeMaterials},
  {id: 3,  fill: '#A2B330', name: Category.Fuels},
  {id: 4,  fill: '#E56F72', name: Category.VegetableOils},
  {id: 5,  fill: '#A1CBE7', name: Category.Chemicals},
  {id: 6,  fill: '#B69930', name: Category.MaterialManufacturers},
  {id: 7,  fill: '#8CD17D', name: Category.MachineryAndVehicles},
  {id: 8,  fill: '#F1CE63', name: Category.OtherManufacturers},
  {id: 9,  fill: '#86BCB6', name: Category.Unspecified},
  {id: 10, fill: '#499894', name: Category.Services},
];

interface RawTreemapData {
  year_2013: number;
  year_2014: number;
  year_2015: number;
  year_2016: number;
  year_2017: number;
  combined: string;
  sitc_code: string | number;
  sitc_name: string;
  change: number;
  percent_of_total: number;
  sectory_id: number;
  category: string;
}

interface TreeMapData {
  id: string;
  label: string;
  children: {
    id: string;
    label: string;
    fill: string;
    children: {
      id: string;
      label: string;
      tooltipContent: string;
      size: number;
    }[]
  }[];
}

const rawData: RawTreemapData[] = JSON.parse(raw('./data/export_treemap.json'));

const treemapData: TreeMapData = {
  id: 'albania-export-growth-2013-2017',
  label: 'albania-export-growth-2013-2017',
  children: [],
};

sectors.forEach(({id, name, fill}) => {
  treemapData.children.push({
    id: 'sector_' + id,
    label: name, fill, children: [],
  });
});

rawData.forEach(({sitc_name, sitc_code, percent_of_total, sectory_id}) => {
  if (percent_of_total > 0.01 && sitc_name !== 'Unknown') {
    treemapData.children[sectory_id].children.push({
      id: 'product_' + sitc_code,
      label: sitc_name,
      size: parseFloat(percent_of_total.toFixed(2)),
      tooltipContent: `<strong style='margin-right: 12px;'>${sitc_name}:</strong>  ${percent_of_total.toFixed(2)}%`,
    });
  }
});

export default treemapData;

import {Datum, LabelPosition} from '../../../components/dataViz/lineChart';
import raw from 'raw.macro';

interface Axis {
  minY:number;
  maxY:number;
  minX:number;
  maxX:number;
}

const eciAxis: Axis = {
  minY: -0.5,
  maxY: 2,
  minX: 2000,
  maxX: 2020,
};
const gdpAxis: Axis = {
  minY: 0,
  maxY: 90,
  minX: 2000,
  maxX: 2020,
};

const colors: string[] = [
  '#21897c',
  '#fa8003',
  '#8da401',
  '#fa8003',
  '#fcd300',
  '#fcc357',
  '#a17f00',
  '#bdce00',
  '#6ad373',
  '#2baabe',
  '#f80717',
  '#84dbe6',
];

interface RawDatum {
  location_name_short_en: string;
  year: number;
  hs_eci: number | undefined;
  value: number | undefined;
}

const rawData: RawDatum[] = JSON.parse(raw('./data/eci_gdp_timeline_data.json'));

const eci: Datum[] = [];
const gdp: Datum[] = [];

let eciColorCount = 0;
let gdpColorCount = 0;
rawData.forEach(({location_name_short_en, year, hs_eci, value: gdp_value}) => {
  if (year < 2018) {
    if (hs_eci) {
      const targetIndex = eci.findIndex(({label}) => label === location_name_short_en);
      if (targetIndex !== -1) {
        eci[targetIndex].coords.push({x: year, y: hs_eci});
      } else {
        let labelPosition: LabelPosition | undefined;
        if (location_name_short_en === 'North Macedonia') {
          labelPosition = LabelPosition.Bottom;
        } else {
          labelPosition = undefined;
        }
        eci.push({
          coords: [{x: year, y: hs_eci}],
          label: location_name_short_en,
          labelColor: colors[eciColorCount],
          color: colors[eciColorCount++],
          labelPosition,
        });
      }
    }
    if (gdp_value) {
      const targetIndex = gdp.findIndex(({label}) => label === location_name_short_en);
      if (targetIndex !== -1) {
        gdp[targetIndex].coords.push({x: year, y: gdp_value});
      } else {
        let labelPosition: LabelPosition | undefined;
        if (location_name_short_en === 'Croatia' ||
            location_name_short_en === 'Bosnia and Herzegovina' ||
            location_name_short_en === 'Albania') {
          labelPosition = LabelPosition.Bottom;
        } else if (location_name_short_en === 'Romania') {
          labelPosition = LabelPosition.Top;
        } else {
          labelPosition = undefined;
        }
        gdp.push({
          coords: [{x: year, y: gdp_value}],
          label: location_name_short_en,
          labelColor: colors[gdpColorCount],
          color: colors[gdpColorCount++],
          labelPosition,
        });
      }
    }
  }
});

export default {eci, gdp, eciAxis, gdpAxis};
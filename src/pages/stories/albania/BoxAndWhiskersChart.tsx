import React from 'react';
import DataViz, {VizType} from '../../../components/dataViz';
import {Datum} from '../../../components/dataViz/boxAndWhiskers';
import raw from 'raw.macro';
import {secondaryFont} from '../../../styling/styleUtils';

const albania = 'ALB';

const peers = [
  'BGR', // Bulgaria,
  'BIH', // Boznia and Herzegovina,
  'GRC', // Greece,
  'HRV', // Croatia,
  'MKD', // N Macedonia,
  'MNE', // Montenegro,
  'ROU', // Romania,
  'SLV', // Slovakia,
  'SRB', // Serbia,
];

const categories = [
  {key: '1996-1998', targets: [1996, 1997, 1998]},
  {key: '1999-2001', targets: [1999, 2000, 2001]},
  {key: '2002-2004', targets: [2002, 2003, 2004]},
  {key: '2005-2007', targets: [2005, 2006, 2007]},
  {key: '2008-2010', targets: [2008, 2009, 2010]},
  {key: '2011-2013', targets: [2011, 2012, 2013]},
  {key: '2014-2016', targets: [2014, 2015, 2016]},
];

interface RawDatum {
  ISO: string;
  year: number;
  contract_mean: number;
}

const rawData: RawDatum[] = JSON.parse(raw('./data/contract_intensity_data.json'));

const data: Datum[] = [];

rawData.forEach(({ISO, year, contract_mean}) => {
  const yearRange = categories.find(({targets}) => targets.includes(year));
  if (yearRange) {
    const existingDatumIndex = data.findIndex(({category, label}) => category === yearRange.key && label === ISO);
    if (existingDatumIndex !== -1) {
      data[existingDatumIndex].value = data[existingDatumIndex].value + contract_mean;
    } else {
      data.push({
        category: yearRange.key,
        label: ISO,
        value: contract_mean,
        primaryPoint: ISO === albania,
        plotPoint: [...peers, albania].includes(ISO),
      });
    }
  }
});


const BoxAndWhisketChart = () => {
  return (
    <DataViz
      id={'albania-story-box-and-whiskers-chart'}
      vizType={VizType.BoxAndWhiskersChart}
      data={data}
      labelFont={secondaryFont}
    />
  );
};

export default BoxAndWhisketChart;

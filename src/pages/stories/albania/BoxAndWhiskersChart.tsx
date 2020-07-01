import React from 'react';
import DataViz, {VizType} from '../../../components/dataViz';
import {Datum} from '../../../components/dataViz/boxAndWhiskers';
import raw from 'raw.macro';
import {secondaryFont} from '../../../styling/styleUtils';
import {storyMobileWidth} from '../../../styling/Grid';

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
  {
    key: window.innerWidth > storyMobileWidth ? '1996-1998' : '\'96-\'98',
    targets: [1996, 1997, 1998],
  },
  {
    key: window.innerWidth > storyMobileWidth ? '1999-2001' : '\'99-\'01',
    targets: [1999, 2000, 2001],
  },
  {
    key: window.innerWidth > storyMobileWidth ? '2002-2004' : '\'02-\'04',
    targets: [2002, 2003, 2004],
  },
  {
    key: window.innerWidth > storyMobileWidth ? '2005-2007' : '\'05-\'07',
    targets: [2005, 2006, 2007],
  },
  {
    key: window.innerWidth > storyMobileWidth ? '2008-2010' : '\'08-\'10',
    targets: [2008, 2009, 2010],
  },
  {
    key: window.innerWidth > storyMobileWidth ? '2011-2013' : '\'11-\'13',
    targets: [2011, 2012, 2013],
  },
  {
    key: window.innerWidth > storyMobileWidth ? '2014-2016' : '\'14-\'16',
    targets: [2014, 2015, 2016],
  },
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

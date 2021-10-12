import React from 'react';
import {ProductClass, colorScheme} from './Utils';
import StickySubHeading from '../../components/text/StickySubHeading';
import {Factor} from './graphql/graphQLTypes';
import Overview from './components/Overview';
import IndustryNow from './components/IndustryNow';
import NearbyIndustries, {ProximityDatum} from './components/NearbyIndustries';
import {
  ScatterPlotDatum,
} from 'react-fast-charts';
import {Datum as HeatMapDatum} from './components/GeoMap';
import {BarDatum, EmploymentGroup, Region} from './components/GroupsOfInterest';
import {MissingSharedDatum} from './components/SharedAndMissingOccupations';

interface Props {
  id: string;
  productClass: ProductClass;
  name: string;
  code: string;
  factors: Factor;
  setStickyHeaderHeight: (h: number) => void;
  scatterPlotData: ScatterPlotDatum[];
  scatterPlotJsonData: object[];
  proximityData: ProximityDatum[];
  heatMapData: HeatMapDatum[];
  sharedMissingData: MissingSharedDatum[];
  averageFeasibility: number;
  averageAttractiveness: number;
  medianFeasibility: number;
  medianAttractiveness: number;
}

const Content = (props: Props) => {
  const {
    name, code, productClass, setStickyHeaderHeight,
    scatterPlotData, scatterPlotJsonData, factors,
    proximityData, heatMapData, sharedMissingData,
    averageFeasibility, averageAttractiveness,
    medianFeasibility, medianAttractiveness,
  } = props;

  const barData: BarDatum[] = [
    {
      employmentGroup: EmploymentGroup.lowSkilled,
      percent: factors.shareLskill * 100,
      region: Region.World,
    },
    {
      employmentGroup: EmploymentGroup.women,
      percent: factors.shareFemale * 100,
      region: Region.World,
    },
    {
      employmentGroup: EmploymentGroup.youth,
      percent: factors.shareYouth * 100,
      region: Region.World,
    },
  ];

  return (
    <>
      <StickySubHeading
        title={`${name} (${productClass} ${code})`}
        highlightColor={colorScheme.secondary}
        onHeightChange={(h) => setStickyHeaderHeight(h)}
        />
      <Overview
        industryName={name}
        code={code}
        data={scatterPlotData}
        jsonData={scatterPlotJsonData}
        factors={factors}
        averageFeasibility={averageFeasibility}
        averageAttractiveness={averageAttractiveness}
        medianFeasibility={medianFeasibility}
        medianAttractiveness={medianAttractiveness}
      />
      <IndustryNow
        heatMapData={heatMapData}
        barData={barData}
        sharedMissingData={sharedMissingData}
        industryName={name}
      />
      <NearbyIndustries
        industryName={name}
        productClass={productClass}
        data={proximityData}
      />
    </>
  );
};

export default Content;

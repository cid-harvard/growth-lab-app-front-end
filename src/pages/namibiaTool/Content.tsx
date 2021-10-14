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
import {BarDatum, EmploymentGroup} from './components/GroupsOfInterest';
import {TableDatum} from './components/SharedAndMissingOccupations';

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
  sharedData: TableDatum[];
  missingData: TableDatum[];
  averageFeasibility: number;
  averageAttractiveness: number;
  medianFeasibility: number;
  medianAttractiveness: number;
  employmentFemaleAvg: number;
  employmentLskillAvg: number;
  employmentYouthAvg: number;
}

const Content = (props: Props) => {
  const {
    name, code, productClass, setStickyHeaderHeight,
    scatterPlotData, scatterPlotJsonData, factors,
    proximityData, heatMapData, sharedData, missingData,
    averageFeasibility, averageAttractiveness,
    medianFeasibility, medianAttractiveness,
    employmentFemaleAvg, employmentLskillAvg, employmentYouthAvg,
  } = props;

  const worldData: BarDatum[] = [
    {
      employmentGroup: EmploymentGroup.lowSkilled,
      percent: factors.shareLskill * 100,
    },
    {
      employmentGroup: EmploymentGroup.women,
      percent: factors.shareFemale * 100,
    },
    {
      employmentGroup: EmploymentGroup.youth,
      percent: factors.shareYouth * 100,
    },
  ];

  const averageData: BarDatum[] = [
    {
      employmentGroup: EmploymentGroup.lowSkilled,
      percent: employmentLskillAvg * 100,
    },
    {
      employmentGroup: EmploymentGroup.women,
      percent: employmentFemaleAvg * 100,
    },
    {
      employmentGroup: EmploymentGroup.youth,
      percent: employmentYouthAvg * 100,
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
        worldData={worldData}
        averageData={averageData}
        sharedData={sharedData}
        missingData={missingData}
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

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
}

const Content = (props: Props) => {
  const {
    name, code, productClass, setStickyHeaderHeight,
    scatterPlotData, scatterPlotJsonData, factors,
    proximityData, heatMapData,
  } = props;

  return (
    <>
      <StickySubHeading
        title={`${name} (${productClass} ${code})`}
        highlightColor={colorScheme.primary}
        onHeightChange={(h) => setStickyHeaderHeight(h)}
      />
      <Overview
        industryName={name}
        code={code}
        data={scatterPlotData}
        jsonData={scatterPlotJsonData}
        factors={factors}
      />
      <IndustryNow
        heatMapData={heatMapData}
      />
      <NearbyIndustries
        productClass={productClass}
        data={proximityData}
      />
    </>
  );
};

export default Content;

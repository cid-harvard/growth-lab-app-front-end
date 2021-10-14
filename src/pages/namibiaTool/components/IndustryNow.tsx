import React from 'react';
import {
  SectionHeader,
} from '../../../styling/styleUtils';
import GeoMap, {Datum} from './GeoMap';
import SharedAndMissingOccupations, {TableDatum} from './SharedAndMissingOccupations';
import GroupsOfInterest, {BarDatum} from './GroupsOfInterest';
import {
  ProductClass,
  useProductClass,
} from '../Utils';

interface Props {
  industryName: string;
  heatMapData: Datum[];
  worldData: BarDatum[];
  averageData: BarDatum[];
  sharedData: TableDatum[];
  missingData: TableDatum[];
}

const IndustryNow = (props: Props) => {
  const { heatMapData, worldData, averageData, sharedData, missingData, industryName } = props;
  const productClass = useProductClass();
  const productOrIndustry = productClass === ProductClass.HS ? 'product' : 'industry';
  const productOrIndustryPlural = productClass === ProductClass.HS ? 'products' : 'industries';
  return (
    <>
      <div id={'industry-now'}>
        <SectionHeader>Industry Characteristics</SectionHeader>
        <p>
          This section provides more information on the current presence of {industryName} in Namibia, including: the demand and market for this {productOrIndustry} in the region, the occupations that are present and missing in Namibia that are related to the {productOrIndustry}, and the employment of certain groups of interest within this {productOrIndustry}. The images in this section only display information for {productOrIndustryPlural} when data is available.
        </p>
      </div>
      <GeoMap
        heatMapData={heatMapData}
      />
      <SharedAndMissingOccupations
        sharedData={sharedData}
        missingData={missingData}
      />
      <GroupsOfInterest
        worldData={worldData}
        averageData={averageData}
      />
    </>
  );
};

export default IndustryNow;

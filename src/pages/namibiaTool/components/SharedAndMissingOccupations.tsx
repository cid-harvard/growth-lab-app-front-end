import React from 'react';
import {
  TwoColumnSection,
  SectionHeaderSecondary,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import {colorScheme} from '../Utils';
import DataViz, {
  VizType,
} from 'react-fast-charts';

const SharedAndMissingOccupations = () => {
  return (
    <>
      <SectionHeaderSecondary color={colorScheme.quaternary}>Shared And Missing Occupations</SectionHeaderSecondary>
      <TwoColumnSection>
        <DataViz
          id={'namibia-shared-and-missing-occupations-list'}
          vizType={VizType.Error}
          message={'PLACHOLDER FOR SHARED AND MISSING OCCUPATIONS LIST'}
        />
        <TextBlock>
          <div>
            <p>The table to the left displays the top 10 existing and missing occupations present in Namibia that are associated with the products or other inputs used in the production of the product. Occupations related to this activity are ranked by those that comprise the biggest share of occupations in the activity and the table shows the top 10 for those occupations that exist and those that are missing in Namibia for this product.</p>
          </div>
        </TextBlock>
      </TwoColumnSection>
    </>
  );
};

export default SharedAndMissingOccupations;

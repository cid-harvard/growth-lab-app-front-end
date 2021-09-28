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
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
        </TextBlock>
      </TwoColumnSection>
    </>
  );
};

export default SharedAndMissingOccupations;

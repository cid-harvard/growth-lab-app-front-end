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

const GroupsOfInterest = () => {
  return (
    <>
      <SectionHeaderSecondary color={colorScheme.quaternary}>Employment of groups of interest</SectionHeaderSecondary>
      <TwoColumnSection>
        <DataViz
          id={'namibia-employment-of-groups-of-interest'}
          vizType={VizType.Error}
          message={'PLACHOLDER'}
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

export default GroupsOfInterest;

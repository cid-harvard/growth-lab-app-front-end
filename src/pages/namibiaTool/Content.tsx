import React from 'react';
import {ProductClass, colorScheme} from './Utils';
import StickySubHeading from '../../components/text/StickySubHeading';
import {
  SectionHeader,
} from '../../styling/styleUtils';
import styled from 'styled-components/macro';

const PlaceholderSpace = styled.div`
  height: 75vh;
`;

interface Props {
  id: string;
  productClass: ProductClass;
  name: string;

  setStickyHeaderHeight: (h: number) => void;
}

const Content = (props: Props) => {
  const {
    name, setStickyHeaderHeight,
  } = props;

  return (
    <>
      <StickySubHeading
        title={name}
        highlightColor={colorScheme.primary}
        onHeightChange={(h) => setStickyHeaderHeight(h)}
      />
      <div id={'overview'}>
        <SectionHeader>Overview</SectionHeader>
      </div>
      <PlaceholderSpace />
      <div id={'industry-now'}>
        <SectionHeader>Industry Now</SectionHeader>
      </div>
      <PlaceholderSpace />
      <div id={'nearby-industries'}>
        <SectionHeader>Nearby Industries</SectionHeader>
      </div>
      <PlaceholderSpace />
    </>
  );
};

export default Content;

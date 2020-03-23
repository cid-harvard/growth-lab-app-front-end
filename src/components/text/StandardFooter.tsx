import React, {useContext} from 'react';
import {
  FullWidthFooter,
  FullWidthFooterContent,
} from '../../styling/Grid';
import {
  baseColor,
  secondaryFont,
} from '../../styling/styleUtils';
import styled from 'styled-components/macro';
import { AppContext } from '../../App';
import GrowthLabLogoPNG from './growth-lab-white.png';

const Root = styled(FullWidthFooter)`
  background-color: ${baseColor};
  color: #fff;
  padding: 2rem 2rem 4rem;
  font-family: ${secondaryFont};
`;

const Content = styled(FullWidthFooterContent)`
  display: grid;
  grid-column-gap: 1rem;
`;

const Heading = styled.h4`
  font-weight: 600;
  margin-bottom: 0.75rem;
  margin-top: 0;
`;

const Link = styled.a`
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const Text = styled.div`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const ColumnOrRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const GrowthLabLogo = styled.img`
  width: 200px;
  max-width: 100%;
`;

interface ListItem {
  label: string;
  target?: string;
}

interface SectionDatum {
  title?: string;
  items: ListItem[];
}

interface Props {
  footerItems: SectionDatum[];
}

const StandardFooter = (props: Props) => {
  const {footerItems} = props;
  const { windowWidth } = useContext(AppContext);

  let gridAutoFlow: string;
  if (windowWidth > 900) {
    gridAutoFlow = 'column';
  } else if (footerItems.length <= 2) {
    if (windowWidth < 550) {
      gridAutoFlow = 'row';
    } else {
      gridAutoFlow = 'column';
    }
  } else {
    gridAutoFlow = 'row';
  }

  const sectionElms = footerItems.map(({title, items}, i) => {
    const heading = title ? <Heading>{title}</Heading> : null;
    const list = items.map(({label, target}) => {
      if (target) {
        return <Link href={target} target={'_blank'} key={target + label}>{label}</Link>;
      } else {
        return <Text key={target + label}>{label}</Text>;
      }
    });
    if (title || list.length) {
      return (
        <ColumnOrRow key={'footer-column-row-' + i + list.length}>
          {heading}
          {list}
        </ColumnOrRow>
      );
    } else {
      return null;
    }
  });

  return (
    <Root>
      <Content style={{gridAutoFlow}}>
        <ColumnOrRow>
          <a
            href='https://growthlab.cid.harvard.edu/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <GrowthLabLogo
              src={GrowthLabLogoPNG}
              alt={'The Growth Lab at Harvard\'s Center for International Development'}
            />
          </a>
        </ColumnOrRow>
        {sectionElms}
      </Content>
    </Root>
  );
};

export default StandardFooter;
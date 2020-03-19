import React from 'react';
import {
  StandardH1,
  secondaryFont,
} from '../../../styling/styleUtils';
import {
  FullWidthHeader,
  FullWidthHeaderContent,
} from '../../../styling/Grid';
import styled from 'styled-components';
import {TreeNode} from 'react-dropdown-tree-select';
import MultiTierSearch from '../../navigation/MultiTierSearch';
import GrowthLabLogoImgSrc from './growth-lab.png';
import { rgba } from 'polished';

const Root = styled(FullWidthHeader)<{backgroundColor: string}>`
  padding: 1rem 0 2rem;
  background: linear-gradient(
    0deg,
    rgba(255,255,255,0) 0%,
    ${({backgroundColor}) => rgba(backgroundColor, 0.7)} 100%
  );
`;

const mediumMediaWidth = 1000;
const smallMediaWidth = 775;

const ContentGrid = styled(FullWidthHeaderContent)`
  display: grid;
  grid-template-columns: 7% 1fr 20%;
  grid-template-rows: auto auto;
  grid-column-gap: 1rem;

  @media (max-width: ${mediumMediaWidth}px) {
    grid-template-columns: 8vw 1fr 20vw;
  }

  @media (max-width: ${smallMediaWidth}px) {
    grid-template-columns: 9vw 1fr 140px;
    grid-column-gap: 0.7rem;
  }

  @media (max-width: 380px) {
    grid-template-columns: 8vw 1fr 100px;
    grid-column-gap: 0.7rem;
  }
`;

const LogoContainer = styled.div`
  grid-column: 1;
  grid-row: 1;
`;

const Logo = styled.img`
  width: 100%;
`;

const TitleContainer = styled.div`
  grid-column: 2;
  grid-row: 1;
  font-family: ${secondaryFont};
`;

const Title = styled(StandardH1)`
  @media (max-width: ${mediumMediaWidth}px) {
    font-size: 1.7rem;
  }
  @media (max-width: ${smallMediaWidth}px) {
    margin-top: 0;
  }
`;

const GrowthLabLogoContainer = styled.a`
  grid-column: 3;
  grid-row: 1;
`;

const SearchContainer = styled.div`
  grid-column: 1 / -1;
  grid-row: 2;
`;

const ButtonLink = styled.a<{primaryColor: string, secondaryColor: string}>`
  border: 2px solid ${({primaryColor}) => primaryColor};
  color: ${({primaryColor}) => primaryColor};
  text-transform: uppercase;
  text-decoration: none;
  padding: 0.4rem 0.6rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
  display: inline-block;

  &:hover {
    color: ${({secondaryColor}) => secondaryColor};
    background-color: ${({primaryColor}) => primaryColor};
    border-color: ${({primaryColor}) => primaryColor};
  }
`;

interface LinkDatum {
  label: string;
  target: string;
}

interface Props {
  title: string;
  searchLabelText: string;
  data: TreeNode[];
  initialSelectedValue?: TreeNode;
  onChange?: (val: TreeNode) => void;
  imageSrc: string;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  links?: LinkDatum[];
}

const HeaderWithSearch = (props: Props) => {
  const {
    title, searchLabelText, data, initialSelectedValue,
    imageSrc, textColor, backgroundColor, links, linkColor,
  } = props;

  const linkElms = links && links.length ? links.map(({label, target}) => (
    <ButtonLink
      primaryColor={linkColor}
      secondaryColor={textColor}
      href={target}
      target={'_blank'}
    >
      {label}
    </ButtonLink>
  )) : null;

  return (
    <Root backgroundColor={backgroundColor}>
      <ContentGrid>
        <LogoContainer>
          <Logo src={imageSrc} alt={title} />
        </LogoContainer>
        <TitleContainer>
          <Title style={{color: textColor}}>{title}</Title>
          {linkElms}
        </TitleContainer>
        <GrowthLabLogoContainer
          href={'https://growthlab.cid.harvard.edu/'}
          target={'_blank'}
        >
          <Logo
            src={GrowthLabLogoImgSrc}
            alt={'The Growth Lab at Harvard\'s Center for International Development'}
          />
        </GrowthLabLogoContainer>
        <SearchContainer>
          <MultiTierSearch
            searchLabelText={searchLabelText}
            data={data}
            initialSelectedValue={initialSelectedValue}
            onChange={props.onChange}
          />
        </SearchContainer>
      </ContentGrid>
    </Root>
  );
};

export default HeaderWithSearch;
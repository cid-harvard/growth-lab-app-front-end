import React from 'react';
import {
  FullWidthFooter,
  FullWidthFooterContent,
} from '../../styling/Grid';
import {
  secondaryFont,
} from '../../styling/styleUtils';
import styled from 'styled-components/macro';
import GrowthLabLogoPNG from './assets/growth-lab-white.png';
import {rgba} from 'polished';
import FacebookIconSVG from './assets/facebook.svg';
import TwitterIconSVG from './assets/twitter.svg';
import LinkedinIconSVG from './assets/linkedin.svg';

const Root = styled(FullWidthFooter)`
  color: #fff;
`;

const Container = styled.div`
  padding: 2rem 2rem 2rem;
`;

const smallMediaWidth = 700; // in px

const Content = styled(FullWidthFooterContent)`
  display: grid;
  grid-column-gap: 1rem;
  grid-template-columns: 1fr auto auto 1fr;
  font-family: ${secondaryFont};

  @media (max-width: ${smallMediaWidth}px) {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
  }
`;

const ColumnOrRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const LogoLink = styled.a`
  display: flex;
  justify-content: flex-end;
`;

const GrowthLabLogo = styled.img`
  width: 200px;
  max-width: 100%;
`;

const AttributionText = styled.p`
  margin: 0 0 0.5rem;
  font-size: 0.9rem;

  &:last-child {
    margin: 0;
  }
`;

const ExploreNextText = styled.div`
  text-transform: uppercase;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 1.2rem;
`;

const CenteredColumn = styled(ColumnOrRow)`
  justify-content: center;
  margin-bottom: 0;
`;

const SocialColumn = styled(CenteredColumn)`
  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 1;
    grid-row: 2;
  }
`;

const ExploreNextTitleColumn = styled(ColumnOrRow)`
  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 1;
    grid-row: 1;
  }
`;

const ExploreNextButtonsColumn = styled(ColumnOrRow)`
  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 2;
    grid-row: 1;
  }
`;

const LogoColumn = styled(CenteredColumn)`
  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 2;
    grid-row: 2;
  }
`;


const Arrow = styled.span`
  margin-left: 1rem;
  font-family: Arial;
`;

const SocialLink = styled.a`
  width: 25px;
  margin: 0 auto 0.9rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Icon = styled.img`
  max-width: 100%;
`;

const ExploreNextButton = styled.a<{hoveColor: string}>`
  display: block;
  padding: 0.4rem 0.8rem;
  text-transform: uppercase;
  margin-bottom: 0.9rem;
  text-decoration: none;
  color: #fff;
  border: solid 1px #fff;

  &:hover {
    background-color: #fff;
    color: ${({hoveColor}) => hoveColor};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export enum SocialType {
  facebook = 'facebook',
  twitter = 'twitter',
  linkedin = 'linkedin',
}

const socialIcon = {
  facebook: FacebookIconSVG,
  twitter: TwitterIconSVG,
  linkedin: LinkedinIconSVG,
};

interface Props {
  attributions: string[];
  socialItems: {target: string, type: SocialType}[];
  exploreNextLinks: {label: string, target: string}[];
  backgroundColor: string;
}

const StandardFooter = (props: Props) => {
  const {
    backgroundColor, attributions, socialItems, exploreNextLinks,
  } = props;

  const attributionsList = attributions.map(a => <AttributionText key={a}>{a}</AttributionText>);
  const socialItemsList = socialItems.map(({target, type}) =>{
    return (
      <SocialLink
        href={target}
        target='_blank'
        rel='noopener noreferrer'
        key={target}
      >
        <Icon src={socialIcon[type]} />
      </SocialLink>
    );
  });
  const exploreNextList = exploreNextLinks.map(({label, target}) => {
    return (
      <ExploreNextButton
        href={target}
        target='_blank'
        rel='noopener noreferrer'
        hoveColor={backgroundColor}
        key={target}
      >
        {label}
      </ExploreNextButton>
    );
  });

  return (
    <Root>
      <Container style={{backgroundColor: rgba(backgroundColor, 0.5)}}>
        <FullWidthFooterContent>
          {attributionsList}
        </FullWidthFooterContent>
      </Container>
      <Container style={{backgroundColor}}>
        <Content>
          <SocialColumn>
            {socialItemsList}
          </SocialColumn>
          <ExploreNextTitleColumn>
            <ExploreNextText>
              Explore Next <Arrow>→</Arrow>
            </ExploreNextText>
          </ExploreNextTitleColumn>
          <ExploreNextButtonsColumn>
            {exploreNextList}
          </ExploreNextButtonsColumn>
          <LogoColumn>
            <LogoLink
              href='https://growthlab.cid.harvard.edu/'
              target='_blank'
              rel='noopener noreferrer'
            >
              <GrowthLabLogo
                src={GrowthLabLogoPNG}
                alt={'The Growth Lab at Harvard\'s Center for International Development'}
              />
            </LogoLink>
          </LogoColumn>
        </Content>
      </Container>
    </Root>
  );
};

export default StandardFooter;
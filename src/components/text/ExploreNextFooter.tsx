import React from 'react';
import {
  FullWidthFooter,
  FullWidthFooterContent,
} from '../../styling/Grid';
import {
  primaryFont,
} from '../../styling/styleUtils';
import styled from 'styled-components/macro';
import GrowthLabLogoPNG from './headers/growth-lab.png';
import FacebookIconSVG from './assets/facebook.svg';
import TwitterIconSVG from './assets/twitter.svg';
import LinkedinIconSVG from './assets/linkedin.svg';

const Root = styled(FullWidthFooter)`
  color: #333;
`;

const Container = styled.div`
  padding: 2rem 2rem 2rem;
  background-color: #e6e6e6;
`;

const AttributionContainer = styled(Container)`
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAI0lEQVQYV2NkwAEYYeLeeU3GIPbWSXVnQTRhCXQT4TqIlgAACbAIB9ZyaUoAAAAASUVORK5CYII=) repeat;
`;

const smallMediaWidth = 700; // in px

const Content = styled(FullWidthFooterContent)`
  display: grid;
  grid-column-gap: 2rem;
  grid-template-columns: 2fr auto auto minmax(auto, 1fr);

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
  width: 350px;
  max-width: 100%;
  height: 100%;

  @media (max-width: 920px) {
    width: 280px;
  }
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

const SocialColumn = styled(ColumnOrRow)`
  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 1;
    grid-row: 2;
  }
`;

const ExploreNextTitleColumn = styled(ColumnOrRow)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

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
  display: flex;
  align-items: flex-end;

  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 2;
    grid-row: 2;
  }
`;

const GrowthLabInfo = styled.small`
  margin-top: 1rem;
  width: 350px;
  max-width: 100%;
  font-family: ${primaryFont};

  @media (max-width: 920px) {
    width: 280px;
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

const ExploreNextButton = styled.a`
  display: block;
  padding: 0.4rem 0.8rem;
  text-transform: uppercase;
  margin-bottom: 0.9rem;
  text-decoration: none;
  color: #333;
  border: solid 1px #333;

  &:hover {
    background-color: #333;
    color: #fff;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const GitHubLink = styled(ExploreNextButton)`
  text-transform: none;
  display: flex;
  align-items: center;
`;

const GitHubIcon = styled.img`
  width: 22px;
  margin-right: 0.5rem;
`;

const LicenseAndReadme = styled.p`
  padding: 0.5rem;
  text-align: center;
  background-color: #333;
  color: #fff;
  font-size: 0.875rem;
  margin-bottom: 0;

  a {
    color: #fff;
    text-decoration: none;
    border-bottom: solid 1px transparent;

    &:hover {
      border-bottom-color: #fff;
    }
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

const ExploreNextFooter = (props: Props) => {
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
        key={target + type}
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
        key={target + label}
      >
        {label}
      </ExploreNextButton>
    );
  });

  return (
    <Root>
      <AttributionContainer>
        <FullWidthFooterContent style={{color: backgroundColor}}>
          {attributionsList}
        </FullWidthFooterContent>
      </AttributionContainer>
      <Container>
        <Content>
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
            <GrowthLabInfo>
              Center for International Development at Harvard University<br />
              79 JFK St. | Mailbox 34 | Cambridge, MA 02138<br />
              617-495-4112 | cid@harvard.edu
            </GrowthLabInfo>
          </LogoColumn>
          <ExploreNextTitleColumn>
            <ExploreNextText>
              Explore Next <Arrow>→</Arrow>
            </ExploreNextText>
            <GitHubLink
              href='https://github.com/cid-harvard/country-tools-front-end'
              target='_blank'
              rel='noopener noreferrer'
            >
              <GitHubIcon src={require('./assets/githubicon.svg')} />
              GitHub Repo
            </GitHubLink>
          </ExploreNextTitleColumn>
          <ExploreNextButtonsColumn>
            {exploreNextList}
          </ExploreNextButtonsColumn>
          <SocialColumn>
            {socialItemsList}
          </SocialColumn>
        </Content>
      </Container>
      <LicenseAndReadme>
        Harvard Growth Lab’s Country Dashboards are licensed under <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/' target='_blank' rel='noopener noreferrer'>Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)</a>.
      </LicenseAndReadme>
    </Root>
  );
};

export default ExploreNextFooter;
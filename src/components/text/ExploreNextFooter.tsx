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
import YouTubeIconSVG from './assets/youtube.svg';
import ApplePodcastSVG from './assets/applepodcast.svg';
import { rgba } from 'polished';

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
  grid-column-gap: 3rem;
  grid-template-columns: 2fr auto minmax(auto, 1fr);

  @media (max-width: ${smallMediaWidth}px) {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    grid-column-gap: 1.5rem;
  }
`;

const ColumnOrRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const GrowthLabLogo = styled.img`
  width: 300px;
  max-width: 100%;
  height: 100%;

  @media (max-width: 920px) {
    width: 250px;
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
  margin-right: 1rem;
`;

const CenteredColumn = styled(ColumnOrRow)`
  justify-content: center;
  margin-bottom: 0;
`;

const SocialColumn = styled(ColumnOrRow)`
  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 2;
    grid-row: 1;
  }
`;

const RepoColumn = styled(ColumnOrRow)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 1 / -1;
    grid-row: 2;
    padding: 2rem 0 0;
    display: flex;
    align-items: center;;
  }
`;

const ExploreNextContainer = styled(FullWidthFooterContent)`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  padding: 1.25rem 1rem;
  white-space: nowrap;
`;

const LogoColumn = styled(CenteredColumn)`
  display: flex;
  align-items: center;

  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 1;
    grid-row: 1;
  }
`;

const GrowthLabInfo = styled.small`
  margin-top: 1rem;
  width: 300px;
  max-width: 100%;
  font-family: ${primaryFont};
  font-size: 0.75rem;

  @media (max-width: 920px) {
    width: 250px;
  }
`;


const Arrow = styled.span`
  margin-left: 0.35rem;
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

const ExploreNextButton = styled.a<{color: string}>`
  display: block;
  padding: 0.55rem 0.8rem;
  text-transform: uppercase;
  margin: 0.4rem 0.9rem;
  text-decoration: none;
  color: ${({color}) => color};
  border: solid 1px ${({color}) => color};

  &:hover {
    background-color: ${({color}) => color};
    color: #fff;
  }
`;

const GitHubLink = styled(ExploreNextButton)`
  text-transform: none;
  display: flex;
  align-items: center;
  padding: 0.3rem 0.8rem;
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
  youtube = 'youtube',
  applepodcast = 'applepodcast',
}


export const defaultSocialIcons = [
  {
    target: 'https://www.facebook.com/HarvardCID/',
    type: SocialType.facebook,
  },
  {
    target: 'https://www.linkedin.com/company/center-for-international-development-harvard-university/',
    type: SocialType.linkedin,
  },
  {
    target: 'https://twitter.com/HarvardGrwthLab',
    type: SocialType.twitter,
  },
  {
    target: 'https://www.youtube.com/user/HarvardCID',
    type: SocialType.youtube,
  },
  {
    target: 'https://podcasts.apple.com/us/podcast/growth-lab-podcast-series/id1486218164',
    type: SocialType.applepodcast,
  },
];

const socialIcon = {
  facebook: FacebookIconSVG,
  twitter: TwitterIconSVG,
  linkedin: LinkedinIconSVG,
  youtube: YouTubeIconSVG,
  applepodcast: ApplePodcastSVG,
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
        color={backgroundColor}
      >
        {label} <Arrow>↗</Arrow>
      </ExploreNextButton>
    );
  });

  return (
    <Root>
      <div style={{backgroundColor: rgba(backgroundColor, 0.2)}}>
        <ExploreNextContainer>
          <ExploreNextText style={{color: backgroundColor}}>
            Explore Next <Arrow>→</Arrow>
          </ExploreNextText>
          {exploreNextList}
        </ExploreNextContainer>
      </div>
      <AttributionContainer>
        <FullWidthFooterContent style={{color: backgroundColor}}>
          {attributionsList}
        </FullWidthFooterContent>
      </AttributionContainer>
      <Container>
        <Content>
          <LogoColumn>
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
            <GrowthLabInfo>
              Center for International Development at Harvard University<br />
              79 JFK St. | Mailbox 34 | Cambridge, MA 02138<br />
              617-495-4112 | cid@harvard.edu
            </GrowthLabInfo>
          </LogoColumn>
          <RepoColumn>
            <GitHubLink
              href='https://github.com/cid-harvard/growth-lab-app-front-end'
              target='_blank'
              rel='noopener noreferrer'
              color={'#333'}
            >
              <GitHubIcon src={require('./assets/githubicon.svg')} />
              GitHub Repo
            </GitHubLink>
          </RepoColumn>
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
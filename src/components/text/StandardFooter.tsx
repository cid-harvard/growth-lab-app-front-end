import React from 'react';
import {
  FullWidthFooter,
  FullWidthFooterContent,
} from '../../styling/Grid';
import {
  primaryFont,
} from '../../styling/styleUtils';
import styled from 'styled-components';
import GrowthLabLogoPNG from "../../assets/growth-lab-new-logo-2022.png"
import FacebookIconSVG from './assets/facebook.svg';
import InstagramIconSVG from "./assets/instagram.svg";
import TwitterIconSVG from './assets/twitter.svg';
import LinkedinIconSVG from './assets/linkedin.svg';
import YouTubeIconSVG from './assets/youtube.svg';
import ApplePodcastSVG from './assets/applepodcast.svg';
import {Routes, hubId} from '../../routing/routes';
import {triggerGoogleAnalyticsEvent} from '../../routing/tracking';
import GitHubIconSVG from "./assets/githubicon.svg";

export const Root = styled(FullWidthFooter)`
  color: #333;
`;

export const Container = styled.div`
  padding: 2rem 2rem 2rem;
  background-color: #e6e6e6;
`;

export const smallMediaWidth = 700; // in px

export const Content = styled(FullWidthFooterContent)`
  display: grid;
  grid-column-gap: 3rem;
  grid-template-columns: 2fr auto minmax(auto, 1fr);

  @media (max-width: ${smallMediaWidth}px) {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    grid-column-gap: 1.5rem;
  }
`;

export const ColumnOrRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

export const GrowthLabLogo = styled.img`
  width: 300px;
  max-width: 100%;
  height: 100%;

  @media (max-width: 920px) {
    width: 250px;
  }
`;

export const CenteredColumn = styled(ColumnOrRow)`
  justify-content: center;
  margin-bottom: 0;
`;

export const SocialColumn = styled(ColumnOrRow)`
  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 2;
    grid-row: 1;
  }
`;

export const RepoColumn = styled(ColumnOrRow)`
  display: flex;
  flex-direction: column;

  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 1 / -1;
    grid-row: 2;
    padding: 2rem 0 0;
    display: flex;
    align-items: center;;
  }
`;

export const LogoColumn = styled(CenteredColumn)`
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 1;
    grid-row: 1;
  }
`;

export const GrowthLabInfo = styled.small`
  margin-top: 1rem;
  width: 300px;
  max-width: 100%;
  font-family: ${primaryFont};
  font-size: 0.75rem;

  @media (max-width: 920px) {
    width: 250px;
  }
`;


export const SocialLink = styled.a`
  width: 25px;
  margin: 0 auto 0.9rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const Icon = styled.img`
  max-width: 100%;
`;

export const ExploreNextButton = styled.a<{color: string}>`
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

export const GitHubLink = styled(ExploreNextButton)`
  text-transform: none;
  display: flex;
  align-items: center;
  padding: 0.3rem 0.8rem;
  margin: 0.4rem 0;
`;

export const GitHubIcon = styled.img`
  width: 22px;
  margin-right: 0.5rem;
`;

export const StyledLink = styled.a`
  color: #333;
  text-decoration: none;
  text-transform: uppercase;
  margin-bottom: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

export const LicenseAndReadme = styled.div`
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
  instagram = 'instagram',
  twitter = 'twitter',
  linkedin = 'linkedin',
  youtube = 'youtube',
  applepodcast = 'applepodcast',
}


export const defaultSocialIcons = [
  {
    target: 'https://www.linkedin.com/company/harvard-growth-lab/',
    type: SocialType.linkedin,
    alt: 'linkedin',
  },
  {
    target: 'https://www.instagram.com/harvardgrowthlab/',
    type: SocialType.instagram,
    alt: 'instagram',
  },
  {
    target: 'https://www.facebook.com/harvardgrowthlab/',
    type: SocialType.facebook,
    alt: 'facebook',
  },

  {
    target: 'https://twitter.com/HarvardGrwthLab',
    type: SocialType.twitter,
    alt: 'twitter',
  },
  {
    target: 'https://youtube.com/playlist?list=PLVJQsjaKb-4SNl2obPcBFtIbjKoyi4e5z',
    type: SocialType.youtube,
    alt: 'youtube',
  },
  {
    target: 'https://podcasts.apple.com/us/podcast/growth-lab-podcast-series/id1486218164',
    type: SocialType.applepodcast,
    alt: 'apple podcast',
  },
];

export const socialIcon = {
  facebook: FacebookIconSVG,
  twitter: TwitterIconSVG,
  linkedin: LinkedinIconSVG,
  youtube: YouTubeIconSVG,
  applepodcast: ApplePodcastSVG,
  instagram: InstagramIconSVG
};

interface Props {
  socialItems?: {target: string, type: SocialType, alt?: string}[];
}

const StandardFooter = (props: Props) => {
  const socialItems = props.socialItems === undefined ? defaultSocialIcons : props.socialItems;

  const socialItemsList = socialItems.map(({target, type, alt}) =>{
    return (
      <SocialLink
        href={target}
        onClick={() => triggerGoogleAnalyticsEvent('FOOTER SOCIAL ICONS', 'click -' + type)}
        target='_blank'
        rel='noopener noreferrer'
        key={target + type}
      >
        <Icon
          src={socialIcon[type]}
          title={alt ? alt : ''}
          alt={alt ? alt : ''}
        />
      </SocialLink>
    );
  });

  return (
    <Root>
      <Container>
        <Content>
          <LogoColumn>
            <a
              href='https://growthlab.hks.harvard.edu/'
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
              79 JFK St. | Cambridge, MA 02138<br />
              growthlab@hks.harvard.edu
            </GrowthLabInfo>
          </LogoColumn>
          <RepoColumn>
            <StyledLink href={Routes.Landing + '#' + hubId}>
              Hub
            </StyledLink>
            <StyledLink href={Routes.Community}>
              Community
            </StyledLink>
            <StyledLink href={Routes.About}>
              About
            </StyledLink>
            <StyledLink href={'https://hksexeced.tfaforms.net/f/subscribe?s=a1n6g000000nJnxAAE'}>
              Newsletter
            </StyledLink>
            <StyledLink
              href='https://growthlab.hks.harvard.edu/'
              target='_blank' rel='noopener noreferrer'
            >
              Growth Lab
            </StyledLink>
            <GitHubLink
              href='https://github.com/cid-harvard/growth-lab-app-front-end'
              target='_blank'
              rel='noopener noreferrer'
              color={'#333'}
            >
              <GitHubIcon src={GitHubIconSVG} alt='' title='' />
              GitHub Repo
            </GitHubLink>
          </RepoColumn>
          <SocialColumn>
            {socialItemsList}
          </SocialColumn>
        </Content>
      </Container>
      <LicenseAndReadme>
        <div>
          Harvard Growth Lab’s digital tools are licensed under <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/' target='_blank' rel='noopener noreferrer'>Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)</a>.
        </div>
        <div style={{marginTop: '0.4rem'}}>
          Copyright © {new Date().getFullYear()} The President and Fellows of Harvard College
          {' | '}
          <a href='https://gdpr.harvard.edu/eeaprivacydisclosures' target='_blank' rel='noopener noreferrer'>
            Privacy
          </a>
          {' | '}
          <a href='http://accessibility.harvard.edu/' target='_blank' rel='noopener noreferrer'>
            Accessibility
          </a>
          {' | '}
          <a href='https://accessibility.huit.harvard.edu/digital-accessibility-policy' target='_blank' rel='noopener noreferrer'>
            Digital Accessibility
          </a>
          {' | '}
          <a href='http://www.harvard.edu/reporting-copyright-infringements' target='_blank' rel='noopener noreferrer'>
            Report Copyright
          </a>
        </div>
      </LicenseAndReadme>
    </Root>
  );
};

export default StandardFooter;
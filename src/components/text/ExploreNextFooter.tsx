import React from 'react';
import {
  FullWidthFooterContent,
} from '../../styling/Grid';
import styled from 'styled-components';
import GrowthLabLogoPNG from "../../assets/growth-lab-new-logo-2022.png"
import { rgba } from 'polished';
import {triggerGoogleAnalyticsEvent} from '../../routing/tracking';
import {
  Root,
  Container,
  Content,
  GrowthLabLogo,
  SocialColumn,
  RepoColumn,
  LogoColumn,
  GrowthLabInfo,
  SocialLink,
  Icon,
  ExploreNextButton,
  GitHubLink,
  GitHubIcon,
  LicenseAndReadme,
  SocialType,
  defaultSocialIcons,
  socialIcon,
  StyledLink,
} from './StandardFooter';
import {Routes, hubId} from '../../routing/routes';

const AttributionContainer = styled(Container)`
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAI0lEQVQYV2NkwAEYYeLeeU3GIPbWSXVnQTRhCXQT4TqIlgAACbAIB9ZyaUoAAAAASUVORK5CYII=) repeat;
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

const ExploreNextContainer = styled(FullWidthFooterContent)`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  padding: 1.25rem 1rem;
  white-space: nowrap;
`;

const Arrow = styled.span`
  margin-left: 0.35rem;
  font-family: Arial;
`;

interface Props {
  attributions: string[];
  socialItems?: {target: string, type: SocialType}[];
  exploreNextLinks: {label: string, target: string}[];
  backgroundColor: string;
  title: string;
}

const ExploreNextFooter = (props: Props) => {
  const {
    backgroundColor, attributions, exploreNextLinks, title,
  } = props;

  const gaEventCategory = 'FOOTER: ' + title;

  const socialItems = props.socialItems === undefined ? defaultSocialIcons : props.socialItems;

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
        onClick={() => triggerGoogleAnalyticsEvent(gaEventCategory, 'click-link', label)}
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
              <GitHubIcon src={require('./assets/githubicon.svg')} alt='' title='' />
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

export default ExploreNextFooter;
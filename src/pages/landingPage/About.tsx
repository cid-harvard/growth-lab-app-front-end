import React, {useEffect} from 'react';
import TopLevelNav from './TopLevelNav';
import { scrollToTop } from '../../hooks/useScrollBehavior';
import {
  activeLinkColor,
  HubContentContainer,
  navBackgroundColor,
  backgroundPattern,
  Root,
  ZigZagContentCard,
  ZigZagContent,
  Title,
  Content,
} from './Utils';
import StandardFooter from '../../components/text/StandardFooter';
import Helmet from 'react-helmet';

const metaTitle = 'About | Harvard Growth Lab Viz Hub';

const AboutPage = () => {
  useEffect(() => scrollToTop({smooth: false}), []);

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta property='og:title' content={metaTitle} />
      </Helmet>
      <TopLevelNav
        linkColor={'#fff'}
        activeColor={activeLinkColor}
        showTitle={true}
        backgroundColor={navBackgroundColor}
        backgroundImage={backgroundPattern}
      />
      <HubContentContainer>
        <Root>
          <ZigZagContentCard>
            <ZigZagContent>
              The Viz Hub is a portfolio of award-winning, interactive visualizations powered by Harvard’s Growth Lab research and insights.
            </ZigZagContent>
          </ZigZagContentCard>
          <Title>About</Title>
          <Content>
            Led by <a href='https://growthlab.hks.harvard.edu/people/ricardo-hausmann-0'>Ricardo Hausmann</a>, the <a href='https://growthlab.hks.harvard.edu/'>Growth Lab</a> at Harvard University works to understand the dynamics of growth and to translate those insights into more effective policymaking in developing countries. The Growth Lab places increased economic diversity and complexity at the center of the development story.
          </Content>
          <Content>
            Over the last decade, our portfolio of visualization tools has emerged through the close collaboration between the Growth Lab’s Digital Development &amp; Design team and our research teams.  Our flagship tool, the <a href='https://atlas.hks.harvard.edu/'>Atlas of Economic Complexity</a>, exemplifies this collaboration by beautifully showcasing research, datasets, and pedagogy developed across multidisciplinary teams and countless iterations.  Since its launch in 2013, the Atlas has been complimented by sub-national Atlases, country dashboards, interactive stories, open source software packages, and working prototypes.
          </Content>
          <Content>
            Work found in the Viz Hub has been featured in various media outlets including the <a href='http://www.nytimes.com/interactive/2011/05/15/magazine/art-of-economic-complexity.html'>New York Times</a>, <a href='https://blogs.wsj.com/indiarealtime/2016/01/01/india-will-be-fastest-growing-economy-for-coming-decade-harvard-researchers-predict/'>Wall Street Journal</a>, <a href='https://www.washingtonpost.com/business/germanys-inconvenient-truth-its-too-complicated/2019/10/14/899ffd72-ee50-11e9-bb7e-d2026ee0c199_story.html'>Washington Post</a>, <a href='https://www.bloomberg.com/opinion/articles/2019-10-14/german-economic-downturn-is-symptom-of-deeper-growth-problem'>Bloomberg</a>, <a href='https://www.ft.com/content/0297ff7c-524e-11e8-b3ee-41e0209208ec'>Financial Times</a>, and the <a href='https://news.harvard.edu/gazette/story/newsplus/can-albanias-economic-turnaround-survive-covid-19/'>Harvard Gazette</a>. In 2019 we were the 2nd runner up for the <a href="http://dhawards.org/dhawards2019/results/" target="_blank">Digital Humanities</a> Best Data Visualization Award and were short-listed for an <a href="https://www.informationisbeautifulawards.com/" target="_blank">Information is Beautiful</a> award in 2018 and 2019.  In 2022, <a href="https://metroverse.hks.harvard.edu/" target="_blank">Metroverse</a>, the Growth Lab’s urban economy navigator, won an Information is Beautiful award in the business analytics category.
          </Content>
          <Content>
            <strong>Contact:</strong> To inquire further about our work or to share your ideas, feel free to reach out over <a href='mailto:cidatlas@hks.harvard.edu'>email</a> or find us on <a href='https://github.com/cid-harvard'>Github</a> and <a href='https://twitter.com/HarvardGrwthLab'>Twitter</a>.
          </Content>
          <h2>Team</h2>
          <Content>
            Led by the Growth Lab’s <em>Digital Development &amp; Design Team</em>, Viz Hub projects are the result of interdisciplinary collaboration between Growth Lab researchers, staff, and a rich network of alumni.
          </Content>
          <Content>
            Our core Digital Development &amp; Design Team include:
          </Content>

          <Content>
            <a target="_blank" href='https://growthlab.hks.harvard.edu/people/annie-white'>Annie White</a> Director, Digital Tools<br />
            Annie oversees the strategy and creation of all Viz Hub projects, from research to design, development, and launch. Prior to her work at the Growth Lab, Annie was a Director of Digital Product at Sustainalytics, an ESG research and consulting firm. She is interested in the application of software tools to positively impact economic development, equity, and the public interest.
          </Content>

          <Content>
            <a target="_blank" href='https://bleonard.dev/'>Brendan Leonard</a> Senior Back-End &amp; Data Developer<br />
            Brendan leads the implementation of back-end technologies and data analysis for Viz Hub projects, including management of the cloud-based server and database infrastructure. With a particular interest in the relationship between technology and democratic systems, he holds a master's degree in government studies and a bachelor's in economics.
          </Content>

          <Content>
            <a target="_blank" href='https://www.linkedin.com/in/ellie-jackson-6750b539/'>Ellie Jackson</a> Back-End &amp; Data Developer<br />
            Ellie builds, maintains and optimizes the back-end architecture and infrastructure across the Growth Lab's portfolio of digital tools. She also contributes to the acquisition and analysis of various datasets used across these tools. Ellie has a master's degree in computational analysis and public policy from the University of Chicago's Harris School.
          </Content>

          <Content>
            <a target="_blank" href='http://www.niltuzcu.net/'>Nil Tuzcu</a> Senior UX/UI &amp; Data Visualization Designer<br />
            Nil leads the design vision of Viz Hub projects, encompassing data visualization design, prototype development, and user research.  Previously, Nil worked as a research fellow at MIT's Department of Urban Studies and as a research associate at Harvard Graduate School of Design. She holds a master's degree from Cornell University and was a SPURS Fellow at MIT (2014-2015).
          </Content>

          <Content>
            <a target="_blank" href='https://www.bortfolio.net/'>Robert Christie</a> Front-end Developer<br />
            Robert is responsible for the front-end development of Viz Hub projects. He architects and implements interactive interfaces and visualizations with an emphasis on cartography.
          </Content>

        </Root>
      </HubContentContainer>
      <StandardFooter />
    </>
  );
};

export default AboutPage;
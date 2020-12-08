import styled from 'styled-components/macro';


const gridLines = {
  // Horizontal Grid Lines
  pageTop: 'countryToolsGlobalGridPageTop',
  bannerTop: 'countryToolsGlobalGridBannerTop',
  bannerBottom: 'countryToolsGlobalGridBannerBottom',
  headerTop: 'countryToolsGlobalGridHeaderTop',
  headerBottom: 'countryToolsGlobalGridHeaderBottom',
  mobileMenuTop: 'countryToolsGlobalGridMobileMenuTop',
  mobileMenuBottom: 'countryToolsGlobalGridMobileMenuBottom',
  contentTop: 'countryToolsGlobalGridContentTop',
  contentBottom: 'countryToolsGlobalGridContentBottom',
  footerTop: 'countryToolsGlobalGridFooterTop',
  footerBottom: 'countryToolsGlobalGridFooterBottom',
  pageBottom: 'countryToolsGlobalGridPageBottom',
  // Vertical Grid Lines
  pageLeft: 'countryToolsGlobalGridPageLeft',
  pageMarginLeft: 'countryToolsPageMarginLeft',
  contentStart: 'countryToolsContentStart',
  contentEnd: 'countryToolsContentEnd',
  navStart: 'countryToolsNavStart',
  navEnd: 'countryToolsNavEnd',
  pageMarginRight: 'countryToolsPageMarginLeft',
  pageRight: 'countryToolsGlobalGridPageRight',
};

export const gridSmallMediaWidth = 700; // in px

const contentMaxWidth = 900; // in px
const navMaxWidth = 180; // in px


export const Root = styled.div`
  display: grid;
  min-height: 100vh;
  grid-template-rows:
    [${gridLines.pageTop} ${gridLines.bannerTop}] auto
    [${gridLines.bannerBottom} ${gridLines.headerTop}] auto
    [${gridLines.headerBottom} ${gridLines.mobileMenuTop}] auto
    [${gridLines.mobileMenuBottom} ${gridLines.contentTop}] 1fr
    [${gridLines.contentBottom} ${gridLines.footerTop}] auto
    [${gridLines.footerBottom} ${gridLines.pageBottom}];

  grid-template-columns:
    [${gridLines.pageLeft} ${gridLines.pageMarginLeft}] minmax(1rem, 1fr)
    [${gridLines.contentStart}] minmax(auto, ${contentMaxWidth}px)
    [${gridLines.contentEnd} ${gridLines.navStart}]  minmax(auto, ${navMaxWidth}px)
    [${gridLines.navEnd} ${gridLines.pageMarginRight}] minmax(1rem, 1fr)
    [${gridLines.pageRight}];
`;

export const FullWidthHeader = styled.header`
  grid-row: ${gridLines.headerTop} / ${gridLines.headerBottom};
  grid-column: ${gridLines.pageLeft} / ${gridLines.pageRight};
`;
export const FullWidthHeaderContent = styled.div`
  max-width: ${contentMaxWidth + navMaxWidth}px;
  margin: 0 auto;
`;

export const Header = styled.header`
  grid-row: ${gridLines.headerTop} / ${gridLines.headerBottom};
  grid-column: ${gridLines.contentStart} / ${gridLines.navEnd};
`;

export const Content = styled.main`
  grid-row: ${gridLines.contentTop} / ${gridLines.contentBottom};
  grid-column: ${gridLines.contentStart} / ${gridLines.contentEnd};

  @media (max-width: ${gridSmallMediaWidth}px) {
    grid-column: ${gridLines.contentStart} / ${gridLines.navEnd};
  }
`;

export const ContentFull = styled.main`
  grid-row: ${gridLines.contentTop} / ${gridLines.contentBottom};
  grid-column: ${gridLines.contentStart} / ${gridLines.navEnd};
`;

export const FullWidthContent = styled.main`
  grid-row: ${gridLines.contentTop} / ${gridLines.contentBottom};
  grid-column: ${gridLines.pageLeft} / ${gridLines.pageRight};
`;

export const FullWidthContentContainer = styled.div`
  max-width: ${contentMaxWidth + navMaxWidth}px;
  margin: 0 auto;
`;

export const NavContainer = styled.nav`
  grid-row: ${gridLines.contentTop} / ${gridLines.contentBottom};
  grid-column: ${gridLines.navStart} / ${gridLines.navEnd};
  position: relative;
  z-index: 200;

  @media (max-width: ${gridSmallMediaWidth}px) {
    grid-row: ${gridLines.mobileMenuTop} / ${gridLines.mobileMenuBottom};
    grid-column: ${gridLines.pageLeft} / ${gridLines.pageRight};
    position: sticky;
    top: 0;
  }
`;

export const FullWidthFooter = styled.footer`
  grid-row: ${gridLines.footerTop} / ${gridLines.footerBottom};
  grid-column: ${gridLines.pageLeft} / ${gridLines.pageRight};
`;
export const FullWidthFooterContent = styled.footer`
  max-width: ${contentMaxWidth + navMaxWidth}px;
  margin: 0 auto;
`;

export const storyMobileWidth = 700; // in px

export const StoriesGrid = styled(FullWidthContentContainer)`
  display: grid;
  grid-template-columns: 8fr 5fr;
  column-gap: 2rem;
  position: relative;

  @media (max-width: ${storyMobileWidth}px) {
    grid-template-columns: 1fr;
  }
`;

export const BestOfGrid = styled(FullWidthContentContainer)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 2rem;
  position: relative;

  @media (max-width: ${storyMobileWidth}px) {
    grid-template-columns: 1fr;
  }
`;

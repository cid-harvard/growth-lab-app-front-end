import styled from 'styled-components';


const gridLines = {
  // Horizontal Grid Lines
  pageTop: 'countryToolsGlobalGridPageTop',
  bannerTop: 'countryToolsGlobalGridBannerTop',
  bannerBottom: 'countryToolsGlobalGridBannerBottom',
  headerTop: 'countryToolsGlobalGridHeaderTop',
  headerBottom: 'countryToolsGlobalGridHeaderBottom',
  contentTop: 'countryToolsGlobalGridContentTop',
  contentHeaderTop: 'countryToolsGlobalGridContentHeaderTop',
  contentHeaderBottom: 'countryToolsGlobalGridContentHeaderBottom',
  contentBottom: 'countryToolsGlobalGridContentBottom',
  footerTop: 'countryToolsGlobalGridFooterTop',
  footerbottom: 'countryToolsGlobalGridFooterbottom',
  pageBottom: 'countryToolsGlobalGridPageBottom',
  // Vertical Grid Lines
  pageLeft: 'countryToolsGlobalGridPageLeft',
  column1: 'countryToolsGlobalGridColumn1',
  column2: 'countryToolsGlobalGridColumn2',
  column3: 'countryToolsGlobalGridColumn3',
  column4: 'countryToolsGlobalGridColumn4',
  column5: 'countryToolsGlobalGridColumn5',
  column6: 'countryToolsGlobalGridColumn6',
  column7: 'countryToolsGlobalGridColumn7',
  column8: 'countryToolsGlobalGridColumn8',
  column9: 'countryToolsGlobalGridColumn9',
  column10: 'countryToolsGlobalGridColumn10',
  pageRight: 'countryToolsGlobalGridPageRight',
};

export const Root = styled.div`
  display: grid;
  grid-template-rows:
    [${gridLines.pageTop} ${gridLines.bannerTop}] auto
    [${gridLines.bannerBottom} ${gridLines.headerTop}] auto
    [${gridLines.headerBottom} ${gridLines.contentHeaderTop}] auto
    [${gridLines.contentHeaderBottom} ${gridLines.contentTop}] auto
    [${gridLines.contentBottom} ${gridLines.footerTop}] auto
    [${gridLines.footerbottom} ${gridLines.pageBottom}];

  grid-template-columns:
    [${gridLines.pageLeft} ${gridLines.column1}] 1fr
    [${gridLines.column2}] 1fr
    [${gridLines.column3}] 1fr
    [${gridLines.column4}] 1fr
    [${gridLines.column5}] 1fr
    [${gridLines.column6}] 1fr
    [${gridLines.column7}] 1fr
    [${gridLines.column8}] 1fr
    [${gridLines.column9}] 1fr
    [${gridLines.column10}] 1fr
    [${gridLines.pageRight}];
`;


import styled from 'styled-components';

export const baseColor = '#333333'; // dark gray/black color for text
export const lightBaseColor = '#7c7c7c'; // light gray color for subtitles and contextual information
export const lightBorderColor = '#dcdcdc'; // really light gray color for subtle borders between elements

export const primaryFont = "'Source Sans Pro', sans-serif";
export const secondaryFont = "'PT Mono', monospace";

export const semiBoldFontBoldWeight = 600;
export const boldFontWeight = 700;

export const StandardH1 = styled.h1`
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 2.2rem;
  font-weight: 400;
`;

export const Label = styled.label`
  font-family: ${secondaryFont};
  text-transform: uppercase;
  margin-bottom: 0.3rem;
  display: block;
`;

export const TwoColumnSection = styled.div`
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 850px) {
    grid-template-columns: auto;
    grid-template-rows: auto auto auto;
  }
`;

export const SectionHeader = styled.h3`
  grid-row: 1;
  grid-column: 1 / -1;
  font-family: ${secondaryFont};
  text-transform: uppercase;
  color: ${baseColor};
  font-size: 1.4rem;
  letter-spacing: 1px;
  display: flex;
  align-items: center;

  &:after {
    content: '';
    display: block;
    height: 0;
    border-top: 2px solid ${lightBorderColor};
    flex-grow: 1;
    margin-left: 1.25rem;
  }
`;

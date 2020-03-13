import { createGlobalStyle } from 'styled-components/macro';
import {
  baseColor,
  lightBaseColor,
  semiBoldFontBoldWeight,
  primaryFont,
} from './styleUtils';

const GlobalStyles = createGlobalStyle`
  @media(max-width: 600px) {
    html {
      font-size: 14px;
    }
  }
  @media(max-width: 450px) {
    html {
      font-size: 12px;
    }
  }

  body {
    font-family: ${primaryFont};
    color: ${baseColor};
    margin: 0;
    padding: 0;
  }

  h1 {
    font-weight: ${semiBoldFontBoldWeight};
    font-size: 1.7rem;
  }

  h3 {
    font-weight: ${semiBoldFontBoldWeight};
    font-size: 1.1rem;
    color: ${lightBaseColor};
  }

  p {
    line-height: 1.5;
    margin: 0 0 1rem;
  }

  button {
    cursor: pointer;
    border: none;
    width: auto;
    text-align: inherit;
    overflow: visible;

    /* Normalize 'line-height'. Cannot be changed from 'normal' in Firefox 4+. */
    line-height: normal;

    /* Corrects font smoothing for webkit */
    -webkit-font-smoothing: inherit;
    -moz-osx-font-smoothing: inherit;

    /* Corrects inability to style clickable 'input' types in iOS */
    -webkit-appearance: none;

    /* Remove excess padding and border in Firefox 4+ */
    &::-moz-focus-inner {
        border: 0;
        padding: 0;
    }
  }

  ol {
    padding-left: 1rem;

    li {
      margin-bottom: 0.6rem;
      font-size: 0.9rem;
    }
  }
`;

export default GlobalStyles;

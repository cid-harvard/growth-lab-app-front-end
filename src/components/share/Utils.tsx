import {
    secondaryFont,
    baseColor,
} from '../../styling/styleUtils';
import styled from 'styled-components';

export const breakPointValues = {
    width: {
        medium: 1100,
        mediumSmall: 900,
        small: 800,
    },
    height: {
        medium: 768,
        mediumSmall: 550,
        small: 500,
    },
};


const smallBreakpoint = 550; // in px
export const mediumSmallBreakpoint = 1050; // in px
export const columnsToRowsBreakpoint = breakPointValues.width.small; // in px


export const UtilityBarButtonBase = styled.button`
border: none;
margin: 0 0.25rem;
padding: 0 0.35rem;
color: ${baseColor};
background-color: transparent;
font-size: 0.875rem;
font-family: ${secondaryFont};
text-transform: uppercase;
display: flex;
align-items: center;
outline: 0 solid rgba(255, 255, 255, 0);
transition: outline 0.1s ease;
flex-shrink: 1;

&:hover, &:focus {
    background-color: #fff;
    outline: 0.25rem solid #fff;
    color: ${baseColor};
}

@media (max-width: ${mediumSmallBreakpoint}px) {
    flex-direction: column;
}

@media (max-width: ${columnsToRowsBreakpoint}px) {
    flex-direction: row;
}

@media (max-width: ${smallBreakpoint}px) {
    flex-direction: column;
}
`;

export const SvgBase = styled.span`
display: inline-block;
width: 1rem;
height: 1rem;
margin-right: 0.3rem;

svg {
    width: 100%;
    height: 100%;

    path {
    fill: ${baseColor};
    }
}

@media (max-width: ${mediumSmallBreakpoint}px) {
    margin-right: 0;
    margin-bottom: 0.2rem;
}

@media (max-width: ${columnsToRowsBreakpoint}px) {
    margin-right: 0.3rem;
    margin-bottom: 0;
}

@media (max-width: ${smallBreakpoint}px) {
    margin-right: 0;
    margin-bottom: 0.2rem;
}
`;

export const Text = styled.span`
width: min-content;

@media (max-width: 1100px) {
    max-width: 55px;
}

@media (max-width: ${mediumSmallBreakpoint}px) and (min-width: ${columnsToRowsBreakpoint + 1}px) {
    display: none;
}

@media (max-width: ${columnsToRowsBreakpoint }px) {
    text-align: center;
}
`;


export const TooltipContent = styled.div`
    font-family: ${secondaryFont};
    letter-spacing: -0.3px;
    text-transform: uppercase;
    font-size: 0.6rem;
`;

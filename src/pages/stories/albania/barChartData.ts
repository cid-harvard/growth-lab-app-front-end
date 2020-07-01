import {storyMobileWidth} from '../../../styling/Grid';

export default {
  main_constraint: {
    balkans_average_line: 1.93333,
    umic_average_line: 6.911765,
    data: [
        {
            x: window.innerWidth > storyMobileWidth ? '2007' : '\'07',
            y: 27.7,
            tooltipContent: '2007: 27.7%',
            tooltipContentOnly: true,
            fill: '#d53b45',
        },
        {
            x: window.innerWidth > storyMobileWidth ? '2013' : '\'13',
            y: 14.2,
            tooltipContent: '2013: 14.2%',
            tooltipContentOnly: true,
            fill: '#f0876d',
        },
        {
            x: window.innerWidth > storyMobileWidth ? '2019' : '\'19',
            y: 8,
            tooltipContent: '2019: 8%',
            tooltipContentOnly: true,
            fill: '#fac6b9',
        },
    ],
  },
  outages_month: {
    balkans_average_line: 0.75555556,
    umic_average_line: 4.697941,
    data: [
        {
            x: window.innerWidth > storyMobileWidth ? '2007' : '\'07',
            y: 33.9,
            tooltipContent: '2007: 33.9',
            tooltipContentOnly: true,
            fill: '#d53b45',
        },
        {
            x: window.innerWidth > storyMobileWidth ? '2013' : '\'13',
            y: 4.2,
            tooltipContent: '2013: 4.2',
            tooltipContentOnly: true,
            fill: '#f0876d',
        },
        {
            x: window.innerWidth > storyMobileWidth ? '2019' : '\'19',
            y: 1.5,
            tooltipContent: '2019: 1.5',
            tooltipContentOnly: true,
            fill: '#fac6b9',
        },
    ],
  },
  average_losses: {
    balkans_average_line: 0.955556,
    umic_average_line: 4.2731913,
    data: [
        {
            x: window.innerWidth > storyMobileWidth ? '2007' : '\'07',
            y: 13.7,
            tooltipContent: '2007: 13.7%',
            tooltipContentOnly: true,
            fill: '#d53b45',
        },
        {
            x: window.innerWidth > storyMobileWidth ? '2013' : '\'13',
            y: 5.7,
            tooltipContent: '2013: 5.7%',
            tooltipContentOnly: true,
            fill: '#f0876d',
        },
        {
            x: window.innerWidth > storyMobileWidth ? '2019' : '\'19',
            y: 1.9,
            tooltipContent: '2019: 1.9%',
            tooltipContentOnly: true,
            fill: '#fac6b9',
        },
    ],
  },
};
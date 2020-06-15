import {Datum, AnimationDirection, LabelAnchor, LabelPosition} from '../../../components/dataViz/lineChart';

interface Input {
  section: number | null;
  prevSection: number | null;
}

const albaniaData2010_2013 = [
  {x: 2010, y: 4},
  {x: 2011, y: 3.5},
  {x: 2012, y: 2},
  {x: 2013, y: 0.75},
];
const albaniaData2014_2018 = [
  {x: 2014, y: 0.9},
  {x: 2015, y: 1.4},
  {x: 2016, y: 2.1},
  {x: 2017, y: 2.3},
  {x: 2018, y: 3.7},
];
const euData2010_2018 = [
  {x: 2010, y: 2},
  {x: 2011, y: 2},
  {x: 2012, y: 0.5},
  {x: 2013, y: 0.3},
  {x: 2014, y: 0.5},
  {x: 2015, y: 1},
  {x: 2016, y: 0.9},
  {x: 2017, y: 1.75},
  {x: 2018, y: 0.98},
];

const lfpRateData = [
  {x: 2014, y: 62},
  {x: 2015, y: 64},
  {x: 2016, y: 65},
  {x: 2017, y: 67},
  {x: 2018, y: 69},
  {x: 2019, y: 70},
];

const employRateData = [
  {x: 2014, y: 52},
  {x: 2015, y: 53},
  {x: 2016, y: 55},
  {x: 2017, y: 58},
  {x: 2018, y: 60},
  {x: 2019, y: 62},
];

const unemployRateData = [
  {x: 2014, y: 19},
  {x: 2015, y: 19},
  {x: 2016, y: 18},
  {x: 2017, y: 15},
  {x: 2018, y: 12},
  {x: 2019, y: 10},
];


interface MinMaxAxis {
  minY: number;
  maxY: number;
  minX: number;
  maxX: number;
}

const gdpPerCapitaAxisValues: MinMaxAxis = {
  minY: -5,
  maxY: 8,
  minX: 2010,
  maxX: 2019,
};
const employmentAxisValues: MinMaxAxis = {
  minY: 0,
  maxY: 100,
  minX: 2014,
  maxX: 2020,
};

interface AnimateAxis {
  animationDuration: number;
  startMinX: number;
  startMaxX: number;
  startMinY: number;
  startMaxY: number;
}

export default ({section, prevSection}: Input) => {
  let lineChartData: Datum[] = [];
  let minMaxAxis: MinMaxAxis = gdpPerCapitaAxisValues;
  let animateAxis: AnimateAxis | undefined;
  let leftAxis: string = 'Year on Year Percent Change in GDP per capita';
  let direction: AnimationDirection;
  if (section === null && prevSection !== null) {
    direction = AnimationDirection.Backward;
  } else if (section !== null && prevSection === null) {
    direction = AnimationDirection.Forward;
  } else if (section === null && prevSection === null) {
    direction = AnimationDirection.Forward;
  } else if (section !== null && prevSection !== null &&
             section - prevSection < 0) {
    direction = AnimationDirection.Backward;
  } else {
    direction = AnimationDirection.Forward;
  }
  if (section === null && prevSection !== null) {
    lineChartData = [
      {
        coords: [...albaniaData2010_2013],
        animationDuration: 300,
        color: 'red',
        animationDirection: AnimationDirection.Backward,
      },
    ];
  } else if (section === 0) {
    if (direction === AnimationDirection.Forward) {
      lineChartData = [
        {
          coords: [...albaniaData2010_2013],
          animationDuration: 300,
          label: 'Albania, 2013',
          color: 'red',
          labelColor: 'purple',
          showLabelLine: true,
          width: 3,
        },
      ];
    } else {
      lineChartData = [
        {
          coords: [...albaniaData2010_2013, ...albaniaData2014_2018],
          animationDuration: 400,
          label: 'Albania, 2013',
          color: 'red',
          labelColor: 'purple',
          showLabelLine: true,
          width: 3,
          animationDirection: direction,
          animationStartIndex: 3,
          labelDataIndex: 3,
        },
      ];
    }
  } else if (section === 1) {
    if (direction === AnimationDirection.Forward) {
      lineChartData = [
        {
          coords: [...albaniaData2010_2013, ...albaniaData2014_2018],
          animationDuration: 400,
          label: 'Albania, 2018',
          color: 'red',
          labelColor: 'purple',
          showLabelLine: true,
          animationStartIndex: 3,
          width: 3,
        },
      ];
    } else {
      lineChartData = [
        {
          coords: [...albaniaData2010_2013, ...albaniaData2014_2018],
          label: 'Albania, 2018',
          color: 'red',
          labelColor: 'purple',
          width: 3,
        }, {
          coords: [...euData2010_2018],
          animationDuration: 600,
          color: 'blue',
          width: 3,
          animationDirection: direction,
        },
      ];
    }
  } else if (section === 2) {
    if (direction === AnimationDirection.Forward) {
      lineChartData = [
        {
          coords: [...albaniaData2010_2013, ...albaniaData2014_2018],
          label: 'Albania, 2018',
          color: 'red',
          labelColor: 'purple',
          width: 3,
        }, {
          coords: [...euData2010_2018],
          animationDuration: 600,
          label: 'European Union',
          color: 'blue',
          labelColor: 'purple',
          width: 3,
          labelAnchor: LabelAnchor.Middle,
          labelPosition: LabelPosition.Bottom,
        },
      ];
    } else {
      lineChartData = [
        {
          coords: [...albaniaData2010_2013, ...albaniaData2014_2018],
          label: 'Albania, 2018',
          color: 'red',
          labelColor: 'purple',
          animationDuration: 600,
          width: 3,
        }, {
          coords: [...euData2010_2018],
          animationDuration: 600,
          label: 'European Union',
          color: 'blue',
          labelColor: 'purple',
          width: 3,
          labelAnchor: LabelAnchor.Middle,
          labelPosition: LabelPosition.Bottom,
        },
      ];
      animateAxis = {
        startMinX: employmentAxisValues.minX,
        startMaxX: employmentAxisValues.maxX,
        startMinY: employmentAxisValues.minY,
        startMaxY: employmentAxisValues.maxY,
        animationDuration: 600,
      };
    }
  } else if (section === 3) {
    minMaxAxis = {...employmentAxisValues};
    leftAxis = '';
    lineChartData = [
      {
        coords: [...lfpRateData],
        animationDuration: 600,
        label: 'LFP Rate',
        color: 'yellow',
        width: 3,
      }, {
        coords: [...employRateData],
        animationDuration: 600,
        label: 'Employment Rate',
        color: 'blue',
        width: 3,
      }, {
        coords: [...unemployRateData],
        animationDuration: 600,
        label: 'Unemployment Rate',
        color: 'red',
        width: 3,
      },
    ];
    animateAxis = {
      startMinX: gdpPerCapitaAxisValues.minX,
      startMaxX: gdpPerCapitaAxisValues.maxX,
      startMinY: gdpPerCapitaAxisValues.minY,
      startMaxY: gdpPerCapitaAxisValues.maxY,
      animationDuration: 600,
    };
  }
  return {lineChartData, ...minMaxAxis, leftAxis, animateAxis};
};
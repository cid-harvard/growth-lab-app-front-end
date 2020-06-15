import {Datum, AnimationDirection, LabelAnchor, LabelPosition} from '../../../components/dataViz/lineChart';

interface Input {
  section: number | null;
  prevSection: number | null;
}

const gdpData = {
  axisValues: {
    minY: -5,
    maxY: 8,
    minX: 2010,
    maxX: 2019,
  },
  albaniaData2010_2013: [
    {x: 2010, y: 4},
    {x: 2011, y: 3.5},
    {x: 2012, y: 2},
    {x: 2013, y: 0.75},
  ],
  albaniaData2014_2018: [
    {x: 2014, y: 0.9},
    {x: 2015, y: 1.4},
    {x: 2016, y: 2.1},
    {x: 2017, y: 2.3},
    {x: 2018, y: 3.7},
  ],
  euData2010_2018: [
    {x: 2010, y: 2},
    {x: 2011, y: 2},
    {x: 2012, y: 0.5},
    {x: 2013, y: 0.3},
    {x: 2014, y: 0.5},
    {x: 2015, y: 1},
    {x: 2016, y: 0.9},
    {x: 2017, y: 1.75},
    {x: 2018, y: 0.98},
  ],
};

const laborForceData = {
  axisValues: {
    minY: 0,
    maxY: 100,
    minX: 2014,
    maxX: 2020,
  },
  lfpRateData: [
    {x: 2014, y: 62},
    {x: 2015, y: 64},
    {x: 2016, y: 65},
    {x: 2017, y: 67},
    {x: 2018, y: 69},
    {x: 2019, y: 70},
  ],
  employRateData: [
    {x: 2014, y: 52},
    {x: 2015, y: 53},
    {x: 2016, y: 55},
    {x: 2017, y: 58},
    {x: 2018, y: 60},
    {x: 2019, y: 62},
  ],
  unemployRateData: [
    {x: 2014, y: 19},
    {x: 2015, y: 19},
    {x: 2016, y: 18},
    {x: 2017, y: 15},
    {x: 2018, y: 12},
    {x: 2019, y: 10},
  ],
};

const unemploymentData = {
  axisValues: {
    minY: 0,
    maxY: 50,
    minX: 2014,
    maxX: 2020,
  },
  group1Data: [
    {x: 2014, y: 48},
    {x: 2015, y: 40},
    {x: 2016, y: 42},
    {x: 2017, y: 38},
    {x: 2018, y: 34},
    {x: 2019, y: 30},
  ],
  group2Data: [
    {x: 2014, y: 35},
    {x: 2015, y: 42},
    {x: 2016, y: 33},
    {x: 2017, y: 32},
    {x: 2018, y: 31},
    {x: 2019, y: 30},
  ],
  group3Data: [
    {x: 2014, y: 16},
    {x: 2015, y: 15},
    {x: 2016, y: 14},
    {x: 2017, y: 13},
    {x: 2018, y: 12},
    {x: 2019, y: 12},
  ],
  group4Data: [
    {x: 2014, y: 16},
    {x: 2015, y: 17},
    {x: 2016, y: 15},
    {x: 2017, y: 14},
    {x: 2018, y: 13},
    {x: 2019, y: 12},
  ],
  group5Data: [
    {x: 2014, y: 12},
    {x: 2015, y: 11},
    {x: 2016, y: 11.5},
    {x: 2017, y: 11},
    {x: 2018, y: 10},
    {x: 2019, y: 10},
  ],
  group6Data: [
    {x: 2014, y: 8},
    {x: 2015, y: 10},
    {x: 2016, y: 7.5},
    {x: 2017, y: 8},
    {x: 2018, y: 8},
    {x: 2019, y: 9},
  ],
};

interface MinMaxAxis {
  minY: number;
  maxY: number;
  minX: number;
  maxX: number;
}

interface AnimateAxis {
  animationDuration: number;
  startMinX: number;
  startMaxX: number;
  startMinY: number;
  startMaxY: number;
}

export default ({section, prevSection}: Input) => {
  let lineChartData: Datum[] = [];
  let minMaxAxis: MinMaxAxis = gdpData.axisValues;
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
        coords: [...gdpData.albaniaData2010_2013],
        animationDuration: 300,
        color: 'red',
        animationDirection: AnimationDirection.Backward,
      },
    ];
  } else if (section === 0) {
    if (direction === AnimationDirection.Forward) {
      lineChartData = [
        {
          coords: [...gdpData.albaniaData2010_2013],
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
          coords: [...gdpData.albaniaData2010_2013, ...gdpData.albaniaData2014_2018],
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
          coords: [...gdpData.albaniaData2010_2013, ...gdpData.albaniaData2014_2018],
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
          coords: [...gdpData.albaniaData2010_2013, ...gdpData.albaniaData2014_2018],
          label: 'Albania, 2018',
          color: 'red',
          labelColor: 'purple',
          width: 3,
        }, {
          coords: [...gdpData.euData2010_2018],
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
          coords: [...gdpData.albaniaData2010_2013, ...gdpData.albaniaData2014_2018],
          label: 'Albania, 2018',
          color: 'red',
          labelColor: 'purple',
          width: 3,
        }, {
          coords: [...gdpData.euData2010_2018],
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
          coords: [...gdpData.albaniaData2010_2013, ...gdpData.albaniaData2014_2018],
          label: 'Albania, 2018',
          color: 'red',
          labelColor: 'purple',
          animationDuration: 600,
          width: 3,
        }, {
          coords: [...gdpData.euData2010_2018],
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
        startMinX: laborForceData.axisValues.minX,
        startMaxX: laborForceData.axisValues.maxX,
        startMinY: laborForceData.axisValues.minY,
        startMaxY: laborForceData.axisValues.maxY,
        animationDuration: 600,
      };
    }
  } else if (section === 3) {
    minMaxAxis = {...laborForceData.axisValues};
    leftAxis = '';
    lineChartData = [
      {
        coords: [...laborForceData.lfpRateData],
        animationDuration: 600,
        label: 'LFP Rate',
        color: 'yellow',
        width: 3,
      }, {
        coords: [...laborForceData.employRateData],
        animationDuration: 600,
        label: 'Employment Rate',
        color: 'blue',
        width: 3,
      }, {
        coords: [...laborForceData.unemployRateData],
        animationDuration: 600,
        label: 'Unemployment Rate',
        color: 'red',
        width: 3,
      },
    ];
    if (direction === AnimationDirection.Forward) {
      animateAxis = {
        startMinX: gdpData.axisValues.minX,
        startMaxX: gdpData.axisValues.maxX,
        startMinY: gdpData.axisValues.minY,
        startMaxY: gdpData.axisValues.maxY,
        animationDuration: 600,
      };
    } else {
      animateAxis = {
        startMinX: unemploymentData.axisValues.minX,
        startMaxX: unemploymentData.axisValues.maxX,
        startMinY: unemploymentData.axisValues.minY,
        startMaxY: unemploymentData.axisValues.maxY,
        animationDuration: 600,
      };
    }
  } else if (section && section > 3) {
    const animate = section === 4 && direction === AnimationDirection.Forward ? true : false;
    minMaxAxis = {...unemploymentData.axisValues};
    leftAxis = '';
    lineChartData = [
      {
        coords: [...unemploymentData.group1Data],
        animationDuration: 600,
        label: 'Group 1',
        color: 'purple',
        width: 3,
      },{
        coords: [...unemploymentData.group2Data],
        animationDuration: 600,
        label: 'Group 2',
        color: 'teal',
        width: 3,
      },{
        coords: [...unemploymentData.group3Data],
        animationDuration: 600,
        label: 'Group 3',
        color: 'green',
        width: 3,
      },{
        coords: [...unemploymentData.group4Data],
        animationDuration: 600,
        label: 'Group 4',
        color: 'salmon',
        width: 3,
      },{
        coords: [...unemploymentData.group5Data],
        animationDuration: 600,
        label: 'Group 5',
        color: 'majenta',
        width: 3,
      },{
        coords: [...unemploymentData.group6Data],
        animationDuration: 600,
        label: 'Group 6',
        color: 'yellow',
        width: 3,
      },
    ];
    animateAxis = animate ? {
      startMinX: laborForceData.axisValues.minX,
      startMaxX: laborForceData.axisValues.maxX,
      startMinY: laborForceData.axisValues.minY,
      startMaxY: laborForceData.axisValues.maxY,
      animationDuration: 600,
    } : undefined;
  }
  return {lineChartData, ...minMaxAxis, leftAxis, animateAxis};
};
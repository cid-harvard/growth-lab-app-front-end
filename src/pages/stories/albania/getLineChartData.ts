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

export default ({section, prevSection}: Input) => {
  let lineChartDatum: Datum[] = [];
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
    lineChartDatum = [
      {
        coords: [...albaniaData2010_2013],
        animationDuration: 300,
        color: 'red',
        animationDirection: AnimationDirection.Backward,
      },
    ];
  } else if (section === 0) {
    if (direction === AnimationDirection.Forward) {
      lineChartDatum = [
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
      lineChartDatum = [
        {
          coords: [...albaniaData2010_2013, ...albaniaData2014_2018],
          animationDuration: 400,
          label: 'Albania, 2013',
          color: 'red',
          labelColor: 'purple',
          showLabelLine: true,
          width: 3,
          animationDirection: direction,
          labelDataIndex: 3,
        },
      ];
    }
  } else if (section === 1) {
    if (direction === AnimationDirection.Forward) {
      lineChartDatum = [
        {
          coords: [...albaniaData2010_2013, ...albaniaData2014_2018],
          animationDuration: 400,
          label: 'Albania, 2018',
          color: 'red',
          labelColor: 'purple',
          showLabelLine: true,
          width: 3,
        },
      ];
    } else {
      lineChartDatum = [
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
    lineChartDatum = [
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
  }
  return lineChartDatum;
};
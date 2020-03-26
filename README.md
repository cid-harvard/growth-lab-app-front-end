## Country Dashboards by the Growth Lab at Harvard's Center for International Development

Country Dashboards provides a framework for quickly building custom data visualization tools.

View the site live at https://cid-harvard.github.io/country-tools-front-end/

## Table of Contents
  - [Getting Started](#gettingstarted)
  - [Building a Page](#buildingapage)
  - [Grid Layout and Style Utilities](#styleutilites)
  - [Components](#components)
    - [DataViz](#datavizcomponent)
    - [LegendList](#legendlistcomponent)
    - [ColorScaleLegend](#colorlegendcomponent)
    - [Loading](#loadingcomponent)
  - [Custom Hooks](#customhooks)
  - [Guidelines For Creating New Components](#componentguidelines)

<a name="gettingstarted"/>

## Getting started

Once this repo has been cloned, navigate to the directory via command line and run

`npm install`

This will install all of your dependencies. You can now run the project locally with

`npm start`

You should now be able to see the project running at localhost:3000

As you work on projects on this repo, make sure to run 

`npm run lint:fix`

before pushing any code to make sure it keeps consistent standards.

<a name="buildingapage"/>

## Building a Page

All of the pages along with their uniquely associated content and functions should be housed in the `src/pages` directory.

1. The first step is to create a new directory for the new page. For example, to create a new folder for a page called "Your Data Viz Dashboard", it should look similar to this:
  
   `src/pages/yourNewDataVizDashboard`

2. Next create an `index.tsx` file within the new directory and set it up with a minimal structure:

   ```tsx
    import React from 'react';

    const YourNewDataVizDashboard = () => {
      return (<div>Hello World</div>);
    }

    export default YourNewDataVizDashboard;
   ```

3. Now that you have a basic skeleton page ready, navigate to `src/routing/routes.ts` and add a new route for your page, like so:

   ```tsx
    export enum Routes {
      Landing = '/',
      /* Add your new route at the end of the list of existing routes */
      YourNewDataVizDashboard = '/your-new-data-viz-dashboard',
    }
   ```
4. Once you have the route defined, you will want to add it to `src/App.tsx`. There are two locations within `App.tsx` that will have to be updated. The first is near the top, where you will have to import it with `lazy` the way the other pages are being imported:

   ```tsx
    const LandingPage = lazy(() => import('./pages/landingPage'));
    /* import your new page at the end of the list of lazy imports */
    const YourNewDataVizDashboard = lazy(() => import('./pages/yourNewDataVizDashboard'));
   ```

   Then near the bottom of the page in the `return` statement and within the `Switch` component, you will have to add a `Route` component for your page:

   ```tsx
    <Switch>
      <Route exact path={Routes.Landing}
        render={(props: any) => <LandingPage {...props} />}
      />
      {/* Your page should go at the end of the other routes but before the 404 page */}
      <Route exact path={Routes.YourNewDataVizDashboard}
        render={(props: any) => <YourNewDataVizDashboard {...props} />}
      />
      {/* If none of the above routes are found show the 404 page */}
      <Route component={PageNotFound} />
    </Switch>
   ```

5. With that, your new page should now be running and visible at the route you specified. To build out the page further, use the style utilities and components specified below. You can also create new components, but make sure to follow our [Guidelines For Creating New Components](#componentguidelines).

<a name="styleutilites"/>

## Grid Layout and Style Utilities

The Grid Layout and style utilities provide the basic building blocks for a page. All of the exports for building a page's Grid can be found in `src/styling/Grid.ts` and all of the style utility exports can be found in `src/styling/styleUtils.ts`.

The `Root` grid element is automatically rendered in the `App` component, so your page should be wrapped with a `<React.Fragment>`. Many of the prebuilt components may already flow correctly within the root grid, so be sure to check their documentation before wrapping them in a container.

Style utilities exports everything from global variables like colors and fonts, to simpler components like headings or basic cards. View `src/styling/styleUtils.ts` for all of the available utilities.


<a name="components"/>

## Components

Components are more complete and complex pieces that can be used to build out a page. They include data visualizations, headers, search components, and more. If you add a new component or modify an existing one, please update the documentation.

<a name="datavizcomponent"/>

#### <DataViz />

The data viz component, located at `src/components/dataViz` is the catch-all for any data visualizations. Below are the different props the DataViz component can take in.

- **id**: string

   A unique id for visualization.

- **jsonToDownload** *(optional)*: object[]

   An array of objects. Each object in the array should be the same shape. If this is provided it will show the "Download Data" button under the visualization and allow the user to download the data in CSV format.

- **enablePNGDownload** *(optional)*: boolean
  
   Set this to `true` to enable the "Download PNG" button and functionality.

- **enableSVGDownload** *(optional)*: boolean

   Set this to `true` to enable the "Download SVG" button and functionality.

- **chartTitle** *(optional)*: string

   The optional chart title is used only if one of the above download features is enabled. The chart title replaces the generic text used for the file name if the user downloads an image or csv.

- **vizType**: VizType

   VizType is an enum also exported from `src/components/dataViz`. Depending on the type, there are a number of additional props required, shown below. It can be of the following types -

   ```tsx
   enum VizType {
      ScatterPlot = 'ScatterPlot',
      BarChart = 'BarChart',
      RadarChart = 'RadarChart',
      GeoMap = 'GeoMap',
    }
   ```
   - **VizType.ScatterPlot**

      **data**: ScatterPlotDatum[];

         ScatterPlotDatum takes the following values:

         - label: string;
         - x: number;
         - y: number;
         - fill *(optional)*: string;
         - radius*(optional)*: number;
         - tooltipContent *(optional)*: string;
         - highlighted *(optional)*: boolean;

      **axisLabels** *(optional)*: {**left** *(optional)*: string, **bottom** *(optional)*: string};


   - **VizType.BarChart**

      **data**: BarChartDatum[];

         BarChartDatum takes the following values:

         - x: string;
         - y: number;
         - fill *(optional)*: string;
         - stroke *(optional)*: string;
         - tooltipContent *(optional)*: string;

      **overlayData** *(optional)*: BarChartDatum[];

      **axisLabels** *(optional)*: {**left** *(optional)*: string, **bottom** *(optional)*: string};


   - **VizType.RadarChart**

      **data**: RadarChartDatum[];

         RadarChartDatum takes the following values:

         - label: string;
         - value: number;

      **maxValue**: number;

         Radar charts require a max value at which to compare each individual datums values against.

      **axisLabels** *(optional)*: {**left** *(optional)*: string, **bottom** *(optional)*: string};


   - **VizType.GeoMap**

      **data**: ExtendedFeature<any, GeoJsonCustomProperties>;

         ExtendedFeature is a standard GeoJson object but it requires the following values to be appended within the `.features` data:

         - percent: number; *(Number between 0 and 100)*
         - tooltipContent *(optional)*: string;

      **minColor**: string;

      **maxColor**: string;

Example of the DataViz component -

```tsx
<DataViz
  id={'time-is-money-scatterplot'}
  vizType={VizType.ScatterPlot}
  data={scatterplotData}
  axisLabels={{bottom: 'Time', left: 'Dollars'}}
  enablePNGDownload={true}
  enableSVGDownload={true}
  chartTitle={'Time is Money'}
  jsonToDownload={rawData}
/>
```

<a name="legendlistcomponent"/>

#### <LegendList />

The Legend component, located at `src/components/dataViz/Legend` is for displaying a basic color block based legend. The Legend component only takes a single prop -

- **legendList**: LegendDatum[]

   Each LegendDatum will be rendered as a separate block. It has the following properties -

   - **label**: string;
   - **fill**: string | undefined;
   - **stroke**: string | undefined;

<a name="colorlegendcomponent"/>

#### <ColorScaleLegend />

The ColorScaleLegend component, located at `src/components/dataViz/ColorScaleLegend` is for displaying a color range scale. The ColorScaleLegend component takes the following props -

- **maxColor**: string;
- **minColor**: string;
- **title**: string;
- **maxLabel**: string | number;
- **minLabel**: string | number;

<a name="loadingcomponent"/>

#### <Loading />

The Loading component, located at `src/components/general/Loading` is a generic loader that fills the space of its parent component. It does not take any props and is designed to be able to be placed anywhere.

<a name="customhooks"/>

## Custom Hooks


<a name="componentguidelines"/>

## Guidelines For Creating New Components


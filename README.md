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
    - [MultiTierSearch](#multitiersearchcomponent)
    - [StickySideNav](#stickysidenavecomponent)
    - [DynamicTable](#dynamictablecomponent)
    - [ExploreNextFooter](#explorenextfootercomponent)
    - [InlineToggle](#inlinetogglecomponent)
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

#### DataViz

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

#### LegendList

The Legend component, located at `src/components/dataViz/Legend` is for displaying a basic color block based legend. The Legend component only takes a single prop -

- **legendList**: LegendDatum[]

   Each LegendDatum will be rendered as a separate block. It has the following properties -

   - **label**: string;
   - **fill**: string | undefined;
   - **stroke**: string | undefined;

<a name="colorlegendcomponent"/>

#### ColorScaleLegend

The ColorScaleLegend component, located at `src/components/dataViz/ColorScaleLegend` is for displaying a color range scale. The ColorScaleLegend component takes the following props -

- **maxColor**: string;
- **minColor**: string;
- **title**: string;
- **maxLabel**: string | number;
- **minLabel**: string | number;

<a name="loadingcomponent"/>

#### Loading

The Loading component, located at `src/components/general/Loading` is a generic loader that fills the space of its parent component. It does not take any props and is designed to be able to be placed anywhere.

<a name="multitiersearchcomponent"/>

#### MultiTierSearch

The MultiTierSearch component, located at `src/components/navigation/MultiTierSearch` is a multi-hierarchy search/dropdown component. It takes hierarchal data and allows the user to search through and select child elements. Note that at this time, this component only supports selecting the lowest level child element, but it does support an unlimited number of tiers between them. It takes the following props:

- **searchLabelText**: string;

   The label text that appears above the dropdown.

- **data**: TreeNode[];

   The dataset. See the structure of a TreeNode below.

- **initialSelectedValue** *(optional)*: TreeNode;

   The initially selected TreeNode, if desired.

- **onChange** *(optional)*: (val: TreeNode) => void;

   Callback function for when a TreeNode is selected.

**TreeNode** - The MultiTierSearch component uses [react-dropdown-tree-select](https://www.npmjs.com/package/react-dropdown-tree-select). The TreeNode format follows their structure, with some required settings in order to make it work correctly for our use cases. A basic example is below -

```tsx
const data = [
  label: 'Top Level Parent',
  value: 'A',
  className: 'no-select-parent',
  disabled: true,
  children: [
    label: 'Second Level Parent',
    value: 'A1',
    className: 'no-select-parent',
    disabled: true,
    children: [
      label: 'Child Item 1',
      value: 'A1.1',
      disabled: false,
    ],
    children: [
      label: 'Child Item 2',
      value: 'A1.2',
      disabled: false,
    ],
  ],
]
```

In the above example, we have three levels of hierarchy. Every element must have a `label` - which is what will be output in the dropdown and compared against when searching - as well as a `value` - which works as the elements unique id. Additionally, all elements that contain `children` must include `className: 'no-select-parent'` and have `disabled: true`. Then all child elements that can be selected must have `disabled: false` to counteract inheritance from the parent.

<a name="stickysidenavecomponent"/>

#### StickySideNav

The StickySideNav component, found at `src/components/navigation/StickySideNav`, sticks to the side of the screen and automatically collapses into an expandable menu on small screen sizes. It takes the following props - 

- **links**: NavItem[];

   A NavItem takes the following properties -

   - **label**: string;
   - **target**: string;
   - **internalLink** *(optional)*: boolean;

      Set true to specify if this is linking to an anchor on this page.

   - **scrollBuffer** *(optional)*: number;

     Set an optional pixel value buffer for when to consider this section selected, if an internal link.

- **backgroundColor**: string;
- **hoverColor**: string;
- **borderColor**: string;
- **onHeightChange** *(optional)*: (height: number) => void;

   Optional callback function returning the height of nav whenever it changes.

- **marginTop** *(optional)*: string;

   Optional CSS value (in px, rem, or other unit) to specify the `top` value of when the nav becomes sticky.

<a name="dynamictablecomponent"/>

#### DynamicTable

The DynamicTable component, found at `src/components/text/DynamicTable`, quickly creates a styled component from any dataset. It takes the following props - 

- **columns**: Column[];

   Each Column object defines a different column in the table. It takes the following properties -

   - **label**: string;

      This is what the column title will show when it is rendered.

   - **key**: string;

      This is the associated key name for the table's dataset.

- **data**: Datum[];

   Each Datum object defines a row in the table. It can be any set of data, but each Datum must be the same shape, and the keys should match the `key` values found in the `columns` prop.

- **color**: string[];

   Color code for styling the table.

<a name="explorenextfootercomponent"/>

#### ExploreNextFooter

The ExploreNextFooter component, found at `src/components/text/ExploreNextFooter`, creates a footer with social icon links, attributions, links to explore next, and the Growth Lab logo. It takes the following props - 

- **attributions**: string[];

   An array of strings for the attributions. Each string will appear on a new line at the top of the footer.

- **socialItems**: {target: string, type: SocialType}[];

   Each social item will render an icon link based on the SocialType. SocialType can be one of the following -

   ```tsx
    enum SocialType {
      facebook = 'facebook',
      twitter = 'twitter',
      linkedin = 'linkedin',
    }
   ```

- **exploreNextLinks**: {label: string, target: string}[];

   Each explore next item will render a button that links out to its target. It will open in a new tab.

- **backgroundColor**: string;

   Color code for styling the table.

<a name="inlinetogglecomponent"/>

#### InlineToggle

The InlineToggle component, located at `src/components/text/InlineToggle` is a search/dropdown component running on the same core library as the [MultiTierSearch](#multitiersearchcomponent) found above. The main difference is that it appears as inline text instead of as a search box, and it should only take a single level of children instead of multiple tiers. It takes the following props -

- **data**: TreeNode[];

   TreeNode data has a much simpler structure compared to the MultiTierSearch component. It should like the following -

   ```tsx
   interface TreeNode {
     label: string,
     value: string,
   }
  ```

- **colorClassName** *(optional)*: string;

   Optional classname for setting the color. Additional rules will have to be added to `src/components/text/inlineDropdownStyles.scss` in order to properly display your custom color.

- **onChange** *(optional)*: (val: TreeNode) => void;

   Optional callback function for when a TreeNode is selected.

<a name="customhooks"/>

## Custom Hooks


<a name="componentguidelines"/>

## Guidelines For Creating New Components


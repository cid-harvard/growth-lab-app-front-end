## Country Dashboards by the Growth Lab at Harvard's Center for International Development

Country Dashboards provides a framework for quickly building custom data visualization tools.

View the site live at https://growthlab.app/

License - [Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Table of Contents
  - [Getting Started](#gettingstarted)
  - [Building a Page](#buildingapage)
  - [Grid Layout and Style Utilities](#styleutilites)
  - [Components](#components)
    - [DataViz](#datavizcomponent)
    - [LegendList](#legendlistcomponent)
    - [HowToReadDots](#howtoreaddotscomponent)
    - [ColorScaleLegend](#colorlegendcomponent)
    - [Loading](#loadingcomponent)
    - [MultiTierSearch](#multitiersearchcomponent)
    - [StickySideNav](#stickysidenavecomponent)
    - [DynamicTable](#dynamictablecomponent)
    - [ExploreNextFooter](#explorenextfootercomponent)
    - [InlineToggle](#inlinetogglecomponent)
    - [StickySubHeading](#stickysubheadingcomponent)
    - [GradientHeader](#gradientheadercomponent)
    - [TextBlock](#textblockcomponent)
    - [QueryTableBuilder](#querytablebuildercomponent)
  - [Custom Hooks](#customhooks)
    - [useScrollBehavior](#usescrollbehaviorhook)
  - [Querying Data with GraphQL](#queryingdatagraphql)
  - [Guidelines For Creating New Components](#componentguidelines)
    - [Style Guide](#styleguide)

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
      ClusterBarChart = 'ClusterBarChart',
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
         - tooltipContentOnly *(optional)*: boolean;
         - highlighted *(optional)*: boolean;

      **axisLabels** *(optional)*: {**left** *(optional)*: string, **bottom** *(optional)*: string};

      **axisMinMax** *(optional)*: {

         **minX** *(optional)*: number,

         **maxX** *(optional)*: number,

         **minY** *(optional)*: number,

         **maxY** *(optional)*: number,

      };

      **showAverageLines** *(optional)*: boolean;

      **averageLineText** *(optional)*: {**left** *(optional)*: string, **bottom** *(optional)*: string};


   - **VizType.BarChart**

      **data**: Array<BarChartDatum[]>;

         BarChartDatum takes the following values:

         - x: string;
         - y: number;
         - fill *(optional)*: string;
         - stroke *(optional)*: string;
         - tooltipContent *(optional)*: string;
         - tooltipContentOnly *(optional)*: boolean;

         The data it takes is an array of BarChartDatum arrays. Each array will render ontop of the previous one.

      **axisLabels** *(optional)*: {**left** *(optional)*: string, **bottom** *(optional)*: string};

      **quadrantLabels** *(optional)*: {**I** *(optional)*: string, **II** *(optional)*: string, **III** *(optional)*: string, **IV** *(optional)*: string};

         Use the new line escape character, `\n`, to indicate when the label text should break to a new line.

   - **VizType.RadarChart**

      **data**: RadarChartDatum[];

         RadarChartDatum takes the following values:

         - label: string;
         - value: number;

         To include multi-line labels, include a newline character, \n, to indicate a new line.

      **maxValue**: number;

         Radar charts require a max value at which to compare each individual datums values against.

      **axisLabels** *(optional)*: {**left** *(optional)*: string, **bottom** *(optional)*: string};

         Use the new line escape character, `\n`, to indicate when the label text should break to a new line.

   - **VizType.GeoMap**

      **data**: ExtendedFeature<any, GeoJsonCustomProperties>;

         ExtendedFeature is a standard GeoJson object but it requires the following values to be appended within the `.features` data:

         - percent: number; *(Number between 0 and 100)*
         - tooltipContent *(optional)*: string;

      **minColor**: string;

      **maxColor**: string;


   - **VizType.ClusterBarChart**

      **data**: ClusterBarChartDatum[];

         ClusterBarChartDatum takes the following values:

         - groupName: string;
         - x: string;
         - y: number;
         - fill?: string;
         - tooltipContent?: string;
         - tooltipContentOnly *(optional)*: boolean;

         Each x value will create a cluster of every groupName that has a matching x value.

      **axisLabels** *(optional)*: {**left** *(optional)*: string, **bottom** *(optional)*: string};

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

<a name="howtoreaddotscomponent"/>

#### HowToReadDots

The HowToReadDots component, located at `src/components/dataViz/HowToReadDots` is for displaying a basic color circle based legend. The HowToReadDots component takes two props -

- **items**: LegendItem[]

   Each LegendItem will be rendered as a separate dot. It has the following properties -

   - **label**: string;
   - **color**: string;

- **highlighted** *(Optional)*: LegendItem

   Optionally add a highlighted value to distinguish it from the other values.

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

<a name="fullpageerrorcomponent"/>

#### FullPageError

The FullPageError component, located at `src/components/general/FullPageError` is a generic error message that fills the space of its parent component. It takes a single props - `message: string` - that will output the error message underneath a generic `There was an error retrieving the data. Please refresh the page or contact the Growth Lab if this continues` message.

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

   Each Datum object defines a row in the table. It can be any set of data, but each Datum must be the same shape, and the keys should match the `key` values found in the `columns` prop. The value of each key should be `number | string | null`. If the value is `null` it will render a blank square.

- **color** *(Optional)*: string[];

   Color code for styling the table. Will render with bolder labels and lines if no color is given.

- **stickFirstCol** *(Optional)*: boolean;

   Will make the first column stick if content overflows horizontally.

- **verticalGridLines** *(Optional)*: boolean;

   Will add vertical grid lines to the table.

- **hideGridLines** *(Optional)*: boolean;

   Will hide the grid lines of the table.

- **fontSize** *(Optional)*: boolean;

   Will override the default font-size of all of the text in the table.

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


<a name="stickysubheadingcomponent"/>

#### StickySubHeading

The StickySubHeading component, located at `src/components/StickySubHeading` is a heading element that will stick to the top of the page as the user scrolls. It takes in the following props -

- **title**: string;
- **highlightColor**: string;
- **onHeightChange** *(optional)*: (height: number) => void;

   Optional callback function returning the height of component whenever it changes.

<a name="gradientheadercomponent"/>

#### GradientHeader

The GradientHeader component, located at `src/components/headers/GradientHeader` is a full, top level header element meant for the top of a page. It optionally can have the [MultiTierSearch](#multitiersearchcomponent) embeded in it. It takes in the following props -

- **title**: string;
- **backgroundColor**: string;
- **textColor**: string;
- **linkColor**: string;
- **imageSrc** *(optional)*: string;
  
   Optional URL to the image that will appear on the left hand side of the header.

- **imageProps** *(optional)*: ImageProps;

   Optional custom dimensions for the image.

   - imgWidth *(optional)*: string;
   - imgHeight *(optional)*: string;

- **links** *(optional)*: LinkDatum[];

   Optional list for links underneath the title.

    - label: string;
    - target: string;
    - internal *(optional)*: boolean;

    Internal defaults to false. Internal means it should scroll to an anchor on the page instead of opening a url in a new tab.

- **hasSearch**: boolean;

   If true, you must also pass all the same props to GradientHeader as you would [MultiTierSearch](#multitiersearchcomponent).

- **introText** *(optional)*: string;

<a name="textblockcomponent"/>

#### TextBlock

The TextBlock component, located at `src/components/text/TextBlock` is a generic, formatted container for other simple components. It takes the following props -

- **children**: React.ReactNode;

   Any React Element, string, null, or array of any of those types, to be output inside of the TextBlock.

- **align** *(optional)*: Alignment;

   Optional vertical alignment of the content in the container relative to the height of the TextBlock siblings.

   ```tsx
    enum Alignment {
      Top = 'top',
      Bottom = 'bottom',
      Center = 'center',
    }
   ```
 
<a name="passwordprotectedcomponent"/>

#### PasswordProtectedComponent

The PasswordProtectedComponent component, located at `src/components/tools/PasswordProtectedComponent` is a generic component that password protects any child components. It takes only three props -
  
- **title**: string;
- **buttonColor**: string;
- **children**: React.ReactNode;
- **onPasswordSubmit**: (value: string) => void;

   Callback function for when the user submits the password.
 
<a name="querytablebuildercomponent"/>

#### QueryTableBuilder

The QueryTableBuilder component, located at `src/components/tools/QueryTableBuilder` is a customizable table query building component. It can take a number of different parameters to suit a large array of needs. It takes the following props -

- **primaryColor**: string;

   The color of the buttons and title found within the table.

- **onUpdateClick**: (data: CallbackData) => void;

   Callback function for when a user clicks the "Update" button.

- **selectFields** *(optional)*: SelectBoxProps[];

   Each selectFields item in the array creates a [MultiTierSearch](#multitiersearchcomponent) and can take the following values -

       - id: string;
       - label: string;
       - data: SelectData[];

          Where SelectData extends a [TreeNode](#multitiersearchcomponent) with the optional `parentValue: string | null` field, in which the value of the selected node in the optionally dependent field (see below) is specified.

       - dependentOn?: string;

          Optional value relating to the `id` of another selectField in which this selectField is dependent on. Use the optional `parentValue` in the SelectData mentioned above to set up the relationship between dependent values within the datasets.

       - required?: boolean;

- **itemName**: string;
- **columns**: Column[];

   columns use the same format as those in the [DynamicTable](#dynamictablecomponent) component.

- **tableData**: Datum[];

   tableData uses the same format as the data prop in the [DynamicTable](#dynamictablecomponent) component.

- **disabled** *(optional)*: boolean;

   If true, the buttons will be disabled and the table will render with 10 blank rows based on the column data.

- **queryLength**: number;
- **queryToDownload**: object[];
- **filename**: string;


<a name="customhooks"/>

## Custom Hooks

<a name="usescrollbehaviorhook"/>

#### useScrollBehavior

Located in `src/hooks/useScrollBehavior`. The useScrollBehavior hook enables a page to load to an anchor point on load, as well as update the url with anchor points as it scrolls past the target element.

useScrollBehavior takes an optional object as an input with the following options -

- **bufferTop** *(optional)*: number;

   The amount of space above an element at which it is considered to be scrolled to. Defaults to 0 if none is specified.

- **navAnchors** *(optional)*: string[];

   A list of strings designating the ids for each element the hook should watch for scrolling. The ids should be written with the `#`, for example - `#overview`.

<a name="queryingdatagraphql"/>

## Querying Data with GraphQL

The Country Dashboards utilize GraphQL to make calls for the exact data that is needed for each page and component. The GraphQL endpoint connection has already been setup, and individual pages can query it using `gql` from `graphql-tag` and the `useQuery` hook, exported from `@apollo/react-hooks`.

The different queries available to Country Dashboards can be viewed here - https://hgl-app-staging.cid-labs.com/graphql

When new queries are added to the GraphQL endpoint, make sure to add the type definitions for their return values at `src/graphql/graphQLTypes.ts`. Keeping the types consistent helps keep the Country Dashboards project easier to develop and less prone to bugs as it continues to expand.

For more information on using GraphQL, see the official GraphQL documentation here - https://graphql.org/learn/ 

<a name="componentguidelines"/>

## Guidelines For Creating New Components

As components are created, they should strive to be as generic as possible without becoming overly complicated. Props can be left to optional, where appropriate, and required if it is felt that the component would not function correctly without. Any optional props should allow the component to render something viable with or without it specified. Unknown data sources should also be taken into account, and as much as possible the type should be enforced using TypeScript. `any` should be avoided as much as possible. 

At the same time, one should not go overboard making things totally generic. If a certain use case is not needed now, some thought to how it might be fit in down the line would be good, but a component does not have to fit everything right away. We can always go back and modify components or create similar ones as requirements and needs grow.

When editing an existing component, make sure to check on all instances that are currently using that component so as not to break any existing implementations. Take careful thought as to how additions should be made, and everything should always be 100% backwards compatible. Make sure to think through if modifications to the component are the best course of action. Sometimes it may just need some more tinkering with the configuration or perhaps a discussion with the team on how to utilize the existing component structure. It may also be the case that creating a new component that is very similar but fills a different role would be the best decision.

Last but far from least, make sure to always update this documentation when any changes or updates are made.

<a name="styleguide"/>

#### Style Guide

When building new components and pages, it is important to maintain consistent styling standards. Please consult the styling documentation for guidelines regarding the visual styles -

**[http://cid-harvard.github.io/dashboard-styling/](http://cid-harvard.github.io/dashboard-styling/)**


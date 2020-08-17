## The Growth Lab App

## by the Growth Lab at Harvard's Center for International Development

The Growth Lab App provides a framework for quickly building custom data visualization tools.

View the site live at https://growthlab.app/

> This package is part of Harvard Growth Lab’s portfolio of software packages, digital products and interactive data visualizations.  To browse our entire portfolio, please visit [growthlab.app](https://growthlab.app/).  To learn more about our research, please visit [Harvard Growth Lab’s](https://growthlab.cid.harvard.edu/) home page.

License - [Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Table of Contents
- [Getting Started](#gettingstarted)
- [Building a Page](#buildingapage)
- [Grid Layout and Style Utilities](#styleutilites)
- [Components](#components)
    - [Strucutural Components](#strucuturalcomponents)
      - [StandardFooter](#standardfooter)
      - [ExploreNextFooter](#explorenextfootercomponent)
      - [StickySubHeading](#stickysubheadingcomponent)
      - [GradientHeader](#gradientheadercomponent)
      - [SmartCoverPhoto](#smartcoverphotocomponent)
      - [PasswordProtectedPage](#passwordprotectedpage)
    - [Navigation Components](#navigationcomponents)
      - [StickySideNav](#stickysidenavecomponent)
      - [TopLevelStickyNav](#toplevelstickynav)
      - [HubStickyNav](#hubstickynav)
    - [Form Components](#formcomponents)
      - [BasicSearch](#basicsearchcomponent)
      - [MultiTierSearch](#multitiersearchcomponent)
      - [InlineToggle](#inlinetogglecomponent)
    - [Utility Components](#utilitycomponents)
      - [Loading](#loadingcomponent)
      - [FullPageError](#fullpageerrorcomponent)
      - [SmartImage](#smartimagecomponent)
      - [TextBlock](#textblockcomponent)
      - [Tooltip](#tooltipcomponent)
      - [PasswordProtectedComponent](#passwordprotectedcomponent)
    - [Visualization Components](#visualizationcomponents)
      - [DataViz](#datavizcomponent)
      - [DynamicTable](#dynamictablecomponent)
      - [BlowoutValue](#mapboxcomponent)
      - [Map](#mapboxcomponent)
      - [QueryTableBuilder](#querytablebuildercomponent)
- [Custom Hooks](#customhooks)
  - [useScrollBehavior](#usescrollbehaviorhook)
  - [scrollToAnchor](#scrolltoanchor)
  - [scrollToTop](#scrolltotop)
  - [useScrollingSections](#usescrollingsectionshook)
  - [usePrevious](#useprevioushook)
- [Querying Data with GraphQL](#queryingdatagraphql)
- [Custom Metadata](#custommetadata)
- [Using Google Analytics](#googleanalytics)
  - [Setting Up GA For Your Page](#settingupgoogleanalytics)
  - [Triggering GA Events](#triggergoogleanalyticsevents)
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

3. Now that you have a basic skeleton page ready, navigate to `src/metadata.js` and add a new route for your page, like so:

   ```tsx
    const Routes = {
      Landing = '/',
      /* Add your new route at the end of the list of existing routes */
      YourNewDataVizDashboard = '/your-new-data-viz-dashboard',
    }
   ```

   You will also want to add a metadata entry in that same file like so (see [Custom Metadata](#custommetadata) for more information):

   ```tsx

   const metadata = [
    ...
    {
      url: Routes.YourNewDataVizDashboard,
      title: 'Name of Your Page | ' + defaultTitle,
      description: 'A description',
      og_image: defaultOgImage,
      favicon: defaultFavicon,
    },
  ];

   ```

4. Once you have the route defined, you will want to add it to `src/App.tsx`. There are two locations within `App.tsx` that will have to be updated. The first is near the top, where you will have to import it with `lazy` the way the other pages are being imported:

   ```tsx
    const LandingPage = lazy(() => import('./pages/landingPage'));
    /* import your new page at the end of the list of lazy imports */
    const YourNewDataVizDashboard = lazy(() => import('./pages/yourNewDataVizDashboard'));
   ```

   Then near the bottom of the page in the `return` statement and within the `Switch` component, you will have to add a `TrackedRoute` component for your page. `TrackedRoute` is a modification of the standard `Route` included in `react-router` that allows for better Google Analytics tracking in React. See [Using Google Analytics](#googleanalytics) for more information about Google Analytics and the Growth Lab App project:

   ```tsx
    <Switch>
      <TrackedRoute exact path={Routes.Landing}
        render={(props: any) => <LandingPage {...props} />}
      />
      {/* Your page should go at the end of the other routes but before the 404 page */}
      <TrackedRoute exact path={Routes.YourNewDataVizDashboard}
        render={(props: any) => <YourNewDataVizDashboard {...props} />}
      />
      {/* If none of the above routes are found show the 404 page */}
      <TrackedRoute component={PageNotFound} />
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
<a name="strucuturalcomponents"/>

### Strucutural Components

<a name="standardfooter"/>

#### StandardFooter

The StandardFooter component, found at `src/components/text/StandardFooter`, creates a standard Growth Lab footer with little customization. It takes the following optional prop - 

- **socialItems** *(optional)*: `object[]`
    - **target**: `string`
    - **type**: `SocialType` Each social item will render an icon link based on the SocialType. If left blank, it will show the default social icons. SocialType can be one of the following -

   ```tsx
    enum SocialType {
      facebook = 'facebook',
      twitter = 'twitter',
      linkedin = 'linkedin',
      youtube = 'youtube',
      applepodcast = 'applepodcast',
    }
   ```

<a name="explorenextfootercomponent"/>

#### ExploreNextFooter

The ExploreNextFooter component, found at `src/components/text/ExploreNextFooter`, creates a footer with social icon links, attributions, links to explore next, and the Growth Lab logo. It takes the following props - 

- **title**: `string` The title of the page for Google Analytics event tracking. This should match the page title found in the header.
- **attributions**: `string[]` An array of strings for the attributions. Each string will appear on a new line at the top of the footer.
- **socialItems** *(optional)*: `object[]`
    - **target**: `string`
    - **type**: `SocialType` Each social item will render an icon link based on the SocialType. If left blank, it will show the default social icons.
- **exploreNextLinks**: `object[]` Each explore next item will render a button that links out to its target. It will open in a new tab.
    - **label**: `string`
    - **target**: `string`
- **backgroundColor**: `string`

<a name="stickysubheadingcomponent"/>

#### StickySubHeading

The StickySubHeading component, located at `src/components/StickySubHeading` is a heading element that will stick to the top of the page as the user scrolls. It takes in the following props -

- **title**: `string`
- **highlightColor**: `string`
- **onHeightChange** *(optional)*: `(height: number) => void` Optional callback function returning the height of component whenever it changes.

<a name="gradientheadercomponent"/>

#### GradientHeader

The GradientHeader component, located at `src/components/headers/GradientHeader` is a full, top level header element meant for the top of a page. It optionally can have the [MultiTierSearch](#multitiersearchcomponent) embeded in it. It takes in the following props -

- **title**: `string`
- **primaryColor**: `string`
- **gradient**: `string` The gradient will be applied to the css `background` propery. And should follow (standared css gradient syntax)[https://cssgradient.io/]. For example -

   ```tsx
    gradient={`linear-gradient(
        0deg,
        rgba(224, 176, 78, 0.3) 0%,
        #54A3C6 100%
      )'
    }
   ```

- **textColor**: `string`
- **linkColor**: `string`
- **imageSrc** *(optional)*: `string` Optional URL to the image that will appear on the left hand side of the header.
- **imageProps** *(optional)*: `ImageProps`
    - **imgWidth** *(optional)*: `string`
    - **imgHeight** *(optional)*: `string`
- **links** *(optional)*: LinkDatum[];
    - **label**: `string`
    - **target**: `string`
    - **internal** *(optional)*: `boolean` Internal defaults to false. Internal means it should scroll to an anchor on the page instead of opening a url in a new tab.
- **hasSearch**: `boolean` If true, you must also pass all the same props to GradientHeader as you would [MultiTierSearch](#multitiersearchcomponent).
- **introText** *(optional)*: `string`


<a name="smartcoverphotocomponent"/>

#### SmartCoverPhoto

The SmartCoverPhoto component, located at `src/components/general/SmartCoverPhoto` is a component that will load a low res image and swap with a high res version once it has been fully loaded. It takes two props -

- **lowResSrc**: `string`
- **highResSrc**: `string`

<a name="passwordprotectedpage"/>

#### PasswordProtectedPage

Sim PasswordProtectedPage component, located at `src/components/tools/PasswordProtectedPage` is a generic component that fills its entire container and provides a callback function for when the user submits the password. Useful for protecting an entire page. It takes only three props -
  
- **title**: `string`
- **buttonColor**: `string`
- **onPasswordSubmit**: `(value: string) => void` Callback function for when the user submits the password.

<a name="navigationcomponents"/>

### Navigation Components

<a name="stickysidenavecomponent"/>

#### StickySideNav

The StickySideNav component, found at `src/components/navigation/StickySideNav`, sticks to the side of the screen and automatically collapses into an expandable menu on small screen sizes. It takes the following props - 

- **id**: `string` Make sure that this is unique not only for this page, but across all pages as it will be used for Google Analytics Event tracking. Consider prefixing all your ids with a unique, page specific identifier.
- **links**: `NavItem[]`
    - **label**: `string`
    - **target**: `string`
    - **internalLink** *(optional)*: `boolean` Set true to specify if this is linking to an anchor on this page.
    - **scrollBuffer** *(optional)*: `number` Set an optional pixel value buffer for when to consider this section selected, if an internal link.
- **backgroundColor**: `string`
- **hoverColor**: `string`
- **borderColor**: `string`
- **onHeightChange** *(optional)*: `(height: number) => void` Optional callback function returning the height of nav whenever it changes.
- **marginTop** *(optional)*: `string` Optional CSS value (in px, rem, or other unit) to specify the `top` value of when the nav becomes sticky.

<a name="toplevelstickynav"/>

#### TopLevelStickyNav

The TopLevelStickyNav component, found at `src/components/navigation/TopLevelStickyNav`, sticks to the top right of the screen. It takes the following props - 

- **id**: `string`
- **title**: `string`
- **links**: `NavItem[]`
    - **label**: `string`
    - **target**: `string`
    - **internalLink** *(optional)*: `boolean` Set true to specify if this is linking to an anchor on this page.
    - **active**: `boolean` Set true to denote this link to have 'active' styles.
- **linkColor**: `string`
- **activeColor**: `string`
- **backgroundColor**: `string`

<a name="hubstickynav"/>

#### HubStickyNav

The HubStickyNav component, found at `src/components/navigation/HubStickyNav`, sticks to the top left of its container. It takes the following props - 

- **links**: `NavItem[]`   
   - **label**: `string`
   - **onClick**: `() => void` Callback function for when the link is clicked.
   - **isActive**: `boolean` Set true to denote this link to have 'active' styles.
- **offsetTop** *(optional)*: `string` Optional CSS value (in px, rem, or other unit) to specify the `top` value of when the nav becomes sticky.
- **primaryColor**: `string`

<a name="formcomponents"/>

### Form Components

<a name="basicsearchcomponent"/>

#### BasicSearch

The BasicSearch component, located at `src/components/form/BasicSearch` is a generic search bar. It takes the following props:

- **placeholder**: `string`
- **setSearchQuery**: `(value: string) => void` A callback function for when the value of the search bar changes. Use this to get the value of the search bar and set it as state.
- **initialQuery**: `string`
- **focusOnMount**: `boolean`
- **containerStyleOverrides** *(optional)*: `React.CSSProperties` Optional CSS properties that will be applied directly to the root `label` element.
- **searchBarStyleOverrides** *(optional)*: `React.CSSProperties` Optional CSS properties that will be applied directly to the `input` element.
- **additionalContent** *(optional)*: `React.ReactNode` Additional content that will appear to the left of the search input. Useful for adding tags or other search related content.

<a name="multitiersearchcomponent"/>

#### MultiTierSearch

The MultiTierSearch component, located at `src/components/navigation/MultiTierSearch` is a multi-hierarchy search/dropdown component. It takes hierarchal data and allows the user to search through and select child elements. Note that at this time, this component only supports selecting the lowest level child element, but it does support an unlimited number of tiers between them. It takes the following props:

- **searchLabelText**: `string` The label text that appears above the dropdown.
- **data**: `TreeNode[]` The dataset. See the structure of a TreeNode below.
- **initialSelectedValue** *(optional)*: `TreeNode` The initially selected TreeNode, if desired.
- **onChange** *(optional)*: `(val: TreeNode) => void` Callback function for when a TreeNode is selected.

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

<a name="inlinetogglecomponent"/>

#### InlineToggle

The InlineToggle component, located at `src/components/text/InlineToggle` is a search/dropdown component running on the same core library as the [MultiTierSearch](#multitiersearchcomponent) found above. The main difference is that it appears as inline text instead of as a search box, and it should only take a single level of children instead of multiple tiers. It takes the following props -

- **data**: `TreeNode[]` TreeNode data has a much simpler structure compared to the MultiTierSearch component. It should like the following -
    - **label**: `string`
    - **value**: `string`
- **colorClassName** *(optional)*: `string` Optional classname for setting the color. Additional rules will have to be added to `src/components/text/inlineDropdownStyles.scss` in order to properly display your custom color.
- **onChange** *(optional)*: `(val: TreeNode) => void` Optional callback function for when a TreeNode is selected.

<a name="utilitycomponents"/>

### Utility Components

<a name="loadingcomponent"/>

#### Loading

The Loading component, located at `src/components/general/Loading` is a generic loader that fills the space of its parent component. It does not take any props and is designed to be able to be placed anywhere.

<a name="fullpageerrorcomponent"/>

#### FullPageError

The FullPageError component, located at `src/components/general/FullPageError` is a generic error message that fills the space of its parent component. It takes a single props - `message: string` - that will output the error message underneath a generic `There was an error retrieving the data. Please refresh the page or contact the Growth Lab if this continues` message.

<a name="smartimagecomponent"/>

#### SmartImage  

The SmartImage component, located at `src/components/general/SmartImage` is a component that will load a low res image and swap with a high res version once it has been fully loaded. It takes two props -

- **lowResSrc**: `string`
- **highResSrc**: `string`

<a name="textblockcomponent"/>

#### TextBlock

The TextBlock component, located at `src/components/text/TextBlock` is a generic, formatted container for other simple components. It takes the following props -

- **children**: `React.ReactNode` Any React Element, string, null, or array of any of those types, to be output inside of the TextBlock.
- **align** *(optional)*: `Alignment` Optional vertical alignment of the content in the container relative to the height of the TextBlock siblings.

   ```tsx
    enum Alignment {
      Top = 'top',
      Bottom = 'bottom',
      Center = 'center',
    }
   ```

<a name="tooltipcomponent"/>

#### Tooltip

The Tooltip component, located at `src/components/general/SmartImage` is a component that will place an hover tooltip to any other component or can be placed on its own and render an `i` icon -

- **explanation**: `React.ReactNode`
- **children** *(optional)*: `React.ReactNode`
- **cursor** *(optional)*: `string`

<a name="passwordprotectedcomponent"/>

#### PasswordProtectedComponent

The PasswordProtectedComponent component, located at `src/components/tools/PasswordProtectedComponent` is a generic component that password protects any child components. It takes only four props -
  
- **title**: `string`
- **buttonColor**: `string`
- **children**: `React.ReactNode`
- **onPasswordSubmit**: `(value: string) => void` Callback function for when the user submits the password.

<a name="visualizationcomponents"/>

### Visualization Components

<a name="datavizcomponent"/>

#### DataViz

All data visualizations are built using the open-source npm module [react-fast-charts](https://www.npmjs.com/package/react-fast-charts), also created by the Harvard Growth Lab.

<a name="dynamictablecomponent"/>

#### DynamicTable

The DynamicTable component, found at `src/components/text/DynamicTable`, quickly creates a styled component from any dataset. It takes the following props - 

- **columns**: `Column[]` Each Column object defines a different column in the table. It takes the following properties -
   - **label**: `string` This is what the column title will show when it is rendered.
   - **key**: `string` This is the associated key name for the table's dataset.
- **data**: `Datum[]` Each Datum object defines a row in the table. It can be any set of data, but each Datum must be the same shape, and the keys should match the `key` values found in the `columns` prop. The value of each key should be `number | string | null`. If the value is `null` it will render a blank square.
- **color** *(Optional)*: `string[]` Color code for styling the table. Will render with bolder labels and lines if no color is given.
- **stickFirstCol** *(Optional)*: `boolean` Will make the first column stick if content overflows horizontally.
- **verticalGridLines** *(Optional)*: `boolean` Will add vertical grid lines to the table.
- **hideGridLines** *(Optional)*: `boolean` Will hide the grid lines of the table.
- **fontSize** *(Optional)*: `boolean` Will override the default font-size of all of the text in the table.
- **showOverflow** *(optional)*: `boolean`

<a name="mapboxcomponent"/>

#### BlowoutValue

The BlowoutValue component, located at `src/components/text/BlowoutValue` is a component that will place a large value with a small description underneath it -

- **color**: `string`
- **value**: `string | null`
- **description**: `string | null`

<a name="mapboxcomponent"/>

#### Map

The Map component, located at `src/components/mapbox` is a component that works as a wrapper for any Mapbox content. See [react-mapbox-gl](https://github.com/alex3165/react-mapbox-gl) for further documentation on the children and settings props that can be used with this component -

- **children** *(optional)*: `React.ReactElement<any>`
- **center** *(optional)*: `Coordinate` where Coordinate = `[Longitude, Latitude]`, and both Latitude and Longitude are of type `number`
- **zoom** *(optional)*: `[number]`
- **maxBounds** *(optional)*: `[Coordinate, Coordinate]`
- **fitBounds** *(optional)*: `[Coordinate, Coordinate]`
- **allowZoom** *(optional)*: `boolean`
- **allowPan** *(optional)*: `boolean`
- **mapCallback** *(optional)*: `(map: any) => void`
 
<a name="querytablebuildercomponent"/>

#### QueryTableBuilder

The QueryTableBuilder component, located at `src/components/tools/QueryTableBuilder` is a customizable table query building component. It can take a number of different parameters to suit a large array of needs. It takes the following props -

- **primaryColor**: `string` The color of the buttons and title found within the table.
- **onUpdateClick**: `(data: CallbackData) => void` Callback function for when a user clicks the "Update" button.
- **selectFields** *(optional)*: `SelectBoxProps[]` Each selectFields item in the array creates a [MultiTierSearch](#multitiersearchcomponent) and can take the following values -
    - **id**: `string`
    - **label**: `string`
    - **data**: `SelectData[]` Where SelectData extends a [TreeNode](#multitiersearchcomponent) with the optional `parentValue: string | null` field, in which the value of the selected node in the optionally dependent field (see below) is specified.
    - **dependentOn** *(optional)*: `string` Optional value relating to the `id` of another selectField in which this selectField is dependent on. Use the optional `parentValue` in the SelectData mentioned above to set up the relationship between dependent values within the datasets.
    - **required** *(optional)*: `boolean`
- **itemName**: `string`
- **columns**: `Column[]` columns use the same format as those in the [DynamicTable](#dynamictablecomponent) component.
- **tableData**:`Datum[]` tableData uses the same format as the data prop in the [DynamicTable](#dynamictablecomponent) component.
- **disabled** *(optional)*: `boolean` If true, the buttons will be disabled and the table will render with 10 blank rows based on the column data.
- **queryLength**: `number`
- **queryToDownload**: `object[]`
- **filename**: `string`

<a name="customhooks"/>

## Custom Hooks

<a name="usescrollbehaviorhook"/>

#### useScrollBehavior

Located in `src/hooks/useScrollBehavior`. The useScrollBehavior hook enables a page to load to an anchor point on load, as well as update the url with anchor points as it scrolls past the target element.

useScrollBehavior takes an optional object as an input with the following options -

- **bufferTop** *(optional)*: `number` The amount of space above an element at which it is considered to be scrolled to. Defaults to 0 if none is specified.
- **navAnchors** *(optional)*: `string[]` A list of strings designating the ids for each element the hook should watch for scrolling. The ids should be written with the `#`, for example - `#overview`.
- **smooth** *(optional)*: `boolean` Specifies if the scroll should animate smoothly to the anchor or jump directly to it.

<a name="scrolltoanchor"/>

#### scrollToAnchor

scrollToAnchor is a utility function exported from `src/hooks/useScrollBehavior` that scrolls to a specific anchor on a page when called. It takes a single object as input with the following values -

- **anchor**: `string | null`
- **bufferTop** *(optional)*: `number`
- **smooth** *(optional)*: `boolean`

<a name="scrolltotop"/>

#### scrollToTop

scrollToTop is a utility function exported from `src/hooks/useScrollBehavior` that scrolls to the top of the page when called. It takes an optional object with the value `smooth` set to `boolean | undefined`.

<a name="usescrollingsectionshook"/>

#### useScrollingSections

Located in `src/hooks/useScrollingSections`. The useScrollingSections hook takes an array of ref objects and returns the closest ref to have passed the middle of the screen.

- **refs**: `MutableRefObject<HTMLElement | null>[]`

Example:

```tsx
  const {section} = useScrollingSections({refs: [
    section_0,
    section_1,
    section_2,
    section_3,
  ]});
```

<a name="useprevioushook"/>

#### usePrevious

Located in `src/hooks/usePrevious`. The usePrevious hook returns the previous value for a given state or prop value, or undefined if no previous value exists.

Example:

```tsx
  const previousData = usePrevious(data);
```

<a name="queryingdatagraphql"/>

## Querying Data with GraphQL

The Growth Lab App utilize GraphQL to make calls for the exact data that is needed for each page and component. The GraphQL endpoint connection has already been setup, and individual pages can query it using `gql` from `graphql-tag` and the `useQuery` hook, exported from `@apollo/react-hooks`.

The different queries available to Growth Lab App can be viewed here - https://hgl-app-staging.cid-labs.com/graphql

When new queries are added to the GraphQL endpoint, make sure to add the type definitions for their return values. For each project, create a folder within it's pages directory called `graphql` and add a file called `graphQLTypes.ts`. The folder structure should look something like this - `/src/pages/yourProjectFolder/graphql/graphQLTypes.ts`. Within there you can keep all of the relevant types for the return values for your project's GraphQL queries. Keeping the types consistent helps keep the Growth Lab App project easier to develop and less prone to bugs as it continues to expand.

For more information on using GraphQL, see the official GraphQL documentation here - https://graphql.org/learn/ 

<a name="custommetadata"/>

## Custom Metadata

In order to allow for proper social media sharing and Google search result displaying, when the production build is created (with `npm run build`, which is run automatically when pushed to the `develop` or `master` branches) there is second script, `prerender-metadata.js`, that is run. This creates separate html pages for every defined route in the Growth Lab app, adding in page specific meta data like titles, descriptions, OG images, and favicons. To set the metadata for a page, you can do so in `src/metadata.js`. The file is a standard JavaScript file instead of a Typescript file as it needs to be able to be read by Node seperate from any development or production environments. 

Every metadata entry should have the following values:
- **url**: The url should be identical to one that is specified in the `Routes` object, defined at the top of this same file
- **title**: The meta title for this page
- **description**: The meta description for this page
- **og_image**: The og:image. The actual image file should be added to `public/og-images` and the string value of this field should be just the filename and extension. For example, if the target file is located at `public/og-images/image.png`, then the value of this field should be `image.png`
- **favicon**: The name and folder location of the favicon

<a name="googleanalytics"/>

## Using Google Analytics

<a name="settingupgoogleanalytics"/>

#### Setting Up GA For Your Page

Google Analytics is already setup for all of the Growth Lab App site. Additional configuration may be required to more precisely track user interactions on individual pages. This includes creating a new view for your page, setting up specific filters, and optionally tracking search parameters, if applicable.

First, to create a new view -

1. open the **Growth Lab App** property (under *Properties & Apps*) and select the **All Web Site Data** view (under **Views**). 
1. Click on **Admin** on the bottom of the left-hand panel (it has the gear icon).
1. Under the **View** column, click **Create View**.
1. Setup the View Settings, giving it a name and setting the page's URL. From this screen you can also optionally enable "Site search Tracking", where any query parameters can be tracked as well. **Make sure to hit Save at the very bottom of the page**

Now that the view has been created, you can add the filters -

1. Select "Filters" from the list of options on the left and click **Add Filter**
1. This filter is to exclude all data from the staging site. The settings should be `[exclude]` `[traffic to the hostname]` `[that contain]` and the Hostname should be `hgl-app-staging.cid-labs.com`
1. Create another filter. This filter is to exclude all data from localhost. The settings should be `[exclude]` `[traffic to the hostname]` `[that contain]` and the Hostname should be `localhost`
1. Create another filter. This one is to only show the data for the specific page you are tracking. The settings should be `[include only]` `[traffic to the subdirectories]` `[that contain]` and the Subdirectory should be `/your-page-name`

<a name="triggergoogleanalyticsevents"/>

#### Triggering GA Events

To add a Google Analytics Event to any action, you simply have to call the `triggerGoogleAnalyticsEvent` function. The function must first be imported from `/src/routing/tracking.ts`. Then it can be simply called like so -

```ts
  triggerGoogleAnalyticsEvent(category, action, label, value);
```

And an event will be registered. The function has two required parameters and two optional ones:

- **category**: string;
- **action**: string;
- **label**: *(optional)* string; 
- **value**: *(optional)* number;

For more information on the difference between a category, action, label, and value, as well as their best practices, see the Google Analytics help article here - https://support.google.com/analytics/answer/1033068?hl=en

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


import ReactGA from 'react-ga4';

// See documentation for react-ga4 package:
// https://www.npmjs.com/package/react-ga4
export const triggerGoogleAnalyticsEvent = (category: string, action: string, label?: string, value?: number) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

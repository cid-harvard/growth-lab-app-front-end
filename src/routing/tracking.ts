import {event} from 'react-ga';

export const triggerGoogleAnalyticsEvent = (category: string, action: string, label?: string, value?: number) => {
  event({
    category,
    action,
    label,
    value,
  });
};

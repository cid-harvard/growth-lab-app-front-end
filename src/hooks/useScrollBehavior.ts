import { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router';
import debounce from 'lodash/debounce';

interface Options {
  bufferTop?: number;
  navAnchors?: string[];
}

interface ScrollToAnchorInput {
  anchor: string | null;
  bufferTop?: number;
}

export const scrollToAnchor = (input: ScrollToAnchorInput) => {
  const elm: HTMLElement | null = input.anchor ? document.querySelector(input.anchor) : null;
  const bufferTop = input && input.bufferTop ? input.bufferTop : 0;
  if (elm) {
    window.scrollTo({
      top: elm.offsetTop - bufferTop,
      left: 0,
      behavior: 'smooth',
    });
  }
};

const useScrollBehavior = (options?: Options) => {
  const location = useLocation();
  const history = useHistory();
  const [triggerScroll, setTriggerScroll] = useState<boolean>(true);

  useEffect(() => {
    const anchor = location && location.hash ? location.hash : null;
    const bufferTop = options && options.bufferTop ? options.bufferTop : 0;
    if (triggerScroll) {
      scrollToAnchor({anchor, bufferTop});
    }
    const navAnchors = options && options.navAnchors ? options.navAnchors : [];
    const navAnchorElms = navAnchors.map(id => document.querySelector(id) as HTMLElement | null);
    const scrollBuffer = 100;
    const anchorTops = navAnchorElms.map(el => el ? el.offsetTop - bufferTop - scrollBuffer : 0);
    const handleScroll = debounce(() => {
      const windowPosition = window.scrollY;
      let i = 0;
      let newAnchor = '';
      while (windowPosition >= anchorTops[i] || i === anchorTops.length - 1) {
        if (!anchorTops[i + 1] || windowPosition < anchorTops[i + 1]) {
          newAnchor = navAnchors[i];
          break;
        }
        i++;
      }
      if (newAnchor !== location.hash) {
        history.push(location.pathname + newAnchor);
      }
      if (triggerScroll) {
        setTriggerScroll(false);
      }
    }, 50);
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [location, options, triggerScroll, history]);
};

export default useScrollBehavior;
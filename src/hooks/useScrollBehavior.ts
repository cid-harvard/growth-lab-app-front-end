import { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router';
import debounce from 'lodash/debounce';

interface Options {
  bufferTop?: number;
  navAnchors?: string[];
  smooth?: boolean;
}

interface ScrollToAnchorInput {
  anchor: string | null;
  bufferTop?: number;
  smooth?: boolean;
}

export const scrollToAnchor = (input: ScrollToAnchorInput) => {
  const elm: HTMLElement | null = input.anchor ? document.querySelector(input.anchor) : null;
  const bufferTop = input && input.bufferTop ? input.bufferTop : 0;
  if (elm) {
    window.scrollTo({
      top: elm.offsetTop - bufferTop,
      left: 0,
      behavior: input.smooth === false ? 'auto' : 'smooth',
    });
  }
};

export const scrollToTop = ({smooth}: {smooth?: boolean}) => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth === false ? 'auto' : 'smooth',
  });
};

const useScrollBehavior = (options?: Options) => {
  const location = useLocation();
  const history = useHistory();
  const [triggerScroll, setTriggerScroll] = useState<boolean>(true);

  useEffect(() => {
    const anchor = location && location.hash ? location.hash : null;
    const bufferTop = options && options.bufferTop ? options.bufferTop : 0;
    if (!anchor) {
      setTriggerScroll(false);
    }
    if (triggerScroll) {
      scrollToAnchor({anchor, bufferTop, smooth: options ? options.smooth : undefined});
    }
    const navAnchors = options && options.navAnchors ? options.navAnchors : [];
    const navAnchorElms = navAnchors.map(id => document.querySelector(id) as HTMLElement | null);
    const scrollBuffer = 300;
    const anchorTops = navAnchorElms.map(el => el ? el.offsetTop - bufferTop - scrollBuffer : 0);
    if (anchorTops.length === 1 && navAnchors.length === 1) {
      // Extend the array if only a single element
      const body = document.body;
      const html = document.documentElement;

      const documentHeight = Math.max( body.scrollHeight, body.offsetHeight,
                             html.clientHeight, html.scrollHeight, html.offsetHeight );
      anchorTops.push(documentHeight + 100);
      navAnchors.push('#page-end-fake-element');
    }
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
        history.push(location.pathname + location.search + newAnchor);
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